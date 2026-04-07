import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useDebounce } from '../../../shared/hooks/useDebounce'

export function useVehicleTableParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const sortBy = searchParams.get('sortBy') ?? ''
  const order = searchParams.get('order') ?? 'asc'
  const make = searchParams.get('make') ?? ''
  const year = searchParams.get('year') ?? ''
  const status = searchParams.get('status') ?? ''

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedSearch) next.set('search', debouncedSearch)
      else next.delete('search')
      return next
    })
  }, [debouncedSearch, setSearchParams])

  const search = searchParams.get('search') ?? ''

  function handleFilterChange(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  function handleSort(key) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (sortBy === key) {
        next.set('order', order === 'asc' ? 'desc' : 'asc')
      } else {
        next.set('sortBy', key)
        next.set('order', 'asc')
      }
      return next
    })
  }

  return { search, sortBy, order, make, year, status, searchInput, setSearchInput, handleFilterChange, handleSort }
}
