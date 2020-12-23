import { Scene } from './Scene';
import { Surface } from './SceneObject/Surface';
import { Camera } from './SceneObject/Camera';
import { Model, ModelData } from './Model';
import { Material } from './Material';
import { degToRad, Mat4Utils } from './utils/math';
import { PhongShader, SkyboxShader } from './Shader';
import { Skybox } from './SceneObject/Skybox';
import { Texture } from './Texture';
import { PickableSceneObject } from './SceneObject/PickableSceneObject';
import { NormalMappingShader } from './Shader';
import { LockedSceneObject } from './SceneObject/LockedSceneObject';
import { Resource, ResourceLoader } from './ResourceLoader';

export class World {
  canvas: HTMLCanvasElement;
  scene: Scene;
  surface: Surface;

  movementSpeedPerMs: number = 0.05;
  mouseCameraSensitivity: number = 0.004;

  movement = {
    isRunning: false,
    forward: 0,
    back: 0,
    left: 0,
    right: 0,
  };

  pickedObject: PickableSceneObject;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;

    this.scene = new Scene(this.canvas);
    this.scene.stereo.on = false;
    this.scene.FPS = process.env.NODE_ENV !== 'production' ? 20 : 60;
    this.scene.FOV = 60;

    this.scene.camera = new Camera().setTranslation(new Float32Array([0, 0, 0]));
  }

  init() {
    this.scene.init();
    setTimeout(() => {
      this.scene.camera.orientation.pitch = degToRad(0);
      this.scene.camera.move(0, this.surface);
    }, 100);
    this.initEvents();
  }

  setSurface(surface: Surface) {
    this.surface = surface;
    this.scene.objects.push(surface);
  }

  protected initEvents() {
    this.initPointerLockWithMouseMove();
    this.initPicking();
    this.initMovement();
    window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
  }

  protected initPointerLockWithMouseMove() {
    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock();
    });

    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock();
    });

    const mouseMoveHandler = this.handleMouseMove.bind(this);
    document.addEventListener(
      'pointerlockchange',
      () => {
        if (document.pointerLockElement === this.canvas) {
          this.canvas.addEventListener('mousemove', mouseMoveHandler, false);
        } else {
          this.canvas.removeEventListener('mousemove', mouseMoveHandler, false);
        }
      },
      false,
    );
  }

  protected initPicking() {
    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.scene.picking = true;
    });
    this.canvas.addEventListener('mouseup', () => {
      this.scene.picking = false;
      this.pickedObject = null;
    });
  }

  protected handleOrientation(event: DeviceOrientationEvent) {
    this.scene.camera.orientation.yaw = degToRad(-event.alpha);
    if (event.gamma > 0) {
      this.scene.camera.orientation.pitch = degToRad(90 - event.gamma);
    } else {
      this.scene.camera.orientation.pitch = degToRad(360 - 90 - event.alpha);
    }
  }

  protected handleMouseMove(e: MouseEvent) {
    if (!this.pickedObject) {
      this.handleMouseCameraMove(e);
    } else {
      this.handleMousePickObjectMove(e);
    }
  }

  protected handleMouseCameraMove(e: MouseEvent) {
    this.scene.camera.yaw(-e.movementX * this.mouseCameraSensitivity);
    this.scene.camera.pitch(-e.movementY * this.mouseCameraSensitivity);
  }

  protected handleMousePickObjectMove(e: MouseEvent) {
    if (e.shiftKey) {
      let r = this.pickedObject.rotation;
      const x = e.movementX * this.mouseCameraSensitivity;
      r = Mat4Utils.rotate(r, r[2] * x, r[6] * x, r[10] * x);
      this.pickedObject.rotation = r;
    } else {
      let r = this.pickedObject.rotation;
      const x = e.movementX * this.mouseCameraSensitivity;
      const y = e.movementY * this.mouseCameraSensitivity;
      r = Mat4Utils.rotate(r, r[1] * x, r[5] * x, r[9] * x);
      r = Mat4Utils.rotate(r, r[0] * y, r[4] * y, r[8] * y);
      this.pickedObject.rotation = r;
    }
  }

  protected initMovement() {
    this.scene.ontick.push((delta: number) => {
      const ms = this.movement.isRunning ? delta * 4 : delta;
      this.scene.camera.move(-ms * this.movement.forward, this.surface);
      this.scene.camera.move(ms * this.movement.back, this.surface);
      this.scene.camera.strafe(-ms * this.movement.left, this.surface);
      this.scene.camera.strafe(ms * this.movement.right, this.surface);
    });

    const movementKeyMap = {
      KeyW: 'forward',
      KeyS: 'back',
      KeyA: 'left',
      KeyD: 'right',
    };

    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (Object.keys(movementKeyMap).includes(e.code)) {
          this.movement[movementKeyMap[e.code]] = this.movementSpeedPerMs;
        }

        if (e.shiftKey) {
          this.movement.isRunning = true;
        }
      },
      false,
    );
    window.addEventListener(
      'keyup',
      (e: KeyboardEvent) => {
        this.movement[movementKeyMap[e.code]] = 0;
        if (!e.shiftKey) {
          this.movement.isRunning = false;
        }
      },
      false,
    );
  }
}
