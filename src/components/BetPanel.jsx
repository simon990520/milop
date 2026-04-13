import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { placeBet } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react'

export default function BetPanel({ market }) {
  const { user, isSignedIn, clerkEnabled } = useAuth()
  const queryClient = useQueryClient()
  const [outcome, setOutcome] = useState('YES')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  const totalPool = market.pool_yes + market.pool_no
  const priceYes = market.pool_yes / totalPool
  const priceNo  = market.pool_no  / totalPool
  const price    = outcome === 'YES' ? priceYes : priceNo
  const shares   = amount ? (parseFloat(amount) / price).toFixed(4) : '—'
  const potentialWin = amount ? (parseFloat(amount) / price).toFixed(2) : '—'

  const mutation = useMutation({
    mutationFn: () =>
      placeBet({ userId: user.id, marketId: market.id, outcome, amount: parseFloat(amount), market }),
    onSuccess: () => {
      setStatus('success')
      setAmount('')
      queryClient.invalidateQueries(['market', market.id])
      queryClient.invalidateQueries(['userBalance', user.id])
      queryClient.invalidateQueries(['userBets', user.id])
      setTimeout(() => setStatus(null), 4000)
    },
    onError: (err) => {
      setStatus('error')
      setErrMsg(err.message || 'Something went wrong')
      setTimeout(() => setStatus(null), 5000)
    },
  })

  const handleBet = (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setStatus(null)
    mutation.mutate()
  }

  return (
    <div style={{
      background: 'var(--color-surface-800)',
      border: '1px solid var(--color-surface-700)',
      borderRadius: 16, padding: 24,
    }}>
      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
        Realizar Apuesta
      </h3>

      {/* Outcome toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {['YES', 'NO'].map(o => (
          <button
            key={o}
            onClick={() => setOutcome(o)}
            style={{
              padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 15, transition: 'all 0.15s ease',
              background: outcome === o
                ? o === 'YES' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#b91c1c)'
                : 'var(--color-surface-700)',
              color: outcome === o ? 'white' : '#8b949e',
              boxShadow: outcome === o
                ? o === 'YES' ? '0 4px 16px rgba(34,197,94,0.25)' : '0 4px 16px rgba(239,68,68,0.25)'
                : 'none',
            }}
          >
            {o} · {Math.round(o === 'YES' ? priceYes * 100 : priceNo * 100)}¢
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#8b949e', fontWeight: 500, display: 'block', marginBottom: 6 }}>
          Cantidad (USD)
        </label>
        <input type="number" min="1" step="1" value={amount}
          onChange={e => setAmount(e.target.value)} placeholder="Ingresa un monto…" />
      </div>

      {/* Quick amounts */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[10, 25, 50, 100].map(v => (
          <button key={v} onClick={() => setAmount(String(v))} style={{
            flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'var(--color-surface-700)', border: '1px solid var(--color-surface-600)',
            color: '#8b949e', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.background = 'var(--color-surface-600)'; e.target.style.color = '#e6edf3' }}
            onMouseLeave={e => { e.target.style.background = 'var(--color-surface-700)'; e.target.style.color = '#8b949e' }}
          >
            ${v}
          </button>
        ))}
      </div>

      {/* Summary */}
      {amount && (
        <div style={{
          background: 'var(--color-surface-900)', borderRadius: 10, padding: 14, marginBottom: 20,
          border: '1px solid var(--color-surface-700)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: '#8b949e' }}>Precio por acción</span>
            <span style={{ color: '#e6edf3', fontWeight: 600 }}>{(price * 100).toFixed(1)}¢</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: '#8b949e' }}>Acciones</span>
            <span style={{ color: '#e6edf3', fontWeight: 600 }}>{shares}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#8b949e' }}>Ganancia potencial</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>${potentialWin}</span>
          </div>
        </div>
      )}

      {/* Status messages */}
      {status === 'success' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e',
          background: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: '10px 14px',
          marginBottom: 16, fontSize: 13, fontWeight: 500,
        }}>
          <CheckCircle2 size={16} /> ¡Apuesta realizada con éxito!
        </div>
      )}
      {status === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444',
          background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '10px 14px',
          marginBottom: 16, fontSize: 13, fontWeight: 500,
        }}>
          <AlertCircle size={16} /> {errMsg}
        </div>
      )}

      {/* CTA */}
      {isSignedIn ? (
        <button
          onClick={handleBet}
          disabled={mutation.isPending || !amount}
          className={outcome === 'YES' ? 'btn-yes' : 'btn-no'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {mutation.isPending
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
            : `Apostar ${outcome} ${amount ? `$${amount}` : ''}`
          }
        </button>
      ) : (
        <Link to="/auth" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Lock size={15} />
            {clerkEnabled ? 'Iniciar sesión para apostar' : 'Auth no configurado'}
          </button>
        </Link>
      )}
    </div>
  )
}
