import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useVehicles, useStudents, useTrips } from '../api/hooks'
import {
  Car,
  Users,
  TrendingUp,
  Battery,
  Star,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000')

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const vehiclesQuery = useVehicles()
  const studentsQuery = useStudents()
  const tripsQuery = useTrips()
  const [vehicles, setVehicles] = useState([])
  const [students, setStudents] = useState([])
  const [trips, setTrips] = useState([])
  
  useEffect(() => { if (vehiclesQuery.data) setVehicles(vehiclesQuery.data) }, [vehiclesQuery.data])
  useEffect(() => { if (studentsQuery.data) setStudents(studentsQuery.data) }, [studentsQuery.data])
  useEffect(() => { if (tripsQuery.data) setTrips(tripsQuery.data) }, [tripsQuery.data])
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    socket.on('status_updated', (data) => {
      setVehicles((prevVehicles) => {
        return prevVehicles.map((v) =>
          v.id === data.vehicleId ? { ...v, status: data.status } : v
        )
      })
      toast.success(`Vehicle ${data.vehicleId} status updated to ${data.status}`)
    })

    socket.on('location_updated', (data) => {
      setVehicles((prevVehicles) => {
        return prevVehicles.map((v) =>
          v.id === data.vehicleId ? { ...v, currentLocation: data.location } : v
        )
      })
      toast.success(`Vehicle ${data.vehicleId} location updated`)
    })

    return () => {
      socket.off('status_updated')
      socket.off('location_updated')
    }
  }, [])

  // Loading and error states
  if (vehiclesQuery.isLoading || studentsQuery.isLoading || tripsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-600">Loading dashboard data...</div>
      </div>
    )
  }

  if (vehiclesQuery.isError || studentsQuery.isError || tripsQuery.isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          Error loading dashboard data. Please try again later.
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter(v => v.status !== 'offline').length
  const totalStudents = students.length
  const totalTrips = trips.length
  const completedTrips = trips.filter(t => t.status === 'completed').length
  const averageRating = vehicles.reduce((acc, v) => acc + v.driver.rating, 0) / vehicles.length

  const handleVehicleAction = (action, vehicleId) => {
    switch (action) {
      case 'edit':
        toast.success('Edit vehicle feature coming soon!')
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this vehicle?')) {
          setVehicles(vehicles.filter(v => v.id !== vehicleId))
          toast.success('Vehicle deleted successfully')
        }
        break
      case 'view':
        toast.success('View vehicle details feature coming soon!')
        break
      default:
        break
    }
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

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'vehicles', name: 'Vehicles', icon: Car },
    { id: 'drivers', name: 'Drivers', icon: Users },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'trips', name: 'Trips', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">System Status</p>
          <p className="text-lg font-semibold text-green-600">All Systems Operational</p>
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
              <p className="text-xs text-green-600">+{activeVehicles} active</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-xs text-blue-600">Registered users</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{totalTrips}</p>
              <p className="text-xs text-green-600">{completedTrips} completed</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-yellow-600">Driver satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    selectedTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Service Status</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-gray-900">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Uptime</span>
                      <span className="text-green-600 font-medium">99.9%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full btn-primary text-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Vehicle
                    </button>
                    <button className="w-full btn-secondary text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Drivers
                    </button>
                    <button className="w-full btn-secondary text-sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {selectedTab === 'vehicles' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Management</h3>
                <button className="btn-primary text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Battery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                            <div className="text-sm text-gray-500">{vehicle.capacity} seats</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={vehicle.driver.photo}
                              alt={vehicle.driver.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{vehicle.driver.name}</div>
                              <div className="text-sm text-gray-500">{vehicle.driver.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.currentLocation.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Battery className="w-4 h-4 mr-1" />
                            <span className="text-sm text-gray-900">{vehicle.batteryLevel}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVehicleAction('view', vehicle.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVehicleAction('edit', vehicle.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVehicleAction('delete', vehicle.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {selectedTab === 'drivers' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={vehicle.driver.photo}
                        alt={vehicle.driver.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{vehicle.driver.name}</h4>
                        <p className="text-sm text-gray-600">{vehicle.vehicleNumber}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{vehicle.driver.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1">{vehicle.driver.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Trips:</span>
                        <span className="font-medium">{vehicle.driver.totalTrips}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${vehicle.driver.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {vehicle.driver.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students Tab */}
          {selectedTab === 'students' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Management</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.studentId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{student.email}</div>
                            <div className="text-sm text-gray-500">{student.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Year {student.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trips Tab */}
          {selectedTab === 'trips' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Management</h3>
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Trip #{trip.id}</p>
                      <p className="text-xs text-gray-600">
                        {trip.startLocation} → {trip.endLocation}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(trip.startTime).toLocaleDateString()} at {new Date(trip.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                        trip.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status}
                      </div>
                      {trip.rating && (
                        <div className="flex items-center justify-center mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{trip.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
