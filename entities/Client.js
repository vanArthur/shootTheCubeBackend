import { Bullet } from "./Bullet.js";
import { Vec2 } from "../helperFunctions/vector.js";
import { randomId } from "../helperFunctions/randomId.js";
export default class Client {
  constructor(id, playerSize, pos, ip, moves, socket, roomIo, roomId) {
    this.id = id;
    this.playerSize = playerSize;
    this.pos = pos;
    this.ip = ip;
    this.socket = socket;
    this.roomIo = roomIo;
    this.moves = moves;
    this.roomId = roomId;
    this.color = `rgb(${Math.random() * 240 + 15}, ${
      Math.random() * 240 + 15
    }, ${Math.random() * 240 + 15})`;
    this.keyStates = {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
    };
    this.vel = new Vec2(0, 0);
    this.bullets = {};
    this.health = 10;

    this.addMe();
    this.socket.emit("id", this.id);
  }
  removeMe() {
    this.pos = new Vec2(0, 0);
    this.vel = new Vec2(0, 0);
    this.socket.off("keystroke", this.keyListener);
    this.socket.off("bullet", this.bulletListener);
    this.socket.off("clusterBullet", this.clusterBulletListener);
    this.socket.leave(this.roomId);
  }
  addMe() {
    this.socket.emit("roomId", this.roomId);

    this.keyListener = (direction) => {
      this.keyStroke(direction.direction, direction.keyState);
    };
    this.bulletListener = (vector) => {
      this.bullet(vector);
    };
    this.clusterBulletListener = () => {
      this.clusterBullet();
    };

    this.socket.on("bullet", this.bulletListener);
    this.socket.on("keystroke", this.keyListener);
    this.socket.on("clusterBullet", this.clusterBulletListener);
  }

  keyStroke(direction, keyState) {
    this.keyStates[direction] = keyState;

    if (!keyState) {
      this.vel.add(this.moves[direction]);
      this.direction = direction;
    } else if (keyState) {
      this.vel.subtract(this.moves[direction]);
    }
  }

  clusterBullet() {
    for (let key in this.moves) {
      this.bullet(this.moves[key], true);
    }
    this.bullet(new Vec2(-3, -3), true);
    this.bullet(new Vec2(3, 3), true);
    this.bullet(new Vec2(-3, 3), true);
    this.bullet(new Vec2(3, -3), true);
  }

  bullet(direction = this.moves[this.direction], isCluster = false) {
    const bullet = new Bullet(
      new Vec2(this.pos.x, this.pos.y),
      randomId(),
      this.id,
      new Vec2(direction.x * 3 * 1.5, direction.y * 3 * 1.5),
      this.playerSize
    );
    this.bullets[bullet.id] = bullet;
  }
  deleteBullet(id) {
    delete this.bullets[id];
  }

  reduceHealth(amount) {
    this.health -= amount;
    this.emitHealth();
  }
  increaseHealth(amount) {
    this.health += amount;
    this.emitHealth();
  }

  emitHealth() {
    this.roomIo.emit("PlayerHealth", { id: this.id, health: this.health });
  }

  update(gameClass) {
    if (this.vel.x !== 0 || this.vel.y !== 0) {
      this.roomIo.emit("playermove", { id: this.id, vel: this.vel });
      if (this !== undefined) {
        this.pos.add(this.vel);
      }
    }
    if (Object.keys(this.bullets).length > 0) {
      let shouldDelete = [];
      gameClass.sendNewBullets();
      for (var id in this.bullets) {
        if (this.bullets[id] !== undefined) {
          let bullet = this.bullets[id];
          this.roomIo.emit("bulletMove", { id: id, pos: bullet.pos });
          bullet.move();
          bullet.checkPlayerCollision(gameClass.clients);
          if (bullet.checkOutOfBounds()) {
            shouldDelete.push(id);
          }
        }
      }
      shouldDelete.forEach((id) => {
        this.deleteBullet(id);
        this.roomIo.emit("removeBullet", id);
      });
    }
  }
}
