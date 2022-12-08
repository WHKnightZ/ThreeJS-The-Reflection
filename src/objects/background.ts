import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../configs/constants";

export class Background {
  context: CanvasRenderingContext2D;
  img: HTMLImageElement;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  init = async () => {
    this.img = new Image();
    this.img.src = "/static/images/background.png";
    return await new Promise((res) => {
      this.img.onload = () => {
        res(null);
      };
    });
  };

  render() {
    this.context.drawImage(this.img, this.img.width / 3.2, 0, (this.img.height * SCREEN_WIDTH) / SCREEN_HEIGHT, this.img.height, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }
}
