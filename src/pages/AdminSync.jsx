import React, { useState } from 'react';
import { useTheme }    from '../context/ThemeContext';
import { useAuth }     from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, doc, writeBatch, getDocs, serverTimestamp } from 'firebase/firestore';
import { PLAYERS } from '../data/players';
import { CLUBS }   from '../data/clubs';
import { fetchFootballNews, fetchTransferNews } from '../services/newsApi';
import { performNewsSync } from '../services/newsAutoSync';

const slugify = (name) =>
  (name || '').toLowerCase()
    .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e')
    .replace(/[ìíîï]/g,'i').replace(/[òóôõö]/g,'o')
    .replace(/[ùúûü]/g,'u').replace(/[ñ]/g,'n')
    .replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

export default function AdminSync() {
  const { dark }              = useTheme();
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [log,     setLog]     = useState([]);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState(null);

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';
  const bg2 = dark ? 'bg-[#222]'     : 'bg-gray-50';

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
  const isAdmin     = user && (
    !ADMIN_EMAIL ||                          // if no env set, allow any logged-in user
    user.email === ADMIN_EMAIL               // otherwise must match admin email
  );

  if (!user) return (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-5xl mb-4">🔒</p>
        <p className={`text-[0.8rem] font-bold uppercase tracking-widest mb-4 ${t1}`}>Login required</p>
        <button onClick={() => navigate('/players')} className="text-[0.7rem] font-bold text-[#cc0000] uppercase hover:underline">← Back</button>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex-1 flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-5xl mb-4">⛔</p>
        <p className={`text-[0.8rem] font-bold uppercase tracking-widest mb-4 ${t1}`}>Access denied</p>
        <p className={`text-[0.65rem] mb-4 ${t3}`}>You don't have admin permissions.</p>
        <button onClick={() => navigate('/players')} className="text-[0.7rem] font-bold text-[#cc0000] uppercase hover:underline">← Back to app</button>
      </div>
    </div>
  );

  const addLog = (msg, type = 'info') => {
    const colors = { info: dark?'text-gray-300':'text-gray-600', success:'text-green-400', error:'text-red-400', warn:'text-yellow-400' };
    setLog(prev => [...prev, { msg, color: colors[type], time: new Date().toLocaleTimeString() }]);
  };

  // ── Force reseed players & clubs ──────────────────────────
  async function reseedAll() {
    if (running) return;
    setRunning(true);
    setSummary(null);
    setLog([{ msg: '🌱 Starting force reseed…', color:'text-[#cc0000]', time: new Date().toLocaleTimeString() }]);

    try {
      // Delete all players
      const existingP = await getDocs(collection(db, 'players'));
      if (existingP.size > 0) {
        const db1 = writeBatch(db);
        existingP.docs.forEach(d => db1.delete(d.ref));
        await db1.commit();
        addLog(`🗑  Deleted ${existingP.size} old players`, 'warn');
      }

      // Delete all clubs
      const existingC = await getDocs(collection(db, 'clubs'));
      if (existingC.size > 0) {
        const db2 = writeBatch(db);
        existingC.docs.forEach(d => db2.delete(d.ref));
        await db2.commit();
        addLog(`🗑  Deleted ${existingC.size} old clubs`, 'warn');
      }

      // Seed clubs
      const clubBatch = writeBatch(db);
      CLUBS.forEach(club => {
        clubBatch.set(doc(db, 'clubs', club.id), { ...club, logo: '', updatedAt: serverTimestamp() });
      });
      await clubBatch.commit();
      addLog(`✅ ${CLUBS.length} clubs seeded`, 'success');

      // Seed players (deduplicated) with photos from SportsDB
      const seen = new Set();
      const unique = PLAYERS.filter(p => { if(seen.has(p.name)) return false; seen.add(p.name); return true; });

      addLog(`📸 Fetching photos for ${unique.length} players from SportsDB…`, 'info');

      // Fetch photos in batches to avoid rate limiting
      const withPhotos = [];
      for (let i = 0; i < unique.length; i++) {
        const player = unique[i];
        try {
          const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(player.name)}`);
          const json = await res.json();
          const raw = json?.player?.[0];
          const photo = raw?.strThumb || raw?.strCutout || raw?.strRender || '';
          withPhotos.push({ ...player, photo });
        } catch {
          withPhotos.push({ ...player, photo: '' });
        }
        // Small delay every 10 players to avoid rate limiting
        if (i > 0 && i % 10 === 0) {
          await new Promise(r => setTimeout(r, 500));
          addLog(`  📸 ${i}/${unique.length} photos fetched…`, 'info');
        }
      }

      const playerBatch = writeBatch(db);
      withPhotos.forEach(player => {
        const id = slugify(player.name);
        const cleanS = { ...player.s };
        if (cleanS.r > 10) cleanS.r = parseFloat((cleanS.r/10).toFixed(1));
        playerBatch.set(doc(db, 'players', id), { ...player, s: cleanS, firestoreId: id, updatedAt: serverTimestamp() });
      });
      await playerBatch.commit();
      addLog(`✅ ${withPhotos.length} players seeded with photos`, 'success');
      addLog('🎉 Reseed complete!', 'success');
      setSummary({ players: unique.length, clubs: CLUBS.length });
    } catch (err) {
      if (err.code === 'permission-denied') {
        addLog('❌ Permission denied! Set Firestore rules to allow read, write: if true', 'error');
      } else {
        addLog(`❌ Error: ${err.message}`, 'error');
      }
    }
    setRunning(false);
  }

  // ── Sync news (force) ────────────────────────────────────
  async function syncNews() {
    if (running) return;
    setRunning(true);
    setLog([{ msg: '📰 Syncing news (force)…', color:'text-purple-400', time: new Date().toLocaleTimeString() }]);
    try {
      const result = await performNewsSync(true); // force=true bypasses interval check
      if (result.success) {
        addLog(`✅ ${result.articles} articles saved`, 'success');
        addLog(`📊 ${result.remaining} API requests remaining today`, 'info');
        const nextMins = result.nextSyncIn ? Math.round(result.nextSyncIn/60000) : 30;
        addLog(`⏱  Next auto-sync in ~${nextMins} minutes`, 'info');
        setSummary({ news: result.articles });
      } else {
        addLog(`⚠️ ${result.reason || 'Sync failed'}`, 'warn');
      }
    } catch (err) {
      addLog(`❌ ${err.message}`, 'error');
    }
    setRunning(false);
  }

  const actions = [
    { label: '🔄 Force Reseed Players & Clubs', desc: 'Wipes ALL old data and reseeds with 241 players + 35 clubs (fetches photos from SportsDB)', fn: reseedAll, color: 'border-[#cc0000] text-[#cc0000]' },
    { label: '📰 Sync News',                    desc: 'Fetch latest football news from NewsAPI (~2 requests)',          fn: syncNews,  color: 'border-purple-500 text-purple-400' },
  ];

  return (
    <div className="p-4 flex-1 max-w-2xl mx-auto w-full">
      <button onClick={() => navigate('/players')}
        className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded border mb-5 transition-all ${
          dark ? 'text-white bg-[#222] border-white/10 hover:bg-[#cc0000] hover:border-[#cc0000]'
               : 'text-gray-700 bg-gray-100 border-black/10 hover:bg-[#cc0000] hover:text-white'
        }`}>← Back</button>

      <h1 className={`text-2xl font-black uppercase tracking-tight mb-1 ${t1}`}>
        Admin <span className="text-[#cc0000]">Panel</span>
      </h1>
      <p className={`text-[0.72rem] mb-5 ${t3}`}>Manage Goalpedia data</p>

      <div className={`rounded-xl p-4 mb-4 ${bg1}`}>
        <div className="flex flex-col gap-2">
          {actions.map((a, i) => (
            <button key={i} onClick={a.fn} disabled={running}
              className={`flex items-center justify-between p-3.5 rounded-lg border-[1.5px] transition-all text-left ${
                running ? 'opacity-40 cursor-not-allowed border-white/10' : `${a.color} hover:bg-white/[0.04]`
              }`}>
              <div>
                <p className={`text-[0.8rem] font-bold uppercase tracking-wide ${t1}`}>{a.label}</p>
                <p className={`text-[0.62rem] mt-0.5 ${t3}`}>{a.desc}</p>
              </div>
              {running
                ? <div className="w-4 h-4 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                : <span className="text-lg flex-shrink-0">→</span>}
            </button>
          ))}
        </div>
      </div>

      {summary && (
        <div className={`rounded-xl p-4 mb-4 border-l-4 border-green-500 ${bg1}`}>
          <p className="text-[0.65rem] font-extrabold text-green-400 uppercase tracking-widest mb-2">✅ Complete</p>
          <div className="grid grid-cols-3 gap-2">
            {summary.players !== undefined && (
              <div className={`rounded-lg p-2.5 text-center ${bg2}`}>
                <p className={`font-mono text-xl font-black ${t1}`}>{summary.players}</p>
                <p className={`text-[0.52rem] font-bold uppercase tracking-wide ${t3}`}>Players</p>
              </div>
            )}
            {summary.clubs !== undefined && (
              <div className={`rounded-lg p-2.5 text-center ${bg2}`}>
                <p className={`font-mono text-xl font-black ${t1}`}>{summary.clubs}</p>
                <p className={`text-[0.52rem] font-bold uppercase tracking-wide ${t3}`}>Clubs</p>
              </div>
            )}
            {summary.news !== undefined && (
              <div className={`rounded-lg p-2.5 text-center ${bg2}`}>
                <p className={`font-mono text-xl font-black ${t1}`}>{summary.news}</p>
                <p className={`text-[0.52rem] font-bold uppercase tracking-wide ${t3}`}>News</p>
              </div>
            )}
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className={`rounded-xl p-4 ${bg2}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-[0.65rem] font-extrabold uppercase tracking-widest ${t1}`}>Log</p>
            <button onClick={() => setLog([])} className={`text-[0.58rem] uppercase ${t3} hover:text-[#cc0000]`}>Clear</button>
          </div>
          <div className="font-mono text-[0.65rem] space-y-1 max-h-80 overflow-y-auto">
            {log.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gray-600 flex-shrink-0 text-[0.58rem]">{e.time}</span>
                <span className={`${e.color} break-all`}>{e.msg}</span>
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 border border-[#cc0000] border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500">Running…</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`rounded-xl p-4 mt-4 border-l-4 border-yellow-500 ${bg1}`}>
        <p className="text-[0.65rem] font-extrabold text-yellow-500 uppercase tracking-widest mb-1">⚠️ Important</p>
        <p className={`text-[0.65rem] leading-relaxed ${t3}`}>
          For <strong className="text-yellow-400">Force Reseed</strong> to work, Firestore rules must allow writes.
          Set rules to <code className="text-yellow-300">allow read, write: if true</code> before running, then restore proper rules after.
        </p>
      </div>
    </div>
  );
}
