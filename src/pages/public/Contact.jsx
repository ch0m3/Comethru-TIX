import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="page">
      <h1 className="section-title">Contact Us</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 32, maxWidth: 500 }}>
        Have a question about ComeThru Tix or need help with your event? Send us a message or Email and we'll get back to you within 24 hours.Contact us on:0756275827 or Email us on:ComeThru-Tix@gmail.com 
      </p>

      {sent ? (
        <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✓</div>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Message sent</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>We'll be in touch shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label>Your Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="George Jesse" />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="george@example.com" />
          </div>
          <div>
            <label>Message</label>
            <textarea rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required placeholder="How can we help?" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>Send Message</button>
        </form>
      )}
    </div>
  )
}
