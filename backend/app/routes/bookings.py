from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.extensions import db
from app.models.booking import Booking
from app.models.ticket_type import TicketType
from app.models.event import Event
from app.utils.decorators import current_user_required, error

VALID_PAYMENT_METHODS = {"mpesa", "card", "cash"}

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")


@bookings_bp.route("", methods=["GET"])
@current_user_required
def list_bookings():
    role = get_jwt().get("role")
    user_id = int(get_jwt_identity())
    event_id = request.args.get("event_id", type=int)

    query = Booking.query.join(TicketType).join(Event)

    if role == "customer":
        query = query.filter(Booking.user_id == user_id)
    elif role == "organizer":
        query = query.filter(Event.organizer_id == user_id)
    # admin: no filter, sees every booking

    if event_id is not None:
        query = query.filter(Event.id == event_id)

    bookings = query.order_by(Booking.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bookings]), 200


@bookings_bp.route("", methods=["POST"])
def create_booking():
    """
    Buying a ticket never requires an account. If the request carries a
    valid customer JWT, the booking is linked to that user (so it shows up
    in their "My Tickets" list). Otherwise it's a guest checkout — name,
    email and phone are collected only so the ticket/receipt can be sent
    and the buyer can be reached, never for authentication.
    """
    # Optional auth: don't reject the request if there's no/garbage token,
    # just check whether a valid customer session is attached.
    verify_jwt_in_request(optional=True)
    identity = get_jwt_identity()
    claims = get_jwt() or {}
    is_customer_session = identity is not None and claims.get("role") == "customer"
    user_id = int(identity) if is_customer_session else None

    data = request.get_json(silent=True) or {}

    ticket_type_id = data.get("ticket_type_id")
    quantity = data.get("quantity")
    payment_method = (data.get("payment_method") or "").strip().lower()

    guest_name = (data.get("guest_name") or "").strip()
    guest_email = (data.get("guest_email") or "").strip()
    guest_phone = (data.get("guest_phone") or "").strip()

    try:
        ticket_type_id = int(ticket_type_id)
        quantity = int(quantity)
    except (TypeError, ValueError):
        return error("A valid ticket_type_id and quantity are required.")

    if quantity < 1:
        return error("Quantity must be at least 1.")

    if payment_method not in VALID_PAYMENT_METHODS:
        return error("Please choose a valid payment method (M-Pesa, Card, or Cash).")

    # Guests must give us a way to reach them / send the ticket. Logged-in
    # customers already have this on file, so it's not required from them.
    if not is_customer_session:
        if not guest_name or not guest_email or not guest_phone:
            return error("Full name, email and phone number are required.")

    ticket_type = TicketType.query.get(ticket_type_id)
    if not ticket_type:
        return error("Ticket type not found.", 404)

    if ticket_type.event.status != "approved":
        return error("This event is not currently open for bookings.", 400)

    remaining = ticket_type.quantity_available - ticket_type.quantity_sold
    if quantity > remaining:
        return error(f"Only {remaining} ticket(s) remaining for this type.", 400)

    total_amount = ticket_type.price * quantity

    booking = Booking(
        user_id=user_id,
        ticket_type_id=ticket_type.id,
        quantity=quantity,
        total_amount=total_amount,
        status="confirmed",
        payment_method=payment_method,
        guest_name=guest_name or None,
        guest_email=guest_email or None,
        guest_phone=guest_phone or None,
    )
    ticket_type.quantity_sold += quantity

    db.session.add(booking)
    db.session.commit()

    return jsonify(booking.to_dict()), 201


@bookings_bp.route("/<int:booking_id>", methods=["PUT"])
@current_user_required
def update_booking(booking_id):
    role = get_jwt().get("role")
    user_id = int(get_jwt_identity())

    booking = Booking.query.get(booking_id)
    if not booking:
        return error("Booking not found.", 404)

    is_owner = booking.user_id == user_id
    if role == "customer" and not is_owner:
        return error("You do not have permission to modify this booking.", 403)
    if role == "organizer":
        # Organizers can view bookings for their events but not modify them.
        return error("You do not have permission to modify this booking.", 403)

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if new_status != "cancelled":
        return error("The only supported status change is 'cancelled'.")
    if booking.status == "cancelled":
        return error("This booking is already cancelled.")

    booking.status = "cancelled"
    booking.ticket_type.quantity_sold -= booking.quantity
    db.session.commit()

    return jsonify(booking.to_dict()), 200