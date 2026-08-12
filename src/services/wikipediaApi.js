// ─────────────────────────────────────────────────────────
//  Wikipedia API — Free, no key needed
//  Provides: player stats summary, career info, club history
// ─────────────────────────────────────────────────────────

const BASE = 'https://en.wikipedia.org/api/rest_v1';

async function apiFetch(path) {
  try {
    const res  = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[Wikipedia] ${path} failed:`, err.message);
    return null;
  }
}

// ── Get page summary for a player/club ───────────────────
export async function getWikiSummary(searchTerm) {
  try {
    // First search for the page
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*&srlimit=3`
    );
    const searchJson = await searchRes.json();
    const pages = searchJson?.query?.search || [];
    if (!pages.length) return null;

    // Get summary of first result
    const title   = pages[0].title;
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const json    = await apiFetch(`/page/summary/${encoded}`);
    if (!json) return null;

    return {
      title:     json.title,
      extract:   json.extract    || '',
      thumbnail: json.thumbnail?.source || '',
      url:       json.content_urls?.desktop?.page || '',
    };
  } catch (err) {
    console.warn(`[Wikipedia] getWikiSummary(${searchTerm}) failed:`, err.message);
    return null;
  }
}

// ── Get player stats from Wikipedia infobox ───────────────
// Wikipedia doesn't have a structured stats API —
// we parse the plain text extract for mentions of goals/assists
export function extractStatsFromSummary(extract) {
  if (!extract) return null;

  const stats = {};

  // Look for goal mentions like "scored 700 goals" or "700 career goals"
  const goalMatch = extract.match(/(\d{2,4})\s*(career\s*)?goals?/i);
  if (goalMatch) stats.careerGoals = parseInt(goalMatch[1]);

  // Look for appearances
  const appMatch = extract.match(/(\d{3,4})\s*(career\s*)?appearances?/i);
  if (appMatch) stats.careerApps = parseInt(appMatch[1]);

  // Look for assists
  const assistMatch = extract.match(/(\d{2,3})\s*(career\s*)?assists?/i);
  if (assistMatch) stats.careerAssists = parseInt(assistMatch[1]);

  // Look for trophies (clubs)
  const trophyMatch = extract.match(/won\s+(\d+)\s+(?:major\s+)?(?:trophies|titles|honours)/i);
  if (trophyMatch) stats.trophies = parseInt(trophyMatch[1]);

  return Object.keys(stats).length > 0 ? stats : null;
}

// ── Get club history from Wikipedia ──────────────────────
export async function getClubWikiInfo(clubName) {
  const summary = await getWikiSummary(`${clubName} F.C. football club`);
  if (!summary) return null;

  const stats  = extractStatsFromSummary(summary.extract);
  const height = extractHeightFromSummary(summary.extract);
  return {
    ...summary,
    stats,
    height,
  };
}

// ── Extract height from Wikipedia summary ────────────────
export function extractHeightFromSummary(extract) {
  if (!extract) return null;
  // Match patterns like "1.83 m", "183 cm", "6 ft 0 in", "6'0""
  const patterns = [
    /(\d\.\d{2})\s*m/i,           // 1.83 m
    /(\d{3})\s*cm/i,               // 183 cm
    /(\d)\s*ft\s*(\d+)\s*in/i,      // 6 ft 0 in
    /(\d)'(\d+)"/i,                  // 6'0"
  ];
  for (const pattern of patterns) {
    const match = extract.match(pattern);
    if (match) {
      if (pattern.toString().includes('ft') || pattern.toString().includes("'")) {
        // Convert feet to cm
        const ft = parseInt(match[1]);
        const inch = parseInt(match[2] || 0);
        const cm = Math.round(ft * 30.48 + inch * 2.54);
        return `${cm} cm`;
      }
      if (pattern.toString().includes('\.')) return `${parseFloat(match[1]) * 100} cm`;
      return `${match[1]} cm`;
    }
  }
  return null;
}

// ── Get player Wikipedia info ─────────────────────────────
export async function getPlayerWikiInfo(playerName) {
  const summary = await getWikiSummary(`${playerName} footballer`);
  if (!summary) return null;

  const stats  = extractStatsFromSummary(summary.extract);
  const height = extractHeightFromSummary(summary.extract);
  return {
    ...summary,
    stats,
    height,
  };
}
