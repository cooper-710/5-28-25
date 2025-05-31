
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';

let scene, camera, renderer;
let balls = [];
let playing = true;
const clock = new THREE.Clock();

// === Setup scene ===
function createScene() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.01, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xffa500 })
  );
  plate.position.set(0, 0.005, -60.5);
  scene.add(plate);

  const zone = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  zone.position.set(0, 2.5, -60.5);
  scene.add(zone);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 2, 60.5);
  camera.lookAt(0, 2.5, -18);
}

// === UI setup ===
function populateDropdowns() {
  const teamSelect = document.getElementById('teamSelect');
  const pitcherSelect = document.getElementById('pitcherSelect');
  const pitchTypeSelect = document.getElementById('pitchTypeSelect');

  // Dummy options
  teamSelect.innerHTML = '<option value="TestTeam">TestTeam</option>';
  pitcherSelect.innerHTML = '<option value="TestPitcher">TestPitcher</option>';
  pitchTypeSelect.innerHTML = '<option value="FF">FF</option>';
}

// === Ball creation ===
function createBall() {
  const geometry = new THREE.SphereGeometry(0.145, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const ball = new THREE.Mesh(geometry, material);

  const release = { x: 0, y: 2, z: -2.03 };
  const velocity = { x: 0, y: 0, z: -130 };
  const accel = { x: 0, y: 0, z: 0 };

  ball.position.set(release.x, release.y, release.z);
  ball.userData = { t0: clock.getElapsedTime(), release, velocity, accel };

  balls.push(ball);
  scene.add(ball);
}

// === Animation ===
function animate() {
  requestAnimationFrame(animate);
  const now = clock.getElapsedTime();

  if (!playing) return;

  for (const ball of balls) {
    const { release, velocity, accel, t0 } = ball.userData;
    const t = now - t0;
    if (t > 0.45) continue;

    const x = release.x + velocity.x * t + 0.5 * accel.x * t * t;
    const y = release.y + velocity.y * t + 0.5 * accel.y * t * t;
    const z = release.z + velocity.z * t + 0.5 * accel.z * t * t;

    ball.position.set(x, y, z);
  }

  renderer.render(scene, camera);
}

// === Controls ===
window.launchPitch = function () {
  balls = [];
  createBall();
};

window.pauseAnimation = function () {
  playing = false;
};

// === Init ===
createScene();
populateDropdowns();
animate();
