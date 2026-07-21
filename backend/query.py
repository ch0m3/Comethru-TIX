#Query all users from the database

#Query all events from the database

#Query all organisers from the database. 


"""
Quick, read-only sanity check that the backend can actually reach its
database and that the tables seed.py created are populated as expected.

Run from the backend/ folder (same place you run seed.py and run.py):

    python query.py

Prints results from up to 5 queries. If this fails with "no such table",
you haven't run `python seed.py` from this same folder yet, or `run.py`
is pointed at a different .env / DATABASE_URL than this script is.
"""

from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.event import Event
from app.models.booking import Booking
from app.models.category import Category


def run():
    app = create_app()
    with app.app_context():
        print(f"Connected to: {app.config['SQLALCHEMY_DATABASE_URI']}\n")

        # 1. Total users, broken down by role
        print("── 1. Users by role ──")
        total_users = User.query.count()
        print(f"Total users: {total_users}")
        for role in ("customer", "organizer", "admin"):
            count = User.query.filter_by(role=role).count()
            print(f"  {role}: {count}")

        # 2. The admin account seed.py should have created
        print("\n── 2. Admin account ──")
        admin = User.query.filter_by(role="admin").first()
        if admin:
            print(f"Found admin: {admin.email} (status={admin.status})")
        else:
            print("No admin account found — did you run `python seed.py`?")

        # 3. Categories seed.py should have created
        print("\n── 3. Categories ──")
        categories = Category.query.all()
        if categories:
            print(", ".join(c.name for c in categories))
        else:
            print("No categories found — did you run `python seed.py`?")

        # 4. Events by status
        print("\n── 4. Events by status ──")
        total_events = Event.query.count()
        print(f"Total events: {total_events}")
        for status in ("pending", "approved", "rejected", "blacklisted"):
            count = Event.query.filter_by(status=status).count()
            print(f"  {status}: {count}")

        # 5. Bookings and total confirmed revenue
        print("\n── 5. Bookings ──")
        total_bookings = Booking.query.count()
        confirmed = Booking.query.filter_by(status="confirmed").all()
        revenue = sum(b.total_amount for b in confirmed)
        print(f"Total bookings: {total_bookings}")
        print(f"Confirmed bookings: {len(confirmed)}")
        print(f"Confirmed revenue: {revenue}")


if __name__ == "__main__":
    run()