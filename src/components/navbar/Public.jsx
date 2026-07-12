import { Link } from 'react-router-dom'

export default function PublicNavbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <Link to="/" className="font-semibold text-lg">
        ComeThru Tix
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/events">Browse Events</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>

        <div className="flex items-center gap-3">
          <Link to="/customer/login" className="underline">
            Customer Login
          </Link>
          <Link to="/organizer/login" className="underline">
            Organizer Login
          </Link>
          <Link to="/admin/login" className="underline">
            Admin Login
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/customer/register"
            className="px-3 py-1.5 bg-black text-white rounded"
          >
            Sign Up as Customer
          </Link>
          <Link
            to="/organizer/register"
            className="px-3 py-1.5 border border-black rounded"
          >
            Sign Up as Organizer
          </Link>
        </div>
      </div>
    </nav>
  )
}
