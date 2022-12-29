import { Rectangle } from "../types";

export class Obj {
  t: number;
  priority: number; // Order to Render
  layer: number; // Layer Collision
  render?(): void;
  update?(): void;
  getArea?(): Rectangle;
}
