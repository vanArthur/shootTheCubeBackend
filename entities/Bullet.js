import { cubeCollision } from "../helperFunctions/collision.js";
import Entity from "./Entity.js";

export class Bullet extends Entity {
  constructor(pos, id, shooterId, vel) {
    super(pos, vel);
    this.shooter = shooterId;
    this.id = id;
    this.shot = [];
    this.newBullet = true;
    this.size = 5;
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

  update(gameClass) {
    let shouldDelete = false;
    this.move(gameClass);
    if (
      this.checkOutOfBounds() ||
      this.checkPlayerCollision(gameClass.clients)
    ) {
      shouldDelete = true;
    }
    return shouldDelete;
  }
}
