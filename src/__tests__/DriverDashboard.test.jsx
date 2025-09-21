import { render, screen } from '@testing-library/react'
import DriverDashboard from '../pages/DriverDashboard'
import { ThemeProvider } from '../contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'

jest.mock('../api/hooks', () => ({
  useVehicles: () => ({ data: [], isLoading: false, isError: false }),
  useTrips: () => ({ data: [], isLoading: false, isError: false }),
  useUpdateVehicleStatus: () => ({ mutate: jest.fn() }),
}))


describe('DriverDashboard', () => {
  test('renders without crashing and shows header', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <DriverDashboard />
        </ThemeProvider>
      </BrowserRouter>
    )
    expect(screen.getByText(/Driver Dashboard/i)).toBeInTheDocument()
  })

  test('shows loading state', () => {
    jest.mocked('../api/hooks').useVehicles.mockReturnValue({ isLoading: true })
    render(
      <BrowserRouter>
        <ThemeProvider>
          <DriverDashboard />
        </ThemeProvider>
      </BrowserRouter>
    )
    expect(screen.getByText(/Loading dashboard data/i)).toBeInTheDocument()
  })
})
