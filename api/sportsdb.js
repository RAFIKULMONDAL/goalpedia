export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'path is required' });

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3${path}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    if (!response.ok) return res.status(response.status).json({ error: `SportsDB error: ${response.status}`});
    const data = await response.json();
    const isPlayer = path.includes('searchplayers') || path.includes('lookupplayer');
    res.setHeader('Cache-Control', `s-maxage=${isPlayer ? 86400 : 3600}, stale-while-revalidate`);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}