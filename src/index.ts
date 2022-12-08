import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { baseMap, CELL_SIZE, DRTS, MAP_MAX_X, MAP_MAX_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "./configs/constants";
import { Background } from "./objects/background";
import { initMap, Map } from "./objects/map";
import { initPlayer, Player } from "./objects/player";

const stats: Stats = new (Stats as any)();
document.body.appendChild(stats.dom);

const rendererCanvas = document.getElementById("canvas") as HTMLCanvasElement;

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let then: any;
let total = 0;
let material: THREE.ShaderMaterial;
let mesh: THREE.Mesh;
let background: Background;
let map: Map;
let texture: THREE.Texture;
let waterTexture: THREE.Texture;
let mainPlayer: Player;
let reflectedPlayer: Player;

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const waterCanvas = document.createElement("canvas");
const waterContext = waterCanvas.getContext("2d");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
waterCanvas.width = SCREEN_WIDTH;
waterCanvas.height = SCREEN_HEIGHT / 2;

const render = (now: number = 0) => {
  if (!then) then = now;

  const elapsed = (now - then) / 1000;
  total += elapsed;

  material.uniforms.uTime.value = total;

  then = now;

  mainPlayer.update();
  reflectedPlayer.update();

  context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  background.render();
  map.render();

  mainPlayer.render();
  reflectedPlayer.render();

  waterContext.drawImage(canvas, 0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

  stats.update();

  texture.needsUpdate = true;
  waterTexture.needsUpdate = true;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

const init = async () => {
  // Loading ...
  background = new Background(context);
  await Promise.all([background.init(), initMap(), initPlayer()]);
  // Loaded

  mainPlayer = new Player(200, 400, false, context);
  reflectedPlayer = new Player(400, 400, true, context);

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: rendererCanvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setViewport(-SCREEN_WIDTH / 2, -SCREEN_HEIGHT / 2 - SCREEN_HEIGHT / 4, SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000);
  camera.position.set(0, 0, 15);

  map = new Map(context, baseMap);

  texture = new THREE.CanvasTexture(canvas);

  mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4.8, 1, 1),
    new THREE.MeshBasicMaterial({
      map: texture,
    })
  );
  mesh.position.set(0, 1.2, 0);
  scene.add(mesh);

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
  scene.add(mesh);

  requestAnimationFrame(render);
};

init();

let isDragging = false;
let isRightMouse = false;

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

rendererCanvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  isRightMouse = e.button === 2;

  drawMap(e);
});

rendererCanvas.addEventListener("mouseup", () => {
  isDragging = false;
});

rendererCanvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  drawMap(e);
});

rendererCanvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

const keyboard = () => {
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

keyboard();
