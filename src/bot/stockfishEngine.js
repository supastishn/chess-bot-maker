const STOCKFISH_PATHS = {
  js: '/stockfish.js',
  wasm: '/stockfish.wasm'
};

export default class StockfishEngine {
  constructor(depth = 15) {
    this.depth = depth;
    this.engine = null;
    this.evalInProgress = false;
    this.resolveEval = null;
  }

  async init() {
    if (this.engine) return true;
    
    if (typeof Worker !== 'undefined') {
      this.engine = new Worker(STOCKFISH_PATHS.js);
      
      return new Promise(resolve => {
        const startupListener = event => {
          if (event.data === 'uciok') {
            this.engine.removeEventListener('message', startupListener);
            resolve(true);
          } else if (event.data.startsWith('Error')) {
            resolve(false);
          }
        };
        
        this.engine.addEventListener('message', startupListener);
        this.engine.postMessage('uci');
      });
    }
    return false;
  }

  evaluatePosition(fen) {
    return new Promise((resolve, reject) => {
      if (!this.engine) reject("Engine not initialized");
      if (this.evalInProgress) reject("Evaluation already in progress");
      
      this.evalInProgress = true;
      this.resolveEval = resolve;
      
      const messageHandler = event => {
        const line = event.data;
        console.log(`[Stockfish] ${line}`);
        
        if (line.startsWith('bestmove')) {
          this.cleanupEventListeners(messageHandler);
          const move = line.split(' ')[1];
          resolve({ from: move.slice(0, 2), to: move.slice(2, 4) });
        } else if (line.includes('error')) {
          this.cleanupEventListeners(messageHandler);
          reject(line);
        }
      };
      
      this.engine.addEventListener('message', messageHandler);
      
      console.log(`[Stockfish] Setting position: ${fen}`);
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${this.depth}`);
    });
  }

  cleanupEventListeners(handler) {
    this.evalInProgress = false;
    if (handler) this.engine.removeEventListener('message', handler);
  }
}
