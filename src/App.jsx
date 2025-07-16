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
import BotLibrary from './pages/docs/BotLibrary';

function App() {
  const [selectedBot, setSelectedBot] = useState('material-bot');
  const [botNames, setBotNames] = useState(getBotNames());

  const handleRegisterBot = (name, code) => {
    if (!name || !code) {
      alert('Please provide a name and code for the bot.');
      return false;
    }
    try {
      // Using new Function() can be a security risk in production environments
      const botFunc = new Function('gameClient', `return (${code});`)();
      registerBot(name, botFunc);
      setBotNames(getBotNames()); // Refresh bot names
      setSelectedBot(name); // Select the newly registered bot
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
            <Route path="bot-library" element={<BotLibrary />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
