import { SceneObject } from './SceneObject';
import { Mat4Utils } from '../utils/math';

export class Skybox extends SceneObject {
  constructor(props) {
    super(props);
  }

  M() {
    let M = Mat4Utils.identity();
    M = Mat4Utils.multiply(M, this.rotation);
    M = Mat4Utils.multiply(M, this.scale);
    return M;
  }

  bufferTextures(gl: WebGLRenderingContext) {
    this.material.diffuseTexture.buffer(gl);
  }
}
