import React, { useState, useEffect } from 'react';
import { useTheme }  from '../context/ThemeContext';
import { useLeague } from '../context/LeagueContext';
import { getClubs, filterClubs }   from '../firebase/clubService';
import { getPlayers } from '../firebase/playerService';
import ClubCard      from '../components/clubs/ClubCard';
import SquadPage     from '../components/clubs/SquadPage';
import PlayerProfile from '../components/players/PlayerProfile';

export default function ClubsPage({ mobileSearchQ = '' }) {
  const { dark }                      = useTheme();
  const { activeLeague, clearLeague } = useLeague();

  const [allClubs,       setAllClubs]       = useState([]);
  const [allPlayers,     setAllPlayers]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [desktopQ,       setDesktopQ]       = useState('');
  const [selectedClub,   setSelectedClub]   = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Fetch clubs and players ONCE from Firestore
  useEffect(() => {
    setLoading(true);
    Promise.all([getClubs(), getPlayers()])
      .then(([clubs, players]) => {
        setAllClubs(clubs);
        setAllPlayers(players);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const effectiveQ = (mobileSearchQ || desktopQ).trim();

  const filtered = filterClubs(allClubs, { q: effectiveQ, activeLeague });

  const clearAll = () => { clearLeague(); setDesktopQ(''); };

  const t1 = dark ? 'text-white'    : 'text-gray-900';
  const t3 = dark ? 'text-gray-400' : 'text-gray-500';

  // Show player profile
  if (selectedPlayer) return (
    <PlayerProfile player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />
  );

  // Show club squad — filter players by club id (use the slug-based id field)
  if (selectedClub) {
    // Match by club's 'id' slug field (e.g. "arsenal"), not Firestore doc id
    // Match by cid (slug) OR by club name to handle both old and new data formats
    const clubSlug = selectedClub.id || selectedClub.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
    const squad = allPlayers.filter(p => {
      const pCid = (p.cid || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pClub = (p.club || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cName = (selectedClub.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return pCid === clubSlug || pCid === cName || pClub === cName;
    });
    return (
      <SquadPage
        club={selectedClub}
        squad={squad}
        onBack={() => setSelectedClub(null)}
        onPlayerClick={setSelectedPlayer}
      />
    );
  }

  return (
    <div className="p-4 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#cc0000] flex-wrap gap-2">
        <div>
          <h2 className={`text-[0.95rem] font-extrabold uppercase tracking-wide ${t1}`}>Clubs</h2>
          {activeLeague && <p className="text-[0.6rem] font-bold text-[#cc0000] uppercase mt-0.5">League: {activeLeague}</p>}
          {effectiveQ   && <p className="text-[0.6rem] font-bold text-[#cc0000] uppercase mt-0.5">Search: "{effectiveQ}"</p>}
        </div>
        <div className="flex items-center gap-2">

          {(activeLeague || effectiveQ) && (
            <button onClick={clearAll} className="text-[0.58rem] font-bold text-[#cc0000] uppercase hover:opacity-70">Clear ✕</button>
          )}
        </div>
      </div>

      {/* Desktop search */}
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
          placeholder="Search clubs, leagues, managers…"
          className={`bg-transparent border-none outline-none text-[0.78rem] w-full ${
            dark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
          }`}
        />
        {desktopQ && (
          <button onClick={() => setDesktopQ('')} className={`text-sm flex-shrink-0 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>✕</button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className={`flex items-center justify-center py-24 ${t3}`}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[0.72rem] font-bold uppercase tracking-widest">Loading clubs…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-24">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-[0.72rem] font-bold uppercase tracking-widest text-red-400">Failed to load clubs</p>
          <p className={`text-[0.65rem] mt-1 ${t3}`}>{error}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.length > 0
            ? filtered.map((c, i) => (
                <ClubCard
                  key={c.firestoreId || c.id || i}
                  club={c}
                  trackedCount={allPlayers.filter(p => p.cid === c.id).length}
                  onClick={setSelectedClub}
                />
              ))
            : (
              <div className={`col-span-full text-center py-20 ${t3}`}>
                <p className="text-4xl mb-3 opacity-30">🏟️</p>
                <p className="text-[0.72rem] font-bold uppercase tracking-widest">No clubs found</p>
                {(activeLeague || effectiveQ) && (
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
