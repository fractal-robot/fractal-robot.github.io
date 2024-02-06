document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = document.getElementById("game-board");

    // create the grid, it's clearer if the grid is generated explicitly
    // (english variant)
    //
    // -1 -> placeholder, the position is not part of the board, but exists
    //  1 -> the position contains a "peg"
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
    ];

    // this dictionary will encode all the possible moves for each pawn
    let possibleMoves = {};

    // since the program is in JavaScript, I will not take optimizations into account
    // e.g. de-dimensionalize the board-array or recalculating only the new
    // pegs possible moves after a move (the pegs that surround the last movement
    // translation vector in a rectangular-like matrix, corner excluded),
    // but recalculating ALL the pegs possible movements


function generateBoard() {
    // this function visually generates the board on the webpage from the
    // two-dimensional array given above

    let isDarkSquare = false;

    for (let row = 0; row < board.length; ++row) {
        for (let col = 0; col < board[row].length; ++col) {
            const square = document.createElement("div");
            square.className = "square";
            const squareId = (row * board[row].length) + col;
            square.id = `square-${squareId}`;
            square.addEventListener("click", handleSquareClick);
            
            // Toggle the color class based on whether the square is dark or light
            square.classList.add(isDarkSquare ? "dark" : "light");
            isDarkSquare = !isDarkSquare;

            gameBoard.appendChild(square);

            // if there is a pawn at the in-process pos, then generate it to markup
            if (board[row][col] === 1) {
                const pawn = document.createElement("div");
                pawn.className = "pawn";
                const pawnId = (row * board[row].length) + col;
                pawn.id = `pawn-${pawnId}`;
                pawn.addEventListener("click", handlePawnClick);
                square.appendChild(pawn);
            }

            // disable if placeholder
            if (board[row][col] === -1) {
                square.classList.add("disabled");
            }
        }

        // After each row, toggle the starting square color
        isDarkSquare = !isDarkSquare;
    }
}


    class PossibleMoves {
        constructor(up, down, left, right) {
            this.up = up;
            this.down = down;
            this.left = left;
            this.right = right;
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

                    );
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
        const squareId = parseInt(square.id.replace("square-", ""));
        const squareRow = Math.floor(squareId / board[0].length);
        const squareCol = squareId % board[0].length;
        console.log(`Clicked on square: (${squareRow}, ${squareCol})`);

        // Check if the square is a possible move
        if (square.classList.contains("possible-move")) {
            const selectedPawn = document.querySelector(".selected");
            if (selectedPawn) {
                const pawnId = parseInt(selectedPawn.id.replace("pawn-", ""));
                const pawnRow = Math.floor(pawnId / board[0].length);
                const pawnCol = pawnId % board[0].length;
                movePawn(selectedPawn, pawnRow, pawnCol, squareRow, squareCol);


            }
        }
    }


function handlePawnClick(event) {
    const pawn = event.target;
    const pawnId = parseInt(pawn.id.replace("pawn-", ""));
    const pawnRow = Math.floor(pawnId / board[0].length);
    const pawnCol = pawnId % board[0].length;
    console.log(`Clicked on pawn: (${pawnRow}, ${pawnCol})`);

    // Remove possible move indicators
    clearPossibleMoves();

    // Deselect the previously selected pawn
    const selectedPawn = document.querySelector(".selected");
    if (selectedPawn) {
        selectedPawn.classList.remove("selected");
    }

    // Show possible moves
    showPossibleMoves(pawnRow, pawnCol);

    // Highlight the selected pawn
    pawn.classList.add("selected");
}



    function showPossibleMoves(row, col) {
        const key = `${row}${col}`;
        console.log(key);

        console.log("This pawn can move to:");

        if (possibleMoves[key].up) {
            const squareUpId = ((row - 2) * board[0].length) + col;
            const squareUp = document.getElementById(`square-${squareUpId}`);
            squareUp.classList.add("possible-move");
        }

        if (possibleMoves[key].down) {
            const squareDownId = ((row + 2) * board[0].length) + col;
            const squareDown = document.getElementById(`square-${squareDownId}`);
            squareDown.classList.add("possible-move");
        }

        if (possibleMoves[key].left) {
            const squareLeftId = (row * board[0].length) + (col - 2);
            const squareLeft = document.getElementById(`square-${squareLeftId}`);
            squareLeft.classList.add("possible-move");
        }

        if (possibleMoves[key].right) {
            const squareRightId = (row * board[0].length) + (col + 2);
            const squareRight = document.getElementById(`square-${squareRightId}`);
            squareRight.classList.add("possible-move");
        }
    }


    function clearPossibleMoves() {
        const possibleMoves = document.querySelectorAll(".possible-move");
        possibleMoves.forEach(move => move.classList.remove("possible-move"));
    }




    function movePawn(pawn, fromRow, fromCol, toRow, toCol) {
        // Calculate the position of the jumped-over pawn
        const jumpedRow = Math.floor((fromRow + toRow) / 2);
        const jumpedCol = Math.floor((fromCol + toCol) / 2);



        // move pawn to the new position
        const toSquareId = (toRow * board[0].length) + toCol;
        const toSquare = document.getElementById(`square-${toSquareId}`);
        toSquare.appendChild(pawn);
        board[toRow][toCol] = 1;
        board[fromRow][fromCol] = 0;

        // Remove the jumped-over pawn from the DOM and update the board
        const jumpedPawnId = (jumpedRow * board[0].length) + jumpedCol;
        const jumpedPawn = document.getElementById(`pawn-${jumpedPawnId}`);
        jumpedPawn.remove(); // Remove the jumped-over pawn from the DOM
        board[jumpedRow][jumpedCol] = 0; // Update the board

        // remove possible move indicators
        clearPossibleMoves();

        // deselect the pawn
        pawn.classList.remove("selected");

        calculateNewPos();
    }




    // Initialize the board
    generateBoard();
    calculateNewPos();
});

