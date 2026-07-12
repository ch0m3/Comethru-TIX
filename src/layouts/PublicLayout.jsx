// Layout for pages anyone can see: navbar on top, page content below via
// <Outlet />. React Router renders whichever child route matched inside
// the Outlet.

import { Outlet } from 'react-router-dom'
import PublicNavbar from '../components/navbars/PublicNavbar'

export default function PublicLayout() {
  return (
    <div>
      <PublicNavbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
