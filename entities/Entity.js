import { Vec2 } from "../helperFunctions/vector.js";

export default class Entity {
  constructor(id, pos, vel, shape) {
    this.pos = new Vec2(pos.x, pos.y);
    this.vel = new Vec2(vel.x, vel.y);
    this.id = id;
    if (Array.isArray(shape)) {
      this.shape = shape;
    } else {
      this.shape = [shape];
    }
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
