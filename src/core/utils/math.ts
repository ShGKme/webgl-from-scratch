// Some objects were taken from webglfundomentals.org

import { Mat3, Mat4, Vec3, Vec4 } from '../../types';

export const Vec3Utils = {
  // v * n
  factor(v: Vec3, multiplier: number): Vec3 {
    return v.map((x) => x * multiplier) as Vec3;
  },

  // a - b
  sum(a: Vec3, b: Vec3): Vec3 {
    return new Float32Array([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
  },

  // a - b
  subtract(a: Vec3, b: Vec3): Vec3 {
    return new Float32Array([a[0] - b[0], a[1] - b[1], a[2] - b[2]]);
  },

  normalize(v: Vec3): Vec3 {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
      return new Float32Array([v[0] / length, v[1] / length, v[2] / length]);
    } else {
      return new Float32Array([0, 0, 0]);
    }
  },

  // (a,b)
  cross(a: Vec3, b: Vec3): Vec3 {
    return new Float32Array([a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]);
  },

  // [a,b]
  // function dot(a: Vec3, b: Vec3): Vec3 {
  //   return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // }

  length(v: Vec3) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  },
};

// Angles translate
export function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

export function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

// Matrix 4x4 for Graphic
export const Mat4Utils = {
  frustumProjection(l: number, r: number, b: number, t: number, near: number, far: number): Mat4 {
    const A = (r + l) / (r - l);
    const B = (t + b) / (t - b);
    const C = -(far + near) / (far - near);
    const D = -(2 * far * near) / (far - near);
    // prettier-ignore
    return new Float32Array([
      (2 * near) / (r - l), 0, A, 0,
      0, (2 * near) / (t - b), B, 0,
      0, 0, C, D,
      0, 0, -1, 0,
    ]);
  },

  projection(width: number, height: number, depth: number): Mat4 {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return new Float32Array([2 / width, 0, 0, 0, 0, -2 / height, 0, 0, 0, 0, 2 / depth, 0, -1, 1, 0, 1]);
  },

  // Orthographic projection
  orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    return new Float32Array([
      2 / (right - left),
      0,
      0,
      0,

      0,
      2 / (top - bottom),
      0,
      0,

      0,
      0,
      2 / (near - far),
      0,

      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ]);
  },

  // Perspective projection
  perspective(fieldOfViewInRadians: number, aspect: number, near: number, far: number): Mat4 {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    const rangeInv = 1.0 / (near - far);
    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ]);
  },

  // Returns lookUp camera matrix for camera, that is located on position from matrix cameraPosition, looks on the target and has axis up (0 1 0 default)
  lookAt(cameraPosition: Vec3, target: Vec3, up: Vec3): Mat4 {
    if (up == undefined) {
      up = new Float32Array([0, 1, 0]);
    }

    const zAxis = Vec3Utils.normalize(
      Vec3Utils.subtract(new Float32Array([cameraPosition[0], cameraPosition[1], cameraPosition[2]]), target),
    );
    const xAxis = Vec3Utils.normalize(Vec3Utils.cross(up, zAxis));
    const yAxis = Vec3Utils.normalize(Vec3Utils.cross(zAxis, xAxis));

    return new Float32Array([
      xAxis[0],
      xAxis[1],
      xAxis[2],
      0,

      yAxis[0],
      yAxis[1],
      yAxis[2],
      0,

      zAxis[0],
      zAxis[1],
      zAxis[2],
      0,

      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2],
      1,
    ]);
  },

  // Identity matrix
  identity(): Mat4 {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  },

  // Returns a matrix thst is the result of Multiply matrix 4x4 a on b
  multiply(a: Mat4, b: Mat4): Mat4 {
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];
    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];
    return new Float32Array([
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ]);
  },

  // Returns an inverse of matrix M
  inverse(m: Mat4): Mat4 {
    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m03 = m[0 * 4 + 3];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m13 = m[1 * 4 + 3];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];
    const m23 = m[2 * 4 + 3];
    const m30 = m[3 * 4 + 0];
    const m31 = m[3 * 4 + 1];
    const m32 = m[3 * 4 + 2];
    const m33 = m[3 * 4 + 3];
    const tmp_0 = m22 * m33;
    const tmp_1 = m32 * m23;
    const tmp_2 = m12 * m33;
    const tmp_3 = m32 * m13;
    const tmp_4 = m12 * m23;
    const tmp_5 = m22 * m13;
    const tmp_6 = m02 * m33;
    const tmp_7 = m32 * m03;
    const tmp_8 = m02 * m23;
    const tmp_9 = m22 * m03;
    const tmp_10 = m02 * m13;
    const tmp_11 = m12 * m03;
    const tmp_12 = m20 * m31;
    const tmp_13 = m30 * m21;
    const tmp_14 = m10 * m31;
    const tmp_15 = m30 * m11;
    const tmp_16 = m10 * m21;
    const tmp_17 = m20 * m11;
    const tmp_18 = m00 * m31;
    const tmp_19 = m30 * m01;
    const tmp_20 = m00 * m21;
    const tmp_21 = m20 * m01;
    const tmp_22 = m00 * m11;
    const tmp_23 = m10 * m01;

    const t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    const t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    const t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    const t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return new Float32Array([
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ]);
  },

  // Returns transpose matrix M
  transpose(m: Mat4): Mat4 {
    const res = m;
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const temp = m[j * 4 + i];
        m[j * 4 + i] = m[i * 4 + j];
        m[i * 4 + j] = temp;
      }
    }
    return res;
  },

  // Returns matrix 4x4 that is the result of multiply vector4 V on matrix 4x4 M
  vectorMultiply(v: Vec4, m: Mat4): Mat4 {
    let dst: Mat4 = new Float32Array(14) as Mat4;
    for (let i = 0; i < 4; ++i) {
      dst[i] = 0.0;
      for (let j = 0; j < 4; ++j) dst[i] += v[j] * m[j * 4 + i];
    }
    return dst;
  },

  // Returns matrix 4x4 for translation to tx, ty, tz
  translation(tx: number, ty: number, tz: number): Mat4 {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1]);
  },

  // Returns matrix 4x4 for rotation on x axis to angle in radians
  xRotation(angleInRadians: number): Mat4 {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);

    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
  },

  // Returns matrix 4x4 for rotation on y axis to angle in radians
  yRotation(angleInRadians: number): Mat4 {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);

    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  },

  // Returns matrix 4x4 for rotation on z axis to angle in radians
  zRotation(angleInRadians: number): Mat4 {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);

    return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  },

  // Returns matrix 4x4 for full rotation
  rotation(angleInRadiansX: number, angleInRadiansY: number, angleInRadiansZ: number) {
    const m = Mat4Utils.multiply(Mat4Utils.xRotation(angleInRadiansX), Mat4Utils.yRotation(angleInRadiansY));
    return Mat4Utils.multiply(m, Mat4Utils.zRotation(angleInRadiansZ));
  },

  // Returns matrix 4x4 for scaling on sx, sy, sz
  scaling(sx: number, sy: number, sz: number): Mat4 {
    return new Float32Array([sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1]);
  },

  // Returns matrix 4x4 that is the result of translation matrix 4x4 m to tx, ty, tz
  translate(m: Mat4, tx: number, ty: number, tz: number) {
    return Mat4Utils.multiply(m, Mat4Utils.translation(tx, ty, tz));
  },

  // Returns matrix 4x4 that is the result of rotation matrix 4x4 m on x axis to angle in radians
  xRotate(m: Mat4, angleInRadians: number) {
    return Mat4Utils.multiply(m, Mat4Utils.xRotation(angleInRadians));
  },

  // Returns matrix 4x4 that is the result of rotation matrix 4x4 m on y axis to angle in radians
  yRotate(m: Mat4, angleInRadians: number) {
    return Mat4Utils.multiply(m, Mat4Utils.yRotation(angleInRadians));
  },

  // Returns matrix 4x4 that is the result of rotation matrix 4x4 m on z axis to angle in radians
  zRotate(m: Mat4, angleInRadians: number) {
    return Mat4Utils.multiply(m, Mat4Utils.zRotation(angleInRadians));
  },

  // Returns matrix 4x4 that is the result of rotation matrix 4x4 m on ass axises to angle in radians
  rotate(m: Mat4, angleInRadiansX: number, angleInRadiansY: number, angleInRadiansZ: number) {
    let temp = m;
    temp = Mat4Utils.xRotate(temp, angleInRadiansX);
    temp = Mat4Utils.yRotate(temp, angleInRadiansY);
    temp = Mat4Utils.zRotate(temp, angleInRadiansZ);
    return temp;
  },

  // Returns matrix 4x4 that is the result of scaling matrix 4x4 m on sx, sy, sz
  scale(m: Mat4, sx: number, sy: number, sz: number) {
    return Mat4Utils.multiply(m, Mat4Utils.scaling(sx, sy, sz));
  },

  // normalize(m: Mat4) {
  //   const v1: Vec4 = Vec.normalize new Float32Array([m[0], m[4], m[8], m[12]]);
  //   const v2: Vec4 = Vec.normalize new Float32Array([m[1], m[5], m[9], m[13]]);
  //   const v3: Vec4 = Vec.normalize new Float32Array([m[2], m[6], m[10], m[14]]);
  //   const v4: Vec4 = Vec.normalize new Float32Array([m[3], m[7], m[11], m[15]]);
  // },
};

// Matrix 3x3
export const Mat3Utils = {
  projection(width: number, height: number): Mat3 {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return new Float32Array([2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 1]);
  },

  // Identity matrix
  identity(): Mat3 {
    return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  },

  // Returns transpose matrix M
  transpose(m: Mat3): Mat3 {
    const res = m;
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        const temp = m[j * 3 + i];
        m[j * 3 + i] = m[i * 3 + j];
        m[i * 3 + j] = temp;
      }
    }
    return res;
  },

  // Returns matrix 3x3 for translation to tx, ty
  translation(tx: number, ty: number): Mat3 {
    return new Float32Array([1, 0, 0, 0, 1, 0, tx, ty, 1]);
  },

  // Returns matrix 3x3 for rotation to angle in radians
  rotation(angleInRadians: number): Mat3 {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    return new Float32Array([c, -s, 0, s, c, 0, 0, 0, 1]);
  },

  // Returns matrix 3x3 for scaling on sx, sy
  scaling(sx: number, sy: number): Mat3 {
    return new Float32Array([sx, 0, 0, 0, sy, 0, 0, 0, 1]);
  },

  // Returns a matrix thst is the result of Multiply matrix 3x3 a on b
  multiply(a: Mat3, b: Mat3): Mat3 {
    const a00 = a[0 * 3 + 0];
    const a01 = a[0 * 3 + 1];
    const a02 = a[0 * 3 + 2];
    const a10 = a[1 * 3 + 0];
    const a11 = a[1 * 3 + 1];
    const a12 = a[1 * 3 + 2];
    const a20 = a[2 * 3 + 0];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];
    const b00 = b[0 * 3 + 0];
    const b01 = b[0 * 3 + 1];
    const b02 = b[0 * 3 + 2];
    const b10 = b[1 * 3 + 0];
    const b11 = b[1 * 3 + 1];
    const b12 = b[1 * 3 + 2];
    const b20 = b[2 * 3 + 0];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];
    return new Float32Array([
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ]) as Mat3;
  },

  // Returns matrix 3x3 that is the result of translation matrix 3x3 m to tx, ty
  translate(m: Mat3, tx: number, ty: number) {
    return Mat3Utils.multiply(m, Mat3Utils.translation(tx, ty));
  },

  // Returns matrix 3x3 that is the result of rotation matrix 3x3 m to angle in radians
  rotate(m: Mat3, angleInRadians: number) {
    return Mat3Utils.multiply(m, Mat3Utils.rotation(angleInRadians));
  },

  // Returns matrix 3x3 that is the result of scaling matrix 3x3 m on sx, sy
  scale(m: Mat3, sx: number, sy: number) {
    return Mat3Utils.multiply(m, Mat3Utils.scaling(sx, sy));
  },
};
