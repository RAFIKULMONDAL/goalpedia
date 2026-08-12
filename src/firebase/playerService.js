import {
  collection, getDocs, getDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'players';

const LEAGUE_CIDS = {
  'Premier League':   ['arsenal','mancity','liverpool','chelsea','spurs','manu','astonvilla','newcastle','everton',],
  'La Liga':          ['realmadrid','barcelona','atletico','bilbao','sociedad','sevilla'],
  'Bundesliga':       ['bayern','leverkusen','bvb','frankfurt'],
  'Serie A':          ['inter','acmilan','juventus','atalanta','napoli','roma','como'],
  'Ligue 1':          ['psg','monaco','lyon','marseille'],
  'UCL':              ['arsenal','mancity','liverpool','realmadrid','barcelona','bayern','psg','inter','atletico','leverkusen','bvb'],
  'MLS':              ['intermiami'],
  'Saudi Pro League': ['alnassr','alittihad',],
};

// Fetch ALL players from Firestore — filtering is done in JS
export async function getPlayers() {
  const snap = await getDocs(query(collection(db, COL), orderBy('name')));
  return snap.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
}

// Get single player by Firestore doc ID
export async function getPlayerById(id) {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { ...snap.data(), firestoreId: snap.id } : null;
}

// Get leaderboards — fetches all, sorts in JS
export async function getLeaderboards() {
  const snap = await getDocs(collection(db, COL));
  const all  = snap.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
  const sort = (fn) => [...all].sort((a, b) => fn(b) - fn(a)).slice(0, 8);
  return {
    topScorers:   sort(p => p.s?.g  ?? 0),
    topAssists:   sort(p => p.s?.a  ?? 0),
    topRated:     sort(p => p.s?.r  ?? 0),
    topDribblers: sort(p => p.s?.dr ?? 0),
  };
}

// Filter players in JS (fast for small dataset)
export function filterPlayers(players, { q = '', pos = 'All', activeLeague = null } = {}) {
  return players.filter(p => {
    const lq = q.toLowerCase().trim();
    const matchSearch = !lq ||
      p.name?.toLowerCase().includes(lq) ||
      p.club?.toLowerCase().includes(lq) ||
      p.nat?.toLowerCase().includes(lq)  ||
      p.pos?.toLowerCase().includes(lq);
    const matchPos    = pos === 'All' || p.pos === pos;
    const matchLeague = !activeLeague ||
      (LEAGUE_CIDS[activeLeague] || []).includes(p.cid);
    return matchSearch && matchPos && matchLeague;
  });
}
