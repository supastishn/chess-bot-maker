import React from 'react';

const MatchHistory = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="match-history">
      <h3>Match History</h3>
      <ul>
        {[...matches].reverse().map((match, index) => (
          <li key={index}>
            <span>{match.white} (W) vs {match.black} (B)</span>
            <span className="match-result">Winner: <strong>{match.result}</strong> ({match.moves} moves)</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchHistory;
