import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signUp(email, password)

    if (error) {
      setError(error.message)
    } else {
      navigate('/login')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-split">

        {/* Left panel */}
        <div className="auth-panel">
          <img src="/logo.png" alt="LunchBox" className="auth-panel-logo" />
          <h2>Matlåda</h2>
          <p>Dela dina bästa recept med andra studenter och vinn veckans matlåda.</p>
        </div>

        {/* Right panel — form */}
        <div className="auth-box">
          <h1>Skapa konto</h1>
          <p className="auth-subtitle">Gå med i Matlåda idag</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@exempel.se"
                required
              />
            </div>

            <div className="form-group">
              <label>Lösenord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="minst 6 tecken"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Skapar konto...' : 'Registrera dig'}
            </button>
          </form>

          <p className="auth-switch">
            Har du redan ett konto? <Link to="/login">Logga in</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
