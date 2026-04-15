/**
 * AuthContext — provides auth state to the entire app.
 *
 * When Clerk is enabled (real key), this wraps Clerk's hooks.
 * When Clerk is disabled (guest mode), returns safe defaults.
 */
import { createContext, useContext } from 'react'

export const AuthContext = createContext({
  isSignedIn: false,
  isLoaded: true,
  user: null,
  clerkEnabled: false,
  getToken: async () => null,
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}
