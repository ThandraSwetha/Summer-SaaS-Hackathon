from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas, auth

# --- Users ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role, company_id=user.company_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # If role is candidate, auto-create candidate profile
    if user.role == models.Role.CANDIDATE:
        db_candidate = models.Candidate(user_id=db_user.id, name=user.email.split('@')[0]) # default name
        db.add(db_candidate)
        db.commit()
        
    return db_user

# --- Companies ---
def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def get_companies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Company).offset(skip).limit(limit).all()

def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

# --- Jobs ---
def create_job(db: Session, job: schemas.JobCreate):
    db_job = models.Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_jobs(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Job).filter(models.Job.is_active == True)
    if search:
        query = query.filter(models.Job.title.ilike(f"%{search}%") | models.Job.description.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def get_job(db: Session, job_id: int):
    return db.query(models.Job).filter(models.Job.id == job_id).first()

# --- Candidates ---
def get_candidate_by_user_id(db: Session, user_id: int):
    return db.query(models.Candidate).filter(models.Candidate.user_id == user_id).first()

def update_candidate(db: Session, candidate_id: int, updates: dict):
    db.query(models.Candidate).filter(models.Candidate.id == candidate_id).update(updates)
    db.commit()
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()

# --- Applications ---
def create_application(db: Session, application: schemas.ApplicationCreate):
    db_app = models.Application(**application.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def get_applications_by_job(db: Session, job_id: int):
    return db.query(models.Application).filter(models.Application.job_id == job_id).all()

def get_applications_by_candidate(db: Session, candidate_id: int):
    return db.query(models.Application).filter(models.Application.candidate_id == candidate_id).all()

def update_application_status(db: Session, application_id: int, status: models.ApplicationStatus):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        return None
    app.status = status
    db.commit()
    db.refresh(app)
    return app
