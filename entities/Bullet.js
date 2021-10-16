import { cubeCollision } from "../helperFunctions/collision.js";
import { Vec2 } from "../helperFunctions/vector.js";
import { Ray } from "../Ray.js";
import Entity from "./Entity.js";

export class Bullet extends Entity {
  constructor(pos, id, shooterId, vel) {
    super(id, pos, vel);
    this.shooter = shooterId;
    this.id = id;
    this.shot = [];
    this.newBullet = true;
    this.size = 5;
    this.closestWall;
    this.closestWallPos;
    this.lastDist;
  }

  move(gameClass) {
    super.move();
    this.newBullet = false;
    gameClass.roomIo.emit("bulletMove", { id: this.id, pos: this.pos });
  }

  checkOutOfBounds() {
    return (
      this.pos.x > 1500 || this.pos.x < 0 || this.pos.y < 0 || this.pos.y > 1000
    );
  }

  checkPlayerCollision(players) {
    for (var playerId in players) {
      if (!this.shot.includes(playerId)) {
        const player = players[playerId];
        if (
          cubeCollision(
            this.pos,
            this.size,
            this.size,
            player.pos,
            player.playerSize,
            player.playerSize
          )
        ) {
          if (playerId !== this.shooter) {
            player.reduceHealth(1);
            this.shot.push(playerId);
            return true;
          }
        }
      }
    }
    return false;
  }
  checkWallCollision(walls) {
    let closestDist;
    let newVec = new Vec2(this.vel.x, this.vel.y);
    let ray = new Ray(new Vec2(this.pos.x, this.pos.y), newVec);
    for (var id in walls) {
      walls[id].borders.forEach((line) => {
        let cast = ray.cast(line);

        if (cast !== undefined) {
          if (this.closestWallPos == undefined) {
            this.closestWallPos = cast;
            this.closestWall = walls[id];
            closestDist = Math.sqrt(
              (cast.x - this.pos.x) ** 2 + (cast.y - this.pos.y) ** 2
            );
          } else {
            const dist = Math.sqrt(
              (cast.x - this.pos.x) ** 2 + (cast.y - this.pos.y) ** 2
            );
            if (dist < closestDist) {
              closestDist = dist;
              this.closestWallPos = cast;
              this.closestWall = walls[id];
            }
          }
        }
      });
    }
    return this.isPast();
  }
  isPast() {
    if (this.closestWallPos == undefined || this.closestWall.health <= 0) {
      this.closestWallPos = undefined;
      this.closestWall = undefined;
      this.lastDist = undefined;
      return false;
    }
    if (this.lastDist == undefined) {
      this.lastDist = this.pos.distance(this.closestWallPos);
      return false;
    }
    let nowDist = this.pos.distance(this.closestWallPos);
    if (this.lastDist < nowDist) {
      this.closestWall.reduceHealth();
      return true;
    }
    this.lastDist = nowDist;
    return false;
  }

  update(gameClass) {
    let shouldDelete = false;
    this.move(gameClass);

    if (
      this.checkOutOfBounds() ||
      this.checkPlayerCollision(gameClass.clients) ||
      this.checkWallCollision(gameClass.getWalls(true))
    ) {
      shouldDelete = true;
    }
    return shouldDelete;
  }

  getSelf() {
    return {
      id: this.id,
      pos: this.pos,
      vel: this.vel,
      size: this.size,
    };
  }
}
