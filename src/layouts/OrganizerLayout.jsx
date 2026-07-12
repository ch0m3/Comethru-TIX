import { Outlet } from 'react-router-dom'
import OrganizerNavbar from '../components/navbars/OrganizerNavbar'

export default function OrganizerLayout() {
  return (
    <div>
      <OrganizerNavbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
