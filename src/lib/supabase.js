import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Bypass the Navigator Lock so multiple tabs/windows don't block each other.
    // This is safe for a web app like this.
    lock: async (_name, _timeout, fn) => fn()
  }
})
