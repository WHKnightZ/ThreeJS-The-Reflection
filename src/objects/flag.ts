import { flagTextures } from "../common/textures";
import { CELL_SIZE, FLAG_MAX_ANIM, game } from "../configs/constants";
import { checkIsReflected, drawCellWire, drawWire } from "../utils/common";
import { Obj } from "./object";

export class Flag extends Obj {
  anim: number;
  isRaiseUp: boolean;

  constructor(x: number, y: number) {
    super();
    this.isRaiseUp = false;
    this.anim = 0;
    this.set(x, y);
  }

  set(x: number, y: number) {
    this.x_ = x;
    this.y_ = y;
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE;
    this.texture = flagTextures[checkIsReflected(this.y_)][this.anim];
  }

  update() {
    if (this.isRaiseUp) {
      this.anim += 1;
      if (this.anim >= FLAG_MAX_ANIM) this.anim = FLAG_MAX_ANIM - 1;
    } else {
      this.anim -= 1;
      if (this.anim < 0) this.anim = 0;
    }

    this.texture = flagTextures[checkIsReflected(this.y_)][this.anim];
  }

  raise() {
    this.isRaiseUp = true;
  }

  lower() {
    this.isRaiseUp = false;
  }

  render() {
    game.context.drawImage(this.texture, this.x - this.texture.width / 2, this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -this.texture.height + 11));
    // drawCellWire(this.x_, this.y_);
    // const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
  }

  getArea() {
    const areaHeight = this.texture.height / 1.5;
    return { x: this.x - this.texture.width / 4, y: this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -areaHeight), w: this.texture.width / 2, h: areaHeight };
  }
}
