import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useVehicles, useTrips, useUpdateVehicleStatus } from '../api/hooks'
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
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const DriverDashboard = () => {
  const { user } = useAuthStore()
  const vehiclesQuery = useVehicles()
  const tripsQuery = useTrips()
  const updateVehicle = useUpdateVehicleStatus()
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
    }
  }, [vehiclesQuery.data, user])

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
    }
    if (vehicle) {
      updateVehicle.mutate({ id: vehicle.id, data: { ...vehicle, status } })
    }
    toast.success(`Status changed to ${status}`)
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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isOnline 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Status Management */}
      {isOnline && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleStatusChange('waiting')}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentStatus === 'waiting'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <p className="font-medium text-gray-900">Waiting</p>
                <p className="text-sm text-gray-600">Available for passengers</p>
              </div>
            </button>

            <button
              onClick={() => handleStatusChange('confirm')}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentStatus === 'confirm'
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-sm font-medium text-gray-600">Today's Trips</p>
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
      </div>

      {/* Recent Trips */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
        <div className="space-y-3">
          {mockTrips.slice(0, 3).map((trip) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard
