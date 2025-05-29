
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

function animate() {
  requestAnimationFrame(animate);
  if (playing) {
    balls.forEach(ball => {
      ball.position.x += ball.userData.vx * 0.01;
      ball.position.y += ball.userData.vy * 0.01;
      ball.position.z += ball.userData.vz * 0.01;
    });
  }
  renderer.render(scene, camera);
}
