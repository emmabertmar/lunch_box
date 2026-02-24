import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="/logo.png" alt="LunchBox logo" />
        LunchBox
      </Link>

      <div className="navbar-links">
        {user && (
          <>
            <Link to="/upload" className="btn-upload">+ Upload recipe</Link>
            <button onClick={handleSignOut} className="btn-signout">Log out</button>
          </>
        )}
      </div>
    </nav>
  )
}
