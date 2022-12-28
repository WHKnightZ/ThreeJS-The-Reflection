import { backgroundTexture } from "../common/textures";
import { game, SCREEN_HEIGHT, SCREEN_WIDTH } from "../configs/constants";
import { Obj } from "./object";

export class Background extends Obj {
  img: HTMLImageElement;

  constructor() {
    super();
    this.priority = 0;
    this.img = backgroundTexture;
  }

  render() {
    game.context.drawImage(this.img, this.img.width / 3.2, 0, (this.img.height * SCREEN_WIDTH) / SCREEN_HEIGHT, this.img.height, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }
}
