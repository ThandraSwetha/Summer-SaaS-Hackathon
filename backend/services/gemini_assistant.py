import os
import json
import logging
from typing import Dict, Any

try:
    import google.generativeai as genai
except ImportError as e:
    genai = None
    logging.warning("google-generativeai library not installed: %s", e)

# Load Gemini API key from environment (via .env)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and genai:
    genai.configure(api_key=GEMINI_API_KEY)

# Prompt template for intent parsing
_PROMPT_TEMPLATE = """
You are an AI assistant for a recruiter. Classify the recruiter’s natural‑language message into one of the following intents:
- GENERATE_OFFER
- SHORTLIST
- REJECT
- HOLD
- UNKNOWN
Extract any relevant entities (candidate name, job title, salary, joining date). Return **exactly** a JSON object with the keys: intent (string), candidate_name (string or null), job_title (string or null), salary (string or null), joining_date (string or null), confidence (string, e.g., 'high', 'medium', 'low').
If the message does not match any known intent, set intent to UNKNOWN and keep other fields null.

Context (provide any relevant info, like list of job titles):
{context}

Message to classify:
{message}
"""

def parse_intent(message: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """Parse a recruiter message using Gemini.

    Returns a dict with the JSON fields defined above, or an error dict
    {'error': 'description'} if the API call fails.
    """
    if not genai:
        return {"error": "google-generativeai library not installed"}
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY not configured"}
    prompt = _PROMPT_TEMPLATE.format(context=json.dumps(context, ensure_ascii=False, indent=2), message=message)
    try:
        response = genai.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        # The response may be a string; attempt to parse JSON
        content = response.text if hasattr(response, 'text') else str(response)
        return json.loads(content)
    except Exception as exc:
        logging.exception("Gemini intent parsing failed")
        return {"error": f"Gemini API error: {exc}"}
