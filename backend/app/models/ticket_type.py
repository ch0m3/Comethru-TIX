from app.extensions import db


class TicketType(db.Model):
    """Belongs to one event. quantity_sold is incremented on booking and
    decremented when a booking is cancelled."""

    __tablename__ = "ticket_types"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity_available = db.Column(db.Integer, nullable=False)
    quantity_sold = db.Column(db.Integer, nullable=False, default=0)

    bookings = db.relationship(
        "Booking", backref="ticket_type", cascade="all, delete-orphan", lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "price": self.price,
            "quantity_available": self.quantity_available,
            "quantity_sold": self.quantity_sold,
            "tickets_remaining": self.quantity_available - self.quantity_sold,
        }
