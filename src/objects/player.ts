import { playerTextures } from "../common/textures";
import { CELL_SIZE, DRTS, baseMap as map, offset, STTS, VELOCITY_DEFAULT, VELOCITY_MIN, SCREEN_HEIGHT, game, MAP_MAX_Y, OBJ_LAYERS } from "../configs/constants";
import { Flag } from "./flag";
import { Obj } from "./object";

export class Player extends Obj {
  v: number;
  g: number;

  drt: number;
  stt: number;
  anim: number;

  isRunning: boolean;
  isJumping: boolean;
  isHoldingUp: boolean;
  isReflected: boolean;

  textures: any[][][];

  constructor(x: number, y: number, isRefleted: boolean) {
    super();
    this.isReflected = isRefleted;

    this.textures = playerTextures[isRefleted ? 1 : 0];
    this.x = x;
    this.y = y;
    this.v = 0;
    this.g = -0.5;
    this.t = 0;
    this.drt = DRTS.RIGHT;
    this.stt = STTS.STAND;
    this.anim = 0;
    this.isRunning = this.isJumping = this.isHoldingUp = false;
  }

  update() {
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

    this.y += this.v;
    let yNew = this.isReflected ? this.y : SCREEN_HEIGHT - this.y;

    // Check stop fall when the player is falling (this.v < 0)
    if (this.v <= 0) {
      // col_left and col_right of player
      const col_left = Math.floor((this.x - 5) / CELL_SIZE);
      const col_right = Math.floor((this.x + 5) / CELL_SIZE);

      const offset = this.isReflected ? 1 : -1;

      let row = Math.floor((yNew - offset) / CELL_SIZE);
      const rowAbove = Math.floor((yNew - 5 * offset) / CELL_SIZE) + offset;

      // If foot left or right of player is wall => stop fall
      if ((map[row]?.[col_left] || map[row]?.[col_right]) && !map[rowAbove]?.[col_left] && !map[rowAbove]?.[col_right]) {
        this.isJumping = false;

        row += offset;

        // do {
        //   row += 1;
        // } while (map[row]?.[col_left] === 1 || map[row]?.[col_right] === 1);

        this.y = (this.isReflected ? row : MAP_MAX_Y - 1 - row) * CELL_SIZE;

        this.v = 0;
      } else this.isJumping = true;
    }

    yNew = this.isReflected ? this.y : SCREEN_HEIGHT - this.y;

    // Get new position of player when run to left or right (old position + offset)
    const offset_ = offset[this.drt];

    if (this.isRunning) {
      const x_middle = Math.floor(this.x / CELL_SIZE);
      const x_edge = Math.floor((this.x + 10 * offset_) / CELL_SIZE);
      const y_top = Math.floor((yNew + (this.isReflected ? 12 : -12)) / CELL_SIZE);
      const y_bottom = Math.floor((yNew + (this.isReflected ? 1 : -1)) / CELL_SIZE);
      // If player is running, check new position has the wall or not, if not, translate position by offset
      if (map[y_top]?.[x_middle] === 1 || (map[y_top]?.[x_edge] === 0 && map[y_bottom]?.[x_edge] === 0)) {
        this.x += 4 * offset_;
      } else {
        // Otherwise, hold in position
        this.x = x_edge * CELL_SIZE - 9 * offset_ + CELL_SIZE * (1 - this.drt);
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
    const { x, y, w, h } = this.getArea();
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
    const newY = this.isReflected ? SCREEN_HEIGHT - (480 - this.y) : SCREEN_HEIGHT - this.y - 48;
    return { x: this.x - 24, y: newY, w: 48, h: 48 };
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
