import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { DataTable } from '../../../shared/components/DataTable/DataTable'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary/ErrorBoundary'
import { Pagination } from '../../../shared/components/Pagination/Pagination'
import { useDrivers } from '../api/useDrivers'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import './DriversTable.scss'

function VehicleCell({ row, navigate }) {
  if (!row.vehicleId) return '—'
  return (
    <button
      className="drivers-table__vehicle-link"
      onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${row.vehicleId}`, { state: { from: 'Drivers' } }) }}
    >
      {row.vehicle}
    </button>
  )
}

const COLUMNS = [
  { key: 'firstName',        label: 'First Name',  sortable: true  },
  { key: 'lastName',         label: 'Last Name',   sortable: true  },
  { key: 'email',            label: 'Email',       sortable: true  },
  { key: 'vehicle',          label: 'Vehicle',     sortable: false, render: null },
  { key: 'assignmentStatus', label: 'Status',      sortable: true  },
]

export function DriversTable() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const sortBy = searchParams.get('sortBy') ?? ''
  const order  = searchParams.get('order')  ?? 'asc'
  const page   = parseInt(searchParams.get('page') ?? '1', 10)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)
  const prevDebouncedSearch = useRef(debouncedSearch)

  useEffect(() => {
    const changed = debouncedSearch !== prevDebouncedSearch.current
    prevDebouncedSearch.current = debouncedSearch
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedSearch) next.set('search', debouncedSearch); else next.delete('search')
      if (changed) next.delete('page')
      return next
    })
  }, [debouncedSearch, setSearchParams])

  const search = searchParams.get('search') ?? ''
  const { data, isPending, isError, error, refetch } = useDrivers({ search, sortBy, order, page })

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

  const rows = Array.isArray(data?.data) ? data.data : []
  const totalPages = data?.totalPages ?? 1

  const drivers = rows.map((d) => ({
    ...d,
    vehicleId: d.vehicleAssignment?.id ?? null,
    vehicle: d.vehicleAssignment
      ? `${d.vehicleAssignment.licensePlate} — ${d.vehicleAssignment.make} ${d.vehicleAssignment.model}`
      : '—',
  }))

  const columns = COLUMNS.map((col) =>
    col.key === 'vehicle'
      ? { ...col, render: (row) => <VehicleCell row={row} navigate={navigate} /> }
      : col
  )

  return (
    <div className="drivers-table">
      <div className="drivers-table__controls">
        <input
          className="drivers-table__search"
          name="search"
          type="search"
          placeholder="Search drivers…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <ErrorBoundary>
        {isError ? (
          <p className="drivers-table__error">
            {error.message}
            <button className="drivers-table__retry" onClick={refetch}>Retry</button>
          </p>
        ) : (
          <>
            <div className="drivers-table__table">
              <DataTable
                columns={columns}
                data={drivers}
                sortBy={sortBy}
                order={order}
                onSort={handleSort}
                isPending={isPending}
              />
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => handlePageChange(page - 1)}
              onNext={() => handlePageChange(page + 1)}
            />
          </>
        )}
      </ErrorBoundary>
    </div>
  )
}
