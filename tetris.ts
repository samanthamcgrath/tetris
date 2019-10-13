
// board size in tiles
let boardWidth = 10;
let boardHeight = 10;

// tile width and height in pixels
let tileSize = 30;
let tilePadding = 5;

let canvasWidth = boardWidth*tileSize;
let canvasHeight = boardHeight*tileSize;

let intervalID: number;

class Tile {
	empty: boolean;
	colour: string;

	constructor(colour? : string) {
        if(colour === undefined) {
            this.empty = true;
            this.colour = "grey";
        } else {
            this.empty = false;
            this.colour = colour;
        }
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
    //testing
    t = 2;
    //console.log(t);

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
        //console.log(newPiece);
        newPiece.globalPos = newPiece.globalPos.add(direction);
        //console.log(newPiece);
        //console.log("moving");
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
	private tiles: Tile[][];
    gamePiece: GamePiece;
    score: number;

	constructor() {
		this.gamePiece = createGamePieceFromTetro();
        this.tiles = [];
        this.score = 0;

		for(var i: number = 0; i < boardHeight; i++) {
			this.tiles[i] = [];
			for(var j: number = 0; j< boardWidth; j++) {
				this.tiles[i][j] = new Tile();
			}
		}
    }
    
    getTile(coord: Coord) : Tile {
        return this.tiles[coord.y][coord.x];
    }


    lockPiece() {
        for(let coord of this.gamePiece.absoluteCoords()) {
            this.getTile(coord).empty = false;
            this.getTile(coord).colour = this.gamePiece.colour;
        }
    }



    populateBoard(testBoard: String[]) {
        testBoard.forEach((str, index) => {
            console.log(str);
            for(let i = 0; i <str.length; i++) {
                if(str[i] == "#") {
                    this.tiles[index][i] = new Tile("red");
                }
            }
        });
    }

    clearFullRows() {
        let fullRows = 0;
        for(var i: number = boardHeight - 1; i >= 0; i--) {
            let rowFull = true;

            if(i - fullRows < 0) {
                this.tiles[i] = [];
                for(var j: number = 0; j< boardWidth; j++) {
                    this.tiles[i][j] = new Tile();
                }
            } else {
                this.tiles[i] = this.tiles[i - fullRows];
            }

			for(var j: number = 0; j< boardWidth; j++) {
                
                //console.log("i:" + i + ", j:" + j);
				if(this.tiles[i][j].empty) {
                    rowFull = false;
                }
            }

            if(rowFull) {
                fullRows++;
                //console.log("row " + i + "is full");
                this.tiles[i] = this.tiles[i - 1];
                i = i + 1;
            }

        }   
        //console.log("found full rows: " + fullRows);    
    }

    *coords() : Iterable<Coord> {
        for(var i: number = 0; i < boardHeight; i++) {
			for(var j: number = 0; j< boardWidth; j++) {
				yield new Coord(j,i);
			}
		}       
    }
} 

function drawBoard(board: Board, ctx: CanvasRenderingContext2D) {
	console.log("drawing board");

	//draw all tiles
	ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    for(let coord of board.coords()) {
        ctx.fillStyle = board.getTile(coord).colour;
		ctx.fillRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
		ctx.strokeRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
    }

    //draw our game piece
	ctx.fillStyle = board.gamePiece.colour;
    for(let coord of board.gamePiece.absoluteCoords()) {
		ctx.fillRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
		ctx.strokeRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
    }

}

function handleKeyPress(event: KeyboardEvent, board: Board) {
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
        } else if(!board.getTile(coord).empty) {
            collision = true;
        }       
    }

    return collision;
}


function gameOver() {
    window.clearInterval(intervalID);
    main();
}

function tick(board: Board) {

    //if moving down would cause collision
    //then lock in piece 
    if(collision(board, board.gamePiece.move(DOWN))) {
        console.log("lock in piece");
        board.lockPiece();
        board.clearFullRows();

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

function testRowClearing(board: Board) {
    board.populateBoard(
        ["..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        ".#.#.#...."]
     );
}

function main() {
    const canvas: HTMLCanvasElement = document.querySelector('#board');
	const ctx = canvas.getContext('2d');
	canvas.width = boardWidth*tileSize + 100;
	canvas.height = boardHeight*tileSize + 100;

    let board = new Board();



    drawBoard(board, ctx);

    intervalID = window.setInterval(() => {
        tick(board);
        drawBoard(board, ctx);
    }, 400);

    //console.log(canvas);
    document.addEventListener("keydown", function(event: KeyboardEvent) {
        let draw = handleKeyPress(event, board);
        if(draw) {
            drawBoard(board, ctx);
        }
    });

	
}

window.onload = main;
