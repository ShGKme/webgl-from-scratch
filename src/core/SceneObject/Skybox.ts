import { SceneObject } from './SceneObject';
import { Mat4Utils } from '../utils/math';
import { Model, ModelData } from '../Model';

const SkyboxCube: ModelData = {
  // prettier-ignore
  indices: new Float32Array([
    0, 3, 1, 1, 3, 2,
    0, 4, 7, 7, 3, 0,
    1, 2, 6, 6, 5, 1,
    5, 6, 7, 7, 4, 5,
    3, 7, 6, 6, 2, 3,
    0, 1, 5, 5, 4, 0
  ]),
  // prettier-ignore
  vertices: new Float32Array([
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0
  ]),

  normals: new Float32Array([]),

  uv: new Float32Array([]),
};

export class Skybox extends SceneObject {
  constructor() {
    super(new Model(SkyboxCube));
  }

  M() {
    let M = Mat4Utils.identity();
    M = Mat4Utils.multiply(M, this.rotation);
    M = Mat4Utils.scale(M, this.scale[0], this.scale[1], this.scale[2]);
    return M;
  }

  bufferTextures(gl: WebGLRenderingContext) {
    this.material.diffuseTexture.buffer(gl);
  }
}
