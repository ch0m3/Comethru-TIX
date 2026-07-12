/**
 * EventDetails
 *
 * Anyone can view the event details page without being logged in.
 * When the user clicks "Get Tickets":
 *   - If they are already logged in as a customer → booking form shown directly
 *   - If not logged in → a guest info form appears asking for name, email, phone
 *     and number of tickets, then redirects them to customer login/register
 *     with a note about completing the booking.
 *
 * The ticket selection (type + quantity) is on this page — no second page needed.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, role, isAuthenticated } = useAuth()

  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Booking form state
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [bookingMsg, setBookingMsg] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Guest info (collected when user is not logged in)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  useEffect(() => {
    apiRequest(`/events/${id}`, { token })
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, token])

  const selectedTicketType = event?.ticket_types?.find(t => t.id === Number(selectedTicketTypeId))
  const totalPrice = selectedTicketType ? (selectedTicketType.price * quantity).toFixed(2) : null

  // Step 1 — user clicks "Get Tickets" on a non-logged-in session
  function handleGetTickets() {
    if (isAuthenticated && role === 'customer') {
      // Already a customer — show booking confirmation directly
      setShowGuestForm(false)
    } else {
      // Not logged in → collect their info first
      setShowGuestForm(true)
    }
  }

  // Step 2 — guest submits their info → redirect to register/login
  function handleGuestSubmit(e) {
    e.preventDefault()
    // Store their intent so the login page can inform them
    sessionStorage.setItem('booking_intent', JSON.stringify({
      event_id: id,
      ticket_type_id: selectedTicketTypeId,
      quantity,
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
    }))
    navigate('/customer/register', { state: { prefillEmail: guestEmail, prefillName: guestName } })
  }

  // Step 3 — logged-in customer confirms booking
  async function handleBooking(e) {
    e.preventDefault()
    if (!selectedTicketTypeId) { setBookingMsg('Please select a ticket type.'); return }
    setSubmitting(true)
    setBookingMsg('')
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        token,
        body: { ticket_type_id: Number(selectedTicketTypeId), quantity: Number(quantity) },
      })
      setBookingSuccess(true)
      setBookingMsg(`Booking confirmed! ${quantity} ticket(s) booked.`)
    } catch (err) {
      setBookingMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page"><p style={{ color: 'var(--color-text-muted)' }}>Loading event...</p></div>
  if (error)   return <div className="page"><p className="msg-error">{error}</p></div>
  if (!event)  return null

  return (
    <div>
      {/* Event hero */}
      <div style={{
        height: 360,
        backgroundImage: event.image_url ? `url(${event.image_url})` : `url(https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=2831&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,15,26,0.95) 0%, rgba(13,15,26,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 1.5rem 2rem' }}>
          {event.categories?.length > 0 && (
            <span className="badge badge-gold" style={{ marginBottom: 10, display: 'inline-block' }}>
              {event.categories.map(c => c.name).join(' · ')}
            </span>
          )}
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 8 }}>{event.title}</h1>
          <p style={{ color: 'rgba(240,242,255,0.75)', fontSize: '0.95rem' }}>
            📅 {new Date(event.date).toLocaleString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            &nbsp;·&nbsp; 📍 {event.location}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '2rem', alignItems: 'start' }}
          className="lg:grid-cols-[1fr_340px]">

          {/* Left — event description */}
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 12 }}>About this event</h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Right — ticket booking panel */}
          <div className="card" style={{ position: 'sticky', top: 76 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Get Tickets</h3>

            {event.ticket_types.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                No tickets available yet.
              </p>
            ) : bookingSuccess ? (
              <div>
                <p className="msg-success" style={{ fontSize: '1rem' }}>✓ {bookingMsg}</p>
                {isAuthenticated && role === 'customer' && (
                  <Link to="/customer/tickets" className="btn-primary" style={{ marginTop: 12, width: '100%' }}>
                    View My Tickets
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Ticket type selector */}
                <div style={{ marginBottom: 12 }}>
                  <label>Ticket Type</label>
                  <select value={selectedTicketTypeId} onChange={e => setSelectedTicketTypeId(e.target.value)}>
                    <option value="">Select a ticket type</option>
                    {event.ticket_types.map(t => (
                      <option key={t.id} value={t.id} disabled={t.tickets_remaining === 0}>
                        {t.name} — KES {t.price} ({t.tickets_remaining} left)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: 16 }}>
                  <label>Number of Tickets</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedTicketType?.tickets_remaining || 10}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </div>

                {/* Price total */}
                {totalPrice && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--color-border)', marginBottom: 16, fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total</span>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>KES {totalPrice}</strong>
                  </div>
                )}

                {/* CTA */}
                {!isAuthenticated && !showGuestForm && (
                  <button className="btn-primary" style={{ width: '100%' }} onClick={handleGetTickets}>
                    Get Tickets
                  </button>
                )}

                {/* Guest info form — shown when not logged in */}
                {!isAuthenticated && showGuestForm && (
                  <form onSubmit={handleGuestSubmit}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                      Enter your details to continue booking:
                    </p>
                    <div style={{ marginBottom: 10 }}>
                      <label>Full Name</label>
                      <input value={guestName} onChange={e => setGuestName(e.target.value)} required placeholder="Your full name" />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label>Email Address</label>
                      <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required placeholder="your@email.com" />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label>Phone Number</label>
                      <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} required placeholder="+254 7XX XXX XXX" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                      Continue to Register / Login
                    </button>
                    <button type="button" className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowGuestForm(false)}>
                      Back
                    </button>
                  </form>
                )}

                {/* Logged-in customer booking form */}
                {isAuthenticated && role === 'customer' && (
                  <form onSubmit={handleBooking}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting || !selectedTicketTypeId}>
                      {submitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                    {bookingMsg && <p className="msg-error" style={{ marginTop: 8 }}>{bookingMsg}</p>}
                  </form>
                )}

                {/* If an organizer or admin is viewing */}
                {isAuthenticated && role !== 'customer' && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    You are viewing as {role}. Bookings are for customers only.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
