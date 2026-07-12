// AuthProvider keeps track of who is logged in and exposes login/register/
// logout functions to the rest of the app through AuthContext. Any
// component can read the current user with the useAuth() hook (see
// useAuth.js) instead of passing props down through many layers.

import { useState } from 'react'
import { apiRequest } from '../api/client'
import AuthContext from './authContext'

const STORAGE_KEY = 'comethru_auth'

function readSavedSession() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return { user: null, token: null }
  return JSON.parse(saved)
}

export function AuthProvider({ children }) {
  // Read localStorage once, during initial state setup, instead of in a
  // useEffect. This avoids an extra render and a "set state in an effect"
  // lint warning, and means the session is available on the very first render.
  const [{ user, token }, setSession] = useState(readSavedSession)
  const [loading] = useState(false)

  function saveSession(nextUser, nextToken) {
    setSession({ user: nextUser, token: nextToken })
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken })
    )
  }

  function clearSession() {
    setSession({ user: null, token: null })
    localStorage.removeItem(STORAGE_KEY)
  }

  // role must be 'customer', 'organizer', or 'admin'
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

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.role ?? null,
    login,
    registerCustomer,
    registerOrganizer,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
