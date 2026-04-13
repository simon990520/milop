import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMarketById } from '../lib/api'
import BetPanel from '../components/BetPanel'
import CommentsSection from '../components/CommentsSection'
import { MarketDetailSkeleton } from '../components/Skeletons'
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Users } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS = {
  Crypto: '#eab308', Science: '#3b82f6', Sports: '#a855f7',
  AI: '#22c55e', Climate: '#14b8a6', Business: '#f97316', General: '#6366f1',
}

function OddsChart({ market }) {
  const total = market.pool_yes + market.pool_no
  const yes = Math.round((market.pool_yes / total) * 100)
  const no  = 100 - yes

  const data = [
    { name: 'SÍ', value: yes },
    { name: 'NO', value: no },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
      borderRadius: 16, padding: 24,
    }}>
      {/* Donut chart */}
      <div style={{ width: 140, height: 140, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{
                background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
                borderRadius: 8, color: '#e6edf3', fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* YES stats */}
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <TrendingUp size={16} color="#22c55e" />
            <span style={{ fontSize: 13, color: '#8b949e' }}>Probabilidad SÍ</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#22c55e' }}>
            {yes}%
          </div>
          <div style={{ fontSize: 12, color: '#8b949e' }}>
            Monto: ${market.pool_yes.toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <TrendingDown size={16} color="#ef4444" />
            <span style={{ fontSize: 13, color: '#8b949e' }}>Probabilidad NO</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#ef4444' }}>
            {no}%
          </div>
          <div style={{ fontSize: 12, color: '#8b949e' }}>
            Monto: ${market.pool_no.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Volume + dates */}
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em' }}>VOLUMEN TOTAL</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#e6edf3' }}>
            ${total.toLocaleString()}
          </div>
        </div>
        {market.closes_at && (
          <div>
            <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4, fontWeight: 600, letterSpacing: '0.05em' }}>CIERRA</div>
            <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>
              {format(new Date(market.closes_at), 'd MMM yyyy', { locale: es })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8b949e', marginTop: 2 }}>
              <Clock size={11} />
              {formatDistanceToNow(new Date(market.closes_at), { addSuffix: true, locale: es })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketPage() {
  const { id } = useParams()

  const { data: market, isLoading, isError } = useQuery({
    queryKey: ['market', id],
    queryFn: () => getMarketById(id),
    refetchInterval: 15_000,
  })

  if (isLoading) return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '40px 24px' }}>
      <MarketDetailSkeleton />
    </div>
  )

  if (isError || !market) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#8b949e' }}>
      Mercado no encontrado.
    </div>
  )

  const catColor = CATEGORY_COLORS[market.category] || '#6366f1'

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Volver */}
      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#8b949e', fontSize: 13, textDecoration: 'none', marginBottom: 24,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
        onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
      >
        <ArrowLeft size={14} /> Volver a mercados
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr min(340px, 100%)', gap: 24, alignItems: 'start' }}>
        {/* Columna izquierda */}
        <div style={{ minWidth: 0 }}>
          {/* Categoría + estado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="badge" style={{
              background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40`
            }}>
              {market.category}
            </span>
            {market.resolved && (
              <span className="badge" style={{
                background: market.outcome === 'YES' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: market.outcome === 'YES' ? '#22c55e' : '#ef4444',
                border: `1px solid ${market.outcome === 'YES' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                ✓ RESUELTO: {market.outcome === 'YES' ? 'SÍ' : 'NO'}
              </span>
            )}
          </div>

          {/* Pregunta */}
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800,
            lineHeight: 1.3, marginBottom: 14, color: '#e6edf3',
          }}>
            {market.question}
          </h1>

          {/* Imagen del evento */}
          {market.image_url && (
            <img
              src={market.image_url}
              alt="banner"
              onError={e => e.target.style.display = 'none'}
              style={{
                width: '100%', height: 200, objectFit: 'cover',
                borderRadius: 12, marginBottom: 16,
                border: '1px solid var(--color-surface-700)',
              }}
            />
          )}

          {/* Descripción */}
          {market.description && (
            <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.7, marginBottom: 24 }}>
              {market.description}
            </p>
          )}

          {/* Gráfico de probabilidades */}
          <OddsChart market={market} />

          {/* Sección de comentarios */}
          <CommentsSection marketId={market.id} />
        </div>

        {/* Columna derecha — Panel de apuesta */}
        <div style={{ position: 'sticky', top: 80 }}>
          <BetPanel market={market} />
        </div>
      </div>
    </div>
  )
}
