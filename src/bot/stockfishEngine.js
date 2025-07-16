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
}
