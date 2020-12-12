import { SceneObject } from './SceneObject';
import { Model } from '../Model';
import { Vec3 } from '../../types';
import { Vec3Utils } from '../utils/math';
import { getImagePixels } from '../utils/img';

export class Surface extends SceneObject {
  heightmapData: Uint8ClampedArray;
  depth: 8 | 16 = 8;
  size: number;

  constructor() {
    super();
  }

  async generateMesh(heightmapUrl: string, uvRepeats: number = 1, depth: 8 | 16 = 8) {
    this.depth = depth;

    console.log('Start generating heightmap');
    this.model = new Model();

    console.log('Start loading heightmap');
    this.heightmapData = await getImagePixels(heightmapUrl);
    this.size = Math.ceil(Math.sqrt(this.heightmapData.length / 4));
    console.log(`Heightmap ${this.size}x${this.size} is loaded`);

    this.generateVertices();
    this.generateIndices();
    this.generateUV(uvRepeats);
    this.generateNormals();
    this.model.generateTangent();

    console.log('Finish loading heightmap');
  }

  private generateVertices() {
    this.model.vertices = new Float32Array(3 * this.size ** 2);
    let i = 0;
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        this.model.vertices[i++] = x;
        this.model.vertices[i++] = this.heightmapValueAt(x, z);
        // this.model.vertices[i++] =
        //   (this.heightmapData
        //     .slice((x * this.side + z) * 4, (x * this.side + z) * 4 + 3)
        //     .reduce((sum, x) => sum + x, 0) /
        //     3 /
        //     255) *
        //   this.factor;
        this.model.vertices[i++] = z;
      }
    }
  }

  private generateIndices() {
    this.model.indices = new Float32Array(3 * 2 * (this.size - 1) ** 2);

    let i = 0;
    for (let x = 0; x < this.size - 1; x++) {
      for (let z = 0; z < this.size - 1; z++) {
        this.model.indices[i++] = x * this.size + z;
        this.model.indices[i++] = x * this.size + z + 1;
        this.model.indices[i++] = (x + 1) * this.size + z;

        this.model.indices[i++] = (x + 1) * this.size + z;
        this.model.indices[i++] = x * this.size + z + 1;
        this.model.indices[i++] = (x + 1) * this.size + z + 1;
      }
    }
  }

  private generateUV(repeats: number) {
    this.model.uv = new Float32Array(2 * this.size ** 2);

    let i = 0;
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        this.model.uv[i++] = (z / (this.size - 1)) * repeats;
        this.model.uv[i++] = (x / (this.size - 1)) * repeats;
      }
    }
  }

  private generateNormals() {
    this.model.normals = new Float32Array(3 * this.size ** 2);

    for (let j = 0; j < this.model.indices.length - 2; j++) {
      const triangleIndices: Vec3 = this.model.indices.subarray(j, j + 3) as Vec3;
      const v: [Vec3, Vec3, Vec3] = [
        this.model.vertices.subarray(3 * triangleIndices[0], 3 * triangleIndices[0] + 3),
        this.model.vertices.subarray(3 * triangleIndices[1], 3 * triangleIndices[1] + 3),
        this.model.vertices.subarray(3 * triangleIndices[2], 3 * triangleIndices[2] + 3),
      ];
      const newNormal = Vec3Utils.normalize(
        Vec3Utils.cross(Vec3Utils.subtract(v[1], v[0]), Vec3Utils.subtract(v[2], v[1])),
      );
      triangleIndices.forEach((index: number) => {
        const normal = this.model.normals.subarray(3 * index, 3 * index + 3) as Vec3;
        const nn = Vec3Utils.normalize(Vec3Utils.sum(normal, newNormal));
        normal[0] = nn[0];
        normal[1] = nn[1];
        normal[2] = nn[2];
      });
    }
  }

  heightmapValueAt(x: number, z: number): number {
    return this.depth === 8 ? this.heightmap8ValueAt(x, z) : this.heightmap16ValueAt(x, z);
  }

  private heightmap8ValueAt(x: number, z: number): number {
    const [r, g, b] = this.heightmapData.slice((x * this.size + z) * 4, (x * this.size + z) * 4 + 3);
    return ((r + g + b) / 255 / 3) * (this.size / 4);
  }

  private heightmap16ValueAt(x: number, z: number): number {
    const [r, g, b] = this.heightmapData.slice((x * this.size + z) * 4, (x * this.size + z) * 4 + 3);
    return ((r | (g << 8) | (b << 16)) / 255 ** 2) * (this.size / 4);
  }

  height(x: number, z: number) {
    const realX = (x - this.translation[0]) / this.scale[0];
    const realZ = (z - this.translation[2]) / this.scale[2];
    const i = Math.round(realX);
    const j = Math.round(realZ);
    const fi = realX - i;
    const fj = realZ - j;
    const nfi = 1 - fi;
    const nfj = 1 - fj;
    return (
      ((this.heightmapValueAt(i, j) * nfi + this.heightmapValueAt(i + 1, j) * fi) * nfj +
        (this.heightmapValueAt(i, j + 1) * nfi + this.heightmapValueAt(i + 1, j + 1) * fi) * fj) *
        this.scale[1] +
      this.translation[1]
    );
  }
}
