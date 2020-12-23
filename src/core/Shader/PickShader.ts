import VertexShader from '../glsl/pick.vertex.glsl';
import FragmentShader from '../glsl/pick.fragment.glsl';
import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';
import { Mat4Utils, Vec3Utils } from '../utils/math';
import { AbstractShader } from './AbstractShader';
import { PickableSceneObject } from '../SceneObject/PickableSceneObject';

export class PickShader extends AbstractShader {
  static vertexShader: string = VertexShader;
  static fragmentShader: string = FragmentShader;

  protected configure() {
    super.configure();

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.getExtension('OES_element_index_uint');
  }

  protected getLocations() {
    super.getLocations();

    this.locations['a_position'] = this.gl.getAttribLocation(this.program, 'a_position') as number;
    this.locations['u_MVP'] = this.gl.getUniformLocation(this.program, 'u_MVP') as number;
    this.locations['u_diffuse_color'] = this.gl.getUniformLocation(this.program, 'u_diffuse_color') as number;
  }

  protected bindMatrices(object: SceneObject, scene: Scene) {
    const MVP = Mat4Utils.multiply(Mat4Utils.multiply(scene.P, scene.V), object.M());
    this.gl.uniformMatrix4fv(this.locations['u_MVP'], false, MVP);
  }

  protected bindObjectMesh(object: PickableSceneObject) {
    this.gl.enableVertexAttribArray(this.locations['a_position']);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.vertexBuffer);
    this.gl.vertexAttribPointer(this.locations['a_position'], 3, this.gl.FLOAT, false, 0, 0);
  }

  protected bindObjectMaterial(object: PickableSceneObject) {
    this.gl.uniform3fv(this.locations['u_diffuse_color'], Vec3Utils.factor(object.pickColor, 1 / 255));
  }

  protected drawObject(object: PickableSceneObject) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, object.model.indices.length, this.gl.UNSIGNED_INT, 0);
  }

  tryPick(object: PickableSceneObject, scene: Scene, x: number, y: number) {
    this.renderObjectOnScene(object, scene);
    const color = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, color);
    if (color[0] === object.pickColor[0]) {
      object.pick();
    } else {
      object.unpick();
    }
  }
}
