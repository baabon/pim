import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const UserContext = createContext()

export const ROLES = {
  ADMINISTRATOR: 'administrator',
  PRODUCT_MANAGER: 'product_manager',
  DEFAULT_USER: 'default_user',
}

export function UserProvider({ children }) {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    navigate('/auth')
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
