import { Obj } from "../objects/object";

import mapInfo from "../maps/1.json";

const { baseMap, trees: treesInfo, players: playersInfo } = mapInfo;

export { baseMap, treesInfo, playersInfo };

export const APP_NAME = "The Reflection";

export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 480;

export const MAP_MAX_X = 50;
export const MAP_MAX_Y = 30;
export const VELOCITY_DEFAULT = 11.0;
export const VELOCITY_MIN = -16.0;

export const CELL_SIZE = 16;

export const INTERVAL = 25;

export enum DRTS {
  LEFT,
  RIGHT,
}

export enum STTS {
  STAND,
  RUN,
  JUMP,
}

export const offset = [-1, 1];

export const game: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  rendererCanvas: HTMLCanvasElement;
  mouse: { x: number; y: number; isDragging: boolean; isRightMouse: boolean };
  objs: Obj[];
} = {} as any;

export const OBJ_LAYERS = {
  PLAYER: 0,
  TREE: 1,
  FLAG: 2,
  SWITCH: 3,
  WALL: 4,
  SPIKE: 5,
  BOX: 6,
};

export const COLLISION_MATRIX = [
  [1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 1],
];

export const REFLECTED_OFFSETS = [1, -1];
