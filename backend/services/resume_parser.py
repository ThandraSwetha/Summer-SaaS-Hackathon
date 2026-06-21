import pdfplumber
import re

# Simple heuristic dictionaries for matching
COMMON_SKILLS = ["python", "java", "javascript", "react", "typescript", "node.js", "c++", "c#", "sql", "postgresql", "docker", "aws", "azure", "machine learning", "data science", "html", "css", "fastapi", "django"]

def parse_resume_pdf(file_path: str) -> dict:
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return {}

    text_lower = text.lower()
    
    # Extract skills
    found_skills = set()
    for skill in COMMON_SKILLS:
        # Simple word boundary regex
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.add(skill.capitalize() if skill != "node.js" else "Node.js")
            
    # Basic info extraction (very naive implementation for demo purposes)
    emails = re.findall(r"[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+", text_lower)
    phones = re.findall(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text_lower)
    
    return {
        "raw_text": text,
        "extracted_email": emails[0] if emails else None,
        "extracted_phone": phones[0] if phones else None,
        "skills": list(found_skills)
    }
