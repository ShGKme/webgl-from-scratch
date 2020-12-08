import { Scene } from '../core/Scene';
import { Surface } from '../core/SceneObject/Surface';
import { Camera } from '../core/SceneObject/Camera';
import { SceneObject } from '../core/SceneObject/SceneObject';
import { Model } from '../core/Model';
import { Cube } from '../models/Cude';
import { Material } from '../core/Material';
import { loadImage } from '../utils/img';
import { degToRad } from '../utils/math';
import { SceneShaderProgram } from '../core/ShaderPrograms/SceneShaderProgram';
import { SkyboxShaderProgram } from '../core/ShaderPrograms/SkyboxShaderProgram';
import { Skybox } from '../core/SceneObject/Skybox';
import { SkyboxCube } from '../models/SkyboxCube';

export class App {
  canvas: HTMLCanvasElement;
  scene: Scene;
  surface: Surface;

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

    this.scene.camera = new Camera().setTranslation(new Float32Array([0, -100, 0]));

    const skybox = new Skybox(new Model(SkyboxCube));
    skybox.setScale(new Float32Array([2, 2, 2]));
    skybox.shader = new SkyboxShaderProgram(this.scene.gl);
    skybox.material = new Material();
    skybox.material.cubeImage = [
      await loadImage(require('../assets/textures/skybox/space/corona_ft.png')),
      await loadImage(require('../assets/textures/skybox/space/corona_bk.png')),
      await loadImage(require('../assets/textures/skybox/space/corona_up.png')),
      await loadImage(require('../assets/textures/skybox/space/corona_dn.png')),
      await loadImage(require('../assets/textures/skybox/space/corona_rt.png')),
      await loadImage(require('../assets/textures/skybox/space/corona_lf.png')),
    ];
    this.scene.objects.push(skybox);

    const surface = new Surface();
    surface.material = new Material();
    surface.shader = new SceneShaderProgram(this.scene.gl);
    surface.material.diffuseImage = await loadImage(require('../assets/textures/lunar_3/basecolor.png'));
    surface.material.specularImage = await loadImage(require('../assets/textures/lunar/ambientocclusion.png'));
    surface.material.normalImage = await loadImage(require('../assets/textures/lunar_3/normal.png'));
    surface.material.hardness = 300;
    await surface.generateMesh(require('../assets/textures/terrainbase_material_lunar_2_height_conv.png'), 1);
    surface.setScale(new Float32Array([2, 2, 2])).setTranslation(new Float32Array([-255.5, 0, -255.5]));
    this.surface = surface;
    this.scene.objects.push(surface);

    this.scene.init();
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

    this.canvas.addEventListener(
      'wheel',
      (e) => {
        const delta = (e.deltaY || e.detail) > 0 ? 1 : -1;
        this.zoom(delta);
      },
      { passive: true },
    );

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

    window.addEventListener('keydown', this.handleMove.bind(this), false);
  }

  mouseMoveHandler(e) {
    // if (mouseIsDown) {
    this.scene.camera.yaw(-e.movementX / 250);
    this.scene.camera.pitch(-e.movementY / 250);
    // this.rotate([(oldX - e.offsetX) / 2, (oldY - e.offsetY) / 2]);
    // }
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
