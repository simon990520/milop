import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import MarketPage from './pages/MarketPage'
import PortfolioPage from './pages/PortfolioPage'
import AuthPage from './pages/AuthPage'
import AdminPage from './pages/AdminPage'

function ProtectedPortfolio() {
  const { isSignedIn, isLoaded, clerkEnabled } = useAuth()
  if (!clerkEnabled) return <PortfolioPage />
  if (!isLoaded) return null
  if (!isSignedIn) return <AuthPage />
  return <PortfolioPage />
}

export default function App({ clerkEnabled = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/market/:id" element={<MarketPage />} />
          <Route path="/portfolio"  element={<ProtectedPortfolio />} />
          <Route path="/auth"       element={<AuthPage />} />
          <Route path="/admin"      element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  )
}
