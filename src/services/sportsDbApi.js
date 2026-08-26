// ─────────────────────────────────────────────────────────
//  TheSportsDB API — Free tier, no key needed
//  Base: https://www.thesportsdb.com/api/v1/json/3
//  Note: Only searchteams.php works on free tier (CORS)
//        lookupteam.php is blocked
// ─────────────────────────────────────────────────────────

const BASE    = 'https://www.thesportsdb.com/api/v1/json/3';
const IS_LOCAL = window.location.hostname === 'localhost';

async function apiFetch(path) {
  try {
    if (IS_LOCAL) {
      // On localhost use corsproxy since TheSportsDB blocks direct browser calls
      const url = `https://corsproxy.io/?${encodeURIComponent(`${BASE}${path}`)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } else {
      // On Vercel use our serverless function — zero CORS issues
      const res = await fetch(`/api/sportsdb?path=${encodeURIComponent(path)}`);
      if (!res.ok) return null;
      return await res.json();
    }
  } catch (err) {
    console.warn(`[SportsDB] ${path} failed:`, err.message);
    return null;
  }
}

// ── Exact search terms per club slug ──────────────────────
// Maps our internal club ID to the exact TheSportsDB search term
// This avoids wrong results (e.g. "mancity" → "Manchester City")
const EXACT_SEARCH_TERMS = {
  'arsenal':     'Arsenal',
  'mancity':     'Manchester City',
  'liverpool':   'Liverpool',
  'chelsea':     'Chelsea',
  'spurs':       'Tottenham Hotspur',
  'manu':        'Manchester United',
  'astonvilla':  'Aston Villa',
  'realmadrid':  'Real Madrid',
  'barcelona':   'Barcelona',
  'atletico':    'Atletico Madrid',
  'bayern':      'Bayern Munich',
  'leverkusen':  'Bayer Leverkusen',
  'inter':       'Inter Milan',
  'acmilan':     'AC Milan',
  'juventus':    'Juventus',
  'atalanta':    'Atalanta',
  'psg':         'Paris Saint-Germain',
  'alnassr':     'Al-Nassr',
  'intermiami':  'Inter Miami CF',
};

// ── Search team by name ───────────────────────────────────
export async function searchTeam(name, clubId = null) {
  // Use exact search term for this club if available
  const exactTerm = clubId && EXACT_SEARCH_TERMS[clubId] ? EXACT_SEARCH_TERMS[clubId] : name;
  name = exactTerm;
  const json  = await apiFetch(`/searchteams.php?t=${encodeURIComponent(name)}`);
  const teams = json?.teams || [];
  if (!teams.length) return null;

  const nameLower = name.toLowerCase();

  // Filter to soccer only, no women's teams
  const soccerMens = teams.filter(t =>
    t.strSport === 'Soccer' &&
    !t.strTeam?.toLowerCase().includes('women') &&
    !t.strTeam?.toLowerCase().includes('ladies') &&
    !t.strLeague?.toLowerCase().includes('women')
  );

  const pool = soccerMens.length ? soccerMens : teams;

  // Exact name match first
  const exact = pool.find(t =>
    t.strTeam?.toLowerCase() === nameLower
  );
  if (exact) return exact;

  // Starts-with match
  const startsWith = pool.find(t =>
    t.strTeam?.toLowerCase().startsWith(nameLower)
  );
  if (startsWith) return startsWith;

  // Score by data richness + name similarity
  const scored = pool.map(t => {
    let score = 0;
    if (t.strTeamBadge)     score += 3;
    if (t.strDescriptionEN) score += 2;
    if (t.strStadium)       score += 1;
    if (t.strTeam?.toLowerCase().includes(nameLower)) score += 2;
    return { t, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.t || null;
}

// ── Search player by name ─────────────────────────────────
export async function searchPlayer(name) {
  const json    = await apiFetch(`/searchplayers.php?p=${encodeURIComponent(name)}`);
  const players = json?.player || [];
  return players[0] || null;
}

// ── Format player from SportsDB ───────────────────────────
export function formatPlayerFromSportsDB(p) {
  if (!p) return null;
  return {
    sportsDbId:    p.idPlayer,
    name:          p.strPlayer,
    photo:         p.strThumb || p.strCutout || p.strRender || '',
    nationality:   p.strNationality || p.strCountry || '',
    position:      p.strPosition || '',
    age:           p.dateBorn
                   ? Math.floor((Date.now() - new Date(p.dateBorn)) / 31557600000)
                   : 0,
    born:          p.dateBorn        || '',
    height:        p.strHeight       || '',
    weight:        p.strWeight       || '',
    foot:          p.strFoot || p.strPreferredFoot || '',
    description:   p.strDescriptionEN || '',
    club:          p.strTeam         || '',
    clubId:        p.idTeam          || '',
    instagram:     p.strInstagram    || '',
    twitter:       p.strTwitter      || '',
    birthLocation: p.strBirthLocation || '',
    signing:       p.strSigning      || '',
    wage:          p.strWage         || '',
    outfitter:     p.strOutfitter    || '',
    agent:         p.strAgent        || '',
  };
}

// ── Format team from SportsDB ─────────────────────────────
export function formatTeamFromSportsDB(t) {
  if (!t) return null;
  return {
    sportsDbId:      t.idTeam,
    name:            t.strTeam,
    logo:            t.strTeamBadge   || t.strBadge  || '',
    banner:          t.strTeamBanner  || '',
    jersey:          t.strTeamJersey  || '',
    stadium:         t.strStadium     || '',
    stadiumThumb:    t.strStadiumThumb || '',
    stadiumDesc:     t.strStadiumDescription || '',
    stadiumLocation: t.strStadiumLocation || '',
    stadiumCapacity: t.intStadiumCapacity || '',
    city:            t.strCity        || t.strLocation || '',
    country:         t.strCountry     || '',
    founded:         t.intFormedYear  || '',
    manager:         t.strManager     || '',
    description:     t.strDescriptionEN || '',
    website:         t.strWebsite     || '',
    facebook:        t.strFacebook    || '',
    twitter:         t.strTwitter     || '',
    instagram:       t.strInstagram   || '',
    league:          t.strLeague      || '',
  };
}

// ── Get team details by club slug ─────────────────────────
// Uses exact search terms to avoid wrong results
export async function getTeamDetails(teamName, clubId = null) {
  // Use exact search term if we have one for this club
  const searchTerm = (clubId && EXACT_SEARCH_TERMS[clubId])
    ? EXACT_SEARCH_TERMS[clubId]
    : teamName;

  const raw = await searchTeam(searchTerm);
  if (!raw) return null;
  return formatTeamFromSportsDB(raw);
}

// ── Get players by team ───────────────────────────────────
export async function getPlayersByTeam(teamId) {
  const json = await apiFetch(`/lookup_all_players.php?id=${teamId}`);
  return (json?.player || []).map(p => formatPlayerFromSportsDB(p));
}


