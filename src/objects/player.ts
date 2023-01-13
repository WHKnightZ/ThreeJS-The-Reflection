import { playerTextures } from "../common/textures";
import { CELL_SIZE, DRTS, mapInfo, STTS, VELOCITY_DEFAULT, VELOCITY_MIN, game, OBJ_LAYERS, offsetFactors } from "../configs/constants";
import { checkIsReflected, drawWire } from "../utils/common";
import { Explosion } from "./explosion";
import { Flag } from "./flag";
import { Obj } from "./object";

export class Player extends Obj {
  v: number;
  g: number;

  drt: number;
  stt: number;
  anim: number;

  isAlive: boolean;
  isRunning: boolean;
  isJumping: boolean;
  isHoldingUp: boolean;
  isReflected: number;

  textures: any[][][];

  savedInfo: {
    x: number;
    y: number;
    drt: number;
  };

  constructor(x: number, y: number, drt: number = DRTS.RIGHT) {
    super();

    this.set(x, y, drt);
  }

  update() {
    if (!this.isAlive) return;

    const map = mapInfo.baseMap;

    // If hold space and player is not jumping => Jump (set velocity to a value greater than zero)
    if (this.isHoldingUp && !this.isJumping) {
      this.isJumping = true;
      this.v = VELOCITY_DEFAULT;
      this.anim = 0;
    }

    // Every consterval, velocity increase by gravity
    this.v += this.g;

    // Set max value of velocity
    if (this.v < VELOCITY_MIN) this.v = VELOCITY_MIN;

    const gravityFactor = offsetFactors[this.isReflected];

    this.y += this.v * gravityFactor;

    // Check stop fall when the player is falling (this.v < 0)
    if (this.v <= 0) {
      // colLeft and colRight of player
      const colLeft = Math.floor((this.x - 5) / CELL_SIZE);
      const colRight = Math.floor((this.x + 5) / CELL_SIZE);

      let row = Math.floor((this.y - gravityFactor) / CELL_SIZE);
      const rowAbove = Math.floor((this.y - 5 * gravityFactor) / CELL_SIZE) + gravityFactor;

      // If foot left or right of player is wall => stop fall
      if ((map[row]?.[colLeft] || map[row]?.[colRight]) && !map[rowAbove]?.[colLeft] && !map[rowAbove]?.[colRight]) {
        this.isJumping = false;

        row += gravityFactor;

        // do {
        //   row += 1;
        // } while (map[row]?.[colLeft] === 1 || map[row]?.[colRight] === 1);

        this.y = (this.isReflected ? row : row + 1) * CELL_SIZE;

        this.v = 0;
      } else this.isJumping = true;
    }

    // Get new position of player when run to left or right (old position + offset)
    const drtFactor = offsetFactors[this.drt];

    if (this.isRunning) {
      const xMiddle = Math.floor(this.x / CELL_SIZE);
      const xEdge = Math.floor((this.x + 10 * drtFactor) / CELL_SIZE);
      const yTop = Math.floor((this.y + 12 * gravityFactor) / CELL_SIZE);
      const yBottom = Math.floor((this.y + gravityFactor) / CELL_SIZE);
      // If player is inside the wall, free the move
      // If player is running, check new position has the wall or not, if not, translate position by offset
      if (map[yTop]?.[xMiddle] === 1 || (!map[yTop]?.[xEdge] && !map[yBottom]?.[xEdge])) {
        this.x += 4 * drtFactor;
      } else {
        // Otherwise, hold in position
        this.x = xEdge * CELL_SIZE - 9 * drtFactor + CELL_SIZE * (1 - this.drt);
      }
    }

    // Detect animation of player
    if (this.isJumping) {
      // this.anim = 0 is jumping
      // this.anim = 1 is falling
      if (this.v < 0) this.anim = 1;
    }

    if (this.isJumping) this.stt = STTS.JUMP;
    else if (this.isRunning) this.stt = STTS.RUN;
    else this.stt = STTS.STAND;

    if (checkIsReflected(Math.floor(this.y / CELL_SIZE)) !== this.isReflected) {
      this.isAlive = false;
      game.explosions.push(new Explosion(this.x, this.y + gravityFactor * 12));

      setTimeout(() => {
        if (!this.isAlive) this.reset();
      }, 1000);
    }

    this.t += 1;
    if (this.t === 12) {
      this.t = 0;

      if (!this.isJumping) {
        this.anim += 1;
        if (this.anim === 4) this.anim = 0;
      }
    }
  }

  render() {
    if (!this.isAlive) return;

    const { x, y, w, h } = this.getArea();
    // drawWire(x, y, w, h);
    game.context.drawImage(this.textures[this.drt][this.stt][this.anim], x, y, w, h);
  }

  lrHold(drt: number) {
    this.isRunning = true;
    if (this.drt !== drt) {
      this.drt = drt;
      if (!this.isJumping) this.anim = 0;
    }
  }

  lrRelease(drt: number) {
    if (this.drt === drt) {
      this.isRunning = false;
      if (!this.isJumping) this.anim = 0;
    }
  }

  upHold() {
    this.isHoldingUp = true;
  }

  upRelease() {
    this.isHoldingUp = false;
  }

  getArea() {
    const newY = this.isReflected ? this.y : this.y - 48;
    return { x: this.x - 24, y: newY, w: 48, h: 48 };
  }

  set(x: number, y: number, drt: number) {
    this.savedInfo = { x, y, drt };

    this.reset();
  }

  reset() {
    const { x, y, drt } = this.savedInfo;
    this.x = x;
    this.y = y;
    this.drt = drt;

    const isReflected = checkIsReflected(Math.floor(this.y / CELL_SIZE));
    this.isReflected = isReflected;
    this.textures = playerTextures[isReflected];
    this.v = 0;
    this.g = -0.5;
    this.t = 0;

    this.stt = STTS.STAND;
    this.anim = 0;
    this.isRunning = this.isJumping = this.isHoldingUp = false;
    this.isAlive = true;
  }

  onEnterObject(obj: Obj): void {
    if (obj.layer === OBJ_LAYERS.FLAG) {
      (obj as Flag).raise();
    }
  }

  onLeaveObject(obj: Obj): void {
    if (obj.layer === OBJ_LAYERS.FLAG) {
      (obj as Flag).lower();
    }
  }
}
