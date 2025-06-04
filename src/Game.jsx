import React from 'react';
import { useState, useRef, useEffect } from 'react';

const cellSize = 20; 
const width = 800;
const height = 600;

function Game() {
  const rows=height / cellSize;
  const cols=width / cellSize;  

  function makeEmptyBoard() {
    let board = [];
    for (let y = 0; y < rows; y++) {
      board[y] = [];
      for (let x = 0; x < cols; x++) {
        board[y][x] = false;
      }
    }
    return board;
  }

  const boardRef = useRef(makeEmptyBoard());
  const [cells, setCells] = useState([]);
  const boardElemRef = useRef(null);
  const [interval, setIntervalValue] = useState(100);
  const [isRunning, setIsRunning] = useState(false);

  const timeoutRef = useRef(null);


  function makeCells() {
    let cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (boardRef.current[y][x]) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }
  function getElementOffset() {
    const rect = boardElemRef.current.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      x: (rect.left + window.pageXOffset) - doc.clientLeft,
      y: (rect.top + window.pageYOffset) - doc.clientTop,
    };
  }
  function handleClick(event) {
    if (isRunning) return;
    const elemOffset = getElementOffset();
    const offsetX = event.clientX - elemOffset.x;
    const offsetY = event.clientY - elemOffset.y;

    const x = Math.floor(offsetX / cellSize);
    const y = Math.floor(offsetY / cellSize);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      boardRef.current[y][x] = !boardRef.current[y][x];
      setCells(makeCells());
    }
  }

  function countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && boardRef.current[ny][nx]) {
          count++;
        }
      }
    }
    return count;
  }
  function runIteration() {
    if (!isRunning) return;

    const newBoard = makeEmptyBoard();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const neighbors = countNeighbors(x, y);
        if (boardRef.current[y][x]) {
          newBoard[y][x] = neighbors === 2 || neighbors === 3;
        } else {
          newBoard[y][x] = neighbors === 3;
        }
      }
    }
    boardRef.current = newBoard;
    setCells(makeCells());

   if (isRunning)
      timeoutRef.current = setTimeout(() => runIteration(), interval);
  }
  function runGame() {
  setIsRunning(true);
}
  function stopGame() {
    setIsRunning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }
  function handleStartStop() {
    if (isRunning) {
      stopGame();
    } else {
      runGame();
    }
  }
  function handleClear() {
    stopGame();
    boardRef.current = makeEmptyBoard();
    setCells([]);
  }
  function handleRandomize() {
    stopGame();
    const newBoard = makeEmptyBoard();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        newBoard[y][x] = Math.random() < 0.2;
      }
    }
    boardRef.current = newBoard;
    setCells(makeCells());
  }
  function handleSpeedChange(e) {
  const newInterval = Number(e.target.value);
  setIntervalValue(newInterval);
  if (isRunning) {
    stopGame();
    setTimeout(() => runGame(), 0)
  }
}
useEffect(() => {
    if (isRunning) {
      runIteration();
    }
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

 const gridStyle = {
    backgroundImage: `
      linear-gradient(#333 1px, transparent 1px),
      linear-gradient(90deg, #333 1px, transparent 1px)
    `,
    backgroundSize: `${cellSize}px ${cellSize}px`,
    position: 'relative',
    margin: '0 auto',
  };

  return (
    <div>
      <div className="text-center text-3xl font-bold my-4 text-black">
      Conway's Game of Life
    </div>
    <div className=" relative mx-auto bg-black w-[800px] h-[600px] " style={gridStyle} ref={boardElemRef} onClick={handleClick}>
      {cells.map(cell => (
        <div 
          key={`${cell.x}-${cell.y}`}
          className="absolute bg-white"
          style={{
            left: `${cell.x * cellSize}px`,
            top: `${cell.y * cellSize}px`,
            width: `${cellSize - 1}px`,
            height: `${cellSize - 1}px`,
          }}
        />
      ))}
    </div>
    <div className="flex justify-center mt-4">
      <button onClick={handleStartStop} className={`text-white px-4 py-2 rounded ${isRunning ? 'bg-red-600' : 'bg-green-600'}`}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      
      <button onClick={handleClear} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">Clear</button>
      <button onClick={handleRandomize} className="bg-yellow-500 text-white px-4 py-2 rounded ml-2">Randomize</button>
      <label className="flex items-center gap-2 text-sm ml-4">
      Update every
      <input
        type="number"
        value={interval}
        onChange={handleSpeedChange}
        className="w-20 px-2 py-1 border rounded-md text-sm"
      />
      msec
    </label>
 </div>
    </div>
  );
}
  export default Game; 

