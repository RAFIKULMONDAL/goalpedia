import React, { useState } from 'react';
import StatsHub from '../components/stats/StatsHub';
import PlayerProfile from '../components/players/PlayerProfile';

export default function StatsPage() {
  const [selected, setSelected] = useState(null);
  if (selected) return <PlayerProfile player={selected} onBack={() => setSelected(null)} />;
  return <StatsHub onPlayerClick={setSelected} />;
}
