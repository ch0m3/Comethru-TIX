/**
 * App.jsx — full route map for ComeThru Tix
 *
 * Structure:
 *   PublicLayout   — anyone (no auth required)
 *   CustomerLayout — ProtectedRoute(['customer'])
 *   OrganizerLayout— ProtectedRoute(['organizer'])
 *   AdminLayout    — ProtectedRoute(['admin'])
 *
 * Navbar shown depends entirely on which layout is active:
 *   Public    → PublicNavbar  (only Organizer Login button)
 *   Customer  → CustomerNavbar
 *   Organizer → OrganizerNavbar
 *   Admin     → AdminNavbar
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/Authprovider'
import ProtectedRoute from './components/ProtectedRoute'

// Layouts
import PublicLayout   from './layouts/PublicLayout'
import CustomerLayout from './layouts/CustomerLayout'
import OrganizerLayout from './layouts/OrganizerLayout'
import AdminLayout    from './layouts/AdminLayout'

// Public pages
import Home         from './pages/public/Home'
import Events       from './pages/public/Events'
import EventDetails from './pages/public/EventDetails'
import About        from './pages/public/About'
import Contact      from './pages/public/Contact'

// Auth pages
import CustomerLogin    from './pages/auth/CustomerLogin'
import CustomerRegister from './pages/auth/CustomerRegister'
import OrganizerLogin   from './pages/auth/OrganizerLogin'
import OrganizerRegister from './pages/auth/OrganizerRegister'
import AdminLogin       from './pages/auth/AdminLogin'
import ForgotPassword   from './pages/auth/ForgotPassword'
import ResetPassword    from './pages/auth/ResetPassword'

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerTickets   from './pages/customer/Tickets'
import CustomerOrders    from './pages/customer/Orders'
import CustomerProfile   from './pages/customer/Profile'

// Organizer pages
import OrganizerDashboard from './pages/organizer/Dashboard'
import OrganizerEvents    from './pages/organizer/Events'
import CreateEvent        from './pages/organizer/CreateEvent'
import EditEvent          from './pages/organizer/EditEvent'
import EventOrders        from './pages/organizer/EventOrders'
import EventAnalytics     from './pages/organizer/EventAnalytics'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers     from './pages/admin/Users'
import AdminEvents    from './pages/admin/Events'
import AdminOrders    from './pages/admin/Orders'
import AdminReports   from './pages/admin/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public (no auth needed) ────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/"        element={<Home />} />
            <Route path="/events"  element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/about"   element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth entry points — inside PublicLayout so they get the public navbar */}
            <Route path="/customer/login"      element={<CustomerLogin />} />
            <Route path="/customer/register"   element={<CustomerRegister />} />
            <Route path="/organizer/login"     element={<OrganizerLogin />} />
            <Route path="/organizer/register"  element={<OrganizerRegister />} />
            <Route path="/admin/login"         element={<AdminLogin />} />
            <Route path="/forgot-password"     element={<ForgotPassword />} />
            <Route path="/reset-password"      element={<ResetPassword />} />
          </Route>

          {/* ── Customer only ──────────────────────────────── */}
          <Route element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/tickets"   element={<CustomerTickets />} />
            <Route path="/customer/orders"    element={<CustomerOrders />} />
            <Route path="/customer/profile"   element={<CustomerProfile />} />
          </Route>

          {/* ── Organizer only ─────────────────────────────── */}
          <Route element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerLayout />
            </ProtectedRoute>
          }>
            <Route path="/organizer/dashboard"           element={<OrganizerDashboard />} />
            <Route path="/organizer/events"              element={<OrganizerEvents />} />
            <Route path="/organizer/events/create"       element={<CreateEvent />} />
            <Route path="/organizer/events/:id/edit"     element={<EditEvent />} />
            <Route path="/organizer/events/:id/orders"   element={<EventOrders />} />
            <Route path="/organizer/events/:id/analytics" element={<EventAnalytics />} />
          </Route>

          {/* ── Admin only ─────────────────────────────────── */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users"     element={<AdminUsers />} />
            <Route path="/admin/events"    element={<AdminEvents />} />
            <Route path="/admin/orders"    element={<AdminOrders />} />
            <Route path="/admin/reports"   element={<AdminReports />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
