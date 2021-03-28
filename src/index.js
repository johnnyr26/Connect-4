import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

let BOARD_SIZE = 10;
let NUM_PLAYERS = 2;

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
    setBoard(() => {
      const newBoard = createBoard(BOARD_SIZE);
      // column board has to be adjusted after new board is created since it won't update outside
      setColumnBoard(createColumnBoard(newBoard));
      return newBoard;
    });
    setPlayerTurn(0);
    setMessage(`Player one's turn`);
  }

  useEffect(() => {
    NUM_PLAYERS = parseInt(prompt('How many players are going to play Connect 4? (min: 2, max: 5)'));
    while (isNaN(NUM_PLAYERS) || NUM_PLAYERS > 5 || NUM_PLAYERS < 2) {
      NUM_PLAYERS = parseInt(prompt('How many players are going to play Connect 4? (min: 2, max: 5)'));
    }
    BOARD_SIZE = parseInt(prompt('Type the size of the board (min: 4)'));
    while (isNaN(BOARD_SIZE) || BOARD_SIZE < 4) {
      BOARD_SIZE = parseInt(prompt('Type the size of the board (min: 4)'));
    }
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
    }
    const boardIsFilled = board.every(row => row.every(rowCell => rowCell.isFilled));
    if (boardIsFilled) {
      setMessage(`Game Over! Tied!`);
    }
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
                return <div 
                    key={cell.id}
                    className={`cell${cell.isFilled ? ' selected ' + NUMBERS[cell.value % NUM_PLAYERS] : ''}`} 
                    onClick={() => {cellClicked(cell)}} 
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

const checkDiagonals = (board, player) => {
  let consecutiveCells = 0;
  let rowIndex = 0;
  let colIndex = 0;
  let hasConnectFour = false;

  board.forEach(row => {
    consecutiveCells = 0;
    row.forEach(cell => {
      if (cell.isFilled && cell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
        consecutiveCells = 1;
        let tempRow = rowIndex;
        let tempCol = colIndex;
        while (consecutiveCells !== 0 && consecutiveCells !== 4) {
          tempRow ++;
          tempCol ++;
          if (tempRow < board.length && tempCol < board[tempRow].length) {
            const tempCell = board[tempRow][tempCol];
            if (tempCell.isFilled && tempCell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
              consecutiveCells ++;
            } else {
              consecutiveCells = 0;
            }
          } else {
            break;
          }
        }
        if (consecutiveCells >= 4) {
            hasConnectFour = true;
            return;
        }
        consecutiveCells = 1;
        tempRow = rowIndex;
        tempCol = colIndex;
        while (consecutiveCells !== 0 && consecutiveCells !== 4) {
          tempRow ++;
          tempCol --;
          if (tempRow >= 0 && tempCol >= 0 && tempRow < board.length && tempCol < board[tempRow].length) {
            const tempCell = board[tempRow][tempCol];
            if (tempCell.isFilled && tempCell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
              consecutiveCells ++;
            } else {
              consecutiveCells = 0;
            }
          } else {
            break;
          }
        }
        if (consecutiveCells >= 4) {
            hasConnectFour = true;
            return;
        }
      }
      colIndex ++;
    });
    rowIndex ++;
    colIndex = 0;
  });
  return hasConnectFour;
}

const checkDirection = (board, player) => {
  let playerWon = false;
  board.forEach(row => {
    let consecutiveCells = 0;
    row.forEach(cell => {
      if (cell.isFilled && cell.value % NUM_PLAYERS === player % NUM_PLAYERS) {
        consecutiveCells ++;
        if (consecutiveCells >= 4) {
          playerWon = true;
          return;
        }
      } else {
        consecutiveCells = 0;
      }
    });
    if (playerWon) {
      return;
    }
  });
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
      break;
    }
  }
  return board;
}

const adjustBoard = board => {
  const newBoard = [];
  for (let col = 0; col < board.length; col ++) {
    const column = [];
    for (let row = 0; row < board[col].length; row ++) {
      column.push(board[row][col]);
    }
    newBoard.push([...column]);
  }
  return newBoard;
}

const createColumnBoard = board => {
  const columnBoard = [];
  for (let col = 0; col < board.length; col ++) {
    const column = [];
    for (let row = 0; row < board[col].length; row ++) {
      column.push(board[row][col]);
    }
    columnBoard.push([...column]);
  }
  return columnBoard;
}

const createBoard = boardSize => {
  const board = [];
  for (let row = 0; row < boardSize; row ++) {
    const rowArray = [];
    for (let col = 0; col < boardSize; col ++) {
      rowArray.push({
        id: row * boardSize + col,
        isFilled: false,
        value: null
      });
    }
    board.push([...rowArray]);
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