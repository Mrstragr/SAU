import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  Home,
  MapPin,
  Users,
  Settings,
  LogOut,
  User,
  Car
} from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuthStore()
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary-600">
                  SAU Transport
                </h1>
                <p className="text-xs text-gray-500">Eco-Friendly Auto Service</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
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
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
