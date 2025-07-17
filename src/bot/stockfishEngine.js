const COMMON_OPTIONS = {
  'Skill Level': 20,
  'Hash': 256,
  'Contempt': 0
};

export default class StockfishEngine {
  constructor() {
    this.engine = new Worker(`${import.meta.env.BASE_URL}stockfish.js`);
    this.evalInProgress = false;
    this.ready = false;
    this.infoHandlers = new Set();
    this.infoListener = null;

    // Add promise to track initialization
    this.initialized = new Promise(resolve => {
      this.engine.onmessage = (event) => {
        const line = event.data;

        if (line === 'uciok') {
          this.ready = true;
          // Set common options after engine is ready
          Object.entries(COMMON_OPTIONS).forEach(([key, val]) =>
            this.sendCommand(`setoption name ${key} value ${val}`)
          );
          resolve(); // Resolve initialization promise
        }
        
        // Pass the message to any active handlers
        this.infoHandlers.forEach(handler => {
          if (typeof handler.callback === 'function') {
            handler.callback(line);
          }
        });
      };
    });

    this.engine.postMessage('uci'); // Start UCI communication
  }

  sendCommand(cmd) {
    if (!this.ready) return false;
    this.engine.postMessage(cmd);
    return true;
  }

  // Analyze the current position only
  getPositionEvaluation(fen, depth = 15) {
    if (!this.ready) return Promise.reject("Engine not initialized");
    if (this.evalInProgress) return Promise.reject("Evaluation already in progress");

    return new Promise((resolve) => {
      let analysis = {};
      this.evalInProgress = true;
      
      const tempId = `eval-${Date.now()}`;
      const callback = (line) => {
        if (typeof line !== 'string') return;

        if (line.startsWith('info depth')) {
          const scoreMatch = line.match(/score (cp|mate) ([-+]?\d+)/);
          if (scoreMatch) {
            analysis.scoreType = scoreMatch[1];
            analysis.scoreValue = parseInt(scoreMatch[2]);
          }
        }

        if (line.startsWith('bestmove')) {
          const bestMoveMatch = line.match(/bestmove\s(\S+)/);
          if (bestMoveMatch) {
            analysis.bestMove = bestMoveMatch[1];
          }
          // Clean up this handler and resolve
          this.infoHandlers.forEach(h => {
            if (h.id === tempId) this.infoHandlers.delete(h);
          });
          this.evalInProgress = false;
          resolve(analysis);
        }
      };
      
      this.infoHandlers.add({ id: tempId, callback });
      
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);
    });
  }
}
