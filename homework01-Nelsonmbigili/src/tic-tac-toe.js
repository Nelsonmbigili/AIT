// tic-tac-toe.js
function repeat(initVal, length) {
  return Array(length).fill(initVal);
}

function generateBoard(rows, cols, initialValue) {
  const blankValue = initialValue || " ";
  return repeat(blankValue, rows * cols);
}


function boardFromString(s) {
  const sqr = Math.sqrt(s.length);
  const array =[];
  if (sqr*sqr !== s.length){
    return null;
  }

  for(let i=0; i<s.length; i++){
    if(s[i]!== ' ' && s[i]!== 'X' && s[i]!== 'O' ) {return null;}
    if(s[i]=== ' ') {array.push(' ');}
    if(s[i]=== 'O') {array.push('O');}
    if(s[i]=== 'X') {array.push('X');}
  }

  return array;
}


function rowColToIndex(board, row, col){
  const gridSide = Math.sqrt(board.length);
  //The function is Index = (row)*gridSide + (col)
  return (row)*gridSide +(col);
}


function indexToRowCol(board, i){
  const gridSide = Math.sqrt(board.length);
  const resultObject={};
  resultObject.row = Math.floor(i/gridSide);
  resultObject.col = i - resultObject.row*gridSide;
  return resultObject;
}


function setBoardCell(board, letter, row, col){
  const index = rowColToIndex(board, row, col);
  const newBoard = board.slice();
  newBoard[index] = letter;
  return newBoard;
}

function algebraicToRowCol(algebraicNotation){
  if(algebraicNotation.charCodeAt(0) <65 || algebraicNotation.charCodeAt(0) > 90) {return undefined;}
  const row = algebraicNotation.charCodeAt(0) - 65;
  const numericPart = algebraicNotation.slice(1);
  if (numericPart.includes(" ") || isNaN(numericPart) || numericPart === "") {return undefined;}
  if(numericPart>26 || numericPart<1) {return undefined;}
  const col = numericPart-1;
  const resultObject = {};
  resultObject.row = parseInt(row);
  resultObject.col = parseInt(col);
  return resultObject;
}


function RowColToAlgebraic(rowColNotation){
  const { row, col } = rowColNotation;
  if (row < 0 || row > 25 || col < 0 || col > 25) {return undefined;}
  const rowLetter = String.fromCharCode(65 + row);
  const colNumber = col + 1;
  return rowLetter + colNumber;
}

function placeLetter(board, letter, algebraicNotation){
  const cellObject = algebraicToRowCol(algebraicNotation);
  if (cellObject === undefined) {return null;}
  return setBoardCell(board, letter, cellObject.row, cellObject.col);
}


// This function checks if an array contain similar items from a list of arrays (cols/rows/diagonals)
function findWinning(arrayList){
  for(const array of arrayList){
    if(array.every(item => item !== " " && item === array[0])) {return array[0];}
  }
  return undefined;
}


function getWinner(board){
  const gridSide = Math.sqrt(board.length);

  //Creating Rows
  const rowsArray = [];
  for (let i = 0; i < board.length; i += gridSide) {
    rowsArray.push(board.slice(i, i + gridSide));
  }

  let winner = findWinning(rowsArray);
  if (winner) {return winner;}


  const colsArray=[];
  for(let i=0; i<gridSide; i++){
    const column =[];
    for(let j=0; j< gridSide; j++){
      column.push(rowsArray[j][i]);
    }
    colsArray.push(column);
  }


  winner = findWinning(colsArray);
  if (winner) {return winner;}

   // top-left to bottom-right
  const diag1 = [];
  // top-right to bottom-left
  const diag2 = []; 

  for (let i = 0; i < gridSide; i++) {
    diag1.push(board[i * gridSide + i]);               
    diag2.push(board[i * gridSide + (gridSide-1-i)]); 
  }

  const diagonalArrays = [diag1, diag2];
  winner = findWinning(diagonalArrays);
  if (winner) {return winner;}

  return undefined;
}


function isBoardFull(board){
   return(board.every(item => item !== " "))? true: false;
}


function isValidMove(board, algebraicNotation){
  const gridSide = board.length;
  const moveAt = algebraicToRowCol(algebraicNotation);
  if(!moveAt) {return false;}
  if(moveAt.row > gridSide || moveAt.col > gridSide) {return false;}
  const index = rowColToIndex(board, moveAt.row, moveAt.col);
  return (board[index]=== " ")? true: false; 
}

function horizontalBorder(n){
  let separator = "   +";
  for (let i = 0; i < n; i++) {
    if(n>10){
      separator += "----+";
    }else{
      separator += "---+";
    }
    
  }
  console.log(separator);
}

function boardToString(board){
  let boardAsString ="";
  for(let i=0; i<board.length; i++){
    boardAsString+=(board[i]);
  }
  return boardAsString;
}

function printBoard(boardAsString){
  const gridSide = Math.sqrt(boardAsString.length);
  let header = "    ";  
  for (let i = 0; i < gridSide; i++) {
    header += ` ${i + 1}  `;
  }
  console.log(header);

  horizontalBorder(gridSide);
  
  for (let i = 0; i < gridSide; i++) {
    const letter = String.fromCharCode(65 + i);
    let row = ` ${letter} |`;
    for (let j = 0; j < gridSide; j++) {
       const index = rowColToIndex(boardAsString, i, j);
       row += (gridSide > 10)
            ? (boardAsString[index] === " " ? "     |" : " " + boardAsString[index] + "  |")
            : (boardAsString[index] === " " ? "   |" : " " + boardAsString[index] + " |");
          }
    console.log(row);
    horizontalBorder(gridSide);
  }

}

function computerMove(board, suggestedMove) {
  let chosenIndex = null;

  // If a suggested move exists, check validity
  if (suggestedMove) {
    const suggestedMoveToRowCol = algebraicToRowCol(suggestedMove);
    if (suggestedMoveToRowCol) {
      const suggestedIndex = rowColToIndex(board, suggestedMoveToRowCol.row, suggestedMoveToRowCol.col);
      if (suggestedIndex >= 0 && suggestedIndex < board.length && board[suggestedIndex] === " ") {
        // valid → force computer to play suggested move
        chosenIndex = suggestedIndex;
      }
    }
  }
  
  // If no vallid suggestion, play a random move
  if (chosenIndex === null) {
    const availableIndices = board
      .map((cell, index) => (cell === " " ? index : null)) 
      .filter(index => index !== null);   
    chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  }

  const moveInRowCol = indexToRowCol(board, chosenIndex);
  return RowColToAlgebraic(moveInRowCol);
}

export {
  generateBoard,
  boardFromString,
  rowColToIndex,
  indexToRowCol,
  setBoardCell,
  algebraicToRowCol,
  placeLetter,
  getWinner,
  isBoardFull,
  isValidMove,
  boardToString,
  printBoard,
  computerMove
};
