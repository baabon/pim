import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PublicRoute({ children }) {
  const { user } = useAuth()

  return !user ? children : <Navigate to="/" replace />
}
