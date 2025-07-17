import React, { useState, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import useTournamentRunner from '../hooks/useTournamentRunner';
import StandingsTable from '../components/StandingsTable';
import MatchVisualizer from '../components/MatchVisualizer';
import './Tournament.css';

const TournamentPage = ({ botNames }) => {
  const [selectedBots, setSelectedBots] = useState(new Set());
  const { standings, status, currentGameState, startTournament, stopTournament } = useTournamentRunner();
  
  const handleBotSelection = (botName) => {
    setSelectedBots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(botName)) {
        newSet.delete(botName);
      } else {
        newSet.add(botName);
      }
      return newSet;
    });
  };

  const isRunning = useMemo(() => status === 'running', [status]);

  return (
    <div className="page-container">
      <div className="tournament-container fade-in">
        <h1 className="page-title"><Trophy size={28} /> Bot Tournament</h1>

        {status === 'idle' ? (
          <div className="tournament-setup">
            <h3>Select Bots for Tournament</h3>
            <div className="bot-selection-list">
              {botNames.map(name => (
                <label key={name} className="bot-selection-item">
                  <input
                    type="checkbox"
                    checked={selectedBots.has(name)}
                    onChange={() => handleBotSelection(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
            <div className="tournament-controls">
              <button 
                className="btn primary-button" 
                onClick={() => startTournament(Array.from(selectedBots))}
                disabled={selectedBots.size < 2}
              >
                Start Tournament
              </button>
            </div>
          </div>
        ) : (
          <div className="tournament-running">
            <div className="standings-container">
              <StandingsTable standings={standings} />
              <div className="tournament-controls">
                {isRunning ? (
                  <button className="btn reset-button" onClick={stopTournament}>Stop Tournament</button>
                ) : (
                   <p>Tournament Complete!</p>
                )}
              </div>
            </div>
            <div className="visualizer-container">
              <MatchVisualizer gameState={currentGameState} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPage;
