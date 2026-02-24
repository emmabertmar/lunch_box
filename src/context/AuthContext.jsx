import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // When a user logs in, check if they have a profile — if not, create one.
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          await supabase.from('profiles').insert({
            id: session.user.id,
            username: session.user.email.split('@')[0]
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // signUp just creates the auth account — profile is created on first login
  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () =>
    supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {loading ? <div style={{ padding: '2rem' }}>Loading...</div> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
