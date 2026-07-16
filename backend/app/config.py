"""
App configuration. Everything is read from environment variables so that
no secrets or environment-specific values (like database URLs) are hard
coded. In development these come from a .env file (loaded by run.py via
python-dotenv); in production (Render/Railway/etc) they come from real
environment variables set in the host's dashboard.
"""

import os


class Config:
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24  # 1 day

    # CORS - comma separated list of allowed frontend origins
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

    # Password reset tokens are itsdangerous-signed and expire after this
    # many seconds (1 hour).
    RESET_TOKEN_MAX_AGE = 60 * 60
