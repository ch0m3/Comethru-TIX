const BG = 'https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=2831&auto=format&fit=crop'

export default function About() {
  return (
    <div>
      <div style={{ position: 'relative', height: 240, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,26,0.75)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>About ComeThru Tix</h1>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: 24 }}>
          ComeThru Tix is a modern event ticketing platform built for organisers and audiences who believe great experiences should be easy to find and even easier to get into.
        </p>
        <p style={{ lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Whether you're running a music festival, a tech meetup, a sports tournament, or a private dinner — ComeThru Tix gives you the tools to publish your event, set your ticket tiers, and sell out, without the friction of traditional ticketing platforms.
        </p>
        <p style={{ lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
          For guests, browsing is always free and open. No account needed to discover what's on. When you're ready to book, the process takes less than a minute.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 40 }}>
          {[['🎟', 'Instant booking'], ['📊', 'Real-time sales'], ['🔒', 'Secure & verified'], ['🌍', 'Pan-Africa ready']].map(([icon, label]) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{icon}</div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
