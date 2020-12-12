import { Model } from '../Model';
import { Mat4, Vec3 } from '../../types';
import { Mat4Utils } from '../utils/math';
import { Material } from '../Material';
import { Scene } from '../Scene';
import { AbstractShader } from '../Shader/AbstractShader';

/**
 * Model instance placed on the scene
 */
export class SceneObject {
  model: Model | null = null;
  translation: Vec3 = new Float32Array([0, 0, 0]);
  // rotation: Vec3 = new Float32Array([0, 0, 0]);
  rotation: Mat4 = Mat4Utils.rotation(0, 0, 0);
  scale: Vec3 = new Float32Array([0, 0, 0]);

  material: Material;
  shader: AbstractShader;

  indexBuffer: WebGLBuffer;
  vertexBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  tangentBuffer: WebGLBuffer;

  constructor(model?: Model) {
    this.model = model;
  }

  setTranslation(translation: Vec3) {
    this.translation = translation;
    return this;
  }

  setScale(scale: Vec3) {
    this.scale = scale;
    return this;
  }

  setRotation(x, y, z) {
    this.rotation = Mat4Utils.rotation(x, y, z);
    return this;
  }

  M() {
    let M = Mat4Utils.identity();
    M = Mat4Utils.translate(M, this.translation[0], this.translation[1], this.translation[2]);
    M = Mat4Utils.multiply(M, this.rotation);
    M = Mat4Utils.scale(M, this.scale[0], this.scale[1], this.scale[2]);
    return M;
  }

  bufferTextures(gl: WebGLRenderingContext) {
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.material?.diffuseTexture.buffer(gl);
    this.material?.specularTexture.buffer(gl);
    this.material?.normalTexture.buffer(gl);
  }

  bufferData(gl: WebGLRenderingContext) {
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.model.indices), gl.STATIC_DRAW);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.model.vertices, gl.STATIC_DRAW);

    if (this.model.normals) {
      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.model.normals, gl.STATIC_DRAW);
    }

    if (this.model.uv) {
      this.uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.model.uv, gl.STATIC_DRAW);
    }

    if (this.model.tangent) {
      this.tangentBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.model.tangent, gl.STATIC_DRAW);
    }
  }

  renderOnScene(scene: Scene) {
    this.shader.renderObjectOnScene(this, scene);
  }
}
