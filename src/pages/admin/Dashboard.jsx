import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../context/useAuth'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/admin/reports', { token })
      .then(setReport)
      .catch((err) => setError(err.message))
  }, [token])

  if (error) return <p className="text-red-600">{error}</p>
  if (!report) return <p>Loading...</p>

  const cards = [
    { label: 'Total Users', value: report.total_users },
    { label: 'Total Events', value: report.total_events },
    { label: 'Pending Events', value: report.pending_events },
    { label: 'Total Revenue', value: `$${report.total_revenue.toFixed(2)}` },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="border border-gray-200 rounded p-4">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
