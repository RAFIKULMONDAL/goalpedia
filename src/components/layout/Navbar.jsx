import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth }  from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/players', label: 'Players' },
  { to: '/clubs',   label: 'Clubs' },
  { to: '/news',    label: 'News' },
  { to: '/stats',   label: 'Stats Hub' },
];

export default function Navbar({ onMobileSearch, mobileSearchOpen }) {
  const { dark, toggleTheme } = useTheme();
  const { user, openAuth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profOpen,   setProfOpen]   = useState(false);
  const profRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (profRef.current && !profRef.current.contains(e.target)) setProfOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'U';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* ══ NAVBAR ══ */}
      <header className="sticky top-0 z-50 bg-[#111] border-b-[3px] border-[#cc0000]">
        <div className="h-[52px] flex items-center px-3 gap-2">

          {/* ── MOBILE LEFT: hamburger + logo side by side ── */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden flex-shrink-0 w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-full bg-[#222] hover:bg-[#333] transition-colors"
            aria-label="Open menu"
          >
            <span className="block h-[2px] w-[18px] bg-white rounded-full" />
            <span className="block h-[2px] w-[18px] bg-white rounded-full" />
            <span className="block h-[2px] w-[18px] bg-white rounded-full" />
          </button>

          {/* Logo — left-aligned on mobile (after hamburger), centered on desktop */}
          <NavLink
            to="/players"
            className="flex-shrink-0 flex items-baseline no-underline mr-4"
          >
            <span className="text-[1.1rem] font-black text-white uppercase tracking-tight leading-none">Goal</span>
            <span className="text-[1.1rem] font-black text-[#cc0000] uppercase tracking-tight leading-none">pedia</span>
          </NavLink>

          {/* Desktop nav — centered */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 h-[52px] text-[0.65rem] font-bold uppercase tracking-widest border-b-[3px] transition-colors whitespace-nowrap ${
                    isActive ? 'text-white border-[#cc0000]' : 'text-gray-400 border-transparent hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* ── RIGHT SIDE ── */}
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">

            {/* Search icon — MOBILE ONLY (desktop has inline search in page) */}
            <button
              onClick={onMobileSearch}
              className={`md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                mobileSearchOpen ? 'bg-[#cc0000] text-white' : 'bg-[#222] text-white hover:bg-[#333]'
              }`}
              aria-label="Search"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>

            {/* Divider — mobile only (desktop has no search icon) */}
            <div className="md:hidden w-px h-5 bg-white/10" />

            {/* Theme toggle — before login, both mobile and desktop */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#222] text-white hover:bg-[#333] transition-colors text-sm flex-shrink-0"
              aria-label="Toggle theme"
            >
              {dark ? '☀' : '🌙'}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Auth */}
            {user ? (
              <div className="relative" ref={profRef}>
                <button
                  onClick={() => setProfOpen(o => !o)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#cc0000] hover:bg-[#a80000] text-white text-[0.6rem] font-black transition-colors flex-shrink-0"
                >
                  {initials}
                </button>
                {profOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#cc0000] flex items-center justify-center text-[0.6rem] font-black text-white flex-shrink-0">{initials}</div>
                        <div className="min-w-0">
                          <p className="text-[0.78rem] font-bold text-white truncate uppercase">{displayName}</p>
                          <p className="text-[0.6rem] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => { logout(); setProfOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-wide text-red-400 hover:bg-red-400/10 transition-colors text-left">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="hidden sm:flex h-7 px-3 items-center rounded-md border border-white/15 bg-white/[0.06] text-gray-300 hover:text-white text-[0.6rem] font-bold uppercase tracking-wider transition-all">Sign In</button>
                <button onClick={() => openAuth('register')} className="hidden sm:flex h-7 px-3 items-center rounded-md bg-[#cc0000] text-white text-[0.6rem] font-bold uppercase tracking-wider hover:bg-[#a80000] transition-colors">Register</button>
                <button onClick={() => openAuth('login')} className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full bg-[#222] text-white hover:bg-[#333] transition-colors" aria-label="Sign In">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ══ DRAWER OVERLAY ══ */}
      <div
        className={`fixed inset-0 bg-black/75 z-[200] md:hidden transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ══ MOBILE DRAWER ══ */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-[#111] z-[300] flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-[52px] border-b border-white/[0.08] flex-shrink-0">
          <NavLink to="/players" onClick={() => setDrawerOpen(false)} className="flex items-baseline no-underline">
            <span className="text-[1.1rem] font-black text-white uppercase tracking-tight">Goal</span>
            <span className="text-[1.1rem] font-black text-[#cc0000] uppercase tracking-tight">pedia</span>
          </NavLink>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#222] text-gray-400 hover:text-white hover:bg-[#333] transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="px-4 pt-3 pb-1 text-[0.52rem] font-extrabold text-gray-600 uppercase tracking-[0.16em]">Menu</p>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-5 py-3.5 text-[0.82rem] font-bold uppercase tracking-wide transition-colors border-l-[3px] ${
                  isActive ? 'text-white bg-[#cc0000]/10 border-[#cc0000]' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="h-px bg-white/[0.06] mx-4 my-3" />
          <p className="px-4 pb-1 text-[0.52rem] font-extrabold text-gray-600 uppercase tracking-[0.16em]">Settings</p>
          <button onClick={toggleTheme} className="flex items-center gap-3 px-5 py-3.5 text-[0.82rem] font-bold uppercase tracking-wide text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors w-full text-left border-l-[3px] border-transparent">
            <span>{dark ? '☀' : '🌙'}</span>
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="h-px bg-white/[0.06] mx-4 my-3" />

          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-[#cc0000] flex items-center justify-center text-[0.65rem] font-black text-white flex-shrink-0">{initials}</div>
                <div className="min-w-0">
                  <p className="text-[0.78rem] font-bold text-white truncate">{displayName}</p>
                  <p className="text-[0.62rem] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <button onClick={() => { logout(); setDrawerOpen(false); }} className="flex items-center px-5 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-red-400 hover:bg-red-400/10 transition-colors w-full text-left border-l-[3px] border-transparent">Sign Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 px-4 pt-1 pb-2">
              <button onClick={() => { openAuth('login'); setDrawerOpen(false); }} className="w-full py-2.5 rounded-lg bg-[#222] border border-white/10 text-white text-[0.75rem] font-bold uppercase tracking-wider hover:bg-[#2a2a2a] transition-colors">Sign In</button>
              <button onClick={() => { openAuth('register'); setDrawerOpen(false); }} className="w-full py-2.5 rounded-lg bg-[#cc0000] text-white text-[0.75rem] font-bold uppercase tracking-wider hover:bg-[#a80000] transition-colors">Register</button>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
          <p className="text-[0.54rem] font-semibold text-gray-600 uppercase tracking-wide">© 2025 Goalpedia</p>
        </div>
      </div>
    </>
  );
}
