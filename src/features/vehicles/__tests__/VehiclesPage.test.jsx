import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { VehiclesPage } from '../pages/VehiclesPage'

jest.mock('../components/VehiclesTable', () => ({
  VehiclesTable: () => <div data-testid="vehicles-table" />,
}))

describe('VehiclesPage', () => {
  test('renders the heading', () => {
    render(<MemoryRouter><VehiclesPage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Vehicles' })).toBeTruthy()
  })

  test('renders the VehiclesTable', () => {
    render(<MemoryRouter><VehiclesPage /></MemoryRouter>)
    expect(screen.getByTestId('vehicles-table')).toBeTruthy()
  })
})
