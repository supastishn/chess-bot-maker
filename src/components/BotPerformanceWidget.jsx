import React from 'react';
import './BotPerformanceWidget.css';

const BotPerformanceWidget = ({ results, isTesting }) => {
  if (isTesting) {
    return (
      <div className="performance-widget">
        <div className="loading-indicator">⚡ Testing against other bots...</div>
      </div>
    );
  }
  
  if (!results) return null;
  
  return (
    <div className="performance-widget glass-card">
      <h3>Performance Report</h3>
      <div className="rating-badge">
        <span className="rating-value">{results.rating}</span>
        <span className="rating-label">ELO</span>
      </div>
      
      <div className="results-grid">
        <div className="result-card">
          <div className="result-label">Wins</div>
          <div className="result-value">{results.wins}</div>
        </div>
        <div className="result-card">
          <div className="result-label">Losses</div>
          <div className="result-value">{results.losses}</div>
        </div>
        <div className="result-card">
          <div className="result-label">Draws</div>
          <div className="result-value">{results.draws}</div>
        </div>
      </div>
      
      <div className="matchups">
        <h4>Match Details:</h4>
        <ul>
          {results.matchResults.map((match, i) => (
            <li key={i}>
              vs {match.opponent}: 
              <span className={`outcome ${match.result.toLowerCase()}`}>
                {match.result} in {match.moves}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BotPerformanceWidget;
