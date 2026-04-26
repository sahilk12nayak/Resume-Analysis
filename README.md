# RESUME // VERDICT

An AI-powered resume match analyzer. Paste a job description, drop a resume, and get an honest skill-by-skill verdict plus a personalized learning plan focused on adjacent skills the candidate can realistically acquire — with curated resources and time estimates.

Built with **Claude Sonnet 4.5**, FastAPI, React, and MongoDB. Brutalist Swiss design.

---

## ✦ Features

- **One-shot analysis** — paste a JD, drop a resume (PDF / DOCX / TXT), get instant results
- **Overall match score** (0–100) with verdict
- **Skill-by-skill breakdown** — every JD requirement marked `MATCH`, `PARTIAL`, or `MISSING` with evidence pulled from the resume, importance, and proficiency level
- **Strengths & gaps** summary
- **Personalized learning plan** — adjacent skills the candidate can realistically learn, with priority, hour estimates, and 2–3 curated resources per skill
- **Print / Export to PDF** straight from the dashboard
- **No accounts, no tracking** — anonymous by design

---

## ✦ Architecture

```
React (CRA + Tailwind)  ──►  FastAPI  ──►  Claude Sonnet 4.5
                                │              (via emergentintegrations)
                                └──►  MongoDB (analyses collection)
```

| Layer    | Stack                                                         |
| -------- | ------------------------------------------------------------- |
| Frontend | React 19, React Router, Tailwind, Lucide, Sonner toasts       |
| Backend  | FastAPI, Motor (async MongoDB), pypdf, python-docx            |
| LLM      | Claude Sonnet 4.5 via `emergentintegrations` (Universal Key)  |
| Storage  | MongoDB (`analyses` collection, UUID id)                      |

### Pages

- **Landing** — Hero, value props, JD textarea + drag-drop dropzone, ANALYZE CTA
- **Loading** — Terminal-style staggered status log + brutalist progress bar
- **Dashboard** — Massive score, candidate profile, skill matrix, strengths/gaps, learning plan grid

### Design System

| Token             | Value                                       |
| ----------------- | ------------------------------------------- |
| Theme             | Light · Swiss / High-Contrast brutalism     |
| Type              | Chivo (display + body), JetBrains Mono (UI) |
| Primary           | International Klein Blue `#002FA7`          |
| Accent            | Signal Red `#FF3B30`                        |
| Borders           | 1px solid `#111111`, no rounding            |
| Gradients/shadows | None — flat surfaces only                   |

---

## ✦ Project Structure

```
/app
├── backend/
│   ├── server.py            # POST /api/analyze, GET /api/analyses/{id}
│   ├── requirements.txt
│   └── .env                 # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
├── frontend/
│   ├── public/index.html    # Loads Chivo + JetBrains Mono
│   ├── src/
│   │   ├── App.js           # Router + Toaster
│   │   ├── App.css
│   │   ├── index.css        # Brutalist tokens, animations
│   │   ├── pages/Analyzer.jsx              # Phase state machine
│   │   └── components/
│   │       ├── LandingView.jsx             # JD input + dropzone
│   │       ├── LoadingView.jsx             # Terminal loader
│   │       └── DashboardView.jsx           # Score + skills + plan
│   └── .env                 # REACT_APP_BACKEND_URL
└── design_guidelines.json   # Design system reference
```

---

## ✦ API

### `POST /api/analyze`

Multipart form-data:

| Field             | Type            | Notes                              |
| ----------------- | --------------- | ---------------------------------- |
| `job_description` | string (≥30 ch) | Full JD text                       |
| `resume`          | file            | `.pdf`, `.docx`, or `.txt` (≤10MB) |

**Response (200)** — `AnalysisResult`:

```json
{
  \"id\": \"uuid\",
  \"created_at\": \"ISO-8601\",
  \"overall_score\": 82,
  \"verdict\": \"Strong match with…\",
  \"candidate\": { \"name\": \"…\", \"title\": \"…\", \"years_experience\": \"…\", \"summary\": \"…\" },
  \"job_title\": \"…\",
  \"skills\": [
    { \"skill\": \"React 18+\", \"status\": \"match\", \"proficiency\": \"expert\",
      \"evidence\": \"…\", \"importance\": \"critical\" }
  ],
  \"strengths\": [\"…\"],
  \"gaps\": [\"…\"],
  \"learning_plan\": [
    { \"skill\": \"Next.js 14 SSR\", \"why_adjacent\": \"…\", \"estimated_hours\": 20,
      \"priority\": \"high\",
      \"resources\": [{ \"title\": \"…\", \"type\": \"course\", \"provider\": \"…\", \"url\": \"…\" }] }
  ],
  \"total_learning_hours\": 75
}
```

**Error codes**

| Code | When                                                |
| ---- | --------------------------------------------------- |
| 400  | Short JD, empty file, unsupported type, unreadable  |
| 429  | Upstream LLM rate-limited (try again shortly)       |
| 502  | LLM failed or returned invalid JSON                 |

### `GET /api/analyses/{id}`

Returns the persisted `AnalysisResult` or `404`.

---

## ✦ Local Development

The app is pre-wired in this Emergent environment (supervisor-managed). For reference:

```bash
# Backend
cd backend
pip install -r requirements.txt
# .env must contain MONGO_URL, DB_NAME, EMERGENT_LLM_KEY
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend
yarn install
# .env must contain REACT_APP_BACKEND_URL
yarn start
```

### Required Environment Variables

**`backend/.env`**
```
MONGO_URL=\"mongodb://localhost:27017\"
DB_NAME=\"test_database\"
CORS_ORIGINS=\"*\"
EMERGENT_LLM_KEY=sk-emergent-...
```

**`frontend/.env`**
```
REACT_APP_BACKEND_URL=https://your-app.preview.emergentagent.com
```

> All backend routes are prefixed with `/api`. The frontend MUST call `${REACT_APP_BACKEND_URL}/api/...`.

---

## ✦ Quick Test

```bash
API_URL=$(grep REACT_APP_BACKEND_URL frontend/.env | cut -d '=' -f2)
curl -X POST \"$API_URL/api/analyze\" \
  -F \"job_description=Senior Frontend Engineer with React 18, TypeScript, Tailwind, Jest, GitHub Actions, accessibility WCAG AA…\" \
  -F \"resume=@/path/to/resume.pdf\"
```

---

## ✦ LLM Configuration

The app uses Claude Sonnet 4.5 via the **Emergent Universal LLM Key** (`emergentintegrations`).

```python
LlmChat(api_key=EMERGENT_LLM_KEY, session_id=…, system_message=…) \
    .with_model(\"anthropic\", \"claude-sonnet-4-5-20250929\")
```

If you hit rate limits, top up your Universal Key balance from **Profile → Universal Key → Add Balance** (or enable auto top-up).

---

## ✦ Roadmap

- [ ] Shareable public report URL (`/report/:id`)
- [ ] Multi-resume ranking against one JD
- [ ] Optional per-skill follow-up chat to refine the verdict
- [ ] Curated static resource catalog as a fallback
- [ ] ATS keyword-density score
- [ ] Tailored cover-letter / outreach generator

---

## ✦ License

Internal project. All rights reserved.

