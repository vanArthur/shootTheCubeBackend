export class Bullet {
  constructor(pos, id, shooterId, vel) {
    this.pos = pos;
    this.shooter = shooterId;
    this.id = id;
    this.vel = vel;
  }

  move() {
    this.pos.add(this.vel);
  }
  deltaMove(delta) {
    this.pos.set(
      this.pos.x + this.vel.x * delta,
      this.pos.y + this.vel.y * delta
    );
  }
}
