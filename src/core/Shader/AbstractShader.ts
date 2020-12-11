import VertexShader from '../../shaders/vertex.glsl';
import FragmentShader from '../../shaders/fragment.glsl';
import { LocationsMap } from '../Locations';
import { initShaderProgram } from '../../utils/webgl';
import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';

export class AbstractShader {
  static vertexShader: string = VertexShader;
  static fragmentShader: string = FragmentShader;

  program: WebGLProgram;
  locations: LocationsMap = {};
  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.program = initShaderProgram(
      this.gl,
      (this.constructor as typeof AbstractShader).vertexShader,
      (this.constructor as typeof AbstractShader).fragmentShader,
    );
    this.getLocations();
  }

  protected configure() {
    // this.gl.enable(this.gl.CULL_FACE);
    // this.gl.enable(this.gl.DEPTH_TEST);
    // this.gl.getExtension('OES_element_index_uint');
  }

  protected use() {
    this.configure();
    this.gl.useProgram(this.program);
  }

  protected getLocations() {}

  renderObjectOnScene(object: SceneObject, scene: Scene) {
    this.use();
    // this.bindMatrices(object, scene);
    // this.bindAdditional(object, scene);
    // this.bindObjectMesh(object);
    // this.bindObjectMaterial(object);
    //
    // this.drawObject(object);
  }
}
