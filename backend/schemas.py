from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from models import Role, JobType, ApplicationStatus

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    role: Role
    company_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Company Schemas ---
class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    hr_contact: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Job Schemas ---
class JobBase(BaseModel):
    title: str
    description: str
    skills_required: List[str]
    experience_range: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: JobType
    location: Optional[str] = None

class JobCreate(JobBase):
    company_id: int

class JobResponse(JobBase):
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    company: Optional[CompanyResponse] = None

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = []
    project_link: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    candidate_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Candidate Schemas ---
class CandidateBase(BaseModel):
    name: str
    headline: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    education: Optional[List[Dict[str, Any]]] = []
    skills: Optional[List[str]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    resume_url: Optional[str] = None
    photo_url: Optional[str] = None

class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    resume_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    user_id: int

class CandidateResponse(CandidateBase):
    id: int
    user_id: int
    created_at: datetime
    projects: Optional[List[ProjectResponse]] = []

    class Config:
        from_attributes = True

# --- Application Schemas ---
class ApplicationBase(BaseModel):
    job_id: int
    candidate_id: int
    status: ApplicationStatus = ApplicationStatus.APPLIED
    match_score: Optional[float] = None
    skill_breakdown: Optional[Dict[str, List[str]]] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
