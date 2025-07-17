import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import GamePage from './pages/Game';
import CreateBotPage from './pages/CreateBot';
import DocLayout from './pages/Docs';
import Introduction from './pages/docs/Introduction';
import APIReference from './pages/docs/APIReference';
import Examples from './pages/docs/Examples';
import BlocklyGuide from './pages/docs/BlocklyGuide';
import VisualBotBuilder from './pages/VisualBotBuilder';
import TournamentPage from './pages/Tournament';
import { useBotRegistry } from './hooks/useBotRegistry';

function App() {
  const [selectedBot, setSelectedBot] = useState('material-bot');
  const { botNames, registerBot } = useBotRegistry();

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <GamePage 
                selectedBot={selectedBot}
                onBotChange={setSelectedBot}
                botNames={botNames}
              />
            } 
          />
          <Route 
            path="/create-bot" 
            element={<CreateBotPage onRegisterBot={registerBot} />} 
          />
          <Route
            path="/visual-bot-builder"
            element={<VisualBotBuilder onRegisterBot={registerBot} />}
          />
          <Route 
            path="/tournament"
            element={<TournamentPage botNames={botNames} />}
          />
          <Route path="/docs" element={<DocLayout />}>
            <Route index element={<Introduction />} />
            <Route path="api" element={<APIReference />} />
            <Route path="examples" element={<Examples />} />
            <Route path="blockly" element={<BlocklyGuide />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
