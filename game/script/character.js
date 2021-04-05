function toRadian(deg){
    return deg / 180 * Math.PI;
}

class Vector2{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    add(a){
        return new Vector2(this.x + a.x, this.y + a.y);
    }
    sub(a){
        return new Vector2(this.x - a.x, this.y - a.y);
    }
    mag(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    mult(s){
        return new Vector2(this.x * s, this.y * s);
    }
    rotate(rad){
        return new Vector2(this.x * Math.cos(rad) - this.y * Math.sin(rad), this.x * Math.sin(rad) + this.y * Math.cos(rad));
    }
    unit(){ // Return Unit Vector!
        return new Vector2(this.x/this.mag() , this.y/this.mag());
    }
}

class Player{
    constructor(x, y, nickname, color){
        this.pos = new Vector2(x, y);
        this.health = 100;
        this.nickname = nickname;
        this.color = color;
    }
    setPos(x, y){
        this.pos.x = x;
        this.pos.y = y;
    }
    setHealth(health){
        this.health = health;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, playerRadius, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, playerRadius+5, 0, Math.PI*2);
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "black";
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.nickname, this.pos.x, this.pos.y+playerRadius+25);
    }
}

class Bullet{
    constructor(x, y, dirx, diry, id){
        this.pos = new Vector2(x, y);
        this.owner = id;
        this.dir = new Vector2(dirx, diry);
        this.durationFrame = 0;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.arc(this.pos.x, this.pos.y, 1, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
    }
}
