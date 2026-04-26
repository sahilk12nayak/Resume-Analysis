from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import json
import re
import logging
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field

import pypdf
import docx

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ----------------- Models -----------------
class SkillMatch(BaseModel):
    skill: str
    status: str  # "match" | "partial" | "missing"
    proficiency: str  # "expert" | "proficient" | "intermediate" | "beginner" | "none"
    evidence: str
    importance: str  # "critical" | "important" | "nice-to-have"


class LearningResource(BaseModel):
    title: str
    type: str  # "course" | "documentation" | "video" | "article" | "project"
    provider: str
    url: Optional[str] = ""


class LearningItem(BaseModel):
    skill: str
    why_adjacent: str
    estimated_hours: int
    priority: str  # "high" | "medium" | "low"
    resources: List[LearningResource]


class CandidateProfile(BaseModel):
    name: str
    title: str
    years_experience: str
    summary: str


class AnalysisResult(BaseModel):
    id: str
    created_at: str
    overall_score: int
    verdict: str
    candidate: CandidateProfile
    job_title: str
    skills: List[SkillMatch]
    strengths: List[str]
    gaps: List[str]
    learning_plan: List[LearningItem]
    total_learning_hours: int


# ----------------- Helpers -----------------
def extract_text_from_pdf(content: bytes) -> str:
    reader = pypdf.PdfReader(io.BytesIO(content))
    return "\n".join((page.extract_text() or "") for page in reader.pages)


def extract_text_from_docx(content: bytes) -> str:
    doc = docx.Document(io.BytesIO(content))
    return "\n".join(p.text for p in doc.paragraphs)


def extract_resume_text(filename: str, content: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return extract_text_from_pdf(content)
    if name.endswith(".docx"):
        return extract_text_from_docx(content)
    if name.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    raise HTTPException(status_code=400, detail="Unsupported file type. Upload PDF, DOCX, or TXT.")


def build_prompt(job_description: str, resume_text: str) -> str:
    return f"""You are an expert technical recruiter and career coach. Analyze the candidate's resume against the job description.

Return a STRICT JSON object — no markdown, no commentary, no code fences — matching this schema EXACTLY:

{{
  "overall_score": <integer 0-100>,
  "verdict": "<one short sentence verdict>",
  "candidate": {{
    "name": "<full name from resume, or 'Candidate' if not found>",
    "title": "<current/most recent job title>",
    "years_experience": "<e.g. '5+ years' or 'Entry-level'>",
    "summary": "<one-line professional summary>"
  }},
  "job_title": "<job title from JD>",
  "skills": [
    {{
      "skill": "<skill name from JD>",
      "status": "match | partial | missing",
      "proficiency": "expert | proficient | intermediate | beginner | none",
      "evidence": "<concrete evidence from resume; if missing, say 'Not found in resume'>",
      "importance": "critical | important | nice-to-have"
    }}
  ],
  "strengths": ["<3-5 strengths>"],
  "gaps": ["<3-6 gaps phrased as missing/weak skill statements>"],
  "learning_plan": [
    {{
      "skill": "<adjacent skill the candidate can realistically acquire>",
      "why_adjacent": "<why this is adjacent to candidate's existing skills>",
      "estimated_hours": <integer>,
      "priority": "high | medium | low",
      "resources": [
        {{
          "title": "<resource title>",
          "type": "course | documentation | video | article | project",
          "provider": "<e.g. Coursera, MDN, YouTube, freeCodeCamp>",
          "url": "<best-guess canonical URL or empty string>"
        }}
      ]
    }}
  ],
  "total_learning_hours": <sum of estimated_hours>
}}

Rules:
- Extract EVERY required/preferred skill from the JD into the skills array (8–15 items).
- Status MUST reflect actual evidence in resume: "match" only if proven, "partial" if related/similar, "missing" if absent.
- Learning plan must focus on ADJACENT skills the candidate can realistically acquire given current background. 4–7 items.
- Each learning item must include 2–3 high-quality real resources (Coursera, Udemy, official docs, freeCodeCamp, YouTube channels, MDN, etc.).
- Be honest and specific. No filler.
- Output ONLY the JSON object.

JOB DESCRIPTION:
\"\"\"
{job_description}
\"\"\"

RESUME:
\"\"\"
{resume_text}
\"\"\"
"""


def parse_llm_json(text: str) -> dict:
    # Strip markdown fences if present
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    # Find first { and last }
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end + 1]
    return json.loads(cleaned)


# ----------------- Routes -----------------
@api_router.get("/")
async def root():
    return {"message": "Resume Match Analyzer API"}


@api_router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    job_description: str = Form(...),
    resume: UploadFile = File(...),
):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    if not job_description or len(job_description.strip()) < 30:
        raise HTTPException(status_code=400, detail="Job description is too short. Provide at least 30 characters.")

    content = await resume.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty resume file")

    resume_text = extract_resume_text(resume.filename, content)
    if len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text from resume.")

    session_id = str(uuid.uuid4())
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message="You are an expert technical recruiter and career coach. You always respond with strictly valid JSON only.",
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    prompt = build_prompt(job_description, resume_text)
    try:
        response = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logger.exception("LLM call failed")
        msg = str(e)
        if "FREE_USER_EXTERNAL_ACCESS_DENIED" in msg or "rate" in msg.lower() or "429" in msg:
            raise HTTPException(
                status_code=429,
                detail="AI service is temporarily rate-limited. Please wait a moment and try again.",
            )
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {e}")

    try:
        data = parse_llm_json(response)
    except Exception as e:
        logger.error(f"Failed to parse LLM response: {response[:500]}")
        raise HTTPException(status_code=502, detail=f"Failed to parse AI response: {e}")

    analysis_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    data["id"] = analysis_id
    data["created_at"] = now_iso

    # Validate via pydantic
    try:
        result = AnalysisResult(**data)
    except Exception as e:
        logger.error(f"Validation failed: {data}")
        raise HTTPException(status_code=502, detail=f"AI returned invalid structure: {e}")

    # Persist (best-effort)
    try:
        await db.analyses.insert_one(result.model_dump())
    except Exception:
        logger.exception("Failed to persist analysis (non-fatal)")

    return result


@api_router.get("/analyses/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(analysis_id: str):
    doc = await db.analyses.find_one({"id": analysis_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisResult(**doc)


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
