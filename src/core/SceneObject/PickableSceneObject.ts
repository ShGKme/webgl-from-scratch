import { SceneObject } from './SceneObject';
import { Vec3 } from '../../types';

export class PickableSceneObject extends SceneObject {
  static _id: number = 0;
  static get id(): number {
    PickableSceneObject._id += 10;
    return PickableSceneObject._id;
  }

  isPickable: boolean = true;
  isPicked: boolean = false;
  onPick: Function;
  onUnpick: Function;

  pickColor: Vec3;

  constructor(args) {
    super(args);
    this.pickColor = new Float32Array([PickableSceneObject.id, 0, 0]);
  }

  pick() {
    if (this.isPickable) {
      this.isPicked = true;
      this.onPick?.();
    }
  }

  unpick() {
    this.isPicked = false;
    this.onUnpick?.();
  }
}
