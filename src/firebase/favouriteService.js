// ─────────────────────────────────────────────
//  Firestore — Favourites Service
//  Toggles favourite players/clubs on the
//  user's Firestore document.
// ─────────────────────────────────────────────
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';

// ── Toggle favourite player ───────────────────
export async function toggleFavouritePlayer(uid, playerId) {
  const ref  = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const favs = snap.data().favouritePlayers || [];
  const op   = favs.includes(playerId) ? arrayRemove : arrayUnion;
  await updateDoc(ref, { favouritePlayers: op(playerId) });
}

// ── Toggle favourite club ─────────────────────
export async function toggleFavouriteClub(uid, clubId) {
  const ref  = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const favs = snap.data().favouriteClubs || [];
  const op   = favs.includes(clubId) ? arrayRemove : arrayUnion;
  await updateDoc(ref, { favouriteClubs: op(clubId) });
}

// ── Get user favourites ───────────────────────
export async function getFavourites(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return { favouritePlayers: [], favouriteClubs: [] };
  const { favouritePlayers = [], favouriteClubs = [] } = snap.data();
  return { favouritePlayers, favouriteClubs };
}
