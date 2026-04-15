import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { TrendingUp, Wallet, ShieldCheck, Bell, Home, Briefcase, BellOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useUserBalance } from '../hooks/useUserBalance'
import { useNotifications } from '../hooks/useNotifications'
import WalletModal from './WalletModal'

function BalancePill({ onClick }) {
  const { balance, isLoading } = useUserBalance()
  if (isLoading) return <span className="skeleton" style={{ width: 64, height: 20, display: 'inline-block' }} />
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600, color: '#22c55e',
      cursor: 'pointer', transition: 'all 0.2s', outline: 'none'
    }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.12)'}>
      <Wallet size={13} />
      ${Number(balance).toFixed(2)}
    </button>
  )
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const dropdownStyle = {
    position: 'absolute', top: 50, right: 0, width: 280,
    background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
    borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 110,
    maxHeight: 360, overflowY: 'auto'
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer',
          padding: 8, position: 'relative', display: 'flex', alignItems: 'center'
        }}
      >
        <Bell size={20} color={unreadCount > 0 ? '#22c55e' : '#8b949e'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16,
            background: '#22c55e', color: 'white', fontSize: 10, fontWeight: 700,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-surface-950)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={dropdownStyle} className="animate-fade-in-up">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-surface-700)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Notificaciones</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 11 }}>Cerrar</button>
          </div>
          {notifications?.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#8b949e', fontSize: 12 }}>
              <BellOff size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Sin notificaciones</p>
            </div>
          ) : (
            notifications?.map(n => (
              <div 
                key={n.id} 
                onClick={() => { markAsRead(n.id); setIsOpen(false); }}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--color-surface-700)', cursor: 'pointer',
                  background: n.read ? 'transparent' : 'rgba(34,197,94,0.05)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(34,197,94,0.05)'}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: n.read ? '#8b949e' : '#e6edf3', marginBottom: 2 }}>{n.title}</p>
                <p style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.4 }}>{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 105 }} onClick={() => setIsOpen(false)} />}
    </div>
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
  const { isSignedIn, user, clerkEnabled, signOut } = useAuth()
  const [showWallet, setShowWallet] = useState(false)
  const { balance } = useUserBalance()

  const navLink = (to, label, Icon) => {
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
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        <Icon size={18} className="sm:hidden" />
        <span className="hidden sm:inline">{label}</span>
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
    }} className="px-4 md:px-6">
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
          <span className="hidden sm:inline" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: '#e6edf3' }}>
            Poly<span style={{ color: '#22c55e' }}>col</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="flex-1 justify-center sm:justify-start sm:ml-10">
          {navLink('/', 'Mercados', Home)}
          {navLink('/portfolio', 'Portafolio', Briefcase)}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="sm:gap-3">
          {isSignedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="sm:gap-4">
              <NotificationBell />
              <BalancePill onClick={() => setShowWallet(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserAvatar user={user} />
                {clerkEnabled && signOut && (
                  <button 
                    onClick={() => signOut()}
                    className="hidden sm:block"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: '#8b949e', textDecoration: 'underline',
                      padding: 0, transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
                  >
                    Salir
                  </button>
                )}
              </div>
            </div>
          ) : (
            <Link to="/auth">
              <button className="btn-primary" style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {clerkEnabled ? 'Iniciar Sesión' : 'Modo Invitado'}
              </button>
            </Link>
          )}
        </div>
      </div>
      {showWallet && <WalletModal onClose={() => setShowWallet(false)} balance={balance} />}
    </nav>
  )
}
