import { CELL_SIZE, DRTS, baseMap as map, offset, STTS, VELOCITY_DEFAULT, VELOCITY_MIN, SCREEN_HEIGHT } from "../configs/constants";

export class Player {
  context: CanvasRenderingContext2D;

  x: number;
  y: number;
  v: number;
  g: number;

  t: number;
  drt: number;
  stt: number;
  anim: number;

  isRunning: boolean;
  isJumping: boolean;
  isHoldingUp: boolean;

  textures: any[][][];

  constructor(context: CanvasRenderingContext2D, textures: any[][][]) {
    this.context = context;

    this.textures = textures;
    this.x = 200;
    this.y = 400;
    this.v = 0;
    this.g = -1;
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

    const y_old = this.y;

    // Every consterval, velocity increase by gravity
    this.v += this.g;

    // Set max value of velocity
    if (this.v < VELOCITY_MIN) this.v = VELOCITY_MIN;

    this.y += this.v;

    // Check stop fall when the player is falling (this.v < 0)
    if (this.v <= 0) {
      // col_left and col_right of player
      const col_left = Math.floor((this.x - 9) / CELL_SIZE);
      const col_right = Math.floor((this.x + 9) / CELL_SIZE);
      const row_old = Math.floor(y_old / CELL_SIZE);
      const row = Math.floor(this.y / CELL_SIZE);
      // If foot left or right of player is wall => stop fall
      if (!map[row_old][col_left] && !map[row_old][col_right] && (map[row][col_left] || map[row][col_right])) {
        this.isJumping = false;
        this.y = (row + 1) * CELL_SIZE;
        this.v = 0;
      }
    }

    // Get new position of player when run to left or right (old position + offset)
    const offset_ = offset[this.drt];

    if (this.isRunning) {
      const x_middle = Math.floor(this.x / CELL_SIZE);
      const x_edge = Math.floor((this.x + 12 * offset_) / CELL_SIZE);
      const y_top = Math.floor((this.y + 1) / CELL_SIZE);
      const y_bottom = Math.floor((this.y + 1) / CELL_SIZE);
      // If player is running, check new position has the wall or not, if not, translate position by offset
      if (map[y_top][x_middle] == 1 || (map[y_top][x_edge] == 0 && map[y_bottom][x_edge] == 0)) {
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
    this.context.drawImage(this.textures[this.drt][this.stt][this.anim], this.x - 24, SCREEN_HEIGHT - this.y - 48, 48, 48);
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
}
