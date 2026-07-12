import { Outlet } from 'react-router-dom'
import AdminNavbar from '../components/navbars/AdminNavbar'

export default function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AdminNavbar />
      <main className="page"><Outlet /></main>
    </div>
  )
}
