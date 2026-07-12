import { Outlet } from 'react-router-dom'
import OrganizerNavbar from '../components/navbars/OrganizerNavbar'

export default function OrganizerLayout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <OrganizerNavbar />
      <main className="page"><Outlet /></main>
    </div>
  )
}
