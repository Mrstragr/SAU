import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import { useRegister, useLogin } from '../api/hooks'
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
import { useUsersStore } from '../stores/usersStore'

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('student')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const loginMutation = useLogin()
  const { findUserByEmailOrPhone } = useUsersStore()

  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm()

  const getPlaceholderText = () => {
    switch (selectedRole) {
      case 'student':
        return 'Enter your email or phone'
      case 'driver':
        return 'Enter your phone number'
      case 'admin':
        return 'Enter admin email'
      default:
        return 'Enter your identifier'
    }
  }

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
      if (isLoginMode) {
        // Login logic
        const result = await loginMutation.mutateAsync({
          identifier: data.identifier,
          password: data.password
        })
        login(result.user, result.accessToken)
        toast.success(`Welcome back, ${result.user.name}!`)

        // Navigate based on role
        switch (result.user.role) {
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
      } else {
        // Signup logic
        const signupData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: selectedRole,
          ...(selectedRole === 'student' && {
            studentId: data.studentId,
            department: data.department,
            year: parseInt(data.year)
          })
        }

        const result = await registerMutation.mutateAsync(signupData)
        login(result.user, result.accessToken)
        toast.success(`Welcome to SAU TRAVEL, ${result.user.name}! Your account has been created.`)

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
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Operation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
          src="/videos/sau.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 z-10" />
      </div>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            {/* University and App Logos */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              <img
                src="/src/assets/sau-logo.png"
                alt="SAU University Logo"
                className="h-12 w-auto"
              />
              <div className="h-8 w-px bg-gray-300"></div>
              <img
                src="/sau-travel-logo.jpg"
                alt="SAU Travel Logo"
                className="h-16 w-auto"
              />
            </div>

            {/* App Name */}
<div className="flex flex-col items-center mb-4">
                <img 
                  src="/images/logo5.png" 
                  alt="SAU Logo" 
                  className="h-20 w-auto mb-3 drop-shadow-2xl"
                />
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  SAU TRAVEL
                </h1>
              </div>
            <p className="text-lg text-white/90 mb-4 drop-shadow-md">
              Transportation Service
            </p>

            {/* Original Icon */}
            <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center drop-shadow-2xl">
              <Car className="h-8 w-8 text-white" />
            </div>
            <p className="mt-2 text-sm text-white/80 drop-shadow-md">
              Eco-Friendly Auto Rickshaw Service
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
            {/* Login/Signup Tabs */}
            <div className="flex rounded-xl bg-gray-100/80 p-1 mb-6">
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

                  {selectedRole === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student ID
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GraduationCap className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            {...register('studentId', {
                              required: 'Student ID is required for students'
                            })}
                            type="text"
                            placeholder="Enter your student ID"
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        {errors.studentId && (
                          <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <input
                            {...register('department', {
                              required: 'Department is required for students'
                            })}
                            type="text"
                            placeholder="Enter your department"
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        {errors.department && (
                          <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <select
                            {...register('year', {
                              required: 'Year is required for students'
                            })}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          >
                            <option value="">Select year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                          </select>
                        </div>
                        {errors.year && (
                          <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                        )}
                      </div>
                    </>
                  )}
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
                    type={showPassword ? 'text' : 'password'}
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
                        validate: (value) => value === getValues('password') || 'Passwords do not match'
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
                disabled={isLoading || registerMutation.isPending || loginMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading || registerMutation.isPending || loginMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLoginMode ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLoginMode ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login

