// ─────────────────────────────────────────────────────────
//  Football-Data.org API
//  On localhost: calls API directly via CORS proxy
//  On deployed (Vercel): calls our serverless functions in /api/
//  This avoids ALL CORS issues on deployment
// ─────────────────────────────────────────────────────────

const API_KEY  = process.env.REACT_APP_FOOTBALL_DATA_KEY;
const BASE     = 'https://api.football-data.org/v4';
const IS_LOCAL = window.location.hostname === 'localhost';

// On localhost use direct API with proxy, on Vercel use serverless functions
async function apiFetch(path) {
  try {
    if (IS_LOCAL) {
      // Direct call with CORS proxy on localhost
      const url = `https://corsproxy.io/?${encodeURIComponent(`${BASE}${path}`)}`;
      const res = await fetch(url, {
        headers: { 'X-Auth-Token': API_KEY },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } else {
      // Use our Vercel serverless functions — no CORS issues
      return await serverlessFetch(path);
    }
  } catch (err) {
    console.warn(`[FootballData] ${path} failed:`, err.message);
    return null;
  }
}

// Route requests to the correct serverless function
async function serverlessFetch(path) {
  let url;

  if (path.includes('/standings')) {
    const code = path.split('/competitions/')[1]?.split('/')[0];
    url = `/api/standings?code=${code}`;
  } else if (path.includes('/scorers')) {
    const code = path.split('/competitions/')[1]?.split('/')[0];
    const limit = path.includes('limit=') ? path.split('limit=')[1] : 15;
    url = `/api/scorers?code=${code}&limit=${limit}`;
  } else if (path.includes('/matches') && path.includes('/competitions/')) {
    const code   = path.split('/competitions/')[1]?.split('/')[0];
    const status = path.includes('SCHEDULED') ? 'SCHEDULED' : 'FINISHED';
    url = `/api/fixtures?code=${code}&status=${status}`;
  } else if (path.includes('/teams/') && path.includes('/matches')) {
    const teamId = path.split('/teams/')[1]?.split('/')[0];
    const status = path.includes('SCHEDULED') ? 'SCHEDULED' : 'FINISHED';
    const limit  = path.includes('limit=') ? path.split('limit=')[1] : 10;
    url = `/api/team?teamId=${teamId}&status=${status}&limit=${limit}`;
  } else {
    throw new Error(`No serverless function for path: ${path}`);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Serverless error: ${res.status}`);
  return await res.json();
}

// ── Team IDs (Football-Data.org) ─────────────────────────
export const TEAM_IDS = {
  'arsenal':    57,
  'mancity':    65,
  'liverpool':  64,
  'chelsea':    61,
  'spurs':      73,
  'manu':       66,
  'astonvilla': 58,
  'newcastle':  67,
  'everton':    62,
  'realmadrid': 86,
  'barcelona':  81,
  'atletico':   78,
  'bilbao':     77,
  'sociedad':   92,
  'sevilla':    559,
  'bayern':     5,
  'leverkusen': 3,
  'bvb':        4,
  'frankfurt':  19,
  'inter':      108,
  'acmilan':    98,
  'juventus':   109,
  'atalanta':   102,
  'napoli':     113,
  'roma':       100,
  'psg':        524,
  'monaco':     548,
  'lyon':       523,
  'marseille':  516,
  'alnassr':    null,
  'intermiami': null,
  'como':       null,
  'alittihad':  null,
  'alhilal':    null,
  'alahli':     null,
};

// ── Competition codes ─────────────────────────────────────
export const COMPETITIONS = {
  'Premier League': 'PL',
  'La Liga':        'PD',
  'Bundesliga':     'BL1',
  'Serie A':        'SA',
  'Ligue 1':        'FL1',
  'UCL':            'CL',
};

// ── Standings ─────────────────────────────────────────────
export async function fetchStandings(competitionCode = 'PL') {
  const json = await apiFetch(`/competitions/${competitionCode}/standings`);
  if (!json) return [];
  const table = json.standings?.[0]?.table || [];
  return table.map(entry => ({
    position: entry.position,
    team:     entry.team?.name     || '',
    teamId:   entry.team?.id       || 0,
    crest:    entry.team?.crest    || '',
    played:   entry.playedGames    || 0,
    won:      entry.won            || 0,
    draw:     entry.draw           || 0,
    lost:     entry.lost           || 0,
    gf:       entry.goalsFor       || 0,
    ga:       entry.goalsAgainst   || 0,
    gd:       entry.goalDifference || 0,
    points:   entry.points         || 0,
    form:     entry.form           || '',
  }));
}

// ── Top Scorers ───────────────────────────────────────────
export async function fetchTopScorers(competitionCode = 'PL', limit = 15) {
  const json = await apiFetch(`/competitions/${competitionCode}/scorers?limit=${limit}`);
  if (!json) return [];
  return (json.scorers || []).map(s => ({
    name:        s.player?.name        || '',
    playerId:    s.player?.id          || 0,
    nationality: s.player?.nationality || '',
    position:    s.player?.position    || '',
    team:        s.team?.name          || '',
    teamId:      s.team?.id            || 0,
    crest:       s.team?.crest         || '',
    goals:       s.goals               || 0,
    assists:     s.assists             || 0,
    penalties:   s.penalties           || 0,
    matches:     s.playedMatches       || 0,
  }));
}

// ── Upcoming fixtures (league-wide) ──────────────────────
export async function fetchUpcomingFixtures(competitionCode = 'PL', limit = 10) {
  const json = await apiFetch(`/competitions/${competitionCode}/matches?status=SCHEDULED`);
  if (!json) return [];
  const now = new Date();
  return (json.matches || [])
    .filter(m => new Date(m.utcDate) >= now)
    .slice(0, limit)
    .map(m => formatMatch(m));
}

// ── Recent results (league-wide) ─────────────────────────
export async function fetchRecentResults(competitionCode = 'PL', limit = 10) {
  const json = await apiFetch(`/competitions/${competitionCode}/matches?status=FINISHED`);
  if (!json) return [];
  return (json.matches || []).slice(-limit).reverse().map(m => formatMatch(m));
}

// ── Team-specific matches ─────────────────────────────────
export async function fetchTeamMatches(clubId) {
  const teamId = TEAM_IDS[clubId];
  if (!teamId) return { recent: [], upcoming: [] };

  try {
    const now = new Date();
    const [nextJson, prevJson] = await Promise.all([
      apiFetch(`/teams/${teamId}/matches?status=SCHEDULED&limit=20`),
      apiFetch(`/teams/${teamId}/matches?status=FINISHED&limit=6`),
    ]);

    const upcoming = (nextJson?.matches || [])
      .filter(m => new Date(m.utcDate) >= now)
      .slice(0, 6)
      .map(m => formatMatch(m));

    const recent = (prevJson?.matches || [])
      .slice(-6)
      .reverse()
      .map(m => formatMatch(m));

    return { recent, upcoming };
  } catch (err) {
    console.warn(`fetchTeamMatches(${clubId}):`, err.message);
    return { recent: [], upcoming: [] };
  }
}

// ── Format match ──────────────────────────────────────────
function formatMatch(m) {
  const home  = m.homeTeam || {};
  const away  = m.awayTeam || {};
  const score = m.score?.fullTime || {};
  const date  = new Date(m.utcDate);

  return {
    id:          m.id,
    date:        date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    time:        date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    fullDate:    m.utcDate,
    homeTeam:    home.name  || '',
    homeTeamId:  home.id    || 0,
    homeCrest:   home.crest || '',
    awayTeam:    away.name  || '',
    awayTeamId:  away.id    || 0,
    awayCrest:   away.crest || '',
    homeGoals:   score.home ?? null,
    awayGoals:   score.away ?? null,
    status:      m.status   || '',
    matchday:    m.matchday || '',
    competition: m.competition?.name || '',
  };
}
