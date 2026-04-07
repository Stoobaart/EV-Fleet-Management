import { useQuery } from '@tanstack/react-query'

async function fetchDrivers({ search, sortBy, order, assignmentStatus }) {
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (sortBy) params.set('sortBy', sortBy)
    if (order) params.set('order', order)
    if (assignmentStatus) params.set('assignmentStatus', assignmentStatus)

    const res = await fetch(`http://localhost:3001/api/drivers?${params}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { error: `Request failed with status ${res.status}` }
    return res.json()
  } catch (err) {
    return { error: err.message }
  }
}

export function useDrivers({ search, sortBy, order, assignmentStatus, enabled } = {}) {
  return useQuery({
    queryKey: ['drivers', { search, sortBy, order, assignmentStatus }],
    queryFn: () => fetchDrivers({ search, sortBy, order, assignmentStatus }),
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}
