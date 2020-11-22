import { Scene } from '../core/Scene';
import { Surface } from '../core/SceneObject/Surface';
import { Camera } from '../core/SceneObject/Camera';
import { SceneObject } from '../core/SceneObject/SceneObject';
import { Model } from '../core/Model';
import { Cube } from '../models/Cude';
import { Material } from '../core/Material';
import { loadImage } from '../utils/img';
import { degToRad } from '../utils/math';

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

    // const cube = new SceneObject(new Model(Cube)).setScale(new Float32Array([200, 200, 200]));
    // cube.material = new Material();
    // cube.material.diffuseImage = await loadImage(require('../assets/textures/luna/lunarrock_d.png'));
    // cube.material.specularImage = await loadImage(require('../assets/textures/luna/lunarrock_s.png'));
    // cube.material.normalImage = await loadImage(require('../assets/textures/luna/lunarrock_n.png'));
    // cube.model.generateTangent();
    // cube.material.color = new Float32Array([255, 0, 0]);

    const surface = new Surface();
    surface.material = new Material();
    // surface.material.diffuseImage = await loadImage(require('../assets/textures/luna/lunarrock_d.png'));
    // surface.material.specularImage = await loadImage(require('../assets/textures/luna/lunarrock_s.png'));
    // surface.material.normalImage = await loadImage(require('../assets/textures/luna/lunarrock_n.png'));
    // // surface.material.normalImage = await loadImage(require('../assets/textures/normal_map.bmp'));
    // surface.material.hardness = 300;
    //
    surface.material.diffuseImage = await loadImage(
      require('../assets/textures/lunar_3/terrainbase_material_lunar_2_basecolor.png'),
    );
    surface.material.specularImage = await loadImage(
      require('../assets/textures/lunar/terrainbase_material_lunar_ambientocclusion.png'),
    );
    surface.material.normalImage = await loadImage(
      require('../assets/textures/lunar_3/terrainbase_material_lunar_2_normal.png'),
    );
    // surface.material.diffuseImage = await loadImage(require('../assets/textures/luna/lunarrock_d.png'));
    // surface.material.specularImage = await loadImage(require('../assets/textures/luna/lunarrock_s.png'));
    // surface.material.normalImage = await loadImage(require('../assets/textures/luna/lunarrock_n.png'));
    // surface.material.normalImage = await loadImage(require('../assets/textures/normal_map.bmp'));
    surface.material.hardness = 300;

    await surface.generateMesh(require('../assets/textures/terrainbase_material_lunar_2_height_conv.png'), 1);
    // await surface.generateMesh(require('../assets/textures/terrainbase_material_lunar_2_height_conv.png'), 1024, 1);
    // await surface.generateMesh(require('../assets/heightmaps/island-height.png'), 1024, 1);
    // await surface.generateMesh(require('../assets/heightmaps/mini.png'), 20, 1);
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
          console.log(1);
          this.canvas.addEventListener('mousemove', mouseMoveHandler, false);
        } else {
          console.log(2);
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
