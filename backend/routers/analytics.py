from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, auth, database

router = APIRouter(tags=["analytics"])

@router.get("/dashboard", response_model=dict)
def get_analytics_dashboard(current_user: models.User = Depends(auth.role_required([models.Role.SUPER_ADMIN, models.Role.RECRUITER])), db: Session = Depends(database.get_db)):
    # Basic analytics
    query_jobs = db.query(models.Job)
    query_apps = db.query(models.Application)
    
    if current_user.role == models.Role.RECRUITER:
        query_jobs = query_jobs.filter(models.Job.company_id == current_user.company_id)
        # Find all job IDs for this company
        job_ids = [job.id for job in query_jobs.all()]
        query_apps = query_apps.filter(models.Application.job_id.in_(job_ids))
        
    total_jobs = query_jobs.count()
    total_applicants = query_apps.count()
    shortlisted_count = query_apps.filter(models.Application.status == models.ApplicationStatus.SHORTLISTED).count()
    rejected_count = query_apps.filter(models.Application.status == models.ApplicationStatus.REJECTED).count()
    
    # Applications per job (for bar chart)
    apps_per_job_raw = db.query(models.Job.title, func.count(models.Application.id)).join(models.Application, models.Job.id == models.Application.job_id).group_by(models.Job.title)
    if current_user.role == models.Role.RECRUITER:
        apps_per_job_raw = apps_per_job_raw.filter(models.Job.company_id == current_user.company_id)
        
    apps_per_job = [{"name": title, "value": count} for title, count in apps_per_job_raw.all()]
    
    # Hiring ratio (for donut chart)
    selected_count = query_apps.filter(models.Application.status == models.ApplicationStatus.SELECTED).count()
    hiring_ratio = [
        {"name": "Selected", "value": selected_count},
        {"name": "Other", "value": total_applicants - selected_count}
    ]
    
    return {
        "stats": {
            "total_jobs": total_jobs,
            "total_applicants": total_applicants,
            "shortlisted": shortlisted_count,
            "rejected": rejected_count
        },
        "charts": {
            "apps_per_job": apps_per_job,
            "hiring_ratio": hiring_ratio
        }
    }
