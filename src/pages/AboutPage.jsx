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
    { icon: '⚽', title: 'Player Stats',    desc: 'In-depth season statistics for 241 of the world\'s top footballers — goals, assists, ratings, dribbles, minutes and more.' },
    { icon: '🏟️', title: 'Club Profiles',   desc: 'Browse 35 top clubs across 8 major leagues. View squads, managers, stadiums, trophy counts, standings and fixtures.' },
    { icon: '📰', title: 'News Feed',       desc: 'Latest transfer news, match reports, injury updates and tactical analysis — auto-synced and always fresh.' },
    { icon: '📊', title: 'Stats Hub',       desc: 'Live league standings, top scorers, upcoming fixtures and recent results from Football-Data.org — updated in real time.' },
    { icon: '🔍', title: 'Smart Search',    desc: 'Instant search across players and clubs by name, nationality, league or manager — results appear as you type.' },
    { icon: '🌙', title: 'Dark & Light',    desc: 'Full dark and light mode support — switch any time with the theme toggle in the header.' },
  ];

  const leagues = [
    { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', clubs: 9 },
    { name: 'La Liga',        flag: '🇪🇸', clubs: 6 },
    { name: 'Bundesliga',     flag: '🇩🇪', clubs: 4 },
    { name: 'Serie A',        flag: '🇮🇹', clubs: 7 },
    { name: 'Ligue 1',        flag: '🇫🇷', clubs: 4 },
    { name: 'UCL',            flag: '🏆', clubs: 11 },
    { name: 'Saudi Pro',      flag: '🇸🇦', clubs: 4 },
    { name: 'MLS',            flag: '🇺🇸', clubs: 1 },
  ];

  const stats = [
    { value: '241',  label: 'Players' },
    { value: '35',   label: 'Clubs' },
    { value: '8',    label: 'Leagues' },
    { value: 'Live', label: 'Data' },
  ];

  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto w-full">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded border mb-6 transition-all ${
          dark ? 'text-white bg-[#222] border-white/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]'
               : 'text-gray-700 bg-gray-100 border-black/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]'
        }`}
      >← Back</button>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-baseline gap-0 mb-3">
          <span className={`text-4xl font-black uppercase tracking-tight ${t1}`}>Goal</span>
          <span className="text-4xl font-black text-[#cc0000] uppercase tracking-tight">pedia</span>
        </div>
        <p className={`text-[0.95rem] font-semibold leading-relaxed max-w-2xl ${t2}`}>
          Your all-in-one destination for football player statistics, club data, live standings, 
          fixtures and football news — built for fans who want real numbers, not just highlights.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className={`rounded-xl p-4 text-center ${bg1}`}>
            <p className="text-2xl font-black text-[#cc0000]">{s.value}</p>
            <p className={`text-[0.58rem] font-bold uppercase tracking-widest mt-1 ${t3}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* What we cover */}
      <div className={`rounded-xl p-5 mb-6 ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
          What We Cover
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className={`rounded-lg p-4 ${bg2}`}>
              <p className="text-2xl mb-2">{f.icon}</p>
              <p className={`text-[0.78rem] font-bold uppercase tracking-wide mb-1 ${t1}`}>{f.title}</p>
              <p className={`text-[0.68rem] leading-relaxed ${t3}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leagues covered */}
      <div className={`rounded-xl p-5 mb-6 ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
          Leagues Covered
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {leagues.map((l, i) => (
            <div key={i} className={`rounded-lg p-3 text-center ${bg2}`}>
              <p className="text-xl mb-1">{l.flag}</p>
              <p className={`text-[0.68rem] font-bold uppercase tracking-wide ${t1}`}>{l.name}</p>
              <p className={`text-[0.56rem] font-semibold mt-0.5 ${t3}`}>{l.clubs} clubs</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className={`rounded-xl p-5 mb-6 ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
          Data Sources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Football-Data.org', desc: 'Live standings, fixtures, results and top scorers', type: 'Live API' },
            { name: 'TheSportsDB',       desc: 'Player photos, club logos, stadium info and bios', type: 'Live API' },
            { name: 'Wikipedia',         desc: 'Player and club career history and biographies',   type: 'Live API' },
            { name: 'NewsAPI',           desc: 'Latest football news, transfers and match reports', type: 'Auto-sync' },
          ].map((s, i) => (
            <div key={i} className={`rounded-lg px-4 py-3 flex items-start gap-3 ${bg2}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-[0.72rem] font-bold uppercase ${t1}`}>{s.name}</p>
                  <span className="text-[0.48rem] font-bold px-1.5 py-0.5 rounded bg-[#cc0000]/20 text-[#cc0000] uppercase tracking-wide">{s.type}</span>
                </div>
                <p className={`text-[0.62rem] ${t3}`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Built by */}
      <div className={`rounded-xl p-5 ${bg1}`}>
        <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
          Built With
        </h2>
        <div className="flex flex-wrap gap-2">
          {['React 18', 'Tailwind CSS', 'Firebase', 'Firestore', 'Vercel', 'Football-Data.org', 'TheSportsDB', 'Wikipedia API', 'NewsAPI'].map((tech, i) => (
            <span key={i} className={`text-[0.62rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
              dark ? 'border-white/10 text-gray-400' : 'border-black/10 text-gray-500'
            }`}>{tech}</span>
          ))}
        </div>
        <p className={`text-[0.65rem] mt-4 leading-relaxed ${t3}`}>
          Goalpedia is a personal project built with passion for football and technology. 
          All stats are for the 2024/25 season. Live data updates automatically as the season progresses.
        </p>
      </div>

    </div>
  );
}
