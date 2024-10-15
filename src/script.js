import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import waterVertexShader from "./shaders/water/vertex.glsl";
import waterFragmentShader from "./shaders/water/fragment.glsl";
import portalVertexShader from "./shaders/portal/vertex.glsl";
import portalFragmentShader from "./shaders/portal/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();
// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

// Portal light material
debugObject.portalColorStart = "#dcb2b2";
debugObject.portalColorEnd = "#2c304e";

gui.addColor(debugObject, "portalColorStart").onChange(() => {
  portalLightMaterial.uniforms.uColorStart.value.set(
    debugObject.portalColorStart
  );
});

gui.addColor(debugObject, "portalColorEnd").onChange(() => {
  portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd);
});

const portalLightMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
    uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
  },
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
});

/**
 * Model
 */
let gateR; // Declare a variable to store the gateR model

gltfLoader.load("gateRtest.glb", (gltf) => {
  gateR = gltf.scene; // Assign the loaded model to gateR
  scene.add(gateR);

  // Get each object
  const bakedMesh = gateR.children.find((child) => child.name === "baked");
  const portalLightMesh = gateR.children.find(
    (child) => child.name === "portalLight"
  );

  // Change the color of bakedMesh (assuming it uses MeshStandardMaterial)
  bakedMesh.material = new THREE.MeshStandardMaterial({
    map: bakedTexture, // If baked texture is used
    color: new THREE.Color("#2c1a3a"),
  });

  // Change the size (scale) of the entire model
  gateR.scale.set(0.5, 0.5, 0.5); // Scale up 1.5 times the original size

  // Apply materials
  portalLightMesh.material = portalLightMaterial;
});
/**
 * Water
 */
// Geometry
// const waterGeometry = new THREE.PlaneGeometry(4, 4, 512, 512);
// waterGeometry.deleteAttribute("normal");
// waterGeometry.deleteAttribute("uv");

// // Colors
// debugObject.depthColor = "#ff4000";
// debugObject.surfaceColor = "#151c37";

// gui.addColor(debugObject, "depthColor").onChange(() => {
//   waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
// });
// gui.addColor(debugObject, "surfaceColor").onChange(() => {
//   waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
// });

// Create a CubeRenderTarget for dynamic environment mapping
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
scene.add(cubeCamera); // Add the cube camera to the scene

// Reflective material for floating objects
const reflectiveMaterial = new THREE.MeshPhysicalMaterial({
  envMap: cubeRenderTarget.texture,
  reflectivity: 1.0,
  color: "#151c37",
  metalness: 0.6,
  roughness: 0.6,
  envMapIntensity: 4.0,
});

// // Material
// const waterMaterial = new THREE.ShaderMaterial({
//   vertexShader: waterVertexShader,
//   fragmentShader: waterFragmentShader,
//   uniforms: {
//     uTime: { value: 0 },
//     uBigWavesElevation: { value: 0.2 },
//     uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
//     uBigWavesSpeed: { value: 0.75 },
//     uSmallWavesElevation: { value: 0.15 },
//     uSmallWavesFrequency: { value: 3 },
//     uSmallWavesSpeed: { value: 0.2 },
//     uSmallIterations: { value: 4 },
//     uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
//     uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
//     uColorOffset: { value: 0.925 },
//     uColorMultiplier: { value: 1 },
//   },
// });

// // Mesh
// const water = new THREE.Mesh(waterGeometry, waterMaterial);
// water.rotation.x = -Math.PI * 0.5;
// scene.add(water);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// function getWaveElevationAtPosition(position, time) {
//   const bigWaveX = Math.sin(
//     position.x * waterMaterial.uniforms.uBigWavesFrequency.value.x +
//       time * waterMaterial.uniforms.uBigWavesSpeed.value
//   );
//   const bigWaveZ = Math.sin(
//     position.z * waterMaterial.uniforms.uBigWavesFrequency.value.y +
//       time * waterMaterial.uniforms.uBigWavesSpeed.value
//   );
//   let elevation =
//     bigWaveX * bigWaveZ * waterMaterial.uniforms.uBigWavesElevation.value;

//   return elevation;
// }

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);
/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1.5, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update cube camera to reflect the scene
  cubeCamera.update(renderer, scene); // Make sure this comes first

  // Water
  // waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update materials
  portalLightMaterial.uniforms.uTime.value = elapsedTime;

  // If gateR is loaded, update its position based on the water flow
  // if (gateR) {
  //   const waveElevation = getWaveElevationAtPosition(
  //     gateR.position,
  //     elapsedTime
  //   );
  //   gateR.position.y = waveElevation; // Update the Y position based on the wave elevation
  // }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
