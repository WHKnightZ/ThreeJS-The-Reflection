import { game } from "../configs/constants";
import { Obj } from "./object";

const dots = Array.from({ length: 40 }).map((_, i) => i);

export class Explosion extends Obj {
  dots: { x: number; y: number; size: number; angle: number }[];
  size: number;
  color: string;

  constructor(x: number, y: number, size: number, color: string) {
    super();
    this.t = 0;
    this.x = x;
    this.y = y;
    this.dots = dots.map((i) => ({ x: x, y: y, angle: ((2 * Math.PI) / 40) * i, size: (Math.random() * 0.3 + 0.7) * size }));
    this.size = size;
    this.color = color;
  }

  update() {
    this.t += 1;
  }

  render() {
    game.context.fillStyle = this.color;
    this.dots.forEach(({ x, y, size, angle }) => {
      game.context.resetTransform();
      game.context.translate(this.x, this.y);
    //   game.context.rotate(angle);
    //   game.context.translate(this.t * 0.001, 0);
      game.context.fillRect(x - size, y - size, size * 2, size * 2);
    });
    game.context.resetTransform();
  }
}
