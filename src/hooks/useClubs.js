import { useState, useEffect } from 'react';
import { getClubs } from '../firebase/clubService';

export function useClubs(filters = {}) {
  const [clubs,   setClubs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getClubs(filters)
      .then(data => { if (!cancelled) { setClubs(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.league]);

  return { clubs, loading, error };
}
