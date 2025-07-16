import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { getBotNames, registerBot } from './bot/botInterface';
import Navbar from './components/Navbar';
import GamePage from './pages/Game';
import CreateBotPage from './pages/CreateBot';
import DocLayout from './pages/Docs';
import Introduction from './pages/docs/Introduction';
import APIReference from './pages/docs/APIReference';
import Examples from './pages/docs/Examples';
import BlocklyGuide from './pages/docs/BlocklyGuide';
import VisualBotBuilder from './pages/VisualBotBuilder';

function App() {
  const [selectedBot, setSelectedBot] = useState('material-bot');
  const [botNames, setBotNames] = useState(getBotNames());

  const handleRegisterBot = (name, code) => {
    if (!name || !code) return alert('Please provide bot name and code');
    try {
      registerBot(name, new Function('gameClient', `return ${code};`)());
      setBotNames(getBotNames());
      setSelectedBot(name);
      return true;
    } catch (e) {
      alert(`Bot Error: ${e.message}`);
      return false;
    }
  };

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
            element={<CreateBotPage onRegisterBot={handleRegisterBot} />} 
          />
          <Route
            path="/visual-bot-builder"
            element={<VisualBotBuilder onRegisterBot={handleRegisterBot} />}
          />
          <Route path="/docs" element={<DocLayout />}>
            <Route index element={<Introduction />} />
            <Route path="introduction" element={<Introduction />} />
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
