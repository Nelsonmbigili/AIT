import * as tic from "./src/tic-tac-toe.js";
import readlineSync from 'readline-sync';
import fs from 'fs';

// Helper Functions for the Game Flow
function printGame(config) {
  const board = tic.boardFromString(config.board);
  tic.printBoard(board);
}

function gameState(config){
	const board = tic.boardFromString(config.board);
	const winner = tic.getWinner(board);
	if(winner) {return winner;}
	const draw = tic.isBoardFull(board);
	if(draw) {return "draw";}
	return "on-going";
}

function waitForEnter() {
    readlineSync.question("Press <ENTER> to show computer's move...");
}

function runGame(config){
	let turn = "player";
	while(gameState(config) === "on-going"){
		const board = tic.boardFromString(config.board);
		if(turn==="player"){
			console.log("What's your move?");
			let move = readlineSync.question("> ");
			while(!tic.isValidMove(board, move)){
				console.log("Your move must be in a  format, and it must specify an existing empty cell!");
				console.log("What's your move?");
			    move = readlineSync.question("> ");
			}
			// Remove move from computer if available
			if(config.computerMoves.includes(move)) {config.computerMoves = config.computerMoves.filter(m => m !== move);} 
			const newBoard = tic.placeLetter(board, config.playerLetter , move);
			const newBoardAsString = tic.boardToString(newBoard);
			config.board = newBoardAsString;
			printGame(config);
			turn = "computer";
		}else{
			// Random Computer Move
			let suggestedMove = null;
			if(config.computerMoves.length>0 ){
				suggestedMove=config.computerMoves.shift();
			}

			const move = tic.computerMove(board, suggestedMove);
			const newBoard = tic.placeLetter(board, config.computerLetter , move);
			const newBoardAsString = tic.boardToString(newBoard);
			config.board = newBoardAsString;
			waitForEnter();
			printGame(config);
			turn = "player";
		}

		if(gameState(config) === config.computerLetter){
			console.log("Computer won!");
			break ;
		}else if(gameState(config) === config.playerLetter){
			console.log("Player won!");
			break ;
		}else if(gameState(config) === "draw"){
			console.log("It's a draw!");
			break;
		}
   }

}
		

// Game Flow 
const configFile = process.argv[2];

let config ={
	board: "         ",
	playerLetter : "X",
	computerLetter : "O",
    computerMoves : [],
};

if (configFile) {
  fs.readFile(configFile, "utf-8", (err, data) => {
	    if (err) {
	      console.error("Error reading the file!");
	      process.exit(1);
	    }
	    config = JSON.parse(data);
	    console.log(`Player is ${config.playerLetter}, Computer is ${config.computerLetter}`);
		if (config.computerMoves.length > 0) {console.log("Computer will make the following moves:", config.computerMoves);}
	    printGame(config);
	    runGame(config);
  });
} else 
{
  console.log(`Player is ${config.playerLetter}, Computer is ${config.computerLetter}`);
  if (config.computerMoves.length > 0) {
    console.log("Computer will make the following moves:", config.computerMoves);
  }
  printGame(config);
  runGame(config);
}









