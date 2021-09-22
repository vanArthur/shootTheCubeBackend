import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
import { Game } from "./Game.js";
import { Vec2 } from "./helperFunctions/vector.js";

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
games["room1"] = new Game("room1", io);
games["room2"] = new Game("room2", io);

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

  games["room1"].addPlayer(socket, moves, socket.handshake.address, changeRoom);
});

server.listen(port, () => {
  console.log("listening on *:", port);
});
