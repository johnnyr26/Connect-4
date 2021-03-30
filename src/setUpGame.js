export const adjustBoard = board => {
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

export const createColumnBoard = board => {
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

export const createBoard = boardSize => {
    const board = [];
    for (let row = 0; row < boardSize; row ++) {
        const rowArray = [];
        for (let col = 0; col < boardSize; col ++) {
        rowArray.push({
            id: row * boardSize + col,
            isFilled: false,
            value: null,
            isHighlighted: false,
            isConnected: false
        });
        }
        board.push([...rowArray]);
    }
    return board;
}