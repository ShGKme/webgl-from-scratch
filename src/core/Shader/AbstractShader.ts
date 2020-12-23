import { LocationsMap } from '../Locations';
import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';
import { Mat4Utils } from '../utils/math';

export class AbstractShader {
  static vertexShader: string;
  static fragmentShader: string;

  static loadShader(gl: WebGLRenderingContext, type: number, source: string) {
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('An error occurred compiling the glsl');
    }
    return shader;
  }

  static initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(shaderProgram));
      throw new Error('Unable to initialize the shader program');
    }

    return shaderProgram;
  }

  program: WebGLProgram;

  locations: LocationsMap = {};

  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.program = AbstractShader.initShaderProgram(
      this.gl,
      (this.constructor as typeof AbstractShader).vertexShader,
      (this.constructor as typeof AbstractShader).fragmentShader,
    );
    this.getLocations();
  }

  protected configure() {}

  protected use() {
    this.configure();
    this.gl.useProgram(this.program);
  }

  protected getLocations() {}

  protected renderObjectOnScene(object: SceneObject, scene: Scene) {
    this.use();
    this.bindMatrices(object, scene);
    this.bindAdditional(object, scene);
    this.bindObjectMesh(object);
    this.bindObjectMaterial(object);

    this.drawObject(object);
  }

  protected bindMatrices(object: SceneObject, scene: Scene) {}

  protected bindAdditional(object: SceneObject, scene: Scene) {}

  protected bindObjectMesh(object: SceneObject) {}

  protected bindObjectMaterial(object: SceneObject) {}

  protected drawObject(object: SceneObject) {
    throw new Error('Not Implemented');
  }
}
