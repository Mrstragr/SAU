import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../stores/authStore'
import { useVehicles, useAddTrip } from '../api/hooks'
import {
  Car,
  MapPin,
  Phone,
  Clock,
  Users,
  Battery,
  Star,
  Navigation,
  Calendar,
  TrendingUp,
  AlertCircle,
  Plus,
  X,
  Clock as ClockIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import MapComponent from '../components/MapComponent'




const StudentDashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [selectedGate, setSelectedGate] = useState('')
  const vehiclesQuery = useVehicles(selectedGate)
  const addTripMutation = useAddTrip()
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showMap, setShowMap] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      startLocation: 'Main Gate, SAU Campus',
      endLocation: 'Main Road (2km away)',
      startTime: new Date().toISOString().slice(0, 16) // Current time
    }
  })

  // Seed local state from API
  useEffect(() => {
    if (vehiclesQuery.data) {
      setVehicles(vehiclesQuery.data)
    }
  }, [vehiclesQuery.data])

  // Update vehicle status every 30 seconds (simulate real-time updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        lastUpdated: new Date().toISOString(),
        // Simulate some status changes
        currentPassengers: Math.floor(Math.random() * 4),
        batteryLevel: Math.max(20, vehicle.batteryLevel - Math.random() * 2)
      })))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const activeVehicles = vehicles.filter(v => v.status !== 'offline')
  const waitingVehicles = vehicles.filter(v => v.status === 'waiting')
  const totalVehicles = vehicles.length

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowMap(true)
  }

  const handleCallDriver = (phone) => {
    toast.success(`Calling ${phone}...`)
    // In a real app, this would initiate a phone call
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-green-100 text-green-800'
      case 'confirm':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting':
        return '🟢'
      case 'confirm':
        return '🟡'
      case 'offline':
        return '⚫'
      default:
        return '⚪'
    }
  }

  const initialPosition = [28.6139, 77.2090]; // Centered on campus

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100 glow-text">Student Dashboard</h1>
          <p className="text-gray-600 dark:text-dark-400">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-dark-500">Current Time</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="btn-primary px-4 py-2 text-sm font-medium rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Book a Trip
          </button>
        </div>
      </div>

      {/* Gate Filter */}
      <div className="card">
        <label htmlFor="gate-filter" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Filter by Gate</label>
        <select 
          id="gate-filter"
          value={selectedGate} 
          onChange={(e) => setSelectedGate(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-700 dark:text-dark-100"
        >
          <option value="">All Gates</option>
          <option value="GATE1">Gate 1</option>
          <option value="GATE2">Gate 2</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl">
              <Car className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-400">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-dark-100">{totalVehicles}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 rounded-xl">
              <Navigation className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-400">Active Now</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-dark-100">{activeVehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 rounded-xl">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-400">Waiting</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-dark-100">{waitingVehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-400">Avg Wait Time</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-dark-100">5 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Service Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-dark-400"><strong className="text-gray-900 dark:text-dark-200">Route:</strong> Campus Main Gate → Main Road (2km)</p>
            <p className="text-gray-600 dark:text-dark-400"><strong className="text-gray-900 dark:text-dark-200">Service Hours:</strong> 6:00 AM - 10:00 PM</p>
            <p className="text-gray-600 dark:text-dark-400"><strong className="text-gray-900 dark:text-dark-200">Capacity:</strong> 4 students per vehicle</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-dark-400"><strong className="text-gray-900 dark:text-dark-200">Cost:</strong> Free for students</p>
            <p className="text-gray-600 dark:text-dark-400"><strong className="text-gray-900 dark:text-dark-200">Frequency:</strong> Every 10-15 minutes</p>
            <p className="text-green-600 dark:text-green-400 font-semibold"><strong>Eco-Friendly:</strong> Battery-powered vehicles</p>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Recently Vacant Vehicles</h3>
          <p className="text-sm text-gray-600 dark:text-dark-400">Showing vehicles ready for your next trip</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="btn-secondary text-sm hover:scale-105 transition-transform"
            >
              {showMap ? 'List View' : 'Map View'}
            </button>
          </div>
        </div>

        {showMap ? (
          <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
            <MapComponent
              vehicles={waitingVehicles}
              height="100%"
              onVehicleSelect={(vehicle) => {
                setSelectedVehicle(vehicle);
                toast.success(`Vehicle ${vehicle.vehicleNumber} selected!`);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle)}
                className="card cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-dark-100 text-lg">{vehicle.vehicleNumber}</h4>
                    <p className="text-sm text-gray-600 dark:text-dark-400">{vehicle.driver.name}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {getStatusIcon(vehicle.status)} {vehicle.status}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Location:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-medium">{vehicle.currentLocation.address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Available Seats:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {vehicle.capacity - vehicle.currentPassengers} seats available
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Battery:</span>
                    <div className="flex items-center space-x-2">
                      <Battery className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-gray-900 dark:text-dark-100 font-medium">{vehicle.batteryLevel}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Driver Rating:</span>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-gray-900 dark:text-dark-100 font-medium">{vehicle.driver.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Last Trip:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-medium">
                      {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-dark-400">Distance:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">~0.5 km away</span>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCallDriver(vehicle.driver.phone)
                    }}
                    className="flex-1 btn-primary text-sm py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Driver
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/vehicle/${vehicle.id}`)
                    }}
                    className="flex-1 btn-secondary text-sm py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
            {waitingVehicles.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">No Vacant Vehicles</h4>
                <p className="text-gray-600 dark:text-dark-400">All vehicles are currently occupied. Please check back soon.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {vehicles.slice(0, 3).map((vehicle) => (
            <div key={vehicle.id} className="flex items-center space-x-4 p-4 bg-gray-50/50 dark:bg-dark-800/50 rounded-xl backdrop-blur-sm border border-white/20 dark:border-dark-700/30 hover:bg-gray-100/50 dark:hover:bg-dark-700/50 transition-all duration-300">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                  {vehicle.vehicleNumber} - {vehicle.driver.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-dark-400">
                  {vehicle.totalTripsToday} trips today • Last updated: {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Book a Trip</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-dark-400 dark:hover:text-dark-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit((data) => {
                addTripMutation.mutate({
                  ...data,
                  studentId: user.id,
                  studentName: user.name
                }, {
                  onSuccess: () => {
                    setShowBookingModal(false)
                    reset()
                    toast.success('Trip booked successfully! A driver will contact you soon.')
                  },
                  onError: (error) => {
                    toast.error(error.message || 'Booking failed. Please try again.')
                  }
                })
              })}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Pickup Location <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('startLocation', { required: 'Pickup location is required' })}
                  className="input-field w-full"
                  disabled={addTripMutation.isPending}
                >
                  <option value="Main Gate, SAU Campus">Main Gate, SAU Campus</option>
                  <option value="Library Building, SAU Campus">Library Building</option>
                  <option value="Academic Block, SAU Campus">Academic Block</option>
                  <option value="Cafeteria, SAU Campus">Cafeteria</option>
                  <option value="Hostel Area, SAU Campus">Hostel Area</option>
                </select>
                {errors.startLocation && (
                  <p className="text-red-600 text-sm mt-1">{errors.startLocation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Destination <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('endLocation', { required: 'Destination is required' })}
                  className="input-field w-full"
                  disabled={addTripMutation.isPending}
                >
                  <option value="Main Road (2km away)">Main Road (2km away)</option>
                  <option value="City Center (5km away)">City Center (5km away)</option>
                  <option value="Railway Station (8km away)">Railway Station (8km away)</option>
                  <option value="Shopping Mall (10km away)">Shopping Mall (10km away)</option>
                </select>
                {errors.endLocation && (
                  <p className="text-red-600 text-sm mt-1">{errors.endLocation.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Preferred Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('startTime', { required: 'Preferred time is required' })}
                  className="input-field w-full"
                  disabled={addTripMutation.isPending}
                />
                {errors.startTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={addTripMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {addTripMutation.isPending ? (
                  <>
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Car className="w-4 h-4" />
                    <span>Book Trip</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default StudentDashboard