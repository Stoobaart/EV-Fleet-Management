import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import VehicleDetailPage from '../pages/VehicleDetailPage'

jest.mock('../api/useVehicles')
jest.mock('../components/AssignmentModal', () => ({
  AssignmentModal: ({ onClose, onUnassign, driver }) => (
    <div data-testid="assignment-modal">
      <span data-testid="modal-driver">{driver}</span>
      <button onClick={onClose}>Close modal</button>
      <button onClick={onUnassign}>Unassign</button>
    </div>
  ),
}))

import { useVehicle, useVehicleImage, useUpdateVehicleAssignment } from '../api/useVehicles'

const mockNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}))

const mockMutate = jest.fn()
const mockRefetch = jest.fn()

const baseVehicle = {
  id: 1,
  make: 'Tesla',
  model: 'Model 3',
  year: 2023,
  licensePlate: 'EV-001',
  colour: 'White',
  range: 358,
  status: 'assigned',
  driver: 'Jane Smith',
}

function renderDetailPage(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/vehicles/${id}`]}>
      <Routes>
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('VehicleDetailPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockMutate.mockReset()
    mockRefetch.mockReset()
    useVehicleImage.mockReturnValue({ data: null })
    useUpdateVehicleAssignment.mockReturnValue({ mutate: mockMutate, isPending: false, isError: false, error: null })
  })

  describe('pending state', () => {
    test('renders a loading spinner', () => {
      useVehicle.mockReturnValue({ data: undefined, isPending: true })
      renderDetailPage()
      expect(document.querySelector('[aria-label="Loading"]')).toBeTruthy()
    })

    test('renders back button', () => {
      useVehicle.mockReturnValue({ data: undefined, isPending: true })
      renderDetailPage()
      expect(screen.getByRole('button', { name: /Back to/ })).toBeTruthy()
    })
  })

  describe('error state', () => {
    beforeEach(() => {
      useVehicle.mockReturnValue({ isPending: false, isError: true, error: new Error('This vehicle has not been found'), data: undefined, refetch: mockRefetch })
    })

    test('renders the error message', () => {
      renderDetailPage()
      expect(screen.getByText('This vehicle has not been found')).toBeTruthy()
    })

    test('does not render vehicle details', () => {
      renderDetailPage()
      expect(screen.queryByText('Tesla')).toBeNull()
    })

    test('renders a retry button', () => {
      renderDetailPage()
      expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
    })

    test('calls refetch when retry is clicked', () => {
      renderDetailPage()
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('loaded state', () => {
    beforeEach(() => {
      useVehicle.mockReturnValue({ data: baseVehicle, isPending: false })
    })

    test('renders the vehicle title', () => {
      renderDetailPage()
      expect(screen.getByText('2023 Tesla Model 3')).toBeTruthy()
    })

    test('renders the licence plate', () => {
      renderDetailPage()
      expect(screen.getByText('EV-001')).toBeTruthy()
    })

    test('renders the driver name', () => {
      renderDetailPage()
      expect(screen.getByText('Jane Smith')).toBeTruthy()
    })

    test('renders the status', () => {
      renderDetailPage()
      expect(screen.getByText('Assigned')).toBeTruthy()
    })

    test('renders the update assignment button', () => {
      renderDetailPage()
      expect(screen.getByRole('button', { name: 'Update assignment' })).toBeTruthy()
    })

    test('modal is not shown initially', () => {
      renderDetailPage()
      expect(screen.queryByTestId('assignment-modal')).toBeNull()
    })

    test('back button calls navigate(-1)', () => {
      renderDetailPage()
      fireEvent.click(screen.getByRole('button', { name: /Back to/ }))
      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('mutation error state', () => {
    beforeEach(() => {
      useVehicle.mockReturnValue({ data: baseVehicle, isPending: false })
      useUpdateVehicleAssignment.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: true,
        error: { message: 'Assignment update failed' },
      })
    })

    test('renders the mutation error message', () => {
      renderDetailPage()
      expect(screen.getByText('Assignment update failed')).toBeTruthy()
    })

    test('still renders vehicle details alongside the error', () => {
      renderDetailPage()
      expect(screen.getByText('2023 Tesla Model 3')).toBeTruthy()
    })
  })

  describe('assignment modal', () => {
    beforeEach(() => {
      useVehicle.mockReturnValue({ data: baseVehicle, isPending: false })
    })

    test('opens modal when update assignment is clicked', () => {
      renderDetailPage()
      fireEvent.click(screen.getByRole('button', { name: 'Update assignment' }))
      expect(screen.getByTestId('assignment-modal')).toBeTruthy()
    })

    test('passes the current driver to the modal', () => {
      renderDetailPage()
      fireEvent.click(screen.getByRole('button', { name: 'Update assignment' }))
      expect(screen.getByTestId('modal-driver').textContent).toBe('Jane Smith')
    })

    test('closes modal when onClose is triggered', () => {
      renderDetailPage()
      fireEvent.click(screen.getByRole('button', { name: 'Update assignment' }))
      fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
      expect(screen.queryByTestId('assignment-modal')).toBeNull()
    })

    test('calls mutate and closes modal on unassign', () => {
      renderDetailPage()
      fireEvent.click(screen.getByRole('button', { name: 'Update assignment' }))
      fireEvent.click(screen.getByRole('button', { name: 'Unassign' }))
      expect(mockMutate).toHaveBeenCalledWith(null)
      expect(screen.queryByTestId('assignment-modal')).toBeNull()
    })
  })
})
