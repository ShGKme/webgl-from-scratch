import { Color } from '../types';
import { Texture } from './Texture';

export class Material {
  diffuseColor: Color = new Float32Array([0.7, 0.7, 0.7]);
  specularColor: Color = new Float32Array([1.0, 1.0, 1.0]);
  ambientColor: Color = new Float32Array([0.1, 0.1, 0.1]);

  hardness: number = 300.0;

  diffuseTexture: Texture;
  specularTexture: Texture;
  normalTexture: Texture;
}
