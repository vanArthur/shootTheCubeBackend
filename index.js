import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
import GameManager from "./GameManager.js";

const port = 3000;

const io = new Server(server, {
  cors: {
    origin: "*",
    allowedHeaders: "*",
  },
});

let gameManager = new GameManager(io);

app.get("/createGame/:roomId", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  gameManager.addGame(req.params.roomId);
  res.send(req.params.roomId);
});
app.get("/getGames", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const returnGames = gameManager.getGamesArray();
  res.send({ returnGames });
});

server.listen(port, () => {
  console.log("listening on *:", port);
});
