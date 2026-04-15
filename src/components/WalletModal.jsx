import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { depositFunds, withdrawFunds } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { X, Wallet, ArrowDownToLine, ArrowUpFromLine, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function WalletModal({ onClose, balance }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('deposit') // 'deposit' or 'withdraw'
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const val = parseFloat(amount)
      if (tab === 'deposit') return depositFunds(val)
      return withdrawFunds(val)
    },
    onSuccess: () => {
      setStatus('success')
      setAmount('')
      qc.invalidateQueries(['userBalance', user.id])
      setTimeout(() => setStatus(null), 3000)
    },
    onError: (err) => {
      setStatus('error')
      setErrMsg(err.message || 'Error en la transacción')
      setTimeout(() => setStatus(null), 4000)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setStatus(null)
    mutation.mutate()
  }

  const inputStyle = {
    background: 'var(--color-surface-900)',
    border: '1px solid var(--color-surface-600)',
    borderRadius: 10, padding: '12px 14px', fontSize: 16,
    color: '#e6edf3', width: '100%', outline: 'none',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--color-surface-800)', border: '1px solid var(--color-surface-700)',
        borderRadius: 20, width: '100%', maxWidth: 400, overflow: 'hidden'
      }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--color-surface-700)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={20} color="#3b82f6" /> Mi Billetera
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ background: 'var(--color-surface-900)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center', border: '1px solid var(--color-surface-700)' }}>
            <p style={{ fontSize: 12, color: '#8b949e', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Saldo Dispobible</p>
            <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: '#22c55e' }}>
              ${Number(balance).toFixed(2)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button onClick={() => { setTab('deposit'); setStatus(null); setAmount(''); }}
              style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                background: tab === 'deposit' ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: tab === 'deposit' ? '#3b82f6' : '#8b949e',
              }}>
              <ArrowDownToLine size={16} /> Recargar
            </button>
            <button onClick={() => { setTab('withdraw'); setStatus(null); setAmount(''); }}
              style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                background: tab === 'withdraw' ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: tab === 'withdraw' ? '#ef4444' : '#8b949e',
              }}>
              <ArrowUpFromLine size={16} /> Retirar
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#8b949e', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Monto a {tab === 'deposit' ? 'recargar' : 'retirar'} (USD)
              </label>
              <input 
                type="number" min="1" step="0.01" value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" style={inputStyle} autoFocus
              />
            </div>

            {status === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
                <CheckCircle2 size={16} /> ¡Transacción exitosa!
              </div>
            )}
            {status === 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
                <AlertCircle size={16} /> {errMsg}
              </div>
            )}

            <button 
              type="submit" disabled={mutation.isPending || !amount}
              className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            >
              {mutation.isPending ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : (tab === 'deposit' ? 'Confirmar Recarga' : 'Confirmar Retiro')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
