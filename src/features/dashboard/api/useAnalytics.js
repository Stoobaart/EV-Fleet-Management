import { useQuery } from '@tanstack/react-query'

async function fetchAnalytics() {
  try {
    const res = await fetch('http://localhost:3001/api/analytics')
    if (!res.ok) return { error: `Request failed with status ${res.status}` }
    return res.json()
  } catch (err) {
    return { error: err.message }
  }
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 1000 * 60 * 5,
  })
}
