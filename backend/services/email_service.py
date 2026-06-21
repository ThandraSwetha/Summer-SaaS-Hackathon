import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional


def send_email(to_email: str, subject: str, html_body: str, from_email: Optional[str] = None) -> bool:
    """Send an email using SMTP credentials from environment variables.
    Expected env vars:
        EMAIL_HOST - SMTP server hostname
        EMAIL_PORT - SMTP port (int)
        EMAIL_USER - SMTP username
        EMAIL_PASSWORD - SMTP password
        EMAIL_FROM (optional) - sender address; defaults to EMAIL_USER
    Returns True on success, False otherwise.
    """
    host = os.getenv('EMAIL_HOST')
    port = int(os.getenv('EMAIL_PORT', '587'))
    user = os.getenv('EMAIL_USER')
    password = os.getenv('EMAIL_PASSWORD')
    sender = from_email or os.getenv('EMAIL_FROM') or user
    if not all([host, user, password, sender]):
        # Missing configuration
        return False
    try:
        msg = MIMEMultipart()
        msg['From'] = sender
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_body, 'html'))
        with smtplib.SMTP(host, port) as server:
            server.starttls()
            server.login(user, password)
            server.send_message(msg)
        return True
    except Exception:
        return False
