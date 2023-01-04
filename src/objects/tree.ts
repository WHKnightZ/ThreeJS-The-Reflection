import { treeTextures, TreeTextureTypes } from "../common/textures";
import { CELL_SIZE, game, OBJ_LAYERS } from "../configs/constants";
import { checkIsReflected, drawCellWire, drawWire } from "../utils/common";
import { Obj } from "./object";

export class Tree extends Obj {
  type: TreeTextureTypes;
  texture: HTMLImageElement;
  x: number;
  y: number;
  x_: number;
  y_: number;

  constructor(type: TreeTextureTypes, x: number, y: number) {
    super();
    this.type = type;
    this.layer = OBJ_LAYERS.TREE;
    this.priority = 2;
    this.set(x, y);
  }

  set(x: number, y: number) {
    this.x_ = x;
    this.y_ = y;
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE;
    this.texture = treeTextures[checkIsReflected(y)][this.type];
  }

  update() {}

  render() {
    // drawCellWire(this.x_, this.y_);
    // const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
    game.context.drawImage(this.texture, this.x - this.texture.width / 2, this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -this.texture.height));
  }

  getArea() {
    const areaHeight = this.texture.height / 1.5;
    return { x: this.x - this.texture.width / 4, y: this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -areaHeight), w: this.texture.width / 2, h: areaHeight };
  }
}
