import React, { useRef, useEffect } from 'react';
import { Chessground } from 'chessground';

const ChessBoard = ({ position, orientation, onMove }) => {
  const boardRef = useRef();

  useEffect(() => {
    const cg = Chessground(boardRef.current, {
      fen: position,
      orientation,
      movable: {
        color: orientation,
        dests: {}, // You can pass a function to generate destinations if needed
        events: { after: onMove }
      }
    });
    return () => cg.destroy();
  }, [position, orientation, onMove]);

  return <div ref={boardRef} className="cg-wrap" />;
};

export default ChessBoard;
