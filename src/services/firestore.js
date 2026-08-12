// ─────────────────────────────────────────────────────────
//  Firestore service — all read/write operations in one place.
//  Components and hooks import from here, never directly from firebase/firestore.
// ─────────────────────────────────────────────────────────
import {
  collection, doc,
  getDocs, getDoc, setDoc, updateDoc,
  query, where, orderBy, limit,
  arrayUnion, arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Collection references ──────────────────────────────────
const playersCol = () => collection(db, 'players');
const clubsCol   = () => collection(db, 'clubs');
const usersCol   = () => collection(db, 'users');

// ══════════════════════════════════════════════════════════
//  PLAYERS
// ══════════════════════════════════════════════════════════

/** Fetch all players, optionally filtered by position or club id */
export async function fetchPlayers({ pos, cid } = {}) {
  let q = playersCol();

  if (pos && pos !== 'All' && cid) {
    q = query(playersCol(), where('pos', '==', pos), where('cid', '==', cid));
  } else if (pos && pos !== 'All') {
    q = query(playersCol(), where('pos', '==', pos));
  } else if (cid) {
    q = query(playersCol(), where('cid', '==', cid));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Fetch a single player by Firestore document id */
export async function fetchPlayerById(id) {
  const snap = await getDoc(doc(db, 'players', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Fetch leaderboards — top 8 per category */
export async function fetchLeaderboards() {
  const snap = await getDocs(playersCol());
  const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const sort  = (key) => [...all].sort((a, b) => (b.s?.[key] || 0) - (a.s?.[key] || 0)).slice(0, 8);
  return {
    topScorers:   sort('g'),
    topAssists:   sort('a'),
    topRated:     sort('r'),
    topDribblers: sort('dr'),
  };
}

// ══════════════════════════════════════════════════════════
//  CLUBS
// ══════════════════════════════════════════════════════════

/** Fetch all clubs, optionally filtered by league */
export async function fetchClubs({ league } = {}) {
  let q = clubsCol();
  if (league) q = query(clubsCol(), where('league', '==', league));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}

/** Fetch a single club by its slug id (e.g. "arsenal") */
export async function fetchClubById(slugId) {
  // Clubs are stored with their slug as the Firestore document id
  const snap = await getDoc(doc(db, 'clubs', slugId));
  return snap.exists() ? { firestoreId: snap.id, ...snap.data() } : null;
}

// ══════════════════════════════════════════════════════════
//  USER PROFILE
// ══════════════════════════════════════════════════════════

/** Create a user profile doc in Firestore after registration */
export async function createUserProfile(uid, { name, email }) {
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    favouritePlayers: [],
    favouriteClubs:   [],
    avatarColor:      '#cc0000',
    createdAt:        serverTimestamp(),
  });
}

/** Fetch a user's profile from Firestore */
export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

/** Toggle a player in/out of a user's favourites */
export async function toggleFavouritePlayer(uid, playerId) {
  const profile = await fetchUserProfile(uid);
  const isFav   = profile?.favouritePlayers?.includes(playerId);
  await updateDoc(doc(db, 'users', uid), {
    favouritePlayers: isFav ? arrayRemove(playerId) : arrayUnion(playerId),
  });
  return !isFav;
}

/** Toggle a club in/out of a user's favourites */
export async function toggleFavouriteClub(uid, clubId) {
  const profile = await fetchUserProfile(uid);
  const isFav   = profile?.favouriteClubs?.includes(clubId);
  await updateDoc(doc(db, 'users', uid), {
    favouriteClubs: isFav ? arrayRemove(clubId) : arrayUnion(clubId),
  });
  return !isFav;
}

/** Update user's display name */
export async function updateUserName(uid, name) {
  await updateDoc(doc(db, 'users', uid), { name });
}
