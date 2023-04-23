import type { Obj } from "../objects/object";

export class ObjectPlugin {
  obj: Obj;

  constructor(obj: Obj) {
    this.obj = obj;
  }
}
