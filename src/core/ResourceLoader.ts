import { ModelData } from './Model';
import { parseOBJ } from './utils/OBJParser';

export type ResourceType = 'image' | 'model' | 'pixels';

export type ResourcesMap = { [name: string]: Resource<any> };

export class Resource<T> {
  loader: (src: string) => Promise<T>;
  type: ResourceType;
  url: string;
  data: T;
  state: 'waiting' | 'loading' | 'done' | 'error' = 'waiting';

  constructor(type: ResourceType, url) {
    const loadersMap = {
      image: ResourceLoader.loadImage,
      model: ResourceLoader.loadObj,
      pixels: ResourceLoader.loadPixelData,
    };
    this.type = type;
    this.url = url;
    // @ts-ignore
    this.loader = loadersMap[type];
  }

  async load() {
    this.state = 'loading';
    try {
      this.data = await this.loader(this.url);
      this.state = 'done';
    } catch (e) {
      this.state = 'error';
      throw e;
    }
  }
}

export class ResourceLoader {
  resources: ResourcesMap;
  onprogress: () => any = () => {};
  done: { [type in ResourceType]: number } = {
    model: 0,
    image: 0,
    pixels: 0,
  };

  constructor(resources: ResourcesMap) {
    this.resources = resources;
  }

  load() {
    this.onprogress();
    return Promise.all(
      Object.values(this.resources).map(async (resource) => {
        await resource.load();
        this.done[resource.type]++;
        this.onprogress();
      }),
    );
  }

  static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = src;
      image.addEventListener('load', () => {
        resolve(image);
      });
      image.addEventListener('error', reject);
    });
  }

  static loadPixelData(src: string): Promise<Uint8ClampedArray> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
      };

      img.onerror = reject;
    });
  }

  static loadObj(src: string): Promise<ModelData> {
    return fetch(src)
      .then((res) => res.text())
      .then(parseOBJ);
  }
}
