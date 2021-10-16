import { Vec2 } from "./helperFunctions/vector.js";

export class Ray {
  constructor(pos, vec) {
    this.pos = pos;
    this.dir = vec.normalize();
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  cast(wall) {
    const x1 = wall[0].x;
    const y1 = wall[0].y;
    const x2 = wall[1].x;
    const y2 = wall[1].y;
    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const point = new Vec2();
      point.x = x1 + t * (x2 - x1);
      point.y = y1 + t * (y2 - y1);
      return point;
    }
  }
}
