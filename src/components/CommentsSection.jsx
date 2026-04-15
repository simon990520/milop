import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getComments, addComment, deleteComment, toggleCommentReaction, getCommentReactions } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Send, Trash2, MessageCircle, Lock, Banknote } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

function Avatar({ username, avatarUrl, size = 36 }) {
  const initial = (username?.[0] || 'A').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#22c55e,#3b82f6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: 'white',
      overflow: 'hidden',
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
        : initial
      }
    </div>
  )
}

function CommentItem({ comment, currentUserId, onDelete }) {
  const isOwn = currentUserId && comment.user_id === currentUserId
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '16px 0',
      borderBottom: '1px solid var(--color-surface-700)',
      animation: 'fadeInUp 0.3s ease',
    }}>
      <Avatar username={comment.username} avatarUrl={comment.avatar_url} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#e6edf3' }}>
              {comment.username}
            </span>
            <span style={{ fontSize: 11, color: '#8b949e' }}>
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>
          {isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8b949e', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
              title="Eliminar comentario"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <p style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.6, wordBreak: 'break-word', marginBottom: 12 }}>
          {comment.content}
        </p>
        <CommentReactions commentId={comment.id} currentUserId={currentUserId} />
      </div>
    </div>
  )
}

function CommentReactions({ commentId, currentUserId }) {
  const qc = useQueryClient()
  const { data: reactions, isLoading } = useQuery({
    queryKey: ['reactions', commentId],
    queryFn: () => getCommentReactions(commentId)
  })

  const reactMut = useMutation({
    mutationFn: () => toggleCommentReaction(commentId, currentUserId),
    onSuccess: () => qc.invalidateQueries(['reactions', commentId])
  })

  if (isLoading) return <div className="skeleton" style={{ width: 40, height: 24, borderRadius: 6 }} />

  const hasReacted = reactions?.some(r => r.user_id === currentUserId)
  const count = reactions?.length ?? 0

  return (
    <button 
      onClick={() => currentUserId && reactMut.mutate()}
      disabled={!currentUserId}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 8px', borderRadius: 8, border: '1px solid',
        borderColor: hasReacted ? 'rgba(34,197,94,0.4)' : 'rgba(48,54,61,0.6)',
        background: hasReacted ? 'rgba(34,197,94,0.1)' : 'transparent',
        color: hasReacted ? '#22c55e' : '#8b949e',
        fontSize: 12, fontWeight: 600, cursor: currentUserId ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => { if (currentUserId) e.currentTarget.style.borderColor = '#22c55e' }}
      onMouseLeave={e => { if (currentUserId) e.currentTarget.style.borderColor = hasReacted ? 'rgba(34,197,94,0.4)' : 'rgba(48,54,61,0.6)' }}
    >
      <Banknote size={14} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}

export default function CommentsSection({ marketId }) {
  const { user, isSignedIn, clerkEnabled } = useAuth()
  const [text, setText] = useState('')
  const qc = useQueryClient()

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', marketId],
    queryFn: () => getComments(marketId),
    refetchInterval: 20_000,
  })

  const addMut = useMutation({
    mutationFn: () => addComment({
      marketId,
      userId:    user.id,
      username:  user.username || user.firstName || 'Trader',
      avatarUrl: user.imageUrl || null,
      content:   text,
    }),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries(['comments', marketId])
    },
  })

  const delMut = useMutation({
    mutationFn: (id) => deleteComment(id),
    onSuccess: () => qc.invalidateQueries(['comments', marketId]),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || addMut.isPending) return
    addMut.mutate()
  }

  return (
    <div style={{
      background: 'var(--color-surface-800)',
      border: '1px solid var(--color-surface-700)',
      borderRadius: 16, padding: 24, marginTop: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <MessageCircle size={18} color="#22c55e" />
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16 }}>
          Comentarios
        </h3>
        {comments && (
          <span style={{
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 999, padding: '1px 8px', fontSize: 12, fontWeight: 600, color: '#22c55e',
          }}>
            {comments.length}
          </span>
        )}
      </div>

      {/* Formulario de comentario */}
      {isSignedIn ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar username={user.username || user.firstName} avatarUrl={user.imageUrl} />
            <div style={{ flex: 1 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }}
                placeholder="Escribe tu análisis o predicción…"
                rows={2}
                maxLength={1000}
                style={{
                  background: 'var(--color-surface-900)',
                  border: '1px solid var(--color-surface-600)',
                  borderRadius: 12, padding: '10px 14px',
                  color: '#e6edf3', fontSize: 14, width: '100%',
                  resize: 'vertical', outline: 'none', lineHeight: 1.5,
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-surface-600)'; e.target.style.boxShadow = 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#8b949e' }}>{text.length}/1000</span>
                <button
                  type="submit"
                  disabled={!text.trim() || addMut.isPending}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, padding: '7px 16px',
                    opacity: !text.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={14} />
                  {addMut.isPending ? 'Enviando…' : 'Comentar'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: 'var(--color-surface-900)', borderRadius: 10, padding: '14px 20px',
          marginBottom: 24, fontSize: 14, color: '#8b949e',
          border: '1px solid var(--color-surface-700)',
        }}>
          <Lock size={15} />
          <span>
            {clerkEnabled
              ? <><Link to="/auth" style={{ color: '#22c55e', textDecoration: 'none' }}>Inicia sesión</Link> para comentar</>
              : 'Configura la autenticación para comentar'
            }
          </span>
        </div>
      )}

      {/* Lista de comentarios */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[120, 80, 100].map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: w, height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '100%', height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments?.length === 0 && (
        <div style={{ textAlign: 'center', color: '#8b949e', padding: '32px 0', fontSize: 14 }}>
          <MessageCircle size={32} style={{ opacity: 0.2, marginBottom: 10 }} />
          <p>Sé el primero en comentar este evento.</p>
        </div>
      )}

      {!isLoading && comments?.map(c => (
        <CommentItem
          key={c.id}
          comment={c}
          currentUserId={user?.id}
          onDelete={(id) => delMut.mutate(id)}
        />
      ))}
    </div>
  )
}
