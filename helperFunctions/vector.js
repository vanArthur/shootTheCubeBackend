export class Vec2 {
  constructor(x, y) {
    this.set(x == undefined ? 0 : x, y == undefined ? 0 : y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
  add(vec2) {
    this.x += vec2.x;
    this.y += vec2.y;
  }
  subtract(vec2) {
    this.x -= vec2.x;
    this.y -= vec2.y;
  }

  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const magn = this.mag();
    this.x /= magn;
    this.y /= magn;
    return new Vec2(this.x, this.y);
  }

  fromAngle(angle, length) {
    if (length === undefined) {
      length = 1;
    }
    return new Vec2(length * Math.cos(angle), length * Math.sin(angle));
  }

  distance(vector) {
    return Math.sqrt((vector.x - this.x) ** 2 + (vector.y - this.y) ** 2);
  }
}
