var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var router = require('./module/routing').routing;

var app = express();
const PORT = process.env.PORT || 3000;

app.set('views', __dirname+'/game/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('port', PORT);
app.use(static(__dirname+'/game'));
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));
app.use('/', router);

var server = http.createServer(app);
var io = require('socket.io')(server);

var socketList = {};
var bulletList = [];
var playerList = {};
var inputQueue = {};

var intervalID;
const FRAME_RATE = 32;
const velocity = 5;
const bulletVelocity = 3;

function processInput(){
    for(let key of Object.keys(playerList)){
        if(inputQueue[key].length != 0){
            let player = playerList[key];
            let Code = inputQueue[key].shift();
            if(Code == 37 || Code == 38 || Code == 39 || Code == 40 || Code == 65 || Code == 87 || Code == 68 || Code == 83){
                let pos;
                switch(Code){
                    case 37:
                    case 65:
                        pos = {
                            x: player.x - velocity,
                            y: player.y
                        };
                    break;
                    case 38:
                    case 87:
                    
                        pos = {
                            x: player.x,
                            y: player.y - velocity
                        };
                    break;
                    case 39:
                    case 68:
                        pos = {
                            x: player.x + velocity,
                            y: player.y
                        };
                    break;
                    case 40:
                    case 83:
                        pos = {
                            x: player.x,
                            y: player.y + velocity
                        };
                    break;
                }
            player.x = pos.x;
            player.y = pos.y;
            }
        }
    }
}

function processBullet(){
    for(let index = 0; index < bulletList.length; index++){
        let bullet = bulletList[index];
        bullet.durationFrame++;
        bullet.pos.x += bullet.dir.x * bulletVelocity;
        bullet.pos.y += bullet.dir.y * bulletVelocity;
        if(bullet.durationFrame == FRAME_RATE * 5){
            bulletList.splice(index, 1);
            index--;
        }
    }
}

function processCollide(){
    for(let index = 0; index < bulletList.length; index++){
        let bullet = bulletList[index];
        for(let key of Object.keys(playerList)){
            let player = playerList[key];
            if(player.nickname != bullet.owner){
                let distance = Math.sqrt((player.x - bullet.pos.x) * (player.x - bullet.pos.x) + (player.y - bullet.pos.y) * (player.y - bullet.pos.y));
                if(distance <= 16){
                    console.log(`Collision Detected @${player.nickname}`);
                    player.health -= Math.ceil(Math.random() * 5);
                    bulletList.splice(index, 1);
                    index--;
                }
            }
        }
    }
}

function GameLoop(){
    processInput();
    processBullet();
    processCollide();
    for(let key of Object.keys(playerList)){
        socketList[key].emit('update', makingStatus(playerList[key]));
    }
}

function startGameLoop(){
    console.log("Start Game Loop...");
    intervalID = setInterval(()=>{
        //console.log("Game Looping!");
        GameLoop();
    }, 1000 / FRAME_RATE);
}

function stopGameLoop(){
    console.log("Stop Game Loop...");
    clearInterval(intervalID);
}

function makingStatus(status){
    var result = {}
    var ck = {};
    result['me'] = status;
    for(let key of Object.keys(playerList)){
        if(status.nickname != playerList[key].nickname)
            ck[playerList[key].nickname] = playerList[key];
    }
    result['other'] = ck;
    result['bullet'] = bulletList;
    return result;
}

io.on('connection', (socket)=>{

    console.log('[socket.io]: a user connected');

    if(Object.keys(playerList).length == 0){
        startGameLoop();
    }

    socket.on('chatting', (message_node)=>{
        io.emit('chat', message_node);
        console.log(`[socket.io]: ${message_node.nickname} send message:` + message_node.message);
    });

    socket.on('initial', (nickname)=>{
        let status = {
            nickname: nickname,
            health: 100,
            x: Math.random()*250,
            y: Math.random()*250,
            color: `rgb(${Math.random()*256}, ${Math.random()*256}, ${Math.random()*256})`,
        };
        socket.emit('initialsetting', makingStatus(status));
        playerList[socket.id] =  status;
        socketList[socket.id] =  socket;
        inputQueue[socket.id] = [];
    });

    socket.on('moving', (keyCode)=>{
        inputQueue[socket.id].push(keyCode);
    });

    socket.on('shooting', (bullet)=>{
        let bo = JSON.parse(bullet);
        bulletList.push(bo);
    });

    socket.on('disconnect', ()=>{
        let info = playerList[socket.id];
        console.log('[socket.io]: user disconnected');
        delete playerList[socket.id];
        delete socketList[socket.id];
        if(Object.keys(playerList).length == 0){
            stopGameLoop();
        }
    });
});

var port = 3000;

server.listen(port, function(){
    console.log('server is on!');
});