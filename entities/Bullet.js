import { cubeCollision } from "../helperFunctions/collision.js";

export class Bullet {
  constructor(pos, id, shooterId, vel) {
    this.pos = pos;
    this.shooter = shooterId;
    this.id = id;
    this.vel = vel;
    this.shot = [];
    this.newBullet = true;
    this.size = 5;
  }

  move(gameClass) {
    this.pos.add(this.vel);
    this.newBullet = false;
    gameClass.roomIo.emit("bulletMove", { id: this.id, pos: this.pos });
  }
  deltaMove(delta) {
    this.pos.set(
      this.pos.x + this.vel.x * delta,
      this.pos.y + this.vel.y * delta
    );
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
    s;
  }
}
