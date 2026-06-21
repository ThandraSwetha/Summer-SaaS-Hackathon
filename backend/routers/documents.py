from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import models, auth, database

router = APIRouter(tags=["documents"])

# Ensure uploads directory exists
UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class OfferLetterRequest(BaseModel):
    salary: int
    joining_date: str | None = None

def generate_offer_letter_pdf(candidate_name: str, job_title: str, company_name: str, salary: str, file_path: str):
    c = canvas.Canvas(file_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 700, f"Offer Letter from {company_name}")
    c.setFont("Helvetica", 14)
    c.drawString(100, 650, f"Dear {candidate_name},")
    c.drawString(100, 620, f"We are excited to offer you the position of {job_title}.")
    c.drawString(100, 590, f"Your starting salary will be {salary}.")
    c.drawString(100, 560, "Welcome to the team!")
    c.save()

@router.post("/offer-letter/{application_id}")
def generate_offer_letter(
    application_id: int,
    request: OfferLetterRequest,
    current_user: models.User = Depends(auth.role_required([models.Role.RECRUITER])),
    db: Session = Depends(database.get_db)
):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    candidate = app.candidate
    job = app.job
    company = job.company

    file_name = f"offer_letter_app_{application_id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    generate_offer_letter_pdf(candidate.name, job.title, company.name, request.salary, file_path)

    # Store record
    offer = models.OfferLetter(
        application_id=application_id,
        file_url=file_path,
        salary_offered=request.salary,
        joining_date=request.joining_date or "TBD"
    )
    db.add(offer)
    db.commit()

    return {"message": "Offer letter generated", "file_url": f"/api/documents/download/{file_name}"}

@router.get("/download/{file_name}")
def download_document(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path, filename=file_name, media_type='application/pdf')
