import { CELL_SIZE } from "../configs/constants";
import { flipHorizontal, flipVertical, getImageSrc } from "../utils/common";

export let backgroundTexture: HTMLImageElement;

// Background
const loadBackgroundTextures = async () => {
  backgroundTexture = new Image();
  backgroundTexture.src = getImageSrc("background");
  return await new Promise((res) => {
    backgroundTexture.onload = () => {
      res(null);
    };
  });
};

const createCanvas = (width = CELL_SIZE, height = CELL_SIZE) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return {
    context: canvas.getContext("2d") as CanvasRenderingContext2D,
    createImg: () => {
      const img = new Image();
      img.src = canvas.toDataURL("image/png");
      return img;
    },
  };
};

// Tiles
const parts = {
  middle: [0, 16, 16, 16],
  top: [0, 0, 16, 16],
  bottom: [16, 0, 16, 6],
  left: [21, 6, 6, 16],
  right: [16, 6, 5, 16],
  edgeTopLeft: [0, 32, 6, 6],
  edgeTopRight: [6, 32, 6, 6],
  edgeBottomLeft: [18, 32, 6, 6],
  edgeBottomRight: [12, 32, 6, 6],
  jointTopLeft: [0, 38, 6, 6],
  jointTopRight: [6, 38, 6, 6],
  jointBottomLeft: [18, 38, 6, 6],
  jointBottomRight: [12, 38, 6, 6],
};

export type MapPartType = { [Property in keyof typeof parts]: any };

const mapPart: MapPartType = {} as any;

export const mappingTiles = {};

const loadTileTextures = async () => {
  const promises = [];

  const images = new Image();
  images.src = getImageSrc("tiles");
  await new Promise((res) => {
    images.onload = async () => {
      await Promise.all(
        Object.keys(parts).map((key) => {
          const part = parts[key];
          const [x, y, w, h] = part;
          const { context, createImg } = createCanvas(w, h);
          context.drawImage(images, x, y, w, h, 0, 0, w, h);
          const img = createImg();
          mapPart[key] = img;
          return new Promise((res) => (img.onload = () => res(img)));
        })
      );

      const baseArr = [0, 0, 0, 0, 0, 0, 0, 0];
      let current = 0;

      const handleImage = () => {
        const [t, r, b, l, tl, tr, bl, br] = baseArr;

        if (tl && (!t || !l)) return;
        if (tr && (!t || !r)) return;
        if (bl && (!b || !l)) return;
        if (br && (!b || !r)) return;

        const { context, createImg } = createCanvas();
        context.drawImage(mapPart.middle, 0, 0);
        let c = 0;

        if (!t) context.drawImage(mapPart.top, 0, 0);
        else c += 1;

        if (!b) context.drawImage(mapPart.bottom, 0, 10);
        else c += 16;

        if (!l) context.drawImage(mapPart.left, 0, 0);
        else c += 64;

        if (!r) context.drawImage(mapPart.right, 11, 0);
        else c += 4;

        if (t && l) {
          if (!tl) context.drawImage(mapPart.jointTopLeft, 0, 0);
          else c += 128;
        } else if (!t && !l) context.drawImage(mapPart.edgeTopLeft, 0, 0);

        if (t && r) {
          if (!tr) context.drawImage(mapPart.jointTopRight, 10, 0);
          else c += 2;
        } else if (!t && !r) context.drawImage(mapPart.edgeTopRight, 10, 0);

        if (b && l) {
          if (!bl) context.drawImage(mapPart.jointBottomLeft, 0, 10);
          else c += 32;
        } else if (!b && !l) context.drawImage(mapPart.edgeBottomLeft, 0, 10);

        if (b && r) {
          if (!br) context.drawImage(mapPart.jointBottomRight, 10, 10);
          else c += 8;
        } else if (!b && !r) context.drawImage(mapPart.edgeBottomRight, 10, 10);

        const img = createImg();
        mappingTiles[c] = img;
        promises.push(new Promise((res) => (img.onload = () => res(img))));
      };

      for (let i = 0; i < 256; i += 1) {
        handleImage();

        if (baseArr[current]) {
          do {
            current += 1;
          } while (baseArr[current]);
          baseArr[current] = 1;
          for (let j = 0; j < current; j += 1) baseArr[j] = 0;
          current = 0;
          continue;
        }

        baseArr[current] = 1;
      }

      res(null);
    };
  });

  return await Promise.all(promises);
};

// Player
export let playerTextures: any[][][][];

const loadPlayerTextures = async () => {
  const imageSrcs = {
    jump0: "jump-0",
    jump1: "jump-1",
    stand0: "stand-0",
    stand1: "stand-1",
    stand2: "stand-2",
    run0: "run-0",
    run1: "run-1",
    run2: "run-2",
  };

  type Images = { [Property in keyof typeof imageSrcs]: any };

  const rightImages: Images = { ...imageSrcs };
  const leftImages: Images = { ...imageSrcs };

  const loadImage = (key: string, src: string) => {
    const image = new Image();
    (rightImages as any)[key] = image;
    image.src = getImageSrc(src);
    return new Promise((res) => (image.onload = () => res(image)));
  };

  await Promise.all(Object.keys(rightImages).map((key) => loadImage(key, (rightImages as any)[key])));
  const keys = Object.keys(rightImages);
  (await Promise.all(keys.map((key) => flipHorizontal((rightImages as any)[key])))).forEach((image, index) => {
    (leftImages as any)[keys[index]] = image;
  });

  const mainTextures = [
    [
      [leftImages.stand0, leftImages.stand1, leftImages.stand2, leftImages.stand1],
      [leftImages.run0, leftImages.run1, leftImages.run2, leftImages.run1],
      [leftImages.jump0, leftImages.jump1],
    ],
    [
      [rightImages.stand0, rightImages.stand1, rightImages.stand2, rightImages.stand1],
      [rightImages.run0, rightImages.run1, rightImages.run2, rightImages.run1],
      [rightImages.jump0, rightImages.jump1],
    ],
  ];
  const reflectedTextures = await Promise.all(mainTextures.map(async (a) => await Promise.all(a.map(async (b) => await Promise.all(b.map(flipVertical))))));

  playerTextures = [mainTextures, reflectedTextures];
};

// Tree
const imageSrcs = {
  treePalm: "tree-palm",
  treePalmSmall: "tree-palm-small",
  treeCactus: "tree-cactus",
  treeCactusSmall: "tree-cactus-small",
};

export type TreeTextures = { [Property in keyof typeof imageSrcs]: any };

export const treeTextures: TreeTextures = {} as any;

const loadTreeTextures = async () => {
  const loadImage = (key: string, src: string) => {
    const image = new Image();
    treeTextures[key] = image;
    image.src = getImageSrc(src);
    return new Promise((res) => (image.onload = () => res(image)));
  };

  await Promise.all(Object.keys(imageSrcs).map((key) => loadImage(key, imageSrcs[key])));
};

export const commonTextures: {
  error: HTMLImageElement;
} = { error: "error" } as any;

const loadCommonTextures = async () => {
  const loadImage = (key: string, src: string) => {
    const image = new Image();
    commonTextures[key] = image;
    image.src = getImageSrc(src);
    return new Promise((res) => (image.onload = () => res(image)));
  };

  await Promise.all(Object.keys(commonTextures).map((key) => loadImage(key, commonTextures[key])));
};

// All
export const loadTextures = async () => {
  await Promise.all([loadBackgroundTextures(), loadTileTextures(), loadPlayerTextures(), loadTreeTextures(), loadCommonTextures()]);
};
