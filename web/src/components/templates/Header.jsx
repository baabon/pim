import { useUser } from '../../auth/contexts/UserContext'
import { useState } from 'react'

export default function Header({ toggleSidebar }) {
  const { user, logout } = useUser()
  const [hover, setHover] = useState(false)

  return (
    <header style={{ zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="menu-icon" onClick={toggleSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <span className="logotipo">
          <img src="/logo.png" alt="logo" />
        </span>

        {user && (
          <div
            style={{ marginLeft: 'auto', position: 'relative', cursor: 'pointer' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <img
              className="avatar"
              src={user.picture}
              alt="avatar"
              referrerPolicy="no-referrer"
              style={{ width: 40, height: 40, borderRadius: '50%' }}
            />

            {hover && (
              <div className="account-info">
                <p style={{ margin: 0, fontWeight: '500' }}>{user.username}</p>
                <button className="logout" onClick={logout} >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
