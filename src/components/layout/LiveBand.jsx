import React from 'react';
import { useLeague } from '../../context/LeagueContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LEAGUES = [
  { label: 'Premier League', filter: 'Premier League'   },
  { label: 'La Liga',        filter: 'La Liga'           },
  { label: 'Bundesliga',     filter: 'Bundesliga'        },
  { label: 'Serie A',        filter: 'Serie A'           },
  { label: 'Ligue 1',        filter: 'Ligue 1'           },
  { label: 'UCL',            filter: 'UCL'               },
  { label: 'MLS',            filter: 'MLS'               },
  { label: 'Saudi Pro',      filter: 'Saudi Pro League'  },
];

export default function LiveBand() {
  const { activeLeague, toggleLeague } = useLeague();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleClick = (league) => {
    toggleLeague(league.filter);
    if (location.pathname !== '/players' && location.pathname !== '/clubs') {
      navigate('/clubs');
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#a80000] overflow-x-auto scrollbar-hide flex-shrink-0">
      {LEAGUES.map(l => (
        <button
          key={l.filter}
          onClick={() => handleClick(l)}
          className={`font-mono text-[0.53rem] font-bold px-2.5 py-1 rounded transition-all flex-shrink-0 whitespace-nowrap uppercase tracking-wide border ${
            activeLeague === l.filter
              ? 'bg-white text-[#a80000] border-white'
              : 'bg-black/20 text-red-200 border-white/20 hover:bg-white/20 hover:text-white'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
