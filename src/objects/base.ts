export class Base {
  t: number;
  texture: HTMLImageElement;
  x: number;
  y: number;
  x_: number;
  y_: number;
  isAlive: boolean;

  constructor() {}

  render?(): void;
  update?(): void;
}
