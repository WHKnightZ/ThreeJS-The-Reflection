export { default as baseMap } from "../maps/1.json";

export const APP_NAME = "The Reflection";

export const SCREEN_WIDTH = 800;
export const SCREEN_HEIGHT = 480;

export const imageSrcs = {
  jump0: "jump-0",
  jump1: "jump-1",
  stand0: "stand-0",
  stand1: "stand-1",
  stand2: "stand-2",
  run0: "run-0",
  run1: "run-1",
  run2: "run-2",
};

export type Images = { [Property in keyof typeof imageSrcs]: any };

export const MAP_MAX_X = 50;
export const MAP_MAX_Y = 30;
export const VELOCITY_DEFAULT = 16.0;
export const VELOCITY_MIN = -24.0;

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
