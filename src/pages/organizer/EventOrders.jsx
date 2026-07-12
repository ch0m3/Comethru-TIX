import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function EventOrders() {
  const { id } = useParams()
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/bookings?event_id=${id}`, { token })
      .then(setBookings).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [id, token])

  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const revenue = confirmed.reduce((s, b) => s + b.total_amount, 0)

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
  if (error)   return <p className="msg-error">{error}</p>

  return (
    <div>
      <h1 className="section-title">Event Orders</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ textAlign: 'center', minWidth: 140, padding: '1.2rem' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>{confirmed.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Confirmed</div>
        </div>
        <div className="card" style={{ textAlign: 'center', minWidth: 140, padding: '1.2rem' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>KES {revenue.toFixed(0)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Revenue</div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No bookings for this event yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>ID</th>
              <th style={{ padding: '8px 12px' }}>Qty</th>
              <th style={{ padding: '8px 12px' }}>Amount</th>
              <th style={{ padding: '8px 12px' }}>Status</th>
              <th style={{ padding: '8px 12px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>#{b.id}</td>
                <td style={{ padding: '8px 12px' }}>{b.quantity}</td>
                <td style={{ padding: '8px 12px', color: 'var(--color-primary)' }}>KES {b.total_amount}</td>
                <td style={{ padding: '8px 12px' }}><span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{b.status}</span></td>
                <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>{new Date(b.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
