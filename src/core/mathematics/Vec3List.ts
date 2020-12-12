export class Vec3List {
  private items: Float32Array;

  constructor(length) {
    this.items = new Float32Array(length);
  }

  vecAt(index) {
    return this.items.subarray(3 * index, 3 * index + 3);
  }

  triangleFrom(startIndex: number) {
    return [
      this.items.subarray(3 * (startIndex + 0), 3 * (startIndex + 0) + 3),
      this.items.subarray(3 * (startIndex + 1), 3 * (startIndex + 1) + 3),
      this.items.subarray(3 * (startIndex + 2), 3 * (startIndex + 2) + 3),
    ]
  }
}