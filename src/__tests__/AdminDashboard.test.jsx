import { render, screen } from '@testing-library/react'
import AdminDashboard from '../pages/AdminDashboard'
import { ThemeProvider } from '../contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'

jest.mock('../api/hooks', () => ({
  useVehicles: () => ({ data: [], isLoading: false, isError: false }),
  useStudents: () => ({ data: [], isLoading: false, isError: false }),
  useTrips: () => ({ data: [], isLoading: false, isError: false }),
}))

describe('AdminDashboard', () => {
  test('renders without crashing and shows header', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AdminDashboard />
        </ThemeProvider>
      </BrowserRouter>
    )
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument()
  })

  test('shows loading state', () => {
    jest.mocked('../api/hooks').useVehicles.mockReturnValue({ isLoading: true })
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AdminDashboard />
        </ThemeProvider>
      </BrowserRouter>
    )
    expect(screen.getByText(/Loading dashboard data/i)).toBeInTheDocument()
  })
})
