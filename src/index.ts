import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { DRTS, game, SCREEN_HEIGHT, SCREEN_WIDTH } from "./configs/constants";
import { Loading } from "./common/loading";
import { loadTextures } from "./common/textures";
import { Background } from "./objects/background";
import { createControlPanel, selectedControl } from "./common/controlPanel";
import { checkIntersect, getClickedObject, initMap } from "./utils/common";
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

const waterCanvas = document.createElement("canvas");
const waterContext = waterCanvas.getContext("2d");

const render = (now: number = 0) => {
  requestAnimationFrame(render);

  if (!then) then = now;

  const elapsed = (now - then) / 1000;
  total += elapsed;

  then = now;

  // if (elapsed > 0.1) {
  //   then = now;
  // } else {
  //   return;
  // }

  material.uniforms.uTime.value = total;

  game.objs.forEach((obj) => obj.update?.());

  // Explosion
  let needUpdateExplosions = false;
  game.particles.forEach((obj) => {
    obj.update();
    needUpdateExplosions = needUpdateExplosions || !obj.isAlive;
  });
  if (needUpdateExplosions) game.particles = game.particles.filter((obj) => obj.isAlive);

  // Collision
  const objs = game.objs;
  for (let i = 0; i < objs.length - 1; i += 1) {
    for (let j = i + 1; j < objs.length; j += 1) {
      const obj1 = objs[i];
      const obj2 = objs[j];
      const obj1Id = obj1.id;
      const obj2Id = obj2.id;

      const collided = checkIntersect(obj1.getArea?.(), obj2.getArea?.());

      if (obj1.collidedObjs[obj2Id]) {
        if (!collided) {
          obj1.onLeaveObject?.(obj2);
          obj2.onLeaveObject?.(obj1);
          obj1.collidedObjs[obj2Id] = false;
          obj2.collidedObjs[obj1Id] = false;
        }
      } else {
        if (collided) {
          obj1.onEnterObject?.(obj2);
          obj2.onEnterObject?.(obj1);
          obj1.collidedObjs[obj2Id] = true;
          obj2.collidedObjs[obj1Id] = true;
        }
      }
    }
  }

  background.render();
  map.current.render();
  game.objs.sort((a, b) => (a.priority < b.priority ? -1 : 1)).forEach((obj) => obj.render?.());

  game.particles.forEach((obj) => obj.render());

  selectedControl.spawner?.render();

  waterContext.drawImage(game.canvas, 0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

  stats.update();

  texture.needsUpdate = true;
  waterTexture.needsUpdate = true;

  if (game.mouse.xOffset + game.mouse.xOffsetTemp) game.scene.position.setX((game.mouse.xOffset + game.mouse.xOffsetTemp) / 100);

  game.renderer.render(game.scene, game.camera);
};

const objectDetail = document.getElementById("object-detail");
const objectDetailImg = document.getElementById("object-detail-img") as HTMLImageElement;
const objectDetailName = document.getElementById("object-detail-name") as HTMLDivElement;
const objectDetailMore = document.getElementById("object-detail-more") as HTMLDivElement;

const updateObjectDetailMore = () => {
  const selectedObj = game.selected;
  const linkedObjs = selectedObj === null ? null : selectedObj.linkedObjs;

  const handleAddLink = () => {
    game.useSelectLinkedObject = true;
    updateObjectDetailMore();
  };

  const handleRemoveLink = (id: string) => {
    const obj = linkedObjs.find((o) => o.id === id);
    if (!obj) return;

    obj.linkedObjs = obj.linkedObjs.filter((o) => o.id !== selectedObj.id);
    selectedObj.linkedObjs = selectedObj.linkedObjs.filter((o) => o.id !== obj.id);

    updateObjectDetailMore();
  };

  window.handleAddLink = handleAddLink;
  window.handleRemoveLink = handleRemoveLink;

  if (linkedObjs) {
    objectDetailMore.innerHTML = `
    <div style="padding-top: 24px; display: flex; flex-direction: column; align-items: center">
      <span style="font-weight: 500">Linked Objects</span>
      ${linkedObjs
        .map(
          (obj) =>
            `<div style="display: flex; align-items: center; margin-top: 12px; margin-bottom: 4px">
              <img alt="" src="${obj.texture.src}" style="width: 28px; height: 28px; object-fit: scale-down; margin-right: 8px" />
              <span style="width: 70px; font-size: 14px">${obj.id}</span>
              <div class="btn-remove cursor-pointer" onclick="handleRemoveLink('${obj.id}')"><i class="icon-close"></i></div>
            </div>`
        )
        .join("")}
      <button style="margin-top: 12px; width: auto; padding: 8px 12px" onclick="handleAddLink()" ${
        game.useSelectLinkedObject ? "disabled" : ""
      }>Add Link</button>
      ${game.useSelectLinkedObject ? `<span style="font-size: 14px; margin-top: 8px">Select an object</span>` : ""}
    </div>
  `;
  } else objectDetailMore.innerHTML = "";
};

window.game = game;
game.updateObjectDetailMore = updateObjectDetailMore;

const registerMouseEvents = () => {
  window.addEventListener("mousedown", (e) => {
    if (!rendererCanvas.contains(e.target as any)) return;
    game.mouse.oldPos = e.x;
    game.mouse.isDragging = true;
    game.mouse.isRightMouse = e.button === 2;

    selectedControl.spawner?.spawn();

    if (game.useSelectLinkedObject) {
      game.selected.onSelectLinkedObj(getClickedObject(e.offsetX, e.offsetY));
    } else if (game.useSelectTool) {
      game.selected = getClickedObject(e.offsetX, e.offsetY);

      objectDetail.style.opacity = game.selected ? "1" : "0";

      if (!game.selected) return;

      objectDetailImg.src = game.selected.texture.src;
      objectDetailName.innerHTML = game.selected.id;

      updateObjectDetailMore();
    }
  });

  window.addEventListener("mouseup", () => {
    game.mouse.isDragging = false;

    if (game.useHandTool) {
      game.mouse.xOffset += game.mouse.xOffsetTemp;
      game.mouse.xOffsetTemp = 0;
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (rendererCanvas.contains(e.target as any)) {
      game.mouse.x = e.offsetX;
      game.mouse.y = e.offsetY;
      game.mouse.xWithOffset = game.mouse.x - game.mouse.xOffset;
    } else {
      game.mouse.x = game.mouse.y = -1;
      game.mouse.xWithOffset = -1;
    }

    if (!game.mouse.isDragging) return;

    selectedControl.spawner?.spawn();

    if (game.useHandTool) {
      const offset = e.x - game.mouse.oldPos;
      game.mouse.xOffsetTemp = offset;
    }
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
          game.players.forEach((player) => player.lrHold(DRTS.LEFT));
          break;

        case "ArrowRight":
          game.players.forEach((player) => player.lrHold(DRTS.RIGHT));
          break;

        case "ArrowUp":
          game.players.forEach((player) => player.upHold());
          break;

        case "Escape":
          if (game.useSelectLinkedObject) {
            game.useSelectLinkedObject = false;
            game.updateObjectDetailMore();
          }
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
          game.players.forEach((player) => player.lrRelease(DRTS.LEFT));
          break;

        case "ArrowRight":
          game.players.forEach((player) => player.lrRelease(DRTS.RIGHT));
          break;

        case "ArrowUp":
          game.players.forEach((player) => player.upRelease());
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
  game.mouse = {
    x: -1,
    y: -1,
    isDragging: false,
    isRightMouse: false,
    oldPos: 0,
    xOffset: 0,
    xOffsetTemp: 0,
    xWithOffset: 0,
  };

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

  // Init map
  initMap();

  registerMouseEvents();
  registerKeyboardEvents();

  requestAnimationFrame(render);
};

// Main
init();
