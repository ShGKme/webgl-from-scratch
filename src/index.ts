import { World } from './core/World';
import { Resource, ResourceLoader } from './core/ResourceLoader';
import { Model, ModelData } from './core/Model';
import { Skybox } from './core/SceneObject/Skybox';
import { NormalMappingShader, PhongShader, SkyboxShader } from './core/Shader';
import { Material } from './core/Material';
import { Texture } from './core/Texture';
import { Surface } from './core/SceneObject/Surface';
import { PickableSceneObject } from './core/SceneObject/PickableSceneObject';
import { degToRad } from './core/utils/math';
import { LockedSceneObject } from './core/SceneObject/LockedSceneObject';

const world = new World(document.querySelector('#canvas'));

document.getElementById('btn-start').addEventListener('click', () => {
  document.documentElement.requestFullscreen();
  world.scene.startRendering();
  document.getElementById('placeholder').remove();
});

document.getElementById('btn-start-vr').addEventListener('click', () => {
  document.documentElement.requestFullscreen();
  world.scene.stereo.on = true;
  world.scene.startRendering();
  document.getElementById('placeholder').remove();
});

const resources = {
  skyboxFt: new Resource<HTMLImageElement>('image', require('./assets/textures/skybox/space/corona_ft.png')),
  skyboxBk: new Resource<HTMLImageElement>('image', require('./assets/textures/skybox/space/corona_bk.png')),
  skyboxUp: new Resource<HTMLImageElement>('image', require('./assets/textures/skybox/space/corona_up.png')),
  skyboxDn: new Resource<HTMLImageElement>('image', require('./assets/textures/skybox/space/corona_dn.png')),
  skyboxRt: new Resource<HTMLImageElement>('image', require('./assets/textures/skybox/space/corona_rt.png')),
  skyboxLf: new Resource<HTMLImageElement>('image', require('./assets/textures/skybox/space/corona_lf.png')),

  lunarDiffuse: new Resource<HTMLImageElement>('image', require('./assets/textures/lunar_3/basecolor.png')),
  lunarSpecular: new Resource<HTMLImageElement>('image', require('./assets/textures/lunar/ambientocclusion.png')),
  lunarNormal: new Resource<HTMLImageElement>('image', require('./assets/textures/lunar_3/normal_small.png')),
  // lunarHeight: new Resource<Uint8ClampedArray>('pixels', require('./assets/textures/lunar_3/height.png')),
  lunarHeight16: new Resource<Uint8ClampedArray>(
    'pixels',
    require('./assets/textures/terrainbase_material_lunar_2_height_conv.png'),
  ),

  lunaD: new Resource<HTMLImageElement>('image', require('./assets/textures/luna/lunarrock_d.png')),
  lunaS: new Resource<HTMLImageElement>('image', require('./assets/textures/luna/lunarrock_s.png')),
  lunaN: new Resource<HTMLImageElement>('image', require('./assets/textures/luna/lunarrock_n.png')),

  cube: new Resource<ModelData>('model', require('./assets/models/CubeFlat.obj')),

  portalGun1: new Resource<ModelData>('model', require('./assets/models/PortalGun1.obj')),
  portalGun2: new Resource<ModelData>('model', require('./assets/models/PortalGun2.obj')),

  suzanne: new Resource<ModelData>('model', require('./assets/models/Suzanne1smooth.obj')),
};

function addObjects() {
  // SKYBOX
  const skybox = new Skybox();
  skybox.setScale(new Float32Array([2, 2, 2]));
  skybox.shader = new SkyboxShader(world.scene.gl);
  skybox.material = new Material();
  skybox.material.diffuseTexture = new Texture('cube', [
    resources.skyboxFt.data,
    resources.skyboxBk.data,
    resources.skyboxUp.data,
    resources.skyboxDn.data,
    resources.skyboxRt.data,
    resources.skyboxLf.data,
  ]);
  world.scene.objects.push(skybox);

  // SURFACE
  const surface = new Surface();
  surface.material = new Material();
  surface.shader = new NormalMappingShader(world.scene.gl);
  surface.material.diffuseTexture = new Texture('2d', resources.lunarDiffuse.data);
  surface.material.specularTexture = new Texture('2d', resources.lunarSpecular.data);
  surface.material.normalTexture = new Texture('2d', resources.lunarNormal.data);
  surface.material.hardness = 300;
  // if (process.env.NODE_ENV !== 'production') {
  //   surface.generateMesh(resources.lunarHeight.data, 1, 8);
  // } else {
  // @ts-ignore
  surface.generateMesh(resources.lunarHeight16.data, 1, 16);
  // }
  surface
    .setScale(new Float32Array([2, 2, 2]))
    .setTranslation(
      new Float32Array([(-surface.size * surface.scale[0]) / 2, 0, (-surface.size * surface.scale[2]) / 2]),
    );
  world.setSurface(surface);

  // CUBE
  const cube = new PickableSceneObject(new Model(resources.cube.data));
  cube.model.generateTangent();
  cube.material = new Material();
  cube.shader = new NormalMappingShader(world.scene.gl);
  cube.material.diffuseTexture = new Texture('2d', resources.lunaD.data);
  cube.material.specularTexture = new Texture('2d', resources.lunaS.data);
  cube.material.normalTexture = new Texture('2d', resources.lunaN.data);
  cube.material.hardness = 300;
  cube.setScale(new Float32Array([50, 50, 50]));
  cube.setTranslation(new Float32Array([100, 50, 0]));
  cube.onPick = () => {
    world.pickedObject = cube;
  };
  world.scene.objects.push(cube);

  // SUZANNE
  const suzanne = new PickableSceneObject(new Model(resources.suzanne.data));
  suzanne.setTranslation(new Float32Array([-50, 35, 10]));
  suzanne.material = new Material();
  suzanne.shader = new PhongShader(world.scene.gl);
  suzanne.material.diffuseColor = new Float32Array([0.6, 0.6, 0.6]);
  suzanne.material.hardness = 20;
  suzanne.setScale(new Float32Array([10, 10, 10]));
  suzanne.onPick = () => {
    world.pickedObject = suzanne;
  };
  world.scene.objects.push(suzanne);

  // PortalGun
  const gunTranslation = new Float32Array([6, -3, 2.25]);
  const gunRotation: [number, number, number] = [degToRad(0), degToRad(105), degToRad(20)];
  const gunScale = new Float32Array([0.42, 0.42, 0.42]);

  const gun = new LockedSceneObject(world.scene.camera, new Model(resources.portalGun1.data));
  gun.setTranslation(gunTranslation);
  gun.setRotation(...gunRotation);
  gun.material = new Material();
  gun.shader = new PhongShader(world.scene.gl);
  gun.material.diffuseColor = new Float32Array([0.8, 0.8, 0.8]);
  gun.material.hardness = 300;
  gun.setScale(gunScale);
  world.scene.objects.push(gun);

  const gun2 = new LockedSceneObject(world.scene.camera, new Model(resources.portalGun2.data));
  gun2.setTranslation(gunTranslation);
  gun2.setRotation(...gunRotation);
  gun2.material = new Material();
  gun2.shader = new PhongShader(world.scene.gl);
  gun2.material.diffuseColor = new Float32Array([0.1, 0.1, 0.1]);
  gun2.material.hardness = 300;
  gun2.setScale(gunScale);
  world.scene.objects.push(gun2);
}

async function loadResources() {
  const loader = new ResourceLoader(resources);
  loader.onprogress = () => {
    const models = Object.entries(resources).filter(([name, resource]) => resource.type === 'model');
    const images = Object.entries(resources).filter(
      ([name, resource]) => resource.type === 'image' || resource.type === 'pixels',
    );

    document.getElementById('loader').innerHTML = `
        <div>Loading models [${loader.done.model} / ${models.length}]</div>
        <div>${models
          .map(
            ([name, resource]) =>
              `<div class="resource-item resource-item-${resource.state}">[${resource.state}] ${name}: ${resource.url}</div>`,
          )
          .join('')}</div>
        <div>Loading images [${loader.done.image + loader.done.pixels} / ${images.length}]</div>
        <div>${images
          .map(
            ([name, resource]) =>
              `<div class="resource-item resource-item-${resource.state}">[${resource.state}] ${name}: ${resource.url}</div>`,
          )
          .join('')}</div>`;
  };
  await loader.load();

  document.getElementById('initializing').style.visibility = 'initial';

  addObjects();

  world.init();
}

loadResources().then(() => {
  document.getElementById('start-buttons').style.visibility = 'initial';
  if (!window.DeviceOrientationEvent || !('ontouchstart' in window)) {
    document.getElementById('not-ready-for-vr').style.display = 'block';
  }
});
