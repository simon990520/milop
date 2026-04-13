/**
 * useAuth — thin wrapper around Clerk hooks.
 *
 * When Clerk is NOT loaded (guest mode), all values fall back to
 * unauthenticated defaults so the app renders without crashing.
 */

import { useState, useEffect } from 'react'

// ── detect whether Clerk was actually mounted ──────────────
let _clerkMounted = false
export function markClerkMounted() { _clerkMounted = true }

// We lazy-import Clerk hooks only when available
function tryUseClerk(hookName, fallback) {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const mod = require('@clerk/clerk-react')
    return mod[hookName]()
  } catch {
    return fallback
  }
}

export function useAuthUser() {
  // Check window.__clerkEnabled flag set by main.jsx
  const enabled = typeof window !== 'undefined' && window.__clerkEnabled

  if (!enabled) {
    return { user: null, isSignedIn: false, isLoaded: true }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useUser } = require('@clerk/clerk-react')
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useUser()
}
