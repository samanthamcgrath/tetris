
// board size in tiles
let boardWidth = 10;
let boardHeight = 20;

// tile width and height in pixels
let tileSize = 20;
let tilePadding = 4;

// next piece canvas box
let nextCanvasX = boardWidth*tileSize + 20;
let nextCanvasY = 20;
let nextTextWidth = 100;

let canvasWidth = boardWidth*tileSize*2;
let canvasHeight = boardHeight*tileSize;

let intervalID: number;

class Tile {
	empty: boolean;
	colour: string;

	constructor(colour? : string) {
        if(colour === undefined) {
            this.empty = true;
            this.colour = "lightgrey";
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
    subtract(other : Coord) : Coord {
        return new Coord(this.x - other.x, this.y - other.y);
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
    let rotationPoint;
    if(t === undefined) {
        t = Math.floor(Math.random() * Math.floor(7));
    }
    //testing
    //t = 1;
    //console.log(t);

    if(t == Tetros.I) {
        colour = "lightblue";
        shape = [new Coord(1,0), new Coord(1,1),
                    new Coord(1,2), new Coord(1,3)];
        rotationPoint = new Coord(1.5,1.5);
    } 
    else if(t == Tetros.O) {
        colour = "yellow";
        shape = [new Coord(0,0), new Coord(1,0),
                    new Coord(0,1), new Coord(1,1)];
        rotationPoint = new Coord(0.5,0.5);
    }
    else if(t == Tetros.T) {
        colour = "pink";
        shape = [new Coord(0,1), new Coord(1,1),
                    new Coord(2,1), new Coord(1,2)];
        rotationPoint = new Coord(1,1);
    }
    else if(t == Tetros.J) {
        colour = "blue";
        shape = [new Coord(0,1), new Coord(1,1),
                    new Coord(2,1), new Coord(2,0)];
        rotationPoint = new Coord(1,1);
    }
    else if(t == Tetros.L) {
        colour = "orange";
        shape = [new Coord(0,1), new Coord(1,1),
                    new Coord(2,1), new Coord(2,2)];
        rotationPoint = new Coord(1,1);
    }
    else if(t == Tetros.S) {
        colour = "green";
        shape = [new Coord(1,0), new Coord(2,0),
                    new Coord(0,1), new Coord(1,1)];
        rotationPoint = new Coord(1,1);
    }
    else if(t == Tetros.Z) {
        colour = "red";
        shape = [new Coord(0,0), new Coord(1,0),
                    new Coord(1,1), new Coord(2,1)];
        rotationPoint = new Coord(1,1);
    }
    else {
        throw "game piece undefined";
    }
    return new GamePiece(globalPos,shape,colour,rotationPoint);
}

class GamePiece {
    globalPos: Coord;
	shape: Coord[];
    colour: string;
    rotationPoint: Coord;

	constructor(globalPos: Coord, shape: Coord[], colour: string, rotationPoint: Coord) {       
        this.globalPos = globalPos;
        this.shape = shape;
        this.colour = colour;
        this.rotationPoint = rotationPoint;
    }

    move(direction: Coord) : GamePiece {

        let newPiece = this.clone();
        //console.log(newPiece);
        newPiece.globalPos = newPiece.globalPos.add(direction);
        //console.log(newPiece);
        //console.log("moving");
        return newPiece;
    }

    rotate(direction: Rotate) : GamePiece {
        console.log("rotating");
        let newPiece = this.clone();

        newPiece.shape = this.shape.map(element => {
            //console.log(element);
            let newCoord = element.subtract(this.rotationPoint);
            if(direction === Rotate.Clockwise) {
                newCoord = new Coord(-newCoord.y,newCoord.x);
            } else {
                newCoord = new Coord(newCoord.y,-newCoord.x);
            }
            newCoord = newCoord.add(this.rotationPoint);
            //console.log(newCoord);
            return newCoord;
        });
        return newPiece;
    }

    clone() {
        return new GamePiece(this.globalPos, this.shape, this.colour, this.rotationPoint);
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
    nextPiece: GamePiece;
    score: number;
    tetris: boolean;

	constructor() {
        this.gamePiece = createGamePieceFromTetro();
        this.nextPiece = createGamePieceFromTetro();
        this.tiles = [];
        this.score = 0;
        this.tetris = false;

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

    convertToString() : String[] {
        let board: String[] = [];
		for(let i: number = 0; i < boardHeight; i++) {
			let rowString = "";
			for(let j: number = 0; j< boardWidth; j++) {
                if (this.tiles[i][j].empty) {
                    rowString += ".";
                } else {
                    rowString += "#";
                }
            }
            //console.log("row string is " + rowString);
            board.push(rowString);
        }
        return board;
    }

    populateBoard(testBoard: String[]) {
        testBoard.forEach((str, index) => {
            //console.log(str);
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
        if(fullRows === 4) {
            if(this.tetris) {
                this.score = this.score + 1200;
            } else {
                this.tetris = true;
                this.score = this.score + 800;
            }
        } else if (fullRows > 0) {
            this.tetris = false;
            this.score = this.score + 100*fullRows;
        }
        
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

    //clear the board
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	//draw all tiles
	ctx.lineWidth = 2;
    ctx.strokeStyle = 'lightgrey';
    for(let coord of board.coords()) {
        ctx.fillStyle = board.getTile(coord).colour;
		ctx.fillRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
		//ctx.strokeRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
    }

    console.log(board.gamePiece);
    //draw our game piece
	ctx.fillStyle = board.gamePiece.colour;
    for(let coord of board.gamePiece.absoluteCoords()) {
		ctx.fillRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
		ctx.strokeRect((coord.x)*tileSize,(coord.y)*tileSize, tileSize, tileSize);
    }

    //draw next Piece
    ctx.font = '24px serif';
    ctx.fillStyle = 'black';
    ctx.fillText('Next piece', nextCanvasX, nextCanvasY, nextTextWidth);
    //ctx.strokeText('Next piece', nextCanvasX, nextCanvasY, nextTextWidth);
    ctx.fillStyle = board.nextPiece.colour;
    ctx.strokeStyle = 'white';
    for(let coord of board.nextPiece.absoluteCoords()) {
		ctx.fillRect(nextCanvasX+(coord.x)*tileSize,nextCanvasY*2+(coord.y)*tileSize, tileSize, tileSize);
		ctx.strokeRect(nextCanvasX+(coord.x)*tileSize,nextCanvasY*2+(coord.y)*tileSize, tileSize, tileSize);
    }

    // draw score
    ctx.fillStyle = 'black';
    ctx.fillText('Score', nextCanvasX, nextCanvasY+100, nextTextWidth);
    ctx.fillText("" + board.score, nextCanvasX, nextCanvasY+150, nextTextWidth);
   


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
            board.gamePiece = board.gamePiece.rotate(Rotate.Counterclockwise);
            draw = true;
            console.log(board.gamePiece.shape);
			break;
		case "x":
            // Do something for "x"  key press. Rotate clockwise
            board.gamePiece = board.gamePiece.rotate(Rotate.Clockwise);
            draw = true;
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

        let newPiece = board.nextPiece;
        if(collision(board, newPiece)) {
            console.log("game over");
            gameOver();
        } else {
            board.gamePiece = newPiece;
            board.nextPiece = createGamePieceFromTetro();
        }

        return;
    } else {
        //if no collision
        //move down 1
        board.gamePiece = board.gamePiece.move(DOWN);
    }


}

function compareBoards(board1: String[], board2: String[]) : boolean {
    for(let i = 0; i < board1.length; i++) {
        if(board1[i] != board2[i]) {
            return false;
        }
    }
    return true;
}

function assert(bool : boolean) {
    if(!bool) {
        throw "test failed";
    }
}

function testRowClearing(board: Board) {
    let testBoard = [
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "##########",
        ".#.#.#....",
        "##########",
    ];
    board.populateBoard(testBoard);
    board.clearFullRows();
    let resultBoard = board.convertToString();

    assert(compareBoards(resultBoard, [
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        ".#.#.#....",
    ]));

    let testBoard2 = [
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "##########",
        "##########",
        "...#......",
        "##########",
        "##########",
        "##########",
        "..........",
        "###.######",
        ".#.#.#....",
        "##########",
    ];
    board.populateBoard(testBoard2);
    board.clearFullRows();
    let resultBoard2 = board.convertToString();
    //console.log(resultBoard2);
    assert(compareBoards(resultBoard2,[
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "..........",
        "...#......",
        "..........",
        "###.######",
        ".#.#.#....",
    ]));
    

}

function main() {
    const canvas: HTMLCanvasElement = document.querySelector('#board');
	const ctx = canvas.getContext('2d');
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

    let board = new Board();


    //testRowClearing(board);
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
