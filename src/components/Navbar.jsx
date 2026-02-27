import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await signOut()
    setOpen(false)
    navigate('/login')
  }

  function close() { setOpen(false) }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src="/logo.png" alt="LunchBox logo" />
        Matlåda
      </Link>

      <div className="navbar-right">
        {user && <Link to="/upload" className="btn-upload">+ Ladda upp recept</Link>}

        <div className="hamburger-wrapper" ref={menuRef}>
        <button className="hamburger-btn" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span className={open ? 'bar bar-open-1' : 'bar'} />
          <span className={open ? 'bar bar-open-2' : 'bar'} />
          <span className={open ? 'bar bar-open-3' : 'bar'} />
        </button>

        {open && (
          <div className="hamburger-menu">
            <Link to="/random" className="menu-item" onClick={close}>Slumpa recept</Link>
            {user ? (
              <>
                <Link to="/my-recipes" className="menu-item" onClick={close}>Mina recept</Link>
                <Link to="/saved" className="menu-item" onClick={close}>Sparade recept</Link>
                <button className="menu-item menu-item-signout" onClick={handleSignOut}>Logga ut</button>
              </>
            ) : (
              <>
                <Link to="/login" className="menu-item" onClick={close}>Logga in</Link>
                <Link to="/signup" className="menu-item" onClick={close}>Registrera dig</Link>
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </nav>
  )
}
