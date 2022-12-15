import * as THREE from "three";
import { CELL_SIZE, game } from "../configs/constants";
import { flipHorizontal, getImageSrc } from "../utils/common";
import { Obj } from "./object";

const imageSrcs = {
  treePalm: "tree-palm",
  treePalmSmall: "tree-palm-small",
  treeCactus: "tree-cactus",
  treeCactusSmall: "tree-cactus-small",
};

type Images = { [Property in keyof typeof imageSrcs]: any };

const treeTextures: Images = {} as any;

export const initTree = async () => {
  const loadImage = (key: string, src: string) => {
    const image = new Image();
    treeTextures[key] = image;
    image.src = getImageSrc(src);
    return new Promise((res) => (image.onload = () => res(image)));
  };

  await Promise.all(Object.keys(imageSrcs).map((key) => loadImage(key, imageSrcs[key])));
};

export class Tree extends Obj {
  texture: HTMLImageElement;
  x: number;
  y: number;

  constructor(type: keyof Images, x: number, y: number) {
    super();
    this.t = Math.random();
    this.texture = treeTextures[type];
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE - this.texture.height;
  }

  update() {}

  render() {
    game.context.drawImage(this.texture, this.x - this.texture.width / 2, this.y);
  }
}
