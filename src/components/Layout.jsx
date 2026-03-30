import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '../contexts/ThemeContext'
import { useNotification } from '../contexts/NotificationContext'
import {
  Home,
  MapPin,
  Users,
  Settings,
  LogOut,
  User,
  Car,
  Sun,
  Moon,
  Zap,
  Bell
} from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme, isFuturistic } = useTheme()
  const { notifications } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getNavigationItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { name: 'Dashboard', icon: Home, path: '/' },
          { name: 'Vehicles', icon: Car, path: '/vehicles' },
          { name: 'Profile', icon: User, path: '/profile' },
        ]
      case 'driver':
        return [
          { name: 'Driver Dashboard', icon: Home, path: '/driver' },
          { name: 'My Trips', icon: MapPin, path: '/driver/trips' },
          { name: 'Profile', icon: User, path: '/profile' },
        ]
      case 'admin':
        return [
          { name: 'Admin Dashboard', icon: Home, path: '/admin' },
          { name: 'Vehicles', icon: Car, path: '/admin/vehicles' },
          { name: 'Drivers', icon: Users, path: '/admin/drivers' },
          { name: 'Students', icon: Users, path: '/admin/students' },
          { name: 'Reports', icon: Settings, path: '/admin/reports' },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      case 'futuristic':
        return Zap
      default:
        return Sun
    }
  }

  const ThemeIcon = getThemeIcon()

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark-900 ${isFuturistic ? 'futuristic' : ''}`}>
      {/* Header */}
      <header className={`card-glass shadow-glass border-b border-white/20 dark:border-dark-700/30 ${isFuturistic ? 'animate-pulse-slow' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className={`text-xl font-bold ${isFuturistic ? 'glow-text' : 'text-primary-600 dark:text-neon-blue'}`}>
                  SAU Transport
                </h1>
                <p className="text-xs text-gray-500 dark:text-dark-400">Eco-Friendly Auto Service</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${isFuturistic ? 'btn-futuristic' : 'bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700'}`}
                title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'futuristic' : 'light'} theme`}
              >
                <ThemeIcon className={`w-5 h-5 ${isFuturistic ? 'text-white' : 'text-gray-600 dark:text-dark-300'}`} />
              </button>

              <button
                className={`p-2 rounded-lg transition-all duration-300 relative ${isFuturistic ? 'btn-futuristic' : 'bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700'}`}
                title="Notifications"
              >
                <Bell className={`w-5 h-5 ${isFuturistic ? 'text-white' : 'text-gray-600 dark:text-dark-300'}`} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-dark-300">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${isFuturistic ? 'bg-gradient-neon text-white' : 'bg-primary-100 dark:bg-dark-700 text-primary-800 dark:text-neon-blue'}`}>
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 dark:text-dark-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`w-64 card-glass shadow-glass min-h-screen ${isFuturistic ? 'animate-pulse-slow' : ''}`}>
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${isActive
                      ? isFuturistic
                        ? 'bg-gradient-neon text-white shadow-neon'
                        : 'bg-primary-100 dark:bg-dark-700 text-primary-700 dark:text-neon-blue'
                      : isFuturistic
                        ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                        : 'text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-dark-100'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isFuturistic && isActive ? 'animate-float' : ''}`} />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-transparent">
          <div className={`max-w-7xl mx-auto ${isFuturistic ? 'floating' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
