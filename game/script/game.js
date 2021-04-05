var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var inputedKey = null;

canvas.width = 960;
canvas.height = 512;

playerRadius = 15;

function drawBG(){
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

document.body.addEventListener('keydown', (e)=>{
    inputedKey = e.key;
})

function update(){
    if(inputedKey != null){
        console.log(inputedKey);
        inputedKey = null;
    }
    setTimeout(update, 64/1000);
}

//update();

