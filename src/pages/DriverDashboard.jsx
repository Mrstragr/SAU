import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useVehicles, useTrips, useUpdateVehicleStatus, useUpdateTripStatus, useUpdateDriverDuty, useAnalyticsCharts } from '../api/hooks'
import { mockStudents } from '../data/mockData'
import io from 'socket.io-client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
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
  Play,
  Pause,
  Power,
  Settings,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Bell
} from 'lucide-react'
import MapComponent from '../components/MapComponent'
import toast from 'react-hot-toast'

const DriverDashboard = () => {
  const { user } = useAuthStore()
  const vehiclesQuery = useVehicles()
  const tripsQuery = useTrips()
  const updateVehicle = useUpdateVehicleStatus()
  const updateDriverDuty = useUpdateDriverDuty()
  const updateTripStatus = useUpdateTripStatus()
  const earningsQuery = useAnalyticsCharts('earnings')
  const [vehicle, setVehicle] = useState(null)
  const [isOnline, setIsOnline] = useState(false)
  const [currentStatus, setCurrentStatus] = useState('offline')
  const [currentPassengers, setCurrentPassengers] = useState(0)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [todayTrips, setTodayTrips] = useState(0)
  const [currentLocation, setCurrentLocation] = useState({
    lat: 28.6139,
    lng: 77.2090,
    address: 'Main Gate, SAU Campus'
  })
  const [vacancyStartTime, setVacancyStartTime] = useState(null)
  const [lastTripCompletionTime, setLastTripCompletionTime] = useState(null)
  const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001')

  // Loading and error states
  if (vehiclesQuery.isLoading || tripsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-600">Loading dashboard data...</div>
      </div>
    )
  }

  if (vehiclesQuery.isError || tripsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          Error loading dashboard data. Please try again later.
        </div>
      </div>
    )
  }

  // Find the driver's vehicle
  useEffect(() => {
    if (!vehiclesQuery.data || !user?.id) return
    const driverVehicle = vehiclesQuery.data.find(v => v.driver.id === user.id)
    if (driverVehicle) {
      setVehicle(driverVehicle)
      setCurrentPassengers(driverVehicle.currentPassengers)
      setBatteryLevel(driverVehicle.batteryLevel)
      setTodayTrips(driverVehicle.totalTripsToday)
      setCurrentLocation(driverVehicle.currentLocation)
      setCurrentStatus(driverVehicle.status)
      if (driverVehicle.status === 'waiting') {
        setVacancyStartTime(new Date())
      }
    }
  }, [vehiclesQuery.data, user])

  const pendingTrips = tripsQuery.data?.filter(trip => trip.status === 'pending' && trip.driverId === user?.id).map(trip => ({
    ...trip,
    studentName: mockStudents.find(s => s.id === trip.studentId)?.name || 'Unknown Student'
  })) || []

  const acceptTrip = (tripId) => {
    updateTripStatus.mutate({ id: tripId, status: 'in-progress' }, {
      onSuccess: () => {
        toast.success('Trip accepted!')
        setCurrentStatus('confirm')
        setVacancyStartTime(null)
      }
    })
  }

  const rejectTrip = (tripId) => {
    updateTripStatus.mutate({ id: tripId, status: 'cancelled' }, {
      onSuccess: () => {
        toast.success('Trip rejected.')
        // Auto-set to waiting after rejection
        setCurrentStatus('waiting')
        setVacancyStartTime(new Date())
      }
    })
  }

  // Auto-set to waiting after trip completion (simulate)
  useEffect(() => {
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      const timer = setTimeout(() => {
        setCurrentStatus('waiting')
        setVacancyStartTime(new Date())
        setCurrentPassengers(0)
        toast.success('Vehicle is now vacant and waiting for new trips')
      }, 5000) // 5 second delay for simulation

      return () => clearTimeout(timer)
    }
  }, [currentStatus])

  useEffect(() => {
    if (!user?.id) return

    socket.emit('join_driver', user.id)

    socket.on('status_updated', (data) => {
      if (data.vehicleId === vehicle?.id) {
        setCurrentStatus(data.status)
        if (data.status === 'waiting') {
          setVacancyStartTime(new Date())
        } else {
          setVacancyStartTime(null)
        }
        toast.success(`Your vehicle status updated to ${data.status}`)
      }
    })

    socket.on('location_updated', (data) => {
      if (data.vehicleId === vehicle?.id) {
        setCurrentLocation(data.location)
        toast.success('Your vehicle location updated')
      }
    })

    // Emit vacancy update when status changes to waiting
    socket.on('vacancy_update', (data) => {
      if (data.vehicleId === vehicle?.id && data.isVacant) {
        setVacancyStartTime(new Date())
        toast.info('Your vehicle is now visible to students as vacant')
      }
    })

    // Simulate new trip notification
    const notifyInterval = setInterval(() => {
      if (Math.random() > 0.7 && pendingTrips.length === 0) {
        toast.info('New trip request available! Check pending trips.')
      }
    }, 30000)

    return () => {
      socket.off('status_updated')
      socket.off('location_updated')
      socket.off('vacancy_update')
      clearInterval(notifyInterval)
    }
  }, [user, vehicle, pendingTrips.length])

  // Simulate battery drain and location updates
  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => {
        setBatteryLevel(prev => Math.max(10, prev - 0.1))
        // Simulate location updates
        setCurrentLocation(prev => ({
          ...prev,
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }))
      }, 30000) // Update every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isOnline])

  const handleToggleOnline = () => {
    setIsOnline(!isOnline)
    setCurrentStatus(isOnline ? 'offline' : 'waiting')
    toast.success(isOnline ? 'You are now offline' : 'You are now online and available')
  }

  const handleStatusChange = (status) => {
    setCurrentStatus(status)
    if (status === 'waiting') {
      setCurrentPassengers(0)
      setVacancyStartTime(new Date())
      // Emit vacancy update via socket
      if (socket && vehicle) {
        socket.emit('vehicle_vacant', { vehicleId: vehicle.id, isVacant: true })
      }
    } else {
      setVacancyStartTime(null)
      if (socket && vehicle) {
        socket.emit('vehicle_vacant', { vehicleId: vehicle.id, isVacant: false })
      }
    }
    if (vehicle) {
      updateVehicle.mutate({ id: vehicle.id, data: { status } })
    }
    toast.success(`Status changed to ${status}`)
  }

  const handleDutyChange = (driverDutyStatus) => {
    if (vehicle) {
      updateDriverDuty.mutate({ 
        id: vehicle.id, 
        driverDutyStatus 
      }, {
        onSuccess: () => {
          toast.success(`Duty status: ${driverDutyStatus}`)
        },
        onError: (error) => {
          toast.error(`Failed to update duty status: ${error.message || 'Unknown error'}`)
        }
      })
    }
  }

  const handlePassengerChange = (change) => {
    const newCount = Math.max(0, Math.min(4, currentPassengers + change))
    setCurrentPassengers(newCount)

    if (newCount === 4) {
      setCurrentStatus('confirm')
      toast.success('Vehicle is now full and departing')
    } else if (newCount === 0) {
      setCurrentStatus('waiting')
    }
  }

  const handleLocationUpdate = () => {
    // In a real app, this would get actual GPS location
    const locations = [
      'Main Gate, SAU Campus',
      'Library Building, SAU Campus',
      'Academic Block, SAU Campus',
      'Cafeteria, SAU Campus',
      'Hostel Area, SAU Campus',
      'Main Road (2km away)'
    ]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]
    setCurrentLocation(prev => ({ ...prev, address: randomLocation }))
    toast.success('Location updated')
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

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vehicle information not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Vehicle</p>
          <p className="text-lg font-semibold text-gray-900">{vehicle.vehicleNumber}</p>
        </div>
      </div>

      {/* Online/Offline Toggle */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium text-gray-900">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={handleToggleOnline}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isOnline
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Vacancy Status */}
      {isOnline && currentStatus === 'waiting' && (
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-green-800">Vacancy Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-gray-900">Time Vacant</p>
              <p className="text-2xl font-bold text-green-600">
                {vacancyStartTime ? Math.floor((Date.now() - new Date(vacancyStartTime).getTime()) / 60000) : 0} min
              </p>
              <p className="text-xs text-gray-500">Since becoming available</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">Visibility</p>
              <p className="text-lg font-semibold text-blue-600">Visible to Students</p>
              <p className="text-xs text-gray-500">Students can see your vehicle</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">Est. Wait Time</p>
              <p className="text-2xl font-bold text-purple-600">15 min</p>
              <p className="text-xs text-gray-500">Average time to next booking</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Management */}
      {isOnline && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleStatusChange('waiting')}
              className={`p-4 rounded-lg border-2 transition-all relative ${currentStatus === 'waiting'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              {currentStatus === 'waiting' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <p className="font-medium text-gray-900">Waiting</p>
                <p className="text-sm text-gray-600">Available for passengers</p>
              </div>
            </button>

            <button
              onClick={() => handleDutyChange('OFF_DUTY')}
              className={`p-4 rounded-lg border-2 transition-all ${vehicle?.driverDutyStatus === 'OFF_DUTY'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Pause className="w-4 h-4 text-white" />
                </div>
                <p className="font-medium text-gray-900">Off Duty</p>
                <p className="text-sm text-gray-600">Not available</p>
              </div>
            </button>

            <button
              onClick={() => handleDutyChange('LUNCH')}
              className={`p-4 rounded-lg border-2 transition-all ${vehicle?.driverDutyStatus === 'LUNCH'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <p className="font-medium text-gray-900">Lunch Break</p>
                <p className="text-sm text-gray-600">Temporary break</p>
              </div>
            </button>

            <button
              onClick={() => handleStatusChange('confirm')}
              className={`p-4 rounded-lg border-2 transition-all ${currentStatus === 'confirm'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <p className="font-medium text-gray-900">Confirm</p>
                <p className="text-sm text-gray-600">Full and departing</p>
              </div>
            </button>

            <div className="p-4 rounded-lg border-2 border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{currentLocation.address}</p>
                <button
                  onClick={handleLocationUpdate}
                  className="mt-2 text-xs btn-primary"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{currentPassengers}/4</p>
            </div>
          </div>
          {isOnline && (
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => handlePassengerChange(-1)}
                disabled={currentPassengers === 0}
                className="flex-1 btn-secondary text-sm py-1 disabled:opacity-50"
              >
                -1
              </button>
              <button
                onClick={() => handlePassengerChange(1)}
                disabled={currentPassengers === 4}
                className="flex-1 btn-secondary text-sm py-1 disabled:opacity-50"
              >
                +1
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today&apos;s Trips</p>
              <p className="text-2xl font-bold text-gray-900">{todayTrips}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Battery className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Battery Level</p>
              <p className="text-2xl font-bold text-gray-900">{batteryLevel.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">{vehicle.driver.rating}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today&apos;s Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${(todayTrips * 2).toFixed(0)}</p>
              <p className="text-xs text-indigo-600">Mock $2 per trip</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                {currentStatus.toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">
                {isOnline ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">{vehicle.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{currentLocation.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full btn-primary text-sm">
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </button>
              <button className="w-full btn-secondary text-sm" onClick={() => toast.success('Emergency contact initiated! Support will call you shortly.')}>
                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                Emergency
              </button>
              <button className="w-full btn-secondary text-sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button className="w-full btn-secondary text-sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pendingTrips.length > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {pendingTrips.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingTrips.length > 0 ? (
              pendingTrips.slice(0, 3).map(trip => (
                <div key={trip.id} className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New trip from {trip.studentName}</p>
                    <p className="text-xs text-gray-600">{trip.startLocation} → {trip.endLocation}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No new notifications</p>
            )}
          </div>
        </div>

        {/* Location Map */}
        <div className="card">
          <h4 className="font-medium text-gray-900 mb-4">Current Location</h4>
          <div className="h-64 rounded-lg overflow-hidden">
            <MapComponent
              userLocation={currentLocation}
              height="100%"
            />
          </div>
          <button
            onClick={handleLocationUpdate}
            className="mt-3 w-full btn-secondary text-sm"
          >
            Update Location
          </button>
        </div>
      </div>

      {/* Pending Trips */}
      {pendingTrips.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Pending Trips</h3>
          <div className="space-y-3">
            {pendingTrips.map((trip) => (
              <div key={trip.id} className={`border rounded-lg p-4 ${currentStatus === 'waiting' ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Student: {trip.studentName}</h4>
                      {currentStatus === 'waiting' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Vacant Match</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{trip.startLocation} → {trip.endLocation}</p>
                    <p className="text-sm text-gray-600">Time: {new Date(trip.startTime).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptTrip(trip.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => rejectTrip(trip.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trips */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
        <div className="space-y-3">
          {tripsQuery.data
            ?.filter(trip => trip.driverId === user?.id)
            .slice(0, 3)
            .map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Trip #{trip.id}
                  </p>
                  <p className="text-xs text-gray-600">
                    {trip.startLocation} → {trip.endLocation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {trip.status}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(trip.startTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No recent trips found.</p>
            )}
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard
