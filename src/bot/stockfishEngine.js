const COMMON_OPTIONS = {
  'Skill Level': 20,
  'Hash': 256,
  'Contempt': 0
};

export default class StockfishEngine {
  constructor(depth = 15) {
    this.depth = depth;
    this.engine = new Worker('/stockfish.js');
    this.evalInProgress = false;
    this.ready = false;
    this.infoHandlers = new Set();
    this.infoListener = null;
    Object.entries(COMMON_OPTIONS).forEach(([key, val]) =>
      this.sendCommand(`setoption name ${key} value ${val}`)
    );
  }

  sendCommand(cmd) {
    if (!this.ready) return false;
    this.engine.postMessage(cmd);
    return true;
  }

  // Analyze the current position only
  getPositionEvaluation(fen, depth = 15) {
    if (!this.ready) return Promise.reject("Engine not initialized");
    
    return new Promise((resolve) => {
      let analysis = {};
      this.evalInProgress = true;
      
      // Prepare to receive engine info
      const tempId = Date.now().toString();
      const callback = (line) => {
        if (line.startsWith(`info depth ${depth} `)) {
          const scoreMatch = line.match(/score (cp|mate) ([-+]?\d+)/);
          if (scoreMatch) {
            analysis.scoreType = scoreMatch[1];
            analysis.scoreValue = parseInt(scoreMatch[2]);
          }
          
          const pvMatch = line.match(/pv (\S+)/);
          if (pvMatch) analysis.bestMove = pvMatch[1];
        }
      };
      
      this.infoHandlers.add({
        id: tempId,
        callback
      });
      
      // Send analysis command with fixed depth
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${depth}`);
      
      // Complete after evaluation
      setTimeout(() => {
        this.infoHandlers.delete(tempId);
        this.evalInProgress = false;
        resolve(analysis);
      }, depth * 100); // Timeout based on depth
    });
  }
}
