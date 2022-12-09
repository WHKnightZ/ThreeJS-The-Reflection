import { CELL_SIZE, game } from "../configs/constants";
import { getImageSrc } from "../utils/common";
import { Obj } from "./object";

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

const mapImage = {};

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

export const initMap = async () => {
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
        mapImage[c] = img;
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

const points = [
  { direction: [0, -1], point: 1 },
  { direction: [1, -1], point: 2 },
  { direction: [1, 0], point: 4 },
  { direction: [1, 1], point: 8 },
  { direction: [0, 1], point: 16 },
  { direction: [-1, 1], point: 32 },
  { direction: [-1, 0], point: 64 },
  { direction: [-1, -1], point: 128 },
];

export class Map extends Obj {
  map: number[][];

  constructor(map: number[][]) {
    super();
    this.init(map);
  }

  init(map: number[][]) {
    const newMap = map.map((arr) => arr.slice());

    map.forEach((m1, i) => {
      m1.forEach((m2, j) => {
        if (m2) {
          let p = 0;
          points.forEach(({ point, direction }) => {
            if (direction[0] === 0 || direction[1] === 0 || (map[i][j + direction[0]] && map[i + direction[1]]?.[j])) p += (map[i + direction[1]]?.[j + direction[0]] || 0) * point;
          });
          newMap[i][j] = p;
        } else newMap[i][j] = -1;
      });
    });

    this.map = newMap;
  }

  render() {
    this.map.forEach((m1, i) => {
      m1.forEach((m2, j) => {
        if (m2 !== -1) {
          game.context.drawImage(mapImage[m2] || mapImage[0], j * CELL_SIZE, i * CELL_SIZE);
        }
      });
    });
  }
}
