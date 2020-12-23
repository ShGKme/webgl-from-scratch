import VertexShader from '../glsl/phong.vertex.glsl';
import FragmentShader from '../glsl/phong.fragment.glsl';
import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';
import { Mat4Utils } from '../utils/math';
import { AbstractShader } from './AbstractShader';

export class PhongShader extends AbstractShader {
  static vertexShader: string = VertexShader;
  static fragmentShader: string = FragmentShader;

  protected configure() {
    super.configure();

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.getExtension('OES_element_index_uint');
  }

  protected getLocations() {
    this.locations['a_position'] = this.gl.getAttribLocation(this.program, 'a_position') as number;
    this.locations['a_normal'] = this.gl.getAttribLocation(this.program, 'a_normal') as number;
    this.locations['a_uv'] = this.gl.getAttribLocation(this.program, 'a_uv') as number;
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
    this.locations['u_use_specular_texture'] = this.gl.getUniformLocation(
      this.program,
      'u_use_specular_texture',
    ) as number;
    this.locations['u_use_diffuse_texture'] = this.gl.getUniformLocation(
      this.program,
      'u_use_diffuse_texture',
    ) as number;
    this.locations['u_hardness'] = this.gl.getUniformLocation(this.program, 'u_hardness') as number;
    this.locations['u_texture_diffuse'] = this.gl.getUniformLocation(this.program, 'u_texture_diffuse') as number;
    this.locations['u_texture_specular'] = this.gl.getUniformLocation(this.program, 'u_texture_specular') as number;
  }

  protected bindMatrices(object: SceneObject, scene: Scene) {
    const MVP = Mat4Utils.multiply(Mat4Utils.multiply(scene.P, scene.V), object.M());
    const MV = Mat4Utils.multiply(scene.V, object.M());
    const MV1T = Mat4Utils.transpose(Mat4Utils.inverse(MV));

    this.gl.uniformMatrix4fv(this.locations['u_MVP'], false, MVP);
    this.gl.uniformMatrix4fv(this.locations['u_M'], false, object.M());
    this.gl.uniformMatrix4fv(this.locations['u_V'], false, scene.V);
    this.gl.uniformMatrix4fv(this.locations['u_P'], false, scene.P);
    this.gl.uniformMatrix4fv(this.locations['u_MV'], false, MV);
    this.gl.uniformMatrix4fv(this.locations['u_MV1T'], false, MV1T);
  }

  protected bindAdditional(object: SceneObject, scene: Scene) {
    this.gl.uniform3fv(this.locations['u_light_position'], scene.lightPosition);
    this.gl.uniform3fv(this.locations['u_camera_position'], scene.cameraPosition);
  }

  protected bindObjectMesh(object: SceneObject) {
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
  }

  protected bindObjectMaterial(object: SceneObject) {
    this.gl.uniform3fv(this.locations['u_diffuse_color'], object.material.diffuseColor);
    this.gl.uniform3fv(this.locations['u_specular_color'], object.material.specularColor);
    this.gl.uniform3fv(this.locations['u_ambient_color'], object.material.ambientColor);

    this.gl.uniform1f(this.locations['u_hardness'], object.material.hardness);

    this.gl.uniform1i(this.locations['u_use_diffuse_texture'], object.material.diffuseTexture ? 1 : 0);
    this.gl.uniform1i(this.locations['u_use_specular_texture'], object.material.specularTexture ? 1 : 0);

    if (object.material.diffuseTexture) {
      this.gl.uniform1i(this.locations['u_texture_diffuse'], object.material.diffuseTexture.id);
    }
    if (object.material.specularTexture) {
      this.gl.uniform1i(this.locations['u_texture_specular'], object.material.specularTexture.id);
    }
  }

  protected drawObject(object: SceneObject) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, object.model.indices.length, this.gl.UNSIGNED_INT, 0);
  }
}
