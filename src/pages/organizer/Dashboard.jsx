import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function OrganizerDashboard() {
  const { token, user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/events', { token }).then(setEvents).catch(console.error).finally(() => setLoading(false))
  }, [token])

  const myEvents = events.filter(e => e.organizer_id === user?.id)
  const approved = myEvents.filter(e => e.status === 'approved').length
  const pending  = myEvents.filter(e => e.status === 'pending').length

  return (
    <div>
      <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Events', value: myEvents.length, color: 'var(--color-primary)' },
          { label: 'Live Events',  value: approved,         color: 'var(--color-success)' },
          { label: 'Pending',      value: pending,           color: 'var(--color-text-muted)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <Link to="/organizer/events/create" className="btn-primary">+ Create New Event</Link>
        <Link to="/organizer/events" className="btn-ghost">View All Events</Link>
      </div>

      {!loading && myEvents.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>You haven't created any events yet.</p>
          <Link to="/organizer/events/create" className="btn-primary">Create your first event</Link>
        </div>
      )}
    </div>
  )
}
