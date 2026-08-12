import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { searchPlayer, formatPlayerFromSportsDB } from '../../services/sportsDbApi';
import { getPlayerWikiInfo } from '../../services/wikipediaApi';

const POS_FULL = { FW:'Forward', MF:'Midfielder', DF:'Defender', GK:'Goalkeeper' };

export default function PlayerProfile({ player, onBack }) {
  const { dark } = useTheme();
  const [sportsDbData, setSportsDbData] = useState(null);
  const [wikiData,     setWikiData]     = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(true);

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';
  const bg2 = dark ? 'bg-[#222]'     : 'bg-gray-50';

  useEffect(() => {
    setLoadingExtra(true);
    setSportsDbData(null);
    setWikiData(null);
    async function loadExtra() {
      try {
        const [sdbRaw, wiki] = await Promise.all([
          searchPlayer(player.name),
          getPlayerWikiInfo(player.name),
        ]);
        if (sdbRaw) {
          const formatted = formatPlayerFromSportsDB(sdbRaw);
          const bestPhoto = sdbRaw.strThumb || sdbRaw.strCutout || sdbRaw.strRender || '';
          console.log('[SportsDB] foot field:', sdbRaw.strFoot, '| signing:', sdbRaw.strSigning);
          setSportsDbData({ ...formatted, photo: bestPhoto });
        }
        if (wiki) setWikiData(wiki);
      } catch (e) {
        console.warn('Extra data load failed:', e.message);
      }
      setLoadingExtra(false);
    }
    loadExtra();
  }, [player.name]);

  const photo  = sportsDbData?.photo || wikiData?.thumbnail || player.photo || '';
  const pos    = player.pos || sportsDbData?.position || '';
  const s      = player.s || {};
  const isGK   = pos === 'GK';

  // Season stats config
  const seasonStats = isGK ? [
    { label:'Clean Sheets', value: s.cs ?? 0 },
    { label:'Saves',        value: s.sv ?? 0 },
    { label:'Apps',         value: s.ap ?? 0 },
    { label:'Rating',       value: s.r  ?? 0 },
    { label:'Goals Con.',   value: s.gc ?? 0 },
    { label:'Pass Acc.',    value: `${s.pa ?? 0}%` },
    { label:'Minutes',      value: s.m  ?? 0 },
    { label:'Yellows',      value: s.yc ?? 0 },
  ] : [
    { label:'Goals',    value: s.g  ?? 0 },
    { label:'Assists',  value: s.a  ?? 0 },
    { label:'Apps',     value: s.ap ?? 0 },
    { label:'Rating',   value: s.r  ?? 0 },
    { label:'Shots',    value: s.sh ?? 0 },
    { label:'Dribbles', value: s.dr ?? 0 },
    { label:'Minutes',  value: s.m  ?? 0 },
    { label:'Yellows',  value: s.yc ?? 0 },
  ];

  const posColor = pos==='FW'?'bg-red-600':pos==='MF'?'bg-blue-600':pos==='DF'?'bg-green-700':'bg-purple-700';

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Back button */}
      <div className={`sticky top-0 z-10 px-4 py-2 border-b ${dark?'bg-[#0f0f0f] border-white/[0.06]':'bg-white border-black/[0.06]'}`}>
        <button onClick={onBack}
          className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-all ${
            dark?'bg-[#222] text-white hover:bg-[#cc0000]':'bg-gray-100 text-gray-700 hover:bg-[#cc0000] hover:text-white'
          }`}>← Back</button>
      </div>

      {/* ── DESKTOP LAYOUT (md+): 2 columns ── */}
      <div className="hidden md:flex gap-4 p-4 max-w-5xl mx-auto">

        {/* LEFT COLUMN — photo + season stats */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">

          {/* Photo card */}
          <div className={`rounded-2xl overflow-hidden ${bg1}`}>
            <div className="h-1.5 bg-gradient-to-r from-[#cc0000] to-[#ff4444]" />
            <div className={`h-72 flex items-center justify-center text-6xl font-black overflow-hidden ${dark?'bg-[#2a2a2a]':'bg-gray-100'}`}>
              {photo ? (
                <img src={photo} alt={player.name}
                  className="w-full h-full object-cover object-top"
                  onError={e => { e.target.style.display='none'; }} />
              ) : (
                <span className={t3}>{player.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {player.flag
                  ? <span className="text-xl">{player.flag}</span>
                  : <span className={`text-[0.5rem] font-bold uppercase tracking-wide ${t3}`}>{player.nat}</span>
                }
                <span className={`text-[0.5rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded text-white ${posColor}`}>
                  {POS_FULL[pos] || pos}
                </span>
                {player.cap && <span className="text-[0.5rem] font-extrabold uppercase px-2 py-0.5 rounded bg-yellow-600 text-white">Captain</span>}
              </div>
              <h1 className={`text-lg font-black uppercase tracking-tight leading-tight ${t1}`}>{player.name}</h1>
              <p className={`text-[0.7rem] ${t3}`}>{player.club}{player.num ? ` · #${player.num}` : ''}</p>

              {/* Quick info */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { label:'Age',    value: sportsDbData?.age || player.age || '—' },
                  { label:'Nation',  value: sportsDbData?.nationality || player.nat || '—' },
                  { label:'Foot',    value: (sportsDbData?.foot && sportsDbData.foot !== '') ? sportsDbData.foot : (player.foot || '—') },
                  { label:'Club',    value: player.club || '—' },
                ].map((item,i) => (
                  <div key={i} className={`rounded-lg px-2.5 py-2 ${bg2}`}>
                    <p className={`text-[0.46rem] font-bold uppercase tracking-widest mb-0.5 ${t3}`}>{item.label}</p>
                    <p className={`text-[0.7rem] font-bold truncate ${t1}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Season stats */}
          {Object.values(s).some(v => v > 0) && (
            <div className={`rounded-xl p-4 ${bg1}`}>
              <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#cc0000]/30 ${t1}`}>
                Season Stats
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {seasonStats.map((stat,i) => (
                  <div key={i} className={`rounded-lg p-2 text-center ${bg2}`}>
                    <p className={`font-mono text-sm font-black ${t1}`}>{stat.value}</p>
                    <p className={`text-[0.42rem] font-bold uppercase tracking-widest leading-tight mt-0.5 ${t3}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent matches */}
          {player.m?.length > 0 && (
            <div className={`rounded-xl p-4 ${bg1}`}>
              <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#cc0000]/30 ${t1}`}>
                Recent Matches
              </p>
              {player.m.map((match,i) => (
                <div key={i} className={`flex items-center gap-2 py-2 border-b last:border-b-0 ${dark?'border-white/[0.04]':'border-black/[0.04]'}`}>
                  <span className={`text-[0.58rem] font-extrabold px-1.5 py-0.5 rounded ${
                    match.r==='W'?'bg-green-600/20 text-green-400':match.r==='D'?'bg-yellow-600/20 text-yellow-400':'bg-red-600/20 text-red-400'
                  }`}>{match.r}</span>
                  <span className={`flex-1 text-[0.65rem] font-semibold truncate ${t1}`}>vs {match.o}</span>
                  <span className={`text-[0.58rem] font-bold ${t1}`}>{match.g}G {match.a}A</span>
                  {match.rt && <span className="text-[0.58rem] font-bold text-[#cc0000]">{match.rt}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — details, wiki stats, bio, attributes */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Wikipedia career stats */}
          {wikiData?.stats && (
            <div className={`rounded-xl p-4 ${bg1}`}>
              <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#cc0000]/30 ${t1}`}>
                Career Stats <span className="text-[#cc0000]">· Wikipedia</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {wikiData.stats.careerGoals && (
                  <div className={`rounded-lg p-3 text-center ${bg2}`}>
                    <p className="font-mono text-2xl font-black text-[#cc0000]">{wikiData.stats.careerGoals}</p>
                    <p className={`text-[0.48rem] font-bold uppercase tracking-widest ${t3}`}>Career Goals</p>
                  </div>
                )}
                {wikiData.stats.careerAssists && (
                  <div className={`rounded-lg p-3 text-center ${bg2}`}>
                    <p className={`font-mono text-2xl font-black ${t1}`}>{wikiData.stats.careerAssists}</p>
                    <p className={`text-[0.48rem] font-bold uppercase tracking-widest ${t3}`}>Career Assists</p>
                  </div>
                )}
                {wikiData.stats.careerApps && (
                  <div className={`rounded-lg p-3 text-center ${bg2}`}>
                    <p className={`font-mono text-2xl font-black ${t1}`}>{wikiData.stats.careerApps}</p>
                    <p className={`text-[0.48rem] font-bold uppercase tracking-widest ${t3}`}>Career Apps</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Player details from SportsDB */}
          {sportsDbData && (
            <div className={`rounded-xl p-4 ${bg1}`}>
              <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#cc0000]/30 ${t1}`}>
                Player Details
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label:'Date of Birth',  value: sportsDbData.born },
                  { label:'Preferred Foot', value: (sportsDbData.foot && sportsDbData.foot !== '') ? sportsDbData.foot : (player.foot || null) },
                  { label:'Weight',         value: sportsDbData.weight || '—' },
                  { label:'Nationality',    value: sportsDbData.nationality || player.nat || '—' },
                  { label:'Position',       value: POS_FULL[pos] || pos || '—' },
                  { label:'Shirt Number',   value: player.num ? `#${player.num}` : '—' },
                  { label:'Market Value',   value: player.status?.val || '—' },
                  { label:'Contract',       value: player.status?.con ? `Until ${player.status.con}` : '—' },
                  { label:'Agent',          value: sportsDbData.agent || '—' },
                  { label:'Outfitter',      value: sportsDbData.outfitter || '—' },
                ].filter(i => i.value && i.value !== '—').map((item,i) => (
                  <div key={i} className={`rounded-lg px-3 py-2 ${bg2}`}>
                    <p className={`text-[0.46rem] font-bold uppercase tracking-widest mb-0.5 ${t3}`}>{item.label}</p>
                    <p className={`text-[0.7rem] font-semibold truncate ${t1}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attributes radar */}
          {player.perf && Object.keys(player.perf).length > 0 && (
            <div className={`rounded-xl p-4 ${bg1}`}>
              <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#cc0000]/30 ${t1}`}>
                Attributes
              </p>
              <div className="flex flex-col gap-2.5">
                {Object.entries(player.perf).map(([key,val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className={`text-[0.6rem] font-semibold uppercase w-32 flex-shrink-0 ${t3}`}>{key}</span>
                    <div className={`flex-1 h-2 rounded-full ${dark?'bg-[#333]':'bg-gray-200'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-[#cc0000] to-[#ff4444] transition-all duration-500"
                        style={{width:`${val}%`}} />
                    </div>
                    <span className={`font-mono text-[0.72rem] font-black w-7 text-right ${t1}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Biography */}
          {wikiData?.extract && (
            <div className={`rounded-xl p-4 ${bg1}`}>
              <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#cc0000]/30 ${t1}`}>
                Biography <span className="text-[#cc0000]">· Wikipedia</span>
              </p>
              <p className={`text-[0.75rem] leading-relaxed ${t3}`}>
                {wikiData.extract.slice(0,800)}{wikiData.extract.length>800?'…':''}
              </p>
              {wikiData.url && (
                <a href={wikiData.url} target="_blank" rel="noreferrer"
                  className="inline-block mt-2 text-[0.6rem] font-bold text-[#cc0000] uppercase tracking-wide hover:underline">
                  Read more on Wikipedia →
                </a>
              )}
            </div>
          )}

          {loadingExtra && (
            <div className={`rounded-xl p-6 flex items-center gap-3 ${bg1}`}>
              <div className="w-5 h-5 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className={`text-[0.65rem] uppercase tracking-widest ${t3}`}>Loading extra data…</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE LAYOUT (< md): single column ── */}
      <div className="md:hidden p-4 max-w-lg mx-auto flex flex-col gap-3">

        {/* Hero */}
        <div className={`rounded-2xl overflow-hidden ${bg1}`}>
          <div className="h-1.5 bg-gradient-to-r from-[#cc0000] to-[#ff4444]" />
          <div className="p-4 flex gap-3 items-start">
            <div className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl font-black ${dark?'bg-[#2a2a2a]':'bg-gray-100'}`}>
              {photo ? (
                <img src={photo} alt={player.name} className="w-full h-full object-cover object-top"
                  onError={e=>{e.target.style.display='none';}} />
              ) : (
                <span className={t3}>{player.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {player.flag
                  ? <span className="text-base">{player.flag}</span>
                  : <span className={`text-[0.48rem] font-bold uppercase ${t3}`}>{player.nat}</span>
                }
                <span className={`text-[0.48rem] font-extrabold uppercase px-1.5 py-0.5 rounded text-white ${posColor}`}>{POS_FULL[pos]||pos}</span>
                {player.cap && <span className="text-[0.48rem] font-extrabold uppercase px-1.5 py-0.5 rounded bg-yellow-600 text-white">Captain</span>}
              </div>
              <h1 className={`text-base font-black uppercase tracking-tight ${t1}`}>{player.name}</h1>
              <p className={`text-[0.65rem] ${t3}`}>{player.club}{player.num?` · #${player.num}`:''}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[
                  { label:'Age',    value: sportsDbData?.age || player.age || '—' },
                  { label:'Foot',   value: (sportsDbData?.foot && sportsDbData?.foot !== '') ? sportsDbData.foot : (player.foot || '—') },
                  { label:'Nation', value: sportsDbData?.nationality || player.nat || '—' },
                ].map((item,i) => (
                  <div key={i}>
                    <p className={`text-[0.44rem] font-bold uppercase tracking-widest ${t3}`}>{item.label}</p>
                    <p className={`text-[0.65rem] font-bold ${t1}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Season stats */}
        {Object.values(s).some(v=>v>0) && (
          <div className={`rounded-xl p-3 ${bg1}`}>
            <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-2 ${t1}`}>Season Stats</p>
            <div className="grid grid-cols-4 gap-1.5">
              {seasonStats.map((stat,i) => (
                <div key={i} className={`rounded-lg p-1.5 text-center ${bg2}`}>
                  <p className={`font-mono text-sm font-black ${t1}`}>{stat.value}</p>
                  <p className={`text-[0.42rem] font-bold uppercase tracking-widest ${t3}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player details - mobile */}
        {sportsDbData && (
          <div className={`rounded-xl p-3 ${bg1}`}>
            <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-2 ${t1}`}>Player Details</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label:'Date of Birth', value: sportsDbData.born },
                { label:'Preferred Foot', value: (sportsDbData.foot && sportsDbData.foot !== '') ? sportsDbData.foot : (player.foot || null) },
                { label:'Weight',        value: sportsDbData.weight || '—' },
                { label:'Nationality',   value: sportsDbData.nationality || player.nat || '—' },
                { label:'Market Value',  value: player.status?.val || '—' },
                { label:'Contract',      value: player.status?.con ? `Until ${player.status.con}` : '—' },
              ].filter(i => i.value && i.value !== '—').map((item,i) => (
                <div key={i} className={`rounded-lg px-2.5 py-2 ${bg2}`}>
                  <p className={`text-[0.44rem] font-bold uppercase tracking-widest mb-0.5 ${t3}`}>{item.label}</p>
                  <p className={`text-[0.68rem] font-semibold truncate ${t1}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wiki career stats */}
        {wikiData?.stats && (
          <div className={`rounded-xl p-3 ${bg1}`}>
            <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-2 ${t1}`}>Career Stats <span className="text-[#cc0000]">· Wikipedia</span></p>
            <div className="grid grid-cols-3 gap-1.5">
              {wikiData.stats.careerGoals && <div className={`rounded-lg p-2 text-center ${bg2}`}><p className="font-mono text-lg font-black text-[#cc0000]">{wikiData.stats.careerGoals}</p><p className={`text-[0.42rem] font-bold uppercase ${t3}`}>Goals</p></div>}
              {wikiData.stats.careerAssists && <div className={`rounded-lg p-2 text-center ${bg2}`}><p className={`font-mono text-lg font-black ${t1}`}>{wikiData.stats.careerAssists}</p><p className={`text-[0.42rem] font-bold uppercase ${t3}`}>Assists</p></div>}
              {wikiData.stats.careerApps && <div className={`rounded-lg p-2 text-center ${bg2}`}><p className={`font-mono text-lg font-black ${t1}`}>{wikiData.stats.careerApps}</p><p className={`text-[0.42rem] font-bold uppercase ${t3}`}>Apps</p></div>}
            </div>
          </div>
        )}

        {/* Attributes */}
        {player.perf && Object.keys(player.perf).length>0 && (
          <div className={`rounded-xl p-3 ${bg1}`}>
            <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-2 ${t1}`}>Attributes</p>
            <div className="flex flex-col gap-2">
              {Object.entries(player.perf).map(([key,val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`text-[0.55rem] font-semibold uppercase w-24 flex-shrink-0 ${t3}`}>{key}</span>
                  <div className={`flex-1 h-1.5 rounded-full ${dark?'bg-[#333]':'bg-gray-200'}`}>
                    <div className="h-full rounded-full bg-[#cc0000]" style={{width:`${val}%`}} />
                  </div>
                  <span className={`font-mono text-[0.65rem] font-black w-6 text-right ${t1}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biography */}
        {wikiData?.extract && (
          <div className={`rounded-xl p-3 ${bg1}`}>
            <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-2 ${t1}`}>Biography <span className="text-[#cc0000]">· Wikipedia</span></p>
            <p className={`text-[0.7rem] leading-relaxed ${t3}`}>{wikiData.extract.slice(0,500)}…</p>
            {wikiData.url && <a href={wikiData.url} target="_blank" rel="noreferrer" className="inline-block mt-1.5 text-[0.58rem] font-bold text-[#cc0000] uppercase hover:underline">Read more →</a>}
          </div>
        )}

        {/* Recent matches */}
        {player.m?.length>0 && (
          <div className={`rounded-xl p-3 ${bg1}`}>
            <p className={`text-[0.6rem] font-extrabold uppercase tracking-widest mb-2 ${t1}`}>Recent Matches</p>
            {player.m.map((match,i) => (
              <div key={i} className={`flex items-center gap-2 py-1.5 border-b last:border-b-0 ${dark?'border-white/[0.04]':'border-black/[0.04]'}`}>
                <span className={`text-[0.56rem] font-extrabold px-1.5 py-0.5 rounded ${match.r==='W'?'bg-green-600/20 text-green-400':match.r==='D'?'bg-yellow-600/20 text-yellow-400':'bg-red-600/20 text-red-400'}`}>{match.r}</span>
                <span className={`flex-1 text-[0.62rem] font-semibold truncate ${t1}`}>vs {match.o}</span>
                <span className={`text-[0.6rem] ${t3}`}>{match.d}</span>
                <span className={`text-[0.62rem] font-bold ${t1}`}>{match.g}G {match.a}A</span>
              </div>
            ))}
          </div>
        )}

        {loadingExtra && (
          <div className={`flex items-center gap-2 p-3 ${t3}`}>
            <div className="w-4 h-4 border border-[#cc0000] border-t-transparent rounded-full animate-spin" />
            <span className="text-[0.6rem] uppercase tracking-widest">Loading extra data…</span>
          </div>
        )}
      </div>
    </div>
  );
}
