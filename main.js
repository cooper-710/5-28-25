
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

  createUI();

  animate();
}

function createUI() {
  const checkboxContainer = document.getElementById("pitchTypeCheckboxes");
  const zoneSelectorContainer = document.getElementById("zoneSelectors");

  for (let pitchType in pitchData) {
    // Checkbox for visibility
    let label = document.createElement("label");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.onchange = () => {
      if (checkbox.checked) activeTypes.add(pitchType);
      else activeTypes.delete(pitchType);
    };
    activeTypes.add(pitchType);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + pitchType));
    checkboxContainer.appendChild(label);

    // Dropdown for zone selection
    let zoneLabel = document.createElement("label");
    zoneLabel.textContent = pitchType + " → Target Zone:";
    let dropdown = document.createElement("select");
    dropdown.id = "zone-" + pitchType;
    for (let i = 1; i <= 9; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.textContent = "Zone " + i;
      dropdown.appendChild(option);
    }
    zoneSelectorContainer.appendChild(zoneLabel);
    zoneSelectorContainer.appendChild(dropdown);
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
