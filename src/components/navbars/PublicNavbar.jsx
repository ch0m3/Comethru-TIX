/**
 * PublicNavbar
 *
 * Visible to everyone who is NOT logged in.
 * Per requirements:
 *   - Only "Organizer Login" is shown in the navbar
 *   - Customers do not need to sign in to browse
 *   - They are prompted to sign in only when they try to book
 */

import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

export default function PublicNavbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors hover:text-[var(--color-primary)] ${
      isActive ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text-muted)]'
    }`

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 1.25rem',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          ComeThru<span style={{ color: 'var(--color-text)' }}>Tix</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1.75rem' }}>
          <NavLink to="/events" className={linkClass}>Browse Events</NavLink>
          <NavLink to="/about"  className={linkClass}>About</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>

          {/* Only organizer login in the navbar */}
          <Link to="/organizer/login" className="btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
            Organizer Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden"
          aria-label="Toggle menu"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '0.4rem 0.6rem',
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <NavLink to="/events"  className={linkClass} onClick={() => setOpen(false)}>Browse Events</NavLink>
          <NavLink to="/about"   className={linkClass} onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setOpen(false)}>Contact</NavLink>
          <Link
            to="/organizer/login"
            className="btn-primary"
            style={{ width: 'fit-content', fontSize: '0.85rem' }}
            onClick={() => setOpen(false)}
          >
            Organizer Login
          </Link>
        </div>
      )}
    </nav>
  )
}
