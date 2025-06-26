import { Route, Outlet } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Auth from './views/Auth'
import Protected from './views/Protected'
import Users from './views/Users'

const AuthRoutes = () => (
  <Route
    element={
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </GoogleOAuthProvider>
    }
  >
    <Route
      path="/auth"
      element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      }
    />
    <Route
      path="/protected"
      element={
        <ProtectedRoute>
          <Protected />
        </ProtectedRoute>
      }
    />
    <Route
      path="/users"
      element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      }
    />
  </Route>
)

export default AuthRoutes