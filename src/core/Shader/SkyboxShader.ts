import VertexShader from '../shaders/skybox.vertex.glsl';
import FragmentShader from '../shaders/skybox.fragment.glsl';
import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';
import { Mat4Utils } from '../utils/math';
import { AbstractShader } from './AbstractShader';

export class SkyboxShader extends AbstractShader {
  static vertexShader: string = VertexShader;
  static fragmentShader: string = FragmentShader;

  protected configure() {
    super.configure();

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.getExtension('OES_element_index_uint');
  }

  protected getLocations() {
    super.getLocations();

    this.locations['a_position'] = this.gl.getAttribLocation(this.program, 'a_position') as number;
    this.locations['a_uv'] = this.gl.getAttribLocation(this.program, 'a_uv') as number;
    this.locations['u_MV'] = this.gl.getUniformLocation(this.program, 'u_MV') as number;
    this.locations['u_MVP'] = this.gl.getUniformLocation(this.program, 'u_MVP') as number;
    this.locations['u_diffuse_color'] = this.gl.getUniformLocation(this.program, 'u_diffuse_color') as number;
    this.locations['u_texture_diffuse'] = this.gl.getUniformLocation(this.program, 'u_texture_diffuse') as number;
  }

  renderObjectOnScene(object: SceneObject, scene: Scene) {
    super.renderObjectOnScene(object, scene);

    const V = scene.camera.rotationMatrix();
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
  }

  private bindObjectMaterial(object: SceneObject) {
    this.gl.uniform3fv(this.locations['u_diffuse_color'], object.material.diffuseColor);
    this.gl.uniform1i(this.locations['u_texture_diffuse'], object.material.diffuseTexture.id);
  }

  private drawObject(object: SceneObject) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, object.model.indices.length, this.gl.UNSIGNED_INT, 0);
  }
}
