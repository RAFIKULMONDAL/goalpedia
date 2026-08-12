# ⚽ Goalpedia — Football Stats Web App

ESPN-style football player stats, club data, news and leaderboards.

## 🛠 Tech Stack
- **React 18** — functional components + hooks
- **Tailwind CSS v3** — utility-first styling
- **React Router v6** — client-side routing
- **Context API** — global theme & auth state

## 📁 Project Structure
```
goalpedia/
├── public/index.html
├── src/
│   ├── App.jsx                         # Root app with routing
│   ├── index.js                        # React entry point
│   ├── index.css                       # Tailwind + custom styles
│   ├── context/
│   │   ├── ThemeContext.jsx            # Dark/light mode
│   │   └── AuthContext.jsx             # Login/register state
│   ├── data/
│   │   ├── players.js                  # 14 players data
│   │   ├── clubs.js                    # 12 clubs data
│   │   └── news.js                     # News articles & ticker
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx              # Sticky top navbar
│   │   │   ├── LiveBand.jsx            # Red live league band
│   │   │   └── Footer.jsx              # 4-col footer
│   │   ├── players/
│   │   │   ├── PlayerCard.jsx          # Player card tile
│   │   │   └── PlayerProfile.jsx       # Full player detail page
│   │   ├── clubs/
│   │   │   ├── ClubCard.jsx            # Club tile card
│   │   │   └── SquadPage.jsx           # Club squad view
│   │   ├── news/
│   │   │   └── NewsPage.jsx            # News feed
│   │   ├── stats/
│   │   │   └── StatsHub.jsx            # Leaderboards
│   │   └── auth/
│   │       └── AuthModal.jsx           # Login/register modal
│   └── pages/
│       ├── PlayersPage.jsx             # /players route
│       ├── ClubsPage.jsx               # /clubs route
│       ├── NewsPageWrapper.jsx         # /news route
│       └── StatsPage.jsx               # /stats route
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🚀 Getting Started

### Install & Run
```bash
cd goalpedia
npm install
npm start
```
Opens at **http://localhost:3000**

### Build for Production
```bash
npm run build
```

## 🔐 Demo Login
- **Email:** demo@goalpedia.com  
- **Password:** demo123

## ✨ Features
- ✅ Multi-row player card grid (auto-fill responsive)
- ✅ Player search + position filter dropdown
- ✅ Full player profiles (season + all-time stats, attributes, match log)
- ✅ Clubs section with search bar (by name, league, city, manager)
- ✅ Club squad drill-down → player profile
- ✅ News feed with ticker + featured story
- ✅ Stats Hub — Top Scorers, Assisters, Rated, Dribblers
- ✅ Login / Register modal with demo account
- ✅ Dark / Light mode toggle (persisted in localStorage)
- ✅ Fully responsive (mobile → 4K)
- ✅ ESPN-style charcoal red theme

## 🔮 Backend (Coming Soon)
When you're ready to connect a real backend:
- **Node.js + Express** REST API
- **MongoDB + Mongoose** database
- **JWT** authentication (replace in-memory auth)
- **FootData.org API** for live player stats
