import { Rectangle } from "../helperFunctions/canvas.js";
import { Vec2 } from "../helperFunctions/vector.js";
import Entity from "./Entity.js";

export default class Wall extends Entity {
  constructor(id, pos, creator, color, roomIo, width, height) {
    super(id, pos, new Vec2(0, 0), new Rectangle(0, 0, width, height, color));

    this.shape[0].color = `${color.slice(0, -1)},1)`;

    this.health = 5;
    this.creator = creator;
    this.roomIo = roomIo;
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
      isNew: this.isNew,
      shape: this.shape,
    };
    this.isNew = false;
    return returndata;
  }

  getBorders() {
    const topLeft = new Vec2(this.pos.x, this.pos.y);
    const topRight = new Vec2(this.pos.x + this.shape[0].width, this.pos.y);
    const bottomLeft = new Vec2(this.pos.x, this.pos.y + this.shape[0].height);
    const bottomRight = new Vec2(
      this.pos.x + this.shape[0].width,
      this.pos.y + this.shape[0].height
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
