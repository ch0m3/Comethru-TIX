import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function AdminReports() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/admin/reports', { token }).then(setStats).finally(() => setLoading(false))
  }, [token])

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading reports...</p>
  if (!stats) return null

  const maxRevenue = stats.revenue_over_time.length > 0
    ? Math.max(...stats.revenue_over_time.map(r => r.revenue))
    : 1

  return (
    <div>
      <h1 className="section-title">Platform Reports</h1>

      {/* Summary grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Total Revenue',   value: `KES ${stats.bookings.total_revenue.toFixed(0)}`, accent: true },
          { label: 'Tickets Sold',    value: stats.bookings.total_tickets_sold },
          { label: 'Total Users',     value: stats.users.total },
          { label: 'Active Events',   value: stats.events.approved },
          { label: 'Pending Events',  value: stats.events.pending },
          { label: 'Blacklisted',     value: stats.events.blacklisted, danger: true },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.2rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.danger ? 'var(--color-danger)' : s.accent ? 'var(--color-primary)' : 'var(--color-text)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue over time — simple bar chart using divs */}
      {stats.revenue_over_time.length > 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 20 }}>Revenue — Last 30 Days</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
            {stats.revenue_over_time.map(r => {
              const pct = maxRevenue > 0 ? (r.revenue / maxRevenue) * 100 : 0
              return (
                <div key={r.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div title={`KES ${r.revenue.toFixed(0)}`} style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    height: `${Math.max(pct, 4)}%`,
                    background: 'var(--color-primary)',
                    opacity: 0.85,
                    transition: 'height 0.3s',
                  }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
            <span>{stats.revenue_over_time[0]?.date}</span>
            <span>{stats.revenue_over_time[stats.revenue_over_time.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Top events */}
      {stats.top_events.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>Top Events by Revenue</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.top_events.map((e, i) => (
              <div key={e.event_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700, minWidth: 28 }}>#{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{e.title}</span>
                </div>
                <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                  KES {e.revenue.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
