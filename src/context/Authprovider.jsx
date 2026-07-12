/**
 * AuthProvider
 *
 * Persists the session in localStorage so a page refresh keeps the user
 * logged in. The JWT token and user object are both stored together under
 * one key. On mount, the saved session is read synchronously so there is
 * no flash of "not logged in" on first render.
 *
 * role is read directly from user.role (set by the backend on every
 * login / register response) — the role check happens in ProtectedRoute.
 */

import { useState } from 'react'
import { apiRequest } from '../api/client'
import AuthContext from './authContext'

const STORAGE_KEY = 'comethru_auth'

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { user: null, token: null }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setSession] = useState(readSession)

  function saveSession(user, token) {
    setSession({ user, token })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
  }

  function clearSession() {
    setSession({ user: null, token: null })
    localStorage.removeItem(STORAGE_KEY)
  }

  // role = 'customer' | 'organizer' | 'admin'
  async function login(role, { email, password }) {
    const data = await apiRequest(`/auth/${role}/login`, {
      method: 'POST',
      body: { email, password },
    })
    saveSession(data.user, data.access_token)
    return data.user
  }

  async function registerCustomer({ name, email, password }) {
    return apiRequest('/auth/customer/register', {
      method: 'POST',
      body: { name, email, password },
    })
  }

  async function registerOrganizer({ name, email, password, businessName }) {
    return apiRequest('/auth/organizer/register', {
      method: 'POST',
      body: { name, email, password, business_name: businessName },
    })
  }

  function logout() {
    clearSession()
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
      login,
      registerCustomer,
      registerOrganizer,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
