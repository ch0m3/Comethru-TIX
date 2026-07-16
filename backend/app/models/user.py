from datetime import datetime, timezone

from app.extensions import db, bcrypt


class User(db.Model):
    """
    Shared by all three roles (customer / organizer / admin).

    status:
        - 'active'      customers (immediately) and admins (seeded)
        - 'pending'     organizers, until an admin approves them
        - 'deactivated' any role, set by an admin
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # customer | organizer | admin
    business_name = db.Column(db.String(150), nullable=True)  # organizer only
    status = db.Column(db.String(20), nullable=False, default="active")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    bookings = db.relationship(
        "Booking", backref="user", cascade="all, delete-orphan", lazy=True
    )
    events = db.relationship(
        "Event", backref="organizer", cascade="all, delete-orphan", lazy=True
    )

    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "business_name": self.business_name,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
