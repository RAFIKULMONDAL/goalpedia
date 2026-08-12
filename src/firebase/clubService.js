import {
  collection, getDocs, getDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'clubs';

// Fetch ALL clubs — filtering done in JS
export async function getClubs() {
  const snap = await getDocs(query(collection(db, COL), orderBy('name')));
  return snap.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
}

// Get single club by slug ID
export async function getClubById(id) {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { ...snap.data(), firestoreId: snap.id } : null;
}

// Filter clubs in JS
export function filterClubs(clubs, { q = '', activeLeague = null } = {}) {
  return clubs.filter(c => {
    const lq = q.toLowerCase().trim();
    const matchSearch = !lq ||
      c.name?.toLowerCase().includes(lq)   ||
      c.league?.toLowerCase().includes(lq) ||
      c.city?.toLowerCase().includes(lq)   ||
      c.mgr?.toLowerCase().includes(lq);
    const matchLeague = !activeLeague || c.league === activeLeague;
    return matchSearch && matchLeague;
  });
}
