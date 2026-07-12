import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

const STATUS_BADGE = {
  approved:    'badge-green',
  pending:     'badge-gold',
  rejected:    'badge-red',
  blacklisted: 'badge-red',
}

export default function AdminEvents() {
  const { token } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    apiRequest('/admin/events', { token }).then(setEvents).finally(() => setLoading(false))
  }, [token])

  function flash(msg) {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(''), 3000)
  }

  async function approve(id) {
    await apiRequest(`/admin/events/${id}/approve`, { method: 'PUT', token })
    setEvents(ev => ev.map(e => e.id === id ? { ...e, status: 'approved' } : e))
    flash('Event approved.')
  }

  async function reject(id) {
    await apiRequest(`/admin/events/${id}/reject`, { method: 'PUT', token })
    setEvents(ev => ev.map(e => e.id === id ? { ...e, status: 'rejected' } : e))
    flash('Event rejected.')
  }

  async function blacklist(id, title) {
    const reason = window.prompt(`Reason for blacklisting "${title}":`)
    if (!reason) return
    await apiRequest(`/admin/events/${id}/blacklist`, { method: 'PUT', token, body: { reason } })
    setEvents(ev => ev.map(e => e.id === id ? { ...e, status: 'blacklisted', blacklist_reason: reason } : e))
    flash(`"${title}" has been blacklisted. All bookings auto-cancelled.`)
  }

  async function deleteEvent(id, title) {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return
    await apiRequest(`/admin/events/${id}`, { method: 'DELETE', token })
    setEvents(ev => ev.filter(e => e.id !== id))
    flash(`"${title}" deleted.`)
  }

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading events...</p>

  return (
    <div>
      <h1 className="section-title">Manage Events</h1>
      {actionMsg && <p className="msg-success" style={{ marginBottom: 16 }}>{actionMsg}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {events.map(event => (
          <div key={event.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              {/* Thumbnail */}
              <div style={{
                width: 72, height: 56, borderRadius: 8, flexShrink: 0,
                backgroundImage: event.image_url ? `url(${event.image_url})` : 'none',
                backgroundColor: 'var(--color-surface-alt)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!event.image_url && <span style={{ fontSize: '1.4rem' }}>🎟</span>}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{event.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  {new Date(event.date).toLocaleDateString()} · {event.location}
                </div>
                {event.status === 'blacklisted' && event.blacklist_reason && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-danger)', marginTop: 2 }}>
                    Reason: {event.blacklist_reason}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Created: {new Date(event.created_at).toLocaleString()}
                </div>
              </div>

              <span className={`badge ${STATUS_BADGE[event.status] || 'badge-muted'}`}>
                {event.status}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {event.status === 'pending' && (
                <>
                  <button onClick={() => approve(event.id)} className="btn-primary" style={{ padding: '0.35rem 1rem', fontSize: '0.82rem' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => reject(event.id)} className="btn-ghost" style={{ padding: '0.35rem 1rem', fontSize: '0.82rem' }}>
                    ✕ Reject
                  </button>
                </>
              )}
              {event.status === 'approved' && (
                <button onClick={() => reject(event.id)} className="btn-ghost" style={{ padding: '0.35rem 1rem', fontSize: '0.82rem' }}>
                  Revoke Approval
                </button>
              )}
              {event.status !== 'blacklisted' && (
                <button
                  onClick={() => blacklist(event.id, event.title)}
                  className="btn-ghost"
                  style={{ padding: '0.35rem 1rem', fontSize: '0.82rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                >
                  🚫 Blacklist
                </button>
              )}
              <button
                onClick={() => deleteEvent(event.id, event.title)}
                style={{
                  padding: '0.35rem 1rem', fontSize: '0.82rem', cursor: 'pointer',
                  background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)',
                  border: '1px solid var(--color-danger)', borderRadius: 8,
                }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
