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
    // I need a default board to reset the state of the game automatically when the 
    // player fails to win
    const defaultBoard = [
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

    // really strange that we have to do that in such high-level language
    function deepCopyArray(arr) {
        return arr.map(innerArr => innerArr.slice());
    }

    // it set in the generateBoard function, need to be global
    var board = deepCopyArray(defaultBoard);

    class PossibleMoves {
        constructor(up, down, left, right) {
            this.up = up;
            this.down = down;
            this.left = left;
            this.right = right;
        }

        isLocked() {
            return !(this.up || this.down || this.left || this.right);
        }
    }

    // this dictionary will encode all the possible moves for each pawn
    let possibleMoves = {};

    // since the program is in JavaScript, I will not take optimizations into account
    // e.g. de-dimensionalize the board-array or recalculating only the new
    // pegs possible moves after a move (the pegs that surround the last movement
    // translation vector in a rectangular-like matrix, corner excluded),
    // but recalculating ALL the pegs possible movements

    function generateBoard() {
        // this function visually generate the board on the webpage from the
        // two-dimensional array given above
        gameBoard.innerHTML = ''; // Clear the existing board

        board = deepCopyArray(defaultBoard);
        console.log(board);
        console.log(defaultBoard);

        for (let row = 0; row < board.length; ++row) {
            for (let col = 0; col < board[row].length; ++col) {
                const square = document.createElement("div");
                square.className = "square";
                const squareId = (row * board[row].length) + col;
                square.id = `square-${squareId}`;
                square.addEventListener("click", handleSquareClick);
                gameBoard.appendChild(square);

                square.style.backgroundColor = (row + col) % 2 === 0 ? '#1d2021' : '#282828';

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
        }
    }

    function calculateNewPos() {
        possibleMoves = {}; // clear the old possible moves

        for (let row = 0; row < board.length; ++row) {
            for (let col = 0; col < board[0].length; ++col) {
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

    function handleSquareClick(event) {
        // if a square is clicked
        const square = event.target;
        // then deduce it's coordinates
        const squareId = parseInt(square.id.replace("square-", ""));
        const squareRow = Math.floor(squareId / board[0].length);
        const squareCol = squareId % board[0].length;
        console.log(`Clicked on square: (${squareRow}, ${squareCol})`);

        // and check if the square is a possible move
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
        // if a pawn is clicked
        const pawn = event.target;
        // then deduce it't coordinates
        const pawnId = parseInt(pawn.id.replace("pawn-", ""));
        const pawnRow = Math.floor(pawnId / board[0].length);
        const pawnCol = pawnId % board[0].length;
        console.log(`Clicked on pawn: (${pawnRow}, ${pawnCol})`);

        // deselect previously selected pawn, if any
        const previouslySelectedPawn = document.querySelector(".selected");
        if (previouslySelectedPawn) {
            previouslySelectedPawn.classList.remove("selected");
        }

        clearPossibleMoves();
        showPossibleMoves(pawnRow, pawnCol);
        pawn.classList.add("selected");
    }


function showPossibleMoves(row, col) {
    // fetch all the possible directions, and show them by adding the 
    // possible-move to the possible square
    const key = `${row}${col}`;
    const directions = ['up', 'down', 'left', 'right'];

    directions.forEach(direction => {
        if (possibleMoves[key][direction]) {
            let newRow = row,
                newCol = col;

            if (direction === 'up') newRow -= 2;
            else if (direction === 'down') newRow += 2;
            else if (direction === 'left') newCol -= 2;
            else if (direction === 'right') newCol += 2;

            const squareId = (newRow * board[0].length) + newCol;
            const square = document.getElementById(`square-${squareId}`);
            square.classList.add("possible-move");
        }
    });
}



    function clearPossibleMoves() {
        const possibleMoves = document.querySelectorAll(".possible-move");
        possibleMoves.forEach(move => move.classList.remove("possible-move"));
    }

    function movePawn(pawn, fromRow, fromCol, toRow, toCol) {
        // move the selected pawn to it's new position
        const toSquareId = (toRow * board[0].length) + toCol;
        const toSquare = document.getElementById(`square-${toSquareId}`);
        toSquare.appendChild(pawn);
        // and update the square board
        board[toRow][toCol] = 1;
        board[fromRow][fromCol] = 0;
        // update the id of the pawn to reflect its new position
        const newPawnId = (toRow * board[0].length) + toCol;
        pawn.id = `pawn-${newPawnId}`;

        // calculate the position of the jumped-over pawn
        const jumpedRow = (fromRow + toRow) / 2;
        const jumpedCol = (fromCol + toCol) / 2;
        // remove the jumped-over pawn from the DOM and update the board
        const jumpedPawnId = (jumpedRow * board[0].length) + jumpedCol;
        const jumpedPawn = document.getElementById(`pawn-${jumpedPawnId}`);
        jumpedPawn.remove();
        board[jumpedRow][jumpedCol] = 0; // update the board

        clearPossibleMoves();
        updateGame();
    }

    function updateGame() {
        calculateNewPos();
        const pawns = document.querySelectorAll(".pawn");

        // count the number of remaining pawns 
        var count = 0;
        const squares = document.querySelectorAll(".square");
        squares.forEach(square => {
            if (square.querySelector(".pawn")) {
                count++;
            }});

        // if only one is remaining, set it's color and stop the
        // execution of the program
        if (count === 1) {
            pawns.forEach(pawn => {
                pawn.style.backgroundColor = '#b8bb26';
                return;
            });
        }

        // if no more move is possible
        if(Object.values(possibleMoves).every(value => value.isLocked())) {
            // change the color of the pawns 
            pawns.forEach(pawn => {
                pawn.style.backgroundColor = '#fb4934';
            });

            // then wait and reset the board
            setTimeout(() => {
                generateBoard(); 
            }, 1000);
        }

    }

    generateBoard();
    calculateNewPos();
});

