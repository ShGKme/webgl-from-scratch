import { Model } from '../Model';
import { Vec3 } from '../../types';
import { Mat4Utils } from '../../utils/math';
import { Material } from '../Material';
import { LocationsMap } from '../Locations';

let textureId = 0;

/**
 * Model instance placed on the scene
 */
export class SceneObject {
  model: Model | null = null;
  translation: Vec3 = new Float32Array([0, 0, 0]);
  rotation: Vec3 = new Float32Array([0, 0, 0]);
  scale: Vec3 = new Float32Array([0, 0, 0]);

  material: Material;

  indexBuffer: WebGLBuffer;
  vertexBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  uvBuffer: WebGLBuffer;
  tangentBuffer: WebGLBuffer;

  diffuseTexture: WebGLTexture;
  specularTexture: WebGLTexture;
  normalTexture: WebGLTexture;

  diffuseTextureId: number;
  specularTextureId: number;
  normalTextureId: number;

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

  setRotation(rotation: Vec3) {
    this.rotation = rotation;
    return this;
  }

  M() {
    let M = Mat4Utils.identity();
    M = Mat4Utils.translate(M, this.translation[0], this.translation[1], this.translation[2]);
    M = Mat4Utils.rotate(M, this.rotation[0], this.rotation[1], this.rotation[2]);
    M = Mat4Utils.scale(M, this.scale[0], this.scale[1], this.scale[2]);
    return M;
  }

  bindTextures(gl: WebGLRenderingContext) {
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.diffuseTexture = gl.createTexture();
    this.diffuseTextureId = textureId++;
    gl.activeTexture(gl[`TEXTURE${this.diffuseTextureId}`]);
    gl.bindTexture(gl.TEXTURE_2D, this.diffuseTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.material.diffuseImage);
    gl.generateMipmap(gl.TEXTURE_2D);

    this.specularTexture = gl.createTexture();
    this.specularTextureId = textureId++;
    gl.activeTexture(gl[`TEXTURE${this.specularTextureId}`]);
    gl.bindTexture(gl.TEXTURE_2D, this.specularTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.material.specularImage);
    gl.generateMipmap(gl.TEXTURE_2D);

    this.normalTexture = gl.createTexture();
    this.normalTextureId = textureId++;
    gl.activeTexture(gl[`TEXTURE${this.normalTextureId}`]);
    gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.material.normalImage);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  bindDataToBuffers(gl: WebGLRenderingContext) {
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.model.indices), gl.STATIC_DRAW);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertices), gl.STATIC_DRAW);

    // this.colorsBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
    // let colors = [];
    // for (let i = 0; i < this.model.vertexes.length; i++) {
    //   colors.push(...this.color);
    // }
    // gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.normals), gl.STATIC_DRAW);

    this.uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.uv), gl.STATIC_DRAW);

    this.tangentBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.tangent), gl.STATIC_DRAW);
  }

  bindMesh(gl: WebGLRenderingContext, locations: LocationsMap) {
    // Bind Vertexes
    gl.enableVertexAttribArray(locations['a_position']);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(locations['a_position'], 3, gl.FLOAT, false, 0, 0);

    // Normals
    gl.enableVertexAttribArray(locations['a_normal']);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(locations['a_normal'], 3, gl.FLOAT, false, 0, 0);

    // UV
    gl.enableVertexAttribArray(locations['a_uv']);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(locations['a_uv'], 2, gl.FLOAT, true, 0, 0);

    // Tangent
    gl.enableVertexAttribArray(locations['a_tangent']);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
    gl.vertexAttribPointer(locations['a_tangent'], 3, gl.FLOAT, false, 0, 0);
  }

  bindMaterial(gl: WebGLRenderingContext, locations: LocationsMap) {
    gl.uniform3fv(locations['u_light_color'], this.material.lightColor);
    gl.uniform3fv(locations['u_specular_color'], this.material.specularColor);
    gl.uniform3fv(locations['u_ambient_color'], this.material.ambientColor);
    gl.uniform1i(locations['u_useAmbient'], this.material.useAmbient);
    gl.uniform1i(locations['u_useSpecular'], this.material.useSpecular);
    gl.uniform1i(locations['u_useDiffuse'], this.material.useDiffuse);
    gl.uniform1f(locations['u_hardness'], this.material.hardness);

    gl.uniform1i(locations['u_texture_diffuse'], this.diffuseTextureId);
    gl.uniform1i(locations['u_texture_specular'], this.specularTextureId);
    gl.uniform1i(locations['u_texture_normal'], this.normalTextureId);
  }

  render(gl: WebGLRenderingContext, locations: LocationsMap) {
    this.bindMesh(gl, locations);
    this.bindMaterial(gl, locations);

    // Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.model.indices.length, gl.UNSIGNED_INT, 0);
  }
}
