import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function MobileSearchBar({ open, q, setQ, onClose }) {
  const { dark }    = useTheme();
  const navigate    = useNavigate();
  const location    = useLocation();
  const inputRef    = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const doSearch = () => {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (location.pathname === '/clubs') {
      navigate(`/clubs?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/players?q=${encodeURIComponent(trimmed)}`);
    }
    // keep search bar open with query visible
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  doSearch();
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div className={`md:hidden px-3 py-2 border-b ${dark ? 'bg-[#1a1a1a] border-white/[0.06]' : 'bg-white border-black/[0.06]'}`}>
      <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border-[1.5px] transition-colors ${
        dark
          ? 'bg-[#222] border-white/[0.06] focus-within:border-[#cc0000]/50'
          : 'bg-gray-100 border-black/[0.06] focus-within:border-[#cc0000]/40'
      }`}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"
          className={`flex-shrink-0 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKey}
          placeholder={location.pathname === '/clubs' ? 'Search clubs, leagues, managers…' : 'Search players, clubs, nationality…'}
          className={`bg-transparent border-none outline-none text-[0.8rem] w-full ${
            dark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
          }`}
        />
        {q ? (
          <button onClick={() => setQ('')} className={`text-sm flex-shrink-0 ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>✕</button>
        ) : (
          <button onClick={onClose} className={`text-[0.6rem] font-bold uppercase tracking-wide flex-shrink-0 ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>Cancel</button>
        )}
      </div>
    </div>
  );
}
