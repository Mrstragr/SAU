import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useVehicles } from '../api/hooks'
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
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const vehiclesQuery = useVehicles()
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showMap, setShowMap] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Time</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{totalVehicles}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Navigation className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">{activeVehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-gray-900">{waitingVehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
              <p className="text-2xl font-bold text-gray-900">5 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Service Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600"><strong>Route:</strong> Campus Main Gate → Main Road (2km)</p>
            <p className="text-gray-600"><strong>Service Hours:</strong> 6:00 AM - 10:00 PM</p>
            <p className="text-gray-600"><strong>Capacity:</strong> 4 students per vehicle</p>
          </div>
          <div>
            <p className="text-gray-600"><strong>Cost:</strong> Free for students</p>
            <p className="text-gray-600"><strong>Frequency:</strong> Every 10-15 minutes</p>
            <p className="text-gray-600"><strong>Eco-Friendly:</strong> Battery-powered vehicles</p>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Vehicles</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="btn-secondary text-sm"
            >
              {showMap ? 'List View' : 'Map View'}
            </button>
          </div>
        </div>

        {showMap ? (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Interactive map view coming soon!</p>
            <p className="text-sm text-gray-500 mt-2">
              This will show real-time vehicle locations on campus map
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{vehicle.vehicleNumber}</h4>
                    <p className="text-sm text-gray-600">{vehicle.driver.name}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {getStatusIcon(vehicle.status)} {vehicle.status}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900">{vehicle.currentLocation.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="text-gray-900">
                      {vehicle.currentPassengers}/{vehicle.capacity}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Battery:</span>
                    <div className="flex items-center space-x-1">
                      <Battery className="w-4 h-4" />
                      <span className="text-gray-900">{vehicle.batteryLevel}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-gray-900">{vehicle.driver.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCallDriver(vehicle.driver.phone)
                    }}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call Driver
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/vehicle/${vehicle.id}`)
                    }}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {vehicles.slice(0, 3).map((vehicle) => (
            <div key={vehicle.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {vehicle.vehicleNumber} - {vehicle.driver.name}
                </p>
                <p className="text-xs text-gray-600">
                  {vehicle.totalTripsToday} trips today • Last updated: {new Date(vehicle.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
