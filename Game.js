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
          if (client.vel.x !== 0 || client.vel.y !== 0) {
            const vel = client.vel;
            thisThis.roomIo.emit("playermove", { id: clientId, vel: vel });
            if (thisThis.clients[clientId] !== undefined) {
              client.pos.add(vel);
            }
          }
          if (Object.keys(client.bullets).length > 0) {
            let shouldDelete = [];
            this.sendCurrentBullets(); // should only send new bullets!
            for (var id in client.bullets) {
              if (client.bullets[id] !== undefined) {
                let bullet = client.bullets[id];
                this.roomIo.emit("bulletMove", { id: id, pos: bullet.pos });
                bullet.move();
                if (bullet.checkOutOfBounds()) {
                  shouldDelete.push(id);
                }
              }
            }
            shouldDelete.forEach((id) => {
              client.deleteBullet(id);
              this.roomIo.emit("removeBullet", id);
            });
          }
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

  sendCurrentPlayers() {
    this.roomIo.emit("currentPlayers", this.getPlayers());
  }
  sendCurrentBullets() {
    this.roomIo.emit("currentBullets", this.getBullets());
  }
}
