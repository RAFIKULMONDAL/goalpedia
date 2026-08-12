import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider }  from './context/ThemeContext';
import { AuthProvider }   from './context/AuthContext';
import { LeagueProvider } from './context/LeagueContext';
import Navbar          from './components/layout/Navbar';
import LiveBand        from './components/layout/LiveBand';
import MobileSearchBar from './components/layout/MobileSearchBar';
import Footer          from './components/layout/Footer';
import AuthModal       from './components/auth/AuthModal';
import PlayersPage     from './pages/PlayersPage';
import ClubsPage       from './pages/ClubsPage';
import NewsPageWrapper from './pages/NewsPageWrapper';
import StatsPage       from './pages/StatsPage';
import AboutPage       from './pages/AboutPage';
import ContactPage     from './pages/ContactPage';
import AdminSync       from './pages/AdminSync';
import { initNewsAutoSync, stopNewsAutoSync } from './services/newsAutoSync';
import { useEffect } from 'react';

export default function App() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Initialize smart news auto-sync on app start
  useEffect(() => {
    initNewsAutoSync();
    return () => stopNewsAutoSync();
  }, []);
  const [mobileSearchQ,    setMobileSearchQ]    = useState('');

  const toggleMobileSearch = () => {
    setMobileSearchOpen(o => !o);
    if (mobileSearchOpen) setMobileSearchQ('');
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setMobileSearchQ('');
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <LeagueProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen flex flex-col">
              <Navbar
                onMobileSearch={toggleMobileSearch}
                mobileSearchOpen={mobileSearchOpen}
              />
              <LiveBand />
              <MobileSearchBar
                open={mobileSearchOpen}
                q={mobileSearchQ}
                setQ={setMobileSearchQ}
                onClose={closeMobileSearch}
              />
              <main className="flex-1 flex flex-col">
                <Routes>
                  <Route path="/"        element={<Navigate to="/players" replace />} />
                  <Route path="/players" element={<PlayersPage mobileSearchQ={mobileSearchQ} />} />
                  <Route path="/clubs"   element={<ClubsPage   mobileSearchQ={mobileSearchQ} />} />
                  <Route path="/news"    element={<NewsPageWrapper />} />
                  <Route path="/stats"   element={<StatsPage />} />
                  <Route path="/about"   element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/admin"   element={<AdminSync />} />
                  <Route path="*"        element={<Navigate to="/players" replace />} />
                </Routes>
              </main>
              <Footer />
              <AuthModal />
            </div>
          </BrowserRouter>
        </LeagueProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
