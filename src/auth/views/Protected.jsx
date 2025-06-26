import { useAuth } from '../contexts/AuthContext'

export default function Protected() {
  const { user, logout } = useAuth()

  return (
    <div style={{ padding: 20 }}>
      <h1>Área Protegida</h1>
      <p>👤 Usuario: {user?.username}</p>
      <p>📧 Email: {user?.email}</p>
      <br />
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}
