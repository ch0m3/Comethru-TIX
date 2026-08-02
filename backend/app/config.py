"""
App configuration. Everything is read from environment variables so that
no secrets or environment-specific values (like database URLs) are hard
coded. In development these come from a .env file (loaded by run.py via
python-dotenv); in production (Render/Railway/etc) they come from real
environment variables set in the host's dashboard.
"""

import os
from datetime import timedelta


class Config:
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    # CORS - comma separated list of allowed frontend origins
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

    # Password reset tokens are itsdangerous-signed and expire after this
    # many seconds (1 hour).
    RESET_TOKEN_MAX_AGE = 60 * 60

    # The frontend's image uploader can send an event image as a base64
    # data URL (a 5MB image inflates to ~6.7MB of base64 text) inside the
    # JSON body. Flask's default is unlimited; capping it at 10MB stops a
    # runaway/garbage request from being read into memory in full before
    # being rejected. 10MB comfortably covers the frontend's 5MB image
    # cap plus JSON overhead.
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024

    #email configuration
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    # Gmail: use an App Password, not the real account password
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", MAIL_USERNAME)
    # Gmail App Passwords: Google Account → Security → 2-Step Verification → App Passwords. Plain SMTP login with a normal password is blocked by Gmail.
