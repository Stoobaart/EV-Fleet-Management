import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { DataTable } from '../../../shared/components/DataTable/DataTable'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary/ErrorBoundary'
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

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(searchInput, 500)

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedSearch) next.set('search', debouncedSearch); else next.delete('search')
      return next
    })
  }, [debouncedSearch, setSearchParams])

  const search = searchParams.get('search') ?? ''
  const { data, isPending } = useDrivers({ search, sortBy, order })

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

  const drivers = Array.isArray(data)
    ? data.map((d) => ({
        ...d,
        vehicleId: d.vehicleAssignment?.id ?? null,
        vehicle: d.vehicleAssignment
          ? `${d.vehicleAssignment.licensePlate} — ${d.vehicleAssignment.make} ${d.vehicleAssignment.model}`
          : '—',
      }))
    : []

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
        {data?.error ? (
          <p className="drivers-table__error">{data.error}</p>
        ) : (
          <DataTable
            columns={columns}
            data={drivers}
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            isPending={isPending}
          />
        )}
      </ErrorBoundary>
    </div>
  )
}
