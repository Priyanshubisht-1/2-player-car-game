// Replace this with your Render server URL after deployment
const SERVER_URL = "https://multiplayer-game-smr5.onrender.com";

// Create socket connection
const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

// Connection successful
socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

// Connection error
socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});et.on("reconnectPlayer", ({name, roomId}) => {

const room = rooms[roomId];

if(!room) return;

const player = room.players.find(p => p.name === name);

if(player){
player.id = socket.id;
socket.join(roomId);

io.to(roomId).emit("updateLobby",{
players: room.players,
host: room.host
});
}

});
