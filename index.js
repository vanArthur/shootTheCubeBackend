import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
import { Game } from "./Game.js";
import { Vec2 } from "./helperFunctions/vector.js";
import { randomId } from "./helperFunctions/randomId.js";

const port = 3000;

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let moves = {
  up: new Vec2(0, -5),
  down: new Vec2(0, 5),
  left: new Vec2(-5, 0),
  right: new Vec2(5, 0),
};

let games = {};

app.get("/createGame/:roomId", (req, res) => {
  games[req.params.roomId] = new Game(req.params.roomId, io);
  res.send(req.params.roomId);
});

io.on("connection", (socket) => {
  console.log("=> client connected", socket.handshake.address);

  let changeRoom = (roomId) => {
    if (games[roomId] !== undefined) {
      games[roomId].addPlayer(
        socket,
        moves,
        socket.handshake.address,
        changeRoom
      );
    }
  };

  matchMaking().addPlayer(socket, moves, socket.handshake.address, changeRoom);
});

server.listen(port, () => {
  console.log("listening on *:", port);
});

function matchMaking() {
  for (var roomId in games) {
    if (Object.keys(games[roomId].clients).length < 10) {
      return games[roomId];
    }
  }
  const randId = randomId();
  games[randId] = new Game(randId, io);
  return games[randId];
}
