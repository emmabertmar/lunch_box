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
          <h2>LunchBox</h2>
          <p>Share your best student recipes and win the weekly competition.</p>
        </div>

        {/* Right panel — form */}
        <div className="auth-box">
          <h1>Create account</h1>
          <p className="auth-subtitle">Join LunchBox today</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@student.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
