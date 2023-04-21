import { treeTextures, TreeTextureTypes } from "../common/textures";
import { CELL_SIZE, game } from "../configs/constants";
import { checkIsReflected, drawCellWire, drawWire } from "../utils/common";
import { Obj } from "./object";

const treeOffsets: {
  [key in TreeTextureTypes]: number;
} = { treeCactus: 0, treeCactusSmall: 0, treePalm: -14, treePalmSmall: 12 };

export class Tree extends Obj {
  type: TreeTextureTypes;
  offset: number;

  constructor(type: TreeTextureTypes, x: number, y: number, createId = true) {
    super(createId);
    this.type = type;
    this.set(x, y);
    this.offset = treeOffsets[type];
  }

  set(x: number, y: number) {
    this.x_ = x;
    this.y_ = y;
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE;
    this.texture = treeTextures[checkIsReflected(y)][this.type];
    this.clickedExtraArea = { w: this.texture.width * 0.3, h: this.texture.height * 0.3 };
  }

  update() {}

  render() {
    game.context.drawImage(
      this.texture,
      this.x - this.texture.width / 2 + this.offset,
      this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -this.texture.height)
    );
    // drawCellWire(this.x_, this.y_);
    // const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
  }

  getArea() {
    const areaHeight = this.texture.height / 1.5;
    return {
      x: this.x - this.texture.width / 4 + this.offset / 2,
      y: this.y + (checkIsReflected(this.y_) ? CELL_SIZE : -areaHeight),
      w: this.texture.width / 2,
      h: areaHeight,
    };
  }
}
