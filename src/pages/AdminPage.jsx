import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  getAllMarketsAdmin, createMarket, resolveMarket, deleteMarket, updateMarket
} from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  Plus, Trash2, CheckCircle2, XCircle, BarChart2, TrendingUp,
  TrendingDown, Edit3, X, Clock, AlertTriangle, ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Colores por categoría ──────────────────────────────────
const CAT_COLORS = {
  Crypto:   '#eab308', Science: '#3b82f6', Sports: '#a855f7',
  AI:       '#22c55e', Climate: '#14b8a6', Business: '#f97316', General: '#6366f1',
}
const CATEGORIES = ['Crypto','AI','Sports','Science','Climate','Business','General']

// ── Modal de creación / edición ───────────────────────────
function MarketFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial
  const qc = useQueryClient()

  const [form, setForm] = useState({
    question:    initial?.question    || '',
    description: initial?.description || '',
    category:    initial?.category    || 'Crypto',
    closes_at:   initial?.closes_at
      ? initial.closes_at.slice(0, 16)
      : '',
    image_url:   initial?.image_url   || '',
  })
  const [err, setErr] = useState(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        closes_at: form.closes_at ? new Date(form.closes_at).toISOString() : null,
      }
      if (isEdit) return updateMarket(initial.id, payload)
      return createMarket(payload)
    },
    onSuccess: (data) => {
      qc.invalidateQueries(['admin-markets'])
      qc.invalidateQueries(['markets'])
      onSaved?.(data)
      onClose()
    },
    onError: (e) => setErr(e.message),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle = {
    background: 'var(--color-surface-900)',
    border: '1px solid var(--color-surface-600)',
    borderRadius: 10, padding: '10px 14px', fontSize: 14,
    color: '#e6edf3', width: '100%', outline: 'none',
  }
  const labelStyle = { fontSize: 12, color: '#8b949e', fontWeight: 500, display: 'block', marginBottom: 6 }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
        borderRadius: 20, padding: 32, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 20 }}>
            {isEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h2>
          <button onClick={onClose} style={{
            background: 'var(--color-surface-700)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', color: '#8b949e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Pregunta */}
          <div>
            <label style={labelStyle}>Pregunta del evento *</label>
            <textarea
              value={form.question}
              onChange={e => set('question', e.target.value)}
              placeholder="¿Bitcoin superará los $200,000 en 2026?"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción / criterios de resolución</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Explica cómo se resolverá el evento…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Categoría */}
          <div>
            <label style={labelStyle}>Categoría</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Fecha de cierre */}
          <div>
            <label style={labelStyle}>Fecha y hora de cierre</label>
            <input
              type="datetime-local"
              value={form.closes_at}
              onChange={e => set('closes_at', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* URL de imagen */}
          <div>
            <label style={labelStyle}>URL de imagen (opcional)</label>
            <input
              type="url"
              value={form.image_url}
              onChange={e => set('image_url', e.target.value)}
              placeholder="https://…"
              style={inputStyle}
            />
            {form.image_url && (
              <img
                src={form.image_url}
                alt="preview"
                onError={e => e.target.style.display = 'none'}
                style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
              />
            )}
          </div>

          {err && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444',
              background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13,
            }}>
              <AlertTriangle size={15} /> {err}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !form.question.trim()}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal de resolución ───────────────────────────────────
function ResolveModal({ market, onClose }) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: (outcome) => resolveMarket(market.id, outcome),
    onSuccess: () => {
      qc.invalidateQueries(['admin-markets'])
      qc.invalidateQueries(['markets'])
      qc.invalidateQueries(['market', market.id])
      onClose()
    },
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
        borderRadius: 20, padding: 32, width: '100%', maxWidth: 440,
      }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          Resolver evento
        </h2>
        <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          "{market.question}"
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <button
            className="btn-yes"
            onClick={() => mutation.mutate('YES')}
            disabled={mutation.isPending}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <CheckCircle2 size={18} /> SÍ ocurrió
          </button>
          <button
            className="btn-no"
            onClick={() => mutation.mutate('NO')}
            disabled={mutation.isPending}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <XCircle size={18} /> NO ocurrió
          </button>
        </div>
        <button onClick={onClose} className="btn-secondary" style={{ width: '100%' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── Fila de mercado en la tabla ────────────────────────────
function MarketRow({ market, onEdit, onResolve, onDelete }) {
  const qc = useQueryClient()
  const yes = Math.round(market.pool_yes / (market.pool_yes + market.pool_no) * 100)
  const catColor = CAT_COLORS[market.category] || '#6366f1'
  const betCount = market.bets?.[0]?.count ?? 0
  const commentCount = market.comments?.[0]?.count ?? 0

  const delMut = useMutation({
    mutationFn: () => deleteMarket(market.id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-markets'])
      qc.invalidateQueries(['markets'])
    },
  })

  return (
    <tr style={{ borderBottom: '1px solid var(--color-surface-700)' }}>
      {/* Evento */}
      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span className="badge" style={{
            background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30`,
            flexShrink: 0, marginTop: 2,
          }}>
            {market.category}
          </span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', lineHeight: 1.4, marginBottom: 4 }}>
              {market.question}
            </p>
            {market.closes_at && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8b949e' }}>
                <Clock size={11} />
                {format(new Date(market.closes_at), 'd MMM yyyy', { locale: es })}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Odds */}
      <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{yes}%</div>
        <div style={{ fontSize: 11, color: '#8b949e' }}>SÍ</div>
      </td>

      {/* Volumen */}
      <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>
          ${(market.pool_yes + market.pool_no).toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: '#8b949e' }}>{betCount} apuestas</div>
      </td>

      {/* Comentarios */}
      <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{commentCount}</div>
      </td>

      {/* Estado */}
      <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
        {market.resolved ? (
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: market.outcome === 'YES' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: market.outcome === 'YES' ? '#22c55e' : '#ef4444',
            border: `1px solid ${market.outcome === 'YES' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {market.outcome === 'YES' ? 'SÍ' : 'NO'}
          </span>
        ) : (
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: 'rgba(234,179,8,0.12)', color: '#eab308',
            border: '1px solid rgba(234,179,8,0.3)',
          }}>
            Activo
          </span>
        )}
      </td>

      {/* Acciones */}
      <td style={{ padding: '14px 12px', textAlign: 'right', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Link to={`/market/${market.id}`} target="_blank" style={{ textDecoration: 'none' }}>
            <button title="Ver" style={{
              background: 'var(--color-surface-700)', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer', color: '#8b949e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-600)'; e.currentTarget.style.color = '#e6edf3' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-surface-700)'; e.currentTarget.style.color = '#8b949e' }}
            >
              <ExternalLink size={14} />
            </button>
          </Link>

          {!market.resolved && (
            <>
              <button title="Editar" onClick={() => onEdit(market)} style={{
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                <Edit3 size={14} />
              </button>

              <button title="Resolver" onClick={() => onResolve(market)} style={{
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                <CheckCircle2 size={14} />
              </button>
            </>
          )}

          <button
            title="Eliminar"
            onClick={() => {
              if (confirm('¿Eliminar este evento? Esta acción es irreversible.')) delMut.mutate()
            }}
            disabled={delMut.isPending}
            style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Página principal ──────────────────────────────────────
export default function AdminPage() {
  const { isSignedIn } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [editMarket, setEditMarket] = useState(null)
  const [resolveTarget, setResolveTarget] = useState(null)

  const { data: markets, isLoading } = useQuery({
    queryKey: ['admin-markets'],
    queryFn: getAllMarketsAdmin,
    refetchInterval: 30_000,
  })

  const active   = markets?.filter(m => !m.resolved).length ?? 0
  const resolved = markets?.filter(m =>  m.resolved).length ?? 0
  const totalVol = markets?.reduce((s, m) => s + m.pool_yes + m.pool_no, 0) ?? 0

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Panel de Administración
          </h1>
          <p style={{ color: '#8b949e', fontSize: 14 }}>Gestiona los eventos de predicción de Polycol</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: BarChart2,   label: 'TOTAL EVENTOS',  value: markets?.length ?? 0,               color: '#3b82f6' },
          { icon: TrendingUp,  label: 'ACTIVOS',         value: active,                             color: '#22c55e' },
          { icon: CheckCircle2,label: 'RESUELTOS',        value: resolved,                           color: '#a855f7' },
          { icon: TrendingDown,label: 'VOLUMEN TOTAL',   value: `$${totalVol.toLocaleString()}`,     color: '#eab308' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
            borderRadius: 16, padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: `${s.color}18`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#8b949e', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#e6edf3' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de mercados */}
      <div style={{
        background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-surface-700)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 700 }}>
            Todos los eventos
          </h2>
        </div>

        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#8b949e' }}>Cargando…</div>
        ) : !markets?.length ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#8b949e' }}>
            <BarChart2 size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No hay eventos todavía. <button onClick={() => setShowCreate(true)} style={{ color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>Crear el primero →</button></p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-surface-700)' }}>
                  {['Evento', 'Prob. SÍ', 'Volumen', 'Comentarios', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: h === 'Evento' ? 'left' : 'center',
                      fontSize: 11, fontWeight: 600, color: '#8b949e',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {markets.map(m => (
                  <MarketRow
                    key={m.id}
                    market={m}
                    onEdit={setEditMarket}
                    onResolve={setResolveTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <MarketFormModal onClose={() => setShowCreate(false)} />}
      {editMarket  && <MarketFormModal initial={editMarket} onClose={() => setEditMarket(null)} />}
      {resolveTarget && <ResolveModal market={resolveTarget} onClose={() => setResolveTarget(null)} />}
    </div>
  )
}
