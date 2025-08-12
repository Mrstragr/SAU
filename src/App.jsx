import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import VehicleDetails from './pages/VehicleDetails'
import Profile from './pages/Profile'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />
    }
    
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="driver" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="vehicle/:id" element={<VehicleDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
