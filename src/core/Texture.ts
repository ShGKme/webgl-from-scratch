type CubeImagesArray = [
  HTMLImageElement,
  HTMLImageElement,
  HTMLImageElement,
  HTMLImageElement,
  HTMLImageElement,
  HTMLImageElement,
];

export class Texture {
  static globalId: number = 0;

  readonly id: number;
  texture: WebGLTexture;
  type: '2d' | 'cube';
  readonly image2d: HTMLImageElement;
  readonly imagesCube: CubeImagesArray;

  constructor(type: '2d', imageData: HTMLImageElement);
  constructor(type: 'cube', imageData: CubeImagesArray);
  constructor(type: '2d' | 'cube', imageData: HTMLImageElement | CubeImagesArray) {
    this.id = Texture.globalId++;
    this.type = type;
    if (type === '2d') {
      this.image2d = imageData as HTMLImageElement;
    } else if (type === 'cube') {
      this.imagesCube = imageData as CubeImagesArray;
    }
  }

  buffer(gl: WebGLRenderingContext) {
    if (this.type === '2d') {
      this.buffer2d(gl);
    } else if (this.type === 'cube') {
      this.bufferCube(gl);
    }
  }

  buffer2d(gl: WebGLRenderingContext) {
    this.texture = gl.createTexture();

    gl.activeTexture(gl[`TEXTURE${this.id}`]);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image2d);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  bufferCube(gl: WebGLRenderingContext) {
    this.texture = gl.createTexture();
    gl.activeTexture(gl[`TEXTURE${this.id}`]);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    this.imagesCube.forEach((image, index) => {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  }
}
