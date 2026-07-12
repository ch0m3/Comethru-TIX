import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function CustomerTickets() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/bookings', { token }).then(setBookings).finally(() => setLoading(false))
  }, [token])

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return
    await apiRequest(`/bookings/${id}`, { method: 'PUT', token, body: { status: 'cancelled' } })
    setBookings(b => b.map(x => x.id === id ? { ...x, status: 'cancelled' } : x))
  }

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading tickets...</p>

  return (
    <div>
      <h1 className="section-title">My Tickets</h1>
      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>You have no bookings yet.</p>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Booking #{b.id}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  {b.quantity} ticket(s) &nbsp;·&nbsp; KES {Number(b.total_amount).toFixed(2)}
                  &nbsp;·&nbsp; {new Date(b.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>
                  {b.status}
                </span>
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="btn-ghost"
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
