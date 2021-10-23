class Shape {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}
export class Rectangle extends Shape {
  constructor(x, y, width, height, color) {
    super(x, y, color);
    this.width = width;
    this.height = height;
    this.color = color;
    this.shapeName = "Rectangle";
  }
}
export class Circle extends Shape {
  constructor(x, y, radius, stroke, color) {
    super(x, y, color);
    this.radius = radius;
    this.stroke = stroke;
    this.shapeName = "Circle";
  }
}

export class Line extends Shape {
  constructor(x, y, tx, ty, color) {
    super(x, y, color);
    this.tx = tx;
    this.ty = ty;
    this.width = 3;
    this.shapeName = "Line";
  }
}

export class Text extends Shape {
  constructor(x, y, color, text, size, font) {
    super(x, y, color);
    this.text = text;
    this.size = size;
    this.font = font;
    this.shapeName = "Text";
  }
}
