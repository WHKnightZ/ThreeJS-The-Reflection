import { game, SCREEN_HEIGHT, SCREEN_WIDTH } from "../configs/constants";
import { getImageSrc } from "../utils/common";
import { Obj } from "./object";

export class Background extends Obj {
  img: HTMLImageElement;

  constructor() {
    super();
  }

  init = async () => {
    this.img = new Image();
    this.img.src = getImageSrc("background");
    return await new Promise((res) => {
      this.img.onload = () => {
        res(null);
      };
    });
  };

  render() {
    game.context.drawImage(this.img, this.img.width / 3.2, 0, (this.img.height * SCREEN_WIDTH) / SCREEN_HEIGHT, this.img.height, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }
}
