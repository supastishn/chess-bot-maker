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
      // Create worker with options to bypass CORS issues in Chrome
      try {
        const workerURL = new URL(STOCKFISH_PATHS.js, window.location.origin);
        this.engine = new Worker(workerURL, { type: 'module' });
      } catch (e) {
        console.error('[Stockfish] Failed to create worker with options:', e);
        this.engine = new Worker(STOCKFISH_PATHS.js);
      }
      
      return new Promise(resolve => {
        const startupListener = event => {
          if (event.data === 'uciok') {
            this.engine.removeEventListener('error', errorHandler);
            this.engine.removeEventListener('message', startupListener);
            resolve(true);
          } else if (event.data?.startsWith?.('Error') || event.data?.includes?.('Initialization failed')) {
            resolve(false);
          }
        };
        
        const errorHandler = (event) => {
          console.error('[Stockfish] Worker error:', event);
          resolve(false);
        };
        
        this.engine.addEventListener('message', startupListener);
        this.engine.addEventListener('error', errorHandler);
        this.engine.postMessage('uci');
      });
    }
    return false;
  }

  evaluatePosition(fen) {
    return new Promise((resolve, reject) => {
      if (!this.engine) return reject("Engine not initialized - call init() first");
      if (this.evalInProgress) return reject("Evaluation already in progress - only one evaluation at a time");
      
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
          reject(`Stockfish error: ${line}`);
        }
      };
      
      const errorHandler = (event) => {
        console.error('[Stockfish] Evaluation error:', event);
        this.cleanupEventListeners(messageHandler);
        reject(`Worker error during evaluation: ${event.message}`);
      };
      
      this.engine.addEventListener('message', messageHandler);
      this.engine.addEventListener('error', errorHandler);
      
      console.log(`[Stockfish] Setting position: ${fen}`);
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go depth ${this.depth}`);
    });
  }

  cleanupEventListeners(handler) {
    this.evalInProgress = false;
    if (handler) {
      this.engine.removeEventListener('message', handler);
    }
    this.engine.removeEventListener('error', this.errorHandler);
  }
}
