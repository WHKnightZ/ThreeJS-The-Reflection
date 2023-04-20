import { OBJ_LAYERS, OBJ_PRIORITIES } from "../configs/constants";
import { Rectangle } from "../types";
import { Base } from "./base";

let objId = 0;

export class Obj extends Base {
  priority: number; // Order to Render
  layer: number; // Layer Collision
  id: number;
  collidedObjs: { [key: number]: boolean };
  name: string;
  linkedObjs?: Obj[] | undefined;
  clickedExtraArea: { w: number; h: number };

  constructor() {
    super();
    this.id = objId;
    this.collidedObjs = {};
    objId += 1;
    this.clickedExtraArea = { w: 0, h: 0 };
    this.setLayer();
  }

  setLayer() {
    const layer = this.constructor.name.toUpperCase();
    this.name = this.constructor.name + this.id;
    this.layer = OBJ_LAYERS[layer];
    this.priority = OBJ_PRIORITIES[layer];
  }

  set?(...params: any): void;
  getArea?(): Rectangle;
  reset?(): void;

  onSelectLinkedObj?(obj: Obj): void;

  // Event
  onEnterObject?(obj: Obj): void;
  onLeaveObject?(obj: Obj): void;
}
