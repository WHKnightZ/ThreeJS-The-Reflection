import { mapInfo, CELL_SIZE, DRTS, game, MAP_MAX_X, MAP_MAX_Y, OBJ_LAYERS, REFLECTED_OFFSETS } from "../configs/constants";
import { Flag, Player, Tree } from "../objects";
import { Explosion } from "../objects/explosion";
import { Obj } from "../objects/object";
import { Rectangle } from "../types";
import { checkCanCollide, checkIntersect, checkIsReflected, exportMap, getImageSrc, importMap } from "../utils/common";
import { map } from "./map";
import { commonTextures, flagTextures, mappingTiles, playerTextures, treeTextures, TreeTextureTypes } from "./textures";

class Spawner {
  x: number;
  y: number;
  obj: Obj;
  isPaused: boolean;
  pauseDelay: number;

  constructor(pauseDelay: number = 100) {
    this.isPaused = false;
    this.pauseDelay = pauseDelay;
  }

  pause() {
    this.isPaused = true;
    setTimeout(() => (this.isPaused = false), this.pauseDelay);
  }

  updatePosition() {
    const map = mapInfo.baseMap;
    const x = Math.floor(game.mouse.x / CELL_SIZE);
    let y = Math.floor(game.mouse.y / CELL_SIZE);
    const reflected = checkIsReflected(y);
    const offset = REFLECTED_OFFSETS[reflected];

    const loopCondition = (y: number) => (reflected ? y > MAP_MAX_Y / 2 : y < MAP_MAX_Y / 2 - 1);

    let y2 = y - offset;
    while (!map[y]?.[x] || map[y2]?.[x]) {
      if (!loopCondition(y)) {
        this.y = -1;
        return;
      }
      y += offset;
      y2 += offset;
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

  checkCollide() {
    return game.objs.some((obj) => obj.getArea && checkCanCollide(this.obj, obj) && checkIntersect(this.obj.getArea(), obj.getArea()));
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

class PlayerSpawner extends Spawner {
  drt: number;

  constructor(drt: number) {
    super();
    this.drt = drt;
    this.obj = new Player(0, 0);
  }

  render() {
    const { show } = this.checkError();
    if (!show) return;
    game.context.globalAlpha = 0.6;
    this.obj.set(game.mouse.x, game.mouse.y, this.drt);
    this.obj.render();
    game.context.globalAlpha = 1;
  }

  getArea(): Rectangle {
    return this.obj.getArea();
  }

  spawn() {
    if (this.checkError().error || this.isPaused) return;

    const thisPlayer = <Player>this.obj;

    const sameDrtObj = game.players.find((p) => p.isReflected === thisPlayer.isReflected);
    if (sameDrtObj) sameDrtObj.set(thisPlayer.x, thisPlayer.y, thisPlayer.drt);
    else {
      const player = new Player(thisPlayer.x, thisPlayer.y, thisPlayer.drt);
      game.players.push(player);
      game.objs.push(player);
    }
    this.pause();
  }
}

class TreeSpawner extends Spawner {
  type: TreeTextureTypes;

  constructor(type: TreeTextureTypes) {
    super();
    this.type = type;
    this.obj = new Tree(type, 0, 0);
  }

  checkError() {
    const { error, show } = super.checkError();
    if (error) return { error, show };

    const collided = this.checkCollide();

    return { error: collided, show: true };
  }

  render() {
    this.updatePosition();
    const { error, show } = this.checkError();
    if (!show) return;
    game.context.globalAlpha = 0.6;
    this.obj.set(this.x, this.y);
    this.obj.render();
    if (error) this.renderError();
    game.context.globalAlpha = 1;
  }

  getArea(): Rectangle {
    return this.obj.getArea();
  }

  spawn() {
    if (this.checkError().error || this.isPaused) return;

    game.objs.push(new Tree(this.type, this.x, this.y));
    this.pause();
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

  spawn(remove?: boolean) {
    const newValue = game.mouse.isRightMouse || remove ? 0 : 1;

    // let x = Math.floor(((game.mouse.x / CELL_SIZE) * game.rendererCanvas.width) / game.rendererCanvas.clientWidth);
    // let y = Math.floor(((game.mouse.y / CELL_SIZE) * game.rendererCanvas.height) / game.rendererCanvas.clientHeight);
    let x = Math.floor(game.mouse.x / CELL_SIZE);
    let y = Math.floor(game.mouse.y / CELL_SIZE);

    const baseMap = mapInfo.baseMap;

    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x >= MAP_MAX_X) x = MAP_MAX_X - 1;
    if (y >= MAP_MAX_Y) y = MAP_MAX_Y - 1;

    if (baseMap[y][x] === newValue) return false;

    baseMap[y][x] = newValue;
    map.current.init(baseMap);
    return true;
  }
}

class FlagSpawner extends Spawner {
  constructor() {
    super();
    this.obj = new Flag(0, 0);
  }

  checkError() {
    const { error, show } = super.checkError();
    if (error) return { error, show };

    const collided = this.checkCollide();

    return { error: collided, show: true };
  }

  render() {
    this.updatePosition();
    const { error, show } = this.checkError();
    if (!show) return;
    game.context.globalAlpha = 0.6;
    this.obj.set(this.x, this.y);
    this.obj.render();
    if (error) this.renderError();
    game.context.globalAlpha = 1;
  }

  getArea(): Rectangle {
    return this.obj.getArea();
  }

  spawn() {
    if (this.checkError().error || this.isPaused) return;

    const sameDrtObj = game.objs.find((obj) => obj.layer === OBJ_LAYERS.FLAG && checkIsReflected(obj.y_) === checkIsReflected(this.y));
    if (sameDrtObj) sameDrtObj.set(this.x, this.y);
    else game.objs.push(new Flag(this.x, this.y));
    this.pause();
  }
}

class RemoveSpawner extends Spawner {
  tileSpawner: TileSpawner;

  constructor(tileSpawner: TileSpawner) {
    super();
    this.tileSpawner = tileSpawner;
  }

  render() {
    const { show } = this.checkError();
    if (!show) return;

    game.context.drawImage(commonTextures.remove, game.mouse.x - 12, game.mouse.y - 12, 24, 24);
  }

  spawn() {
    if (this.checkError().error || this.isPaused) return;

    const mouseRect = { x: game.mouse.x - 16, y: game.mouse.y - 16, w: 32, h: 32 };
    const removedIndex = game.objs.findIndex((obj) => checkIntersect(obj.getArea?.(), mouseRect));
    if (removedIndex === -1) {
      if (this.tileSpawner.spawn(true)) this.pause();

      return;
    }
    const removedItem = game.objs.splice(removedIndex, 1)[0];
    if (removedItem.layer === OBJ_LAYERS.PLAYER) game.players = game.players.filter((p) => p.id !== removedItem.id);
    this.pause();
  }
}

class ExplosionSpawner extends Spawner {
  constructor() {
    super(200);
  }

  spawn() {
    if (this.checkError().error || this.isPaused) return;

    game.explosions.push(new Explosion(game.mouse.x, game.mouse.y));
    this.pause();
  }
}

export let selectedControl: {
  element?: HTMLElement;
  spawner?: Spawner;
} = {};

export let useHandTool = false;

export const createControlPanel = () => {
  const createElement = (img: HTMLImageElement, parent: HTMLElement, spawner?: Spawner | null, onClick?: (() => void) | null) => {
    const element = img.cloneNode() as HTMLImageElement;
    element.addEventListener("click", () => {
      if (element === selectedControl.element) return;
      useHandTool = false;

      onClick?.();

      if (selectedControl.element) selectedControl.element.classList.remove("selected");

      selectedControl.element = element;
      selectedControl.element.classList.add("selected");
      selectedControl.spawner = spawner;
    });
    parent.appendChild(element);
  };
  const cpPlayer = document.getElementById("cp-player");
  createElement(playerTextures[0][0][0][0], cpPlayer, new PlayerSpawner(DRTS.LEFT));
  createElement(playerTextures[0][1][0][0], cpPlayer, new PlayerSpawner(DRTS.RIGHT));
  const cpObjects = document.getElementById("cp-objects");
  const tileSpawner = new TileSpawner();
  createElement(mappingTiles[0], cpObjects, tileSpawner);
  createElement(flagTextures[0][0], cpObjects, new FlagSpawner());
  const cpTrees = document.getElementById("cp-trees");
  createElement(treeTextures[0].treeCactus, cpTrees, new TreeSpawner("treeCactus"));
  createElement(treeTextures[0].treeCactusSmall, cpTrees, new TreeSpawner("treeCactusSmall"));
  createElement(treeTextures[0].treePalm, cpTrees, new TreeSpawner("treePalm"));
  createElement(treeTextures[0].treePalmSmall, cpTrees, new TreeSpawner("treePalmSmall"));
  const cpTools = document.getElementById("cp-tools");
  const hand = new Image();
  hand.src = getImageSrc("hand");
  createElement(hand, cpTools, null, () => {
    useHandTool = true;
  });
  const remove = new Image();
  remove.src = getImageSrc("remove");
  createElement(remove, cpTools, new RemoveSpawner(tileSpawner));
  const explosion = new Image();
  explosion.src = getImageSrc("explosion");
  createElement(explosion, cpTools, new ExplosionSpawner());

  const btnImport = document.getElementById("btn-import");
  btnImport.addEventListener("click", () => {
    importMap();
  });

  const btnExport = document.getElementById("btn-export");
  btnExport.addEventListener("click", () => {
    exportMap();
  });

  const btnPlay = document.getElementById("btn-play");
  btnPlay.addEventListener("click", () => {});

  const btnReset = document.getElementById("btn-reset");
  btnReset.addEventListener("click", () => {
    game.players.forEach((player) => player.reset());
  });

  const updater = () => {
    if (game.mouse.isDragging && game.mouse.x >= 0) {
      if (useHandTool) {
      }
    }
  };

  const renderer = () => {};

  return { updater, renderer };
};
