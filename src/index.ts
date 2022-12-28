import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { baseMap, DRTS, game, objs, playersInfo, SCREEN_HEIGHT, SCREEN_WIDTH, treesInfo } from "./configs/constants";
import { Loading } from "./common/loading";
import { loadTextures } from "./common/textures";
import { Background, Map, Player, Tree } from "./objects";
import { createControlPanel, selectedControl } from "./common/controlPanel";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { map } from "./common/map";

const stats: Stats = new (Stats as any)();
document.body.appendChild(stats.dom);

const rendererCanvas = document.getElementById("canvas") as HTMLCanvasElement;
rendererCanvas.width = SCREEN_WIDTH;
rendererCanvas.height = SCREEN_HEIGHT;

// Timer
let then: any;
let total = 0;

// Objects
let loading: Loading;
let material: THREE.ShaderMaterial;
let mesh: THREE.Mesh;
let background: Background;
let texture: THREE.Texture;
let waterTexture: THREE.Texture;
let mainPlayer: Player;
let reflectedPlayer: Player;

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
  objs.sort((a, b) => (a.priority < b.priority ? -1 : 1)).forEach((obj) => obj.render?.());

  selectedControl.spawner?.render();

  waterContext.drawImage(game.canvas, 0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

  stats.update();

  texture.needsUpdate = true;
  waterTexture.needsUpdate = true;

  game.scene.position.setX((x + x2) / 200);
  game.renderer.render(game.scene, game.camera);

  requestAnimationFrame(render);
};

const registerMouseEvents = () => {
  window.addEventListener("mousedown", (e) => {
    if (!rendererCanvas.contains(e.target as any)) return;
    oldPos = e.x;
    game.mouse.isDragging = true;
    game.mouse.isRightMouse = e.button === 2;

    selectedControl.spawner?.spawn();
  });

  window.addEventListener("mouseup", () => {
    // x = x + x2;
    // x2 = 0;
    game.mouse.isDragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (rendererCanvas.contains(e.target as any)) {
      game.mouse.x = e.offsetX;
      game.mouse.y = e.offsetY;
    }

    if (!game.mouse.isDragging) return;

    selectedControl.spawner?.spawn();

    // const offset = e.x - oldPos;

    // x2 = offset;
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

const init = async () => {
  game.canvas = document.createElement("canvas");
  game.context = game.canvas.getContext("2d");
  game.rendererCanvas = rendererCanvas;
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
  game.mouse = { x: -1, y: -1, isDragging: false, isRightMouse: false };

  // new OrbitControls(game.camera, game.renderer.domElement);

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
  map.current = new Map(baseMap);
  mainPlayer = new Player(playersInfo.main.x, playersInfo.main.y, false);
  reflectedPlayer = new Player(playersInfo.reflected.x, playersInfo.reflected.y, true);

  objs.push(background);
  objs.push(map.current);
  treesInfo.forEach(({ type, x, y }) => {
    objs.push(new Tree(type as any, x, y));
  });
  objs.push(mainPlayer);
  objs.push(reflectedPlayer);

  registerMouseEvents();
  registerKeyboardEvents();

  requestAnimationFrame(render);
};

// Main
init();
