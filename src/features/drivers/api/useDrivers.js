import { useQuery } from '@tanstack/react-query'

async function fetchDrivers({ search, sortBy, order, assignmentStatus, page }) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (sortBy) params.set('sortBy', sortBy)
  if (order) params.set('order', order)
  if (assignmentStatus) params.set('assignmentStatus', assignmentStatus)
  if (page) params.set('page', page)
  params.set('limit', '200')

  const res = await fetch(`http://localhost:3001/api/drivers?${params}`, {
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return res.json()
}

export function useDrivers({ search, sortBy, order, assignmentStatus, page, enabled } = {}) {
  return useQuery({
    queryKey: ['drivers', { search, sortBy, order, assignmentStatus, page }],
    queryFn: () => fetchDrivers({ search, sortBy, order, assignmentStatus, page }),
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}
