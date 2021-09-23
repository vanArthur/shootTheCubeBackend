import { Bullet } from "./Bullet.js";
import { Vec2 } from "./helperFunctions/vector.js";
import { randomId } from "./helperFunctions/randomId.js";
export default class Client {
  constructor(id, pos, ip, moves, socket, roomIo, roomId) {
    this.id = id;
    this.pos = pos;
    this.direction = "";
    this.ip = ip;
    this.socket = socket;
    this.roomIo = roomIo;
    this.moves = moves;
    this.socket.emit("id", this.id);
    this.roomId = roomId;
    this.isRemoved = false;
    this.addMe();
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
  }
  removeMe() {
    this.socket.off("keystroke", this.keyListener);
    this.socket.off("bullet", this.bulletListener);
    this.socket.off("clusterBullet", this.clusterBulletListener);
    this.socket.leave(this.roomId);
    //this.isRemoved = true;
  }
  addMe() {
    this.socket.emit("roomId", this.roomId);

    this.keyListener = (direction) => {
      if (!this.isRemoved) {
        this.keyStroke(direction.direction, direction.keyState);
      }
    };
    this.socket.on("keystroke", this.keyListener);

    this.bulletListener = () => {
      if (!this.isRemoved) {
        this.bullet();
      }
    };
    this.socket.on("bullet", this.bulletListener);

    this.clusterBulletListener = () => {
      if (!this.isRemoved) {
        this.clusterBullet();
      }
    };
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
      (this.vel.x !== 0 || this.vel.y !== 0) && !isCluster
        ? new Vec2(this.vel.x * 1.5, this.vel.y * 1.5)
        : new Vec2(direction.x * 1.5, direction.y * 1.5)
    );
    this.bullets[bullet.id] = bullet;
  }
  deleteBullet(id) {
    delete this.bullets[id];
  }
}
