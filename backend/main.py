from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth_router, users, jobs, applications, analytics, documents, projects, recruiter_assistant
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Promtal Associates API",
    description="Backend API for the AI Recruitment & Placement Portal",
    version="1.0.0"
)

# CORS configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Promtal Associates API"}

app.include_router(auth_router.router, prefix="/api/auth")
app.include_router(users.router, prefix="/api/users")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api/applications")
app.include_router(analytics.router, prefix="/api/analytics")
app.include_router(documents.router, prefix="/api/documents")
app.include_router(recruiter_assistant.router, prefix="/api/recruiter/assistant")
