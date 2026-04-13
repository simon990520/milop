/**
 * AuthProvider — bridges Clerk (when available) to our AuthContext.
 *
 * IMPORTANT: This component is ONLY rendered when clerkEnabled=true,
 * so it's safe to call useUser() here.
 */
import { useUser } from '@clerk/clerk-react'
import { AuthContext } from '../context/AuthContext'

export function ClerkAuthProvider({ children }) {
  const { user, isSignedIn, isLoaded } = useUser()
  return (
    <AuthContext.Provider value={{ isSignedIn: !!isSignedIn, isLoaded, user, clerkEnabled: true }}>
      {children}
    </AuthContext.Provider>
  )
}
