import { SceneObject } from './SceneObject';
import { getNewTextureId } from '../TextureStore';
import { Mat4Utils } from '../../utils/math';

export class Skybox extends SceneObject {
  constructor(props) {
    super(props);
  }

  M() {
    let M = Mat4Utils.identity();
    // M = Mat4Utils.translate(M, this.translation[0], this.translation[1], this.translation[2]);
    M = Mat4Utils.rotate(M, this.rotation[0], this.rotation[1], this.rotation[2]);
    M = Mat4Utils.scale(M, this.scale[0], this.scale[1], this.scale[2]);
    return M;
  }

  bufferTextures(gl: WebGLRenderingContext) {
    this.diffuseTexture = gl.createTexture();
    this.diffuseTextureId = getNewTextureId();
    gl.activeTexture(gl[`TEXTURE${this.diffuseTextureId}`]);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.diffuseTexture);
    this.material.cubeImage.forEach((image, index) => {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }
}
