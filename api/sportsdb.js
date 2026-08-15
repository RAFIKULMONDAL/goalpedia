// /api/sportsdb?path=/searchteams.php?t=Arsenal
// Proxy for TheSportsDB — avoids CORS on deployed site
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'path is required' });
  }

  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3${path}`
    );
    if (!response.ok) {
      return res.status(response.status).json({ error: `SportsDB error: ${response.status}` });
    }
    const data = await response.json();
    // Cache for 1 hour — SportsDB data doesn't change often
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
