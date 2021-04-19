var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var inputedKey = null;

canvas.width = 960;
canvas.height = 512;

playerRadius = 15;

function drawBG(){
    ctx.save();
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}
