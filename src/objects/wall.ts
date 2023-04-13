import { wallTexture } from "../common/textures";
import { CELL_SIZE, game } from "../configs/constants";
// import { drawCellWire, drawWire } from "../utils/common";
import { Obj } from "./object";

const WIDTH = 32;
const HEIGHT = 32;

export class Wall extends Obj {
  constructor(x: number, y: number) {
    super();
    this.set(x, y);
  }

  set(x: number, y: number) {
    this.x_ = x;
    this.y_ = y;
    this.x = x * CELL_SIZE - CELL_SIZE;
    this.y = y * CELL_SIZE - CELL_SIZE;
    this.texture = wallTexture;
  }

  update() {}

  render() {
    game.context.drawImage(this.texture, this.x, this.y);
    // drawCellWire(this.x_, this.y_);
    // const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
  }

  getArea() {
    return {
      x: this.x,
      y: this.y,
      w: WIDTH,
      h: HEIGHT,
    };
  }
}
