import { game } from "../configs/constants";
import { Obj } from "./object";

export class Particle extends Obj {
  size: number;
  color: string;

  constructor(x: number, y: number, size: number = 3, color: string = "#fac66d") {
    super();
    this.t = 0;
    this.x = x;
    this.y = y;
    this.isAlive = true;
    this.size = size;
    this.color = color;
  }

  update() {
    this.t += 1;
    this.isAlive = this.t <= 15;
  }

  render() {
    game.context.fillStyle = this.color;
    game.context.beginPath();
    game.context.arc(this.x, this.y, this.size * Math.sin(this.t / 5), 0, 2 * Math.PI, false);
    game.context.fill();
  }
}
