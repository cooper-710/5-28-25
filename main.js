
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
  const container = document.getElementById("pitchTypeCheckboxes");
  for (let pitchType in pitchData) {
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
    label.appendChild(document.createTextNode(pitchType));
    container.appendChild(label);
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
