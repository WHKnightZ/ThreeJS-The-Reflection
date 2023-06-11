import { ObjType, Rectangle } from "@/types";
import { Base } from "./base";
import type { ObjectPlugin } from "@/plugins/plugin";
import { OBJS } from "@/configs/constants";

const ids = {};

export class Obj extends Base {
  priority: number; // Order to Render
  layer: number; // Layer Collision
  id: string;
  collidedObjs: { [key: number]: boolean };
  linkedObjs?: Obj[];
  clickedExtraArea: { w: number; h: number };
  plugins?: ObjectPlugin[];

  constructor(layerName: ObjType, createId = true) {
    super();

    this.collidedObjs = {};
    const { name, layer, priority } = OBJS[layerName];
    this.layer = layer;
    this.priority = priority;
    this.clickedExtraArea = { w: 0, h: 0 };
    this.id = "#";

    if (createId) {
      const numId = (ids[layer] = ids[layer] || 0);
      ids[layer] += 1;
      this.id = name + numId;
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
