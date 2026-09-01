import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { fetchStandings, fetchTopScorers, fetchRecentResults, fetchUpcomingFixtures, COMPETITIONS } from '../../services/footballDataApi';

const LEAGUES = Object.keys(COMPETITIONS);

export default function StatsHub({ onPlayerClick }) {
  const { dark } = useTheme();
  const [activeLeague, setActiveLeague] = useState('Premier League');
  const [activeTab,    setActiveTab]    = useState('scorers');
  const [scorers,      setScorers]      = useState([]);
  const [standings,    setStandings]    = useState([]);
  const [results,      setResults]      = useState([]);
  const [fixtures,     setFixtures]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';
  const bg2 = dark ? 'bg-[#222]'     : 'bg-gray-50';

  useEffect(() => {
    async function load() {
      setLoading(true);
      const code = COMPETITIONS[activeLeague] || 'PL';
      try {
        const [sc, st, re, fi] = await Promise.all([
          fetchTopScorers(code, 15),
          fetchStandings(code),
          fetchRecentResults(code, 8),
          fetchUpcomingFixtures(code, 8),
        ]);
        setScorers(sc   || []);
        setStandings(st || []);
        setResults(re   || []);
        setFixtures(fi  || []);
      } catch (e) {
        console.warn('StatsHub load failed:', e.message);
      }
      setLoading(false);
    }
    load();
  }, [activeLeague]);

  const TABS = [
    { id: 'scorers',   label: '⚽ Top Scorers'  },
    { id: 'standings', label: '📊 Standings'    },
    { id: 'results',   label: '🏁 Results'      },
    { id: 'fixtures',  label: '📅 Fixtures'     },
  ];

  return (
    <div className="p-4 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#cc0000] flex-wrap gap-2">
        <h2 className={`text-[0.95rem] font-extrabold uppercase tracking-wide ${t1}`}>Stats Hub</h2>

      </div>

      {/* League selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {LEAGUES.map(league => (
          <button key={league} onClick={() => setActiveLeague(league)}
            className={`flex-shrink-0 text-[0.58rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
              activeLeague === league
                ? 'bg-[#cc0000] border-[#cc0000] text-white'
                : dark
                  ? 'border-white/10 text-gray-400 hover:border-[#cc0000]/50 hover:text-white'
                  : 'border-black/10 text-gray-500 hover:border-[#cc0000]/50 hover:text-gray-900'
            }`}>
            {league}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className={`flex border-b mb-4 ${dark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[0.6rem] font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'text-[#cc0000] border-[#cc0000]'
                : `border-transparent ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className={`flex items-center justify-center py-16 ${t3}`}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[0.72rem] font-bold uppercase tracking-widest">Loading {activeLeague}…</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* TOP SCORERS */}
          {activeTab === 'scorers' && (
            <div className={`rounded-xl overflow-hidden ${bg1}`}>
              <div className="flex items-center justify-between px-4 py-3 bg-[#cc0000]">
                <span className="text-[0.65rem] font-extrabold text-white uppercase tracking-widest">Top Scorers</span>
                <span className="text-[0.55rem] font-bold text-white/70 uppercase">{activeLeague} · 2026/27</span>
              </div>
              {scorers.length > 0 ? scorers.map((p, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 ${dark ? 'border-white/[0.04]' : 'border-black/[0.04]'}`}>
                  <span className={`font-mono text-[0.65rem] font-black w-5 text-center flex-shrink-0 ${i < 3 ? 'text-[#cc0000]' : t3}`}>{i+1}</span>
                  {p.crest && <img src={p.crest} alt="" className="w-5 h-5 object-contain flex-shrink-0" onError={e => e.target.style.display='none'} />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[0.75rem] font-bold uppercase truncate ${t1}`}>{p.name}</p>
                    <p className={`text-[0.55rem] ${t3}`}>{p.team} · {p.position}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <p className={`font-mono text-lg font-black text-[#cc0000]`}>{p.goals}</p>
                      <p className={`text-[0.45rem] font-bold uppercase ${t3}`}>Goals</p>
                    </div>
                    {p.assists > 0 && (
                      <div className="text-center">
                        <p className={`font-mono text-lg font-black ${t1}`}>{p.assists}</p>
                        <p className={`text-[0.45rem] font-bold uppercase ${t3}`}>Assists</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className={`font-mono text-sm font-bold ${t3}`}>{p.matches}</p>
                      <p className={`text-[0.45rem] font-bold uppercase ${t3}`}>Apps</p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className={`text-center py-8 text-[0.65rem] ${t3}`}>No scorers data available</p>
              )}
            </div>
          )}

          {/* STANDINGS */}
          {activeTab === 'standings' && (
            <div className={`rounded-xl overflow-hidden ${bg1}`}>
              <div className="px-4 py-3 bg-[#cc0000]">
                <p className="text-[0.65rem] font-extrabold text-white uppercase tracking-widest">{activeLeague} Table</p>
              </div>
              {standings.length > 0 ? (
                <>
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
                  {standings.map((row, i) => (
                    <div key={i} className={`grid grid-cols-12 gap-1 px-3 py-2.5 border-b last:border-b-0 text-[0.62rem] ${dark ? 'border-white/[0.04]' : 'border-black/[0.04]'}`}>
                      <span className={`col-span-1 font-bold ${row.position <= 4 ? 'text-[#cc0000]' : row.position >= standings.length - 2 ? 'text-red-500' : t3}`}>{row.position}</span>
                      <div className="col-span-5 flex items-center gap-1.5">
                        {row.crest && <img src={row.crest} alt="" className="w-4 h-4 object-contain flex-shrink-0" onError={e => e.target.style.display='none'} />}
                        <span className={`font-semibold truncate ${t1}`}>{row.team}</span>
                      </div>
                      <span className={`col-span-1 text-center ${t3}`}>{row.played}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.won}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.draw}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.lost}</span>
                      <span className={`col-span-1 text-center ${t3}`}>{row.gd > 0 ? '+':''}{row.gd}</span>
                      <span className={`col-span-1 text-center font-black ${t1}`}>{row.points}</span>
                    </div>
                  ))}
                </>
              ) : (
                <p className={`text-center py-8 text-[0.65rem] ${t3}`}>No standings available</p>
              )}
            </div>
          )}

          {/* RESULTS */}
          {activeTab === 'results' && (
            <div className={`rounded-xl overflow-hidden ${bg1}`}>
              <div className="px-4 py-3 bg-[#222]">
                <p className="text-[0.65rem] font-extrabold text-white uppercase tracking-widest">Recent Results</p>
              </div>
              {results.length > 0
                ? results.map((m, i) => <MatchRow key={i} match={m} dark={dark} t1={t1} t3={t3} />)
                : <p className={`text-center py-8 text-[0.65rem] ${t3}`}>No results available</p>
              }
            </div>
          )}

          {/* FIXTURES */}
          {activeTab === 'fixtures' && (
            <div className={`rounded-xl overflow-hidden ${bg1}`}>
              <div className="px-4 py-3 bg-[#cc0000]">
                <p className="text-[0.65rem] font-extrabold text-white uppercase tracking-widest">Upcoming Fixtures</p>
              </div>
              {fixtures.length > 0
                ? fixtures.map((m, i) => <MatchRow key={i} match={m} dark={dark} t1={t1} t3={t3} />)
                : <p className={`text-center py-8 text-[0.65rem] ${t3}`}>No fixtures available</p>
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MatchRow({ match, dark, t1, t3 }) {
  const finished = match.homeGoals !== null && match.awayGoals !== null;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-b last:border-b-0 ${dark ? 'border-white/[0.04]' : 'border-black/[0.04]'}`}>
      <div className={`text-[0.55rem] font-semibold text-right flex-shrink-0 w-12 ${t3}`}>
        <p>{match.date}</p>
        <p>{match.time}</p>
      </div>
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {match.homeCrest && <img src={match.homeCrest} alt="" className="w-5 h-5 object-contain" onError={e => e.target.style.display='none'} />}
          <span className={`text-[0.65rem] font-bold text-right truncate ${t1}`}>{match.homeTeam}</span>
        </div>
        <span className={`text-[0.72rem] font-black px-2 flex-shrink-0 ${finished ? 'text-[#cc0000]' : t3}`}>
          {finished ? `${match.homeGoals}-${match.awayGoals}` : 'vs'}
        </span>
        <div className="flex items-center gap-1.5 flex-1">
          <span className={`text-[0.65rem] font-bold truncate ${t1}`}>{match.awayTeam}</span>
          {match.awayCrest && <img src={match.awayCrest} alt="" className="w-5 h-5 object-contain" onError={e => e.target.style.display='none'} />}
        </div>
      </div>
    </div>
  );
}
