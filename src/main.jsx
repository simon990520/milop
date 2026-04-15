import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import App from './App'
import './index.css'

const RAW_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

/** True only when the env var looks like a real Clerk publishable key */
export const clerkEnabled =
  /^pk_(test|live)_[A-Za-z0-9+/=]{20,}$/.test(RAW_KEY) &&
  !RAW_KEY.includes('XXXX')

const GUEST_AUTH = { isSignedIn: false, isLoaded: true, user: null, clerkEnabled: false }

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

async function bootstrap() {
  let Providers

  if (clerkEnabled) {
    // Dynamically import Clerk — only runs when we have a valid key
    const { ClerkProvider } = await import('@clerk/clerk-react')
    const { ClerkAuthProvider } = await import('./context/ClerkAuthProvider')
    const { dark } = await import('@clerk/themes')
    const { esES } = await import('@clerk/localizations')

    console.info('[Polycol] Clerk authentication enabled.')

    Providers = ({ children }) => (
      <ClerkProvider publishableKey={RAW_KEY} appearance={{ baseTheme: dark }} localization={esES}>
        <ClerkAuthProvider>
          {children}
        </ClerkAuthProvider>
      </ClerkProvider>
    )
  } else {
    console.info(
      '[Polycol] Guest mode — add a real VITE_CLERK_PUBLISHABLE_KEY to .env to enable auth.'
    )
    Providers = ({ children }) => (
      <AuthContext.Provider value={GUEST_AUTH}>
        {children}
      </AuthContext.Provider>
    )
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Providers>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App clerkEnabled={clerkEnabled} />
          </BrowserRouter>
        </QueryClientProvider>
      </Providers>
    </React.StrictMode>
  )
}

bootstrap()
