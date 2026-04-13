# Polycol – Prediction Market Clone

A fully functional Polymarket-inspired prediction market built with:

- ⚡ **Vite 5** + **React 19**
- 🎨 **Tailwind CSS v3** (dark theme)
- 🔐 **Clerk** – authentication
- 🗄️ **Supabase** – database + RLS
- 📊 **Recharts** – charts
- 🔄 **React Query** – server state

## Quick Start

### 1. Configure env variables

Copy `.env.example` → `.env` and fill in your keys:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. Set up Supabase

Run the SQL in `supabase/schema.sql` in your Supabase project's SQL editor.
This creates the `users`, `markets`, and `bets` tables with RLS policies and seeds sample markets.

### 3. Install and run

```bash
npm install
npm run dev
```

App will be at http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx       # Sticky nav with balance pill
│   ├── MarketCard.jsx   # Clickable market card
│   ├── BetPanel.jsx     # Bet placement UI
│   └── Skeletons.jsx    # Loading states
├── hooks/
│   └── useUserBalance.js
├── lib/
│   ├── api.js           # All Supabase queries
│   └── supabase.js      # Client singleton
├── pages/
│   ├── HomePage.jsx     # Market listing + hero
│   ├── MarketPage.jsx   # Detail + chart + bet
│   ├── PortfolioPage.jsx
│   └── AuthPage.jsx
├── App.jsx
├── main.jsx
└── index.css            # Full design system
supabase/
└── schema.sql
```

## Features

- 🏠 **Home** – market grid, category filters, search
- 📊 **Market page** – donut chart, live odds, AMM-priced bets
- 💼 **Portfolio** – balance, bet history
- 🔒 **Auth guard** – protected pages via Clerk
- 💰 **AMM pricing** – price = pool_outcome / total_pool
- 🔴🟢 **Real-time balance** – updates after every bet
