const FRAME_RATE = 32;
const velocity = 5;
const bulletVelocity = 3;

class Room{
   constructor(id, ispublic, maxPlayer){
        this.id = id;
        this.maxPlayer = maxPlayer;
        this.ispublic = ispublic;
        this.flowframe = 1;

        this.mapCenter = {
            x: 53521 + Math.random()*1200,
            y: 53521 + Math.random()*1200
        };
        this.mapRadius = 750;
        this.seed = Math.random() * 10000;

        this.playerList = {};
        this.socketList = {};
        this.intervalID;

        this.bulletList = [];
        this.inputQueue = [];
    }
    joinUser(user, socket){
        this.playerList[user.nickname] = user;
        this.socketList[user.nickname] = socket;
        if(Object.keys(this.playerList).length == 1){
            this.startGameLoop();
        }
    }
    exitUser(user){
        delete this.playerList[user.nickname];
        delete this.socketList[user.nickname];
        if(Object.keys(this.playerList).length == 0){
            this.stopGameLoop();
            this.flowframe = 1;
        }
    }
    startGameLoop(){
        console.log(`Start Game Loop... @${this.id}`);
        this.intervalID = setInterval(()=>{
            this.GameLoop();
        }, 1000 / FRAME_RATE);
    }
    stopGameLoop(){
        console.log(`Stop Game Loop...@${this.id}`);
        clearInterval(this.intervalID);
    }
    GameLoop(){
        if(this.flowframe % (FRAME_RATE * 5) == 0 && this.mapRadius > 50){
            this.mapRadius -= 50;
        }
        for(let key of Object.keys(this.playerList)){
            let player = this.playerList[key];
            let distance = Math.sqrt((player.x - this.mapCenter.x) * (player.x - this.mapCenter.x) + (player.y - this.mapCenter.y) * (player.y - this.mapCenter.y));
            if(player.underwater && player.survivtime > 0){
                player.survivtime -= 0.5;
            }
            else if(player.survivtime < 100)
                player.survivtime += 0.2;
            if(player.survivtime < 0 || distance > this.mapRadius)
                player.health -= 0.3
        }
        this.processInput();
        this.processBullet();
        this.processCollide();
        for(let key of Object.keys(this.playerList)){
            this.socketList[key].emit('update', this.makingStatus(this.playerList[key]));
        }
        this.flowframe++;
    }
    processInput(){
        for(let inputNode of this.inputQueue){
            let player = this.playerList[inputNode.player];
            let Code = inputNode.code;
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
            else if(Code == 32){
                player.underwater = !player.underwater;
            }
        }
        this.inputQueue = [];
    }
    processBullet(){
        for(let index = 0; index < this.bulletList.length; index++){
            let bullet = this.bulletList[index];
            bullet.durationFrame++;
            bullet.pos.x += bullet.dir.x * bulletVelocity;
            bullet.pos.y += bullet.dir.y * bulletVelocity;
            if(bullet.durationFrame == FRAME_RATE * 5){
                this.bulletList.splice(index, 1);
                index--;
            }
        }
    }
    processCollide(){
        for(let index = 0; index < this.bulletList.length; index++){
            let bullet = this.bulletList[index];
            for(let key of Object.keys(this.playerList)){
                let player = this.playerList[key];
                if(player.nickname != bullet.owner){
                    let distance = Math.sqrt((player.x - bullet.pos.x) * (player.x - bullet.pos.x) + (player.y - bullet.pos.y) * (player.y - bullet.pos.y));
                    if(distance <= 16){
                        console.log(`Collision Detected @${player.nickname}`);
                        player.health -= Math.ceil(Math.random() * 5);
                        this.bulletList.splice(index, 1);
                        index--;
                    }
                }
            }
        }
    }
    makingStatus(my){
        let result = {}
        let other = {};
        for(let key of Object.keys(this.playerList)){
            if(my.nickname != this.playerList[key].nickname)
                other[key] = this.playerList[key];
        }
        result['me'] = my;
        result['others'] = other;
        result['bullet'] = this.bulletList;
        result['room'] = my.room;
        result['center'] = this.mapCenter;
        result['radius'] = this.mapRadius;
        return result;
    }
}

module.exports = Room;