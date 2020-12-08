import { initShaderProgram } from '../../utils/webgl';
import VertexShader from '../../shaders/vertex.glsl';
import FragmentShader from '../../shaders/fragment.glsl';
import { LocationsMap } from '../Locations';
import { ShaderProgramInterface } from './ShaderProgram.interface';
import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';
import { Mat4Utils } from '../../utils/math';

export class SceneShaderProgram implements ShaderProgramInterface {
  program: WebGLProgram;
  locations: LocationsMap = {};
  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.program = initShaderProgram(this.gl, VertexShader, FragmentShader);

    this.locations['a_position'] = this.gl.getAttribLocation(this.program, 'a_position') as number;
    this.locations['a_normal'] = this.gl.getAttribLocation(this.program, 'a_normal') as number;
    this.locations['a_uv'] = this.gl.getAttribLocation(this.program, 'a_uv') as number;
    this.locations['a_tangent'] = this.gl.getAttribLocation(this.program, 'a_tangent') as number;
    this.locations['u_color'] = this.gl.getUniformLocation(this.program, 'u_color') as number;
    this.locations['u_M'] = this.gl.getUniformLocation(this.program, 'u_M') as number;
    this.locations['u_V'] = this.gl.getUniformLocation(this.program, 'u_V') as number;
    this.locations['u_P'] = this.gl.getUniformLocation(this.program, 'u_P') as number;
    this.locations['u_MV'] = this.gl.getUniformLocation(this.program, 'u_MV') as number;
    this.locations['u_MVP'] = this.gl.getUniformLocation(this.program, 'u_MVP') as number;
    this.locations['u_MV1T'] = this.gl.getUniformLocation(this.program, 'u_MV1T') as number;
    this.locations['u_light_position'] = this.gl.getUniformLocation(this.program, 'u_light_position') as number;
    this.locations['u_diffuse_color'] = this.gl.getUniformLocation(this.program, 'u_diffuse_color') as number;
    this.locations['u_specular_color'] = this.gl.getUniformLocation(this.program, 'u_specular_color') as number;
    this.locations['u_ambient_color'] = this.gl.getUniformLocation(this.program, 'u_ambient_color') as number;
    this.locations['u_camera_position'] = this.gl.getUniformLocation(this.program, 'u_camera_position') as number;
    this.locations['u_useAmbient'] = this.gl.getUniformLocation(this.program, 'u_useAmbient') as number;
    this.locations['u_useSpecular'] = this.gl.getUniformLocation(this.program, 'u_useSpecular') as number;
    this.locations['u_useDiffuse'] = this.gl.getUniformLocation(this.program, 'u_useDiffuse') as number;
    this.locations['u_useWorldLight'] = this.gl.getUniformLocation(this.program, 'u_useWorldLight') as number;
    this.locations['u_hardness'] = this.gl.getUniformLocation(this.program, 'u_hardness') as number;
    this.locations['u_texture_diffuse'] = this.gl.getUniformLocation(this.program, 'u_texture_diffuse') as number;
    this.locations['u_texture_specular'] = this.gl.getUniformLocation(this.program, 'u_texture_specular') as number;
    this.locations['u_texture_normal'] = this.gl.getUniformLocation(this.program, 'u_texture_normal') as number;
  }
  use() {
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.getExtension('OES_element_index_uint');
    this.gl.useProgram(this.program);
  }

  renderObjectOnScene(object: SceneObject, scene: Scene) {
    this.use();

    const MVP = Mat4Utils.multiply(Mat4Utils.multiply(scene.P, scene.V), object.M());
    const MV = Mat4Utils.multiply(scene.V, object.M());
    const MV1T = Mat4Utils.transpose(Mat4Utils.inverse(MV));

    this.gl.uniformMatrix4fv(this.locations['u_MVP'], false, MVP);
    this.gl.uniformMatrix4fv(this.locations['u_M'], false, object.M());
    this.gl.uniformMatrix4fv(this.locations['u_V'], false, scene.V);
    this.gl.uniformMatrix4fv(this.locations['u_P'], false, scene.P);
    this.gl.uniformMatrix4fv(this.locations['u_MV'], false, MV);
    this.gl.uniformMatrix4fv(this.locations['u_MV1T'], false, MV1T);

    this.gl.uniform1i(this.locations['u_useWorldLight'], 1);
    this.gl.uniform3fv(this.locations['u_light_position'], scene.lightPosition);
    this.gl.uniform3fv(this.locations['u_camera_position'], scene.cameraPosition);

    this.bindObjectMesh(object);
    this.bindObjectMaterial(object);
    this.drawObject(object);
  }

  private bindObjectMesh(object: SceneObject) {
    this.gl.enableVertexAttribArray(this.locations['a_position']);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.vertexBuffer);
    this.gl.vertexAttribPointer(this.locations['a_position'], 3, this.gl.FLOAT, false, 0, 0);

    this.gl.enableVertexAttribArray(this.locations['a_normal']);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.normalBuffer);
    this.gl.vertexAttribPointer(this.locations['a_normal'], 3, this.gl.FLOAT, false, 0, 0);

    if (object.uvBuffer) {
      this.gl.enableVertexAttribArray(this.locations['a_uv']);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.uvBuffer);
      this.gl.vertexAttribPointer(this.locations['a_uv'], 2, this.gl.FLOAT, true, 0, 0);
    }

    if (object.tangentBuffer) {
      this.gl.enableVertexAttribArray(this.locations['a_tangent']);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.tangentBuffer);
      this.gl.vertexAttribPointer(this.locations['a_tangent'], 3, this.gl.FLOAT, false, 0, 0);
    }
  }

  private bindObjectMaterial(object: SceneObject) {
    this.gl.uniform3fv(this.locations['u_diffuse_color'], object.material.diffuseColor);
    this.gl.uniform3fv(this.locations['u_specular_color'], object.material.specularColor);
    this.gl.uniform3fv(this.locations['u_ambient_color'], object.material.ambientColor);
    this.gl.uniform1i(this.locations['u_useAmbient'], object.material.useAmbient);
    this.gl.uniform1i(this.locations['u_useSpecular'], object.material.useSpecular);
    this.gl.uniform1i(this.locations['u_useDiffuse'], object.material.useDiffuse);
    this.gl.uniform1f(this.locations['u_hardness'], object.material.hardness);

    this.gl.uniform1i(this.locations['u_texture_diffuse'], object.diffuseTextureId);
    this.gl.uniform1i(this.locations['u_texture_specular'], object.specularTextureId);
    this.gl.uniform1i(this.locations['u_texture_normal'], object.normalTextureId);
  }

  private drawObject(object: SceneObject) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, object.model.indices.length, this.gl.UNSIGNED_INT, 0);
  }
}
