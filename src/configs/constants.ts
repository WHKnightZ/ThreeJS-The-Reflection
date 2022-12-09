export { default as baseMap } from "../maps/1.json";

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

export const game: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } = {} as any;
