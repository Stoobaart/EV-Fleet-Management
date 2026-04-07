import { render, screen } from '@testing-library/react'
import { DriverAnalyticsCard } from '../components/DriverAnalyticsCard'

describe('DriverAnalyticsCard', () => {
  test('renders total drivers count', () => {
    render(<DriverAnalyticsCard totalDrivers={8} assignedDrivers={5} unassignedDrivers={3} />)
    expect(screen.getByText('8')).toBeTruthy()
  })

  test('renders assigned and unassigned counts', () => {
    render(<DriverAnalyticsCard totalDrivers={8} assignedDrivers={5} unassignedDrivers={3} />)
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  test('renders assigned and unassigned labels', () => {
    render(<DriverAnalyticsCard totalDrivers={8} assignedDrivers={5} unassignedDrivers={3} />)
    expect(screen.getByText('Assigned')).toBeTruthy()
    expect(screen.getByText('Unassigned')).toBeTruthy()
  })

  test('renders total drivers label', () => {
    render(<DriverAnalyticsCard totalDrivers={8} assignedDrivers={5} unassignedDrivers={3} />)
    expect(screen.getByText('Total Drivers')).toBeTruthy()
  })

  test('renders with all zeros', () => {
    render(<DriverAnalyticsCard totalDrivers={0} assignedDrivers={0} unassignedDrivers={0} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(3)
  })
})
