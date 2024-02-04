document.addEventListener("DOMContentLoaded", function () {
	const gameBoard = document.getElementById("game-board");

	// create the grid, it's clearer if the grid is generated explicitely
	// (english variant)
	//
	// -1 -> placeholder, the position is not part of the board, but exist 
	//  1 -> the position contain a "peg"
	//  0 -> the position does not contain a "peg"
	//
	// https://commons.wikimedia.org/wiki/File:Peg_Solitaire_game_board_shapes.svg (v4)
	let board = [
		[-1, -1, -1, -1, -1, -1, -1, -1, -1],
		[-1, -1, -1, 1, 1, 1, -1, -1, -1],
		[-1, -1, -1, 1, 1, 1, -1, -1, -1],
		[-1, 1, 1, 1, 1, 1, 1, 1, -1],
		[-1, 1, 1, 1, 0, 1, 1, 1, -1],
		[-1, 1, 1, 1, 1, 1, 1, 1, -1],
		[-1, -1, -1, 1, 1, 1, -1, -1, -1],
		[-1, -1, -1, 1, 1, 1, -1, -1, -1],
		[-1, -1, -1, -1, -1, -1, -1, -1, -1],
	]

	// this dictionnary will encode all the possible moves for each pawn
	let possibleMoves = {};

	// since the program is in javascript, I will not take optimisations into account 
	// e.g. dedimensionalize the board-array or recalculating only the new 
	// pegs possible moves after a move (the pegs that sourround the last movement 
	// translation vector in a rectangular-like matrix, corner excluded), 
	// but recalculating ALL the pegs possible movements

	function generateBoard() {
		// this function visually generate the board on the webpage from the 
		// two dimentionnal array given above
		gameBoard.innerHTML = ''; // Clear the existing board



		for (let row = 0; row < board.length; ++row) {
			for (let col = 0; col < board[row].length; ++col) {
				const square = document.createElement("div");
				square.className = "square";
				square.id = `square-${row}-${col}`;
				square.addEventListener("click", handleSquareClick);
				gameBoard.appendChild(square);

				// if there is a pawn at the in-process pos, then genetate it to markup
				if (board[row][col] === 1) {
					const pawn = document.createElement("div");
					pawn.className = "pawn";
					pawn.id = `pawn-${row}-${col}`;
					pawn.addEventListener("click", handlePawnClick);
					square.appendChild(pawn);
				}

				// disable if placeholder
				if (board[row][col] === -1) {
					square.classList.add("disabled");
				}
			}
		}
	}

	class PossibleMoves {
		constructor(up, down, left, right) {
			this.up = up;
			this.down = down;
			this.left = left;
			this.right = right;
		}

		print() {
			if (this.up) {console.log("UP");}
			if (this.down) {console.log("DOWN");}
			if (this.left) {console.log("LEFT");}
			if (this.right) {console.log("RIGHT");}
			console.log('\n');
		}
	}

	function calculateNewPos() {
		possibleMoves = {}; // clear the old possible moves

		for (let row = 0; row < board.length; ++row) {
			for (let col = 0; col < board[row].length; ++col) {
				if (board[row][col] == 1) {
				const key = `${row}${col}`;

					// I have decided not to use bitwise manipulation because 
					// I need to explain the code to my classmates
					possibleMoves[key] = new PossibleMoves(
						board[row - 1][col] == 1 && board[row - 2][col] == 0,
						board[row + 1][col] == 1 && board[row + 2][col] == 0,
						board[row][col - 1] == 1 && board[row][col - 2] == 0,
						board[row][col + 1] == 1 && board[row][col + 2] == 0,

					)
				}
			}
		}

		console.log("calculating new move");
		return possibleMoves;
	}

	class Coord {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}
	}

	function handleSquareClick(event) {

		const square = event.target;
		const [squareRow, squareCol] = getSquarePosition(square.id);
		console.log(`Clicked on square: (${squareRow}, ${squareCol})`);

		// Check if the square is a possible move
		if (square.classList.contains("possible-move")) {
			const selectedPawn = document.querySelector(".selected");
			if (selectedPawn) {
				const [pawnRow, pawnCol] = getPawnPosition(selectedPawn.id);
				movePawn(selectedPawn, pawnRow, pawnCol, squareRow, squareCol);


			}
		}
	}

	function handlePawnClick(event) {

		const pawn = event.target;
		const [pawnRow, pawnCol] = getPawnPosition(pawn.id);
		console.log(`Clicked on pawn: (${pawnRow}, ${pawnCol})`);

		// Remove possible move indicators
		clearPossibleMoves();

		// Show possible moves
		showPossibleMoves(pawnRow, pawnCol);

		// Highlight the selected pawn
		pawn.classList.add("selected");


	}

	function getPawnPosition(pawnId) {
		const [, pawnRow, pawnCol] = pawnId.match(/pawn-(\d+)-(\d+)/);
		return [parseInt(pawnRow), parseInt(pawnCol)];
	}

	function getSquarePosition(squareId) {
		const [, squareRow, squareCol] = squareId.match(/square-(\d+)-(\d+)/);
		return [parseInt(squareRow), parseInt(squareCol)];
	}

	function showPossibleMoves(row, col) {
		const key = `${row}${col}`;
		console.log(key);

		console.log("This pawn can move to:");
		possibleMoves[key].print();

		if (possibleMoves[key].up) {
			const squareUp = document.getElementById(`square-${row - 2}-${col}`);
			squareUp.classList.add("possible-move");
		}

		if (possibleMoves[key].down) {
			const squareDown = document.getElementById(`square-${row + 2}-${col}`);
			squareDown.classList.add("possible-move");
		}

		if (possibleMoves[key].left) {
			const squareLeft = document.getElementById(`square-${row}-${col - 2}`);
			squareLeft.classList.add("possible-move");
		}

		if (possibleMoves[key].right) {
			const squareRight = document.getElementById(`square-${row}-${col + 2}`);
			squareRight.classList.add("possible-move");
		}
	}


	function clearPossibleMoves() {
		const possibleMoves = document.querySelectorAll(".possible-move");
		possibleMoves.forEach(move => move.classList.remove("possible-move"));
	}




	function movePawn(pawn, fromRow, fromCol, toRow, toCol) {
		// Calculate the position of the jumped-over pawn
		const jumpedRow = (fromRow + toRow) / 2;
		const jumpedCol = (fromCol + toCol) / 2;



		// move pawn to the new position
		const toSquare = document.getElementById(`square-${toRow}-${toCol}`);
		toSquare.appendChild(pawn);
		board[toRow][toCol] = 1;
		board[fromRow][fromCol] = 0;

		// Remove the jumped-over pawn from the DOM and update the board
		const jumpedPawn = document.getElementById(`pawn-${jumpedRow}-${jumpedCol}`);
		jumpedPawn.remove(); // Remove the jumped-over pawn from the DOM
		board[jumpedRow][jumpedCol] = 0; // Update the board

		// remove possible move indicators
		clearPossibleMoves();

		// deselect the pawn
		pawn.classList.remove("selected");

		calculateNewPos();

		console.log(board);

		generateBoard();

	}




	// Initialize the board
	generateBoard();
	calculateNewPos();
});
