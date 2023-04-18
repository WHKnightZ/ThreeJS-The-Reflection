import { wallTexture } from "../common/textures";
import { CELL_SIZE, game } from "../configs/constants";
import { checkIsReflected, drawCellWire, drawWire } from "../utils/common";
import { Obj } from "./object";

export class Wall extends Obj {
  isReflected: boolean;

  constructor(x: number, y: number) {
    super();
    this.set(x, y);
    this.isReflected = !!checkIsReflected(y);
  }

  setIsReflected(_isReflected: boolean) {
    this.isReflected = _isReflected;
  }

  set(x: number, y: number) {
    this.x_ = x;
    this.y_ = y;
    this.texture = wallTexture;
    this.x = x * CELL_SIZE;
    this.y = y * CELL_SIZE - this.texture.height;
  }

  update() {}

  render() {
    game.context.drawImage(this.texture, this.x, this.y + (this.isReflected ? this.texture.height + CELL_SIZE : 0));
    // drawCellWire(this.x_, this.y_);
    // const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
  }

  getArea() {
    const areaHeight = this.texture.height;
    return {
      x: this.x,
      y: this.y + (this.isReflected ? areaHeight + CELL_SIZE : 0),
      w: this.texture.width,
      h: areaHeight,
    };
  }
}
