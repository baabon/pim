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
    window.location.replace('/auth')
  }

  const validateUser = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/users/${currentUser.id}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.access}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        return false
      }

      const data = await res.json()
      const freshUserData = data;

      if (freshUserData.role.code !== currentUser.role) {
        logout('Tus permisos han cambiado. Por favor, inicia sesión de nuevo.');
        return false;
      }
      
      if (!freshUserData.is_active) {
          logout('Tu cuenta ha sido desactivada.');
          return false;
      }

      return true 

    } catch (error) {
      console.error(error);
      return false;
    }
  }

  const refreshToken = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser?.refresh) {
      logout('Sesión no encontrada');
      return false;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: currentUser.refresh }),
      })

      if (!res.ok) {
        const errorData = await res.json();
        const reason = errorData.detail || 'Tu sesión ha expirado.';
        logout(reason);
        return false
      }
      
      const data = await res.json()

      const freshUserData = data.user;

      const updatedUser = {
        ...currentUser,
        access: data.access,
        role: freshUserData.role,
      };

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return true 

    } catch (error) {
      console.error('Error de conexión al refrescar token:', error)
      logout('Error de red al validar tu sesión.')
      return false
    }
  }

  const fetchWithRefresh = async (url, options = {}) => {
    let currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      logout("No estás autenticado.");
      throw new Error('Usuario no autenticado');
    }

    const decodedAccess = jwtDecode(currentUser.access)
    const now = Date.now() / 1000

    if (decodedAccess.exp < now) {
      console.log("Token de acceso expirado, refrescando proactivamente...");
      const refreshed = await refreshToken();
      if (!refreshed) {
        throw new Error('La sesión no pudo ser validada. El usuario fue deslogueado.');
      }
      currentUser = JSON.parse(localStorage.getItem('user'));
    }

    const authHeaders = {
      Authorization: `Bearer ${currentUser.access}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const validate = await validateUser();

    let response = await fetch(url, { ...options, headers: authHeaders })

    if (response.status === 401) {
      console.log("Recibido 401, intentando un segundo refresco...");
      const refreshed = await refreshToken()
      if (!refreshed) {
          throw new Error('No se pudo refrescar el token después de un error 401.')
      }

      const newAuthHeaders = {
        ...authHeaders,
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).access}`,
      }

      response = await fetch(url, { ...options, headers: newAuthHeaders })
    }

    if (response.status === 403) {
      logout('No tienes permiso para realizar esta acción.');
      throw new Error('Usuario sin permisos (403)');
    }

    return response
  }

  useEffect(() => {
    const validateRefreshTokenOnLoad = () => {
      try {
        const stored = localStorage.getItem('user')
        if (!stored) return

        const parsed = JSON.parse(stored)
        if (!parsed.refresh) return logout('Sesión inválida.');

        const decoded = jwtDecode(parsed.refresh)
        const now = Date.now() / 1000

        if (decoded.exp < now) {
          console.warn('Refresh token expirado en la carga inicial.')
          logout('Tu sesión ha expirado.')
        }
      } catch (error) {
        console.error('Token de refresh corrupto:', error)
        logout('Token de sesión inválido.')
      }
    }

    validateRefreshTokenOnLoad()
  }, [])
  

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchWithRefresh }}>
      {children}
    </AuthContext.Provider>
  )
}