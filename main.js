
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';

let scene, camera, renderer;
let pitchData = {};
let balls = [];
let activeTypes = new Set();
let playing = true;

const pitchColors = {
  FF: '#FF0000',
  SL: '#0000FF',
  CH: '#008000',
  KC: '#4B0082'
};

// Target zone centers (approximate layout in strike zone space)
const zoneTargets = {
  1: { x: -0.6, y: 1.0 },
  2: { x:  0.0, y: 1.0 },
  3: { x:  0.6, y: 1.0 },
  4: { x: -0.6, y: 0.0 },
  5: { x:  0.0, y: 0.0 },
  6: { x:  0.6, y: 0.0 },
  7: { x: -0.6, y: -1.0 },
  8: { x:  0.0, y: -1.0 },
  9: { x:  0.6, y: -1.0 }
};

init();

async function init() {
  const res = await fetch('pitch_data.json');
  pitchData = await res.json();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, -65);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  setupUI();
  createBalls();
  animate();
}

function setupUI() {
  const checkboxes = document.getElementById("pitchTypeCheckboxes");
  const zones = document.getElementById("zoneSelectors");

  for (let type in pitchData) {
    // Checkbox
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = true;
    cb.onchange = () => {
      if (cb.checked) activeTypes.add(type);
      else activeTypes.delete(type);
    };
    activeTypes.add(type);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + type));
    checkboxes.appendChild(label);

    // Dropdown
    const zoneLabel = document.createElement("label");
    zoneLabel.textContent = type + " → Target Zone:";
    const dropdown = document.createElement("select");
    dropdown.id = "zone-" + type;
    for (let i = 1; i <= 9; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = "Zone " + i;
      dropdown.appendChild(opt);
    }
    zones.appendChild(zoneLabel);
    zones.appendChild(dropdown);
  }

  document.getElementById("playPause").onclick = () => playing = !playing;
}

function createBalls() {
  balls.forEach(ball => scene.remove(ball));
  balls = [];

  for (let type in pitchData) {
    if (!activeTypes.has(type)) continue;

    const data = pitchData[type];
    const zoneDropdown = document.getElementById("zone-" + type);
    const targetZone = zoneTargets[zoneDropdown.value];

    const color = pitchColors[type] || '#FFFFFF';
    const material = new THREE.MeshBasicMaterial({ color });
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const ball = new THREE.Mesh(geometry, material);

    ball.position.set(data.release_pos_x || 0, data.release_pos_z || 6, -2.03);
    ball.userData = {
      vx: (targetZone.x - ball.position.x) * 0.15,
      vy: (targetZone.y - ball.position.y) * 0.15,
      vz: -0.5
    };

    scene.add(ball);
    balls.push(ball);
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (playing) {
    balls.forEach(ball => {
      ball.position.x += ball.userData.vx;
      ball.position.y += ball.userData.vy;
      ball.position.z += ball.userData.vz;
    });
  }
  renderer.render(scene, camera);
}
