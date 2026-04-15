import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMarkets } from '../lib/api'
import MarketCard from '../components/MarketCard'
import { CardSkeleton } from '../components/Skeletons'
import { TrendingUp, Search, Zap } from 'lucide-react'

// label visible → valor en la DB (inglés)
const CATEGORIES = [
  { label: 'Todos',    db: 'All' },
  { label: 'Cripto',   db: 'Crypto' },
  { label: 'IA',       db: 'AI' },
  { label: 'Deportes', db: 'Sports' },
  { label: 'Ciencia',  db: 'Science' },
  { label: 'Clima',    db: 'Climate' },
  { label: 'Negocios', db: 'Business' },
  { label: 'General',  db: 'General' },
]

const HERO_STATS = [
  { label: 'Mercados Activos', value: '6' },
  { label: 'Volumen Total',    value: '$36K+' },
  { label: 'Traders',          value: '1,200+' },
]

export default function HomePage() {
  const [categoryDb, setCategoryDb] = useState('All')
  const [search, setSearch] = useState('')

  const { data: markets, isLoading, isError } = useQuery({
    queryKey: ['markets', categoryDb],
    queryFn: () => getMarkets({ category: categoryDb }),
    placeholderData: prev => prev,
  })

  const filtered = markets?.filter(m =>
    m.question.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.15) 0%, transparent 70%), var(--color-surface-950)',
        padding: '72px 24px 56px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#22c55e',
            marginBottom: 20,
          }}>
            <Zap size={12} fill="#22c55e" /> Mercados de predicción en vivo
          </div>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(36px,5vw,58px)', fontWeight: 800, lineHeight: 1.1,
            marginBottom: 18,
          }}>
            Opera en el{' '}
            <span className="gradient-text">futuro de todo</span>
          </h1>

          <p style={{ fontSize: 17, color: '#8b949e', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Compra y vende participaciones en el resultado de eventos del mundo real.
            El mercado siempre sabe mejor.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {HERO_STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 700, color: '#e6edf3' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filtros ── */}
      <div style={{
        position: 'sticky', top: 60, zIndex: 50,
        background: 'rgba(8,12,16,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(48,54,61,0.5)',
        padding: '12px 24px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Búsqueda */}
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', pointerEvents: 'none' }} />
            <input
              id="search-markets"
              type="text"
              placeholder="Buscar mercados…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Categorías */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.db}
                onClick={() => setCategoryDb(cat.db)}
                style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: categoryDb === cat.db ? '#22c55e' : 'var(--color-surface-700)',
                  color: categoryDb === cat.db ? 'white' : '#8b949e',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid de mercados ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 64px' }} className="px-4 md:px-6">
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array(6).fill(null).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: 80 }}>
            <p style={{ fontSize: 16 }}>No se pudieron cargar los mercados. Verifica tu conexión con Supabase.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8b949e', padding: 80 }}>
            <TrendingUp size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 16 }}>No se encontraron mercados.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((market, i) => (
              <MarketCard
                key={market.id}
                market={market}
                style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
