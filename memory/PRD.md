# Resume Match Analyzer — PRD

## Original Problem Statement
Build a landing page for a resume score generator based on the job description.
Build an agent that takes a Job Description and a candidate's resume, conversationally assesses real proficiency on each required skill, identifies gaps, and generates a personalised learning plan focused on adjacent skills the candidate can realistically acquire — with curated resources and time estimates.

## User Choices (Feb 2026)
- LLM: Claude Sonnet 4.5 via Emergent Universal LLM key
- Resume input: PDF / DOCX / TXT upload
- Assessment style: One-shot analysis (no chat)
- Auth: None (anonymous)
- Learning resources: AI-generated suggestions

## Architecture
- **Backend**: FastAPI single endpoint `POST /api/analyze` (multipart: jd + resume file). Parses PDF via pypdf, DOCX via python-docx. Calls Claude Sonnet 4.5 with strict JSON schema prompt via `emergentintegrations.LlmChat`. Persists to MongoDB `analyses` collection (UUID id). `GET /api/analyses/{id}` retrieves.
- **Frontend**: Single-page React app with three phases (Landing → Loading → Dashboard) controlled by a `phase` state machine in `Analyzer.jsx`. Brutalist Swiss design (Chivo + JetBrains Mono, IKB blue #002FA7, Signal red #FF3B30, 1px black borders, no gradients/rounded corners).

## Key Files
- `/app/backend/server.py` — analyze endpoint, prompt, JSON parser, models
- `/app/frontend/src/pages/Analyzer.jsx` — phase state machine
- `/app/frontend/src/components/LandingView.jsx` — JD textarea + dropzone
- `/app/frontend/src/components/LoadingView.jsx` — terminal loader
- `/app/frontend/src/components/DashboardView.jsx` — score, skill matrix, learning plan
- `/app/design_guidelines.json` — design system reference

## Implemented (Feb 2026)
- [x] PDF / DOCX / TXT resume parsing
- [x] Claude Sonnet 4.5 JSON-structured analysis (skills, gaps, learning plan)
- [x] Brutalist Swiss landing page with hero + value props + input grid
- [x] Drag-drop file upload with validation
- [x] Terminal-style staggered loading view with progress bar
- [x] Dashboard: massive score, candidate profile, skill match list with status badges + importance, strengths/gaps, learning plan grid with resources + time estimates
- [x] Print-to-PDF export
- [x] Mongo persistence + retrieval by id
- [x] Friendly rate-limit error handling

## Backlog (P0/P1/P2)
- P1: Shareable public report URL (`/report/:id` route reading from `GET /api/analyses/{id}`)
- P1: Multi-resume comparison (paste one JD, upload N resumes, ranked leaderboard)
- P2: Optional follow-up chat to refine assessment (per skill)
- P2: Curated static resource catalog as fallback when LLM URLs are stale
- P2: User accounts + assessment history
- P2: ATS keyword density score
- P2: Tailored cover-letter / outreach generator based on the analysis
