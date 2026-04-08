import { useQuery } from '@tanstack/react-query'

async function fetchAnalytics() {
  const res = await fetch('http://localhost:3001/api/analytics')
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return res.json()
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 1000 * 60 * 5,
  })
}
