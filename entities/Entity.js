import { Vec2 } from "../helperFunctions/vector.js";

export default class Entity {
  constructor(id, pos, vel) {
    this.pos = pos;
    this.vel = vel;
    this.id = id;
  }

  move() {
    this.pos.add(this.vel);
  }

  setVel(vel) {
    this.vel = vel;
  }

  reset() {
    this.pos = new Vec2(0, 0);
    this.vel = new Vec2(0, 0);
  }
}
