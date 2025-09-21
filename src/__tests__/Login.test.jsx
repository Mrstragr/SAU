import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../pages/Login'
import { ThemeProvider } from '../contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'

describe('Login Page', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Login />
        </ThemeProvider>
      </BrowserRouter>
    )
  })

  test('renders login and signup tabs', () => {
    expect(screen.getByText(/Login/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument()
  })

  test('toggles password visibility', () => {
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i)
    const toggleButton = screen.getByRole('button', { hidden: true })

    expect(passwordInput).toHaveAttribute('type', 'password')
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
