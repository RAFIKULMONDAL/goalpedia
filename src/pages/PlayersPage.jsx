import React, { useState, useEffect } from 'react';
import { useTheme }    from '../context/ThemeContext';
import { useLeague }   from '../context/LeagueContext';
import { getPlayers, filterPlayers } from '../firebase/playerService';
import PlayerCard    from '../components/players/PlayerCard';
import PlayerProfile from '../components/players/PlayerProfile';

const POS_NAMES   = { All:'All Positions', FW:'Forwards', MF:'Midfielders', DF:'Defenders', GK:'Goalkeepers' };
const POS_FILTERS = ['All','FW','MF','DF','GK'];

export default function PlayersPage({ mobileSearchQ = '' }) {
  const { dark }                      = useTheme();
  const { activeLeague, clearLeague } = useLeague();

  const [allPlayers, setAllPlayers] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [desktopQ,   setDesktopQ]   = useState('');
  const [posF,       setPosF]       = useState('All');
  const [ddOpen,     setDdOpen]     = useState(false);
  const [selected,   setSelected]   = useState(null);

  // Fetch all players ONCE from Firestore on mount
  useEffect(() => {
    setLoading(true);
    getPlayers()
      .then(data  => { setAllPlayers(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  // Active search query — mobile takes priority over desktop
  const effectiveQ = (mobileSearchQ || desktopQ).trim();

  // All filtering done in JS — instant, no extra Firestore reads
  const filtered = filterPlayers(allPlayers, {
    q: effectiveQ,
    pos: posF,
    activeLeague,
  });

  const clearAll = () => { clearLeague(); setPosF('All'); setDesktopQ(''); };

  const t1 = dark ? 'text-white'    : 'text-gray-900';
  const t3 = dark ? 'text-gray-400' : 'text-gray-500';

  if (selected) return <PlayerProfile player={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="p-4 flex-1" onClick={() => setDdOpen(false)}>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#cc0000] flex-wrap gap-2">
        <div>
          <h2 className={`text-[0.95rem] font-extrabold uppercase tracking-wide ${t1}`}>Players</h2>
          {activeLeague && <p className="text-[0.6rem] font-bold text-[#cc0000] uppercase mt-0.5">League: {activeLeague}</p>}
          {effectiveQ   && <p className="text-[0.6rem] font-bold text-[#cc0000] uppercase mt-0.5">Search: "{effectiveQ}"</p>}
        </div>
        <div className="flex items-center gap-2">

          {(activeLeague || effectiveQ || posF !== 'All') && (
            <button onClick={clearAll} className="text-[0.58rem] font-bold text-[#cc0000] uppercase hover:opacity-70">Clear ✕</button>
          )}

          {/* Position dropdown */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setDdOpen(o => !o)}
              className={`flex items-center gap-1.5 text-[0.63rem] font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-lg border-[1.5px] min-w-[90px] justify-between transition-all ${
                ddOpen
                  ? 'border-[#cc0000]/60 text-[#cc0000]'
                  : dark
                    ? 'bg-[#222] border-white/[0.06] text-gray-300'
                    : 'bg-gray-100 border-black/[0.06] text-gray-600'
              }`}
            >
              <span>{POS_NAMES[posF]}</span>
              <span className={`text-[0.5rem] opacity-50 inline-block transition-transform ${ddOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {ddOpen && (
              <div className={`absolute right-0 top-[calc(100%+4px)] w-44 rounded-xl overflow-hidden shadow-2xl z-50 border-t-2 border-[#cc0000] ${dark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-black/10'}`}>
                {POS_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => { setPosF(f); setDdOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-[0.65rem] font-bold uppercase tracking-wide transition-colors text-left ${
                      posF === f
                        ? 'text-[#cc0000] bg-[#cc0000]/10'
                        : dark ? 'text-gray-300 hover:bg-[#cc0000]/10 hover:text-[#cc0000]'
                               : 'text-gray-600 hover:bg-[#cc0000]/10 hover:text-[#cc0000]'
                    }`}
                  >
                    {POS_NAMES[f]}
                    {posF === f && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop search bar — hidden on mobile (mobile uses header search) */}
      <div className={`hidden md:flex items-center gap-2 rounded-lg px-3 py-2.5 border-[1.5px] mb-4 max-w-sm transition-colors ${
        dark ? 'bg-[#222] border-white/[0.06] focus-within:border-[#cc0000]/50'
             : 'bg-gray-100 border-black/[0.06] focus-within:border-[#cc0000]/40'
      }`}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"
          className={`flex-shrink-0 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          value={desktopQ}
          onChange={e => setDesktopQ(e.target.value)}
          placeholder="Search players, clubs, nationality…"
          className={`bg-transparent border-none outline-none text-[0.78rem] w-full ${
            dark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
          }`}
        />
        {desktopQ && (
          <button onClick={() => setDesktopQ('')} className={`text-sm flex-shrink-0 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>✕</button>
        )}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className={`flex items-center justify-center py-24 ${t3}`}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[0.72rem] font-bold uppercase tracking-widest">Loading players…</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-24">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-[0.72rem] font-bold uppercase tracking-widest text-red-400">Failed to load players</p>
          <p className={`text-[0.65rem] mt-1 ${t3}`}>{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); getPlayers().then(d => { setAllPlayers(d); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); }); }}
            className="mt-3 text-[0.65rem] font-bold text-[#cc0000] uppercase hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Player grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.length > 0
            ? filtered.map((p, i) => (
                <PlayerCard key={p.firestoreId || p.name || i} player={p} onClick={setSelected} />
              ))
            : (
              <div className={`col-span-full text-center py-20 ${t3}`}>
                <p className="text-4xl mb-3 opacity-30">⚽</p>
                <p className="text-[0.72rem] font-bold uppercase tracking-widest">No players found</p>
                {(effectiveQ || activeLeague || posF !== 'All') && (
                  <button onClick={clearAll} className="mt-3 text-[0.65rem] font-bold text-[#cc0000] uppercase hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
