import { Vec2, Vec3 } from '../types';
import { Vec3Utils } from '../utils/math';

export type ModelMeshData = {
  indices: Float32Array;
  vertices: Float32Array;
  normals: Float32Array;
};

export type ModelData = ModelMeshData & {
  uv?: Float32Array;
};

/**
 * 3D Model
 */
export class Model implements ModelData {
  indices: Float32Array = new Float32Array([]);
  vertices: Float32Array = new Float32Array([]);
  normals: Float32Array = new Float32Array([]);
  uv?: Float32Array = new Float32Array([]);
  tangent?: Float32Array = new Float32Array([]);

  constructor(data?: ModelData) {
    data && Object.assign(this, data);
  }

  generateTangent() {
    this.tangent = new Float32Array(this.vertices.length);

    for (let i = 0; i < this.indices.length; i += 3) {
      const triangleIndices: Vec3 = this.indices.subarray(i, i + 3) as Vec3;

      const eo1: Vec3 = new Float32Array([
        this.vertices[3 * triangleIndices[1] + 0] - this.vertices[3 * triangleIndices[0] + 0],
        this.vertices[3 * triangleIndices[1] + 1] - this.vertices[3 * triangleIndices[0] + 1],
        this.vertices[3 * triangleIndices[1] + 2] - this.vertices[3 * triangleIndices[0] + 2],
      ]);

      const eo2: Vec3 = new Float32Array([
        this.vertices[3 * triangleIndices[2] + 0] - this.vertices[3 * triangleIndices[0] + 0],
        this.vertices[3 * triangleIndices[2] + 1] - this.vertices[3 * triangleIndices[0] + 1],
        this.vertices[3 * triangleIndices[2] + 2] - this.vertices[3 * triangleIndices[0] + 2],
      ]);

      const et1: Vec2 = new Float32Array([
        this.uv[2 * triangleIndices[1] + 0] - this.uv[2 * triangleIndices[0] + 0],
        this.uv[2 * triangleIndices[1] + 1] - this.uv[2 * triangleIndices[0] + 1],
      ]);
      const et2: Vec2 = new Float32Array([
        this.uv[2 * triangleIndices[2] + 0] - this.uv[2 * triangleIndices[0] + 0],
        this.uv[2 * triangleIndices[2] + 1] - this.uv[2 * triangleIndices[0] + 1],
      ]);

      const f: number = 1.0 / (et1[0] * et2[1] - et2[0] * et1[1]);
      const tangent: Vec3 = Vec3Utils.normalize(
        new Float32Array([
          f * (et2[1] * eo1[0] - et1[1] * eo2[0]),
          f * (et2[1] * eo1[1] - et1[1] * eo2[1]),
          f * (et2[1] * eo1[2] - et1[1] * eo2[2]),
        ]),
      );

      for (let j = 0; j < 3; j++) {
        let t: Vec3 = this.tangent.slice(3 * triangleIndices[j], 3 * triangleIndices[j] + 3);
        t = Vec3Utils.normalize(Vec3Utils.sum(t, tangent));

        this.tangent[3 * triangleIndices[j] + 0] = t[0];
        this.tangent[3 * triangleIndices[j] + 1] = t[1];
        this.tangent[3 * triangleIndices[j] + 2] = t[2];
      }
    }
  }
}
