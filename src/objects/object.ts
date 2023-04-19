import { OBJ_LAYERS, OBJ_PRIORITIES } from "../configs/constants";
import { Rectangle } from "../types";

let objId = 0;

export class Obj {
  t: number;
  priority: number; // Order to Render
  layer: number; // Layer Collision
  texture: HTMLImageElement;
  x: number;
  y: number;
  x_: number;
  y_: number;
  id: number;
  isAlive: boolean;
  collidedObjs: { [key: number]: boolean };
  name: string;
  linkedObjs?: Obj[] | undefined;

  constructor() {
    this.id = objId;
    this.collidedObjs = {};
    objId += 1;
    this.setLayer();
  }

  setLayer() {
    const layer = this.constructor.name.toUpperCase();
    this.name = this.constructor.name + this.id;
    this.layer = OBJ_LAYERS[layer];
    this.priority = OBJ_PRIORITIES[layer];
  }

  set?(...params: any): void;
  render?(): void;
  update?(): void;
  getArea?(): Rectangle;
  reset?(): void;

  onSelectLinkedObj?(obj: Obj): void;

  // Event
  onEnterObject?(obj: Obj): void;
  onLeaveObject?(obj: Obj): void;
}
