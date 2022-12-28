export class Obj {
  t: number;
  priority: number;
  area: { x: number; y: number; w: number; h: number };

  render?(): void;
  update?(): void;
}
