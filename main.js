import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.148.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.148.0/examples/jsm/controls/OrbitControls.js';

// === UI Styling (Professional + Mobile-Responsive) ===
const style = document.createElement('style');
style.innerHTML = `...`; // truncated here for brevity; will include full block in actual file
document.head.appendChild(style);

let scene, camera, renderer, pitchData = {}, balls = [];
let activeTypes = new Set(), playing = true;
let lastTime = 0;
const clock = new THREE.Clock();

async function loadPitchData() {
  const res = await fetch('./pitch_data.json');
  return await res.json();
}

// full script content continues...