// Small wrapper around fetch() so every part of the ap
// backend the same way, without repeating headers/erro
// everywhere. The base URL comes from an environment v
// never hard coded (see .env.example).

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Makes a request to the backend API.
 *
 * @param {string} path - e.g. "/events" (BASE_URL is a
 * @param {object} options
 * @param {string} options.method - GET, POST, PUT, DEL
 * @param {object} options.body - request body, will be
 * @param {string} options.token - JWT access token, if
 */
export async function apiRequest(path, { method = 'GET'
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // The backend always returns JSON, even for errors, 
  // parse it here and let the caller decide what to do
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.error || 'Something went wrong
    throw new Error(message)
  }

  return data
}
