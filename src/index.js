import React, { useState, useEffect } from 'react';
import { adjustBoard, createColumnBoard, createBoard } from './setUpGame';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

let BOARD_SIZE = 10;
let NUM_PLAYERS = 2;
let CONNECT_COUNT = 4;

const NUMBERS = [
  'one',
  'two',
  'three',
  'four',
  'five'
];

const Board = () => {

  const [board, setBoard] = useState(createBoard(BOARD_SIZE));
  // 2d array to where each row is each column on display (obviously could be better but I'm too lazy)
  const [columnBoard, setColumnBoard] = useState(createColumnBoard(board));
  const [playerTurn, setPlayerTurn] = useState(0);
  const [message, setMessage] = useState(`Player ${NUMBERS[playerTurn]}'s Turn`);
  
  const createNewGame = () => {
    getNumberOfPlayersAndBoardSize();
    setBoard(() => {
      const newBoard = createBoard(BOARD_SIZE);
      // column board has to be adjusted after new board is created since it won't update outside
      setColumnBoard(createColumnBoard(newBoard));
      return newBoard;
    });
    setPlayerTurn(0);
    setMessage(`Player one's turn`);
  }

  const getNumberOfPlayersAndBoardSize = () => {
    NUM_PLAYERS = parseInt(prompt('How many players are going to play Connect 4? (min: 2, max: 5)'));
    while (isNaN(NUM_PLAYERS) || NUM_PLAYERS > 5 || NUM_PLAYERS < 2) {
      NUM_PLAYERS = parseInt(prompt('How many players are going to play Connect 4? (min: 2, max: 5)'));
    }
    BOARD_SIZE = parseInt(prompt('Type the size of the board (min: 4)'));
    while (isNaN(BOARD_SIZE) || BOARD_SIZE < 4) {
      BOARD_SIZE = parseInt(prompt('Type the size of the board (min: 4)'));
    }
  }

  useEffect(() => {
    createNewGame();
  }, []);

  const cellClicked = cell => {
    const gameOver = message.includes('Game Over!');
    if (gameOver || cell.isFilled) {
      return;
    }
    // setPlayerTurn must be done first in order for the correct className to be shown
    setPlayerTurn(playerTurn + 1);
    setColumnBoard(placeChip(columnBoard, cell.id, playerTurn));
    setBoard(adjustBoard(columnBoard));
    setMessage(`Player ${NUMBERS[(playerTurn + 1) % NUM_PLAYERS]}'s turn`);
    if (checkWinner(board, columnBoard, playerTurn)) {
      setMessage(`Game Over! Player ${NUMBERS[playerTurn % NUM_PLAYERS]} won!`);
      // findConnectedPieces(board, playerTurn);
      setBoard(board);
      setColumnBoard(createColumnBoard(board));
      return;
    }
    const boardIsFilled = board.every(row => row.every(rowCell => rowCell.isFilled));
    if (boardIsFilled) {
      setMessage(`Game Over! Tied!`);
    }
  }

  const cellHovered = cell => {
    columnBoard.forEach(col => {
      col.forEach(colCell => {
        if (cell === colCell) {
          let index = col.length - 1;
          while (index >= 0 && col[index].isFilled) {
            index --;
          }
          if (index >= 0) {
            col[index].isHighlighted = !col[index].isHighlighted;
          }
        }
      });
    });
    setBoard(board);
    setColumnBoard(createColumnBoard(board));
  }

  return (
    <div>
      <h1>{message}</h1>
      <button onClick={() => {createNewGame()}}>New Game</button>
      <div className="board">
        {
          board.map((row, rowIndex) => {
            return <div key={rowIndex} className="row">{
              row.map(cell => {
                let classString = 'cell';
                if (cell.isFilled) {
                  classString += ` selected ${NUMBERS[cell.value % NUM_PLAYERS]}`;
                }
                if (cell.isHighlighted) {
                  classString += ` highlighted ${NUMBERS[playerTurn % NUM_PLAYERS]}`;
                }
                if (cell.isConnected) {
                  classString += ' winning-cells';
                }
                return <div 
                    key={cell.id}
                    className={classString} 
                    onClick={() => cellClicked(cell)} 
                    onMouseOver={() => cellHovered(cell)}
                    onMouseLeave={() => cellHovered(cell)}
                ></div>;
              })
            }</div>
          })
        }
      </div>
    </div>
  );
}

const checkWinner = (board, columnBoard, player) => {
  const connectFourInRow = checkDirection(board, player);
  const connectFourInColumn = checkDirection(columnBoard, player);
  const connectFourInDiagonal = checkDiagonals(board, player);
  const gameOver = connectFourInRow || connectFourInColumn || connectFourInDiagonal
  return gameOver;
}

const clearUpConnectedCells = board => {
  board.forEach(row => row.forEach(cell => cell.isConnected = false));
}

const checkDiagonals = (board, player) => {
  let consecutiveCells = 0;
  let rowIndex = 0;
  let colIndex = 0;
  let hasConnectFour = false;

  const gameOver = board.some(row => row.some(cell => cell.isConnected));
  if (gameOver) {
    return true;
  }

  board.forEach(row => {
    consecutiveCells = 0;
    row.forEach(cell => {
      if (hasConnectFour) {
        return;
      }
      if (cell.isFilled && cell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
        cell.isConnected = true;
        consecutiveCells = 1;
        let tempRow = rowIndex;
        let tempCol = colIndex;
        while (consecutiveCells !== 0 && consecutiveCells !== CONNECT_COUNT) {
          tempRow ++;
          tempCol ++;
          if (tempRow >= board.length || tempCol >= board[tempRow].length) {
            break;
          }
          const tempCell = board[tempRow][tempCol];
          if (tempCell.isFilled && tempCell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
            tempCell.isConnected = true;
            consecutiveCells ++;
          } else {
            clearUpConnectedCells(board);
            consecutiveCells = 0;
          }
        }
        if (consecutiveCells >= CONNECT_COUNT) {
            hasConnectFour = true;
            return;
        }
        consecutiveCells = 1;
        tempRow = rowIndex;
        tempCol = colIndex;
        cell.isConnected = true;
        while (consecutiveCells !== 0 && consecutiveCells !== CONNECT_COUNT) {
          tempRow ++;
          tempCol --;
          if (tempRow < 0 || tempCol < 0 || tempRow >= board.length || tempCol >= board[tempRow].length) {
            break;
          }
          const tempCell = board[tempRow][tempCol];
          if (tempCell.isFilled && tempCell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
            tempCell.isConnected = true;
            consecutiveCells ++;
          } else {
            clearUpConnectedCells(board);
            consecutiveCells = 0;
          }
        }
        if (consecutiveCells >= CONNECT_COUNT) {
            hasConnectFour = true;
            return;
        }
      }
      colIndex ++;
    });
    if (hasConnectFour) {
      return;
    }
    rowIndex ++;
    colIndex = 0;
  });
  if (!hasConnectFour) {
    clearUpConnectedCells(board);
  }
  return hasConnectFour;
}

const checkDirection = (board, player) => {
  let playerWon = false;
  const gameOver = board.some(row => row.some(cell => cell.isConnected));
  if (gameOver) {
    return true;
  }
  board.forEach(row => {
    let consecutiveCells = 0;
    if (playerWon) {
      return;
    }
    row.forEach(cell => {
      if (playerWon) {
        return;
      }
      if (cell.isFilled && cell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
        cell.isConnected = true;
        consecutiveCells ++;
        if (consecutiveCells >= CONNECT_COUNT) {
          playerWon = true;
          return;
        }
      } else {
        consecutiveCells = 0;
        clearUpConnectedCells(board);
      }
    });
  });
  if (!playerWon){
    // just to clean up and ensure that the next check doesn't have any unnecessary connected pieces
    clearUpConnectedCells(board);
  }
  return playerWon;
}

const placeChip = (board, id, playerTurn) => {
  let columnIndex = null;
  board.forEach((col, colIndex) => {
    col.forEach(cell => {
      if (cell.id === id) {
        columnIndex = colIndex;
        return;
      }
    });
    if (columnIndex !== null) {
      return;
    }
  });


  for (let rowIndex = board[columnIndex].length - 1; rowIndex >= 0; rowIndex --) {
    if (!board[columnIndex][rowIndex].isFilled) {
      board[columnIndex][rowIndex].isFilled = true;
      board[columnIndex][rowIndex].value = playerTurn;
      board[columnIndex][rowIndex].isHighlighted = false;
      // by placing chip and not removing the mouse, the cell above souled automatically become highlighted
      if (board[columnIndex][rowIndex - 1]) {
        board[columnIndex][rowIndex - 1].isHighlighted = true;
      }
      break;
    }
  }
  return board;
}


ReactDOM.render(
  <React.StrictMode>
    <Board />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();