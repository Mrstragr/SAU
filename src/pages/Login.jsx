import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import { mockStudents, mockVehicles } from '../data/mockData'
import {
  Phone,
  Mail,
  Lock,
  Car,
  GraduationCap,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('student')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

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

      if (isLoginMode) {
        // Login logic
        await handleLogin(data)
      } else {
        // Signup logic
        await handleSignup(data)
      }

    } catch (error) {
      toast.error(error.message || 'Operation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (data) => {
    let user = null
    const token = 'mock-jwt-token-' + Date.now()

    // Mock authentication logic
    switch (selectedRole) {
      case 'student': {
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
      }

      case 'driver': {
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
      }

      case 'admin': {
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
      }

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
  }

  const handleSignup = async (data) => {
    // Mock signup logic
    const userId = `${selectedRole.charAt(0)}-${Date.now()}`
    const token = 'mock-jwt-token-' + Date.now()

    let user = null

    switch (selectedRole) {
      case 'student':
        user = {
          id: userId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          studentId: `SAU${new Date().getFullYear()}${userId.slice(-4)}`,
          department: 'Computer Science',
          year: 1,
          role: 'student'
        }
        break

      case 'driver':
        user = {
          id: userId,
          name: data.name,
          phone: data.phone,
          email: data.email,
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          rating: 0,
          totalTrips: 0,
          isActive: false,
          role: 'driver',
          vehicleId: null,
          vehicleNumber: null
        }
        break

      case 'admin':
        throw new Error('Admin signup is not allowed through this interface')

      default:
        throw new Error('Invalid role selected')
    }

    login(user, token)
    toast.success(`Welcome to SAU TRAVEL, ${user.name}! Your account has been created.`)

    // Navigate based on role
    switch (selectedRole) {
      case 'student':
        navigate('/')
        break
      case 'driver':
        navigate('/driver')
        break
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          {/* University and App Logos */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            <img
              src="/sau-logo.png"
              alt="SAU University Logo"
              className="h-12 w-auto"
            />
            <div className="h-8 w-px bg-gray-300"></div>
            <img
              src="/sau-travel-logo.png"
              alt="SAU Travel Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* App Name */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SAU TRAVEL
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Transportation Service
          </p>

          {/* Original Icon */}
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Car className="h-8 w-8 text-white" />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Eco-Friendly Auto Rickshaw Service
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Login/Signup Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(true)
                reset()
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLoginMode
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(false)
                reset()
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isLoginMode
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

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
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedRole === role.id
                  ? 'border-indigo-600 bg-indigo-100 shadow-indigo-300'
                  : 'border-gray-300 hover:border-indigo-400'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-full ${role.color} shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">
                    {role.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {role.description}
                  </div>
                </div>
              </div>
            </button>
                )
              })}
            </div>
          </div>

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      {...register('name', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </>
            )}

            {isLoginMode && (
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
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
                )}
              </div>
            )}

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
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === watch('password') || 'Passwords do not match'
                    })}
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
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
