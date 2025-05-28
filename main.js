
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';

let scene, camera, renderer, clock;
let balls = [];
let pitchData = {};
let activeTypes = new Set();
let playing = true;

const pitchColors = {
  FF: '#FF0000', FT: '#8B0000', SI: '#FFA500', FC: '#808080', SL: '#0000FF',
  ST: '#008080', CU: '#800080', KC: '#4B0082', CH: '#008000', FS: '#FFD700',
  FO: '#A52A2A', SC: '#00CED1', EP: '#FF69B4', KN: '#708090', SV: '#DC143C', CS: '#7B68EE'
};

init();

async function init() {
  const res = await fetch('pitch_data.json');
  pitchData = await res.json();

  createUI();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, -65);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 10);
  scene.add(light);

  addStrikeZone();
  addGround();

  clock = new THREE.Clock();
  animate();
}

function createUI() {
  const teamSelect = document.getElementById('teamSelect');
  const pitcherSelect = document.getElementById('pitcherSelect');

  for (const team in pitchData) {
    const option = document.createElement('option');
    option.value = team;
    option.textContent = team;
    teamSelect.appendChild(option);
  }

  teamSelect.onchange = () => {
    const team = teamSelect.value;
    pitcherSelect.innerHTML = '';
    for (const pitcher in pitchData[team]) {
      const option = document.createElement('option');
      option.value = pitcher;
      option.textContent = pitcher;
      pitcherSelect.appendChild(option);
    }
    pitcherSelect.onchange();
  };

  pitcherSelect.onchange = () => {
    const team = teamSelect.value;
    const pitcher = pitcherSelect.value;
    activeTypes = new Set(Object.keys(pitchData[team][pitcher]));
    clearBalls();
    createBalls(pitchData[team][pitcher]);
  };

  teamSelect.selectedIndex = 0;
  teamSelect.onchange();
}

function addStrikeZone() {
  const zone = new THREE.BoxGeometry(0.83, 1.5, 0.01);
  const edges = new THREE.EdgesGeometry(zone);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
  line.position.set(0, 1.5, -60.5);
  scene.add(line);
}

function addGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 100),
    new THREE.MeshBasicMaterial({ color: 0x006400 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);
}

function createBall(type, data) {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.075, 32, 32);

  const matWhite = new THREE.MeshStandardMaterial({ color: 'white' });
  const matColor = new THREE.MeshStandardMaterial({ color: pitchColors[type] || 'gray' });

  geometry.clearGroups();
  const posAttr = geometry.attributes.position;
  const half = posAttr.count / 2;
  for (let i = 0; i < posAttr.count; i++) {
    geometry.addGroup(i, 1, i < half ? 0 : 1);
  }

  const ball = new THREE.Mesh(geometry, [matWhite, matColor]);
  ball.position.set(data.release_pos_x, data.release_pos_z, -2.03);
  group.add(ball);
  group.userData = { ...data, mesh: ball, type };
  balls.push(group);
  scene.add(group);
}

function createBalls(pitches) {
  for (const type in pitches) {
    if (activeTypes.has(type)) createBall(type, pitches[type]);
  }
}

function clearBalls() {
  for (const b of balls) scene.remove(b);
  balls = [];
}

function animate() {
  requestAnimationFrame(animate);
  if (playing) updateBalls();
  renderer.render(scene, camera);
}

function updateBalls() {
  const dt = clock.getDelta();
  for (const ball of balls) {
    const d = ball.userData;
    ball.position.x += d.vx0 * dt + 0.5 * d.ax * dt * dt;
    ball.position.y += d.vz0 * dt + 0.5 * d.az * dt * dt;
    ball.position.z += d.vy0 * dt + 0.5 * d.ay * dt * dt;
  }
}

window.togglePlay = function() {
  playing = !playing;
};
