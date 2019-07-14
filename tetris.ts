




let canvas = document.getElementById("canvas");
let context = null;

function drawBoard(context){
    let boxW = 490;
    let bowH = 690;
    let pad = 5;
    for (let x = 0; x <= boxW; x += 50) {
        context.moveTo(0.5 + x + pad, pad);
        context.lineTo(0.5 + x + pad, bowH + pad);
    }

    for (let x = 0; x <= bowH; x += 50) {
        context.moveTo(pad, 0.5 + x + pad);
        context.lineTo(boxW + pad, 0.5 + x + pad);
    }
    context.strokeStyle = "black";
    context.stroke();
}

function init() {
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    console.log(context);
    drawBoard(context);
}

window.onload = init;

//drawBoard();