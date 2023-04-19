import type { Obj } from "../objects/object";
import type { Player } from "../objects/player";

export { default as mapInfo } from "../maps/1.json";

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
    x: number; //
    y: number;
    isDragging: boolean;
    isRightMouse: boolean;
    oldPos: number;
    xOffset: number;
    xOffsetTemp: number;
    xWithOffset: number;
  };
  players: Player[];
  objs: Obj[];
  particles: Obj[];
  useSelectTool: boolean;
  useHandTool: boolean;
  selected: Obj | null;
  useSelectLinkedObject: boolean;
  updateObjectDetailMore: (obj?: Obj | null) => void;
} = {} as any;

export const OBJ_LAYERS = {
  PLAYER: 0,
  TREE: 1, // Cây, chỉ để trang trí
  FLAG: 2, // Cờ, khi cả 2 player đâm vào thì qua màn
  SWITCH: 3, // Công tắc làm tường biến mất
  WALL: 4, // Tường chắn, sẽ biến mất khi đâm vào Switch
  SPIKE: 5, // Gai xương rồng, đâm vào sẽ chết
  BOX: 6, // Hộp để đẩy xuống nước, có khả năng nổi trên mặt nước
};

export const OBJ_PRIORITIES = {
  PLAYER: 3,
  TREE: 0,
  FLAG: 2,
  MAP: 1,
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
