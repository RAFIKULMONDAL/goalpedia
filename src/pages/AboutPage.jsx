import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t2  = dark ? 'text-gray-300' : 'text-gray-700';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';
  const bg2 = dark ? 'bg-[#222]'     : 'bg-gray-50';

  const features = [
    { icon: '⚽', title: 'Player Stats',    desc: 'In-depth season and all-time statistics for the world\'s top footballers — goals, assists, ratings, dribbles and more.' },
    { icon: '🏟️', title: 'Club Data',       desc: 'Browse 12 top clubs across 5 major leagues. View squads, managers, trophy counts and tracked player rosters.' },
    { icon: '📰', title: 'News Feed',       desc: 'Latest transfer news, match reports, injury updates, awards and tactical analysis from the world of football.' },
    { icon: '📊', title: 'Stats Hub',       desc: 'Live leaderboards for top scorers, assisters, highest-rated players and most successful dribblers of the season.' },
    { icon: '🔍', title: 'Smart Search',    desc: 'Instant search across players and clubs by name, league, city or manager — results appear as you type.' },
    { icon: '🌙', title: 'Dark & Light',    desc: 'Full dark and light mode support — switch any time with the theme toggle in the header or drawer.' },
  ];

  const leagues = ['Premier League', 'La Liga', 'Bundesliga', 'Ligue 1', 'MLS', 'Saudi Pro League'];

  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto w-full">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded border mb-6 transition-all ${dark ? 'text-white bg-[#222] border-white/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]' : 'text-gray-700 bg-gray-100 border-black/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]'}`}
      >
        ← Back
      </button>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-baseline gap-0 mb-3">
          <span className="text-4xl font-black text-white uppercase tracking-tight">Goal</span>
          <span className="text-4xl font-black text-[#cc0000] uppercase tracking-tight">pedia</span>
        </div>
        <p className={`text-[0.95rem] font-semibold leading-relaxed max-w-2xl ${t2}`}>
          Your all-in-one ESPN-style destination for football player statistics, club data, live news and match intelligence — built for fans who want real numbers, not just highlights.
        </p>
      </div>

      {/* What we cover */}
      <div className={`rounded-xl p-5 mb-6 ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
          What We Cover
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map(f => (
            <div key={f.title} className={`rounded-lg p-3.5 ${bg2}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{f.icon}</span>
                <h3 className={`text-[0.78rem] font-bold uppercase tracking-wide ${t1}`}>{f.title}</h3>
              </div>
              <p className={`text-[0.68rem] leading-relaxed ${t3}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leagues */}
      <div className={`rounded-xl p-5 mb-6 ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
          Leagues Covered
        </h2>
        <div className="flex flex-wrap gap-2">
          {leagues.map(l => (
            <span key={l} className="px-3 py-1.5 rounded-full bg-[#cc0000]/10 text-[#cc0000] text-[0.65rem] font-bold uppercase tracking-wide border border-[#cc0000]/30">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className={`rounded-xl p-5 mb-6 ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
          Built With
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['⚛️','React 18','UI framework'],['🎨','Tailwind CSS','Styling'],['🔀','React Router','Navigation'],['📦','Context API','State management']].map(([icon, name, desc]) => (
            <div key={name} className={`rounded-lg p-3 text-center ${bg2}`}>
              <div className="text-2xl mb-1">{icon}</div>
              <p className={`text-[0.7rem] font-bold uppercase tracking-wide ${t1}`}>{name}</p>
              <p className={`text-[0.58rem] ${t3}`}>{desc}</p>
            </div>
          ))}
        </div>
        <p className={`text-[0.65rem] mt-3 leading-relaxed ${t3}`}>
          Backend coming soon — Node.js + Express + MongoDB + FootData.org API for live player stats, real match data and persistent user accounts.
        </p>
      </div>

      {/* Data note */}
      <div className={`rounded-xl p-5 border-l-4 border-[#cc0000] ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-2 ${t1}`}>Data & Attribution</h2>
        <p className={`text-[0.68rem] leading-relaxed ${t3}`}>
          All player statistics shown are representative figures for the 2024/25 season. Player photos are sourced from Wikimedia Commons under their respective licences. 
          Club logos are trademarks of their respective owners and are used for identification purposes only.
          Live data integration via <span className="text-[#cc0000] font-semibold">FootData.org API</span> is planned for a future release.
        </p>
      </div>

    </div>
  );
}
