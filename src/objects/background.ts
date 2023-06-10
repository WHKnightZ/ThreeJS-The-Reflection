import { backgroundTexture } from "@/common/textures";
import { game, SCREEN_HEIGHT, SCREEN_WIDTH } from "@/configs/constants";
import { Base } from "./base";

export class Background extends Base {
  constructor() {
    super();
    this.texture = backgroundTexture;
  }

  render() {
    game.context.drawImage(
      this.texture,
      this.texture.width / 3.2,
      0,
      (this.texture.height * SCREEN_WIDTH) / SCREEN_HEIGHT,
      this.texture.height,
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT
    );
  }
}
