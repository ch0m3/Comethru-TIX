from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.booking import Booking
from app.utils.decorators import role_required, error

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

VALID_USER_STATUSES = {"active", "pending", "deactivated"}


# ── Users ────────────────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@role_required("admin")
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@role_required("admin")
def update_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return error("User not found.", 404)

    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in VALID_USER_STATUSES:
        return error(f"status must be one of {sorted(VALID_USER_STATUSES)}.")

    user.status = status
    db.session.commit()
    return jsonify(user.to_dict()), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@role_required("admin")
def delete_user(user_id):
    current_admin_id = int(get_jwt_identity())
    if user_id == current_admin_id:
        return error("You cannot delete your own admin account.", 400)

    user = User.query.get(user_id)
    if not user:
        return error("User not found.", 404)

    # Put tickets back into the available pool for any of this user's
    # still-confirmed bookings before they (and the bookings) are deleted.
    for booking in user.bookings:
        if booking.status == "confirmed":
            booking.ticket_type.quantity_sold -= booking.quantity

    db.session.delete(user)  # cascades to their events/bookings
    db.session.commit()
    return jsonify(message="User deleted."), 200


# ── Events ───────────────────────────────────────────────────────────────

@admin_bp.route("/events", methods=["GET"])
@role_required("admin")
def list_all_events():
    events = Event.query.order_by(Event.created_at.desc()).all()
    return jsonify([e.to_dict(include_ticket_types=False) for e in events]), 200


@admin_bp.route("/events/<int:event_id>/approve", methods=["PUT"])
@role_required("admin")
def approve_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return error("Event not found.", 404)
    event.status = "approved"
    db.session.commit()
    return jsonify(event.to_dict()), 200


@admin_bp.route("/events/<int:event_id>/reject", methods=["PUT"])
@role_required("admin")
def reject_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return error("Event not found.", 404)
    event.status = "rejected"
    db.session.commit()
    return jsonify(event.to_dict()), 200


@admin_bp.route("/events/<int:event_id>/blacklist", methods=["PUT"])
@role_required("admin")
def blacklist_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return error("Event not found.", 404)

    data = request.get_json(silent=True) or {}
    reason = (data.get("reason") or "").strip()
    if not reason:
        return error("A reason is required to blacklist an event.")

    event.status = "blacklisted"
    event.blacklist_reason = reason

    # Auto-cancel every confirmed booking for this event's ticket types.
    ticket_type_ids = [t.id for t in event.ticket_types]
    if ticket_type_ids:
        (
            Booking.query.filter(
                Booking.ticket_type_id.in_(ticket_type_ids),
                Booking.status == "confirmed",
            ).update({"status": "cancelled"}, synchronize_session=False)
        )

    db.session.commit()
    return jsonify(event.to_dict()), 200


@admin_bp.route("/events/<int:event_id>", methods=["DELETE"])
@role_required("admin")
def delete_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return error("Event not found.", 404)

    db.session.delete(event)  # cascades to ticket types -> bookings
    db.session.commit()
    return jsonify(message="Event deleted."), 200


# ── Reports ──────────────────────────────────────────────────────────────

@admin_bp.route("/reports", methods=["GET"])
@role_required("admin")
def reports():
    confirmed = Booking.query.filter_by(status="confirmed").all()
    total_revenue = sum(b.total_amount for b in confirmed)
    total_tickets_sold = sum(b.quantity for b in confirmed)

    total_users = User.query.count()
    events_approved = Event.query.filter_by(status="approved").count()
    events_pending = Event.query.filter_by(status="pending").count()
    events_blacklisted = Event.query.filter_by(status="blacklisted").count()

    # Revenue for each of the last 30 days (including days with 0 revenue,
    # so the frontend's bar chart has a consistent x-axis).
    today = datetime.now(timezone.utc).date()
    by_day = {}
    for b in confirmed:
        day = b.created_at.date()
        by_day[day] = by_day.get(day, 0) + b.total_amount

    revenue_over_time = []
    for i in range(29, -1, -1):
        day = today - timedelta(days=i)
        revenue_over_time.append(
            {"date": day.isoformat(), "revenue": round(by_day.get(day, 0), 2)}
        )

    # Top 5 events by revenue.
    revenue_by_event = {}
    titles_by_event = {}
    for b in confirmed:
        event = b.ticket_type.event
        revenue_by_event[event.id] = revenue_by_event.get(event.id, 0) + b.total_amount
        titles_by_event[event.id] = event.title

    top_events = sorted(revenue_by_event.items(), key=lambda kv: kv[1], reverse=True)[:5]
    top_events = [
        {"event_id": event_id, "title": titles_by_event[event_id], "revenue": round(revenue, 2)}
        for event_id, revenue in top_events
    ]

    return jsonify(
        bookings={
            "total_revenue": round(total_revenue, 2),
            "total_tickets_sold": total_tickets_sold,
        },
        users={"total": total_users},
        events={
            "approved": events_approved,
            "pending": events_pending,
            "blacklisted": events_blacklisted,
        },
        revenue_over_time=revenue_over_time,
        top_events=top_events,
    ), 200
