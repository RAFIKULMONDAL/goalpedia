import React, { createContext, useContext, useState } from 'react';

const LeagueContext = createContext();

export function LeagueProvider({ children }) {
  const [activeLeague, setActiveLeague] = useState(null);

  const toggleLeague = (leagueFilter) => {
    setActiveLeague(prev => prev === leagueFilter ? null : leagueFilter);
  };

  const clearLeague = () => setActiveLeague(null);

  return (
    <LeagueContext.Provider value={{ activeLeague, toggleLeague, clearLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}

export const useLeague = () => useContext(LeagueContext);
