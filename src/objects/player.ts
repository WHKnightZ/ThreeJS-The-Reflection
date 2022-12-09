import { CELL_SIZE, DRTS, baseMap as map, offset, STTS, VELOCITY_DEFAULT, VELOCITY_MIN, SCREEN_HEIGHT, game } from "../configs/constants";
import { flipHorizontal, flipVertical, getImageSrc } from "../utils/common";
import { Obj } from "./object";

const imageSrcs = {
  jump0: "jump-0",
  jump1: "jump-1",
  stand0: "stand-0",
  stand1: "stand-1",
  stand2: "stand-2",
  run0: "run-0",
  run1: "run-1",
  run2: "run-2",
};

type Images = { [Property in keyof typeof imageSrcs]: any };

let textures: any[][][][];

export const initPlayer = async () => {
  const rightImages: Images = { ...imageSrcs };
  const leftImages: Images = { ...imageSrcs };

  const loadImage = (key: string, src: string) => {
    const image = new Image();
    (rightImages as any)[key] = image;
    image.src = getImageSrc(src);
    return new Promise((res) => (image.onload = () => res(image)));
  };

  await Promise.all(Object.keys(rightImages).map((key) => loadImage(key, (rightImages as any)[key])));
  const keys = Object.keys(rightImages);
  (await Promise.all(keys.map((key) => flipHorizontal((rightImages as any)[key])))).forEach((image, index) => {
    (leftImages as any)[keys[index]] = image;
  });

  const mainTextures = [
    [
      [leftImages.stand0, leftImages.stand1, leftImages.stand2, leftImages.stand1],
      [leftImages.run0, leftImages.run1, leftImages.run2, leftImages.run1],
      [leftImages.jump0, leftImages.jump1],
    ],
    [
      [rightImages.stand0, rightImages.stand1, rightImages.stand2, rightImages.stand1],
      [rightImages.run0, rightImages.run1, rightImages.run2, rightImages.run1],
      [rightImages.jump0, rightImages.jump1],
    ],
  ];
  const reflectedTextures = await Promise.all(mainTextures.map(async (a) => await Promise.all(a.map(async (b) => await Promise.all(b.map(flipVertical))))));

  textures = [mainTextures, reflectedTextures];
};

export class Player extends Obj {
  x: number;
  y: number;
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

    this.textures = textures[isRefleted ? 1 : 0];
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
    let yNew = this.isReflected ? this.y : 480 - this.y;

    // Check stop fall when the player is falling (this.v < 0)
    if (this.v <= 0) {
      // col_left and col_right of player
      const col_left = Math.floor((this.x - 5) / CELL_SIZE);
      const col_right = Math.floor((this.x + 5) / CELL_SIZE);
      let row = Math.floor(yNew / CELL_SIZE);

      // If foot left or right of player is wall => stop fall
      if (map[row]?.[col_left] || map[row]?.[col_right]) {
        this.isJumping = false;

        row += this.isReflected ? 1 : -1;

        // do {
        //   row += 1;
        // } while (map[row]?.[col_left] === 1 || map[row]?.[col_right] === 1);

        this.y = (this.isReflected ? row : 29 - row) * CELL_SIZE;
        this.v = 0;
      } else this.isJumping = true;
    }

    yNew = this.isReflected ? this.y : 480 - this.y;

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
    const newY = this.isReflected ? SCREEN_HEIGHT - (480 - this.y) : SCREEN_HEIGHT - this.y - 48;
    game.context.drawImage(this.textures[this.drt][this.stt][this.anim], this.x - 24, newY, 48, 48);
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
