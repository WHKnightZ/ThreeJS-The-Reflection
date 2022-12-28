import { TreeTextures, treeTextures } from "../common/textures";
import { CELL_SIZE, game } from "../configs/constants";
import { Obj } from "./object";

export class Tree extends Obj {
  texture: HTMLImageElement;
  x: number;
  y: number;

  constructor(type: keyof TreeTextures, x: number, y: number) {
    super();
    this.priority = 2;
    this.t = Math.random();
    this.texture = treeTextures[type];
    this.set(x, y);
  }

  set(x: number, y: number) {
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE - this.texture.height;
  }

  update() {}

  render() {
    game.context.drawImage(this.texture, this.x - this.texture.width / 2, this.y);
  }
}
