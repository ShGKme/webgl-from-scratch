import { Scene } from '../core/Scene';
import { Surface } from '../core/SceneObject/Surface';
import { Camera } from '../core/SceneObject/Camera';
import { SceneObject } from '../core/SceneObject/SceneObject';
import { Model } from '../core/Model';
import { Cube } from '../models/Cude';
import { Material } from '../core/Material';
import { loadImage } from '../core/utils/img';
import { degToRad, Mat4Utils, Vec3Utils } from '../core/utils/math';
import { PhongShader } from '../core/Shader/PhongShader';
import { SkyboxShader } from '../core/Shader/SkyboxShader';
import { Skybox } from '../core/SceneObject/Skybox';
import { SkyboxCube } from '../models/SkyboxCube';
import { Texture } from '../core/Texture';
import { PickableSceneObject } from '../core/SceneObject/PickableSceneObject';
import { NormalMappingShader } from '../core/Shader/NormalMappingShader';

export class App {
  canvas: HTMLCanvasElement;
  scene: Scene;
  surface: Surface;

  textures: {};
  models: {};

  pickedObject: PickableSceneObject = null;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async init() {
    await this.initScene();
    this.initEvents();
    this.resizeCanvas();
    this.start();
  }

  async initScene() {
    this.scene = new Scene(this.canvas);

    await this.addCamera();
    await this.addSkybox();
    await this.addSurface();
    await this.addCubes();

    this.scene.init();
  }

  private async addCamera() {
    this.scene.camera = new Camera().setTranslation(new Float32Array([0, -100, 0]));
  }

  private async addSkybox() {
    const obj = (await import('../models/CubeSmooth.obj')).default;
    // console.log(new Model(SkyboxCube));
    // console.log(new Model(obj));
    // const skybox = new Skybox(new Model(SkyboxCube));
    console.log(obj);
    const skybox = new Skybox(new Model(obj));
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

  private async addSurface() {
    const surface = new Surface();
    surface.material = new Material();
    surface.shader = new PhongShader(this.scene.gl);
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
      await surface.generateMesh(require('../assets/textures/lunar_3/terrainbase_material_lunar_2_height.png'), 1, 8);
    } else {
      await surface.generateMesh(require('../assets/textures/terrainbase_material_lunar_2_height_conv.png'), 1, 16);
    }
    surface.setScale(new Float32Array([2, 2, 2])).setTranslation(new Float32Array([-255.5, 0, -255.5]));
    this.surface = surface;
    this.scene.objects.push(surface);
  }

  private async addCubes() {
    const cube = new PickableSceneObject(new Model(Cube));
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
  }

  zoom(delta: number) {
    // this.scene.vTranslation[2] += delta * 100;
  }

  start() {
    this.scene.startRendering();
  }

  private initEvents() {
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock();
    });

    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock();
    });

    // this.canvas.addEventListener(
    //   'wheel',
    //   (e) => {
    //     const delta = (e.deltaY || e.detail) > 0 ? 1 : -1;
    //     this.zoom(delta);
    //   },
    //   { passive: true },
    // );

    let mouseIsDown = false;
    window.addEventListener('mousedown', (e: MouseEvent) => {
      mouseIsDown = true;
    });
    const mouseMoveHandler = this.mouseMoveHandler.bind(this);
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
    window.addEventListener('mouseup', () => {
      mouseIsDown = false;
    });

    window.addEventListener('mousedown', (e: MouseEvent) => {
      this.scene.picking = true;
    });
    window.addEventListener('mouseup', () => {
      this.scene.picking = false;
      this.pickedObject = null;
    });

    window.addEventListener('keydown', this.handleMove.bind(this), false);
  }

  mouseMoveHandler(e: MouseEvent) {
    if (!this.pickedObject) {
      this.scene.camera.yaw(-e.movementX / 250);
      this.scene.camera.pitch(-e.movementY / 250);
    } else {
      // this.pickedObject.rotation[0] += e.movementY / 100;
      // this.pickedObject.rotation[1] += e.movementX / 100;
      // console.log(e.movementX);
      if (e.shiftKey) {
        let r = this.pickedObject.rotation;
        const x = e.movementX / 100;
        r = Mat4Utils.rotate(r, r[2] * x, r[6] * x, r[10] * x);
        this.pickedObject.rotation = r;
      } else {
        let r = this.pickedObject.rotation;
        const x = e.movementX / 100;
        const y = e.movementY / 100;
        r = Mat4Utils.rotate(r, r[1] * x, r[5] * x, r[9] * x);
        r = Mat4Utils.rotate(r, r[0] * y, r[4] * y, r[8] * y);
        this.pickedObject.rotation = r;
      }

      // console.log(this.pickedObject.rotation);
    }
  }

  handleMove(e) {
    const movementMap = {
      w: () => this.scene.camera.move(-2, this.surface),
      s: () => this.scene.camera.move(2, this.surface),
      a: () => this.scene.camera.strafe(-2),
      d: () => this.scene.camera.strafe(2),
    };
    movementMap[e.key]?.();
  }

  private resizeCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  // window.onkeydown = function(e) {
  //   e = e || event;
  //   if (e.shiftKey){
  //     $(canvas).css('cursor', 'move');
  //     canvas.onmousedown = function(e) {
  //       var oldX = e.offsetX;
  //       var oldY = e.offsetY;
  //       canvas.onmousemove = function(e2){
  //         CG.vTranslation[0] -= (oldX - e2.offsetX);
  //         CG.vTranslation[1] += (oldY - e2.offsetY);
  //         CG.drawScene(CG.gl);
  //         oldX = e2.offsetX;
  //         oldY = e2.offsetY;
  //       };
  //       canvas.onmouseup = function() {
  //         canvas.onmousemove = undefined;
  //       };
  //     }
  //   }
  // };
  // window.onkeyup = function() {
  //   $(canvas).css('cursor', 'grab');
  //   canvas.onmousedown = function(e) {
  //     $(canvas).css('cursor', 'grabbing');
  //     var oldX = e.offsetX;
  //     var oldY = e.offsetY;
  //     canvas.onmousemove = function(e2){
  //       CG.vRotation[0] -= degToRad((oldY - e2.offsetY) / 2);
  //       CG.vRotation[1] -= degToRad((oldX - e2.offsetX) / 2);
  //       CG.drawScene(CG.gl);
  //       oldX = e2.offsetX;
  //       oldY = e2.offsetY;
  //     };
  //     canvas.onmouseup = function() {
  //       $(canvas).css('cursor', 'grab');
  //       canvas.onmousemove = undefined;
  //     }
  //   }
  // };
  // window.onkeyup();
}
