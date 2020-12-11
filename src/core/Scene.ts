import { Color, Mat4, Vec3 } from '../types';
import { degToRad, Mat4Utils } from '../utils/math';
import { SceneObject } from './SceneObject/SceneObject';
import { Camera } from './SceneObject/Camera';

export class Scene {
  FPS: number = 20;

  canvas: HTMLCanvasElement;

  gl: WebGLRenderingContext;

  camera: Camera;

  objects: SceneObject[] = [];

  lightPosition: Vec3 = new Float32Array([0, 2000, -2000]);
  cameraPosition: Vec3;
  useWorldLight: number = 1;

  V: Mat4;
  P: Mat4;

  private requestAnimationId: number;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl');
    if (!this.gl) {
      throw new Error('WebGL is not supported');
    }
  }

  init() {
    this.bufferObjects();
  }

  private bufferObjects() {
    this.objects.forEach((object) => {
      object.bufferData(this.gl);
      object.bufferTextures(this.gl);
    });
  }

  startRendering() {
    this.animate();
  }

  stopRendering() {
    cancelAnimationFrame(this.requestAnimationId);
  }

  private animate() {
    const fpsInterval = 1000 / this.FPS;
    let lastTime = window.performance.now();
    const tick = (newTime: number) => {
      this.requestAnimationId = requestAnimationFrame(tick);
      const delta = newTime - lastTime;
      if (delta > fpsInterval) {
        this.render();
        lastTime = newTime;
      }
    };
    tick(lastTime);
  }

  render() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.P = Mat4Utils.perspective(degToRad(65), this.gl.canvas.width / this.gl.canvas.height, 1, 7000);
    this.V = this.camera.viewMatrix();
    this.cameraPosition = new Float32Array(Mat4Utils.inverse(this.V).slice(12, 15));

    this.objects.forEach((object) => {
      object.renderOnScene(this);
    });
  }
}
