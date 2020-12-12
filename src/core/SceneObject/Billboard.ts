import { SceneObject } from './SceneObject';
import { Mat4 } from '../../types';
import { Mat4Utils, Vec3Utils } from '../utils/math';

export class Billboard extends SceneObject {
  static billboardMatrix(MV: Mat4): Mat4 {
    return new Float32Array([
      Vec3Utils.length(new Float32Array([MV[0], MV[4], MV[8]])),
      0,
      0,
      0,

      0,
      Vec3Utils.length(new Float32Array([MV[1], MV[5], MV[9]])),
      0,
      0,

      0,
      0,
      Vec3Utils.length(new Float32Array([MV[2], MV[6], MV[10]])),
      0,

      MV[12],
      MV[13],
      MV[14],
      1,
    ]);
  }

  V: Mat4;
  billboardTarget: SceneObject;

  M(): Mat4 {
    if (!this.billboardTarget) {
      return super.M();
    }
    // Get MV from target object
    const MV = Mat4Utils.multiply(this.V, this.billboardTarget.M());
    // get Billboard matrix from MV
    let M = Billboard.billboardMatrix(MV);
    // Just because we will multiply on V later again, now we need to multiply on V^-1
    M = Mat4Utils.multiply(Mat4Utils.inverse(this.V), M);
    // We may need to a bit transform billboard more
    M = Mat4Utils.multiply(M, super.M());
    return M;
  }
}
