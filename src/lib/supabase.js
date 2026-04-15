import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Polycol] Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    global: {
      fetch: async (url, options = {}) => {
        // Intercepta la petición HTTP y le añade el token 'supabase' generado por Clerk si existe sesión
        if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
          try {
            const token = await window.Clerk.session.getToken({ template: 'supabase' })
            if (token) {
              options.headers = new Headers(options.headers)
              options.headers.set('Authorization', `Bearer ${token}`)
            }
          } catch (e) {
            console.error('[Polycol] Error obteniendo token de Supabase:', e)
          }
        }
        return fetch(url, options)
      }
    }
  }
)
