import { SceneObject } from './SceneObject';
import { Model } from '../Model';
import { Camera } from './Camera';
import { Mat4Utils, Vec3Utils } from '../utils/math';

export class LockedSceneObject extends SceneObject {
  camera: Camera = null;

  constructor(camera: Camera, model?: Model) {
    super(model);
    this.camera = camera;
  }

  M() {
    let M = Mat4Utils.identity();

    const translation = Vec3Utils.factor(this.camera.translation, -1);
    M = Mat4Utils.translate(M, translation[0], translation[1], translation[2]);

    const rotation = Mat4Utils.multiply(Mat4Utils.inverse(this.camera.rotationMatrix()), this.rotation);
    M = Mat4Utils.multiply(M, rotation);

    M = Mat4Utils.translate(M, this.translation[0], this.translation[1], this.translation[2]);

    M = Mat4Utils.scale(M, this.scale[0], this.scale[1], this.scale[2]);
    return M;
  }
}
