import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function OrganizerRegister() {
  const { registerOrganizer } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerOrganizer(form)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: 420, textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Account submitted</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Your organizer account is pending admin review. You'll be able to log in once approved.
        </p>
        <Link to="/organizer/login" className="btn-ghost" style={{ marginTop: 20, display: 'inline-block' }}>Back to Login</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <span className="badge badge-gold" style={{ marginBottom: 14, display: 'inline-block' }}>Organizer Portal</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Register as Organizer</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: 24 }}>
          Already registered? <Link to="/organizer/login" style={{ color: 'var(--color-primary)' }}>Log in</Link>
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label>Full Name</label><input value={form.name} onChange={set('name')} required placeholder="Your name" /></div>
          <div><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
          <div><label>Business / Organisation Name</label><input value={form.businessName} onChange={set('businessName')} placeholder="Optional" /></div>
          <div><label>Password</label><input type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder="Min 8 characters" /></div>
          {error && <p className="msg-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Create Organizer Account'}</button>
        </form>
      </div>
    </div>
  )
}
