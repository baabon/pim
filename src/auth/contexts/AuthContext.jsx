import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = (reason = '') => {
    localStorage.removeItem('user')
    setUser(null)
    if (reason) {
      localStorage.setItem('logout_reason', reason)
    }
    window.location.href = '/auth'
  }

  const refreshToken = async () => {
    if (!user?.refresh) return false

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: user.refresh }),
      })

      if (!res.ok) {
        logout('Token inválido o expirado')
        return false
      }

      const data = await res.json()
      const updatedUser = { ...user, access: data.access }

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return true
    } catch (error) {
      console.error('Error refrescando token:', error)
      logout('Error al refrescar token')
      return false
    }
  }

  const fetchWithRefresh = async (url, options = {}) => {
    if (!user) throw new Error('No authenticated')

    const authHeaders = {
      Authorization: `Bearer ${user.access}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    let response = await fetch(url, { ...options, headers: authHeaders })

    if (response.status === 401) {
      const refreshed = await refreshToken()
      if (!refreshed) throw new Error('No se pudo refrescar el token')

      const newAuthHeaders = {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).access}`,
        'Content-Type': 'application/json',
        ...options.headers,
      }

      response = await fetch(url, { ...options, headers: newAuthHeaders })
    }

    if (response.status === 403) {
      logout('Usuario desactivado o sin permisos')
      throw new Error('Usuario desactivado o sin permisos')
    }

    return response
  }

  useEffect(() => {
    const validateRefreshToken = () => {
      try {
        const stored = localStorage.getItem('user')
        if (!stored) return

        const parsed = JSON.parse(stored)
        const decoded = jwtDecode(parsed.refresh)

        const now = Date.now() / 1000
        if (decoded.exp < now) {
          console.warn('Refresh token expirado')
          logout('Token expirado')
        }
      } catch (error) {
        console.error('Token inválido o corrupto:', error)
        logout('Token inválido')
      }
    }

    validateRefreshToken()
  }, [])

  useEffect(() => {
    const checkRoleChange = () => {
      const stored = localStorage.getItem('user')
      if (!stored) return

      try {
        const parsed = JSON.parse(stored)
        const decoded = jwtDecode(parsed.access)

        if (parsed.role && decoded.role && parsed.role !== decoded.role) {
          logout('Cambio de rol detectado')
        }
      } catch (err) {
        console.error('Error verificando role:', err)
        logout('Error al verificar rol')
      }
    }

    const interval = setInterval(checkRoleChange, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchWithRefresh }}>
      {children}
    </AuthContext.Provider>
  )
}
