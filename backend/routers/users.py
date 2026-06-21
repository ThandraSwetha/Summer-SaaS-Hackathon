from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud, auth, database

router = APIRouter(tags=["users"])

@router.get("/candidates/me", response_model=schemas.CandidateResponse)
def read_candidate_profile(current_user: models.User = Depends(auth.role_required([models.Role.CANDIDATE])), db: Session = Depends(database.get_db)):
    candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return candidate

@router.put("/candidates/me", response_model=schemas.CandidateResponse)
def update_candidate_profile(updates: schemas.CandidateUpdate, current_user: models.User = Depends(auth.role_required([models.Role.CANDIDATE])), db: Session = Depends(database.get_db)):
    candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    # Only update fields that were actually provided (exclude unset/None)
    update_data = updates.model_dump(exclude_unset=True)
    return crud.update_candidate(db, candidate_id=candidate.id, updates=update_data)

@router.get("/candidates/{candidate_id}", response_model=schemas.CandidateResponse)
def read_candidate_profile_by_id(candidate_id: int, current_user: models.User = Depends(auth.role_required([models.Role.RECRUITER, models.Role.SUPER_ADMIN])), db: Session = Depends(database.get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    return candidate

@router.get("/admin/recruiters", response_model=List[dict])
def get_all_recruiters_for_admin(current_user: models.User = Depends(auth.role_required([models.Role.SUPER_ADMIN])), db: Session = Depends(database.get_db)):
    recruiters = db.query(models.User).filter(models.User.role == models.Role.RECRUITER).all()
    result = []
    for r in recruiters:
        jobs_count = 0
        company_name = "N/A"
        if r.company_id:
            company_name = r.company.name if r.company else "N/A"
            jobs_count = db.query(models.Job).filter(models.Job.company_id == r.company_id).count()
        result.append({
            "id": r.id,
            "email": r.email,
            "company_name": company_name,
            "is_active": r.is_active,
            "created_at": r.created_at,
            "jobs_count": jobs_count
        })
    return result

@router.put("/admin/users/{user_id}/toggle-active", response_model=dict)
def toggle_user_active_status(user_id: int, current_user: models.User = Depends(auth.role_required([models.Role.SUPER_ADMIN])), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {"message": "User status updated", "is_active": user.is_active}

@router.get("/profile/{user_id}", response_model=schemas.UserResponse)
def read_user_profile_by_id(user_id: int, current_user: models.User = Depends(auth.role_required([models.Role.RECRUITER, models.Role.SUPER_ADMIN])), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
