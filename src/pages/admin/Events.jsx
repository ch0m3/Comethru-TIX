import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function AdminEvents() {
  const { token } = useAuth()
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')

  function loadEvents() {
    apiRequest('/admin/events', { token })
      .then(setEvents)
      .catch((err) => setError(err.message))
  }

  useEffect(loadEvents, [token])

  async function handleDecision(eventId, decision) {
    try {
      await apiRequest(`/admin/events/${eventId}/${decision}`, {
        method: 'PUT',
        token,
      })
      loadEvents()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Manage Events</h1>

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="py-2">Title</th>
            <th>Location</th>
            <th>Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-gray-100">
              <td className="py-2">{event.title}</td>
              <td>{event.location}</td>
              <td>{new Date(event.date).toLocaleDateString()}</td>
              <td>{event.status}</td>
              <td className="space-x-3">
                {event.status !== 'approved' && (
                  <button
                    onClick={() => handleDecision(event.id, 'approve')}
                    className="underline"
                  >
                    Approve
                  </button>
                )}
                {event.status !== 'rejected' && (
                  <button
                    onClick={() => handleDecision(event.id, 'reject')}
                    className="underline text-red-600"
                  >
                    Reject
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
