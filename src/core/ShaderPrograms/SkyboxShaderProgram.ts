import { initShaderProgram } from '../../utils/webgl';
import VertexShader from '../../shaders/skybox/vertex.glsl';
import FragmentShader from '../../shaders/skybox/fragment.glsl';
import { LocationsMap } from '../Locations';
import { ShaderProgramInterface } from './ShaderProgram.interface';
import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';
import { Mat4Utils } from '../../utils/math';

export class SkyboxShaderProgram implements ShaderProgramInterface {
  program: WebGLProgram;
  locations: LocationsMap = {};
  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.program = initShaderProgram(this.gl, VertexShader, FragmentShader);

    this.locations['a_position'] = this.gl.getAttribLocation(this.program, 'a_position') as number;
    this.locations['a_uv'] = this.gl.getAttribLocation(this.program, 'a_uv') as number;
    this.locations['u_MV'] = this.gl.getUniformLocation(this.program, 'u_MV') as number;
    this.locations['u_MVP'] = this.gl.getUniformLocation(this.program, 'u_MVP') as number;
    this.locations['u_diffuse_color'] = this.gl.getUniformLocation(this.program, 'u_diffuse_color') as number;
    this.locations['u_texture_diffuse'] = this.gl.getUniformLocation(this.program, 'u_texture_diffuse') as number;
  }
  use() {
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.getExtension('OES_element_index_uint');
    this.gl.useProgram(this.program);
  }

  renderObjectOnScene(object: SceneObject, scene: Scene) {
    this.use();

    const V = scene.camera.viewMatrix2();
    const MVP = Mat4Utils.multiply(Mat4Utils.multiply(scene.P, V), object.M());
    const MV = Mat4Utils.multiply(scene.V, object.M());

    this.gl.uniformMatrix4fv(this.locations['u_MVP'], false, MVP);
    this.gl.uniformMatrix4fv(this.locations['u_MV'], false, MV);

    this.bindObjectMesh(object);
    this.bindObjectMaterial(object);
    this.drawObject(object);
  }

  private bindObjectMesh(object: SceneObject) {
    this.gl.enableVertexAttribArray(this.locations['a_position']);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.vertexBuffer);
    this.gl.vertexAttribPointer(this.locations['a_position'], 3, this.gl.FLOAT, false, 0, 0);

    // if (object.uvBuffer) {
    //   this.gl.enableVertexAttribArray(this.locations['a_uv']);
    //   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.uvBuffer);
    //   this.gl.vertexAttribPointer(this.locations['a_uv'], 2, this.gl.FLOAT, true, 0, 0);
    // }
  }

  private bindObjectMaterial(object: SceneObject) {
    this.gl.uniform3fv(this.locations['u_diffuse_color'], object.material.diffuseColor);
    this.gl.uniform1i(this.locations['u_texture_diffuse'], object.diffuseTextureId);
  }

  private drawObject(object: SceneObject) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, object.model.indices.length, this.gl.UNSIGNED_INT, 0);
  }
}
