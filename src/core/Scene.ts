import { Mat4, Vec3 } from '../types';
import { degToRad, Mat4Utils } from './utils/math';
import { SceneObject } from './SceneObject/SceneObject';
import { Camera } from './SceneObject/Camera';
import { PickShader } from './Shader';
import { PickableSceneObject } from './SceneObject/PickableSceneObject';

export class Scene {
  FPS: number = 20;
  FOV: number = 75;

  canvas: HTMLCanvasElement;

  gl: WebGLRenderingContext;

  camera: Camera;

  objects: SceneObject[] = [];

  lightPosition: Vec3 = new Float32Array([0, 2000, -1000]);
  cameraPosition: Vec3;

  V: Mat4;
  P: Mat4;

  pickShader: PickShader;
  picking: boolean = false;

  stereo = {
    on: false,
    eyeSeparation: 4,
  };

  ontick: Array<(deltaTime: number) => any> = [];

  private near: number = 1;
  private far: number = 7000;

  private requestAnimationId: number;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl');
    if (!this.gl) {
      throw new Error('WebGL is not supported');
    }
    this.pickShader = new PickShader(this.gl);
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
        this.ontick.forEach((handler) => handler(delta));
        this.resize();
        this.render();
        lastTime = newTime;
      }
    };
    tick(lastTime);
  }

  private resize() {
    this.gl.canvas.width = this.canvas.clientWidth;
    this.gl.canvas.height = this.canvas.clientHeight;
  }

  render() {
    if (this.stereo.on) {
      this.renderStereo();
    } else {
      this.renderPlain();
    }
  }

  renderPlain() {
    this.P = Mat4Utils.perspective(
      degToRad(this.FOV),
      this.gl.canvas.width / this.gl.canvas.height,
      this.near,
      this.far,
    );
    this.V = this.camera.viewMatrix();
    this.cameraPosition = new Float32Array(Mat4Utils.inverse(this.V).slice(12, 15));

    this.gl.viewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.renderPick(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2);

    this.objects.forEach((object) => object.renderOnScene(this));
  }

  renderStereo() {
    const aspect = this.gl.canvas.width / 2 / this.gl.canvas.height;
    const tfov2 = Math.tan(degToRad(this.FOV) / 2);
    const top = this.near * tfov2;
    const dist = this.stereo.eyeSeparation / 2;
    const a = aspect * tfov2 * (this.far / 2);
    const b = a - dist;
    const c = a + dist;
    const s = this.near / (this.far / 2);

    this.P = Mat4Utils.frustumProjection(-b * s, c * s, -top, top, this.near, this.far);
    this.V = this.camera.viewMatrix();
    this.cameraPosition = new Float32Array(Mat4Utils.inverse(this.V).slice(12, 15));

    this.renderPick(this.canvas.clientWidth / 2 / 2, this.canvas.clientHeight / 2);

    this.gl.viewport(0, 0, this.canvas.clientWidth / 2, this.canvas.clientHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.objects.forEach((object) => {
      object.renderOnScene(this);
    });

    this.gl.viewport(this.canvas.clientWidth / 2, 0, this.canvas.clientWidth / 2, this.canvas.clientHeight);
    this.camera.strafe(dist);
    this.P = Mat4Utils.frustumProjection(-c * s, b * s, -top, top, this.near, this.far);
    this.V = this.camera.viewMatrix();
    this.cameraPosition = new Float32Array(Mat4Utils.inverse(this.V).slice(12, 15));

    this.objects.forEach((object) => object.renderOnScene(this));

    this.camera.strafe(-dist);
  }

  private renderPick(x: number, y: number) {
    if (this.picking) {
      this.objects
        .filter((object) => object instanceof PickableSceneObject)
        .forEach((object: PickableSceneObject) => {
          this.pickShader.tryPick(object, this, x, y);
        });
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
  }
}
