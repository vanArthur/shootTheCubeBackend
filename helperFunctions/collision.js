export function cubeCollision(pos1, width1, height1, pos2, width2, height2) {
  if (
    pos1.x < pos2.x + width2 &&
    pos1.x + width1 > pos2.x &&
    pos1.y < pos2.y + height2 &&
    pos1.y + height1 > pos2.y
  ) {
    return true;
  }
  return false;
}
