const STOCKFISH_PATHS = {
  js: '/stockfish.js',
  wasm: '/stockfish.wasm'
};

export default class StockfishEngine {
  constructor(depth = 15) {
    this.depth = depth;
    this.engine = null;
    this.evalInProgress = false;
    this.ready = false;
    this.infoHandlers = new Set();
    this.infoListener = null;
  }

  async init() {
    if (this.engine) return true;
    
    if (typeof Worker !== 'undefined') {
      try {
        const workerURL = new URL(STOCKFISH_PATHS.js, window.location.origin);
        this.engine = new Worker(workerURL, { type: 'module' });
      } catch (e) {
        console.error('[Stockfish] Failed to create worker with options:', e);
        this.engine = new Worker(STOCKFISH_PATHS.js);
      }
      
      return new Promise(resolve => {
        const startupListener = event => {
          const line = event.data;
          console.log(`[Stockfish] ${line}`);
          if (line === 'uciok') {
            this.ready = true;
            this.engine.removeEventListener('error', errorHandler);
            this.engine.removeEventListener('message', startupListener);
            resolve(true);
          } else if (line.startsWith('Error') || line.includes('Initialization failed')) {
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

  sendCommand(cmd) {
    if (!this.ready) return false;
    console.log(`[Stockfish] > ${cmd}`);
    this.engine.postMessage(cmd);
    return true;
  }

  setOption(name, value) {
    const cmd = value === undefined ? 
      `setoption name ${name}` : 
      `setoption name ${name} value ${value}`;
    return this.sendCommand(cmd);
  }

  setPosition(fen, moves = []) {
    const movesStr = moves.length ? ` moves ${moves.join(' ')}` : '';
    return this.sendCommand(`position fen ${fen}${movesStr}`);
  }

  uciNewGame() {
    return this.sendCommand('ucinewgame');
  }

  startSearch(options = {}) {
    const cmd = [
      options.depth ? `depth ${options.depth}` : '',
      options.nodes ? `nodes ${options.nodes}` : '',
      options.movetime ? `movetime ${options.movetime}` : '',
      options.infinite ? 'infinite' : '',
      options.searchmoves ? `searchmoves ${options.searchmoves.join(' ')}` : ''
    ].filter(Boolean).join(' ');
    return this.sendCommand(`go ${cmd}`);
  }

  stopSearch() {
    return this.sendCommand('stop');
  }

  quit() {
    this.sendCommand('quit');
    if (this.engine) {
      this.engine.terminate();
      this.engine = null;
    }
    this.ready = false;
  }

  evaluatePosition(fen, depth = this.depth) {
    return new Promise((resolve, reject) => {
      if (!this.engine) return reject("Engine not initialized");
      if (this.evalInProgress) return reject("Evaluation already in progress");
      this.evalInProgress = true;
      const messageHandler = event => {
        const line = event.data;
        console.log(`[Stockfish] ${line}`);
        if (line.startsWith('bestmove')) {
          this.cleanupEventListeners(messageHandler, errorHandler);
          const move = line.split(' ')[1];
          resolve({ from: move.slice(0, 2), to: move.slice(2, 4) });
        } else if (line.includes('error')) {
          this.cleanupEventListeners(messageHandler, errorHandler);
          reject(`Stockfish error: ${line}`);
        }
      };
      const errorHandler = (event) => {
        console.error('[Stockfish] Evaluation error:', event);
        this.cleanupEventListeners(messageHandler, errorHandler);
        reject(`Worker error during evaluation: ${event.message}`);
      };
      this.engine.addEventListener('message', messageHandler);
      this.engine.addEventListener('error', errorHandler);
      this.setPosition(fen);
      this.startSearch({ depth });
    });
  }

  // --- Advanced API methods ---

  async getEvaluation(fen, options = {}) {
    // This is a stub implementation. Actual parsing of Stockfish output needed.
    return new Promise((resolve, reject) => {
      if (!this.engine) return reject("Engine not initialized");
      this.setPosition(fen);
      this.sendCommand('eval');
      // Listen for eval output and parse it
      // TODO: Implement parsing of Stockfish 'eval' output
      // For now, resolve with a placeholder
      setTimeout(() => resolve({ eval: 'Not implemented' }), 500);
    });
  }

  async analyzeGame(pgn) {
    // Requires chess.js for PGN parsing
    try {
      const { Chess } = await import('chess.js');
      const game = new Chess();
      game.loadPgn(pgn);

      const analysis = [];
      let fen = game.fen();

      while (true) {
        const evalResult = await this.getEvaluation(fen);
        analysis.push({ fen, evaluation: evalResult });

        if (game.history().length === 0) break;
        game.undo();
        fen = game.fen();
      }

      return analysis;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async runBenchmark(depth = 16) {
    // This is a stub implementation. Actual parsing of Stockfish output needed.
    return new Promise((resolve) => {
      this.sendCommand(`bench ${depth}`);
      // TODO: Capture bench results from stdout
      setTimeout(() => resolve({ bench: 'Not implemented' }), 500);
    });
  }

  addInfoHandler(handler) {
    this.infoHandlers.add(handler);
    if (!this.infoListener) {
      this.infoListener = event => {
        const line = event.data;
        if (line.startsWith('info')) {
          const info = this.parseInfo(line);
          this.infoHandlers.forEach(h => h(info));
        }
      };
      this.engine.addEventListener('message', this.infoListener);
    }
  }

  removeInfoHandler(handler) {
    this.infoHandlers.delete(handler);
    if (this.infoHandlers.size === 0 && this.infoListener) {
      this.engine.removeEventListener('message', this.infoListener);
      this.infoListener = null;
    }
  }

  parseInfo(line) {
    const info = {};
    const tokens = line.split(' ');
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === 'score') {
        info.score = {
          type: tokens[++i],
          value: parseInt(tokens[++i])
        };
      } else if (token === 'pv') {
        info.pv = tokens.slice(i + 1);
        break;
      } else if (!isNaN(tokens[i+1])) {
        info[token] = parseFloat(tokens[++i]);
      } else if (token !== 'info') {
        info[token] = tokens[++i];
      }
    }
    return info;
  }

  cleanupEventListeners(...handlers) {
    this.evalInProgress = false;
    handlers.forEach(handler => {
      if (handler) {
        this.engine.removeEventListener('message', handler);
      }
    });
    // Remove error handler if present
    if (typeof errorHandler !== 'undefined') {
      this.engine.removeEventListener('error', errorHandler);
    }
  }
}
