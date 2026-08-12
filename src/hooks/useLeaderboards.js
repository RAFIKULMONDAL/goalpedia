import { useState, useEffect } from 'react';
import { getLeaderboards } from '../firebase/playerService';

export function useLeaderboards() {
  const [leaderboards, setLeaderboards] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    getLeaderboards()
      .then(data => { setLeaderboards(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  return { leaderboards, loading, error };
}
