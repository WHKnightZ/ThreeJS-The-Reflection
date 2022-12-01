import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { baseMap, CELL_SIZE, MAP_MAX_X, MAP_MAX_Y, SCREEN_HEIGHT, SCREEN_WIDTH } from "./configs/constants";
import { initMap, Map } from "./objects/map";

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
let map: Map;

let material2: any;

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const waterCanvas = document.createElement("canvas");
const waterContext = waterCanvas.getContext("2d");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;
waterCanvas.width = SCREEN_WIDTH;
waterCanvas.height = SCREEN_HEIGHT / 2;

let texture2: any;

const render = (now: number = 0) => {
  if (!then) then = now;

  const elapsed = (now - then) / 1000;
  total += elapsed;

  material.uniforms.uTime.value = total;

  then = now;

  context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  map.render();
  waterContext.drawImage(canvas, 0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

  stats.update();
  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

const init = async () => {
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: rendererCanvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setViewport(-SCREEN_WIDTH / 2, -SCREEN_HEIGHT / 2 - SCREEN_HEIGHT / 4, SCREEN_WIDTH * 2, SCREEN_HEIGHT * 2);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000);
  camera.position.set(0, 0, 15);

  await initMap();

  map = new Map(context, baseMap);

  texture2 = new THREE.CanvasTexture(canvas);

  material2 = new THREE.MeshBasicMaterial({
    map: texture2,
  });
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.8, 1, 1), material2);
  mesh.position.set(0, 1.2, 0);
  scene.add(mesh);

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: new THREE.CanvasTexture(waterCanvas) },
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

  // console.log(x, y);

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x >= MAP_MAX_X) x = MAP_MAX_X - 1;
  if (y >= MAP_MAX_Y) y = MAP_MAX_Y - 1;

  if (baseMap[y][x] === newValue) return;

  baseMap[y][x] = newValue;
  map.init(baseMap);

  texture2.needsUpdate = true;
  // material2.map = new THREE.CanvasTexture(canvas);
  // material.uniforms.uTexture.value = new THREE.CanvasTexture(waterCanvas);
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
