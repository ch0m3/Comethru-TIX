from datetime import datetime, timezone

from app.extensions import db


class Booking(db.Model):
    """Links a user to a ticket type, with quantity and the price actually
    paid (total_amount is calculated once at booking time and never
    recalculated, so historical orders keep their real price even if the
    ticket type's price changes later)."""

    _tablename_ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    # Nullable now — a booking can belong to a logged-in customer (user_id set)
    # OR a guest checkout (user_id null, guest_* fields set instead). Buyers
    # are never required to sign in to get a ticket.
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    ticket_type_id = db.Column(db.Integer, db.ForeignKey("ticket_types.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="confirmed")  # confirmed | cancelled
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Guest checkout details — collected purely so the ticket/receipt can be
    # sent and the buyer can be reached, never used for login.
    guest_name = db.Column(db.String(120), nullable=True)
    guest_email = db.Column(db.String(120), nullable=True)
    guest_phone = db.Column(db.String(30), nullable=True)

    # How the ticket was paid for, e.g. "mpesa" | "card" | "cash"
    payment_method = db.Column(db.String(20), nullable=False, default="mpesa")

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
            "guest_name": self.guest_name,
            "guest_email": self.guest_email,
            "guest_phone": self.guest_phone,
            "payment_method": self.payment_method,
        }