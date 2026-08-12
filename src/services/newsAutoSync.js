// ─────────────────────────────────────────────────────────
//  News Auto-Sync Service
//  Smart rate-limited sync — stores state in localStorage
//  instead of Firestore to avoid permission issues.
// ─────────────────────────────────────────────────────────
import { db } from '../firebase/config';
import {
  collection, doc, writeBatch,
  getDocs, serverTimestamp,
} from 'firebase/firestore';
import { fetchFootballNews, fetchTransferNews } from './newsApi';

const DAILY_LIMIT   = 100;
const NEWS_REQUESTS = 2;
const LS_KEY        = 'goalpedia_news_sync_v2';

// ── State stored in localStorage (no auth needed) ────────
function getSyncState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { requestsUsed: 0, lastReset: Date.now(), lastSync: 0 };
    return JSON.parse(raw);
  } catch { return { requestsUsed: 0, lastReset: Date.now(), lastSync: 0 }; }
}

function saveSyncState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

function checkAndResetDaily(state) {
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (Date.now() - state.lastReset > oneDayMs) {
    return { ...state, requestsUsed: 0, lastReset: Date.now() };
  }
  return state;
}

export function getOptimalSyncInterval(requestsUsed = 0) {
  const remaining    = DAILY_LIMIT - requestsUsed;
  const possibleSync = Math.floor(remaining / NEWS_REQUESTS);
  if (possibleSync <= 0)  return null;
  if (possibleSync >= 40) return 30 * 60 * 1000;
  if (possibleSync >= 20) return 60 * 60 * 1000;
  if (possibleSync >= 10) return 2 * 60 * 60 * 1000;
  if (possibleSync >= 5)  return 4 * 60 * 60 * 1000;
  return 8 * 60 * 60 * 1000;
}

// ── Perform news sync ─────────────────────────────────────
export async function performNewsSync(force = false) {
  let state = getSyncState();
  state     = checkAndResetDaily(state);

  const remaining = DAILY_LIMIT - (state.requestsUsed || 0);

  if (!force) {
    if (remaining < NEWS_REQUESTS) {
      console.log(`[NewsSync] Budget exhausted (${remaining} left). Resets in ${Math.round((state.lastReset + 86400000 - Date.now()) / 3600000)}h`);
      return { skipped: true, reason: 'Daily budget exhausted' };
    }
    const interval = getOptimalSyncInterval(state.requestsUsed || 0);
    const elapsed  = Date.now() - (state.lastSync || 0);
    if (elapsed < interval) {
      const nextIn = Math.round((interval - elapsed) / 60000);
      console.log(`[NewsSync] Next sync in ${nextIn} min (${remaining} requests left today)`);
      return { skipped: true, reason: `Wait ${nextIn} more min` };
    }
  }

  try {
    console.log('[NewsSync] Fetching news…');
    const [general, transfers] = await Promise.all([
      fetchFootballNews('Premier League La Liga football 2025', 15),
      fetchTransferNews(),
    ]);

    const seen     = new Set();
    const articles = [...general, ...transfers].filter(a => {
      if (!a.title || seen.has(a.title)) return false;
      seen.add(a.title); return true;
    });

    if (articles.length === 0) return { success: false, reason: 'No articles returned' };
    articles[0].featured = true;

    // Clear old news
    try {
      const existing = await getDocs(collection(db, 'news'));
      if (existing.size > 0) {
        const delBatch = writeBatch(db);
        existing.docs.forEach(d => delBatch.delete(d.ref));
        await delBatch.commit();
      }
    } catch (e) {
      console.warn('[NewsSync] Could not clear old news (permission issue — check Firestore rules for /news)');
    }

    // Write new articles
    try {
      const batch = writeBatch(db);
      articles.forEach((article, i) => {
        const id = `news-${i}-${Date.now()}`;
        batch.set(doc(db, 'news', id), { ...article, id, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (e) {
      if (e.code === 'permission-denied') {
        console.warn('[NewsSync] ❌ News write blocked — update Firestore rules: match /news/{id} { allow write: if true; }');
        return { success: false, reason: 'Firestore rules block news write. See console for fix.' };
      }
      throw e;
    }

    // Save state to localStorage
    const newState = {
      ...state,
      requestsUsed: (state.requestsUsed || 0) + NEWS_REQUESTS,
      lastSync:     Date.now(),
    };
    saveSyncState(newState);

    const newRemaining = DAILY_LIMIT - newState.requestsUsed;
    const nextInterval = getOptimalSyncInterval(newState.requestsUsed);
    console.log(`[NewsSync] ✅ ${articles.length} articles saved. ${newRemaining} requests left today.`);

    return {
      success:    true,
      articles:   articles.length,
      remaining:  newRemaining,
      nextSyncIn: nextInterval,
    };
  } catch (err) {
    console.error('[NewsSync] Failed:', err.message);
    return { success: false, reason: err.message };
  }
}

// ── Auto-sync timer ───────────────────────────────────────
let syncTimer = null;

export function initNewsAutoSync() {
  if (syncTimer) return;

  async function runSync() {
    const result   = await performNewsSync();
    const interval = result.skipped
      ? getOptimalSyncInterval(0) || 30 * 60 * 1000
      : result.nextSyncIn        || 30 * 60 * 1000;
    syncTimer = setTimeout(runSync, interval);
  }

  syncTimer = setTimeout(runSync, 5000);
  console.log('[NewsSync] Auto-sync initialized');
}

export function stopNewsAutoSync() {
  if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
}

// ── Get current sync status (for UI display) ─────────────
export function getSyncStatus() {
  let state = getSyncState();
  state     = checkAndResetDaily(state);
  const remaining = DAILY_LIMIT - (state.requestsUsed || 0);
  const interval  = getOptimalSyncInterval(state.requestsUsed || 0);
  const elapsed   = Date.now() - (state.lastSync || 0);
  const nextIn    = interval ? Math.max(0, Math.round((interval - elapsed) / 60000)) : null;
  return {
    requestsUsed: state.requestsUsed || 0,
    remaining,
    lastSync:     state.lastSync ? new Date(state.lastSync).toLocaleTimeString() : 'Never',
    nextSyncIn:   nextIn,
  };
}
