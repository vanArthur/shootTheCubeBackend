import { Vec2 } from "../helperFunctions/vector.js";
import Entity from "./Entity.js";

export default class Wall extends Entity {
  constructor(id, pos, creator, color, roomIo, width, height) {
    super(id, pos, new Vec2(0, 0));
    this.health = 5;
    this.creator = creator;
    this.color = color;
    this.roomIo = roomIo;
    this.width = width;
    this.height = height;
    this.isNew = true;
    this.shouldDelete = false;
    this.borders = this.getBorders();
  }

  reduceHealth() {
    this.health -= 1;
    if (this.health <= 0) {
      this.shouldDelete = true;
    }
    this.emitHealth();
  }

  emitHealth() {
    this.roomIo.emit("WallHealth", { id: this.id, health: this.health });
  }

  getSelf() {
    let returndata = {
      id: this.id,
      pos: this.pos,
      health: this.health,
      color: this.color,
      isNew: this.isNew,
      width: this.width,
      height: this.height,
    };
    this.isNew = false;
    return returndata;
  }

  getBorders() {
    const topLeft = new Vec2(this.pos.x, this.pos.y);
    const topRight = new Vec2(this.pos.x + this.width, this.pos.y);
    const bottomLeft = new Vec2(this.pos.x, this.pos.y + this.height);
    const bottomRight = new Vec2(
      this.pos.x + this.width,
      this.pos.y + this.height
    );
    const borders = [
      [topLeft, topRight],
      [topRight, bottomRight],
      [bottomRight, bottomLeft],
      [bottomLeft, topLeft],
    ];

    return borders;
  }
}
