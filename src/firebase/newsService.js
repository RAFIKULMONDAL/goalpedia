// ─────────────────────────────────────────────
//  Firestore — News Service
//  Reads news articles saved by syncService.js
// ─────────────────────────────────────────────
import {
  collection, getDocs, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'news';

export async function getNews(count = 20) {
  try {
    const snap = await getDocs(
      query(collection(db, COL), orderBy('publishedAt', 'desc'), limit(count))
    );
    if (snap.empty) return [];
    return snap.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
  } catch (err) {
    // If news collection doesn't exist yet, return empty array
    console.warn('getNews:', err.message);
    return [];
  }
}
