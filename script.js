/**
 * Solar System Explorer - Core Interactive Application
 * Three.js 3D Engine, Orbital Mechanics, UI Routing, STEM Quiz Engine
 */

// Application State
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

// Three.js Core Globals
let scene, camera, renderer, controls;
let planetMeshObjects = []; // Stores { mesh, orbitGroup, data, currentAngle }
let raycaster, mouse;
let canvasContainer;

/* ==========================================================================
   1. INITIALIZATION & VIEW ROUTING
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initViewRouting();
  init3DScene();
  renderPlanetGallery();
  populateSimulationHud();
  initQuizEngine();
  initModalHandlers();
});

function initViewRouting() {
  const navLinks = document.querySelectorAll('.nav-link');
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  window.navigateTo = (targetView) => {
    state.activeView = targetView;

    // Update active navbar state
    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetView) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile dropdown if open
    navLinksContainer.classList.remove('open');

    // Switch view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`view-${targetView}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Trigger window resize to ensure Three.js canvas matches screen size
    if (targetView === 'simulation') {
      setTimeout(onWindowResize, 50);
    }
  };

  navLinks.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      navigateTo(target);
    });
  });

  navToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
  });
}

/* ==========================================================================
   2. PROCEDURAL TEXTURE GENERATION (Self-Contained, Zero CORS Issues)
   ========================================================================== */
function createProceduralTexture(type, hexColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const base = new THREE.Color(hexColor);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Layer subtle bands, craters, and atmospheric variations
  if (type === 'sun') {
    const radial = ctx.createRadialGradient(256, 128, 10, 256, 128, 250);
    radial.addColorStop(0, '#ffffff');
    radial.addColorStop(0.3, '#ffcc00');
    radial.addColorStop(0.8, '#ff5500');
    radial.addColorStop(1, '#990000');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (type === 'earth') {
    // Continents / swirls
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 45 + 15, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cloud swirls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 30 + 10, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'jupiter' || type === 'saturn') {
    // Cloud band stripes
    for (let y = 0; y < 256; y += 8) {
      ctx.fillStyle = (y % 16 === 0) ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, y, 512, 8);
    }
    // Great red spot for Jupiter
    if (type === 'jupiter') {
      ctx.fillStyle = 'rgba(180, 50, 30, 0.8)';
      ctx.beginPath();
      ctx.ellipse(320, 160, 25, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Crater speckles for rocky worlds
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 6 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/* ==========================================================================
   3. THREE.JS 3D SOLAR SYSTEM ENGINE
   ========================================================================== */
function init3DScene() {
  canvasContainer = document.getElementById('canvas-container');
  const loader = document.getElementById('webgl-loading');
  const errorOverlay = document.getElementById('webgl-error');

  // Verify WebGL capability
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvasContainer.appendChild(renderer.domElement);
  } catch (err) {
    if (loader) loader.classList.add('hidden');
    if (errorOverlay) errorOverlay.classList.remove('hidden');
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03050a);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    canvasContainer.clientWidth / canvasContainer.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 110, 190);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 550;
  controls.minDistance = 15;

  // Scene Illumination
  const ambientLight = new THREE.AmbientLight(0x333344, 1.2);
  scene.add(ambientLight);

  const sunLight = new THREE.PointLight(0xffffff, 2.5, 800, 0.5);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Background Starfield Generator
  create3DStarfield();

  // Populate Sun and Planetary Bodies
  buildSolarSystemObjects();

  // Raycasting for User Interaction (Clicking 3D Planets)
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown', onDocumentPointerDown, false);

  window.addEventListener('resize', onWindowResize, false);

  // Hide loading spinner
  if (loader) loader.classList.add('hidden');

  // Start Animation Loop
  animate();
}

function create3DStarfield() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 2000;
  const positions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1200;
    positions[i + 1] = (Math.random() - 0.5) * 1200;
    positions[i + 2] = (Math.random() - 0.5) * 1200;
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0x99aacc, size: 1.2 });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
}

function buildSolarSystemObjects() {
  PLANET_DATA.forEach((data) => {
    if (data.id === 'sun') {
      // The Sun
      const sunGeo = new THREE.SphereGeometry(data.sizeRadius, 48, 48);
      const sunTex = createProceduralTexture('sun', data.visualColor);
      const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      sunMesh.userData = { id: data.id, data: data };
      scene.add(sunMesh);

      // Glowing Corona Aura
      const coronaGeo = new THREE.SphereGeometry(data.sizeRadius * 1.15, 32, 32);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide
      });
      const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
      scene.add(coronaMesh);

      planetMeshObjects.push({
        mesh: sunMesh,
        orbitGroup: null,
        data: data,
        currentAngle: 0
      });
    } else {
      // Orbiting Planets
      const orbitRadius = data.orbitRadius;

      // 1. Visible Orbital Trace Path
      const orbitCurve = new THREE.EllipseCurve(0, 0, orbitRadius, orbitRadius, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(120);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x273b6b,
        transparent: true,
        opacity: 0.6
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

      // 2. Planet Mesh
      const planetGeo = new THREE.SphereGeometry(data.sizeRadius, 32, 32);
      const planetTex = createProceduralTexture(data.id, data.visualColor);
      const planetMat = new THREE.MeshStandardMaterial({
        map: planetTex,
        roughness: 0.7,
        metalness: 0.1
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.userData = { id: data.id, data: data };

      // Initial orbital position
      const initialAngle = Math.random() * Math.PI * 2;
      planetMesh.position.set(
        Math.cos(initialAngle) * orbitRadius,
        0,
        Math.sin(initialAngle) * orbitRadius
      );
      scene.add(planetMesh);

      // 3. Saturn's Ring System
      if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.sizeRadius * 1.35, data.sizeRadius * 2.3, 32);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xc4b785,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        planetMesh.add(ringMesh);
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

function onDocumentPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersectableMeshes = planetMeshObjects.map(item => item.mesh);
  const intersects = raycaster.intersectObjects(intersectableMeshes, false);

  if (intersects.length > 0) {
    const hitPlanet = intersects[0].object;
    if (hitPlanet.userData && hitPlanet.userData.data) {
      openPlanetModal(hitPlanet.userData.data);
    }
  }
}

// Camera Target Animation (Focus on planet)
function focusCameraOn(targetMesh, radiusOffset) {
  state.orbiting = false; // Pause while closely inspecting
  updatePlayPauseButtonUI();

  const targetPos = new THREE.Vector3();
  targetMesh.getWorldPosition(targetPos);

  controls.target.copy(targetPos);
  camera.position.set(
    targetPos.x + radiusOffset * 3.5 + 5,
    targetPos.y + radiusOffset * 1.5 + 3,
    targetPos.z + radiusOffset * 3.5 + 5
  );
  controls.update();
}

// Main Render Loop
function animate() {
  requestAnimationFrame(animate);

  // Orbit & Spin Dynamics
  planetMeshObjects.forEach((item) => {
    // Axial Spin
    item.mesh.rotation.y += (item.data.rotationSpeed || 0.01);

    // Orbital Path Progression
    if (state.orbiting && item.orbitRadius) {
      item.currentAngle += item.orbitSpeed * 0.25 * state.speedMultiplier;
      item.mesh.position.x = Math.cos(item.currentAngle) * item.orbitRadius;
      item.mesh.position.z = Math.sin(item.currentAngle) * item.orbitRadius;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

/* ==========================================================================
   4. HUD CONTROLS & HUD QUICK NAVIGATION
   ========================================================================== */
function populateSimulationHud() {
  const btnToggle = document.getElementById('btn-toggle-orbit');
  const btnReset = document.getElementById('btn-reset-cam');
  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  const quickSelector = document.getElementById('planet-quick-selector');

  // Toggle orbit pause/resume
  btnToggle.addEventListener('click', () => {
    state.orbiting = !state.orbiting;
    updatePlayPauseButtonUI();
  });

  // Reset Camera to Master Overhead Overview
  btnReset.addEventListener('click', () => {
    controls.target.set(0, 0, 0);
    camera.position.set(0, 110, 190);
    controls.update();
  });

  // Orbital Speed Slider
  speedSlider.addEventListener('input', (e) => {
    state.speedMultiplier = parseFloat(e.target.value);
    speedVal.textContent = `${state.speedMultiplier.toFixed(1)}x`;
  });

  // Quick focus buttons in HUD
  PLANET_DATA.forEach(data => {
    const btn = document.createElement('button');
    btn.className = 'quick-btn';
    btn.textContent = data.name.replace('The ', '');
    btn.addEventListener('click', () => {
      const match = planetMeshObjects.find(p => p.data.id === data.id);
      if (match) {
        focusCameraOn(match.mesh, data.sizeRadius);
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

/* ==========================================================================
   5. PLANET EXPLORER GALLERY GENERATION
   ========================================================================== */
function renderPlanetGallery() {
  const container = document.getElementById('planet-grid-container');
  container.innerHTML = '';

  PLANET_DATA.forEach((planet) => {
    if (planet.id === 'sun') return; // Roster highlights the 8 major planets

    const card = document.createElement('div');
    card.className = 'planet-card';

    const hexColor = `#${new THREE.Color(planet.visualColor).getHexString()}`;

    card.innerHTML = `
      <div class="card-top-accent" style="background: ${hexColor}"></div>
      <div class="planet-card-avatar" style="background: radial-gradient(circle at 35% 35%, ${hexColor}, #050711)"></div>
      <h3 class="planet-card-title">${planet.name}</h3>
      <div class="planet-card-type">${planet.type}</div>
      <p class="planet-card-tagline">${planet.tagline}</p>
      <div class="planet-card-stats">
        <span>Dist: ${planet.distanceFromSun}</span>
        <span>Moons: ${planet.moons.split(' ')[0]}</span>
      </div>
    `;

    card.addEventListener('click', () => openPlanetModal(planet));
    container.appendChild(card);
  });
}

/* ==========================================================================
   6. PLANET DETAIL MODAL HANDLERS
   ========================================================================== */
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
      const match = planetMeshObjects.find(p => p.data.id === state.focusedTarget.id);
      if (match) {
        setTimeout(() => focusCameraOn(match.mesh, match.data.sizeRadius), 150);
      }
    }
  });
}

function openPlanetModal(planet) {
  state.focusedTarget = planet;

  document.getElementById('modal-planet-type').textContent = planet.type;
  document.getElementById('modal-planet-name').textContent = planet.name;
  document.getElementById('modal-planet-tagline').textContent = planet.tagline;
  document.getElementById('modal-planet-desc').textContent = planet.description;

  document.getElementById('modal-diameter').textContent = planet.diameter;
  document.getElementById('modal-distance').textContent = planet.distanceFromSun;
  document.getElementById('modal-temp').textContent = planet.avgTemp;
  document.getElementById('modal-orbit').textContent = planet.orbitalPeriod;
  document.getElementById('modal-moons').textContent = planet.moons;

  const factsList = document.getElementById('modal-facts-list');
  factsList.innerHTML = '';
  planet.facts.forEach(fact => {
    const li = document.createElement('li');
    li.textContent = fact;
    factsList.appendChild(li);
  });

  document.getElementById('planet-modal').classList.remove('hidden');
}

/* ==========================================================================
   7. STEM QUIZ ENGINE (15 Multiple-Choice Questions)
   ========================================================================== */
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
  state.quiz.questions = [...QUIZ_QUESTIONS]; // Full bank of 15 questions

  document.getElementById('quiz-intro-screen').classList.add('hidden');
  document.getElementById('quiz-results-screen').classList.add('hidden');
  document.getElementById('quiz-play-screen').classList.remove('hidden');

  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  state.quiz.answered = false;
  const qData = state.quiz.questions[state.quiz.currentIndex];

  // Update Progress & Score
  const progressPercent = ((state.quiz.currentIndex) / state.quiz.questions.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('quiz-question-counter').textContent = `Question ${state.quiz.currentIndex + 1} of ${state.quiz.questions.length}`;
  document.getElementById('quiz-score-tracker').textContent = `Score: ${state.quiz.score}`;

  // Hide feedback box
  document.getElementById('quiz-feedback-box').classList.add('hidden');

  // Set prompt text
  document.getElementById('quiz-question-text').textContent = qData.question;

  // Build options
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

  // Disable all option buttons
  allButtons.forEach(btn => btn.disabled = true);

  // Highlight choices
  if (isCorrect) {
    state.quiz.score += 1;
    clickedBtn.classList.add('correct');
  } else {
    clickedBtn.classList.add('incorrect');
    allButtons[qData.answer].classList.add('correct'); // Reveal correct answer
  }

  // Update score tracker
  document.getElementById('quiz-score-tracker').textContent = `Score: ${state.quiz.score}`;

  // Present scientific rationale feedback
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

/* ==========================================================================
   8. BACKGROUND 2D STARFIELD PARTICLES (For UI Views)
   ========================================================================== */
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