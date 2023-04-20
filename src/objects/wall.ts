import { wallTexture } from "../common/textures";
import { CELL_SIZE, game, OBJ_LAYERS } from "../configs/constants";
import { checkIsReflected, drawCellWire, drawWire } from "../utils/common";
import { Obj } from "./object";

class Explosion extends Obj {
  static SIZE = 32;
  static MAX_TIME = 16;

  w: number;
  h: number;
  opacity: number;
  color: string;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
    this.isAlive = true;
    this.color = "#ffffff";
    this.opacity = 1;
    this.t = 0;
    this.w = Explosion.SIZE;
    this.h = Explosion.SIZE;
  }

  update() {
    this.t += 1;
    this.isAlive = this.t <= Explosion.MAX_TIME;
    this.opacity = 1 - this.t / Explosion.MAX_TIME;
    console.log(Explosion.MAX_TIME);
    this.w = Explosion.SIZE * (1 - this.t / Explosion.MAX_TIME);
    this.h = Explosion.SIZE * (1 + this.t / Explosion.MAX_TIME);
    console.log(this.w, this.h);
  }

  render() {
    game.context.globalAlpha = this.opacity;
    game.context.fillStyle = this.color;
    game.context.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    game.context.globalAlpha = 1;
  }
}

export class Wall extends Obj {
  isReflected: boolean;
  isExploding: boolean;
  isDestroyed: boolean;

  constructor(x: number, y: number) {
    super();
    this.set(x, y);
    this.isReflected = !!checkIsReflected(y);
    this.isExploding = false;
    this.linkedObjs = [];
    this.isDestroyed = false;
  }

  setIsReflected(_isReflected: boolean) {
    this.isReflected = _isReflected;
  }

  set(x: number, y: number) {
    this.x_ = x;
    this.y_ = y;
    this.texture = wallTexture;
    this.x = x * CELL_SIZE;
    this.y = y * CELL_SIZE - this.texture.height;
  }

  reset() {
    this.isDestroyed = false;
  }

  update() {}

  render() {
    if (this.isDestroyed) return;

    game.context.drawImage(this.texture, this.x, this.y + (this.isReflected ? this.texture.height + CELL_SIZE : 0));
    // drawCellWire(this.x_, this.y_);
    // const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
  }

  getArea() {
    const areaHeight = this.texture.height;
    return {
      x: this.x,
      y: this.y + (this.isReflected ? areaHeight + CELL_SIZE : 0),
      w: this.texture.width,
      h: areaHeight,
    };
  }

  onSelectLinkedObj(obj: Obj) {
    if (obj.layer !== OBJ_LAYERS.SWITCH) return;
    if (this.linkedObjs.includes(obj)) return;

    obj.linkedObjs.push(this);
    this.linkedObjs.push(obj);
    game.useSelectLinkedObject = false;
    game.updateObjectDetailMore();
  }

  destroy() {
    this.isDestroyed = true;
    game.particles.push(new Explosion(this.x + 16, this.y + 16));
  }
}
