// ─────────────────────────────────────────────────────────
//  Football-Data.org API
//  Key: loaded from REACT_APP_FOOTBALL_DATA_KEY in .env
//  Free: 10 req/min, top 6 leagues + UCL
//  Provides: standings, fixtures, results, top scorers
// ─────────────────────────────────────────────────────────

const API_KEY    = process.env.REACT_APP_FOOTBALL_DATA_KEY;
const BASE       = 'https://api.football-data.org/v4';
// CORS proxy needed since Football-Data.org blocks direct browser requests
const PROXY      = 'https://corsproxy.io/?';

async function apiFetch(path) {
  const url = `${PROXY}${encodeURIComponent(`${BASE}${path}`)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY,
        'x-requested-with': 'XMLHttpRequest',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[FootballData] ${path} failed:`, err.message);
    return null;
  }
}

// ── Team IDs (Football-Data.org) ─────────────────────────
export const TEAM_IDS = {
  // Premier League
  'arsenal':     57,
  'mancity':     65,
  'liverpool':   64,
  'chelsea':     61,
  'spurs':       73,
  'manu':        66,
  'astonvilla':  58,
  // La Liga
  'realmadrid':  86,
  'barcelona':   81,
  'atletico':    78,
  // Bundesliga
  'bayern':      5,
  'leverkusen':  3,
  // Serie A
  'inter':       108,
  'acmilan':     98,
  'juventus':    109,
  'atalanta':    102,
  // Ligue 1
  'psg':         524,
  // Others - not on Football-Data.org free tier
  'alnassr':     null,
  'intermiami':  null,
};

// ── Team-specific matches (recent + upcoming) ─────────────
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

// ── Competition codes ─────────────────────────────────────
export const COMPETITIONS = {
  'Premier League': 'PL',
  'La Liga':        'PD',
  'Bundesliga':     'BL1',
  'Serie A':        'SA',
  'Ligue 1':        'FL1',
  'UCL':            'CL',
  // 'Europa League': 'EL',  // Not on free tier
};

// ── Standings ─────────────────────────────────────────────
export async function fetchStandings(competitionCode = 'PL') {
  const json = await apiFetch(`/competitions/${competitionCode}/standings`);
  if (!json) return [];
  const table = json.standings?.[0]?.table || [];
  return table.map(entry => ({
    position:   entry.position,
    team:       entry.team?.name        || '',
    teamId:     entry.team?.id          || 0,
    crest:      entry.team?.crest       || '',
    played:     entry.playedGames       || 0,
    won:        entry.won               || 0,
    draw:       entry.draw              || 0,
    lost:       entry.lost              || 0,
    gf:         entry.goalsFor          || 0,
    ga:         entry.goalsAgainst      || 0,
    gd:         entry.goalDifference    || 0,
    points:     entry.points            || 0,
    form:       entry.form              || '',
  }));
}

// ── Top Scorers ───────────────────────────────────────────
export async function fetchTopScorers(competitionCode = 'PL', limit = 10) {
  const json = await apiFetch(`/competitions/${competitionCode}/scorers?limit=${limit}`);
  if (!json) return [];
  return (json.scorers || []).map(s => ({
    name:       s.player?.name         || '',
    playerId:   s.player?.id           || 0,
    nationality: s.player?.nationality || '',
    position:   s.player?.position     || '',
    team:       s.team?.name           || '',
    teamId:     s.team?.id             || 0,
    crest:      s.team?.crest          || '',
    goals:      s.goals                || 0,
    assists:    s.assists              || 0,
    penalties:  s.penalties            || 0,
    matches:    s.playedMatches        || 0,
  }));
}

// ── Fixtures — upcoming matches ───────────────────────────
export async function fetchUpcomingFixtures(competitionCode = 'PL', limit = 10) {
  const json = await apiFetch(`/competitions/${competitionCode}/matches?status=SCHEDULED`);
  if (!json) return [];
  return (json.matches || []).slice(0, limit).map(m => formatMatch(m));
}

// ── Recent results ────────────────────────────────────────
export async function fetchRecentResults(competitionCode = 'PL', limit = 10) {
  const json = await apiFetch(`/competitions/${competitionCode}/matches?status=FINISHED`);
  if (!json) return [];
  const matches = json.matches || [];
  // Most recent first
  return matches.slice(-limit).reverse().map(m => formatMatch(m));
}

// fetchTeamMatches is defined above using TEAM_IDS mapping

// ── Competition info ──────────────────────────────────────
export async function fetchCompetitionInfo(competitionCode = 'PL') {
  const json = await apiFetch(`/competitions/${competitionCode}`);
  if (!json) return null;
  return {
    id:       json.id,
    name:     json.name,
    code:     json.code,
    emblem:   json.emblem,
    country:  json.area?.name || '',
    season:   json.currentSeason?.startDate?.slice(0, 4) || '',
  };
}

// ── Format match ──────────────────────────────────────────
function formatMatch(m) {
  const home = m.homeTeam || {};
  const away = m.awayTeam || {};
  const score = m.score?.fullTime || {};
  const date  = new Date(m.utcDate);

  return {
    id:          m.id,
    date:        date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    time:        date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    fullDate:    m.utcDate,
    homeTeam:    home.name       || '',
    homeTeamId:  home.id         || 0,
    homeCrest:   home.crest      || '',
    awayTeam:    away.name       || '',
    awayTeamId:  away.id         || 0,
    awayCrest:   away.crest      || '',
    homeGoals:   score.home      ?? null,
    awayGoals:   score.away      ?? null,
    status:      m.status        || '',
    matchday:    m.matchday      || '',
    competition: m.competition?.name || '',
  };
}
