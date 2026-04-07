import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { VehiclesTable } from '../components/VehiclesTable'

jest.mock('../api/useVehicles')
jest.mock('../../../shared/components/DataTable/DataTable', () => ({
  DataTable: ({ data, isPending, onSort, onRowClick, sortBy, order }) => (
    <div data-testid="data-table">
      {isPending && <div data-testid="table-pending" />}
      {data.map((row) => (
        <div key={row.id} data-testid="table-row" onClick={() => onRowClick(row)}>
          {row.make} {row.model}
        </div>
      ))}
      <button data-testid="sort-make" onClick={() => onSort('make')}>
        sort:make:{sortBy}:{order}
      </button>
    </div>
  ),
}))

import { useVehicles, useVehicleFilters } from '../api/useVehicles'

const mockNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}))

const baseVehicles = [
  { id: 1, make: 'Tesla', model: 'Model 3', licensePlate: 'EV-001', year: 2023, driver: 'Jane Smith', colour: 'White', range: 358, status: 'assigned' },
  { id: 2, make: 'Rivian', model: 'R1T',    licensePlate: 'EV-002', year: 2022, driver: 'Unassigned', colour: 'Black', range: 314, status: 'unassigned' },
]

const baseFilters = { makes: ['Tesla', 'Rivian'], years: [2022, 2023], statuses: ['assigned', 'unassigned'] }

function renderTable(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <VehiclesTable />
    </MemoryRouter>
  )
}

describe('VehiclesTable', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    useVehicles.mockReturnValue({ data: baseVehicles, isPending: false })
    useVehicleFilters.mockReturnValue({ data: baseFilters })
  })

  describe('pending state', () => {
    test('passes isPending to DataTable', () => {
      useVehicles.mockReturnValue({ data: [], isPending: true })
      renderTable()
      expect(screen.getByTestId('table-pending')).toBeTruthy()
    })
  })

  describe('error state', () => {
    test('renders the error message', () => {
      useVehicles.mockReturnValue({ data: { error: 'Server error' }, isPending: false })
      renderTable()
      expect(screen.getByText('Server error')).toBeTruthy()
    })

    test('does not render the data table on error', () => {
      useVehicles.mockReturnValue({ data: { error: 'Server error' }, isPending: false })
      renderTable()
      expect(screen.queryByTestId('data-table')).toBeNull()
    })
  })

  describe('loaded state', () => {
    test('renders vehicle rows', () => {
      renderTable()
      expect(screen.getByText('Tesla Model 3')).toBeTruthy()
      expect(screen.getByText('Rivian R1T')).toBeTruthy()
    })

    test('renders filter selects with options from filters data', () => {
      renderTable()
      expect(screen.getByDisplayValue('All makes')).toBeTruthy()
      expect(screen.getByDisplayValue('All years')).toBeTruthy()
      expect(screen.getByDisplayValue('All statuses')).toBeTruthy()
    })

    test('renders make filter options', () => {
      renderTable()
      expect(screen.getByRole('option', { name: 'Tesla' })).toBeTruthy()
      expect(screen.getByRole('option', { name: 'Rivian' })).toBeTruthy()
    })

    test('renders search input', () => {
      renderTable()
      expect(screen.getByPlaceholderText('Search vehicles…')).toBeTruthy()
    })
  })

  describe('row click', () => {
    test('navigates to vehicle detail on row click', () => {
      renderTable()
      fireEvent.click(screen.getAllByTestId('table-row')[0])
      expect(mockNavigate).toHaveBeenCalledWith('/vehicles/1', { state: { from: 'Vehicles' } })
    })
  })

  describe('sorting', () => {
    test('updates sort params when sort is triggered', () => {
      renderTable()
      fireEvent.click(screen.getByTestId('sort-make'))
      expect(useVehicles).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: 'make', order: 'asc' })
      )
    })

    test('toggles order when sorting by the same column', () => {
      renderTable('/?sortBy=make&order=asc')
      fireEvent.click(screen.getByTestId('sort-make'))
      expect(useVehicles).toHaveBeenLastCalledWith(
        expect.objectContaining({ sortBy: 'make', order: 'desc' })
      )
    })
  })

  describe('filters', () => {
    test('updates make filter param on select change', () => {
      renderTable()
      fireEvent.change(screen.getByDisplayValue('All makes'), { target: { value: 'Tesla' } })
      expect(useVehicles).toHaveBeenLastCalledWith(
        expect.objectContaining({ make: 'Tesla' })
      )
    })

    test('updates year filter param on select change', () => {
      renderTable()
      fireEvent.change(screen.getByDisplayValue('All years'), { target: { value: '2023' } })
      expect(useVehicles).toHaveBeenLastCalledWith(
        expect.objectContaining({ year: '2023' })
      )
    })

    test('updates status filter param on select change', () => {
      renderTable()
      fireEvent.change(screen.getByDisplayValue('All statuses'), { target: { value: 'assigned' } })
      expect(useVehicles).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'assigned' })
      )
    })
  })
})
