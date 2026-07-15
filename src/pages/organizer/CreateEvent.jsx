/**
 * CreateEvent
 *
 * Organizer fills in event details INCLUDING an image URL.
 * After creating the event, they are prompted to add ticket types
 * directly on the same page (no separate screen needed).
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'
import ImageUploadField from '../../components/ImageUploadField'

const FIELD = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label>{label}</label>
    {children}
  </div>
)

export default function CreateEvent() {
  const { token } = useAuth()
  const navigate = useNavigate()

  // Event fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Created event (after step 1)
  const [createdEvent, setCreatedEvent] = useState(null)

  // Ticket type fields
  const [ticketName, setTicketName] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [ticketQty, setTicketQty] = useState('')
  const [ticketError, setTicketError] = useState('')
  const [ticketSuccess, setTicketSuccess] = useState('')
  const [ticketSubmitting, setTicketSubmitting] = useState(false)
  const [addedTickets, setAddedTickets] = useState([])

  // Step 1 — create the event
  async function handleCreateEvent(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const event = await apiRequest('/events', {
        method: 'POST',
        token,
        body: { title, description, date, location, image_url: imageUrl || undefined },
      })
      setCreatedEvent(event)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2 — add a ticket type
  async function handleAddTicketType(e) {
    e.preventDefault()
    setTicketError('')
    setTicketSuccess('')
    setTicketSubmitting(true)
    try {
      const tt = await apiRequest(`/events/${createdEvent.id}/ticket-types`, {
        method: 'POST',
        token,
        body: { name: ticketName, price: Number(ticketPrice), quantity_available: Number(ticketQty) },
      })
      setAddedTickets(prev => [...prev, tt])
      setTicketSuccess(`"${tt.name}" added.`)
      setTicketName('')
      setTicketPrice('')
      setTicketQty('')
    } catch (err) {
      setTicketError(err.message)
    } finally {
      setTicketSubmitting(false)
    }
  }

  // Step 3 — done, go to my events
  function handleDone() {
    navigate('/organizer/events')
  }

  // ── Event form ─────────────────────────────────────────────────────
  if (!createdEvent) {
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 className="section-title">Create Event</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
          Fill in the event details below. You will add ticket types on the next step.
          New events start as <strong>pending</strong> until an admin approves them.
        </p>

        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column' }}>
          <FIELD label="Event Title">
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Nairobi Jazz Night" />
          </FIELD>

          <FIELD label="Description">
            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell people what to expect..." />
          </FIELD>

          <FIELD label="Date & Time">
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
          </FIELD>

          <FIELD label="Location / Venue">
            <input value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. KICC, Nairobi" />
          </FIELD>

          <div style={{ marginBottom: 14 }}>
            <ImageUploadField label="Event Image" value={imageUrl} onChange={setImageUrl} height={160} />
          </div>

          {error && <p className="msg-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting} style={{ width: 'fit-content', marginTop: 8 }}>
            {submitting ? 'Creating...' : 'Create Event →'}
          </button>
        </form>
      </div>
    )
  }

  // ── Ticket type form ───────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 560 }}>
      <div className="card" style={{ marginBottom: 24, background: 'rgba(232,160,32,0.08)', borderColor: 'rgba(232,160,32,0.3)' }}>
        <p style={{ fontWeight: 700, marginBottom: 2 }}>✓ Event created: {createdEvent.title}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Status: pending admin approval. Now add your ticket types below.
        </p>
      </div>

      <h2 style={{ fontWeight: 700, marginBottom: 4 }}>Add Ticket Types</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>
        Add as many ticket tiers as you need (e.g. General, VIP, VVIP).
      </p>

      {/* Added tickets so far */}
      {addedTickets.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {addedTickets.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-surface-alt)', borderRadius: 8, marginBottom: 6, fontSize: '0.88rem' }}>
              <span>{t.name}</span>
              <span style={{ color: 'var(--color-primary)' }}>KES {t.price} × {t.quantity_available}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddTicketType} style={{ display: 'flex', flexDirection: 'column' }}>
        <FIELD label="Ticket Name">
          <input value={ticketName} onChange={e => setTicketName(e.target.value)} required placeholder="e.g. General Admission" />
        </FIELD>
        <FIELD label="Price (KES)">
          <input type="number" min="0" step="0.01" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} required placeholder="e.g. 1500" />
        </FIELD>
        <FIELD label="Number of Tickets Available">
          <input type="number" min="1" value={ticketQty} onChange={e => setTicketQty(e.target.value)} required placeholder="e.g. 200" />
        </FIELD>

        {ticketError   && <p className="msg-error">{ticketError}</p>}
        {ticketSuccess && <p className="msg-success">{ticketSuccess}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="submit" className="btn-primary" disabled={ticketSubmitting}>
            {ticketSubmitting ? 'Adding...' : '+ Add Ticket Type'}
          </button>
          <button type="button" className="btn-ghost" onClick={handleDone}>
            {addedTickets.length > 0 ? 'Done — View My Events' : 'Skip for now'}
          </button>
        </div>
      </form>
    </div>
  )
}
