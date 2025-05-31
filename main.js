
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';

let scene, camera, renderer;
let balls = [];
let pitchData = {};
let playing = true;
const clock = new THREE.Clock();

async function loadPitchData() {
  const res = await fetch('./pitch_data.json');
  return await res.json();
}

function createScene() {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  // Plate
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.01, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  plate.position.set(0, 0.005, -60.5);
  scene.add(plate);

  // Strike zone
  const zone = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 2.0, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  zone.position.set(0, 2.5, -60.5);
  scene.add(zone);

  // Camera setup (from behind catcher)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 2, -65);
  camera.lookAt(0, 2.5, 0);
}

function populateDropdowns() {
  const teamSelect = document.getElementById('teamSelect');
  const pitcherSelect = document.getElementById('pitcherSelect');
  const comboSelect = document.getElementById('pitchComboSelect');

  // Populate team dropdown
  Object.keys(pitchData).forEach(team => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = team;
    teamSelect.appendChild(opt);
  });

  // Populate pitchers on team select
  teamSelect.addEventListener('change', () => {
    const team = teamSelect.value;
    const pitchers = Object.keys(pitchData[team] || {});
    pitcherSelect.innerHTML = '';
    pitchers.forEach(pitcher => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = pitcher;
      pitcherSelect.appendChild(opt);
    });
    updateComboDropdown();
  });

  // Update combos on pitcher change
  pitcherSelect.addEventListener('change', updateComboDropdown);
}

function updateComboDropdown() {
  const team = document.getElementById('teamSelect').value;
  const pitcher = document.getElementById('pitcherSelect').value;
  const comboSelect = document.getElementById('pitchComboSelect');
  comboSelect.innerHTML = '';

  const pitchTypes = Object.keys(pitchData?.[team]?.[pitcher] || {});
  pitchTypes.forEach(type => {
    const zones = Object.keys(pitchData[team][pitcher][type]);
    zones.forEach(zone => {
      const option = document.createElement('option');
      option.value = option.textContent = `${type} ${zone}`;
      comboSelect.appendChild(option);
    });
  });
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

window.launchPitch = function () {
  balls = [];
  const team = document.getElementById('teamSelect').value;
  const pitcher = document.getElementById('pitcherSelect').value;
  const combo = document.getElementById('pitchComboSelect').value;

  const [type, zone] = combo.split(' ');
  const pitch = pitchData?.[team]?.[pitcher]?.[type]?.[zone];
  if (pitch) createBall(pitch);
};

window.pauseAnimation = function () {
  playing = false;
};

(async () => {
  pitchData = await loadPitchData();
  createScene();
  populateDropdowns();
  animate();
})();
