import { SceneObject } from './SceneObject';
import { Mat4Utils } from '../../utils/math';

export class Skybox extends SceneObject {
  constructor(props) {
    super(props);
  }

  M() {
    let M = Mat4Utils.identity();
    M = Mat4Utils.rotate(M, this.rotation[0], this.rotation[1], this.rotation[2]);
    M = Mat4Utils.scale(M, this.scale[0], this.scale[1], this.scale[2]);
    return M;
  }

  bufferTextures(gl: WebGLRenderingContext) {
    this.material.diffuseTexture.buffer(gl);
  }
}
