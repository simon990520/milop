import { supabase } from './supabase'

// ──────────────────────────────────────────────────────────
// MERCADOS
// ──────────────────────────────────────────────────────────

export async function getMarkets({ category = null } = {}) {
  let query = supabase
    .from('markets')
    .select('*')
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMarketById(id) {
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ──────────────────────────────────────────────────────────
// ADMIN – GESTIÓN DE MERCADOS
// ──────────────────────────────────────────────────────────

export async function getAllMarketsAdmin() {
  const { data, error } = await supabase
    .from('markets')
    .select('*, bets(count), comments(count)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createMarket({
  question, description, category, closes_at, image_url, createdBy
}) {
  const { data, error } = await supabase
    .from('markets')
    .insert({
      question,
      description,
      category,
      closes_at: closes_at || null,
      image_url: image_url || null,
      created_by: createdBy || null,
      pool_yes: 500,
      pool_no: 500,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMarket(id, fields) {
  const { data, error } = await supabase
    .from('markets')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function resolveMarket(id, outcome) {
  const { error } = await supabase.rpc('resolve_market_and_payout', {
    p_market_id: id,
    p_outcome: outcome
  })
  if (error) throw error
  return true
}

export async function deleteMarket(id) {
  const { error } = await supabase
    .from('markets')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ──────────────────────────────────────────────────────────
// BILLETERA (WALLET)
// ──────────────────────────────────────────────────────────

export async function depositFunds(amount) {
  const { error } = await supabase.rpc('deposit_funds', { p_amount: amount })
  if (error) throw error
}

export async function withdrawFunds(amount) {
  const { error } = await supabase.rpc('withdraw_funds', { p_amount: amount })
  if (error) throw error
}

// ──────────────────────────────────────────────────────────
// USUARIOS
// ──────────────────────────────────────────────────────────

export async function getOrCreateUser(clerkUser) {
  const { data: existing, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', clerkUser.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (existing) return existing

  const { data: created, error: insertErr } = await supabase
    .from('users')
    .insert({
      id: clerkUser.id,
      username: clerkUser.username || clerkUser.firstName || 'Trader',
      avatar_url: clerkUser.imageUrl || null,
      balance: 1000.00,
    })
    .select()
    .single()

  if (insertErr) throw insertErr
  return created
}

export async function getUserBalance(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data?.balance ?? 0
}

// ──────────────────────────────────────────────────────────
// APUESTAS
// ──────────────────────────────────────────────────────────

export async function placeBet({ marketId, outcome, amount }) {
  const { error } = await supabase.rpc('place_bet', {
    p_market_id: marketId,
    p_outcome: outcome,
    p_amount: amount
  })
  if (error) throw error
  return true
}

export async function getUserBets(userId) {
  const { data, error } = await supabase
    .from('bets')
    .select('*, markets(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ──────────────────────────────────────────────────────────
// COMENTARIOS
// ──────────────────────────────────────────────────────────

export async function getComments(marketId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('market_id', marketId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addComment({ marketId, userId, username, avatarUrl, content }) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      market_id: marketId,
      user_id: userId,
      username: username || 'Anónimo',
      avatar_url: avatarUrl || null,
      content: content.trim(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteComment(commentId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
  if (error) throw error
}
