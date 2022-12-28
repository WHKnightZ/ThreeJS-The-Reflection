import { mappingTiles } from "../common/textures";
import { CELL_SIZE, game } from "../configs/constants";
import { Obj } from "./object";

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
    this.priority = 1;
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
          game.context.drawImage(mappingTiles[m2] || mappingTiles[0], j * CELL_SIZE, i * CELL_SIZE);
        }
      });
    });
  }
}
