import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function AdminOrders() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/bookings', { token }).then(setBookings).finally(() => setLoading(false))
  }, [token])

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading orders...</p>

  const total = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.total_amount), 0)

  return (
    <div>
      <h1 className="section-title">All Orders</h1>
      <div className="card" style={{ marginBottom: 20, display: 'inline-block', padding: '1rem 1.5rem' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Total confirmed revenue: </span>
        <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>KES {total.toFixed(2)}</strong>
      </div>

      {bookings.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No bookings on the platform yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
              {['ID', 'User', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>#{b.id}</td>
                <td style={{ padding: '8px 12px' }}>{b.user_id}</td>
                <td style={{ padding: '8px 12px' }}>{b.quantity}</td>
                <td style={{ padding: '8px 12px', color: 'var(--color-primary)' }}>KES {Number(b.total_amount).toFixed(2)}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{b.status}</span>
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>
                  {new Date(b.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
