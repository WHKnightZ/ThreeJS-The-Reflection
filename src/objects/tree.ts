import { TreeTextures, treeTextures } from "../common/textures";
import { CELL_SIZE, game, OBJ_LAYERS } from "../configs/constants";
import { Obj } from "./object";

export class Tree extends Obj {
  texture: HTMLImageElement;
  x: number;
  y: number;

  constructor(type: keyof TreeTextures, x: number, y: number) {
    super();
    this.layer = OBJ_LAYERS.TREE;
    this.priority = 2;
    this.texture = treeTextures[type];
    this.set(x, y);
  }

  set(x: number, y: number) {
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE - this.texture.height;
  }

  update() {}

  render() {
    // const { x, y, w, h } = this.getArea();
    // game.context.beginPath();
    // game.context.rect(x, y, w, h);
    // game.context.stroke();
    game.context.drawImage(this.texture, this.x - this.texture.width / 2, this.y);
  }

  getArea() {
    return { x: this.x - this.texture.width / 4, y: this.y + this.texture.height * (1 - 1 / 1.5), w: this.texture.width / 2, h: this.texture.height / 1.5 };
  }
}
