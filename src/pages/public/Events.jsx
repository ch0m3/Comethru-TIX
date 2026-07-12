import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../api/client'

const HERO_BG = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&auto=format&fit=crop&q=60'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiRequest('/events')
      .then(setEvents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Hero banner */}
      <div style={{ position: 'relative', height: 260, backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,26,0.7)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Browse Events</h1>
          <p style={{ color: 'rgba(240,242,255,0.7)' }}>Everything happening — find your next experience.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Search */}
        <input
          placeholder="Search by event name or location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 420, marginBottom: '1.75rem' }}
        />

        {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading events...</p>}
        {error   && <p className="msg-error">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>No events found. Try a different search.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(event => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ padding: 0, overflow: 'hidden', transition: 'border-color 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Event image */}
                <div style={{
                  height: 160,
                  backgroundImage: event.image_url ? `url(${event.image_url})` : 'none',
                  backgroundColor: event.image_url ? 'transparent' : 'var(--color-surface-alt)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!event.image_url && <span style={{ fontSize: '2.5rem' }}>🎟</span>}
                </div>

                <div style={{ padding: '1rem' }}>
                  {event.categories?.length > 0 && (
                    <span className="badge badge-gold" style={{ marginBottom: 8 }}>
                      {event.categories[0].name}
                    </span>
                  )}
                  <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: '1rem' }}>{event.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    📅 {new Date(event.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>📍 {event.location}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
