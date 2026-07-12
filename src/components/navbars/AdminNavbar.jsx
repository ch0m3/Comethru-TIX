import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/events',    label: 'Events' },
  { to: '/admin/users',     label: 'Users' },
  { to: '/admin/orders',    label: 'Orders' },
  { to: '/admin/reports',   label: 'Reports' },
]

export default function AdminNavbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors hover:text-[var(--color-primary)] ${
      isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-muted)]'
    }`

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/admin/dashboard" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
          ComeThru<span style={{ color: 'var(--color-text)' }}>Tix</span>
          <span style={{ marginLeft: 8, fontSize: '0.7rem', background: 'rgba(232,160,32,0.15)', color: 'var(--color-primary)', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>ADMIN</span>
        </Link>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1.5rem' }}>
          {LINKS.map(l => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{user?.name}</span>
          <button onClick={logout} className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>Logout</button>
        </div>

        <button onClick={() => setOpen(o => !o)} className="md:hidden" aria-label="Toggle menu"
          style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer', color: 'var(--color-text)' }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {LINKS.map(l => <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>{l.label}</NavLink>)}
          <button onClick={() => { logout(); setOpen(false) }} className="btn-ghost" style={{ width: 'fit-content' }}>Logout</button>
        </div>
      )}
    </nav>
  )
}
