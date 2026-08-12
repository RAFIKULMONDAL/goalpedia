// ─────────────────────────────────────────────────────────
//  NewsAPI Service
//  Fetches real football news articles and saves to Firestore
//  Called once per day via syncService.js
// ─────────────────────────────────────────────────────────

const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const BASE_URL     = 'https://newsapi.org/v2';

// Fetch football news articles
export async function fetchFootballNews(query = 'football soccer', pageSize = 20) {
  try {
    const url = new URL(`${BASE_URL}/everything`);
    url.searchParams.append('q',          query);
    url.searchParams.append('language',   'en');
    url.searchParams.append('sortBy',     'publishedAt');
    url.searchParams.append('pageSize',   pageSize);
    url.searchParams.append('apiKey',     NEWS_API_KEY);

    const res  = await fetch(url.toString());
    const json = await res.json();

    if (json.status !== 'ok') {
      throw new Error(json.message || 'NewsAPI error');
    }

    return json.articles
      .filter(a => a.title && a.urlToImage && !a.title.includes('[Removed]'))
      .map((a, i) => ({
        id:          `news-${Date.now()}-${i}`,
        tag:         detectTag(a.title + ' ' + (a.description || '')),
        title:       a.title,
        desc:        a.description || '',
        img:         a.urlToImage  || '',
        url:         a.url         || '',
        source:      a.source?.name || 'Unknown',
        date:        formatDate(a.publishedAt),
        publishedAt: a.publishedAt,
        featured:    i === 0,  // first article is featured
      }));
  } catch (err) {
    console.warn('fetchFootballNews failed:', err.message);
    return [];
  }
}

// Fetch transfer-specific news
export async function fetchTransferNews() {
  return fetchFootballNews('football transfer signing 2025', 10);
}

// Fetch injury news
export async function fetchInjuryNews() {
  return fetchFootballNews('football injury return 2025', 10);
}

// Fetch news for a specific team
export async function fetchTeamNews(teamName) {
  return fetchFootballNews(`${teamName} football`, 5);
}

// ── Helpers ───────────────────────────────────────────────

function detectTag(text) {
  const t = text.toLowerCase();
  if (t.includes('transfer') || t.includes('sign') || t.includes('deal') || t.includes('bid'))
    return 'Transfer';
  if (t.includes('injur') || t.includes('ruled out') || t.includes('return'))
    return 'Injury';
  if (t.includes('award') || t.includes('ballon') || t.includes('player of'))
    return 'Award';
  if (t.includes('record') || t.includes('history') || t.includes('milestone'))
    return 'Record';
  if (t.includes('match') || t.includes('vs') || t.includes('score') || t.includes('goal'))
    return 'Match Report';
  if (t.includes('tactical') || t.includes('analysis') || t.includes('why') || t.includes('how'))
    return 'Analysis';
  if (t.includes('press') || t.includes('conference') || t.includes('manager') || t.includes('coach'))
    return 'Press';
  return 'News';
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
}
