import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getTeamDetails } from '../../services/sportsDbApi';
import { getClubWikiInfo } from '../../services/wikipediaApi';
import { fetchStandings, fetchRecentResults, fetchUpcomingFixtures, fetchTeamMatches, COMPETITIONS, TEAM_IDS } from '../../services/footballDataApi';
import PlayerCard from '../players/PlayerCard';

export default function SquadPage({ club, squad, onBack, onPlayerClick }) {
  const { dark } = useTheme();
  const [sportsDbData, setSportsDbData] = useState(null);
  const [wikiData,     setWikiData]     = useState(null);
  const [standings,    setStandings]    = useState([]);
  const [results,      setResults]      = useState([]);
  const [fixtures,     setFixtures]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('squad');

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';
  const bg2 = dark ? 'bg-[#222]'     : 'bg-gray-50';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Get competition code for this club's league
        // Only fetch standings for supported leagues (Football-Data.org free tier)
        const compCode = COMPETITIONS[club.league];
        const hasStandings = !!compCode;

        // Fetch club-specific matches if team ID is known
        const hasTeamId = !!TEAM_IDS[club.id];

        const [sdb, wiki, stand, teamMatches] = await Promise.all([
          getTeamDetails(club.name, club.id),
          getClubWikiInfo(club.name),
          hasStandings ? fetchStandings(compCode) : Promise.resolve([]),
          hasTeamId    ? fetchTeamMatches(club.id) : Promise.resolve({ recent: [], upcoming: [] }),
        ]);

        if (sdb)   setSportsDbData(sdb);
        if (wiki)  setWikiData(wiki);
        if (stand) setStandings(stand);

        // Use club-specific matches if available, fallback to league matches
        if (hasTeamId) {
          setResults(teamMatches.recent   || []);
          setFixtures(teamMatches.upcoming || []);
        } else if (hasStandings) {
          const [res, fix] = await Promise.all([
            fetchRecentResults(compCode, 5),
            fetchUpcomingFixtures(compCode, 5),
          ]);
          setResults(res  || []);
          setFixtures(fix || []);
        }
      } catch (e) {
        console.warn('Club data load failed:', e.message);
      }
      setLoading(false);
    }
    loadData();
  }, [club.name, club.league]);

  // Best logo
  const logo = sportsDbData?.logo || club.logo || '';

  const TABS = ['squad', 'info', 'standings', 'fixtures', 'history'];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Back */}
      <div className={`sticky top-0 z-10 px-4 py-2 border-b ${dark ? 'bg-[#0f0f0f] border-white/[0.06]' : 'bg-white border-black/[0.06]'}`}>
        <button onClick={onBack}
          className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-all ${
            dark ? 'bg-[#222] text-white hover:bg-[#cc0000]' : 'bg-gray-100 text-gray-700 hover:bg-[#cc0000] hover:text-white'
          }`}>← Back</button>
      </div>

      {/* Hero */}
      <div className={`${bg1} border-b ${dark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
        <div className="p-5 flex gap-4 items-center">
          <div className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${dark ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
            {logo
              ? <img src={logo} alt={club.name} className="w-full h-full object-contain p-1"
                  onError={e => { e.target.style.display='none'; }} />
              : <span className="text-2xl font-black text-[#cc0000]">{club.name?.slice(0,2).toUpperCase()}</span>
            }
          </div>
          <div>
            <h1 className={`text-xl font-black uppercase tracking-tight ${t1}`}>{club.name}</h1>
            <p className={`text-[0.7rem] ${t3}`}>{club.league}</p>
            <div className="flex gap-3 mt-2 flex-wrap">
              {[
                { label: 'Founded',  value: sportsDbData?.founded  || club.est  || '—' },
                { label: 'City',     value: sportsDbData?.city     || club.city || '—' },
                { label: 'Stadium',  value: sportsDbData?.stadium  || '—' },
                { label: 'Manager',  value: sportsDbData?.manager  || club.mgr  || '—' },
              ].map((item, i) => (
                <div key={i}>
                  <p className={`text-[0.45rem] font-bold uppercase tracking-widest ${t3}`}>{item.label}</p>
                  <p className={`text-[0.68rem] font-bold ${t1}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex overflow-x-auto border-t ${dark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2.5 text-[0.6rem] font-bold uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-[#cc0000] border-[#cc0000]'
                  : `border-transparent ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">

        {/* SQUAD TAB */}
        {activeTab === 'squad' && (
          squad.length > 0
            ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {squad.map((p, i) => <PlayerCard key={p.firestoreId || i} player={p} onClick={onPlayerClick} />)}
              </div>
            : <div className={`text-center py-16 ${t3}`}>
                <p className="text-4xl mb-3 opacity-30">👥</p>
                <p className="text-[0.72rem] font-bold uppercase tracking-widest">No tracked players</p>
              </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Stadium */}
            {sportsDbData?.stadium && (
              <div className={`rounded-xl overflow-hidden ${bg1}`}>
                {sportsDbData.stadiumThumb && (
                  <img src={sportsDbData.stadiumThumb} alt={sportsDbData.stadium}
                    className="w-full h-40 object-cover"
                    onError={e => { e.target.style.display='none'; }} />
                )}
                <div className="p-4">
                  <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-1 text-[#cc0000]`}>🏟️ Stadium</p>
                  <p className={`text-[0.88rem] font-black uppercase ${t1}`}>{sportsDbData.stadium}</p>
                  {sportsDbData.stadiumLocation && <p className={`text-[0.65rem] ${t3}`}>{sportsDbData.stadiumLocation}</p>}
                  {sportsDbData.stadiumCapacity && <p className={`text-[0.65rem] ${t3}`}>Capacity: {parseInt(sportsDbData.stadiumCapacity).toLocaleString()}</p>}
                </div>
              </div>
            )}

            {/* Club details grid */}
            <div className={`rounded-xl p-4 ${bg1}`}>
              <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 ${t1}`}>Club Info</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Full Name',  value: sportsDbData?.name    || club.name },
                  { label: 'Founded',    value: sportsDbData?.founded  || club.est },
                  { label: 'City',       value: sportsDbData?.city     || club.city },
                  { label: 'Country',    value: sportsDbData?.country  || '' },
                  { label: 'Manager',    value: sportsDbData?.manager  || club.mgr },
                  { label: 'League',     value: sportsDbData?.league   || club.league },
                  { label: 'Stadium',    value: sportsDbData?.stadium  || '' },
                  { label: 'Trophies',   value: club.trophies ? `${club.trophies}+` : '' },
                ].filter(i => i.value).map((item, i) => (
                  <div key={i} className={`rounded-lg px-3 py-2 ${bg2}`}>
                    <p className={`text-[0.48rem] font-bold uppercase tracking-widest mb-0.5 ${t3}`}>{item.label}</p>
                    <p className={`text-[0.72rem] font-semibold ${t1}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STANDINGS TAB */}
        {activeTab === 'standings' && (
          <div className={`rounded-xl overflow-hidden ${bg1}`}>
            <div className="px-4 py-3 bg-[#cc0000]">
              <p className="text-[0.65rem] font-extrabold text-white uppercase tracking-widest">{club.league} Standings</p>
            </div>
            {loading ? (
              <div className={`text-center py-10 ${t3}`}>
                <div className="w-6 h-6 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[0.65rem] uppercase tracking-widest">Loading standings…</p>
              </div>
            ) : standings.length > 0 ? (
              <div>
                {/* Header */}
                <div className={`grid grid-cols-12 gap-1 px-3 py-2 text-[0.5rem] font-bold uppercase tracking-widest ${t3} border-b ${dark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
                  <span className="col-span-1">#</span>
                  <span className="col-span-5">Team</span>
                  <span className="col-span-1 text-center">P</span>
                  <span className="col-span-1 text-center">W</span>
                  <span className="col-span-1 text-center">D</span>
                  <span className="col-span-1 text-center">L</span>
                  <span className="col-span-1 text-center">GD</span>
                  <span className="col-span-1 text-center font-black">Pts</span>
                </div>
                {standings.map((row, i) => {
                  const isClub = row.team.toLowerCase().includes(club.name.toLowerCase()) ||
                                 club.name.toLowerCase().includes(row.team.toLowerCase().split(' ')[0]);
                  return (
                    <div key={i} className={`grid grid-cols-12 gap-1 px-3 py-2.5 border-b last:border-b-0 text-[0.65rem] ${
                      dark ? 'border-white/[0.04]' : 'border-black/[0.04]'
                    } ${isClub ? 'bg-[#cc0000]/10' : ''}`}>
                      <span className={`col-span-1 font-bold ${row.position <= 4 ? 'text-[#cc0000]' : t3}`}>{row.position}</span>
                      <div className="col-span-5 flex items-center gap-1.5">
                        {row.crest && <img src={row.crest} alt="" className="w-4 h-4 object-contain" onError={e => e.target.style.display='none'} />}
                        <span className={`font-semibold truncate ${isClub ? 'text-[#cc0000] font-bold' : t1}`}>{row.team}</span>
                      </div>
                      <span className={`col-span-1 text-center ${t3}`}>{row.played}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.won}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.draw}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.lost}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.gd > 0 ? '+' : ''}{row.gd}</span>
                      <span className={`col-span-1 text-center font-black ${t1}`}>{row.points}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-10 ${t3}`}>
                <p className="text-3xl mb-2 opacity-30">📊</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest">
                  {COMPETITIONS[club.league] ? 'No standings data yet' : `Standings not available for ${club.league}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* FIXTURES TAB */}
        {activeTab === 'fixtures' && (
          <div className="space-y-4">
            {/* Recent results */}
            {results.length > 0 && (
              <div className={`rounded-xl overflow-hidden ${bg1}`}>
                <div className="px-4 py-3 bg-[#222]">
                  <p className="text-[0.65rem] font-extrabold text-white uppercase tracking-widest">{club.name} — Recent Results</p>
                </div>
                {results.map((m, i) => (
                  <MatchRow key={i} match={m} dark={dark} t1={t1} t3={t3} bg2={bg2} />
                ))}
              </div>
            )}

            {/* Upcoming fixtures */}
            {fixtures.length > 0 && (
              <div className={`rounded-xl overflow-hidden ${bg1}`}>
                <div className="px-4 py-3 bg-[#cc0000]">
                  <p className="text-[0.65rem] font-extrabold text-white uppercase tracking-widest">{club.name} — Upcoming Fixtures</p>
                </div>
                {fixtures.map((m, i) => (
                  <MatchRow key={i} match={m} dark={dark} t1={t1} t3={t3} bg2={bg2} />
                ))}
              </div>
            )}

            {!results.length && !fixtures.length && (
              <div className={`text-center py-10 ${t3}`}>
                <p className="text-3xl mb-2 opacity-30">📅</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest">
                  {TEAM_IDS[club.id] === null
                    ? `Fixtures not available for ${club.league}`
                    : 'No fixtures available yet — check back when the season starts'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className={`rounded-xl p-4 ${bg1}`}>
            <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#cc0000]/30 ${t1}`}>
              Club History <span className="text-[#cc0000]">· Wikipedia</span>
            </p>
            {loading ? (
              <div className={`text-center py-8 ${t3}`}>
                <div className="w-6 h-6 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              </div>
            ) : wikiData?.extract ? (
              <>
                <p className={`text-[0.72rem] leading-relaxed ${t3}`}>
                  {wikiData.extract.slice(0, 1000)}{wikiData.extract.length > 1000 ? '…' : ''}
                </p>
                {wikiData.url && (
                  <a href={wikiData.url} target="_blank" rel="noreferrer"
                    className="inline-block mt-3 text-[0.6rem] font-bold text-[#cc0000] uppercase tracking-wide hover:underline">
                    Read more on Wikipedia →
                  </a>
                )}
              </>
            ) : (
              <p className={`text-[0.72rem] ${t3}`}>No history available</p>
            )}

            {/* SportsDB description */}
            {sportsDbData?.description && !wikiData?.extract && (
              <p className={`text-[0.72rem] leading-relaxed ${t3}`}>
                {sportsDbData.description.slice(0, 800)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchRow({ match, dark, t1, t3, bg2 }) {
  const finished = match.homeGoals !== null && match.awayGoals !== null;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-b last:border-b-0 ${dark ? 'border-white/[0.04]' : 'border-black/[0.04]'}`}>
      <div className={`text-[0.55rem] font-semibold text-right flex-shrink-0 w-12 ${t3}`}>
        <p>{match.date}</p>
        <p>{match.time}</p>
      </div>
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {match.homeCrest && <img src={match.homeCrest} alt="" className="w-4 h-4 object-contain" onError={e => e.target.style.display='none'} />}
          <span className={`text-[0.65rem] font-bold text-right ${t1}`}>{match.homeTeam}</span>
        </div>
        <div className={`text-[0.7rem] font-black px-2 py-0.5 rounded flex-shrink-0 ${finished ? 'text-[#cc0000]' : t3}`}>
          {finished ? `${match.homeGoals} - ${match.awayGoals}` : 'vs'}
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <span className={`text-[0.65rem] font-bold ${t1}`}>{match.awayTeam}</span>
          {match.awayCrest && <img src={match.awayCrest} alt="" className="w-4 h-4 object-contain" onError={e => e.target.style.display='none'} />}
        </div>
      </div>
    </div>
  );
}
