import { switchTextures } from "../common/textures";
import { CELL_SIZE, game, OBJ_LAYERS, SWITCH_MAX_ANIM } from "../configs/constants";
import { checkIsReflected, drawCellWire, drawWire } from "../utils/common";
import { Obj } from "./object";

export class Switch extends Obj {
  anim: number;
  isSwitching: boolean;

  constructor(x: number, y: number) {
    super();
    this.isSwitching = false;
    this.anim = 0;
    this.set(x, y);
    this.linkedObjs = [];
  }

  set(x: number, y: number) {
    this.x_ = x;
    this.y_ = y;
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE;
    this.texture = switchTextures[checkIsReflected(this.y_)][this.anim];
  }

  reset() {
    this.isSwitching = false;
  }

  update() {
    if (this.isSwitching) {
      this.anim += 1;
      if (this.anim >= SWITCH_MAX_ANIM) this.anim = SWITCH_MAX_ANIM - 1;
    } else {
      this.anim -= 1;
      if (this.anim < 0) this.anim = 0;
    }

    this.texture = switchTextures[checkIsReflected(this.y_)][this.anim];
  }

  switch() {
    this.isSwitching = true;
  }

  render() {
    game.context.drawImage(this.texture, this.x - this.texture.width / 2, this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -this.texture.height));
    // drawCellWire(this.x_, this.y_);
    // const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
  }

  getArea() {
    const areaHeight = this.texture.height / 1.5;
    return {
      x: this.x - this.texture.width / 4,
      y: this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -areaHeight),
      w: this.texture.width / 2,
      h: areaHeight,
    };
  }

  onSelectLinkedObj(obj: Obj) {
    if (obj.layer !== OBJ_LAYERS.WALL) return;
    if (this.linkedObjs.includes(obj)) return;

    obj.linkedObjs.push(this);
    this.linkedObjs.push(obj);
    game.useSelectLinkedObject = false;
    game.updateObjectDetailMore();
  }
}
