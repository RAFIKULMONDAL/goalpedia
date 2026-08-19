import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function PlayerCard({ player, onClick }) {
  const { dark } = useTheme();
  const [imgErr, setImgErr] = useState(false);

  // Use photo stored in Firestore during admin reseed
  // No live API calls — avoids all CORS issues on deployment
  const photo = player.photo || '';
  const ini   = player.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || '?';

  const rating    = player.s?.r;
  const showRating = rating && rating > 0 && rating <= 10;
  const isGK      = player.pos === 'GK';

  return (
    <div
      onClick={() => onClick(player)}
      className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${dark ? 'bg-[#1a1a1a]' : 'bg-white'}`}
    >
      {/* Photo */}
      <div className="relative h-48 overflow-hidden bg-[#2a2a2a]">
        {photo && !imgErr ? (
          <img
            src={photo}
            alt={player.name}
            className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/10">
            {ini}
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: dark
            ? 'linear-gradient(to top, #1a1a1a 0%, transparent 52%)'
            : 'linear-gradient(to top, #ffffff 0%, transparent 52%)' }}
        />
        <span className="absolute top-2 left-2 z-10 text-[0.5rem] font-extrabold px-1.5 py-0.5 rounded bg-[#cc0000] text-white uppercase tracking-wide">
          {player.pos}
        </span>
        {showRating && (
          <span className="absolute bottom-2 right-2 z-10 font-mono text-[0.8rem] font-bold text-white bg-black/65 px-1.5 py-0.5 rounded">
            {player.s.r}
          </span>
        )}
        <span className="absolute top-2 right-2 z-[2] font-mono text-[2rem] font-black pointer-events-none text-white/[0.06]">
          #{player.num}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-3">
        <p className={`text-[0.85rem] font-bold uppercase tracking-tight truncate mb-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {player.name}
        </p>
        <p className={`text-[0.6rem] font-medium uppercase tracking-wider mb-2.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
          {player.flag} {player.club}
        </p>

        <div className="grid grid-cols-3 gap-1 mb-2.5">
          {(isGK
            ? [['Clean Sheets', player.s?.cs ?? 0], ['Saves', player.s?.sv ?? 0], ['Apps', player.s?.ap ?? 0]]
            : [['Goals', player.s?.g ?? 0], ['Assists', player.s?.a ?? 0], ['Apps', player.s?.ap ?? 0]]
          ).map(([label, val]) => (
            <div key={label} className={`rounded py-1.5 text-center ${dark ? 'bg-[#222]' : 'bg-gray-100'}`}>
              <span className={`block font-mono text-[0.92rem] font-bold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{val}</span>
              <span className={`block text-[0.46rem] font-bold uppercase tracking-wider mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onClick(player); }}
          className="w-full py-1.5 rounded bg-[#cc0000] hover:bg-[#a80000] text-white text-[0.61rem] font-bold uppercase tracking-wider transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
