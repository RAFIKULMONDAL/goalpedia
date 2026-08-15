// /api/fixtures?code=PL&status=SCHEDULED&limit=10
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { code = 'PL', status = 'SCHEDULED', limit = 10 } = req.query;

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/matches?status=${status}`,
      { headers: { 'X-Auth-Token': process.env.REACT_APP_FOOTBALL_DATA_KEY } }
    );
    if (!response.ok) {
      return res.status(response.status).json({ error: `Football-Data error: ${response.status}` });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
