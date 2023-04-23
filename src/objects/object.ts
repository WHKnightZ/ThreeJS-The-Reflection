import { OBJ_LAYERS, OBJ_PRIORITIES } from "../configs/constants";
import { Rectangle } from "../types";
import { Base } from "./base";
import type { ObjectPlugin } from "../plugins/plugin";

const ids = {};

export class Obj extends Base {
  priority: number; // Order to Render
  layer: number; // Layer Collision
  id: string;
  collidedObjs: { [key: number]: boolean };
  linkedObjs?: Obj[];
  clickedExtraArea: { w: number; h: number };
  plugins?: ObjectPlugin[];

  constructor(createId = true) {
    super();

    this.collidedObjs = {};
    const layer = this.constructor.name.toUpperCase();
    this.layer = OBJ_LAYERS[layer];
    this.priority = OBJ_PRIORITIES[layer];
    this.clickedExtraArea = { w: 0, h: 0 };
    this.id = "#";

    if (createId) {
      const numId = (ids[layer] = ids[layer] || 0);
      ids[layer] += 1;
      this.id = this.constructor.name + numId;
    }
  }

  set?(...params: any): void;
  getArea?(): Rectangle;
  reset?(): void;

  onSelectLinkedObj?(obj: Obj): void;

  // Event
  onEnterObject?(obj: Obj): void;
  onLeaveObject?(obj: Obj): void;
}
