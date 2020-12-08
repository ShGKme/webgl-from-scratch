import { SceneObject } from '../SceneObject/SceneObject';
import { Scene } from '../Scene';

export interface ShaderProgramInterface {
  renderObjectOnScene(object: SceneObject, scene: Scene): void;
}
