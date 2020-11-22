export async function getImagePixels(src: string): Promise<Uint8ClampedArray> {
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
//
// export async function getImagerPixels16(url: string): Promise<any> {
//   pngtoy.fetch(url).then( ... );
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error('Unable to fetch ' + url);
//   }
//   const buffer = await response.arrayBuffer();
//   return new Promise((resolve, reject) => {
//     new PNG({ filterType: -1, bitDepth: 16 }).parse(buffer as Buffer, (error: Error, data: PNG) => {
//       if (error) {
//         reject(error);
//       }
//       const ar8 = new Uint8Array(data.data);
//       const ar16 = new Uint16Array(ar8.buffer, ar8.byteOffset, ar8.byteLength / Uint16Array.BYTES_PER_ELEMENT);
//       resolve(ar16);
//     });
//   });
// }

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', reject);
  });
}
