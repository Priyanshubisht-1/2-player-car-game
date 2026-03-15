const roomId = localStorage.getItem("roomId");
const name = localStorage.getItem("playerName");

const roomText = document.getElementById("roomText");
roomText.textContent = "Room: " + roomId;

let players = {};

const config = {
type: Phaser.AUTO,
width: 800,
height: 500,
parent: "gameArea",
backgroundColor: "#1e1e1e",
scene: {
preload,
create,
update
}
};

const game = new Phaser.Game(config);

function preload(){}

function create(){

this.cursors = this.input.keyboard.createCursorKeys();

socket.on("gameStarted",(serverPlayers)=>{

serverPlayers.forEach(p=>{

players[p.id] = this.add.rectangle(
Math.random()*700+50,
Math.random()*400+50,
40,
40,
0x00ff00
);

if(p.id === socket.id){
players[p.id].fillColor = 0x0088ff;
}

});

});

socket.on("playerMoved",(data)=>{

if(players[data.id]){
players[data.id].x = data.x;
players[data.id].y = data.y;
}

});

}

function update(){

const player = players[socket.id];

if(!player) return;

let moved = false;

if(this.cursors.left.isDown){
player.x -= 3;
moved = true;
}

if(this.cursors.right.isDown){
player.x += 3;
moved = true;
}

if(this.cursors.up.isDown){
player.y -= 3;
moved = true;
}

if(this.cursors.down.isDown){
player.y += 3;
moved = true;
}

if(moved){

socket.emit("playerMove",{
roomId,
x: player.x,
y: player.y
});

}

}e",{
roomId,
x: player.x,
y: player.y
});

}

}