import json
from database import SessionLocal, engine
import models, schemas, crud, auth

def seed():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create Companies
        print("Creating Companies...")
        companies = [
            models.Company(name="TechNova Solutions", industry="Software", location="San Francisco, CA", hr_contact="hr@technova.com"),
            models.Company(name="HealthSync AI", industry="Healthcare", location="Boston, MA", hr_contact="careers@healthsync.ai"),
            models.Company(name="Global Finance Inc", industry="Finance", location="New York, NY", hr_contact="recruiting@globalfinance.com")
        ]
        db.add_all(companies)
        db.commit()
        
        c1, c2, c3 = companies

        # Create Users
        print("Creating Users...")
        users = [
            models.User(email="admin@promtal.com", hashed_password=auth.get_password_hash("password123"), role=models.Role.SUPER_ADMIN),
            models.User(email="recruiter@promtal.com", hashed_password=auth.get_password_hash("password123"), role=models.Role.RECRUITER, company_id=c1.id),
            models.User(email="hr2@healthsync.ai", hashed_password=auth.get_password_hash("password123"), role=models.Role.RECRUITER, company_id=c2.id),
            models.User(email="candidate@promtal.com", hashed_password=auth.get_password_hash("password123"), role=models.Role.CANDIDATE),
            models.User(email="jane.doe@example.com", hashed_password=auth.get_password_hash("password123"), role=models.Role.CANDIDATE),
            models.User(email="john.smith@example.com", hashed_password=auth.get_password_hash("password123"), role=models.Role.CANDIDATE),
        ]
        db.add_all(users)
        db.commit()
        
        # Create Candidates
        print("Creating Candidates...")
        candidate1 = models.Candidate(
            user_id=users[3].id, name="Alice Candidate", phone="555-0100",
            skills=["Python", "React", "SQL"],
            education=[{"degree": "BS Computer Science", "institution": "State University", "year": "2022"}],
            experience=[{"company": "Intern Corp", "role": "Junior Dev", "duration": "1 year", "description": "Backend dev"}]
        )
        candidate2 = models.Candidate(
            user_id=users[4].id, name="Jane Doe", phone="555-0101",
            skills=["JavaScript", "TypeScript", "Node.js", "AWS"],
            education=[{"degree": "MS Software Engineering", "institution": "Tech Institute", "year": "2020"}]
        )
        candidate3 = models.Candidate(
            user_id=users[5].id, name="John Smith", phone="555-0102",
            skills=["Java", "Spring Boot", "PostgreSQL", "Docker"],
            experience=[{"company": "Legacy Systems", "role": "Software Engineer", "duration": "3 years", "description": "Java backend APIs"}]
        )
        db.add_all([candidate1, candidate2, candidate3])
        db.commit()
        
        # Create Jobs
        print("Creating Jobs...")
        jobs = [
            models.Job(company_id=c1.id, title="Full Stack Developer", description="Looking for a Python/React dev.", skills_required=["Python", "React", "TypeScript", "SQL"], experience_range="1-3 years", salary_range="$90k - $120k", job_type=models.JobType.FULL_TIME, location="Remote"),
            models.Job(company_id=c1.id, title="Frontend Engineer", description="UI/UX focused React engineer.", skills_required=["React", "TypeScript", "Tailwind CSS"], experience_range="2-4 years", salary_range="$100k - $130k", job_type=models.JobType.FULL_TIME, location="San Francisco, CA"),
            models.Job(company_id=c2.id, title="Backend Engineer (Python)", description="FastAPI and Postgres expert.", skills_required=["Python", "FastAPI", "PostgreSQL", "Docker"], experience_range="3-5 years", salary_range="$120k - $150k", job_type=models.JobType.FULL_TIME, location="Boston, MA"),
            models.Job(company_id=c3.id, title="Data Engineer", description="Data pipelines and warehousing.", skills_required=["Python", "SQL", "Airflow", "AWS"], experience_range="2-5 years", salary_range="$110k - $140k", job_type=models.JobType.FULL_TIME, location="New York, NY")
        ]
        db.add_all(jobs)
        db.commit()
        
        # Create Applications
        print("Creating Applications...")
        apps = [
            models.Application(job_id=jobs[0].id, candidate_id=candidate1.id, status=models.ApplicationStatus.SHORTLISTED, match_score=85.5, skill_breakdown={"matched": ["Python", "React", "SQL"], "missing": ["TypeScript"]}),
            models.Application(job_id=jobs[1].id, candidate_id=candidate2.id, status=models.ApplicationStatus.APPLIED, match_score=90.0, skill_breakdown={"matched": ["React", "TypeScript"], "missing": ["Tailwind CSS"]}),
            models.Application(job_id=jobs[2].id, candidate_id=candidate3.id, status=models.ApplicationStatus.REJECTED, match_score=45.0, skill_breakdown={"matched": ["PostgreSQL", "Docker"], "missing": ["Python", "FastAPI"]}),
            models.Application(job_id=jobs[0].id, candidate_id=candidate2.id, status=models.ApplicationStatus.INTERVIEW_SCHEDULED, match_score=75.0, skill_breakdown={"matched": ["React", "TypeScript"], "missing": ["Python", "SQL"]}),
        ]
        db.add_all(apps)
        db.commit()
        
        print("Seed data generated successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
