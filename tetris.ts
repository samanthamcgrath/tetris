
// board size in tiles
let boardWidth = 10;
let boardHeight = 20;

// tile width and height in pixels
let tileSize = 30;
let tilePadding = 5;

let canvasWidth = boardWidth*tileSize;
let canvasHeight = boardHeight*tileSize;

class Tile {
	empty: boolean;
	colour: string;

	constructor() {
		this.empty = true;
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

class Coord {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(other : Coord) : Coord {
        return new Coord(this.x + other.x, this.y + other.y);
    }
}

const DOWN = new Coord(0,1);
const LEFT = new Coord(-1,0);
const RIGHT = new Coord(1,0);

enum Rotate {
    Clockwise,
    Counterclockwise,
}

function createGamePieceFromTetro(t?: Tetros) : GamePiece {

    let globalPos = new Coord(4, 0);
    let colour;
    let shape;
    if(t === undefined) {
        t = Math.floor(Math.random() * Math.floor(7) + 1);
    }
    console.log(t);

    if(t == 1) {
        colour = "lightblue";
        shape = [new Coord(0,0), new Coord(0,1),
                    new Coord(0,2), new Coord(0,3)];
    }
    if(t == 2) {
        colour = "yellow";
        shape = [new Coord(0,0), new Coord(1,0),
                    new Coord(1,1), new Coord(0,1)];
    }
    if(t == 3) {
        colour = "pink";
        shape = [new Coord(0,0), new Coord(1,0),
                    new Coord(2,0), new Coord(1,1)];
    }
    if(t == 4) {
        colour = "blue";
        shape = [new Coord(0,0), new Coord(1,0),
                    new Coord(2,0), new Coord(2,1)];
    }
    if(t == 5) {
        colour = "orange";
        shape = [new Coord(0,0), new Coord(1,0),
                    new Coord(2,0), new Coord(0,1)];
    }
    if(t == 6) {
        colour = "green";
        shape = [new Coord(1,0), new Coord(2,0),
                    new Coord(0,1), new Coord(1,1)];
    }
    if(t == 7) {
        colour = "red";
        shape = [new Coord(0,0), new Coord(1,0),
                    new Coord(1,1), new Coord(2,1)];
    }    
    return new GamePiece(globalPos,shape,colour);
}

class GamePiece {
    globalPos: Coord;
	shape: Coord[];
	colour: string;

	constructor(globalPos: Coord, shape: Coord[], colour: string) {       
        this.globalPos = globalPos;
        this.shape = shape;
        this.colour = colour;
    }

    move(direction: Coord) : GamePiece {

        let newPiece = this.clone();
        console.log(newPiece);
        newPiece.globalPos = newPiece.globalPos.add(direction);
        console.log(newPiece);
        console.log("moving");
        return newPiece;
    }

    clone() {
        return new GamePiece(this.globalPos, this.shape, this.colour);
    }
    
    *absoluteCoords() : Iterable<Coord> {
        for(let el of this.shape) {
            yield el.add(this.globalPos);
        }
    }
}

class Board {
	tiles: Tile[][];
	gamePiece: GamePiece;

	constructor() {
		this.gamePiece = createGamePieceFromTetro();
		this.tiles = [];

		for(var i: number = 0; i < boardWidth; i++) {
			this.tiles[i] = [];
			for(var j: number = 0; j< boardHeight; j++) {
				this.tiles[i][j] = new Tile();
			}
		}
    }
    
    getTile(x: number, y: number) : Tile {
        return this.tiles[x][y];
    }
}

function drawBoard(board, ctx) {

	console.log("drawing board");

	//draw all tiles
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'black';
	board.tiles.forEach(function(row, i) {
		row.forEach(function(el, j) {
			ctx.fillStyle = board.getTile(i,j).colour;
			ctx.fillRect(i*tileSize, j*tileSize, tileSize, tileSize);
			ctx.strokeRect(i*tileSize, j*tileSize, tileSize, tileSize);
		});
	});

    //draw our game piece
	ctx.fillStyle = board.gamePiece.colour;
    for(let coord of board.gamePiece.absoluteCoords()) {
		ctx.fillRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
		ctx.strokeRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
    }

}

function handleKeyPress(event, board: Board) {
    let draw = false;
	switch (event.key) {
		case "Down": // IE/Edge specific value
		case "ArrowDown":
			// Do something for "down arrow" key press.
            if(!collision(board, board.gamePiece.move(DOWN))) {
                board.gamePiece = board.gamePiece.move(DOWN);
                draw = true;
            }
			break;
		case "Left": // IE/Edge specific value
		case "ArrowLeft":
            // Do something for "left arrow" key press.
            if(!collision(board, board.gamePiece.move(LEFT))) {
                board.gamePiece = board.gamePiece.move(LEFT);
                draw = true;
            }
			break;
		case "Right": // IE/Edge specific value
		case "ArrowRight":
			// Do something for "right arrow" key press.
            if(!collision(board, board.gamePiece.move(RIGHT))) {
                board.gamePiece = board.gamePiece.move(RIGHT);
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
function collision(board: Board, newPiece: GamePiece) {

    let collision = false;

    for(let coord of newPiece.absoluteCoords()) {
        if(coord.x < 0 || coord.x >= boardWidth || coord.y >= boardHeight) {
            console.log("collision");
            collision = true;
        } else if(!board.getTile(coord.x,coord.y).empty) {
            collision = true;
        }       
    }

    return collision;
}

function checkFullRows(board: Board) {
    let rowFull = false;
 
    for(let coord of board.gamePiece.absoluteCoords()) {
        let rowNumber = coord.y;
        //TO DO check each row changed by our pieceeto see if full now
    }
    
}

function lockPiece(board: Board) {

    for(let coord of board.gamePiece.absoluteCoords()) {
        board.tiles[coord.x][coord.y].empty = false;
        board.tiles[coord.x][coord.y].colour = board.gamePiece.colour;
    }
}

function gameOver() {
    window.clearInterval();
}

function tick(board: Board) {

    //if moving down would cause collision
    //then lock in piece 
    if(collision(board, board.gamePiece.move(DOWN))) {
        console.log("lock in piece");
        lockPiece(board);
        checkFullRows(board);

        let newPiece = createGamePieceFromTetro();
        if(collision(board, newPiece)) {
            console.log("game over");
            gameOver();
        } else {
            board.gamePiece = createGamePieceFromTetro();
        }

        return;
    } else {
        //if no collision
        //move down 1
        board.gamePiece = board.gamePiece.move(DOWN);
    }


}

function main() {
    const canvas : any = document.querySelector('#board');
	const ctx = canvas.getContext('2d');
	canvas.width = boardWidth*tileSize + 100;
	canvas.height = boardHeight*tileSize + 100;

    let board = new Board();

    //test block
    board.tiles[4][boardHeight-1].empty = false;
    board.tiles[4][boardHeight-1].colour = "blue";


    drawBoard(board, ctx);

    window.setInterval(() => {
        tick(board);
        drawBoard(board, ctx);
    }, 400);

    console.log(canvas);
    document.addEventListener("keydown", function(event) {
        let draw = handleKeyPress(event, board);
        if(draw) {
            drawBoard(board, ctx);
        }
    });

	
}

window.onload = main;
