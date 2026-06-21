from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud, auth, database
from services.ai_matcher import calculate_match_score

router = APIRouter(tags=["applications"])

@router.post("/", response_model=schemas.ApplicationResponse)
def create_application(application: schemas.ApplicationCreate, current_user: models.User = Depends(auth.role_required([models.Role.CANDIDATE])), db: Session = Depends(database.get_db)):
    # Ensure candidate can only apply for themselves
    candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
    if candidate.id != application.candidate_id:
        raise HTTPException(status_code=403, detail="Cannot apply on behalf of another candidate")
    
    # Calculate match score
    job = crud.get_job(db, job_id=application.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    score, breakdown = calculate_match_score(candidate, job)
    application.match_score = score
    application.skill_breakdown = breakdown
    
    return crud.create_application(db=db, application=application)

@router.get("/job/{job_id}", response_model=List[schemas.ApplicationResponse])
def read_applications_for_job(job_id: int, current_user: models.User = Depends(auth.role_required([models.Role.RECRUITER, models.Role.SUPER_ADMIN])), db: Session = Depends(database.get_db)):
    # Basic check, proper implementation would verify recruiter's company owns the job
    return crud.get_applications_by_job(db, job_id=job_id)

@router.get("/me", response_model=List[schemas.ApplicationResponse])
def read_my_applications(current_user: models.User = Depends(auth.role_required([models.Role.CANDIDATE])), db: Session = Depends(database.get_db)):
    candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
    return crud.get_applications_by_candidate(db, candidate_id=candidate.id)

@router.put("/{application_id}/status", response_model=schemas.ApplicationResponse)
def update_status(application_id: int, status: models.ApplicationStatus, current_user: models.User = Depends(auth.role_required([models.Role.RECRUITER, models.Role.SUPER_ADMIN])), db: Session = Depends(database.get_db)):
    app = crud.update_application_status(db, application_id=application_id, status=status)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.get("/candidate/{candidate_id}/job/{job_id}", response_model=schemas.ApplicationResponse)
def read_application_by_candidate_and_job(candidate_id: int, job_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    app = db.query(models.Application).filter(models.Application.candidate_id == candidate_id, models.Application.job_id == job_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if current_user.role == models.Role.CANDIDATE:
        candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
        if candidate.id != candidate_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this application")
    return app

@router.get("/admin/all", response_model=List[dict])
def get_all_applications_for_admin(current_user: models.User = Depends(auth.role_required([models.Role.SUPER_ADMIN])), db: Session = Depends(database.get_db)):
    apps = db.query(models.Application).all()
    result = []
    for app in apps:
        candidate_name = app.candidate.name if app.candidate else f"Candidate #{app.candidate_id}"
        job_title = app.job.title if app.job else f"Job #{app.job_id}"
        company_name = app.job.company.name if (app.job and app.job.company) else "N/A"
        
        # Find recruiter for this job's company
        recruiter_email = "N/A"
        if app.job and app.job.company_id:
            recruiter = db.query(models.User).filter(models.User.role == models.Role.RECRUITER, models.User.company_id == app.job.company_id).first()
            if recruiter:
                recruiter_email = recruiter.email
                
        result.append({
            "id": app.id,
            "candidate_name": candidate_name,
            "candidate_id": app.candidate_id,
            "job_title": job_title,
            "job_id": app.job_id,
            "company_name": company_name,
            "recruiter_email": recruiter_email,
            "status": app.status,
            "match_score": app.match_score,
            "created_at": app.created_at,
            "updated_at": app.updated_at or app.created_at
        })
    return result
