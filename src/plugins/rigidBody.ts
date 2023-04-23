import { ObjectPlugin } from "./plugin";
import type { Obj } from "../objects/object";

export class RigidBody extends ObjectPlugin {
  mass: number;
  isStatic: boolean;
  //   friction: number; // Dùng trong trường hợp có quán tính

  constructor(obj: Obj, mass: number = 1, isStatic: boolean = false) {
    super(obj);

    this.mass = mass;
    this.isStatic = isStatic;
  }
}
