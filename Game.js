import Client from "./Client.js";
import { Vec2 } from "./helperFunctions/vector.js";

export class Game {
  constructor(id, io) {
    this.id = id;
    this.clients = {};
    this.roomIo = io.to(this.id);
    this.startLoop();
  }

  startLoop() {
    const thisThis = this;
    this.loopInterval = setInterval(() => {
      for (var clientId in thisThis.clients) {
        const client = thisThis.clients[clientId];
        if (client !== undefined) {
          client.update(thisThis);
        }
      }
    }, 1000 / 30);
  }

  addPlayer(socket, moves, ip, changeRoom) {
    let client = new Client(
      socket.id,
      new Vec2(0, 0),
      ip,
      moves,
      socket,
      this.roomIo,
      this.id
    );
    this.clients[client.id] = client;
    this.clients[client.id].socket.join(this.id);
    this.sendCurrentPlayers();
    this.sendCurrentBullets();

    this.changeRoomListener = (roomId) => {
      this.removePlayer(client.id);
      this.sendCurrentPlayers();
      changeRoom(roomId);
    };
    this.disconnectListener = () => {
      console.log("=/ client disconnected", client.id, client.ip);
      this.removePlayer(client.id);
      this.sendCurrentPlayers();
    };

    this.clients[client.id].socket.on("changeRoom", this.changeRoomListener);
    this.clients[client.id].socket.on("disconnect", this.disconnectListener);
  }

  removePlayer(id) {
    if (this.clients[id] !== undefined) {
      this.clients[id].socket.off("changeRoom", this.changeRoomListener);
      this.clients[id].socket.off("disconnect", this.disconnectListener);
      this.clients[id].removeMe();
      delete this.clients[id];
    }
  }

  getPlayers() {
    let players = {};
    for (var id in this.clients) {
      players[id] = {
        id: this.clients[id].did,
        pos: this.clients[id].pos,
        color: this.clients[id].color,
        health: this.clients[id].health,
      };
    }
    return players;
  }

  getBullets() {
    let bullets = {};
    for (var id in this.clients) {
      for (var key in this.clients[id].bullets) {
        bullets[key] = this.clients[id].bullets[key];
      }
    }
    return bullets;
  }
  getNewBullets() {
    const bullets = this.getBullets();
    let returnBullets = {};
    for (key in bullets) {
      if (bullets[key].newBullet) {
        returnBullets[key] = bullets[key];
      }
    }
    return returnBullets;
  }

  sendCurrentPlayers() {
    this.roomIo.emit("currentPlayers", this.getPlayers());
  }
  sendCurrentBullets() {
    this.roomIo.emit("currentBullets", this.getBullets());
  }
  sendNewBullets() {
    this.roomIo.emit("newBullets", getNewBullets());
  }
}
