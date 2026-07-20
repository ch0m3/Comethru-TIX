from datetime import datetime, timezone

from app.extensions import db
from app.models.category import event_categories


class Event(db.Model):
    """
    Belongs to one organizer. status moves through:
        pending -> approved | rejected
        approved -> blacklisted (admin action, cancels all bookings)
    """

    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    # Text, not String(500): the frontend's image uploader can send either
    # a real URL or a base64 data URL (an uploaded file encoded inline),
    # and a data URL for even a modest image easily runs past 500 chars.
    image_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending")
    blacklist_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    ticket_types = db.relationship(
        "TicketType", backref="event", cascade="all, delete-orphan", lazy=True
    )
    categories = db.relationship(
        "Category", secondary=event_categories, backref="events", lazy=True
    )

    def to_dict(self, include_ticket_types=True):
        data = {
            "id": self.id,
            "organizer_id": self.organizer_id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat() if self.date else None,
            "location": self.location,
            "image_url": self.image_url,
            "status": self.status,
            "blacklist_reason": self.blacklist_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "categories": [c.to_dict() for c in self.categories],
        }
        if include_ticket_types:
            data["ticket_types"] = [t.to_dict() for t in self.ticket_types]
        return data
