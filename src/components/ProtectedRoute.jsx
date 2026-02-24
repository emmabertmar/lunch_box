import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrap any page with this to make it login-only.
// If the user is not logged in, they get sent to /login automatically.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return children
}
