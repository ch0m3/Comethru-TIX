import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/admin/reports', { token }).then(setStats).finally(() => setLoading(false))
  }, [token])

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading dashboard...</p>

  const s = stats || {}

  return (
    <div>
      <h1 className="section-title">Admin Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Users',     value: s.users?.total       || 0, color: 'var(--color-text)' },
          { label: 'Customers',       value: s.users?.customers    || 0, color: 'var(--color-text)' },
          { label: 'Organizers',      value: s.users?.organizers   || 0, color: 'var(--color-text)' },
          { label: 'Total Events',    value: s.events?.total       || 0, color: 'var(--color-text)' },
          { label: 'Live Events',     value: s.events?.approved    || 0, color: 'var(--color-success)' },
          { label: 'Pending Review',  value: s.events?.pending     || 0, color: 'var(--color-primary)' },
          { label: 'Blacklisted',     value: s.events?.blacklisted || 0, color: 'var(--color-danger)' },
          { label: 'Total Revenue',   value: `KES ${(s.bookings?.total_revenue || 0).toFixed(0)}`, color: 'var(--color-primary)' },
          { label: 'Tickets Sold',    value: s.bookings?.total_tickets_sold || 0, color: 'var(--color-text)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '1.2rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/admin/events"  className="btn-primary">Manage Events</Link>
        <Link to="/admin/users"   className="btn-ghost">Manage Users</Link>
        <Link to="/admin/reports" className="btn-ghost">Full Report</Link>
      </div>

      {/* Top events */}
      {s.top_events?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 14, fontSize: '1rem' }}>Top Events by Revenue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {s.top_events.map((e, i) => (
              <div key={e.event_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', minWidth: 24 }}>#{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{e.title}</span>
                </div>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>KES {e.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
