import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardPage } from '../pages/DashboardPage'
import { useAnalytics } from '../api/useAnalytics'

jest.mock('../api/useAnalytics')

const mockRefetch = jest.fn()

describe('DashboardPage', () => {
  beforeEach(() => {
    mockRefetch.mockReset()
  })
  describe('pending state', () => {
    beforeEach(() => {
      useAnalytics.mockReturnValue({ isPending: true, data: undefined })
    })

    test('renders the heading', () => {
      render(<DashboardPage />)
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy()
    })

    test('renders two skeleton cards', () => {
      render(<DashboardPage />)
      const skeletons = document.querySelectorAll('.dashboard__card-skeleton')
      expect(skeletons.length).toBe(2)
    })

    test('does not render analytics cards', () => {
      render(<DashboardPage />)
      expect(screen.queryByText('Total Vehicles')).toBeNull()
      expect(screen.queryByText('Total Drivers')).toBeNull()
    })
  })

  describe('error state', () => {
    beforeEach(() => {
      useAnalytics.mockReturnValue({ isPending: false, isError: true, error: new Error('Failed to load'), data: undefined, refetch: mockRefetch })
    })

    test('renders the heading', () => {
      render(<DashboardPage />)
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy()
    })

    test('renders the error message', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Failed to load')).toBeTruthy()
    })

    test('does not render analytics cards', () => {
      render(<DashboardPage />)
      expect(screen.queryByText('Total Vehicles')).toBeNull()
      expect(screen.queryByText('Total Drivers')).toBeNull()
    })

    test('renders a retry button', () => {
      render(<DashboardPage />)
      expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
    })

    test('calls refetch when retry is clicked', () => {
      render(<DashboardPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('loaded state', () => {
    beforeEach(() => {
      useAnalytics.mockReturnValue({
        isPending: false,
        data: {
          totalVehicles: 10,
          assignedVehicles: 7,
          unassignedVehicles: 3,
          totalDrivers: 8,
          assignedDrivers: 5,
          unassignedDrivers: 3,
        },
      })
    })

    test('renders the heading', () => {
      render(<DashboardPage />)
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy()
    })

    test('renders VehicleAnalyticsCard with correct data', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Total Vehicles')).toBeTruthy()
      expect(screen.getByText('10')).toBeTruthy()
    })

    test('renders DriverAnalyticsCard with correct data', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Total Drivers')).toBeTruthy()
      expect(screen.getByText('8')).toBeTruthy()
    })

    test('renders both cards together', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Total Vehicles')).toBeTruthy()
      expect(screen.getByText('Total Drivers')).toBeTruthy()
    })

    test('does not render skeletons', () => {
      render(<DashboardPage />)
      const skeletons = document.querySelectorAll('.dashboard__card-skeleton')
      expect(skeletons.length).toBe(0)
    })
  })
})
