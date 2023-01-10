import { game } from "../configs/constants";
import { Obj } from "./object";

const DOTS_LENGTH = 24;

const dots = Array.from({ length: DOTS_LENGTH }).map((_, i) => i);

export class Explosion extends Obj {
  dots: { x: number; y: number; offsetX: number; offsetY: number; size: number }[];
  size: number;
  color: string;
  alive: boolean;

  constructor(x: number, y: number, size: number = 8, color: string = "#fd6b00") {
    super();
    this.t = 0;
    this.x = x;
    this.y = y;
    this.alive = true;
    const offsetAngle = Math.random();
    this.dots = dots.map((i) => {
      const angle = ((2 * Math.PI) / DOTS_LENGTH) * i + offsetAngle;
      const offsetRandom = (Math.random() * 0.4 + 0.6) * 2.6;
      const offsetX = Math.cos(angle) * offsetRandom;
      const offsetY = Math.sin(angle) * offsetRandom;
      const sizeRandom = (Math.random() * 0.5 + 0.5) * size;

      return { x: x + offsetX * 8, y: y + offsetY * 8, offsetX, offsetY, angle, size: sizeRandom };
    });
    this.size = size;
    this.color = color;
  }

  update() {
    let alive = false;
    this.dots.forEach((dot) => {
      dot.offsetX *= 1.01;
      dot.offsetY *= 1.01;
      dot.x += dot.offsetX;
      dot.y += dot.offsetY;
      dot.size *= 0.95;

      if (dot.size > 0.5) alive = true;
    });

    this.alive = alive;
  }

  render() {
    game.context.fillStyle = this.color;
    this.dots.forEach(({ x, y, size }) => {
      game.context.fillRect(x - size, y - size, size * 2, size * 2);
      // game.context.beginPath();
      // game.context.arc(x, y, size, 0, 2 * Math.PI, false);
      // game.context.fill();
    });
  }
}
