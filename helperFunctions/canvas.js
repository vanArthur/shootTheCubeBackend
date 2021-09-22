export function Rect(ctx, x, y, w, h, color, stroke) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h); // (x, y, width, height)
  if (stroke) {
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.strokeRect(x, y, w, h);
  }
}

export function circle(ctx, x, y, r, filltype) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI); //(x, y, radius, magic, path)
  if (filltype === "stroke") {
    ctx.stroke();
  } else if (filltype === "fill") {
    ctx.fill();
  } else {
    console.error("wrong fillType in circle function");
  }
}
