import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

const STATUS_BADGE = { approved: 'badge-green', pending: 'badge-muted', rejected: 'badge-red', blacklisted: 'badge-red' }

export default function OrganizerEvents() {
  const { token, user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/events', { token }).then(data => {
      setEvents(data.filter(e => e.organizer_id === user?.id))
    }).catch(console.error).finally(() => setLoading(false))
  }, [token, user])

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="section-title" style={{ margin: 0 }}>My Events</h1>
        <Link to="/organizer/events/create" className="btn-primary">+ New Event</Link>
      </div>

      {events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No events yet. Create your first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map(event => (
            <div key={event.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Thumbnail */}
              <div style={{ width: 80, height: 64, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface-alt)', backgroundImage: event.image_url ? `url(${event.image_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!event.image_url && <span style={{ fontSize: '1.5rem' }}>🎟</span>}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{event.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {new Date(event.date).toLocaleDateString()} · {event.location}
                </div>
              </div>

              <span className={`badge ${STATUS_BADGE[event.status] || 'badge-muted'}`}>{event.status}</span>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Link to={`/organizer/events/${event.id}/edit`} className="btn-ghost" style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}>Edit</Link>
                <Link to={`/organizer/events/${event.id}/orders`} className="btn-ghost" style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}>Orders</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
