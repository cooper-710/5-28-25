
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';

let scene, camera, renderer, ball;
const clock = new THREE.Clock();

function createScene() {
  scene = new THREE.Scene();

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 6);
  camera.lookAt(0, 2, -18);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function createBall() {
  const geometry = new THREE.SphereGeometry(0.145, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  ball = new THREE.Mesh(geometry, material);

  const release = { x: 0, y: 2, z: -2.03 };
  const velocity = { x: 0, y: 0, z: -130 }; // straight toward the zone
  const accel = { x: 0, y: 0, z: 0 };

  ball.position.set(release.x, release.y, release.z);
  ball.userData = { t0: clock.getElapsedTime(), release, velocity, accel };

  console.log("Ball released at:", ball.position);
  scene.add(ball);
}

function animate() {
  requestAnimationFrame(animate);
  const now = clock.getElapsedTime();
  const t = now - ball.userData.t0;

  const { release, velocity, accel } = ball.userData;
  const x = release.x + velocity.x * t + 0.5 * accel.x * t * t;
  const y = release.y + velocity.y * t + 0.5 * accel.y * t * t;
  const z = release.z + velocity.z * t + 0.5 * accel.z * t * t;

  ball.position.set(x, y, z);
  renderer.render(scene, camera);
}

window.launchPitch = function () {
  createBall();
};

window.pauseAnimation = function () {
  ball = null;
};

createScene();
launchPitch();
animate();
