/**
 * Solar System Explorer - Complete Interactive 3D Cosmic Engine
 */

const state = {
  activeView: 'home',
  orbiting: true,
  speedMultiplier: 1.0,
  focusedTarget: null,
  quiz: {
    currentIndex: 0,
    score: 0,
    questions: [],
    answered: false
  }
};

let scene, camera, renderer, controls;
let clickableEntities = []; // All objects selectable via Raycaster
let planetMeshObjects = []; // Revolving planets

// Specific Cosmic Entities
let earthMeshRef = null;
let earthMoonMesh = null;
let issSatelliteMesh = null;
let cometGroup = null;
let cometAngle = 0;
let asteroidBeltPoints = null;
let kuiperBeltPoints = null;

let raycaster, mouse;
let canvasContainer;

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initViewRouting();
  init3DScene();
  renderPlanetGallery();
  populateSimulationHud();
  initQuizEngine();
  initModalHandlers();
});

/* ==================== 1. ROUTING ==================== */
function initViewRouting() {
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  window.navigateTo = (targetView) => {
    state.activeView = targetView;

    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetView) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    navLinksContainer.classList.remove('open');

    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`view-${targetView}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    if (targetView === 'simulation') {
      setTimeout(onWindowResize, 60);
    }
  };

  navLinks.forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.getAttribute('data-target'));
    });
  });

  navToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
  });
}

/* ==================== 2. PROCEDURAL TEXTURES ==================== */
function createProceduralTexture(type, hexColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const base = new THREE.Color(hexColor);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === 'sun') {
    const radial = ctx.createRadialGradient(256, 128, 10, 256, 128, 250);
    radial.addColorStop(0, '#ffffff');
    radial.addColorStop(0.3, '#ffcc00');
    radial.addColorStop(0.8, '#ff5500');
    radial.addColorStop(1, '#990000');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (type === 'earth') {
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 45 + 15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 30 + 10, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'jupiter' || type === 'saturn') {
    for (let y = 0; y < 256; y += 8) {
      ctx.fillStyle = (y % 16 === 0) ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, y, 512, 8);
    }
    if (type === 'jupiter') {
      ctx.fillStyle = 'rgba(180, 50, 30, 0.8)';
      ctx.beginPath();
      ctx.ellipse(320, 160, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 6 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return new THREE.CanvasTexture(canvas);
}

/* ==================== 3. 3D SOLAR SCENE INITIALIZATION ==================== */
function init3DScene() {
  canvasContainer = document.getElementById('canvas-container');
  const loader = document.getElementById('webgl-loading');
  const errorOverlay = document.getElementById('webgl-error');

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvasContainer.appendChild(renderer.domElement);
  } catch (err) {
    if (loader) loader.classList.add('hidden');
    if (errorOverlay) errorOverlay.classList.remove('hidden');
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02040a);

  camera = new THREE.PerspectiveCamera(
    45,
    canvasContainer.clientWidth / canvasContainer.clientHeight,
    0.1,
    3000
  );
  camera.position.set(0, 130, 230);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 850;
  controls.minDistance = 12;

  // Illumination
  const ambientLight = new THREE.AmbientLight(0x444d66, 1.4);
  scene.add(ambientLight);

  const sunLight = new THREE.PointLight(0xffffff, 2.8, 1200, 0.5);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // 1. Realistic Multi-Colored Stars Background
  createClassified3DStars();

  // 2. Build Sun, Planets, Moons, Satellites, Belts, and Comets
  buildCosmicScene();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown', onSceneClick, false);
  window.addEventListener('resize', onWindowResize, false);

  if (loader) loader.classList.add('hidden');
  animate();
}

/**
 * Creates 3,000 multi-colored stars representing spectral classes:
 * Blue Giants, White Stars, Yellow Dwarfs, and Red Dwarfs.
 */
function createClassified3DStars() {
  const starCount = 3000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const spectralPalette = [
    new THREE.Color(0x9bb0ff), // O/B: Blue Giants
    new THREE.Color(0xffffff), // A: White Stars
    new THREE.Color(0xfff4e8), // F/G: Yellow Sun-like
    new THREE.Color(0xffd2a1), // K: Orange Stars
    new THREE.Color(0xff6b6b)  // M: Red Dwarfs
  ];

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2200;

    const chosenColor = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
    colors[i * 3] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.95
  });

  const starPoints = new THREE.Points(geometry, material);
  scene.add(starPoints);
}

function buildCosmicScene() {
  CELESTIAL_DATA.forEach((data) => {
    if (data.id === 'sun') {
      // The Sun
      const sunGeo = new THREE.SphereGeometry(data.sizeRadius, 48, 48);
      const sunTex = createProceduralTexture('sun', data.visualColor);
      const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      sunMesh.userData = { id: data.id, data: data };
      scene.add(sunMesh);
      clickableEntities.push(sunMesh);

      // Glowing Corona Aura
      const coronaGeo = new THREE.SphereGeometry(data.sizeRadius * 1.15, 32, 32);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide
      });
      scene.add(new THREE.Mesh(coronaGeo, coronaMat));

      planetMeshObjects.push({ mesh: sunMesh, data: data, currentAngle: 0 });
    } else if (data.orbitSpeed) {
      // Orbiting 8 Planets
      const orbitRadius = data.orbitRadius;
      
      // Orbit Ring line
      const orbitCurve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(140);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x24355a, transparent: true, opacity: 0.65 });
      scene.add(new THREE.Line(orbitGeometry, orbitMaterial));

      // Planet Mesh
      const planetGeo = new THREE.SphereGeometry(data.sizeRadius, 32, 32);
      const planetTex = createProceduralTexture(data.id, data.visualColor);
      const planetMat = new THREE.MeshStandardMaterial({ map: planetTex, roughness: 0.7, metalness: 0.1 });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.userData = { id: data.id, data: data };

      const initialAngle = Math.random() * Math.PI * 2;
      planetMesh.position.set(Math.cos(initialAngle) * orbitRadius, 0, Math.sin(initialAngle) * orbitRadius);
      scene.add(planetMesh);
      clickableEntities.push(planetMesh);

      // Saturn Rings
      if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.sizeRadius * 1.35, data.sizeRadius * 2.3, 32);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xc4b785,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        planetMesh.add(ringMesh);
      }

      // Earth Moons & ISS
      if (data.id === 'earth') {
        earthMeshRef = planetMesh;

        // Moon
        const moonData = CELESTIAL_DATA.find(d => d.id === 'moon');
        const moonGeo = new THREE.SphereGeometry(moonData.sizeRadius, 20, 20);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.85 });
        earthMoonMesh = new THREE.Mesh(moonGeo, moonMat);
        earthMoonMesh.userData = { id: moonData.id, data: moonData };
        planetMesh.add(earthMoonMesh);
        clickableEntities.push(earthMoonMesh);

        // ISS Satellite
        const issData = CELESTIAL_DATA.find(d => d.id === 'iss');
        const issGeo = new THREE.BoxGeometry(0.35, 0.15, 0.5);
        const issMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        issSatelliteMesh = new THREE.Mesh(issGeo, issMat);
        issSatelliteMesh.userData = { id: issData.id, data: issData };
        planetMesh.add(issSatelliteMesh);
        clickableEntities.push(issSatelliteMesh);
      }

      planetMeshObjects.push({
        mesh: planetMesh,
        orbitRadius: orbitRadius,
        orbitSpeed: data.orbitSpeed,
        rotationSpeed: data.rotationSpeed,
        currentAngle: initialAngle,
        data: data
      });
    }
  });

  // 3. Main Asteroid Belt (Mars - Jupiter)
  const astData = CELESTIAL_DATA.find(d => d.id === 'asteroid_belt');
  asteroidBeltPoints = createInteractiveParticleBelt(63, 69, 1500, 0xaa9988, 0.45, astData);

  // 4. Outer Kuiper Belt (Beyond Neptune)
  const kuiperData = CELESTIAL_DATA.find(d => d.id === 'kuiper_belt');
  kuiperBeltPoints = createInteractiveParticleBelt(142, 158, 1800, 0x66aaff, 0.38, kuiperData);

  // 5. Glowing Elliptical Comet
  const cometData = CELESTIAL_DATA.find(d => d.id === 'comet');
  createInteractiveComet(cometData);
}

function createInteractiveParticleBelt(innerR, outerR, count, colorHex, size, metadata) {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const distance = innerR + Math.random() * (outerR - innerR);
    const height = (Math.random() - 0.5) * 4.0;

    positions[i] = Math.cos(angle) * distance;
    positions[i + 1] = height;
    positions[i + 2] = Math.sin(angle) * distance;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: colorHex, size: size });
  const pointsMesh = new THREE.Points(geom, mat);
  pointsMesh.userData = { id: metadata.id, data: metadata };
  scene.add(pointsMesh);
  clickableEntities.push(pointsMesh);
  return pointsMesh;
}

function createInteractiveComet(metadata) {
  cometGroup = new THREE.Group();
  cometGroup.userData = { id: metadata.id, data: metadata };

  // Nucleus
  const nucGeo = new THREE.SphereGeometry(metadata.sizeRadius, 16, 16);
  const nucMat = new THREE.MeshBasicMaterial({ color: 0xeeffff });
  const nucMesh = new THREE.Mesh(nucGeo, nucMat);
  nucMesh.userData = { id: metadata.id, data: metadata };
  cometGroup.add(nucMesh);

  // Glowing Tail
  const tailGeo = new THREE.ConeGeometry(0.9, 7.5, 16);
  const tailMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.45
  });
  const tailMesh = new THREE.Mesh(tailGeo, tailMat);
  tailMesh.rotation.x = Math.PI / 2;
  tailMesh.position.z = -3.75;
  cometGroup.add(tailMesh);

  scene.add(cometGroup);
  clickableEntities.push(nucMesh);
}

function onWindowResize() {
  if (!canvasContainer || !camera || !renderer) return;
  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;
  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function onSceneClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableEntities, true);

  if (intersects.length > 0) {
    let target = intersects[0].object;
    // Walk up hierarchy if part of a group
    while (target && (!target.userData || !target.userData.data)) {
      target = target.parent;
    }
    if (target && target.userData && target.userData.data) {
      openPlanetModal(target.userData.data);
    }
  }
}

function focusCameraOn(targetMesh, radiusOffset) {
  state.orbiting = false;
  updatePlayPauseButtonUI();

  const targetPos = new THREE.Vector3();
  targetMesh.getWorldPosition(targetPos);

  controls.target.copy(targetPos);
  camera.position.set(
    targetPos.x + radiusOffset * 3.8 + 6,
    targetPos.y + radiusOffset * 1.8 + 4,
    targetPos.z + radiusOffset * 3.8 + 6
  );
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate and revolve planets
  planetMeshObjects.forEach((item) => {
    item.mesh.rotation.y += (item.data.rotationSpeed || 0.01);

    if (state.orbiting && item.orbitRadius) {
      item.currentAngle += item.orbitSpeed * 0.25 * state.speedMultiplier;
      item.mesh.position.x = Math.cos(item.currentAngle) * item.orbitRadius;
      item.mesh.position.z = Math.sin(item.currentAngle) * item.orbitRadius;
    }
  });

  // Animate Moon and ISS around Earth
  if (earthMoonMesh) {
    const tMoon = Date.now() * 0.002 * state.speedMultiplier;
    earthMoonMesh.position.set(Math.cos(tMoon) * 4.8, 0, Math.sin(tMoon) * 4.8);
  }
  if (issSatelliteMesh) {
    const tIss = Date.now() * 0.007 * state.speedMultiplier;
    issSatelliteMesh.position.set(Math.cos(tIss) * 3.4, Math.sin(tIss) * 1.4, Math.sin(tIss) * 3.4);
  }

  // Slowly rotate Asteroid & Kuiper belts
  if (asteroidBeltPoints && state.orbiting) {
    asteroidBeltPoints.rotation.y += 0.0004 * state.speedMultiplier;
  }
  if (kuiperBeltPoints && state.orbiting) {
    kuiperBeltPoints.rotation.y += 0.00015 * state.speedMultiplier;
  }

  // Animate Comet on a long ellipse
  if (cometGroup && state.orbiting) {
    cometAngle += 0.006 * state.speedMultiplier;
    const a = 125;
    const b = 48;
    cometGroup.position.x = Math.cos(cometAngle) * a;
    cometGroup.position.z = Math.sin(cometAngle) * b;
    cometGroup.rotation.y = -cometAngle + Math.PI / 2;
  }

  controls.update();
  renderer.render(scene, camera);
}

/* ==================== 4. HUD CONTROLS ==================== */
function populateSimulationHud() {
  const btnToggle = document.getElementById('btn-toggle-orbit');
  const btnReset = document.getElementById('btn-reset-cam');
  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  const quickSelector = document.getElementById('planet-quick-selector');

  btnToggle.addEventListener('click', () => {
    state.orbiting = !state.orbiting;
    updatePlayPauseButtonUI();
  });

  btnReset.addEventListener('click', () => {
    controls.target.set(0, 0, 0);
    camera.position.set(0, 130, 230);
    controls.update();
  });

  speedSlider.addEventListener('input', (e) => {
    state.speedMultiplier = parseFloat(e.target.value);
    speedVal.textContent = `${state.speedMultiplier.toFixed(1)}x`;
  });

  // Buttons for all celestial targets in HUD
  CELESTIAL_DATA.forEach(data => {
    const btn = document.createElement('button');
    btn.className = 'quick-btn';
    btn.textContent = data.name.replace('The ', '').split(' ')[0]; // Concise label
    btn.title = data.name;

    btn.addEventListener('click', () => {
      let targetMesh = null;
      if (data.id === 'sun') targetMesh = planetMeshObjects[0].mesh;
      else if (data.id === 'moon') targetMesh = earthMoonMesh;
      else if (data.id === 'iss') targetMesh = issSatelliteMesh;
      else if (data.id === 'asteroid_belt') targetMesh = asteroidBeltPoints;
      else if (data.id === 'kuiper_belt') targetMesh = kuiperBeltPoints;
      else if (data.id === 'comet') targetMesh = cometGroup;
      else {
        const found = planetMeshObjects.find(p => p.data.id === data.id);
        if (found) targetMesh = found.mesh;
      }

      if (targetMesh) {
        focusCameraOn(targetMesh, data.sizeRadius || 2);
      }
    });
    quickSelector.appendChild(btn);
  });
}

function updatePlayPauseButtonUI() {
  const btn = document.getElementById('btn-toggle-orbit');
  if (state.orbiting) {
    btn.textContent = 'Pause Orbits';
    btn.classList.remove('btn-ghost');
    btn.classList.add('btn-action');
  } else {
    btn.textContent = 'Resume Orbits';
    btn.classList.remove('btn-action');
    btn.classList.add('btn-ghost');
  }
}

/* ==================== 5. PLANET GALLERY ==================== */
function renderPlanetGallery() {
  const container = document.getElementById('planet-grid-container');
  container.innerHTML = '';

  CELESTIAL_DATA.forEach((item) => {
    if (item.id === 'sun') return;

    const card = document.createElement('div');
    card.className = 'planet-card';

    const hexColor = `#${new THREE.Color(item.visualColor).getHexString()}`;

    card.innerHTML = `
      <div class="card-top-accent" style="background: ${hexColor}"></div>
      <div class="planet-card-avatar" style="background: radial-gradient(circle at 35% 35%, ${hexColor}, #050711)"></div>
      <h3 class="planet-card-title">${item.name}</h3>
      <div class="planet-card-type">${item.type}</div>
      <p class="planet-card-tagline">${item.tagline}</p>
      <div class="planet-card-stats">
        <span>Dist: ${item.distanceFromSun}</span>
        <span>Size: ${item.diameter}</span>
      </div>
    `;

    card.addEventListener('click', () => openPlanetModal(item));
    container.appendChild(card);
  });
}

/* ==================== 6. MODAL HANDLERS ==================== */
function initModalHandlers() {
  const modal = document.getElementById('planet-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const focusBtn = document.getElementById('modal-focus-3d-btn');

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  focusBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    navigateTo('simulation');
    if (state.focusedTarget) {
      let match = null;
      if (state.focusedTarget.id === 'sun') match = planetMeshObjects[0].mesh;
      else if (state.focusedTarget.id === 'moon') match = earthMoonMesh;
      else if (state.focusedTarget.id === 'iss') match = issSatelliteMesh;
      else if (state.focusedTarget.id === 'comet') match = cometGroup;
      else {
        const found = planetMeshObjects.find(p => p.data.id === state.focusedTarget.id);
        if (found) match = found.mesh;
      }

      if (match) {
        setTimeout(() => focusCameraOn(match, state.focusedTarget.sizeRadius || 2), 150);
      }
    }
  });
}

function openPlanetModal(entity) {
  state.focusedTarget = entity;

  document.getElementById('modal-planet-type').textContent = entity.type;
  document.getElementById('modal-planet-name').textContent = entity.name;
  document.getElementById('modal-planet-tagline').textContent = entity.tagline;
  document.getElementById('modal-planet-desc').textContent = entity.description;

  document.getElementById('modal-diameter').textContent = entity.diameter || 'N/A';
  document.getElementById('modal-distance').textContent = entity.distanceFromSun || 'N/A';
  document.getElementById('modal-temp').textContent = entity.avgTemp || 'N/A';
  document.getElementById('modal-orbit').textContent = entity.orbitalPeriod || 'N/A';
  document.getElementById('modal-moons').textContent = entity.moons || 'None';

  const factsList = document.getElementById('modal-facts-list');
  factsList.innerHTML = '';
  if (entity.facts) {
    entity.facts.forEach(fact => {
      const li = document.createElement('li');
      li.textContent = fact;
      factsList.appendChild(li);
    });
  }

  document.getElementById('planet-modal').classList.remove('hidden');
}

/* ==================== 7. STEM QUIZ ENGINE ==================== */
function initQuizEngine() {
  const startBtn = document.getElementById('btn-start-quiz');
  const restartBtn = document.getElementById('btn-restart-quiz');
  const nextBtn = document.getElementById('btn-next-question');

  startBtn.addEventListener('click', startQuiz);
  restartBtn.addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', loadNextQuestion);
}

function startQuiz() {
  state.quiz.currentIndex = 0;
  state.quiz.score = 0;
  state.quiz.questions = [...QUIZ_QUESTIONS];

  document.getElementById('quiz-intro-screen').classList.add('hidden');
  document.getElementById('quiz-results-screen').classList.add('hidden');
  document.getElementById('quiz-play-screen').classList.remove('hidden');

  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  state.quiz.answered = false;
  const qData = state.quiz.questions[state.quiz.currentIndex];

  const progressPercent = ((state.quiz.currentIndex) / state.quiz.questions.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('quiz-question-counter').textContent = `Question ${state.quiz.currentIndex + 1} of ${state.quiz.questions.length}`;
  document.getElementById('quiz-score-tracker').textContent = `Score: ${state.quiz.score}`;

  document.getElementById('quiz-feedback-box').classList.add('hidden');
  document.getElementById('quiz-question-text').textContent = qData.question;

  const container = document.getElementById('quiz-options-container');
  container.innerHTML = '';

  qData.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.textContent = optText;
    btn.addEventListener('click', () => handleOptionSelection(index, btn));
    container.appendChild(btn);
  });
}

function handleOptionSelection(selectedIndex, clickedBtn) {
  if (state.quiz.answered) return;
  state.quiz.answered = true;

  const qData = state.quiz.questions[state.quiz.currentIndex];
  const allButtons = document.querySelectorAll('.quiz-opt-btn');
  const isCorrect = (selectedIndex === qData.answer);

  allButtons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    state.quiz.score += 1;
    clickedBtn.classList.add('correct');
  } else {
    clickedBtn.classList.add('incorrect');
    allButtons[qData.answer].classList.add('correct');
  }

  document.getElementById('quiz-score-tracker').textContent = `Score: ${state.quiz.score}`;

  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackHeading = document.getElementById('quiz-feedback-heading');
  const feedbackExplanation = document.getElementById('quiz-feedback-explanation');

  feedbackHeading.textContent = isCorrect ? '✓ Correct Answer!' : '✗ Incorrect';
  feedbackHeading.className = `feedback-heading ${isCorrect ? 'correct' : 'incorrect'}`;
  feedbackExplanation.textContent = qData.explanation;
  feedbackBox.classList.remove('hidden');
}

function loadNextQuestion() {
  state.quiz.currentIndex += 1;

  if (state.quiz.currentIndex < state.quiz.questions.length) {
    renderCurrentQuestion();
  } else {
    showFinalResults();
  }
}

function showFinalResults() {
  document.getElementById('quiz-play-screen').classList.add('hidden');
  document.getElementById('quiz-results-screen').classList.remove('hidden');

  const total = state.quiz.questions.length;
  const score = state.quiz.score;
  const pct = Math.round((score / total) * 100);

  document.getElementById('quiz-final-score').textContent = score;

  const badge = document.getElementById('quiz-result-badge');
  const message = document.getElementById('quiz-score-message');

  if (pct >= 90) {
    badge.textContent = '🌟 Master Astronomer';
    message.textContent = `Outstanding! You achieved ${pct}%. You possess a command of planetary sciences!`;
  } else if (pct >= 70) {
    badge.textContent = '🚀 Junior Space Scientist';
    message.textContent = `Well done! You scored ${pct}%. You understand the core mechanics of our solar neighborhood!`;
  } else {
    badge.textContent = '🔭 Space Cadet in Training';
    message.textContent = `You scored ${pct}%. Review the Learning Hub and 3D simulation to bolster your astronomical facts!`;
  }
}

/* ==================== 8. BACKGROUND 2D STARFIELD PARTICLES ==================== */
function initBackgroundCanvas() {
  const container = document.getElementById('starfield-bg');
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const numStars = 200;
  const stars = [];

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.005
    });
  }

  function renderStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      star.alpha += star.speed;
      const opacity = (Math.sin(star.alpha) + 1) / 2;
      ctx.fillStyle = `rgba(180, 205, 255, ${opacity * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(renderStars);
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  renderStars();
}
