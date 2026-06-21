# Promtal Associates - Setup Instructions

Welcome to the Promtal Associates AI Recruitment & Placement Portal!
This project is built with FastAPI (Python) for the backend and React + Vite for the frontend.

## Prerequisites

- **Python 3.10+** (Make sure Python is added to your PATH)
- **Node.js 18+** (Make sure Node and npm are added to your PATH)
- **PostgreSQL**: You MUST have PostgreSQL installed and running locally.
  - Download from: https://www.postgresql.org/download/windows/
  - During installation, note the default postgres user password.

## 1. Database Setup

1. Open `pgAdmin` or your preferred PostgreSQL client (like DBeaver or psql CLI).
2. Create a new database named `promtal`.

## 2. Backend Setup

1. Open a terminal and navigate to the project root `c:\Users\shrav_xhui\OneDrive\Desktop\SummerSAAS`.
2. Change into the backend directory:
   ```bash
   cd backend
   ```
3. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`
5. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Copy the environment variables example file:
   ```bash
   copy .env.example .env
   ```
   *Edit `.env` if your PostgreSQL username/password is different from the default (postgres/postgres).*

7. Run database migrations:
   ```bash
   alembic upgrade head
   ```
8. Run the seed script to populate sample data:
   ```bash
   python seed.py
   ```
9. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will run on http://localhost:8000. You can view the API docs at http://localhost:8000/docs*

## 3. Frontend Setup

1. Open a **new** terminal and navigate to the project root.
2. Change into the frontend directory:
   ```bash
   cd frontend
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on http://localhost:5173*

## 4. Default Login Credentials (from Seed Script)

- **Admin**: `admin@promtal.com` | Password: `password123`
- **Recruiter**: `recruiter@promtal.com` | Password: `password123`
- **Candidate**: `candidate@promtal.com` | Password: `password123`
