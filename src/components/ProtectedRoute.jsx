/**
 * ProtectedRoute
 *
 * Wraps any route that requires authentication.
 * - If the user is not logged in → redirect to the appropriate login page
 * - If the user is logged in but the wrong role → redirect to their own dashboard
 * - If the user matches the required role → render children
 *
 * allowedRoles is an array so a single route can allow multiple roles:
 *   <ProtectedRoute allowedRoles={['organizer', 'admin']}>
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const ROLE_HOME = {
  customer:  '/customer/dashboard',
  organizer: '/organizer/dashboard',
  admin:     '/admin/dashboard',
}

const ROLE_LOGIN = {
  customer:  '/customer/login',
  organizer: '/organizer/login',
  admin:     '/admin/login',
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    // Send to the login page for the first allowed role
    const loginPath = ROLE_LOGIN[allowedRoles[0]] || '/customer/login'
    return <Navigate to={loginPath} replace />
  }

  if (!allowedRoles.includes(role)) {
    // Logged in but wrong role — send to their own home
    return <Navigate to={ROLE_HOME[role] || '/'} replace />
  }

  // Render either the child layout (used in App.jsx) or a direct component
  return children ?? <Outlet />
}
