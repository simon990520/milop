/**
 * AuthProvider — bridges Clerk (when available) to our AuthContext.
 *
 * IMPORTANT: This component is ONLY rendered when clerkEnabled=true,
 * so it's safe to call useUser() here.
 */
import { useEffect } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react'
import { AuthContext } from '../context/AuthContext'
import { getOrCreateUser } from '../lib/api'

export function ClerkAuthProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser()
  const { getToken, signOut } = useClerkAuth()
  
  useEffect(() => {
    if (isSignedIn && user) {
      getOrCreateUser(user).catch(err => console.error("Error al sincronizar usuario con Supabase:", err))
    }
  }, [isSignedIn, user])

  return (
    <AuthContext.Provider value={{ isSignedIn: !!isSignedIn, isLoaded, user, clerkEnabled: true, getToken, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
