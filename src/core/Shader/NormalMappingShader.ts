import { PhongShader } from './PhongShader';
import { SceneObject } from '../SceneObject/SceneObject';
import VertexShader from '../shaders/tangent.vertex.glsl';
import FragmentShader from '../shaders/tangent.fragment.glsl';

export class NormalMappingShader extends PhongShader {
  static vertexShader: string = VertexShader;
  static fragmentShader: string = FragmentShader;

  protected getLocations() {
    super.getLocations();

    this.locations['a_tangent'] = this.gl.getAttribLocation(this.program, 'a_tangent') as number;
    this.locations['u_texture_normal'] = this.gl.getUniformLocation(this.program, 'u_texture_normal') as number;
  }

  protected bindObjectMesh(object: SceneObject) {
    super.bindObjectMesh(object);

    this.gl.enableVertexAttribArray(this.locations['a_tangent']);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.tangentBuffer);
    this.gl.vertexAttribPointer(this.locations['a_tangent'], 3, this.gl.FLOAT, false, 0, 0);
  }

  protected bindObjectMaterial(object: SceneObject) {
    super.bindObjectMaterial(object);

    this.gl.uniform1i(this.locations['u_texture_normal'], object.material.normalTexture.id);
  }
}
