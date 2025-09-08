import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useVehicle, useTrips, useFeedback } from '../api/hooks'
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
  MessageCircle,
  ArrowLeft,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'

const VehicleDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const vehicleQuery = useVehicle(id)
  const tripsQuery = useTrips()
  const feedbackQuery = useFeedback(id)
  const [vehicle, setVehicle] = useState(null)
  const [trips, setTrips] = useState([])
  const [feedback, setFeedback] = useState([])
  const [newFeedback, setNewFeedback] = useState({ rating: 5, comment: '' })
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  useEffect(() => {
    if (vehicleQuery.data) setVehicle(vehicleQuery.data)
  }, [vehicleQuery.data])

  useEffect(() => {
    if (tripsQuery.data) setTrips(tripsQuery.data.filter(t => t.vehicleId === id))
  }, [tripsQuery.data, id])

  useEffect(() => {
    if (feedbackQuery.data) setFeedback(feedbackQuery.data)
  }, [feedbackQuery.data])

  const handleCallDriver = () => {
    toast.success(`Calling ${vehicle?.driver.phone}...`)
    // In a real app, this would initiate a phone call
  }

  const handleSendMessage = () => {
    toast.success('Message feature coming soon!')
  }

  const handleSubmitFeedback = () => {
    if (!newFeedback.comment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    const feedbackData = {
      id: `f-${Date.now()}`,
      tripId: null,
      vehicleId: vehicle.id,
      driverId: vehicle.driver.id,
      studentId: user?.id,
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      createdAt: new Date().toISOString(),
    }

    setFeedback([feedbackData, ...feedback])
    setNewFeedback({ rating: 5, comment: '' })
    setShowFeedbackForm(false)
    toast.success('Feedback submitted successfully!')
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

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vehicle not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vehicle.vehicleNumber}</h1>
          <p className="text-gray-600">Vehicle Details</p>
        </div>
      </div>

      {/* Vehicle Status Card */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{vehicle.vehicleNumber}</h2>
            <p className="text-gray-600">Eco-Friendly Auto Rickshaw</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
            {getStatusIcon(vehicle.status)} {vehicle.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Current Location</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{vehicle.currentLocation.address}</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Vehicle Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{vehicle.capacity} passengers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Passengers:</span>
                  <span className="font-medium">{vehicle.currentPassengers}/{vehicle.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Battery Level:</span>
                  <div className="flex items-center space-x-1">
                    <Battery className="w-4 h-4" />
                    <span className="font-medium">{vehicle.batteryLevel}%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today's Trips:</span>
                  <span className="font-medium">{vehicle.totalTripsToday}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Driver Information</h3>
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={vehicle.driver.photo}
                  alt={vehicle.driver.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{vehicle.driver.name}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{vehicle.driver.rating}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{vehicle.driver.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trips:</span>
                  <span className="font-medium">{vehicle.driver.totalTrips}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">
                    {vehicle.driver.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCallDriver}
                className="flex-1 btn-primary text-sm"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call Driver
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 btn-secondary text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trip History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Trip #{trip.id}
                  </p>
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
        ) : (
          <p className="text-gray-600 text-center py-4">No trips found for this vehicle</p>
        )}
      </div>

      {/* Feedback Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Driver Feedback</h3>
          {user?.role === 'student' && (
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="btn-primary text-sm"
            >
              {showFeedbackForm ? 'Cancel' : 'Leave Feedback'}
            </button>
          )}
        </div>

        {showFeedbackForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Rate your experience</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                      className={`p-1 rounded ${
                        newFeedback.rating >= star ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={newFeedback.comment}
                  onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                  placeholder="Share your experience with this driver..."
                  className="input-field h-20 resize-none"
                />
              </div>
              <button
                onClick={handleSubmitFeedback}
                className="btn-primary text-sm"
              >
                <Send className="w-4 h-4 mr-1" />
                Submit Feedback
              </button>
            </div>
          </div>
        )}

        {feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-900">{item.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No feedback yet</p>
        )}
      </div>
    </div>
  )
}

export default VehicleDetails
