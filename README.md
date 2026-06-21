# Summer SaaS

Recruiter/Candidate platform with AI-powered assistant, resume parsing, and job/project management.

## Overview

Summer SaaS is a full-stack demo combining a React + Vite frontend and a FastAPI backend. It provides tools for recruiters and candidates including an AI assistant, resume parsing, applicant tracking, projects and job boards, document uploads, and analytics.

## Features

- **AI Recruiter Assistant**: Contextual assistant UI that helps recruiters with candidate matching, outreach drafts, and recommendations.
- **AI Matcher & Resume Parser**: Services that parse uploaded resumes and match candidates to jobs using ML/AI helpers.
- **Authentication & Users**: Sign-up/login flows, role-aware dashboards (candidate vs recruiter vs admin).
- **Job & Project Management**: Create, list, and view jobs and projects with details and application flows.
- **Document Uploads**: Upload and store candidate documents (resumes, cover letters) in the backend `uploads/` folder.
- **Analytics**: Basic usage and candidate analytics endpoints in the backend.
- **Dark Glassmorphic Theme**: Global theme tokens with a purple/violet dark-mode gradient and glass-panel utilities. Theme toggle is available in the navbar.

## Tech Stack

- Frontend: React + Vite, TypeScript, TailwindCSS
- Backend: Python, FastAPI, SQLAlchemy (database config in `backend/database.py`)
- Dev tooling: Uvicorn for backend, npm/yarn for frontend

## Run Locally

1. Backend

```powershell
cd "C:\Users\shrav_xhui\OneDrive\Desktop\SummerSAAS\backend"
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
# or run start-backend.bat from repo root
```

Confirm backend: `http://localhost:8000/` (docs at `/docs`).

2. Frontend

```powershell
cd "C:\Users\shrav_xhui\OneDrive\Desktop\SummerSAAS\frontend"
npm install
npm run dev
# or run start-frontend.bat from repo root
```

Open `http://localhost:5173/` and use the navbar theme toggle to switch between light/dark.

## Theme Notes

- Global CSS variables live in `frontend/src/index.css`.
- Dark-mode uses a purple/violet gradient (adjusted HSL tokens for `--primary`/`--accent`).
- Utilities: `glass`, `glass-panel`, `input-glass`, `btn-primary` provide the glassmorphic look.

## Git / Repo

- Remote: https://github.com/ThandraSwetha/Summer-SaaS-Hackathon.git
- I added a `.gitignore` to avoid committing virtualenvs, node_modules and other large files.

## Troubleshooting

- If `backend` returns `ERR_CONNECTION_REFUSED`, ensure the backend is running and port 8000 is available.
- If push fails, authenticate with GitHub (use PAT if prompted).

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a pull request with clear description

## License

This repo contains work for a hackathon/demonstration; apply your preferred license if publishing.

---

If you want, I can start the backend and frontend here, or open the GitHub repo page in your browser. Which do you prefer?