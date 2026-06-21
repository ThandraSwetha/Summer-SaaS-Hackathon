from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from sqlalchemy import Enum as SQLAlchemyEnum

class Role(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    RECRUITER = "recruiter"
    CANDIDATE = "candidate"

class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    REMOTE = "remote"

class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ON_HOLD = "on_hold"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    SELECTED = "selected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(Role), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    candidate_profile = relationship("Candidate", back_populates="user", uselist=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True) # For recruiters
    company = relationship("Company", back_populates="recruiters")

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    industry = Column(String)
    location = Column(String)
    logo_url = Column(String)
    hr_contact = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    recruiters = relationship("User", back_populates="company")
    jobs = relationship("Job", back_populates="company")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    skills_required = Column(JSON, nullable=False) # List of strings
    experience_range = Column(String)
    salary_range = Column(String)
    job_type = Column(SQLAlchemyEnum(JobType), nullable=False)
    location = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    headline = Column(String)  # e.g. "Full Stack Developer · Python, React"
    location = Column(String)
    phone = Column(String)
    education = Column(JSON) # List of dicts: {degree, institution, year}
    skills = Column(JSON) # List of strings
    experience = Column(JSON) # List of dicts: {company, role, duration, description}
    resume_url = Column(String) # Path to stored PDF
    photo_url = Column(String)  # Profile photo
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="candidate_profile")
    applications = relationship("Application", back_populates="candidate")
    projects = relationship("Project", back_populates="candidate", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    status = Column(SQLAlchemyEnum(ApplicationStatus), default=ApplicationStatus.APPLIED)
    match_score = Column(Float) # Overall percentage
    skill_breakdown = Column(JSON) # { matched: [], missing: [] }
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    interviews = relationship("Interview", back_populates="application")
    offer_letter = relationship("OfferLetter", back_populates="application", uselist=False)

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    date_time = Column(DateTime(timezone=True), nullable=False)
    meeting_link = Column(String)
    status = Column(String, default="scheduled") # scheduled, confirmed, declined, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    application = relationship("Application", back_populates="interviews")

class OfferLetter(Base):
    __tablename__ = "offer_letters"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), unique=True)
    file_url = Column(String, nullable=False)
    salary_offered = Column(String)
    joining_date = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    application = relationship("Application", back_populates="offer_letter")

class ExperienceLetter(Base):
    __tablename__ = "experience_letters"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    file_url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Payslip(Base):
    __tablename__ = "payslips"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    month_year = Column(String, nullable=False) # e.g. "January 2026"
    file_url = Column(String, nullable=False)
    basic_salary = Column(Float)
    hra = Column(Float)
    allowances = Column(Float)
    deductions = Column(Float)
    net_salary = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    tech_stack = Column(JSON)  # List of strings
    project_link = Column(String)  # Optional URL
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("Candidate", back_populates="projects")
