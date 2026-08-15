// /api/standings?code=PL
// Vercel serverless function — calls Football-Data.org server-side (no CORS)
export default async function handler(req, res) {
  // Allow requests from our Vercel app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { code = 'PL' } = req.query;

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/standings`,
      { headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_DATA_KEY } }
    );
    if (!response.ok) {
      return res.status(response.status).json({ error: `Football-Data error: ${response.status}` });
    }
    const data = await response.json();
    // Cache for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
