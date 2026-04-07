import { render, screen } from '@testing-library/react'
import { VehicleAnalyticsCard } from '../components/VehicleAnalyticsCard'

describe('VehicleAnalyticsCard', () => {
  test('renders total vehicles count', () => {
    render(<VehicleAnalyticsCard totalVehicles={10} assignedVehicles={7} unassignedVehicles={3} />)
    expect(screen.getByText('10')).toBeTruthy()
  })

  test('renders assigned and unassigned counts', () => {
    render(<VehicleAnalyticsCard totalVehicles={10} assignedVehicles={7} unassignedVehicles={3} />)
    expect(screen.getByText('7')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  test('renders assigned and unassigned labels', () => {
    render(<VehicleAnalyticsCard totalVehicles={10} assignedVehicles={7} unassignedVehicles={3} />)
    expect(screen.getByText('Assigned')).toBeTruthy()
    expect(screen.getByText('Unassigned')).toBeTruthy()
  })

  test('renders total vehicles label', () => {
    render(<VehicleAnalyticsCard totalVehicles={10} assignedVehicles={7} unassignedVehicles={3} />)
    expect(screen.getByText('Total Vehicles')).toBeTruthy()
  })

  test('renders with all zeros', () => {
    render(<VehicleAnalyticsCard totalVehicles={0} assignedVehicles={0} unassignedVehicles={0} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(3)
  })
})
