import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Car,
  GraduationCap
} from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      year: user?.year || '',
      studentId: user?.studentId || '',
    }
  })

  const onSubmit = (data) => {
    updateUser(data)
    setIsEditing(false)
    toast.success('Profile updated successfully!')
  }

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'student':
        return <GraduationCap className="w-6 h-6 text-blue-600" />
      case 'driver':
        return <Car className="w-6 h-6 text-green-600" />
      case 'admin':
        return <Shield className="w-6 h-6 text-purple-600" />
      default:
        return <User className="w-6 h-6 text-gray-600" />
    }
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'student':
        return 'bg-blue-100 text-blue-800'
      case 'driver':
        return 'bg-green-100 text-green-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        <div className="flex items-center space-x-2">
          {getRoleIcon()}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}>
            {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEditing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">Profile Picture</p>
                  {isEditing && (
                    <button
                      type="button"
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      Change Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{user?.name}</span>
                </div>
              )}
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  type="tel"
                  className="input-field"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{user?.phone}</span>
                </div>
              )}
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Student ID (for students only) */}
            {user?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                {isEditing ? (
                  <input
                    {...register('studentId', { required: 'Student ID is required' })}
                    type="text"
                    className="input-field"
                    placeholder="Enter your student ID"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user?.studentId}</span>
                  </div>
                )}
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                )}
              </div>
            )}

            {/* Department (for students only) */}
            {user?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <select
                    {...register('department', { required: 'Department is required' })}
                    className="input-field"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Economics">Economics</option>
                    <option value="International Relations">International Relations</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Sociology">Sociology</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user?.department}</span>
                  </div>
                )}
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>
            )}

            {/* Year (for students only) */}
            {user?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Study
                </label>
                {isEditing ? (
                  <select
                    {...register('year', { required: 'Year is required' })}
                    className="input-field"
                  >
                    <option value="">Select Year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">Year {user?.year}</span>
                  </div>
                )}
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>
            )}

            {/* Vehicle Info (for drivers only) */}
            {user?.role === 'driver' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-600">Vehicle Number:</span>
                    <p className="font-medium text-gray-900">{user?.vehicleNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Vehicle ID:</span>
                    <p className="font-medium text-gray-900">{user?.vehicleId}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button className="btn-secondary text-sm">
              Change
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Notification Settings</h3>
              <p className="text-sm text-gray-600">Manage your notification preferences</p>
            </div>
            <button className="btn-secondary text-sm">
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Privacy Settings</h3>
              <p className="text-sm text-gray-600">Control your privacy and data sharing</p>
            </div>
            <button className="btn-secondary text-sm">
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      {user?.role === 'student' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Reviews Given</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
