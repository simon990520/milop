import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const CATEGORY_COLORS = {
  Crypto:   { bg: 'rgba(234,179,8,0.12)',   color: '#eab308',  border: 'rgba(234,179,8,0.3)' },
  Science:  { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6',  border: 'rgba(59,130,246,0.3)' },
  Sports:   { bg: 'rgba(168,85,247,0.12)',  color: '#a855f7',  border: 'rgba(168,85,247,0.3)' },
  AI:       { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e',  border: 'rgba(34,197,94,0.3)' },
  Climate:  { bg: 'rgba(20,184,166,0.12)',  color: '#14b8a6',  border: 'rgba(20,184,166,0.3)' },
  Business: { bg: 'rgba(249,115,22,0.12)',  color: '#f97316',  border: 'rgba(249,115,22,0.3)' },
  General:  { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1',  border: 'rgba(99,102,241,0.3)' },
}

function pctYes(market) {
  const total = market.pool_yes + market.pool_no
  if (!total) return 50
  return Math.round((market.pool_yes / total) * 100)
}

export default function MarketCard({ market, style }) {
  const navigate = useNavigate()
  const yes = pctYes(market)
  const no = 100 - yes
  const cat = CATEGORY_COLORS[market.category] || CATEGORY_COLORS.General
  const totalVolume = market.pool_yes + market.pool_no

  const closesIn = market.closes_at
    ? formatDistanceToNow(new Date(market.closes_at), { addSuffix: true, locale: es })
    : null

  return (
    <div
      className="card flex flex-col"
      onClick={() => navigate(`/market/${market.id}`)}
      style={{ cursor: 'pointer', padding: 20, ...style }}
    >
      {market.image_url && (
        <div style={{ margin: '-20px -20px 16px -20px', height: 160, overflow: 'hidden', borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: 'var(--color-surface-900)' }}>
          <img 
            src={market.image_url} 
            alt="Event" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
      {/* Category + time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span className="badge" style={{
          background: cat.bg, color: cat.color,
          border: `1px solid ${cat.border}`
        }}>
          {market.category}
        </span>
        {closesIn && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8b949e' }}>
            <Clock size={11} /> cierra {closesIn}
          </span>
        )}
      </div>

      {/* Question */}
      <h3 style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 15, fontWeight: 600, lineHeight: 1.4,
        marginBottom: 16, color: '#e6edf3',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {market.question}
      </h3>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 8 }}>
        <div className="progress-bar-inner" style={{ width: `${yes}%` }} />
      </div>

      {/* YES / NO percentages */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#22c55e' }}>
          <TrendingUp size={13} /> SÍ {yes}%
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
          NO {no}% <TrendingDown size={13} />
        </span>
      </div>

      {/* Volume */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid rgba(48,54,61,0.6)',
        fontSize: 12, color: '#8b949e',
      }}>
        <span>Vol <strong style={{ color: '#e6edf3' }}>${totalVolume.toLocaleString()}</strong></span>
        {market.resolved && (
          <span style={{
            color: '#eab308', background: 'rgba(234,179,8,0.12)',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600
          }}>
            RESUELTO
          </span>
        )}
      </div>
    </div>
  )
}
