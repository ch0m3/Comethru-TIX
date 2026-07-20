from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt,
    get_jwt_identity,
)

from app.extensions import db
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.utils.decorators import role_required, error

events_bp = Blueprint("events", __name__, url_prefix="/api/events")

# The frontend's uploader caps files at 5MB; base64 inflates that by ~33%,
# so 8MB of characters gives headroom without allowing arbitrarily large
# payloads through as "just a string".
MAX_IMAGE_URL_LENGTH = 8 * 1024 * 1024


def _validate_image_url(image_url):
    if image_url and len(image_url) > MAX_IMAGE_URL_LENGTH:
        return "Image is too large."
    return None


def _current_role_and_id():
    """Reads the JWT if one is present, without failing the request if it
    is missing - this is what lets GET /api/events and GET
    /api/events/<id> work for logged-out visitors too."""
    verify_jwt_in_request(optional=True)
    identity = get_jwt_identity()
    if identity is None:
        return None, None
    return get_jwt().get("role"), int(identity)


def _parse_date(value):
    if not value:
        return None
    try:
        # datetime-local inputs look like "2026-08-01T18:00"
        return datetime.fromisoformat(value)
    except ValueError:
        return None


# ── List / detail ────────────────────────────────────────────────────────

@events_bp.route("", methods=["GET"])
def list_events():
    role, user_id = _current_role_and_id()

    if role == "admin":
        events = Event.query.order_by(Event.created_at.desc()).all()
    elif role == "organizer":
        events = (
            Event.query.filter_by(organizer_id=user_id)
            .order_by(Event.created_at.desc())
            .all()
        )
    else:
        # customer or logged-out visitor - only approved events are visible
        events = (
            Event.query.filter_by(status="approved")
            .order_by(Event.date.asc())
            .all()
        )

    return jsonify([e.to_dict() for e in events]), 200


@events_bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id):
    role, user_id = _current_role_and_id()
    event = Event.query.get(event_id)
    if not event:
        return error("Event not found.", 404)

    is_owner = role == "organizer" and event.organizer_id == user_id
    if event.status != "approved" and not (role == "admin" or is_owner):
        # Hide the existence of non-approved events from everyone else
        return error("Event not found.", 404)

    return jsonify(event.to_dict()), 200


# ── Create / update ──────────────────────────────────────────────────────

@events_bp.route("", methods=["POST"])
@role_required("organizer")
def create_event():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    location = (data.get("location") or "").strip()
    date = _parse_date(data.get("date"))
    description = data.get("description")
    image_url = data.get("image_url") or None

    if not title or not location or not date:
        return error("Title, date, and location are required.")

    image_error = _validate_image_url(image_url)
    if image_error:
        return error(image_error)

    event = Event(
        organizer_id=user_id,
        title=title,
        description=description,
        date=date,
        location=location,
        image_url=image_url,
        status="pending",
    )
    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), 201


@events_bp.route("/<int:event_id>", methods=["PUT"])
@role_required("organizer")
def update_event(event_id):
    user_id = int(get_jwt_identity())
    event = Event.query.get(event_id)
    if not event:
        return error("Event not found.", 404)
    if event.organizer_id != user_id:
        return error("You do not have permission to edit this event.", 403)

    data = request.get_json(silent=True) or {}

    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return error("Title cannot be empty.")
        event.title = title
    if "location" in data:
        location = (data.get("location") or "").strip()
        if not location:
            return error("Location cannot be empty.")
        event.location = location
    if "date" in data:
        date = _parse_date(data.get("date"))
        if not date:
            return error("A valid date is required.")
        event.date = date
    if "description" in data:
        event.description = data.get("description")
    if "image_url" in data:
        image_url = data.get("image_url") or None
        image_error = _validate_image_url(image_url)
        if image_error:
            return error(image_error)
        event.image_url = image_url

    db.session.commit()
    return jsonify(event.to_dict()), 200


# ── Ticket types ─────────────────────────────────────────────────────────

@events_bp.route("/<int:event_id>/ticket-types", methods=["POST"])
@role_required("organizer")
def add_ticket_type(event_id):
    user_id = int(get_jwt_identity())
    event = Event.query.get(event_id)
    if not event:
        return error("Event not found.", 404)
    if event.organizer_id != user_id:
        return error("You do not have permission to edit this event.", 403)

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    price = data.get("price")
    quantity_available = data.get("quantity_available")

    if not name:
        return error("Ticket name is required.")
    try:
        price = float(price)
        quantity_available = int(quantity_available)
    except (TypeError, ValueError):
        return error("Price and quantity must be numbers.")
    if price < 0:
        return error("Price cannot be negative.")
    if quantity_available < 1:
        return error("Quantity available must be at least 1.")

    ticket_type = TicketType(
        event_id=event.id,
        name=name,
        price=price,
        quantity_available=quantity_available,
        quantity_sold=0,
    )
    db.session.add(ticket_type)
    db.session.commit()

    return jsonify(ticket_type.to_dict()), 201
