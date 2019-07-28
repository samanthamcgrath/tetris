
// board size in tiles
let boardWidth = 10;
let boardHeight = 20;

// tile width and height in pixels
let tileSize = 50;
let tilePadding = 10;

let canvasWidth = boardWidth*tileSize;
let canvasHeight = boardHeight*tileSize;

class Tile {
	isEmpty: boolean;
	colour: string;

	constructor() {
		this.isEmpty = true;
		this.colour = "grey";
	}
}

enum Tetros {
    I,
    O,
    T,
    J,
    L,
    S,
    Z,
}

class Direction {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Coord {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class GamePiece {
	shape: Coord[];
	colour: string;

	constructor(t: Tetros) {
        if(t == 1) {
            this.colour = "lightblue";
            this.shape = [new Coord(4,0), new Coord(4,1),
                        new Coord(4,2), new Coord(4,3)];
        }
        if(t == 2) {
            this.colour = "yellow";
            this.shape = [new Coord(4,0), new Coord(5,0),
                        new Coord(5,1), new Coord(4,1)];
        }
        if(t == 3) {
            this.colour = "pink";
            this.shape = [new Coord(4,0), new Coord(5,0),
                        new Coord(6,0), new Coord(5,1)];
        }
        if(t == 4) {
            this.colour = "blue";
            this.shape = [new Coord(4,0), new Coord(5,0),
                        new Coord(6,0), new Coord(6,1)];
        }
        if(t == 5) {
            this.colour = "orange";
            this.shape = [new Coord(4,0), new Coord(5,0),
                        new Coord(6,0), new Coord(4,1)];
        }
        if(t == 6) {
            this.colour = "green";
            this.shape = [new Coord(4,0), new Coord(5,0),
                        new Coord(3,1), new Coord(4,1)];
        }
        if(t == 7) {
            this.colour = "red";
            this.shape = [new Coord(4,0), new Coord(5,0),
                        new Coord(5,1), new Coord(6,1)];
        }
	}
}

class Board {
	tiles: Tile[][];
	gamePiece: GamePiece;

	constructor() {
		this.gamePiece = new GamePiece(7);
		this.tiles = [];

		for(var i: number = 0; i < boardWidth; i++) {
			this.tiles[i] = [];
			for(var j: number = 0; j< boardHeight; j++) {
				this.tiles[i][j] = new Tile();
			}
		}
	}
}

function drawBoard(board, ctx) {

	console.log("drawing board");

	//draw all tiles
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'black';
	board.tiles.forEach(function(row, i) {
		row.forEach(function(el, j) {
			ctx.fillStyle = board.tiles[i][j].colour;

			ctx.fillRect(i*tileSize, j*tileSize, tileSize, tileSize);
			ctx.strokeRect(i*tileSize, j*tileSize, tileSize, tileSize);
		});
	});

	//draw our game piece
	board.gamePiece.shape.forEach(function(el, i) {
		ctx.fillStyle = board.gamePiece.colour;
		ctx.fillRect((el.x)*tileSize,(el.y)*tileSize, tileSize, tileSize);
		ctx.strokeRect((el.x)*tileSize,(el.y)*tileSize, tileSize, tileSize);
	});

}

function handleKeyPress(event, board: Board) {
    let draw = false;
	switch (event.key) {
		case "Down": // IE/Edge specific value
		case "ArrowDown":
			// Do something for "down arrow" key press.
            if(!collision(board, {x: 0, y: 1})) {
                move(board.gamePiece, {x: 0, y: 1});
                draw = true;
            }
			break;
		case "Left": // IE/Edge specific value
		case "ArrowLeft":
            // Do something for "left arrow" key press.
            if(!collision(board, {x: -1, y: 0})) {
                move(board.gamePiece, {x: -1, y: 0});
                draw = true;
            }
			break;
		case "Right": // IE/Edge specific value
		case "ArrowRight":
			// Do something for "right arrow" key press.
            if(!collision(board, {x: 1, y: 0})) {
                move(board.gamePiece, {x: 1, y: 0});
                draw = true;
            }
			break;
		case "z":
			// Do something for "z"  key press. Rotate counterclockwise
			break;
		case "x":
			// Do something for "x"  key press. Rotate clockwise
			break;
		case "Space":
			// Do something for "space"  key press.
			break;
		case "Esc": // IE/Edge specific value
		case "Escape":
			// Do something for "esc" key press.
			break;
		default:
			return; // Quit when this doesn't handle the key event.
    }
    
    return draw;
}

//can we move there
function collision(board: Board, direction: Direction) {

    let collision = false;
    board.gamePiece.shape.forEach(function (el) {
        let newX = el.x + direction.x;
        let newY = el.y + direction.y;
        console.log(newX, newY);
        console.log(board.tiles[newX][newY].isEmpty);
        if(newX < 0 || newX > boardWidth || newY > boardHeight) {
            collision = true;
        }
        if(!board.tiles[newX][newY].isEmpty) {
            collision = true;
        }
    });
    return collision;
}

//move piece
function move(piece: GamePiece, direction: Direction) {

    piece.shape.forEach(function (el) {
        el.x += direction.x;
        el.y += direction.y;
    });
}

function tick(board: Board) {

    //if moving down would cause collision
    //then lock in piece 
    if(collision(board, {x: 0, y: 1})) {
        console.log("lock in piece");
        return;
    } else {
        //if no collision
        //move down 1
        move(board.gamePiece, {x: 0, y: 1});
    }


}

function main() {
    const canvas : any = document.querySelector('#board');
	const ctx = canvas.getContext('2d');
	canvas.width = boardWidth*tileSize + 100;
	canvas.height = boardHeight*tileSize + 100;

    let board = new Board();

    board.tiles[5][boardHeight-1].isEmpty = false;
    board.tiles[5][boardHeight-1].colour = "blue";
    drawBoard(board, ctx);

    window.setInterval(() => {
        tick(board);
        drawBoard(board, ctx);
    }, 5000);

    console.log(canvas);
    document.addEventListener("keydown", function(event) {
        let draw = handleKeyPress(event, board);
        if(draw) {
            drawBoard(board, ctx);
        }
    });

	
}

window.onload = main;
