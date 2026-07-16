"""
Run once to set up a fresh database:

    python seed.py

Creates all tables (via db.create_all() - see docs/README.md for switching
to real Flask-Migrate migrations later), a starting set of event
categories, and the first admin account using ADMIN_NAME / ADMIN_EMAIL /
ADMIN_PASSWORD from backend/.env. Safe to run more than once - it will
skip anything that already exists.
"""

import os

from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.category import Category

DEFAULT_CATEGORIES = ["Music", "Sports", "Arts & Theatre", "Business", "Tech", "Food & Drink"]


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        for name in DEFAULT_CATEGORIES:
            if not Category.query.filter_by(name=name).first():
                db.session.add(Category(name=name))
        db.session.commit()
        print(f"Categories ready: {', '.join(DEFAULT_CATEGORIES)}")

        admin_email = os.environ.get("ADMIN_EMAIL", "admin@comethru.test").lower()
        admin_password = os.environ.get("ADMIN_PASSWORD", "change-this-password")
        admin_name = os.environ.get("ADMIN_NAME", "Admin")

        if not User.query.filter_by(email=admin_email, role="admin").first():
            admin = User(name=admin_name, email=admin_email, role="admin", status="active")
            admin.set_password(admin_password)
            db.session.add(admin)
            db.session.commit()
            print(f"Admin account created: {admin_email}")
        else:
            print(f"Admin account already exists: {admin_email}")


if __name__ == "__main__":
    seed()
