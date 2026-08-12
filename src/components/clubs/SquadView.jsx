import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function SquadView({ club, players, onBack, onSelectPlayer }) {
  const { dark } = useTheme();
  const [imgErr, setImgErr] = useState({});
  const ini = n => n.split(' ').map(w => w[0]).join('');

  return (
    <div className="p-4 flex-1">
      <button onClick={onBack} className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-md border transition-all mb-4 ${dark ? 'border-white/10 bg-[#222] text-white hover:bg-red-primary hover:border-red-primary hover:text-white' : 'border-black/10 bg-gray-100 text-gray-800 hover:bg-red-primary hover:border-red-primary hover:text-white'}`}>
        ← Back to Clubs
      </button>

      {/* Club header */}
      <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${dark ? 'border-white/10' : 'border-black/08'}`}>
        <div className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${dark ? 'bg-[#222]' : 'bg-gray-100'}`}>
          <img src={club.logo} alt={club.name} className="w-full h-full object-contain p-1" onError={e => e.target.style.display='none'} />
        </div>
        <div>
          <p className={`text-[0.9rem] font-black uppercase tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{club.name}</p>
          <p className={`text-[0.56rem] font-semibold uppercase tracking-wide ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{club.league} · Est. {club.est} · {club.mgr}</p>
        </div>
      </div>

      {players.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {players.map(p => (
            <div key={p.id} onClick={() => onSelectPlayer(p)} className={`rounded-lg overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-xl ${dark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
              <div className="relative h-32 overflow-hidden bg-[#2a2a2a]">
                <span className="absolute top-1.5 left-2 z-10 text-[0.48rem] font-extrabold px-1.5 py-0.5 rounded bg-red-primary text-white uppercase">{p.pos}</span>
                {!imgErr[p.id] ? (
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover object-top" onError={() => setImgErr(prev => ({ ...prev, [p.id]: true }))} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/10">{ini(p.name)}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" />
              </div>
              <div className="p-2">
                <p className={`text-[0.8rem] font-bold uppercase truncate tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                <p className={`text-[0.55rem] font-semibold uppercase tracking-wide ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{p.flag} #{p.num} · {p.s.g}G {p.s.a}A · {p.s.r}★</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-16 text-[0.72rem] font-bold uppercase tracking-widest ${dark ? 'text-gray-600' : 'text-gray-400'}`}>No tracked players for this club.</div>
      )}
    </div>
  );
}
