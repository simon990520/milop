import { lazy, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Lock, TrendingUp } from 'lucide-react'

// Lazy-load Clerk's SignIn — safe because ClerkProvider IS in tree when clerkEnabled=true
const ClerkSignIn = lazy(() =>
  import('@clerk/clerk-react').then(mod => ({ default: mod.SignIn }))
)

function GuestAuthPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%)',
      padding: 24,
    }}>
      <div style={{
        maxWidth: 460, width: '100%', textAlign: 'center',
        background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
        borderRadius: 24, padding: 48,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 24px',
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={28} color="#22c55e" />
        </div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Autenticación no configurada
        </h2>
        <p style={{ color: '#8b949e', marginBottom: 20, lineHeight: 1.6, fontSize: 14 }}>
          Para habilitar el inicio de sesión, agrega tu clave de Clerk al archivo <code style={{ background: 'var(--color-surface-700)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>.env</code>:
        </p>
        <div style={{
          background: 'var(--color-surface-900)', borderRadius: 10, padding: 14,
          textAlign: 'left', fontSize: 12, color: '#22c55e', fontFamily: 'monospace',
          border: '1px solid var(--color-surface-600)', marginBottom: 24,
        }}>
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
        </div>
        <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 28 }}>
          Obtén tu clave en{' '}
          <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" style={{ color: '#22c55e', textDecoration: 'none' }}>
            dashboard.clerk.com
          </a>
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} /> Ver Mercados
          </button>
        </Link>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const { clerkEnabled } = useAuth()

  if (!clerkEnabled) return <GuestAuthPage />

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%)',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#e6edf3' }}>
          Bienvenido a Polycol
        </h2>
        <p style={{ color: '#8b949e', marginBottom: 28, fontSize: 14 }}>Inicia sesión para comenzar a operar.</p>
        <Suspense fallback={<div style={{ color: '#8b949e' }}>Cargando…</div>}>
          <ClerkSignIn routing="hash" />
        </Suspense>
      </div>
    </div>
  )
}
