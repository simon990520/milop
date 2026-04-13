import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getUserBets } from '../lib/api'
import { useUserBalance } from '../hooks/useUserBalance'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, BarChart2, Lock } from 'lucide-react'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
      borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#8b949e', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#e6edf3' }}>{value}</div>
      </div>
    </div>
  )
}

function GuestMessage() {
  return (
    <div style={{
      textAlign: 'center', padding: 80,
      background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
      borderRadius: 16,
    }}>
      <Lock size={40} style={{ marginBottom: 16, color: '#8b949e', opacity: 0.5 }} />
      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        Autenticación no configurada
      </h3>
      <p style={{ color: '#8b949e', marginBottom: 24, fontSize: 14 }}>
        Agrega tu <code style={{ background: 'var(--color-surface-700)', padding: '2px 6px', borderRadius: 4 }}>VITE_CLERK_PUBLISHABLE_KEY</code> al archivo <code style={{ background: 'var(--color-surface-700)', padding: '2px 6px', borderRadius: 4 }}>.env</code> para activar el inicio de sesión y seguir tus apuestas.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <button className="btn-primary">Ver Mercados →</button>
      </Link>
    </div>
  )
}

export default function PortfolioPage() {
  const { user, isSignedIn, clerkEnabled } = useAuth()
  const { balance } = useUserBalance()

  const { data: bets, isLoading } = useQuery({
    queryKey: ['userBets', user?.id],
    queryFn: () => getUserBets(user.id),
    enabled: !!isSignedIn && !!user?.id,
  })

  if (!clerkEnabled || !isSignedIn) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Portafolio</h1>
        <GuestMessage />
      </div>
    )
  }

  const totalBetted = bets?.reduce((s, b) => s + b.amount, 0) ?? 0
  const yesBets = bets?.filter(b => b.outcome === 'YES').length ?? 0
  const noBets  = bets?.filter(b => b.outcome === 'NO').length ?? 0

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 6, color: '#e6edf3' }}>
          Portafolio
        </h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>
          Bienvenido de vuelta, <strong style={{ color: '#e6edf3' }}>{user?.firstName || user?.username || 'Trader'}</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard icon={Wallet}      label="SALDO"           value={`$${Number(balance).toFixed(2)}`}  color="#22c55e" />
        <StatCard icon={BarChart2}   label="TOTAL APUESTAS"  value={bets?.length ?? 0}                  color="#3b82f6" />
        <StatCard icon={TrendingUp}  label="TOTAL APOSTADO"  value={`$${totalBetted.toFixed(2)}`}      color="#a855f7" />
        <StatCard icon={TrendingDown} label="SÍ / NO"         value={`${yesBets} / ${noBets}`}           color="#eab308" />
      </div>

      <div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#e6edf3' }}>
          Historial de Apuestas
        </h2>

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array(4).fill(null).map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />)}
          </div>
        )}

        {!isLoading && (!bets || bets.length === 0) && (
          <div style={{
            textAlign: 'center', padding: 64,
            background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
            borderRadius: 16, color: '#8b949e',
          }}>
            <BarChart2 size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>Sin apuestas todavía. <Link to="/" style={{ color: '#22c55e', textDecoration: 'none' }}>Ver mercados →</Link></p>
          </div>
        )}

        {!isLoading && bets && bets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bets.map(bet => (
              <div key={bet.id} style={{
                background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
                borderRadius: 12, padding: '14px 20px',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
              }}>
                <div>
                  <Link to={`/market/${bet.market_id}`} style={{ color: '#e6edf3', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                    {bet.markets?.question ?? 'Mercado desconocido'}
                  </Link>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
                    {format(new Date(bet.created_at), "d MMM yyyy · HH:mm")}
                    {' · '}{bet.shares.toFixed(2)} acciones @ {(bet.price * 100).toFixed(1)}¢
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: bet.outcome === 'YES' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: bet.outcome === 'YES' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${bet.outcome === 'YES' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {bet.outcome}
                  </span>
                  <strong style={{ color: '#e6edf3', fontSize: 15 }}>${bet.amount.toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
