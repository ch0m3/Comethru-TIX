import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function EventAnalytics() {
  const { id } = useParams()
  const { token } = useAuth()
  const [event, setEvent]     = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest(`/events/${id}`, { token }),
      apiRequest(`/bookings?event_id=${id}`, { token }),
    ]).then(([e, b]) => { setEvent(e); setBookings(b) }).finally(() => setLoading(false))
  }, [id, token])

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading analytics...</p>
  if (!event)  return null

  const totalSold = event.ticket_types.reduce((s, t) => s + t.quantity_sold, 0)
  const totalAvailable = event.ticket_types.reduce((s, t) => s + t.quantity_available, 0)
  const revenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.total_amount, 0)
  const pct = totalAvailable > 0 ? Math.round((totalSold / totalAvailable) * 100) : 0

  return (
    <div>
      <h1 className="section-title">Analytics: {event.title}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Tickets Sold', value: totalSold },
          { label: 'Remaining', value: totalAvailable - totalSold },
          { label: 'Fill Rate', value: `${pct}%` },
          { label: 'Revenue', value: `KES ${revenue.toFixed(0)}` },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.4rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per ticket type breakdown */}
      <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1rem' }}>Ticket Types</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {event.ticket_types.map(t => (
          <div key={t.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>{t.name}</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>KES {t.price}</span>
            </div>
            <div style={{ background: 'var(--color-surface-alt)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{ width: `${t.quantity_available > 0 ? (t.quantity_sold / t.quantity_available) * 100 : 0}%`, background: 'var(--color-primary)', height: '100%' }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
              {t.quantity_sold} / {t.quantity_available} sold
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
