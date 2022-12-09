import * as THREE from "three";
import { CELL_SIZE, game } from "../configs/constants";
import { flipHorizontal, getImageSrc } from "../utils/common";
import { Obj } from "./object";

const imageSrcs = {
  treePalm: "tree-palm",
  treeCactus: "tree-cactus",
  treeCactusSmall: "tree-cactus-small",
};

type Images = { [Property in keyof typeof imageSrcs]: any } & { treePalmSmall: any };

const treeTextures: Images = {} as any;

export const initTree = async () => {
  const loadImage = (key: string, src: string) => {
    const image = new Image();
    treeTextures[key] = image;
    image.src = getImageSrc(src);
    return new Promise((res) => (image.onload = () => res(image)));
  };

  await Promise.all(Object.keys(imageSrcs).map((key) => loadImage(key, imageSrcs[key])));

  treeTextures.treePalmSmall = await flipHorizontal(treeTextures.treePalm, 0.5);
};

export class Tree extends Obj {
  texture: HTMLImageElement;
  x: number;
  y: number;
  threeTexture: THREE.Texture;

  constructor(type: keyof Images, x: number, y: number) {
    super();
    this.texture = treeTextures[type];
    this.x = x * CELL_SIZE + CELL_SIZE / 2;
    this.y = y * CELL_SIZE - this.texture.height;

    this.threeTexture = new THREE.Texture(this.texture);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.threeTexture },
      },
      vertexShader: require("../shaders/vertex.glsl"),
      fragmentShader: require("../shaders/fragment.glsl"),
    });

    // const mesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.4, 60, 30), material);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.texture.width / 100, this.texture.height / 100, 60, 30), material);
    mesh.position.set((this.x - this.texture.width / 2) / 100, this.y / 100, 0);
    game.scene.add(mesh);
  }

  update() {}

  render() {
    // game.context.drawImage(this.texture, this.x - this.texture.width / 2, this.y);
  }
}
