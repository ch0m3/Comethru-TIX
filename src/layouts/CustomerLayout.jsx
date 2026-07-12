import { Outlet } from 'react-router-dom'
import CustomerNavbar from '../components/navbars/CustomerNavbar'

export default function CustomerLayout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <CustomerNavbar />
      <main className="page"><Outlet /></main>
    </div>
  )
}
