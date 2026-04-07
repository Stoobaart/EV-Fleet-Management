import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchVehicles({ search, sortBy, order, make, year, status }) {
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (sortBy) params.set('sortBy', sortBy)
    if (order) params.set('order', order)
    if (make) params.set('make', make)
    if (year) params.set('year', year)
    if (status) params.set('status', status)

    const res = await fetch(`http://localhost:3001/api/vehicles?${params}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { error: `Request failed with status ${res.status}` }
    return res.json()
  } catch (err) {
    return { error: err.message }
  }
}

export function useVehicles({ search, sortBy, order, make, year, status } = {}) {
  return useQuery({
    queryKey: ['vehicles', { search, sortBy, order, make, year, status }],
    queryFn: () => fetchVehicles({ search, sortBy, order, make, year, status }),
    staleTime: 1000 * 60 * 5,
  })
}

async function fetchVehicleFilters() {
  try {
    const res = await fetch('http://localhost:3001/api/vehicles/filters', {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { error: `Request failed with status ${res.status}` }
    return res.json()
  } catch (err) {
    return { error: err.message }
  }
}

export function useVehicleFilters() {
  return useQuery({
    queryKey: ['vehicles', 'filters'],
    queryFn: fetchVehicleFilters,
    staleTime: 1000 * 60 * 5,
  })
}

async function fetchVehicle(id) {
  try {
    const res = await fetch(`http://localhost:3001/api/vehicles/${id}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.status === 404) return { error: 'This vehicle has not been found' }
    if (!res.ok) return { error: `Request failed with status ${res.status}` }
    return res.json()
  } catch (err) {
    return { error: err.message }
  }
}

export function useVehicle(id) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => fetchVehicle(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}

async function fetchVehicleImage(make, model) {
  try {
    const title = encodeURIComponent(`${make}_${model}`.replace(/\s+/g, '_'))
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const json = await res.json()
    return json?.thumbnail?.source ?? null
  } catch {
    return null
  }
}

export function useVehicleImage(make, model) {
  return useQuery({
    queryKey: ['vehicleImage', make, model],
    queryFn: () => fetchVehicleImage(make, model),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: !!make && !!model,
    retry: false,
  })
}

export function useUpdateVehicleAssignment(vehicleId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (driverId) =>
      fetch(`http://localhost:3001/api/vehicles/${vehicleId}/assignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driverId ?? null }),
        signal: AbortSignal.timeout(5000),
      }).then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        return res.json()
      }),
    onMutate: async (driverId) => {
      await queryClient.cancelQueries({ queryKey: ['vehicles', vehicleId] })
      const previous = queryClient.getQueryData(['vehicles', vehicleId])
      queryClient.setQueryData(['vehicles', vehicleId], (old) => (
        driverId
          ? { ...old, driver: `Driver #${driverId}`, status: 'assigned' }
          : { ...old, driver: 'Unassigned', status: 'unassigned' }
      ))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['vehicles', vehicleId], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
