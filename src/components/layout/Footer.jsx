import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LEAGUES = ['Premier League', 'La Liga', 'Bundesliga', 'UCL', 'MLS', 'Saudi Pro'];

export default function Footer() {
  const navigate = useNavigate();
  const { user, openAuth, logout } = useAuth();

  const link = (label, to, action) => (
    <button
      key={label}
      onClick={action || (() => navigate(to))}
      className="block text-[0.6rem] font-semibold text-gray-500 mb-2 uppercase tracking-wide hover:text-[#cc0000] transition-colors text-left w-full"
    >
      {label}
    </button>
  );

  return (
    <footer className="bg-[#111] border-t-[3px] border-[#cc0000] px-4 pt-8 pb-5 mt-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 max-w-6xl mx-auto">

        {/* Brand */}
        <div>
          <div className="text-lg font-black text-white uppercase mb-1.5">
            Goal<span className="text-[#cc0000]">pedia</span>
          </div>
          <p className="text-[0.62rem] text-gray-500 leading-relaxed max-w-[200px] mb-3">
            Your all-in-one destination for football player stats, club data, and live match intelligence.
          </p>
          <div className="flex flex-wrap gap-1">
            {LEAGUES.map(l => (
              <span key={l} className="font-mono text-[0.46rem] px-1.5 py-0.5 rounded text-red-300 bg-[#cc0000]/10 uppercase tracking-wide">
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <p className="text-[0.6rem] font-extrabold text-white uppercase tracking-widest mb-2.5 pb-1.5 border-b border-white/10">Explore</p>
          {link('Players',  '/players')}
          {link('Clubs',    '/clubs')}
          {link('News',     '/news')}
          {link('Stats Hub','/stats')}
        </div>

        {/* Positions */}
        <div>
          <p className="text-[0.6rem] font-extrabold text-white uppercase tracking-widest mb-2.5 pb-1.5 border-b border-white/10">Positions</p>
          {link('Forwards',   '/players')}
          {link('Midfielders','/players')}
          {link('Defenders',  '/players')}
          {link('Goalkeepers','/players')}
        </div>

        {/* Account */}
        <div>
          <p className="text-[0.6rem] font-extrabold text-white uppercase tracking-widest mb-2.5 pb-1.5 border-b border-white/10">Account</p>

          {user ? (
            link('Sign Out', null, logout)
          ) : (
            <>
              {link('Sign In',  null, () => openAuth('login'))}
              {link('Register', null, () => openAuth('register'))}
            </>
          )}

          {/* About — navigates to /about */}
          {link('About Goalpedia', '/about')}

          {/* Contact — navigates to /contact */}
          {link('Contact Us', '/contact')}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.07] max-w-6xl mx-auto">
        <p className="text-[0.54rem] font-semibold text-gray-600 uppercase tracking-wide">
          © 2026 Goalpedia · Season 2026/27
        </p>
        <div className="flex items-center gap-1.5 font-mono text-[0.52rem] text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
           live
        </div>
      </div>
    </footer>
  );
}
