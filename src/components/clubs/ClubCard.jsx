import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { searchTeam } from '../../services/sportsDbApi';

const logoCache = {};

export default function ClubCard({ club, trackedCount, onClick }) {
  const { dark } = useTheme();
  const [logo,   setLogo]   = useState(club.logo || '');
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    // If existing logo works and isn't Wikipedia, use it
    if (club.logo && !club.logo.includes('wikipedia') && !club.logo.includes('wikimedia')) {
      setLogo(club.logo);
      return;
    }

    if (logoCache[club.name]) {
      setLogo(logoCache[club.name]);
      return;
    }

    // Fetch from TheSportsDB
    searchTeam(club.name).then(raw => {
      if (raw) {
        const url = raw.strTeamBadge || raw.strBadge || '';
        if (url) {
          logoCache[club.name] = url;
          setLogo(url);
        }
      }
    }).catch(() => {});
  }, [club.name, club.logo]);

  return (
    <div
      onClick={() => onClick(club)}
      className={`rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${dark ? 'bg-[#1a1a1a]' : 'bg-white'}`}
    >
      {/* Logo */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden mb-2 flex-shrink-0 ${dark ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
        {logo && !imgErr ? (
          <img src={logo} alt={club.name} className="w-full h-full object-contain p-1.5" onError={() => setImgErr(true)} />
        ) : (
          <span className="text-2xl font-black text-[#cc0000]">{club.name?.slice(0, 2).toUpperCase()}</span>
        )}
      </div>

      <p className={`text-[0.82rem] font-extrabold uppercase tracking-tight mb-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>{club.name}</p>
      <p className="text-[0.56rem] font-bold text-[#cc0000] uppercase tracking-widest mb-1">{club.league}</p>
      <p className={`text-[0.56rem] font-semibold uppercase tracking-wide leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
        {club.city}{club.est ? ` · Est. ${club.est}` : ''}
      </p>
      {club.mgr && <p className={`text-[0.56rem] font-semibold uppercase tracking-wide ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Mgr: {club.mgr}</p>}

      <div className={`flex gap-3 mt-2 pt-2 border-t w-full ${dark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
        <div className="flex-1 text-center">
          <span className={`block font-mono text-[0.8rem] font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{trackedCount}</span>
          <span className={`block text-[0.44rem] font-bold uppercase tracking-wider mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Players</span>
        </div>
        <div className="flex-1 text-center">
          <span className={`block font-mono text-[0.8rem] font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{club.trophies || '—'}</span>
          <span className={`block text-[0.44rem] font-bold uppercase tracking-wider mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Trophies</span>
        </div>
      </div>
    </div>
  );
}
