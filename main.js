
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';

let scene, camera, renderer, pitchData;
let balls = [];
const clock = new THREE.Clock();

async function loadPitchData() {
  const res = await fetch('./pitch_data.json');
  return await res.json();
}

function createScene() {
  scene = new THREE.Scene();

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 2, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function createBall(pitch) {
  const geometry = new THREE.SphereGeometry(0.145, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const ball = new THREE.Mesh(geometry, material);
  const releaseX = -pitch.release_pos_x;
  const releaseY = pitch.release_pos_z + 0.65;
  const releaseZ = -2.03;

  ball.position.set(releaseX, releaseY, releaseZ);

  ball.userData = {
    t0: clock.getElapsedTime(),
    release: { x: releaseX, y: releaseY, z: releaseZ },
    velocity: { x: -pitch.vx0, y: pitch.vz0, z: pitch.vy0 },
    accel: { x: -pitch.ax, y: pitch.az, z: pitch.ay }
  };

  balls.push(ball);
  scene.add(ball);
}

function animate() {
  requestAnimationFrame(animate);
  const now = clock.getElapsedTime();

  for (const ball of balls) {
    const { release, velocity, accel, t0 } = ball.userData;
    const t = now - t0;

    const x = release.x + velocity.x * t + 0.5 * accel.x * t * t;
    const y = release.y + velocity.y * t + 0.5 * accel.y * t * t;
    const z = release.z + velocity.z * t + 0.5 * accel.z * t * t;

    ball.position.set(x, y, z);
  }

  renderer.render(scene, camera);
}

window.launchPitch = async function () {
  const team = document.getElementById('teamSelect').value;
  const pitcher = document.getElementById('pitcherSelect').value;
  const pitchType = document.getElementById('pitchTypeSelect').value;
  const zone = document.getElementById('zoneSelect').value;
  const pitch = pitchData[team][pitcher][pitchType][zone];
  createBall(pitch);
};

(async () => {
  createScene();
  pitchData = await loadPitchData();
  animate();
})();
