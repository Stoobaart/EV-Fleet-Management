import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { useDebounce } from '../../../shared/hooks/useDebounce'

export function useVehicleTableParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const sortBy = searchParams.get('sortBy') ?? ''
  const order = searchParams.get('order') ?? 'asc'
  const make = searchParams.get('make') ?? ''
  const year = searchParams.get('year') ?? ''
  const status = searchParams.get('status') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)
  const prevDebouncedSearch = useRef(debouncedSearch)

  useEffect(() => {
    const changed = debouncedSearch !== prevDebouncedSearch.current
    prevDebouncedSearch.current = debouncedSearch
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedSearch) next.set('search', debouncedSearch)
      else next.delete('search')
      if (changed) next.delete('page')
      return next
    })
  }, [debouncedSearch, setSearchParams])

  const search = searchParams.get('search') ?? ''

  function handleFilterChange(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
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
      next.delete('page')
      return next
    })
  }

  function handlePageChange(newPage) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  return { search, sortBy, order, make, year, status, page, searchInput, setSearchInput, handleFilterChange, handleSort, handlePageChange }
}
