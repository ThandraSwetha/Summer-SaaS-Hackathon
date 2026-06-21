from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, crud, auth, database

router = APIRouter(tags=["jobs"])

# --- Companies ---
@router.post("/companies", response_model=schemas.CompanyResponse)
def create_company(company: schemas.CompanyCreate, current_user: models.User = Depends(auth.role_required([models.Role.SUPER_ADMIN, models.Role.RECRUITER])), db: Session = Depends(database.get_db)):
    return crud.create_company(db=db, company=company)

@router.get("/companies", response_model=List[schemas.CompanyResponse])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_companies(db, skip=skip, limit=limit)

# --- Jobs ---
@router.post("/jobs", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, current_user: models.User = Depends(auth.role_required([models.Role.SUPER_ADMIN, models.Role.RECRUITER])), db: Session = Depends(database.get_db)):
    # Recruiter can only create jobs for their company
    if current_user.role == models.Role.RECRUITER and job.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not authorized to create jobs for this company")
    return crud.create_job(db=db, job=job)

@router.get("/jobs", response_model=List[schemas.JobResponse])
def read_jobs(skip: int = 0, limit: int = 100, search: Optional[str] = None, db: Session = Depends(database.get_db)):
    # Public endpoint
    return crud.get_jobs(db, skip=skip, limit=limit, search=search)

@router.get("/jobs/{job_id}", response_model=schemas.JobResponse)
def read_job(job_id: int, db: Session = Depends(database.get_db)):
    job = crud.get_job(db, job_id=job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
