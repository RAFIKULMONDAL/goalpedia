import { useState, useEffect } from 'react';
import { getPlayers } from '../firebase/playerService';

export function usePlayers(filters = {}) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPlayers(filters)
      .then(data => { if (!cancelled) { setPlayers(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  // Re-fetch when any filter value changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.pos, filters.cid, filters.league]);

  return { players, loading, error };
}
