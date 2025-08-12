import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import { mockStudents, mockVehicles } from '../data/mockData'
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Car, 
  GraduationCap, 
  Shield 
} from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('student')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors } } = useForm()

  const roles = [
    {
      id: 'student',
      name: 'Student',
      icon: GraduationCap,
      description: 'Access vehicle tracking and booking',
      color: 'bg-blue-500'
    },
    {
      id: 'driver',
      name: 'Driver',
      icon: Car,
      description: 'Manage trips and location updates',
      color: 'bg-green-500'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      description: 'System administration and monitoring',
      color: 'bg-purple-500'
    }
  ]

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let user = null
      let token = 'mock-jwt-token-' + Date.now()
      
      // Mock authentication logic
      switch (selectedRole) {
        case 'student':
          // Find student by email or phone
          user = mockStudents.find(s => 
            s.email === data.identifier || s.phone === data.identifier
          )
          if (!user) {
            // Create mock student for demo
            user = {
              id: 's-demo',
              name: data.identifier.includes('@') ? data.identifier.split('@')[0] : 'Demo Student',
              email: data.identifier.includes('@') ? data.identifier : 'demo@sau.ac.in',
              phone: data.identifier.includes('+') ? data.identifier : '+91 98765 43215',
              studentId: 'SAU2023DEMO',
              department: 'Computer Science',
              year: 2,
              role: 'student'
            }
          } else {
            user.role = 'student'
          }
          break
          
        case 'driver':
          // Find driver by phone
          const vehicle = mockVehicles.find(v => v.driver.phone === data.identifier)
          if (vehicle) {
            user = {
              ...vehicle.driver,
              role: 'driver',
              vehicleId: vehicle.id,
              vehicleNumber: vehicle.vehicleNumber
            }
          } else {
            // Create mock driver for demo
            user = {
              id: 'd-demo',
              name: 'Demo Driver',
              phone: data.identifier,
              photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              rating: 4.5,
              totalTrips: 1000,
              isActive: true,
              role: 'driver',
              vehicleId: 'v-demo',
              vehicleNumber: 'SAU-DEMO'
            }
          }
          break
          
        case 'admin':
          // Admin authentication
          if (data.identifier === 'admin@sau.ac.in' || data.identifier === 'admin') {
            user = {
              id: 'admin-1',
              name: 'System Administrator',
              email: 'admin@sau.ac.in',
              phone: '+91 98765 43200',
              role: 'admin'
            }
          } else {
            throw new Error('Invalid admin credentials')
          }
          break
          
        default:
          throw new Error('Invalid role selected')
      }
      
      if (!user) {
        throw new Error('User not found')
      }
      
      login(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      
      // Navigate based on role
      switch (selectedRole) {
        case 'student':
          navigate('/')
          break
        case 'driver':
          navigate('/driver')
          break
        case 'admin':
          navigate('/admin')
          break
      }
      
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlaceholderText = () => {
    switch (selectedRole) {
      case 'student':
        return 'Enter your email (e.g., student@sau.ac.in) or phone number'
      case 'driver':
        return 'Enter your phone number (e.g., +91 98765 43210)'
      case 'admin':
        return 'Enter admin email (e.g., admin@sau.ac.in)'
      default:
        return 'Enter your identifier'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            SAU Transport
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Eco-Friendly Auto Rickshaw Service
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedRole === role.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`p-2 rounded-full ${role.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {role.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedRole === 'student' ? 'Email or Phone' : 
                 selectedRole === 'driver' ? 'Phone Number' : 'Admin Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {selectedRole === 'student' ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  {...register('identifier', { 
                    required: 'This field is required',
                    pattern: selectedRole === 'admin' ? {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    } : undefined
                  })}
                  type={selectedRole === 'admin' ? 'email' : 'text'}
                  placeholder={getPlaceholderText()}
                  className="input-field pl-10"
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type="password"
                  placeholder="Enter your password"
                  className="input-field pl-10"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Student:</strong> student@sau.ac.in / any password</div>
              <div><strong>Driver:</strong> +91 98765 43210 / any password</div>
              <div><strong>Admin:</strong> admin@sau.ac.in / any password</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
