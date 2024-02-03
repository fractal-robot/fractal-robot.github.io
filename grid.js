// create the grid, it's clearer if the grid is generated explicitely
//
// -1 -> placeholder, the position is not part of the board, but exist 
//  1 -> the position contain a "pig"
//  0 -> the position does not contain a "pig"



// since the program is in javascript, I will not take optimisation into account 
// e.g. dedimensionalize the board-array or recalculating only the new 
// pigs possible moves after a move (the pigs that sourround the last movement 
// translation vector in a square-like matrix), 
// but recalculating ALL the pigs possible movements

function printBoard(board) {
	for (let row = 0; row < board.length; ++row) {
		for (let col = 0; col < board[row].length; ++col) {
			if (board[row][col] == -1) {
				process.stdout.write("   ");
			} else if (board[row][col] == 1) {
				process.stdout.write(" - ");
			} else if (board[row][col] == 0) {
				process.stdout.write(" 0 ");
			}

		}
		process.stdout.write("\n");
	}
}

function calculateNewPos(board) {
	let possibleMoves = {};

	for (let row = 0; row < board.length; ++row) {
		for (let col = 0; col < board[row].length; ++col) {
			const key = `${col}${row}`;
			let value = 0b0000;

			value = (row + 2 < board.length && board[row + 1][col] == 1 && board[row + 2][col] == 0) ? (value | (1 << 0)) : value;
			value = (row - 2 >= 0 && board[row - 1][col] == 1 && board[row - 2][col] == 0) ? (value | (1 << 1)) : value;
			value = (col + 2 < board[row].length && board[row][col + 1] == 1 && board[row][col + 2] == 0) ? (value | (1 << 2)) : value;
			value = (col - 2 >= 0 && board[row][col - 1] == 1 && board[row][col - 2] == 0) ? (value | (1 << 3)) : value;

			possibleMoves[key] = value;
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


function main() {
	const movements = {
		UP:    0,
		DOWN:  1,
		LEFT:  2,
		RIGHT: 3,
	}

	let board = [
		[-1,-1,-1,-1,-1,-1,-1,-1,-1],

		[-1,-1,-1, 1, 1, 1,-1,-1,-1],
		[-1,-1,-1, 1, 1, 1,-1,-1,-1],

		[-1, 1, 1, 1, 1, 1, 1, 1,-1],
		[-1, 1, 1, 1, 0, 1, 1, 1,-1],
		[-1, 1, 1, 1, 1, 1, 1, 1,-1],

		[-1,-1,-1, 1, 1, 1,-1,-1,-1],
		[-1,-1,-1, 1, 1, 1,-1,-1,-1],
	]


	printBoard(board);
}

main();
