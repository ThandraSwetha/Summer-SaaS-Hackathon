from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud, auth, database

router = APIRouter(tags=["projects"])

@router.post("/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, current_user: models.User = Depends(auth.role_required([models.Role.CANDIDATE])), db: Session = Depends(database.get_db)):
    candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    db_project = models.Project(**project.model_dump(), candidate_id=candidate.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, project_update: schemas.ProjectCreate, current_user: models.User = Depends(auth.role_required([models.Role.CANDIDATE])), db: Session = Depends(database.get_db)):
    candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    db_project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.candidate_id == candidate.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by you")
    
    for key, value in project_update.model_dump().items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(project_id: int, current_user: models.User = Depends(auth.role_required([models.Role.CANDIDATE])), db: Session = Depends(database.get_db)):
    candidate = crud.get_candidate_by_user_id(db, user_id=current_user.id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    db_project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.candidate_id == candidate.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found or not owned by you")
    
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}
