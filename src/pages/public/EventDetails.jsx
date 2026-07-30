/**
 * EventDetails
 *
 * Anyone can view the event details page and buy a ticket without being
 * logged in — booking never requires an account.
 *
 * When the user clicks "Get Tickets":
 *   - If they are logged in as a customer → name/email/phone are already on
 *     file, so they only pick a payment method and confirm.
 *   - If not logged in → they enter full name, email and phone purely so the
 *     ticket/receipt can be sent to them (NOT for signing in), pick a payment
 *     method, and confirm. No redirect to register/login happens.
 *
 * The ticket selection (type + quantity) is on this page — no second page needed.
 */

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

const PAYMENT_METHODS = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash at the door' },
]

export default function EventDetails() {
  const { id } = useParams()
  const { token, role, isAuthenticated } = useAuth()

  const [event, setEvent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [bookingMsg, setBookingMsg] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Buyer info — only needed to deliver the ticket/receipt when the buyer
  // isn't logged in. Never used for authentication.
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const isCustomerSession = isAuthenticated && role === 'customer'

  useEffect(() => {
    apiRequest(`/events/${id}`, { token })
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, token])

  const selectedTicketType = event?.ticket_types?.find(t => t.id === Number(selectedTicketTypeId))
  const totalPrice = selectedTicketType ? (selectedTicketType.price * quantity).toFixed(2) : null

  async function handleBooking(e) {
    e.preventDefault()
    if (!selectedTicketTypeId) { setBookingMsg('Please select a ticket type.'); return }
    if (!isCustomerSession && (!guestName || !guestEmail || !guestPhone)) {
      setBookingMsg('Please fill in your name, email and phone so we can send your ticket.')
      return
    }

    setSubmitting(true)
    setBookingMsg('')
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        token: isCustomerSession ? token : null,
        body: {
          ticket_type_id: Number(selectedTicketTypeId),
          quantity: Number(quantity),
          payment_method: paymentMethod,
          ...(isCustomerSession ? {} : {
            guest_name: guestName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
          }),
        },
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

                {/* CTA — no sign-in required to get a ticket */}
                {!isAuthenticated && !showBookingForm && (
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowBookingForm(true)}>
                    Get Tickets
                  </button>
                )}

                {/* Booking form — same for guests and logged-in customers.
                    Guests just have a few extra fields so we can deliver the
                    ticket; nobody is asked to sign in. */}
                {(isCustomerSession || showBookingForm) && (
                  <form onSubmit={handleBooking}>
                    {!isCustomerSession && (
                      <>
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                          Enter your details so we can send your ticket:
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
                      </>
                    )}

                    {/* Payment method */}
                    <div style={{ marginBottom: 16 }}>
                      <label>Mode of Payment</label>
                      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        {PAYMENT_METHODS.map(pm => (
                          <option key={pm.value} value={pm.value}>{pm.label}</option>
                        ))}
                      </select>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting || !selectedTicketTypeId}>
                      {submitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                    {!isCustomerSession && (
                      <button type="button" className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowBookingForm(false)}>
                        Back
                      </button>
                    )}
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