import { Color, Mat4, Vec3 } from '../types';
import { degToRad, Mat4Utils } from '../utils/math';
import { SceneObject } from './SceneObject/SceneObject';
import { initShaderProgram } from '../utils/webgl';
import VertexShader from '../shaders/vertex.glsl';
import FragmentShader from '../shaders/fragment.glsl';
import { Camera } from './SceneObject/Camera';
import { LocationsMap } from './Locations';

export class Scene {
  FPS: number = 24;

  canvas: HTMLCanvasElement;
  locations: LocationsMap = {};

  gl: WebGLRenderingContext;

  camera: Camera;
  cameraPosition: Vec3 = new Float32Array([0, 500, 1500]); // TODO

  // vTranslation: Vec3 = new Float32Array([0, 0, -1500]);
  // vRotation: Vec3 = new Float32Array([degToRad(0), degToRad(0), degToRad(0)]);
  // vScale: Vec3 = new Float32Array([1, 1, 1]);

  objects: SceneObject[] = [];

  lightPosition: Vec3 = new Float32Array([0, 2000, -2000]);
  useWorldLight: number = 1;

  V: Mat4; // View Matrix
  P: Mat4; // Projection Matrix

  private requestAnimationId: number;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  init() {
    this.initGl();
    this.bindDataToBuffers();
  }

  private initGl() {
    this.gl = this.canvas.getContext('webgl');
    if (!this.gl) {
      throw new Error('WebGL is not supported');
    }

    const program: WebGLProgram = initShaderProgram(this.gl, VertexShader, FragmentShader);

    this.locations['a_position'] = this.gl.getAttribLocation(program, 'a_position') as number;
    this.locations['a_normal'] = this.gl.getAttribLocation(program, 'a_normal') as number;
    this.locations['a_uv'] = this.gl.getAttribLocation(program, 'a_uv') as number;
    this.locations['a_tangent'] = this.gl.getAttribLocation(program, 'a_tangent') as number;
    this.locations['u_color'] = this.gl.getUniformLocation(program, 'u_color') as number;
    this.locations['u_M'] = this.gl.getUniformLocation(program, 'u_M') as number;
    this.locations['u_V'] = this.gl.getUniformLocation(program, 'u_V') as number;
    this.locations['u_P'] = this.gl.getUniformLocation(program, 'u_P') as number;
    this.locations['u_MV'] = this.gl.getUniformLocation(program, 'u_MV') as number;
    this.locations['u_MVP'] = this.gl.getUniformLocation(program, 'u_MVP') as number;
    this.locations['u_MV1T'] = this.gl.getUniformLocation(program, 'u_MV1T') as number;
    this.locations['u_light_position'] = this.gl.getUniformLocation(program, 'u_light_position') as number;
    this.locations['u_light_color'] = this.gl.getUniformLocation(program, 'u_light_color') as number;
    this.locations['u_specular_color'] = this.gl.getUniformLocation(program, 'u_specular_color') as number;
    this.locations['u_ambient_color'] = this.gl.getUniformLocation(program, 'u_ambient_color') as number;
    this.locations['u_camera_position'] = this.gl.getUniformLocation(program, 'u_camera_position') as number;
    this.locations['u_useAmbient'] = this.gl.getUniformLocation(program, 'u_useAmbient') as number;
    this.locations['u_useSpecular'] = this.gl.getUniformLocation(program, 'u_useSpecular') as number;
    this.locations['u_useDiffuse'] = this.gl.getUniformLocation(program, 'u_useDiffuse') as number;
    this.locations['u_useWorldLight'] = this.gl.getUniformLocation(program, 'u_useWorldLight') as number;
    this.locations['u_hardness'] = this.gl.getUniformLocation(program, 'u_hardness') as number;
    this.locations['u_texture_diffuse'] = this.gl.getUniformLocation(program, 'u_texture_diffuse') as number;
    this.locations['u_texture_specular'] = this.gl.getUniformLocation(program, 'u_texture_specular') as number;
    this.locations['u_texture_normal'] = this.gl.getUniformLocation(program, 'u_texture_normal') as number;

    // this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.getExtension('OES_element_index_uint');

    this.gl.useProgram(program);
  }

  private bindDataToBuffers() {
    this.objects.forEach((object) => {
      object.bindDataToBuffers(this.gl);
      object.bindTextures(this.gl);
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

  private prepareScene() {
    this.P = Mat4Utils.perspective(degToRad(65), this.gl.canvas.width / this.gl.canvas.height, 1, 7000);

    // Матрица вида
    this.V = this.camera.viewMatrix();
    // this.V = Mat4Utils.identity();
    // this.V = Mat4Utils.translate(this.V, this.vTranslation[0], this.vTranslation[1], this.vTranslation[2]);
    // this.V = Mat4Utils.rotate(this.V, this.vRotation[0], this.vRotation[1], this.vRotation[2]);
    // this.V = Mat4Utils.scale(this.V, this.vScale[0], this.vScale[1], this.vScale[2]);;
    const V1 = Mat4Utils.inverse(this.V);
    this.cameraPosition = new Float32Array([V1[12], V1[13], V1[14]]);
  }

  render() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.prepareScene();

    this.objects.forEach((object) => {
      this.renderObject(object);
    });
  }

  private renderObject(object: SceneObject) {
    // Matrices
    const MVP = Mat4Utils.multiply(Mat4Utils.multiply(this.P, this.V), object.M());
    const MV = Mat4Utils.multiply(this.V, object.M());
    const MV1T = Mat4Utils.transpose(Mat4Utils.inverse(MV));

    this.gl.uniformMatrix4fv(this.locations['u_MVP'], false, MVP);
    this.gl.uniformMatrix4fv(this.locations['u_M'], false, object.M());
    this.gl.uniformMatrix4fv(this.locations['u_V'], false, this.V);
    this.gl.uniformMatrix4fv(this.locations['u_P'], false, this.P);
    this.gl.uniformMatrix4fv(this.locations['u_MV'], false, MV);
    this.gl.uniformMatrix4fv(this.locations['u_MV1T'], false, MV1T);

    this.gl.uniform3fv(this.locations['u_light_position'], this.lightPosition);
    this.gl.uniform3fv(this.locations['u_camera_position'], this.cameraPosition);
    this.gl.uniform1i(this.locations['u_useWorldLight'], this.useWorldLight);

    // Draw object
    object.render(this.gl, this.locations);
  }
}
