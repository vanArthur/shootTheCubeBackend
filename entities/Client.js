import { Bullet } from "./Bullet.js";
import { Vec2 } from "../helperFunctions/vector.js";
import { randomId } from "../helperFunctions/randomId.js";
import Entity from "./Entity.js";
export default class Client extends Entity {
  constructor(id, playerSize, pos, ip, moves, socket, roomIo, roomId) {
    super(id, pos, new Vec2(0, 0));
    this.playerSize = playerSize;
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
    this.bullets = {};
    this.health = 10;

    this.addMe();
    this.socket.emit("id", this.id);
  }
  removeMe() {
    this.reset();
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
      this.bullet(new Vec2(this.moves[key].x / 3, this.moves[key].y / 3), true);
    }
    this.bullet(new Vec2(-1, -1), true);
    this.bullet(new Vec2(1, 1), true);
    this.bullet(new Vec2(-1, 1), true);
    this.bullet(new Vec2(1, -1), true);
  }

  bullet(direction = this.moves[this.direction], isCluster = false) {
    const bullet = new Bullet(
      new Vec2(
        this.pos.x + this.playerSize / 2,
        this.pos.y + this.playerSize / 2
      ),
      randomId(),
      this.id,
      new Vec2(direction.x * 3 * 1.5, direction.y * 3 * 1.5)
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
        this.move();
      }
    }
    if (Object.keys(this.bullets).length > 0) {
      let shouldDelete = [];
      gameClass.sendNewBullets();
      for (var id in this.bullets) {
        if (this.bullets[id] !== undefined) {
          let bullet = this.bullets[id];
          if (bullet.update(gameClass)) {
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
