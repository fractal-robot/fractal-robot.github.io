// create the grid, it's clearer if the grid is generated explicitely
//
// -1 -> placeholder, the position is not part of the board, but exist 
//  1 -> the position contain a "peg"
//  0 -> the position does not contain a "peg"
let board = [
	[-1,-1,-1,-1,-1,-1,-1,-1,-1],

	[-1,-1,-1, 1, 1, 1,-1,-1,-1],
	[-1,-1,-1, 1, 1, 1,-1,-1,-1],

	[-1, 1, 1, 1, 1, 1, 1, 1,-1],
	[-1, 1, 1, 1, 0, 1, 1, 1,-1],
	[-1, 1, 1, 1, 1, 1, 1, 1,-1],

	[-1,-1,-1, 1, 1, 1,-1,-1,-1],
	[-1,-1,-1, 1, 1, 1,-1,-1,-1],

	[-1,-1,-1,-1,-1,-1,-1,-1,-1],
]

// since the program is in javascript, I will not take optimisations into account 
// e.g. dedimensionalize the board-array or recalculating only the new 
// pegs possible moves after a move (the pegs that sourround the last movement 
// translation vector in a rectangular-like matrix, corner excluded), 
// but recalculating ALL the pegs possible movements

function printBoard(board) {
	for (let row = 0; row < board.length; ++row) {
		for (let col = 0; col < board[row].length; ++col) {
			if (board[row][col] == -1) {
				console.log("   ");
			} else if (board[row][col] == 1) {
				console.log(" - ");
			} else if (board[row][col] == 0) {
				console.log(" 0 ");
			}
		}
		console.log('\n');
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
		if (this.up) { console.log("UP"); }
		if (this.down) { console.log("DOWN"); }
		if (this.left) { console.log("LEFT"); }
		if (this.right) { console.log("RIGHT"); }
		console.log('\n');
	}
}

function calculateNewPos(board) {
	let possibleMoves = {};

	for (let row = 0; row < board.length; ++row) {
		for (let col = 0; col < board[row].length; ++col) {
			if (board[row][col] == 1) {
				const key = `${col}${row}`;

				// I have decided not to use bitwise manipulation because 
				// I need to explain the code to my classmates
				possibleMoves[key] = new PossibleMoves(
					board[row][col - 1] == 1 && board[row][col - 2] == 0,
					board[row][col + 1] == 1 && board[row][col + 2] == 0,
					board[row - 1][col] == 1 && board[row - 2][col] == 0,
					board[row + 1][col] == 1 && board[row + 2][col] == 0,

				)
			}
		}
	}

	return possibleMoves;
}

class Coord {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

function checkMovement(pigPos, movementType, possibleMoves) {
	// @param		- pigPos: the position of the pig, of type Coord
	//				- movementType: the type of the movement, object literal
	//				- possibleMoves: the dictionnary containing all the possible
	//					moves for each pig, generated via calculateNewPos
	// @return		true if the pig can move via the desired movementType

	const mask = 1 << movementType;
	return (number & mask) !== 0


}

function renderBoard(board) {
	const container = document.getElementById('arrayContainer');
	container.innerHTML = ''; // Clear previous content

	board.forEach(row => {
		const rowElement = document.createElement('div');
		rowElement.classList.add('array-row');

		row.forEach(value => {
			const cell = document.createElement('div');
			cell.classList.add('array-cell');

			if (value === -1) {
				cell.classList.add('not-represented');
			} else if (value === 0) {
				cell.classList.add('empty');
			} else if (value === 1) {
				cell.classList.add('pawn');
			}

			cell.textContent = value === -1 ? '' : value;
			rowElement.appendChild(cell);
		});

		container.appendChild(rowElement);
	});
}


function main() {
	const movements = {
		UP:    0,
		DOWN:  1,
		LEFT:  2,
		RIGHT: 3,
	}

	printBoard(board);
	let possibleMoves = calculateNewPos(board);

	possibleMoves["13"].print();

	for (let key in possibleMoves) {
		possibleMoves[key].print();
	}

	renderBoard(board);


}

main()
