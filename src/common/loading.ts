import * as THREE from "three";
import { game } from "../configs/constants";

const offsetX = -0.7;
const offsetT = 10;

const dots = [-1, 0, 1];

export class Loading {
  isLoading: boolean;
  t: number;
  objs: {
    mesh: THREE.Mesh;
    offset: number;
  }[];

  constructor() {
    this.isLoading = false;
    this.t = 0;
    this.draw = this.draw.bind(this);

    this.objs = [];
    dots.forEach((dot) => {
      const geometry = new THREE.CircleGeometry(1, 60);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const circle = new THREE.Mesh(geometry, material);
      circle.position.set(dot * offsetX, 0, 0);
      game.scene.add(circle);
      this.objs.push({ mesh: circle, offset: dot });
    });
  }

  draw() {
    this.t += 1;

    this.objs.forEach(({ mesh, offset }) => {
      const scale = Math.abs(Math.sin((this.t + offsetT * offset) * 0.05)) * 0.2;
      mesh.scale.set(scale, scale, scale);
    });

    game.renderer.render(game.scene, game.camera);

    if (this.isLoading) requestAnimationFrame(this.draw);
  }

  begin() {
    this.t = 0;
    this.isLoading = true;
    this.draw();
  }

  end() {
    this.isLoading = false;
  }
}
