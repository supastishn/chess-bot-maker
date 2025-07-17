import React from 'react';

const StandingsTable = ({ standings }) => {
  const sortedStandings = [...standings].sort((a, b) => b.p - a.p);

  return (
    <div className="standings-table">
      <h3>Standings</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Bot</th>
            <th>W</th>
            <th>L</th>
            <th>D</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedStandings.map((bot, index) => (
            <tr key={bot.name}>
              <td>{index + 1}</td>
              <td>{bot.name}</td>
              <td>{bot.w}</td>
              <td>{bot.l}</td>
              <td>{bot.d}</td>
              <td>{bot.p}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
