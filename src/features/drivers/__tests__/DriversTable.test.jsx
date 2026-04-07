import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { DriversTable } from '../components/DriversTable'

jest.mock('../api/useDrivers')
jest.mock('../../../shared/components/DataTable/DataTable', () => ({
  DataTable: ({ data, isPending, onSort, sortBy, order }) => (
    <div data-testid="data-table">
      {isPending && <div data-testid="table-pending" />}
      {data.map((row) => (
        <div key={row.id} data-testid="table-row">
          {row.firstName} {row.lastName}
        </div>
      ))}
      <button data-testid="sort-firstName" onClick={() => onSort('firstName')}>
        sort:firstName:{sortBy}:{order}
      </button>
    </div>
  ),
}))

import { useDrivers } from '../api/useDrivers'

const mockNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}))

const mockRefetch = jest.fn()

const baseDrivers = [
  { id: 1, firstName: 'Alice', lastName: 'Brown',  email: 'alice@evfleet.io', assignmentStatus: 'assigned',   vehicleAssignment: { id: 10, licensePlate: 'EV-001', make: 'Tesla',  model: 'Model 3' } },
  { id: 2, firstName: 'Bob',   lastName: 'Carter', email: 'bob@evfleet.io',   assignmentStatus: 'unassigned', vehicleAssignment: null },
]

function renderTable(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <DriversTable />
    </MemoryRouter>
  )
}

describe('DriversTable', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockRefetch.mockReset()
    useDrivers.mockReturnValue({ data: baseDrivers, isPending: false, refetch: mockRefetch })
  })

  describe('pending state', () => {
    test('passes isPending to DataTable', () => {
      useDrivers.mockReturnValue({ data: [], isPending: true, refetch: mockRefetch })
      renderTable()
      expect(screen.getByTestId('table-pending')).toBeTruthy()
    })
  })

  describe('error state', () => {
    beforeEach(() => {
      useDrivers.mockReturnValue({ data: { error: 'Failed to load drivers' }, isPending: false, refetch: mockRefetch })
    })

    test('renders the error message', () => {
      renderTable()
      expect(screen.getByText('Failed to load drivers')).toBeTruthy()
    })

    test('does not render the data table on error', () => {
      renderTable()
      expect(screen.queryByTestId('data-table')).toBeNull()
    })

    test('renders a retry button', () => {
      renderTable()
      expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
    })

    test('calls refetch when retry is clicked', () => {
      renderTable()
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('loaded state', () => {
    test('renders driver rows', () => {
      renderTable()
      expect(screen.getByText('Alice Brown')).toBeTruthy()
      expect(screen.getByText('Bob Carter')).toBeTruthy()
    })

    test('renders the search input', () => {
      renderTable()
      expect(screen.getByPlaceholderText('Search drivers…')).toBeTruthy()
    })
  })
})
