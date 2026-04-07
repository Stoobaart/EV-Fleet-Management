import { useNavigate } from "react-router";
import { DataTable } from "../../../shared/components/DataTable/DataTable";
import { ErrorBoundary } from "../../../shared/components/ErrorBoundary/ErrorBoundary";
import { useVehicles, useVehicleFilters } from "../api/useVehicles";
import { useVehicleTableParams } from "../hooks/useVehicleTableParams";
import { MAKE_DOMAINS } from "../../../shared/data/makeDomains";
import "./VehiclesTable.scss";

const COLUMNS = [
  {
    key: 'makeIcon',
    label: '',
    sortable: false,
    width: 52,
    render: (row) => {
      const domain = MAKE_DOMAINS[row.make]
      if (!domain) return null
      return (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={row.make}
          className="vehicles-table__make-icon"
        />
      )
    },
  },
  { key: "licensePlate", label: "Plate", sortable: false },
  { key: "make", label: "Make", sortable: true },
  { key: "model", label: "Model", sortable: true },
  { key: "year", label: "Year", sortable: true },
  { key: "driver", label: "Driver", sortable: true },
  { key: "colour", label: "Colour", sortable: true },
  { key: "range", label: "Range (mi)", sortable: true },
];

export function VehiclesTable() {
  const navigate = useNavigate();
  const { search, sortBy, order, make, year, status, searchInput, setSearchInput, handleFilterChange, handleSort } = useVehicleTableParams();
  const { data, isPending } = useVehicles({ search, sortBy, order, make, year, status });
  const { data: filters } = useVehicleFilters();

  const vehicles = Array.isArray(data) ? data : [];

  return (
    <div className="vehicles-table">
      <div className="vehicles-table__controls">
        <input
          className="vehicles-table__search"
          name="search"
          type="search"
          placeholder="Search vehicles…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="vehicles-table__filter"
          value={make}
          onChange={(e) => handleFilterChange("make", e.target.value)}
        >
          <option value="">All makes</option>
          {filters?.makes?.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          className="vehicles-table__filter"
          value={year}
          onChange={(e) => handleFilterChange("year", e.target.value)}
        >
          <option value="">All years</option>
          {filters?.years?.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className="vehicles-table__filter"
          value={status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {filters?.statuses?.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <ErrorBoundary>
        {data?.error ? (
          <p className="vehicles-table__error">{data.error}</p>
        ) : (
          <DataTable
            columns={COLUMNS}
            data={vehicles}
            sortBy={sortBy}
            order={order}
            onSort={handleSort}
            onRowClick={(row) => navigate(`/vehicles/${row.id}`, { state: { from: 'Vehicles' } })}
            isPending={isPending}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}
