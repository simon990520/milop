import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Wallet, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUserBalance } from '../hooks/useUserBalance'

function BalancePill() {
  const { balance, isLoading } = useUserBalance()
  if (isLoading) return <span className="skeleton" style={{ width: 64, height: 20, display: 'inline-block' }} />
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600, color: '#22c55e'
    }}>
      <Wallet size={13} />
      ${Number(balance).toFixed(2)}
    </span>
  )
}

function UserAvatar({ user }) {
  const initials = (user?.firstName?.[0] || user?.username?.[0] || 'T').toUpperCase()
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg,#22c55e,#3b82f6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: 'white',
      overflow: 'hidden',
    }}>
      {user?.imageUrl
        ? <img src={user.imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials
      }
    </div>
  )
}

export default function Navbar() {
  const location = useLocation()
  const { isSignedIn, user, clerkEnabled } = useAuth()

  const navLink = (to, label) => {
    const active = location.pathname === to
    return (
      <Link to={to} style={{
        color: active ? '#22c55e' : '#8b949e',
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        textDecoration: 'none',
        transition: 'color 0.15s ease',
        paddingBottom: 2,
        borderBottom: active ? '2px solid #22c55e' : '2px solid transparent',
      }}>
        {label}
      </Link>
    )
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,12,16,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(48,54,61,0.6)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: '#e6edf3' }}>
            Poly<span style={{ color: '#22c55e' }}>col</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {navLink('/', 'Mercados')}
          {navLink('/portfolio', 'Portafolio')}
          {navLink('/admin', 'Admin')}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isSignedIn ? (
            <>
              <BalancePill />
              <UserAvatar user={user} />
            </>
          ) : (
            <Link to="/auth">
              <button className="btn-primary" style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {clerkEnabled ? 'Iniciar Sesión' : 'Modo Invitado'}
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
