import { Link } from 'react-router-dom'

const HERO_BG = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&auto=format&fit=crop&q=60'

const FEATURES = [
  {
    icon: '🎟',
    title: 'Discover events',
    desc: 'Browse curated events across music, sports, tech, food, and more — all in one place.',
  },
  {
    icon: '⚡',
    title: 'Book instantly',
    desc: 'Choose your ticket type, pick how many you need, and confirm in seconds. No account required to browse.',
  },
  {
    icon: '📊',
    title: 'Sell & manage',
    desc: 'Organizers get a full dashboard — create events, manage ticket tiers, track sales in real time.',
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div
        style={{
          position: 'relative',
          height: 520,
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,26,0.72)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 12 }}>
            Events — Nairobi & Beyond
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16, maxWidth: 600 }}>
            Your next great experience starts here
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(240,242,255,0.75)', maxWidth: 480, marginBottom: 28 }}>
            Find and book tickets to the best events around you. No sign-up needed to browse — just find something you love.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/events" className="btn-primary" style={{ fontSize: '0.95rem' }}>
              Browse Events
            </Link>
            <Link to="/organizer/register" className="btn-ghost" style={{ fontSize: '0.95rem', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              Become an Organizer
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Organizer CTA banner */}
      <div
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1400&auto=format&fit=crop&q=60)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,12,26,0.78)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 10 }}>Have an event to sell?</h2>
          <p style={{ color: 'rgba(240,242,255,0.7)', marginBottom: 24, fontSize: '1rem' }}>
            Register as an organizer, create your event, set ticket prices, and go live — all in minutes.
          </p>
          <Link to="/organizer/register" className="btn-primary">Get Started as Organizer</Link>
        </div>
      </div>
    </div>
  )
}
