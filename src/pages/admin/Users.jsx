import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

const ROLE_BADGE  = { customer: 'badge-muted', organizer: 'badge-gold', admin: 'badge-red' }
const STATUS_BADGE = { active: 'badge-green', pending: 'badge-gold', deactivated: 'badge-red' }

export default function AdminUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    apiRequest('/admin/users', { token }).then(setUsers).finally(() => setLoading(false))
  }, [token])

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  async function updateStatus(id, status) {
    await apiRequest(`/admin/users/${id}`, { method: 'PUT', token, body: { status } })
    setUsers(u => u.map(x => x.id === id ? { ...x, status } : x))
    flash(`User status updated to ${status}.`)
  }

  async function deleteUser(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    await apiRequest(`/admin/users/${id}`, { method: 'DELETE', token })
    setUsers(u => u.filter(x => x.id !== id))
    flash(`${name} removed.`)
  }

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading users...</p>

  return (
    <div>
      <h1 className="section-title">Manage Users</h1>
      {msg && <p className="msg-success" style={{ marginBottom: 16 }}>{msg}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {users.map(u => (
          <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'var(--color-primary)', color: 'var(--color-on-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1rem',
            }}>
              {u.name?.[0]?.toUpperCase() || '?'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge ${ROLE_BADGE[u.role] || 'badge-muted'}`}>{u.role}</span>
              <span className={`badge ${STATUS_BADGE[u.status] || 'badge-muted'}`}>{u.status}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              {u.status !== 'active' && (
                <button onClick={() => updateStatus(u.id, 'active')} className="btn-ghost" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                  Activate
                </button>
              )}
              {u.status !== 'deactivated' && (
                <button onClick={() => updateStatus(u.id, 'deactivated')} className="btn-ghost" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                  Deactivate
                </button>
              )}
              <button onClick={() => deleteUser(u.id, u.name)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 8 }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
