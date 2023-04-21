import { APP_NAME, mapInfo, CELL_SIZE, COLLISION_MATRIX, game, MAP_MAX_Y, OBJ_LAYERS } from "../configs/constants";
import type { Obj } from "../objects/object";
import { Flag, Player, Tree, Wall, Switch } from "../objects";
import { Map } from "../objects/map";
import { Rectangle } from "../types";
import { map } from "../common/map";

export const getAppName = () => APP_NAME;

export const flipHorizontal = (image: HTMLImageElement, callback?: (img: HTMLImageElement) => void) => {
  const width = image.width;
  const height = image.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  context.translate(width, 0);
  context.scale(-1, 1);
  context.drawImage(image, 0, 0);

  image = new Image();
  image.src = canvas.toDataURL("image/png");

  return new Promise(
    (res) =>
      (image.onload = () => {
        res(image);
        callback?.(image);
      })
  );
};

export const flipVertical = (image: HTMLImageElement, callback?: (img: HTMLImageElement) => void) => {
  const width = image.width;
  const height = image.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  context.translate(0, 0);
  context.scale(1, -1);
  context.drawImage(image, 0, -image.height);

  image = new Image();
  image.src = canvas.toDataURL("image/png");

  return new Promise(
    (res) =>
      (image.onload = () => {
        res(image);
        callback?.(image);
      })
  );
};

export const resize = (image: HTMLImageElement, scale = 1) => {
  const width = image.width * scale;
  const height = image.height * scale;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);

  image = new Image();
  image.src = canvas.toDataURL("image/png");

  return new Promise((res) => (image.onload = () => res(image)));
};

export const getImageSrc = (src: string, ext: "png" | "jpg" | "svg" = "png") => `/static/images/${src}.${ext}`;

export const checkIsReflected = (y: number) => (y >= Math.floor(MAP_MAX_Y / 2) ? 1 : 0);

// Kiểm tra xem 2 hình chữ nhật có giao nhau không
export const checkIntersect = (rect1: Rectangle, rect2: Rectangle) => {
  if (!rect1 || !rect2) return false;
  if (rect2.x + rect2.w <= rect1.x || rect1.x + rect1.w <= rect2.x) return false;
  if (rect1.y + rect1.h <= rect2.y || rect2.y + rect2.h <= rect1.y) return false;
  return true;
};

export const checkCanCollide = (obj1: Obj, obj2: Obj) => {
  if (obj1.layer === undefined || obj2.layer === undefined) return false;
  return !!COLLISION_MATRIX[obj1.layer][obj2.layer];
};

export const drawWire = (x: number, y: number, w: number, h: number) => {
  game.context.globalAlpha = 1;
  game.context.beginPath();
  game.context.rect(x, y, w, h);
  game.context.stroke();
};

export const drawCellWire = (x: number, y: number) => {
  drawWire(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
};

export const initMap = () => {
  game.players = [];
  game.objs = [];
  game.particles = [];

  map.current = new Map(mapInfo.baseMap);
  const players = mapInfo.players.map((player) => new Player(player.x, player.y, player.drt));
  game.players = players;
  players.forEach((player) => game.objs.push(player));
  mapInfo.trees.forEach(({ type, x, y }) => game.objs.push(new Tree(type as any, x, y)));
  mapInfo.flags.forEach(({ x, y }) => game.objs.push(new Flag(x, y)));
  mapInfo.walls.forEach(({ x, y }) => game.objs.push(new Wall(x, y)));
  mapInfo.switches.forEach(({ x, y }) => game.objs.push(new Switch(x, y)));
  for (const key in mapInfo.links) {
    mapInfo.links[key].forEach((key2: string) => {
      game.objs.find((o) => o.id === key).linkedObjs.push(game.objs.find((o) => o.id === key2));
    });
  }
};

export const importMap = () => {
  const inputFile = document.getElementById("input-file");
  inputFile.click();
  inputFile.onchange = (e: any) => {
    const files = e.target.files;
    if (!files?.[0]) return;

    const file = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        const newMapInfo = JSON.parse(text as string);
        mapInfo.baseMap = newMapInfo.baseMap;
        mapInfo.players = newMapInfo.players;
        mapInfo.trees = newMapInfo.trees;
        mapInfo.flags = newMapInfo.flags;
        mapInfo.walls = newMapInfo.walls;
        mapInfo.switches = newMapInfo.switches;
        initMap();
      } catch {}
    };
    reader.readAsText(file);

    e.target.value = null;
  };
};

export const exportMap = () => {
  const trees = <Tree[]>game.objs.filter((obj) => obj.layer === OBJ_LAYERS.TREE);
  const players = game.players;
  const flags = <Flag[]>game.objs.filter((obj) => obj.layer === OBJ_LAYERS.FLAG);

  const data = {
    baseMap: mapInfo.baseMap,
    trees: trees.map((tree) => ({ type: tree.type, x: tree.x_, y: tree.y_ })),
    players: players.map((player) => player.savedInfo),
    flags: flags.map((flag) => ({ x: flag.x_, y: flag.y_ })),
  };

  const a = document.createElement("a");
  a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  a.download = "map.json";
  a.click();
};

export const getClickedObject = (_x: number, _y: number) => {
  let ret: Obj | null = null;

  game.objs.reduceRight((_: any, obj) => {
    if (ret) return;

    if (obj.getArea) {
      const { x, y, w, h } = obj.getArea();

      const { w: extraWidth, h: extraHeight } = obj.clickedExtraArea;

      if (_x >= x - extraWidth && _x <= x + w + extraWidth && _y >= y - extraHeight && _y <= y + h + extraHeight) ret = obj;
    }
  }, null);

  return ret;
};
