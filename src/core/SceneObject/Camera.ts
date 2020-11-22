import { SceneObject } from './SceneObject';
import { Vec3 } from '../../types';
import { Mat4Utils } from '../../utils/math';
import { Surface } from './Surface';

function wrap(a: number, min: number, max: number) {
  a -= min;
  max -= min;
  if (max === 0) return min;
  a = (a % max) + min;
  if (a < min) a += max;
  return a;
}

export class Camera extends SceneObject {
  orientation = {
    yaw: 0,
    roll: 0,
    pitch: 0,
  };

  move(delta: number, surface: Surface) {
    this.translation[0] -= Math.sin(-this.orientation.yaw) * delta;
    this.translation[2] -= Math.cos(-this.orientation.yaw) * delta;
    this.translation[1] = -surface.height(-this.translation[0], -this.translation[2]) - 20;
    console.log(this.translation.toString());
    // terrain−>constrain(m position, m height);
  }

  strafe(delta: number) {
    const angle: number = this.orientation.yaw - Math.PI / 2;
    this.translation[0] -= Math.sin(-angle) * delta;
    this.translation[2] -= Math.cos(-angle) * delta;
    // m terrain−>constrain(m position, m height);
  }

  yaw(angle: number) {
    this.orientation.yaw = wrap(this.orientation.yaw - angle, 0, 2.0 * Math.PI);
  }

  roll(angle: number) {
    this.orientation.roll = wrap(this.orientation.roll - angle, 0, 2.0 * Math.PI);
  }

  pitch(angle: number) {
    this.orientation.pitch = wrap(this.orientation.pitch - angle, 0, 2.0 * Math.PI);
  }

  viewMatrix() {
    return Mat4Utils.translate(
      Mat4Utils.rotate(Mat4Utils.identity(), this.orientation.pitch, this.orientation.yaw, this.orientation.roll),
      this.translation[0],
      this.translation[1],
      this.translation[2],
    );
  }
}
