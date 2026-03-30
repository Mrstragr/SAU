import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = document.documentElement

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'futuristic')

    // Add current theme class
    root.classList.add(theme)

    // Handle dark mode for Tailwind
    if (theme === 'dark' || theme === 'futuristic') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'futuristic'
      return 'light'
    })
  }

  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')
  const setFuturisticTheme = () => setTheme('futuristic')

  const isDark = theme === 'dark' || theme === 'futuristic'
  const isFuturistic = theme === 'futuristic'

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      isFuturistic,
      toggleTheme,
      setLightTheme,
      setDarkTheme,
      setFuturisticTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
