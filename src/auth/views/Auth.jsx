import { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { GoogleLogin } from '@react-oauth/google'
import { useLoading } from '../../contexts/LoadingContext'

export default function Auth() {
  const { user, login } = useUser()
  const { setLoading } = useLoading()
  const [errorMessage, setErrorMessage] = useState('')

  const handleLoginSuccess = async (credentialResponse) => {
    setLoading(true)
    const token = credentialResponse.credential

    const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      setErrorMessage(errorData.error)
      setLoading(false)
      return
    }

    const data = await res.json()
    const userData = {
      id: data.user_id,
      username: data.full_name,
      email: data.email,
      picture: data.picture,
      access: data.access,
      refresh: data.refresh,
      role: data.role_id
    }

    login(userData)
    window.location.reload()
  }

  return (
    <div className="google-login-container">
      <span className="logotipo">
        <img src="/logo.png" alt="logo" />
      </span>
      <div className="google-login">
        {!user && <GoogleLogin onSuccess={handleLoginSuccess} onError={() => {}} />}
        {errorMessage && <span className="google-login-error">{errorMessage}</span>}
      </div>
      <div className="google-login-label">PRODUCT INFORMATION MANAGEMENT</div>

      <style>{`
        #root { 
          margin-top: 0;
          background-color: #f0f0f0;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  )
}
