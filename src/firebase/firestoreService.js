// src/firebase/firestoreService.js
// All Firestore read/write operations for players and clubs.
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';

// ── PLAYERS ───────────────────────────────────────────────────────────────────

/** Fetch all players, optionally filtered by position or cid (club id) */
export async function getPlayers({ pos, cid } = {}) {
  try {
    let q = collection(db, 'players');
    const constraints = [];
    if (pos && pos !== 'All') constraints.push(where('pos', '==', pos));
    if (cid) constraints.push(where('cid', '==', cid));
    if (constraints.length) q = query(q, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getPlayers error:', err);
    return [];
  }
}

/** Fetch a single player by Firestore doc id */
export async function getPlayerById(id) {
  try {
    const snap = await getDoc(doc(db, 'players', id));
    return snap.exists() ? { _id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('getPlayerById error:', err);
    return null;
  }
}

/** Get leaderboard data — top scorers, assisters, rated, dribblers */
export async function getLeaderboards(limitCount = 8) {
  try {
    const [goals, assists, rated, dribblers] = await Promise.all([
      getDocs(query(collection(db, 'players'), orderBy('s.g',  'desc'), limit(limitCount))),
      getDocs(query(collection(db, 'players'), orderBy('s.a',  'desc'), limit(limitCount))),
      getDocs(query(collection(db, 'players'), orderBy('s.r',  'desc'), limit(limitCount))),
      getDocs(query(collection(db, 'players'), orderBy('s.dr', 'desc'), limit(limitCount))),
    ]);
    const toArr = snap => snap.docs.map(d => ({ _id: d.id, ...d.data() }));
    return {
      topScorers:   toArr(goals),
      topAssists:   toArr(assists),
      topRated:     toArr(rated),
      topDribblers: toArr(dribblers),
    };
  } catch (err) {
    console.error('getLeaderboards error:', err);
    return { topScorers: [], topAssists: [], topRated: [], topDribblers: [] };
  }
}

// ── CLUBS ─────────────────────────────────────────────────────────────────────

/** Fetch all clubs, optionally filtered by league */
export async function getClubs({ league } = {}) {
  try {
    let q = collection(db, 'clubs');
    if (league) q = query(q, where('league', '==', league));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ _firestoreId: d.id, ...d.data() }));
  } catch (err) {
    console.error('getClubs error:', err);
    return [];
  }
}

/** Fetch a single club by its slug id (e.g. "arsenal") */
export async function getClubById(slugId) {
  try {
    const snap = await getDoc(doc(db, 'clubs', slugId));
    return snap.exists() ? { _firestoreId: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('getClubById error:', err);
    return null;
  }
}

// ── FAVOURITES ────────────────────────────────────────────────────────────────

/** Toggle a player in user's favourites list */
export async function toggleFavouritePlayer(uid, playerId, currentFavs = []) {
  const updated = currentFavs.includes(playerId)
    ? currentFavs.filter(id => id !== playerId)
    : [...currentFavs, playerId];
  await updateDoc(doc(db, 'users', uid), { favouritePlayers: updated });
  return updated;
}

/** Toggle a club in user's favourites list */
export async function toggleFavouriteClub(uid, clubId, currentFavs = []) {
  const updated = currentFavs.includes(clubId)
    ? currentFavs.filter(id => id !== clubId)
    : [...currentFavs, clubId];
  await updateDoc(doc(db, 'users', uid), { favouriteClubs: updated });
  return updated;
}
