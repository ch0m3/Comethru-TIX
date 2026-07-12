import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function EditEvent() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', image_url: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiRequest(`/events/${id}`, { token }).then(e => {
      setForm({ title: e.title, description: e.description || '', date: e.date?.slice(0, 16) || '', location: e.location, image_url: e.image_url || '' })
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [id, token])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiRequest(`/events/${id}`, { method: 'PUT', token, body: form })
      navigate('/organizer/events')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>

  return (
    <div style={{ maxWidth: 540 }}>
      <h1 className="section-title">Edit Event</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label>Title</label><input value={form.title} onChange={set('title')} required /></div>
        <div><label>Description</label><textarea rows={4} value={form.description} onChange={set('description')} /></div>
        <div><label>Date & Time</label><input type="datetime-local" value={form.date} onChange={set('date')} required /></div>
        <div><label>Location</label><input value={form.location} onChange={set('location')} required /></div>
        <div>
          <label>Event Image URL</label>
          <input type="url" value={form.image_url} onChange={set('image_url')} placeholder="https://..." />
          {form.image_url && (
            <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', height: 120 }}>
              <img src={form.image_url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
        {error && <p className="msg-error">{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/organizer/events')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
