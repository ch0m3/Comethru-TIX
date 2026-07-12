import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

export default function AdminNavbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <Link to="/admin/dashboard" className="font-semibold text-lg">
        ComeThru Tix
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/events">Events</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/reports">Reports</Link>

        <span className="text-gray-500">{user?.name}</span>
        <button onClick={logout} className="underline">
          Logout
        </button>
      </div>
    </nav>
  )
}
