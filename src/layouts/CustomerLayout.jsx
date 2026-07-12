import { Outlet } from 'react-router-dom'
import CustomerNavbar from '../components/navbars/CustomerNavbar'

export default function CustomerLayout() {
  return (
    <div>
      <CustomerNavbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
