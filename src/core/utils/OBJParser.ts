// Based on
// https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html

import { ModelData } from '../Model';

export function parseOBJ(text): ModelData {
  const objPositions = [[0, 0, 0]];
  const objUV = [[0, 0]];
  const objNormals = [[0, 0, 0]];
  const objVertexData = [objPositions, objUV, objNormals];

  let webglVertexData = [
    [], // positions
    [], // texcoords
    [], // normals
  ];

  const idToIndexMap = {};
  const webglIndices = [];

  function addVertex(vert) {
    const ptn = vert.split('/');
    // first convert all the indices to positive indices
    const indices = ptn.map((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      return objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
    });
    // now see that particular combination of position,texcoord,normal
    // already exists
    const id = indices.join(',');
    let vertIndex = idToIndexMap[id];
    if (!vertIndex) {
      // No. Add it.
      vertIndex = webglVertexData[0].length / 3;
      idToIndexMap[id] = vertIndex;
      indices.forEach((index, i) => {
        if (index !== undefined) {
          webglVertexData[i].push(...objVertexData[i][index]);
        }
      });
    }
    webglIndices.push(vertIndex);
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      objUV.push(parts.map(parseFloat));
    },
    f(parts) {
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword, 'at line', lineNo + 1);
      continue;
    }
    handler(parts, unparsedArgs);
  }

  return {
    vertices: new Float32Array(webglVertexData[0]),
    uv: new Float32Array(webglVertexData[1]),
    normals: new Float32Array(webglVertexData[2]),
    indices: new Float32Array(webglIndices),
  };
}
