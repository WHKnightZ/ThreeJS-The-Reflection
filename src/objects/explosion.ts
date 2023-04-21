import { game } from "../configs/constants";
import { Base } from "./base";

const dotsLength = {
  few: 12,
  many: 24,
};

const dots = {
  few: Array.from({ length: dotsLength.few }).map((_, i) => i),
  many: Array.from({ length: dotsLength.many }).map((_, i) => i),
};

export class Explosion extends Base {
  dots: { x: number; y: number; offsetX: number; offsetY: number; size: number }[];
  size: number;
  color: string;
  reduction: number;

  constructor(x: number, y: number, size: number = 8, color: string = "#fd6b00", count: "few" | "many" = "many", reduction = 0.95) {
    super();
    this.t = 0;
    this.x = x;
    this.y = y;
    this.isAlive = true;
    const offsetAngle = Math.random();
    this.dots = dots[count].map((i) => {
      const angle = ((2 * Math.PI) / dotsLength[count]) * i + offsetAngle;
      const offsetRandom = (Math.random() * 0.5 + 0.5) * 2.6;
      const offsetX = Math.cos(angle) * offsetRandom;
      const offsetY = Math.sin(angle) * offsetRandom;
      const sizeRandom = (Math.random() * 0.5 + 0.5) * size;

      return { x: x + offsetX * 8, y: y + offsetY * 8, offsetX, offsetY, angle, size: sizeRandom };
    });
    this.size = size;
    this.color = color;
    this.reduction = reduction;
  }

  update() {
    let isAlive = false;
    this.dots.forEach((dot) => {
      dot.offsetX *= 1.01;
      dot.offsetY *= 1.01;
      dot.x += dot.offsetX;
      dot.y += dot.offsetY;
      dot.size *= this.reduction;

      if (dot.size > 0.5) isAlive = true;
    });

    this.isAlive = isAlive;
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
