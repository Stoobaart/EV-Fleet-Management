import { render, screen, fireEvent } from '@testing-library/react'
import { AssignmentModal } from '../components/AssignmentModal'

jest.mock('../../drivers/api/useDrivers')
jest.mock('../../../shared/components/DataTable/DataTable', () => ({
  DataTable: ({ data, onRowClick, isPending }) => (
    <div data-testid="drivers-table">
      {isPending && <div data-testid="drivers-pending" />}
      {data.map((row) => (
        <div key={row.id} data-testid="driver-row" onClick={() => onRowClick(row)}>
          {row.firstName} {row.lastName}
        </div>
      ))}
    </div>
  ),
}))

import { useDrivers } from '../../drivers/api/useDrivers'

const mockRefetch = jest.fn()

const unassignedDrivers = [
  { id: 10, firstName: 'Alice', lastName: 'Brown',   email: 'alice@evfleet.io' },
  { id: 11, firstName: 'Bob',   lastName: 'Carter',  email: 'bob@evfleet.io' },
]

describe('AssignmentModal', () => {
  describe('assigned vehicle', () => {
    const baseProps = {
      driver: 'Jane Smith',
      onAssign: jest.fn(),
      onUnassign: jest.fn(),
      onClose: jest.fn(),
      isPending: false,
    }

    beforeEach(() => {
      useDrivers.mockReturnValue({ data: [], isPending: false })
      baseProps.onAssign.mockReset()
      baseProps.onUnassign.mockReset()
      baseProps.onClose.mockReset()
    })

    test('renders the modal title', () => {
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByText('Update Assignment')).toBeTruthy()
    })

    test('shows the current driver name', () => {
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByText('Jane Smith')).toBeTruthy()
    })

    test('shows the unassign button', () => {
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByRole('button', { name: 'Unassign driver' })).toBeTruthy()
    })

    test('does not show the drivers table', () => {
      render(<AssignmentModal {...baseProps} />)
      expect(screen.queryByTestId('drivers-table')).toBeNull()
    })

    test('calls onUnassign when unassign button is clicked', () => {
      render(<AssignmentModal {...baseProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Unassign driver' }))
      expect(baseProps.onUnassign).toHaveBeenCalledTimes(1)
    })

    test('calls onClose when cancel is clicked', () => {
      render(<AssignmentModal {...baseProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(baseProps.onClose).toHaveBeenCalledTimes(1)
    })

    test('calls onClose when overlay is clicked', () => {
      render(<AssignmentModal {...baseProps} />)
      fireEvent.click(document.querySelector('.assignment-modal__overlay'))
      expect(baseProps.onClose).toHaveBeenCalledTimes(1)
    })

    test('disables unassign button when isPending is true', () => {
      render(<AssignmentModal {...baseProps} isPending={true} />)
      expect(screen.getByRole('button', { name: 'Unassigning…' }).disabled).toBe(true)
    })
  })

  describe('unassigned vehicle', () => {
    const baseProps = {
      driver: 'Unassigned',
      onAssign: jest.fn(),
      onUnassign: jest.fn(),
      onClose: jest.fn(),
      isPending: false,
    }

    beforeEach(() => {
      useDrivers.mockReturnValue({ data: unassignedDrivers, isPending: false })
      baseProps.onAssign.mockReset()
      baseProps.onClose.mockReset()
    })

    test('shows the drivers table', () => {
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByTestId('drivers-table')).toBeTruthy()
    })

    test('renders available drivers', () => {
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByText('Alice Brown')).toBeTruthy()
      expect(screen.getByText('Bob Carter')).toBeTruthy()
    })

    test('does not show the unassign button', () => {
      render(<AssignmentModal {...baseProps} />)
      expect(screen.queryByRole('button', { name: 'Unassign driver' })).toBeNull()
    })

    test('calls onAssign with driver id when a driver row is clicked', () => {
      render(<AssignmentModal {...baseProps} />)
      fireEvent.click(screen.getAllByTestId('driver-row')[0])
      expect(baseProps.onAssign).toHaveBeenCalledWith(10)
    })

    test('shows empty message when no drivers available', () => {
      useDrivers.mockReturnValue({ data: [], isPending: false })
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByText('No available drivers to assign')).toBeTruthy()
    })

    test('shows error message when drivers fetch fails', () => {
      useDrivers.mockReturnValue({ data: { error: 'Failed to load drivers' }, isPending: false, refetch: mockRefetch })
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByText('Failed to load drivers')).toBeTruthy()
    })

    test('renders a retry button when drivers fetch fails', () => {
      useDrivers.mockReturnValue({ data: { error: 'Failed to load drivers' }, isPending: false, refetch: mockRefetch })
      render(<AssignmentModal {...baseProps} />)
      expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
    })

    test('calls refetch when retry is clicked', () => {
      mockRefetch.mockReset()
      useDrivers.mockReturnValue({ data: { error: 'Failed to load drivers' }, isPending: false, refetch: mockRefetch })
      render(<AssignmentModal {...baseProps} />)
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })
})
