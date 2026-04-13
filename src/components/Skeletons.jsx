/** Simple reusable skeleton loaders */

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 60, height: 20 }} />
        <div className="skeleton" style={{ width: 80, height: 16 }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '75%', height: 18, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 999, marginBottom: 10 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 60, height: 16 }} />
        <div className="skeleton" style={{ width: 60, height: 16 }} />
      </div>
      <div className="skeleton" style={{ width: '40%', height: 14 }} />
    </div>
  )
}

export function MarketDetailSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ width: 100, height: 24, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: '100%', height: 28, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: '60%', height: 28, marginBottom: 32 }} />
      <div className="skeleton" style={{ width: '100%', height: 160, borderRadius: 16 }} />
    </div>
  )
}
