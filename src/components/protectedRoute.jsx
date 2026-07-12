// Wrap any route element with <ProtectedRoute allowedRoles={['customer']}>
// to make sure only logged-in users with the right role can see it.
// Anyone else is redirected instead of just having the link hidden, which
// satisfies the PRD requirement that route guards actually redirect.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    // Avoid a flash of "redirecting" while we check localStorage
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in, but with the wrong role - send them to their own dashboard
    return <Navigate to={`/${role}/dashboard`} replace />
  }

  return children
}
