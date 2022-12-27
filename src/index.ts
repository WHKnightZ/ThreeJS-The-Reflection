import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { baseMap, CELL_SIZE, DRTS, game, MAP_MAX_X, MAP_MAX_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "./configs/constants";
import { Loading } from "./common/loading";
import { loadTextures, mappingTiles, playerTextures, treeTextures } from "./common/textures";
import { Background, Map, Obj, Player, Tree } from "./objects";
import { getImageSrc } from "./utils/common";

const stats: Stats = new (Stats as any)();
document.body.appendChild(stats.dom);

const rendererCanvas = document.getElementById("canvas") as HTMLCanvasElement;
rendererCanvas.width = SCREEN_WIDTH;
rendererCanvas.height = SCREEN_HEIGHT;

// Timer
let then: any;
let total = 0;

// Object
let loading: Loading;
let material: THREE.ShaderMaterial;
let mesh: THREE.Mesh;
let background: Background;
let map: Map;
let texture: THREE.Texture;
let waterTexture: THREE.Texture;
let mainPlayer: Player;
let reflectedPlayer: Player;
let trees: Tree[];
let objs: Obj[] = [];

// Event
let isDragging = false;
let isRightMouse = false;

const waterCanvas = document.createElement("canvas");
const waterContext = waterCanvas.getContext("2d");

let oldPos: number;
let x: number = 0;
let x2: number = 0;

const render = (now: number = 0) => {
  if (!then) then = now;

  const elapsed = (now - then) / 1000;
  total += elapsed;

  material.uniforms.uTime.value = total;

  then = now;

  objs.forEach((obj) => obj.update?.());
  objs.forEach((obj) => obj.render?.());

  waterContext.drawImage(game.canvas, 0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

  stats.update();

  texture.needsUpdate = true;
  waterTexture.needsUpdate = true;

  game.scene.position.setX((x + x2) / 200);
  game.renderer.render(game.scene, game.camera);

  requestAnimationFrame(render);
};

const drawMap = (e: MouseEvent) => {
  const newValue = isRightMouse ? 0 : 1;

  let x = Math.floor(((e.offsetX / CELL_SIZE) * rendererCanvas.width) / rendererCanvas.clientWidth);
  let y = Math.floor(((e.offsetY / CELL_SIZE) * rendererCanvas.height) / rendererCanvas.clientHeight);

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x >= MAP_MAX_X) x = MAP_MAX_X - 1;
  if (y >= MAP_MAX_Y) y = MAP_MAX_Y - 1;

  if (baseMap[y][x] === newValue) return;

  baseMap[y][x] = newValue;
  map.init(baseMap);
};

const registerMouseEvents = () => {
  window.addEventListener("mousedown", (e) => {
    if (!rendererCanvas.contains(e.target as any)) return;
    oldPos = e.x;
    isDragging = true;
    isRightMouse = e.button === 2;

    drawMap(e);
  });

  window.addEventListener("mouseup", () => {
    x = x + x2;
    x2 = 0;
    isDragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const offset = e.x - oldPos;

    x2 = offset;

    // drawMap(e);
  });

  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
};

const registerKeyboardEvents = () => {
  document.addEventListener(
    "keydown",
    (e) => {
      const key = e.key;

      switch (key) {
        case "ArrowLeft":
          mainPlayer.lrHold(DRTS.LEFT);
          reflectedPlayer.lrHold(DRTS.LEFT);
          break;

        case "ArrowRight":
          mainPlayer.lrHold(DRTS.RIGHT);
          reflectedPlayer.lrHold(DRTS.RIGHT);
          break;

        case "ArrowUp":
          mainPlayer.upHold();
          reflectedPlayer.upHold();
          break;

        default:
          break;
      }
    },
    false
  );

  document.addEventListener(
    "keyup",
    (e) => {
      const key = e.key;

      switch (key) {
        case "ArrowLeft":
          mainPlayer.lrRelease(DRTS.LEFT);
          reflectedPlayer.lrRelease(DRTS.LEFT);
          break;

        case "ArrowRight":
          mainPlayer.lrRelease(DRTS.RIGHT);
          reflectedPlayer.lrRelease(DRTS.RIGHT);
          break;

        case "ArrowUp":
          mainPlayer.upRelease();
          reflectedPlayer.upRelease();
          break;

        default:
          break;
      }
    },
    false
  );
};

const createControlPanel = () => {
  const createElement = (img: HTMLImageElement, parent: HTMLElement, onClick: () => void) => {
    const element = img.cloneNode();
    parent.appendChild(element);
  };
  const cpPlayer = document.getElementById("cp-player");
  createElement(playerTextures[0][0][0][0], cpPlayer, () => {});
  createElement(playerTextures[0][1][0][0], cpPlayer, () => {});
  const cpObjects = document.getElementById("cp-objects");
  createElement(mappingTiles[0], cpObjects, () => {});
  const cpTrees = document.getElementById("cp-trees");
  createElement(treeTextures.treeCactus, cpTrees, () => {});
  createElement(treeTextures.treeCactusSmall, cpTrees, () => {});
  createElement(treeTextures.treePalm, cpTrees, () => {});
  createElement(treeTextures.treePalmSmall, cpTrees, () => {});
  const cpTools = document.getElementById("cp-tools");
  const hand = new Image();
  hand.src = getImageSrc("hand");
  createElement(hand, cpTools, () => {});
};

const init = async () => {
  game.canvas = document.createElement("canvas");
  game.context = game.canvas.getContext("2d");
  game.canvas.width = SCREEN_WIDTH;
  game.canvas.height = SCREEN_HEIGHT;
  waterCanvas.width = SCREEN_WIDTH;
  waterCanvas.height = SCREEN_HEIGHT / 2;
  game.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: rendererCanvas });
  game.renderer.setPixelRatio(window.devicePixelRatio);
  game.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  game.scene = new THREE.Scene();
  game.scene.background = new THREE.Color("#a5ebcc");
  game.camera = new THREE.PerspectiveCamera(35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000);
  game.camera.position.set(0, 0, 15);

  loading = new Loading();

  // Loading ...
  loading.begin();
  await loadTextures();
  // Loaded
  // await new Promise((resolve) => setTimeout(() => resolve(null), 100000));
  loading.end();

  createControlPanel();

  game.renderer.setViewport(-SCREEN_WIDTH / 2, -SCREEN_HEIGHT / 2 - SCREEN_HEIGHT / 4, SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2);

  background = new Background();

  texture = new THREE.CanvasTexture(game.canvas);

  mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4.8, 1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
    })
  );
  mesh.position.set(0, 1.2, 0);
  game.scene.add(mesh);

  waterTexture = new THREE.CanvasTexture(waterCanvas);

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: waterTexture },
    },
    vertexShader: require("./shaders/vertex.glsl"),
    fragmentShader: require("./shaders/fragment.glsl"),
  });

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.4, 60, 30), material);
  mesh.position.set(0, 0, 0);
  game.scene.add(mesh);

  // Objects
  trees = [new Tree("treePalmSmall", 12, 11), new Tree("treePalm", 18, 13), new Tree("treeCactus", 25, 13), new Tree("treeCactusSmall", 36, 13)];
  map = new Map(baseMap);
  mainPlayer = new Player(200, 400, false);
  reflectedPlayer = new Player(400, 400, true);

  objs.push(background);
  trees.forEach((tree) => objs.push(tree));
  objs.push(map);
  objs.push(mainPlayer);
  objs.push(reflectedPlayer);

  registerMouseEvents();
  registerKeyboardEvents();

  requestAnimationFrame(render);
};

// Main
init();
