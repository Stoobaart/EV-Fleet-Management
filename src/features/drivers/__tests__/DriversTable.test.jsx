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

const baseData = { data: baseDrivers, total: 2, page: 1, totalPages: 1 }

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
    useDrivers.mockReturnValue({ data: baseData, isPending: false, refetch: mockRefetch })
  })

  describe('pending state', () => {
    test('passes isPending to DataTable', () => {
      useDrivers.mockReturnValue({ data: { data: [], total: 0, page: 1, totalPages: 1 }, isPending: true, refetch: mockRefetch })
      renderTable()
      expect(screen.getByTestId('table-pending')).toBeTruthy()
    })
  })

  describe('error state', () => {
    beforeEach(() => {
      useDrivers.mockReturnValue({ isPending: false, isError: true, error: new Error('Failed to load drivers'), data: undefined, refetch: mockRefetch })
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

  describe('pagination', () => {
    test('renders pagination controls', () => {
      renderTable()
      expect(screen.getByLabelText('Previous page')).toBeTruthy()
      expect(screen.getByLabelText('Next page')).toBeTruthy()
      expect(screen.getByText('Page 1 of 1')).toBeTruthy()
    })

    test('prev button is disabled on first page', () => {
      renderTable()
      expect(screen.getByLabelText('Previous page').disabled).toBe(true)
    })

    test('next button is disabled when on last page', () => {
      renderTable()
      expect(screen.getByLabelText('Next page').disabled).toBe(true)
    })

    test('next button is enabled when more pages exist', () => {
      useDrivers.mockReturnValue({ data: { data: baseDrivers, total: 400, page: 1, totalPages: 2 }, isPending: false, refetch: mockRefetch })
      renderTable()
      expect(screen.getByLabelText('Next page').disabled).toBe(false)
    })

    test('clicking next updates page param', () => {
      useDrivers.mockReturnValue({ data: { data: baseDrivers, total: 400, page: 1, totalPages: 2 }, isPending: false, refetch: mockRefetch })
      renderTable()
      fireEvent.click(screen.getByLabelText('Next page'))
      expect(useDrivers).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
    })

    test('clicking prev updates page param', () => {
      useDrivers.mockReturnValue({ data: { data: baseDrivers, total: 400, page: 2, totalPages: 2 }, isPending: false, refetch: mockRefetch })
      renderTable('/?page=2')
      fireEvent.click(screen.getByLabelText('Previous page'))
      expect(useDrivers).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })
  })
})
