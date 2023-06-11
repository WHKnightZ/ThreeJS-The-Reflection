import type { Base } from "@/objects/base";
import type { Obj } from "@/objects/object";
import type { Player } from "@/objects/player";
import { ObjType } from "@/types";

export { default as mapInfo } from "@/maps/1.json";

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

export const offsetFactors = [-1, 1];

export const game: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  rendererCanvas: HTMLCanvasElement;
  mouse: {
    x: number;
    y: number;
    isDragging: boolean;
    isRightMouse: boolean;
    oldPos: number;
    xOffset: number;
    xOffsetTemp: number;
    xWithOffset: number;
  };
  objs: Obj[];
  players: Player[];
  particles: Base[];
  useSelectTool: boolean;
  useHandTool: boolean;
  selected: Obj | null;
  useSelectLinkedObject: boolean;
  updateObjectDetailMore: () => void;
} = {} as any;

export const OBJS: { [key in ObjType]: { name: string; layer: number; priority: number } } = {
  PLAYER: { name: "Player", layer: 0, priority: 3 },
  TREE: { name: "Tree", layer: 1, priority: 0 },
  FLAG: { name: "Flag", layer: 2, priority: 1 },
  WALL: { name: "Wall", layer: 3, priority: 4 },
  SWITCH: { name: "Switch", layer: 4, priority: 2 },
  SPIKE: { name: "Spike", layer: 5, priority: 0 },
  BOX: { name: "Box", layer: 6, priority: 0 },
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

export const FLAG_MAX_ANIM = 9;

export const SWITCH_MAX_ANIM = 3;
