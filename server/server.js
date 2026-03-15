const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;

const rooms = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Create Room
  socket.on("createRoom", (name, callback) => {
    const roomId = generateRoomId();

    rooms[roomId] = {
      host: socket.id,
      players: [{ id: socket.id, name }],
      started: false,
    };

    socket.join(roomId);

    callback({
      roomId,
      players: rooms[roomId].players,
      host: socket.id,
    });

    console.log(`Room created: ${roomId}`);
  });

  // Join Room
  socket.on("joinRoom", ({ name, roomId }, callback) => {
    const room = rooms[roomId];

    if (!room) {
      return callback({ error: "Room does not exist" });
    }

    if (room.started) {
      return callback({ error: "Game already started" });
    }

    const player = {
      id: socket.id,
      name,
    };

    room.players.push(player);
    socket.join(roomId);

    io.to(roomId).emit("updateLobby", {
      players: room.players,
      host: room.host,
    });

    callback({
      roomId,
      players: room.players,
      host: room.host,
    });
  });

  // Start Game
  socket.on("startGame", (roomId) => {
    const room = rooms[roomId];

    if (!room) return;

    if (room.host !== socket.id) return;

    room.started = true;

    io.to(roomId).emit("gameStarted", room.players);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      const playerIndex = room.players.findIndex(
        (p) => p.id === socket.id
      );

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room deleted: ${roomId}`);
        } else {
          if (room.host === socket.id) {
            room.host = room.players[0].id;
          }

          io.to(roomId).emit("updateLobby", {
            players: room.players,
            host: room.host,
          });
        }

        break;
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Multiplayer Server Running");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});