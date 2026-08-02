from flask_mail import Message
from app.extensions import mail

def send_booking_confirmation(booking):
    recipient = booking.guest_email or (booking.user.email if booking.user else None)

    if not recipient:
        return 
    event = booking.ticket_type.event
    msg = Message(
        subject=f"Booking Confirmation for {event.title}",
        recipients=[recipient],
        body=(
            f"Hi {booking.guest_name or (booking.user.name if booking.user else 'there')},\n\n"
            f"Your booking is confirmed!\n\n"
            f"Event: {event.title}\n"
            f"Date: {event.date}\n"
            f"Location: {event.location}\n"
            f"Ticket type: {booking.ticket_type.name}\n"
            f"Quantity: {booking.quantity}\n"
            f"Total paid: KES {booking.total_amount}\n"
            f"Booking reference: #{booking.id}\n\n"
            f"See you there!\n-- ComeThru Tix"
),
)
    mail.send(msg)