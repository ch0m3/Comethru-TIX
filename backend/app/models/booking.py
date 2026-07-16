from datetime import datetime, timezone

from app.extensions import db


class Booking(db.Model):
    """Links a user to a ticket type, with quantity and the price actually
    paid (total_amount is calculated once at booking time and never
    recalculated, so historical orders keep their real price even if the
    ticket type's price changes later)."""

    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    ticket_type_id = db.Column(db.Integer, db.ForeignKey("ticket_types.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="confirmed")  # confirmed | cancelled
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "ticket_type_id": self.ticket_type_id,
            "event_id": self.ticket_type.event_id if self.ticket_type else None,
            "quantity": self.quantity,
            "total_amount": self.total_amount,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
