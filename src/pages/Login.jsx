import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      navigate('/')
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
          <h1>Välkommen tillbaka</h1>
          <p className="auth-subtitle">Logga in</p>

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
                placeholder="ditt lösenord"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>

          <p className="auth-switch">
            Inget konto ännu? <Link to="/signup">Registrera dig</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
