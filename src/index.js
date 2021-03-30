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
      findConnectedPieces(board, playerTurn);
      setBoard(board);
      setColumnBoard(createColumnBoard(board));
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

const findConnectedPieces = (board, playerTurn) => {
  const playerValue = playerTurn % NUM_PLAYERS;
  const playerCells = board.map(row => row.filter(cell => cell.value !== null && cell.value % NUM_PLAYERS === playerValue));
  const flattenedPlayerCells = playerCells.flat(Infinity);
  const checkRow = () => {
    let hasConnect = false;
    flattenedPlayerCells.forEach(cell => {
      if (hasConnect) {
        return;
      }
      let id = cell.id + 1;
      let consecutiveCells = 1;
      cell.isConnected = true;
      let nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
      while (nextCell) {
        consecutiveCells ++;
        id ++;
        nextCell.isConnected = true;
        nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
        if (consecutiveCells === CONNECT_COUNT) {
          hasConnect = true;
          return;
        }
      }
      flattenedPlayerCells.forEach(flattenedCell => flattenedCell.isConnected = false);
    });
    return hasConnect;
  }
  const checkColumn = () => {
    // TODO: 9, 10, 11, 12 are not all in same column
    let hasConnect = false;
    flattenedPlayerCells.forEach(cell => {
      if (hasConnect) {
        return;
      }
      let id = cell.id + BOARD_SIZE;
      let consecutiveCells = 1;
      cell.isConnected = true;
      let nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
      while (nextCell) {
        consecutiveCells ++;
        id += BOARD_SIZE;
        nextCell.isConnected = true;
        nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
        if (consecutiveCells === CONNECT_COUNT) {
          hasConnect = true;
          return;
        }
      }
      flattenedPlayerCells.forEach(flattenedCell => flattenedCell.isConnected = false);
    });
    return hasConnect;
  }
  const checkBackwardDiagonal = () => {
    let hasConnect = false;
    flattenedPlayerCells.forEach(cell => {
      if (hasConnect) {
        return;
      }
      let id = cell.id + BOARD_SIZE - 1;
      let consecutiveCells = 1;
      cell.isConnected = true;
      let nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
      while (nextCell) {
        consecutiveCells ++;
        id += BOARD_SIZE - 1;
        nextCell.isConnected = true;
        nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
        if (consecutiveCells === CONNECT_COUNT) {
          hasConnect = true;
          return;
        }
      }
      flattenedPlayerCells.forEach(flattenedCell => flattenedCell.isConnected = false);
    });
    return hasConnect;
  }
  const checkForwardDiagonal = () => {
    let hasConnect = false;
    flattenedPlayerCells.forEach(cell => {
      if (hasConnect) {
        return;
      }
      let id = cell.id + BOARD_SIZE + 1;
      let consecutiveCells = 1;
      cell.isConnected = true;
      let nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
      while (nextCell) {
        consecutiveCells ++;
        id += BOARD_SIZE + 1;
        nextCell.isConnected = true;
        nextCell = flattenedPlayerCells.find(flattenedCell => flattenedCell.id === id);
        if (consecutiveCells === CONNECT_COUNT) {
          hasConnect = true;
          return;
        }
      }
      flattenedPlayerCells.forEach(flattenedCell => flattenedCell.isConnected = false);
    });
    return hasConnect;
  }

  console.log(flattenedPlayerCells);

  const rowWinner = checkRow();

  if (!rowWinner) {
    const colWinner = checkColumn();
    if (!colWinner) {
      const forwardDiagonalWinner = checkForwardDiagonal();
      if (!forwardDiagonalWinner) {
        checkBackwardDiagonal();
      }
    }
  }
  // let connectedPieces = 0;
  // board.forEach(row => {
  //   connectedPieces = 0;
  //   row.forEach(cell => {
  //     const playerValue = playerTurn % NUM_PLAYERS;
  //     if (cell.isFilled && cell.value % NUM_PLAYERS === playerValue) {
  //       cell.isConnected = true;
  //       if (++connectedPieces >= 4) {
  //         return;
  //       }
  //     } else {
  //       row.forEach(rowCell => rowCell.isConnected = false);
  //     }
  //   });
  //   if (connectedPieces >= 4) {
  //     return;
  //   }
  // });
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
        while (consecutiveCells !== 0 && consecutiveCells !== CONNECT_COUNT) {
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
        if (consecutiveCells >= CONNECT_COUNT) {
            hasConnectFour = true;
            return;
        }
        consecutiveCells = 1;
        tempRow = rowIndex;
        tempCol = colIndex;
        while (consecutiveCells !== 0 && consecutiveCells !== CONNECT_COUNT) {
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
        if (consecutiveCells >= CONNECT_COUNT) {
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
        if (consecutiveCells >= CONNECT_COUNT) {
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