import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import NotFound from './views/errors/NotFound'
import Layout from './components/Layout'
import AuthRoutes from './auth/routes'
import ProtectedRoute from './auth/components/ProtectedRoute'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './auth/contexts/AuthContext'
import { UserProvider } from './auth/contexts/UserContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { Spinner } from './components/common/Spinner'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingProvider>
      <Spinner />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <UserProvider>
            <AuthProvider>
              <Routes>
                {AuthRoutes()}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </UserProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </LoadingProvider>
  </StrictMode>
)
