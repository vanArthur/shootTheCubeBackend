import { Bullet } from "./Bullet.js";
import { Vec2 } from "../helperFunctions/vector.js";
import { randomId } from "../helperFunctions/randomId.js";
import Entity from "./Entity.js";
import Wall from "./Wall.js";
import { Rectangle, Text } from "../helperFunctions/canvas.js";
import { cubeCollision } from "../helperFunctions/collision.js";

export default class Client extends Entity {
  constructor(id, playerSize, pos, ip, moves, socket, roomIo, roomId) {
    super(id, pos, new Vec2(0, 0), [
      new Rectangle(
        0,
        0,
        playerSize,
        playerSize,
        `rgb(${Math.random() * 240 + 15}, ${Math.random() * 240 + 15}, ${
          Math.random() * 240 + 15
        })`
      ),
      new Text(playerSize / 2, -10, "white", 10, "20px", "Arial"),
    ]);
    this.playerSize = playerSize;
    this.ip = ip;
    this.socket = socket;
    this.roomIo = roomIo;
    this.moves = moves;
    this.roomId = roomId;
    this.keyStates = {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
    };
    this.bullets = {};
    this.walls = {};
    this.health = 10;

    this.addMe();
    this.socket.emit("id", this.id);
  }
  removeMe() {
    this.reset();
    this.socket.off("keystroke", this.keyListener);
    this.socket.off("bullet", this.bulletListener);
    this.socket.off("clusterBullet", this.clusterBulletListener);
    this.socket.off("wall", this.wallListener);
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
    this.wallListener = (vec) => {
      this.wall(vec);
    };

    this.socket.on("bullet", this.bulletListener);
    this.socket.on("keystroke", this.keyListener);
    this.socket.on("clusterBullet", this.clusterBulletListener);
    this.socket.on("wall", this.wallListener);
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
    let bulletVec = new Vec2(direction.x, direction.y);
    bulletVec.normalize();

    const bullet = new Bullet(
      new Vec2(
        this.pos.x + this.playerSize / 2,
        this.pos.y + this.playerSize / 2
      ),
      randomId(),
      this.id,
      new Vec2(bulletVec.x * 10, bulletVec.y * 10)
    );
    this.bullets[bullet.id] = bullet;
  }
  wall(vecInput) {
    let wallvec = new Vec2(Math.round(vecInput.x), Math.round(vecInput.y));
    let wallpos = new Vec2(this.pos.x, this.pos.y);
    let width = 0;
    let height = 0;

    if (wallvec.x === 0) {
      width = this.playerSize + this.playerSize / 2;
      height = this.playerSize < 10 ? 5 : this.playerSize / 5;
      if (wallvec.y > 0) {
        wallpos.add(
          new Vec2(-this.playerSize / 4, this.playerSize + this.playerSize / 4)
        );
      } else {
        wallpos.add(
          new Vec2(-this.playerSize / 4, -this.playerSize / 4 - height)
        );
      }
    } else {
      height = this.playerSize + this.playerSize / 2;
      width = this.playerSize < 10 ? 5 : this.playerSize / 5;
      if (wallvec.x > 0) {
        wallpos.add(
          new Vec2(this.playerSize + this.playerSize / 4, -this.playerSize / 4)
        );
      } else {
        wallpos.add(
          new Vec2(-this.playerSize / 4 - width, -this.playerSize / 4)
        );
      }
    }
    const wall = new Wall(
      randomId(),
      wallpos,
      this.id,
      this.shape[0].color,
      this.roomIo,
      width,
      height
    );
    this.walls[wall.id] = wall;
  }

  deleteBullet(id) {
    delete this.bullets[id];
  }

  reduceHealth(amount) {
    this.health -= amount;
    this.shape[1].text = this.health;
    this.emitHealth();
  }
  increaseHealth(amount) {
    this.health += amount;
    this.shape[1].text = this.health;
    this.emitHealth();
  }

  emitHealth() {
    this.roomIo.emit("PlayerHealth", { id: this.id, health: this.health });
  }

  checkWallColision() {
    for (var id in this.walls) {
      const wall = this.walls[id];
      const dist = Math.sqrt(
        (wall.pos.x - this.pos.x) ** 2 + (wall.pos.y - this.pos.y) ** 2
      );

      if (dist < this.playerSize + 20) {
        if (
          cubeCollision(
            new Vec2(this.pos.x, this.pos.y).add(this.vel),
            this.playerSize,
            this.playerSize,
            wall.pos,
            wall.shape[0].width,
            wall.shape[0].height
          ) ||
          cubeCollision(
            new Vec2(this.pos.x, this.pos.y).add(
              new Vec2(this.vel.x, this.vel.y).normalize()
            ),
            this.playerSize,
            this.playerSize,
            wall.pos,
            wall.shape[0].width,
            wall.shape[0].height
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  update(gameClass) {
    if (this.vel.x !== 0 || this.vel.y !== 0) {
      if (this !== undefined) {
        if (!this.checkWallColision()) {
          this.roomIo.emit("playermove", { id: this.id, vel: this.vel });
          this.move();
        }
      }
    }
    if (Object.keys(this.walls).length > 0) {
      gameClass.sendNewWalls();
      for (var id in this.walls) {
        if (this.walls[id] !== undefined) {
          if (this.walls[id].shouldDelete) {
            delete this.walls[id];
          }
        }
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
