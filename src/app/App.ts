import { Scene } from '../core/Scene';
import { Surface } from '../core/SceneObject/Surface';
import { Camera } from '../core/SceneObject/Camera';
import { Model } from '../core/Model';
import { Material } from '../core/Material';
import { loadImage } from '../core/utils/img';
import { degToRad, Mat4Utils } from '../core/utils/math';
import { PhongShader, SkyboxShader } from '../core/Shader';
import { Skybox } from '../core/SceneObject/Skybox';
import { SkyboxCube } from '../models/SkyboxCube';
import { Texture } from '../core/Texture';
import { PickableSceneObject } from '../core/SceneObject/PickableSceneObject';
import { NormalMappingShader } from '../core/Shader';
import { parseOBJ } from '../core/utils/OBJParser';
import { LockedSceneObject } from '../core/SceneObject/LockedSceneObject';

export class App {
  canvas: HTMLCanvasElement;
  scene: Scene;
  surface: Surface;

  textures: {};
  models: {};

  pickedObject: PickableSceneObject = null;

  movementSpeedPerMs: number = 0.05;
  mouseCameraSensitivity: number = 0.004;

  movement = {
    isRunning: false,
    forward: 0,
    back: 0,
    left: 0,
    right: 0,
  };

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async init() {
    await this.initScene();
    this.initEvents();
    this.start();
  }

  async initScene() {
    this.scene = new Scene(this.canvas);
    this.scene.stereo.on = false;
    this.scene.FPS = process.env.NODE_ENV !== 'production' ? 20 : 60;
    this.scene.FOV = 60;

    await this.addCamera();
    await this.addSkybox();
    await this.addSurface();
    await this.addCubes();

    this.scene.init();
    setTimeout(() => {
      this.scene.camera.orientation.pitch = degToRad(0);
      this.scene.camera.move(0, this.surface);
    }, 100);
  }

  protected async addCamera() {
    this.scene.camera = new Camera().setTranslation(new Float32Array([0, 0, 0]));
  }

  protected async addSkybox() {
    const skybox = new Skybox(new Model(SkyboxCube));
    skybox.setScale(new Float32Array([2, 2, 2]));
    skybox.shader = new SkyboxShader(this.scene.gl);
    skybox.material = new Material();
    skybox.material.diffuseTexture = new Texture(
      'cube',
      await Promise.all([
        loadImage(require('../assets/textures/skybox/space/corona_ft.png')),
        loadImage(require('../assets/textures/skybox/space/corona_bk.png')),
        loadImage(require('../assets/textures/skybox/space/corona_up.png')),
        loadImage(require('../assets/textures/skybox/space/corona_dn.png')),
        loadImage(require('../assets/textures/skybox/space/corona_rt.png')),
        loadImage(require('../assets/textures/skybox/space/corona_lf.png')),
      ]),
    );
    this.scene.objects.push(skybox);
  }

  protected async addSurface() {
    const surface = new Surface();
    surface.material = new Material();
    surface.shader = new NormalMappingShader(this.scene.gl);
    surface.material.diffuseTexture = new Texture(
      '2d',
      await loadImage(require('../assets/textures/lunar_3/basecolor.png')),
    );
    surface.material.specularTexture = new Texture(
      '2d',
      await loadImage(require('../assets/textures/lunar/ambientocclusion.png')),
    );
    surface.material.normalTexture = new Texture(
      '2d',
      await loadImage(require('../assets/textures/lunar_3/normal.png')),
    );
    surface.material.hardness = 300;
    if (process.env.NODE_ENV !== 'production') {
      await surface.generateMesh(require('../assets/textures/lunar_3/height.png'), 1, 8);
    } else {
      await surface.generateMesh(require('../assets/textures/terrainbase_material_lunar_2_height_conv.png'), 1, 16);
    }
    surface
      .setScale(new Float32Array([2, 2, 2]))
      .setTranslation(
        new Float32Array([(-surface.size * surface.scale[0]) / 2, 0, (-surface.size * surface.scale[2]) / 2]),
      );
    this.surface = surface;
    this.scene.objects.push(surface);
  }

  protected async addCubes() {
    const cubeModelData = parseOBJ(await fetch(require('../assets/models/CubeFlat.obj')).then((res) => res.text()));
    const cube = new PickableSceneObject(new Model(cubeModelData));
    cube.model.generateTangent();
    cube.material = new Material();
    cube.shader = new NormalMappingShader(this.scene.gl);
    cube.material.diffuseTexture = new Texture(
      '2d',
      await loadImage(require('../assets/textures/luna/lunarrock_d.png')),
    );
    cube.material.specularTexture = new Texture(
      '2d',
      await loadImage(require('../assets/textures/luna/lunarrock_s.png')),
    );
    cube.material.normalTexture = new Texture(
      '2d',
      await loadImage(require('../assets/textures/luna/lunarrock_n.png')),
    );
    cube.material.hardness = 300;
    cube.setScale(new Float32Array([50, 50, 50]));
    cube.setTranslation(new Float32Array([100, 0, 0]));
    cube.onPick = () => {
      this.pickedObject = cube;
    };
    this.scene.objects.push(cube);

    const gunTranslation = new Float32Array([6, -3, 2.25]);
    const gunRotation: [number, number, number] = [degToRad(0), degToRad(105), degToRad(20)];
    const gunScale = new Float32Array([0.42, 0.42, 0.42]);

    const gunModelData = parseOBJ(await fetch(require('../assets/models/PortalGun1.obj')).then((res) => res.text()));
    const gun = new LockedSceneObject(this.scene.camera, new Model(gunModelData));
    gun.setTranslation(gunTranslation);
    gun.setRotation(...gunRotation);
    gun.material = new Material();
    gun.shader = new PhongShader(this.scene.gl);
    gun.material.diffuseColor = new Float32Array([0.8, 0.8, 0.8]);
    gun.material.hardness = 300;
    gun.setScale(gunScale);
    this.scene.objects.push(gun);

    const gunModelData2 = parseOBJ(await fetch(require('../assets/models/PortalGun2.obj')).then((res) => res.text()));
    const gun2 = new LockedSceneObject(this.scene.camera, new Model(gunModelData2));
    // gun.setTranslation(new Float32Array([50, 0, -50]));
    gun2.setTranslation(gunTranslation);
    gun2.setRotation(...gunRotation);
    gun2.material = new Material();
    gun2.shader = new PhongShader(this.scene.gl);
    gun2.material.diffuseColor = new Float32Array([0.1, 0.1, 0.1]);
    gun2.material.hardness = 300;
    gun2.setScale(gunScale);
    this.scene.objects.push(gun2);
  }

  start() {
    this.scene.startRendering();
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
        console.log(1);
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
