var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var router = require('./module/routing').routing;
const Room = require('./module/room');

var app = express();
const PORT = process.env.PORT || 3000;

function randomID(){
    var roomId = "";
    for(let i = 0; i<7; i++){
        roomId += String.fromCharCode(Math.floor(Math.random()*24) + 97);
    }
    return roomId;
}

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
var playerList = {};
var publicRoomList = {};

function makingStatus(my){
    let result = {}
    let other = {};
    for(let key of Object.keys(playerList)){
        if(my.nickname != playerList[key].nickname)
            other[playerList[key].nickname] = playerList[key];
    }
    result['me'] = my;
    result['others'] = other;
    result['bullet'] = publicRoomList[my.room].bulletList;
    result['room'] = my.room;
    return result;
}

io.on('connection', (socket)=>{
    console.log('[socket.io]: a user connected');
    socket.on('chatting', (message_node)=>{
        io.to(playerList[socket.id].room).emit('chat', message_node);
        console.log(`[socket.io]: ${message_node.nickname} send message:` + message_node.message);
    });

    socket.on('initial', (nickname)=>{
        let room;
        let idx = 0;
        let noRoom = true;
        for(let key of Object.keys(publicRoomList)){
            if(publicRoomList[key].maxPlayer >= Object.keys(publicRoomList[key].playerList).length+1){
                noRoom = false;
                break;
            }
            idx++;
        }
        
        if(noRoom){
            room = new Room(randomID(), true, 2);
            publicRoomList[room.id] = room;
            console.log("New Room made id:", room.id);
        }
        else{
            room = publicRoomList[Object.keys(publicRoomList)[idx]];
            console.log("Room join", room.id);
        }

        let player = {
            nickname: nickname,
            health: 100,
            x: Math.random()*10+room.mapCenter.x,
            y: Math.random()*10+room.mapCenter.y,
            color: `rgb(${Math.random()*256}, ${Math.random()*256}, ${Math.random()*256})`,
            underwater: false,
            survivtime: 100,
            room: room.id
        };

        let initialInfo = {
            gameStatus: makingStatus(player),
            seed: room.seed
        };

        room.joinUser(player, socket);
        socket.join(room.id);
        socket.emit('initialsetting', initialInfo);
        playerList[socket.id] = player;
        socketList[socket.id] = socket;
    });

    socket.on('input', (inputNode)=>{
        let room = publicRoomList[playerList[inputNode.socket].room];
        room.inputQueue.push(inputNode);
    });

    socket.on('shooting', (bulletInfo)=>{
        let room = publicRoomList[playerList[bulletInfo.socket].room];
        let bo = JSON.parse(bulletInfo.bullet);
        room.bulletList.push(bo);
    });

    socket.on('disconnect', ()=>{
        let room = publicRoomList[playerList[socket.id].room];
        room.exitUser(playerList[socket.id]);
    });
});

var port = 3000;

server.listen(port, function(){
    console.log('server is on!');
});