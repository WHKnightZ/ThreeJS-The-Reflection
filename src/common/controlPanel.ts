import { baseMap, CELL_SIZE, game, MAP_MAX_X, MAP_MAX_Y } from "../configs/constants";
import { Tree } from "../objects";
import { Rectangle } from "../types";
import { checkCanCollide, checkIntersect, getImageSrc } from "../utils/common";
import { map } from "./map";
import { commonTextures, mappingTiles, playerTextures, TreeTextures, treeTextures } from "./textures";

class Spawner {
  x: number;
  y: number;

  updatePosition() {
    const x = Math.floor(game.mouse.x / CELL_SIZE);
    let y = Math.floor(game.mouse.y / CELL_SIZE);
    let y2 = y - 1;
    while ((!baseMap[y]?.[x] || baseMap[y2]?.[x]) && y < MAP_MAX_Y) {
      y += 1;
      y2 += 1;
    }
    this.x = x;
    this.y = y;
  }

  checkError(): {
    error: boolean;
    show: boolean;
  } {
    if (game.mouse.x < 0) return { error: true, show: false };

    if (this.y >= MAP_MAX_Y || this.y < 0) return { error: true, show: false };
    return { error: false, show: true };
  }

  render(): void {}

  getArea(): Rectangle {
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  renderError(): void {
    const ERROR_SIZE = 24;
    const { x, y, w, h } = this.getArea();
    const centerX = x + w / 1.5 - ERROR_SIZE / 2;
    const centerY = y + h / 1.5 - ERROR_SIZE / 2;
    game.context.globalAlpha = 1;
    game.context.drawImage(commonTextures.error, centerX, centerY, ERROR_SIZE, ERROR_SIZE);
  }

  spawn(): void {}
}

class TreeSpawner extends Spawner {
  type: keyof TreeTextures;
  obj: Tree;

  constructor(type: keyof TreeTextures) {
    super();
    this.type = type;
    this.obj = new Tree(type, 0, 0);
  }

  checkError() {
    const { error, show } = super.checkError();
    if (error) return { error, show };

    const collided = game.objs.some((obj) => obj.getArea && checkCanCollide(this.obj, obj) && checkIntersect(this.obj.getArea(), obj.getArea()));

    return { error: collided, show: true };
  }

  render() {
    this.updatePosition();
    const { error, show } = this.checkError();
    if (!show) return;
    game.context.globalAlpha = 0.6;
    this.obj.set(this.x, this.y);
    this.obj.render();
    if (error) super.renderError();
    game.context.globalAlpha = 1;
  }

  getArea(): Rectangle {
    return this.obj.getArea();
  }

  spawn() {
    if (this.checkError().error) return;

    game.objs.push(new Tree(this.type, this.x, this.y));
  }
}

class TileSpawner extends Spawner {
  updatePosition() {
    const x = Math.floor(game.mouse.x / CELL_SIZE);
    const y = Math.floor(game.mouse.y / CELL_SIZE);
    this.x = x;
    this.y = y;
  }

  render() {
    this.updatePosition();
    if (!this.checkError().show) return;
    game.context.globalAlpha = 0.6;
    game.context.drawImage(mappingTiles[0], this.x * CELL_SIZE, this.y * CELL_SIZE);
    game.context.globalAlpha = 1;
  }

  spawn() {
    const newValue = game.mouse.isRightMouse ? 0 : 1;

    let x = Math.floor(((game.mouse.x / CELL_SIZE) * game.rendererCanvas.width) / game.rendererCanvas.clientWidth);
    let y = Math.floor(((game.mouse.y / CELL_SIZE) * game.rendererCanvas.height) / game.rendererCanvas.clientHeight);

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x >= MAP_MAX_X) x = MAP_MAX_X - 1;
    if (y >= MAP_MAX_Y) y = MAP_MAX_Y - 1;

    if (baseMap[y][x] === newValue) return;

    baseMap[y][x] = newValue;
    map.current.init(baseMap);
  }
}

export let selectedControl: {
  element?: HTMLImageElement;
  spawner?: Spawner;
} = {};

export let useHandTool = false;
export let useRemoveTool = false;

export const createControlPanel = () => {
  const createElement = (img: HTMLImageElement, parent: HTMLElement, spawner?: Spawner | null, onClick?: (() => void) | null) => {
    const element = img.cloneNode() as HTMLImageElement;
    element.addEventListener("click", () => {
      if (element === selectedControl.element) return;
      useHandTool = false;
      useRemoveTool = false;

      onClick?.();

      if (selectedControl.element) selectedControl.element.classList.remove("selected");

      selectedControl.element = element;
      selectedControl.element.classList.add("selected");
      selectedControl.spawner = spawner;
    });
    parent.appendChild(element);
  };
  const cpPlayer = document.getElementById("cp-player");
  createElement(playerTextures[0][0][0][0], cpPlayer);
  createElement(playerTextures[0][1][0][0], cpPlayer);
  const cpObjects = document.getElementById("cp-objects");
  createElement(mappingTiles[0], cpObjects, new TileSpawner());
  const cpTrees = document.getElementById("cp-trees");
  createElement(treeTextures.treeCactus, cpTrees, new TreeSpawner("treeCactus"));
  createElement(treeTextures.treeCactusSmall, cpTrees, new TreeSpawner("treeCactusSmall"));
  createElement(treeTextures.treePalm, cpTrees, new TreeSpawner("treePalm"));
  createElement(treeTextures.treePalmSmall, cpTrees, new TreeSpawner("treePalmSmall"));
  const cpTools = document.getElementById("cp-tools");
  const hand = new Image();
  hand.src = getImageSrc("hand");
  createElement(hand, cpTools, null, () => {
    useHandTool = true;
  });
  const remove = new Image();
  remove.src = getImageSrc("remove");
  createElement(remove, cpTools, null, () => {
    useRemoveTool = true;
  });
};
