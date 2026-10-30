/*! GUU 2.0 · Grand Unified Universe: Singularity
   © 2026 Mandeep S. Bhullar · SpinalXeno™. All rights reserved. SpinalXeno™ is a trademark of Mandeep S. Bhullar.
   Unauthorized copying, modification or redistribution of this code is prohibited.
   Digitally signed by SpinalXeno, signing key fingerprint (SHA-256) 25666eb2cf27368640bb41154733bfdc1f8a07b194aec7661659fc7b565155b3 */

// ===== GUU 2.0 · SINGULARITY THEORY =====

const TAU = Math.PI * 2;

// Scale shells: each scale orbits the singularity at its own distance
// (fraction of the view radius) and thickness. Planck sits closest and
// flattest, Meta farthest and most spherical.
const SCALES = [
    { name: 'Planck',  shell: [0.26, 0.44], thick: 0.04, size: 0.9, known: '#fff3d1', unknown: '#9a7bff' },
    { name: 'Quantum', shell: [0.36, 0.60], thick: 0.07, size: 1.1, known: '#ffd166', unknown: '#7f56ff' },
    { name: 'Atomic',  shell: [0.52, 0.78], thick: 0.11, size: 1.3, known: '#ffb347', unknown: '#6a3ef0' },
    { name: 'Cosmic',  shell: [0.70, 1.00], thick: 0.18, size: 1.6, known: '#ff8a5b', unknown: '#4d45d8' },
    { name: 'Meta',    shell: [0.92, 1.30], thick: 0.40, size: 1.9, known: '#ff5d8f', unknown: '#a44dff' }
];

const BACKGROUNDS = {
    void: '#07031a',
    black: '#000000',
    nebula: '#061428',
    crimson: '#12030a',
    aurora: '#03140f',
    white: '#f4f1ea'
};

const THEORY = {
    // Effective mass: core mass plus every particle held inside the horizon
    effectiveMass: (core, contained, m) => core + contained * m,

    schwarzschild: (mass) => 8 + mass * 0.9,

    // Kerr outer horizon: r₊ = ½ r_s (1 + √(1 − a²)), so spin shrinks the horizon
    kerrHorizon: (rs, spin) => 0.5 * rs * (1 + Math.sqrt(1 - spin * spin)),

    gravity: (mass) => mass * 30,

    // Hawking temperature ∝ 1/M: light singularities radiate hardest
    hawkingRate: (hawking, mass) => (hawking / 100) * 1.2 * (30 / mass),

    // Gravitational time dilation near the horizon
    timeDilation: (r, rh) => Math.sqrt(Math.max(0.04, 1 - rh / r)),

    // Polygarity: pole pairs per shell grow with dimensionality and strength
    polePairsPerShell: (dimensionality, strength) =>
        Math.max(1, Math.min(7, Math.floor(Math.pow(dimensionality, strength / 2.2) / 2))),

    // Multitarity: how many cross-scale links the field keeps alive
    targetLinks: (particles, density) => Math.floor(particles * density / 100 * 0.25)
};

// ===== STATE MANAGEMENT =====

const STATE = {
    particles: [],
    pool: [],                       // particles held inside the horizon
    polarityNodes: [[], [], [], [], []],
    multitarityLinks: [],

    currentLayer: 5,  // 0–4 a single shell, 5 all shells

    // Singularity parameters
    mass: 30,
    spin: 0.6,
    hawking: 30,
    bounceThreshold: 40,            // % of all matter held before the bounce
    particleMass: 0.05,
    viscosity: 30,
    lensing: 50,

    // Spectrum
    background: 'void',
    colorMode: 'natural',

    // Theory parameters
    knownRatio: 0.05,
    infinityParam: 1000,
    dimensionality: 4,
    polarityStrength: 2,
    multitarityDensity: 50,
    decoherence: 30,

    // Visualization
    speed: 1,
    particleCount: 1200,
    connectionRange: 200,
    unknownAlpha: 60,
    trails: 80,
    elevation: 16,
    orbitSpeed: 15,
    zoom: 100,

    // Geometry (set on resize)
    w: 0, h: 0, dpr: 1,
    cx: 0, cy: 0,
    radius: 0, unit: 1,

    // Singularity dynamics
    effMass: 30,
    rs: 0, rh: 0, GM: 0,
    criticality: 0,
    accretionRate: 0,
    absorbedThisFrame: 0,
    absorbedTotal: 0,
    hawkingTotal: 0,
    bounces: 0,
    flash: 0,
    shock: 0,
    time: 0,

    fps: 60,
    frameCount: 0,
    lastTime: performance.now(),
    isRunning: true,
    dragging: false,
    dragX: 0,
    dragY: 0
};

// ===== CAMERA =====

const CAM = {
    yaw: 0.7,
    pitch: 0,
    dist: 1, f: 1, scale0: 1,
    px: 0, py: 0, pz: 0,            // position
    rx: 0, ry: 0, rz: 0,            // right
    ux: 0, uy: 0, uz: 0,            // up
    fx: 0, fy: 0, fz: 0             // forward
};

function updateCamera(step) {
    const cinematic = DOM.cinematicToggle.checked;
    if (cinematic && !STATE.dragging) CAM.yaw += STATE.orbitSpeed * 0.00006 * step;

    // Cinematic: orbit at the chosen elevation. Flat: look straight down.
    const pitch = cinematic ? STATE.elevation * Math.PI / 180 : 1.5533;
    CAM.pitch = pitch;
    CAM.f = STATE.radius * 2.4;
    CAM.dist = CAM.f / (STATE.zoom / 100);
    CAM.scale0 = CAM.f / CAM.dist;

    const cp = Math.cos(pitch);
    CAM.px = CAM.dist * cp * Math.sin(CAM.yaw);
    CAM.py = CAM.dist * Math.sin(pitch);
    CAM.pz = CAM.dist * cp * Math.cos(CAM.yaw);

    CAM.fx = -CAM.px / CAM.dist;
    CAM.fy = -CAM.py / CAM.dist;
    CAM.fz = -CAM.pz / CAM.dist;

    // right = forward × worldUp, up = right × forward
    const rl = Math.hypot(CAM.fz, CAM.fx) || 1;
    CAM.rx = -CAM.fz / rl;
    CAM.ry = 0;
    CAM.rz = CAM.fx / rl;
    CAM.ux = CAM.ry * CAM.fz - CAM.rz * CAM.fy;
    CAM.uy = CAM.rz * CAM.fx - CAM.rx * CAM.fz;
    CAM.uz = CAM.rx * CAM.fy - CAM.ry * CAM.fx;
}

// Perspective projection into a reusable point; returns false behind the camera
const P = { x: 0, y: 0, s: 1, z: 0 };

function project(x, y, z, out) {
    const dx = x - CAM.px;
    const dy = y - CAM.py;
    const dz = z - CAM.pz;
    const zc = dx * CAM.fx + dy * CAM.fy + dz * CAM.fz;
    if (zc < CAM.dist * 0.05) return false;
    const s = CAM.f / zc;
    out.x = STATE.cx + (dx * CAM.rx + dy * CAM.ry + dz * CAM.rz) * s;
    out.y = STATE.cy - (dx * CAM.ux + dy * CAM.uy + dz * CAM.uz) * s;
    out.s = s;
    out.z = zc;
    return true;
}

// ===== POLARITY NODE CLASS (orbiting attractor) =====

class PolarityNode {
    constructor(layer, strength, charge) {
        const scale = SCALES[layer];
        this.layer = layer;
        this.strength = strength;
        this.charge = charge;
        this.orbitFrac = scale.shell[0] + Math.random() * (scale.shell[1] - scale.shell[0]);
        this.lift = (Math.random() - 0.5) * scale.thick;
        this.angle = Math.random() * TAU;
        this.phase = Math.random() * TAU;
        this.frequency = Math.random() * 0.04 + 0.02;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.radius = 0;
        this.reach2 = 0;
        this.update(0);
    }

    update(step) {
        const r = Math.max(STATE.rs * 3, this.orbitFrac * STATE.radius);
        this.angle += Math.sqrt(STATE.GM / (r * r * r)) * 0.6 * step;
        this.phase += this.frequency * step;
        this.x = Math.cos(this.angle) * r;
        this.y = this.lift * r;
        this.z = Math.sin(this.angle) * r;
        this.radius = (14 + this.strength * 14 + Math.sin(this.phase) * 5) * STATE.unit;
        this.reach2 = Math.pow(this.radius * 4, 2);
    }

    draw(ctx, alpha) {
        if (!project(this.x, this.y, this.z, P)) return;
        const rgb = this.charge > 0 ? '255, 61, 127' : '76, 201, 240';
        const radius = this.radius * P.s;
        const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, radius);
        g.addColorStop(0, `rgba(${rgb}, ${0.45 * alpha})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(P.x, P.y, radius, 0, TAU);
        ctx.fill();

        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(P.x, P.y, 2.5 * Math.min(2, P.s), 0, TAU);
        ctx.fill();
    }
}

// ===== MULTITARITY LINK CLASS =====
// Links are born, glow and dissolve continuously, so the web never dies out.

class MultitarityLink {
    constructor(a, b) {
        this.a = a;
        this.b = b;
        this.genA = a.gen;
        this.genB = b.gen;
        this.age = 0;
        this.life = 240 + Math.random() * 360;
        this.strength = 0.4 + Math.random() * 0.6;
        this.pulsePhase = Math.random() * TAU;
    }

    update(step) {
        this.age += step;
        this.pulsePhase += 0.05 * step;
        // An endpoint that fell in, radiated out or respawned breaks the link
        if (this.a.gen !== this.genA || this.b.gen !== this.genB) return false;
        const dx = this.a.x - this.b.x;
        const dy = this.a.y - this.b.y;
        const dz = this.a.z - this.b.z;
        if (dx * dx + dy * dy + dz * dz > Math.pow(STATE.connectionRange * 2.5, 2)) return false;
        return this.age < this.life;
    }

    draw(ctx, hs) {
        const life = Math.sin(Math.PI * Math.min(1, this.age / this.life));
        const pulse = 0.6 + 0.4 * Math.sin(this.pulsePhase);
        const opacity = life * pulse * this.strength * 0.55;
        if (opacity < 0.01) return;

        if (!project(this.a.x, this.a.y, this.a.z, P)) return;
        const ax = P.x;
        const ay = P.y;
        if (!project(this.b.x, this.b.y, this.b.z, P)) return;

        // Gravitational lensing bends each link toward the singularity
        const mx = (ax + P.x) / 2;
        const my = (ay + P.y) / 2;
        const tx = STATE.cx - mx;
        const ty = STATE.cy - my;
        const dm = Math.hypot(tx, ty) + 1;
        const bend = Math.min(0.7, (STATE.lensing / 100) * (hs * 3) / dm);

        ctx.strokeStyle = `rgba(127, 233, 255, ${opacity})`;
        ctx.lineWidth = 0.6 + pulse * 0.6;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(mx + tx * bend, my + ty * bend, P.x, P.y);
        ctx.stroke();
    }
}

// ===== UNIVERSE PARTICLE CLASS =====

class UniverseParticle {
    constructor(layer, isKnown) {
        this.layer = layer;
        this.isKnown = isKnown;
        this.active = true;
        this.gen = 0;
        this.respawn();
    }

    // Place the particle in its scale shell on a near-circular orbit
    respawn() {
        const scale = SCALES[this.layer];
        const r = STATE.radius * (scale.shell[0] + Math.random() * (scale.shell[1] - scale.shell[0]));
        const angle = Math.random() * TAU;
        const v = Math.sqrt(STATE.GM / r) * (0.85 + Math.random() * 0.2);
        const lift = (Math.random() + Math.random() - 1) * scale.thick;

        this.x = Math.cos(angle) * r;
        this.y = lift * r;
        this.z = Math.sin(angle) * r;
        this.vx = -Math.sin(angle) * v + (Math.random() - 0.5) * 0.3 * STATE.unit;
        this.vy = (Math.random() - 0.5) * v * scale.thick;
        this.vz = Math.cos(angle) * v + (Math.random() - 0.5) * 0.3 * STATE.unit;
        this.depth = 0;
        this.heat = 0;
        this.hawking = 0;
        this.gen++;
    }

    // Launch from the horizon along a random direction (Hawking emission, bounce)
    launch(speedFactor) {
        const u = Math.random() * 2 - 1;
        const phi = Math.random() * TAU;
        const s = Math.sqrt(1 - u * u);
        const nx = s * Math.cos(phi);
        const ny = u;
        const nz = s * Math.sin(phi);
        const r = STATE.rh * 1.08;
        const v = Math.sqrt((2 * STATE.GM) / r) * speedFactor;

        this.x = nx * r;
        this.y = ny * r;
        this.z = nz * r;
        // Radial burst plus a share of the singularity's spin
        this.vx = nx * v - nz * v * 0.3 * STATE.spin;
        this.vy = ny * v;
        this.vz = nz * v + nx * v * 0.3 * STATE.spin;
        this.depth = 0;
        this.heat = 1;
        this.gen++;
    }

    // Returns 'absorbed', 'escaped' or null
    update(step) {
        const r = Math.hypot(this.x, this.y, this.z) || 0.001;

        if (r < STATE.rh) return 'absorbed';
        if (r > STATE.radius * 1.9) return 'escaped';

        const h = step * THEORY.timeDilation(r, STATE.rh);
        const nx = this.x / r;
        const ny = this.y / r;
        const nz = this.z / r;

        // Gravity toward the singularity
        const g = STATE.GM / (r * r + 200 * STATE.unit * STATE.unit);
        let ax = -nx * g;
        let ay = -ny * g;
        let az = -nz * g;

        // Polarity field forces from this shell's poles
        const nodes = STATE.polarityNodes[this.layer];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const px = node.x - this.x;
            const py = node.y - this.y;
            const pz = node.z - this.z;
            const d2 = px * px + py * py + pz * pz;
            if (d2 > node.reach2) continue;
            const d = Math.sqrt(d2) + 10 * STATE.unit;
            const f = node.charge * node.strength * 0.08 * STATE.unit * STATE.unit / d;
            ax += (px / d) * f;
            ay += (py / d) * f;
            az += (pz / d) * f;
        }

        // Quantum jitter
        const jitter = 0.02 * STATE.unit;
        ax += (Math.random() - 0.5) * jitter;
        ay += (Math.random() - 0.5) * jitter * 0.3;
        az += (Math.random() - 0.5) * jitter;

        this.vx += ax * h;
        this.vy += ay * h;
        this.vz += az * h;

        // Frame dragging inside the ergosphere: matter co-rotates about the spin axis
        const ergo = STATE.rs * (2 + STATE.spin * 2);
        if (r < ergo) {
            const rxz = Math.hypot(this.x, this.z) || 0.001;
            const tx = -this.z / rxz;
            const tz = this.x / rxz;
            const vt = this.vx * tx + this.vz * tz;
            const k = 0.03 * (1 - r / ergo) * h;
            const dv = (STATE.spin * Math.sqrt(STATE.GM / r) - vt) * k;
            this.vx += dv * tx;
            this.vz += dv * tz;
        }

        // Accretion viscosity: matter spirals inward and settles into the disk
        const visc = STATE.viscosity / 100;
        const damp = r < STATE.rs * 3 ? 1 - 0.004 * visc : 1 - 0.0003 * visc;
        this.vx *= damp;
        this.vz *= damp;
        this.vy *= damp - 0.001 * visc;

        this.x += this.vx * h;
        this.y += this.vy * h;
        this.z += this.vz * h;

        this.heat = Math.min(1, (STATE.rh * 2) / r);

        // Decoherence: cold, distant matter slowly fades back into the Unknown
        if (this.isKnown && this.heat < 0.25 && !this.hawking &&
            Math.random() < STATE.decoherence * 0.00012 * h * (1 - STATE.knownRatio)) {
            this.isKnown = false;
        } else if (!this.isKnown && Math.random() < STATE.decoherence * 0.00012 * h * STATE.knownRatio) {
            this.isKnown = true;
        }
        this.depth += h * 0.001 * Math.log(STATE.infinityParam) * (STATE.rh / r);
        if (this.hawking > 0) this.hawking = Math.max(0, this.hawking - 0.02 * h);
        return null;
    }
}

// ===== DOM ELEMENTS =====

const $ = (id) => document.getElementById(id);

const DOM = {
    viewport: $('viewport'),
    gridCanvas: $('gridCanvas'),
    matterCanvas: $('matterCanvas'),
    fieldCanvas: $('fieldCanvas'),
    gridCtx: null,
    matterCtx: null,
    fieldCtx: null,

    // Switches & selects
    cinematicToggle: $('cinematicToggle'),
    gridToggle: $('gridToggle'),
    backgroundSelect: $('backgroundSelect'),
    colorModeSelect: $('colorModeSelect'),
    invertColors: $('invertColors'),

    // Checkboxes
    showKnown: $('showKnown'),
    showUnknown: $('showUnknown'),
    showPolarity: $('showPolarity'),
    showMultitarity: $('showMultitarity'),
    showDisk: $('showDisk'),
    showJets: $('showJets'),
    showRings: $('showRings'),
    enableBounce: $('enableBounce'),

    // Buttons
    pauseBtn: $('pauseBtn'),
    resetBtn: $('resetBtn'),
    collapseNowBtn: $('collapseNowBtn'),
    exportBtn: $('exportBtn'),
    infoBtn: $('infoBtn'),
    hideUiBtn: $('hideUiBtn'),
    showUiBtn: $('showUiBtn'),
    collapseBtn: $('collapseBtn'),
    layerBtns: document.querySelectorAll('.layer-btn'),
    sectionToggles: document.querySelectorAll('.section-toggle'),

    // Stats
    knownSpace: $('knownSpace'),
    unknownSpace: $('unknownSpace'),
    fpsCount: $('fpsCount'),
    polarityNodes: $('polarityNodes'),
    multitarityLinks: $('multitarityLinks'),
    deepIndex: $('deepIndex'),
    horizonRadius: $('horizonRadius'),
    effectiveMass: $('effectiveMass'),
    hawkingCount: $('hawkingCount'),
    fieldCount: $('fieldCount'),
    horizonCount: $('horizonCount'),
    conservedTotal: $('conservedTotal'),
    absorbedCount: $('absorbedCount'),
    bounceCount: $('bounceCount'),
    infoRecovered: $('infoRecovered'),

    // Phase info
    knownPhase: $('knownPhase'),
    unknownPhase: $('unknownPhase'),
    singularityPhase: $('singularityPhase'),
    criticalityBar: $('criticalityBar'),

    // Spectrum key
    spectrumKey: $('spectrumKey'),
    spectrumBar: $('spectrumBar'),
    spectrumLow: $('spectrumLow'),
    spectrumHigh: $('spectrumHigh'),

    infoModal: $('infoModal'),
    controlPanel: document.querySelector('.control-panel')
};

// Every slider: [element id, state key, display formatter, side effect, divisor]
const SLIDERS = [
    ['massSlider', 'mass', (v) => v.toFixed(0)],
    ['spinSlider', 'spin', (v) => v.toFixed(2)],
    ['hawkingSlider', 'hawking', (v) => v + '%'],
    ['bounceSlider', 'bounceThreshold', (v) => v + '%'],
    ['particleMassSlider', 'particleMass', (v) => v.toFixed(2)],
    ['viscositySlider', 'viscosity', (v) => v + '%'],
    ['lensingSlider', 'lensing', (v) => v + '%'],
    ['knownRatioSlider', 'knownRatio', (v) => Math.round(v * 100) + '%', reassignKnown, 100],
    ['infinitySlider', 'infinityParam', (v) => v.toFixed(0)],
    ['dimensionalitySlider', 'dimensionality', (v) => v + 'D', buildPolarityNodes],
    ['polaritySlider', 'polarityStrength', (v) => v.toFixed(1), buildPolarityNodes],
    ['multitaritySlider', 'multitarityDensity', (v) => v + '%'],
    ['decoherenceSlider', 'decoherence', (v) => v + '%'],
    ['speedSlider', 'speed', (v) => v.toFixed(1) + 'x'],
    ['particleSlider', 'particleCount', (v) => v.toFixed(0), syncParticleCount],
    ['connectionSlider', 'connectionRange', (v) => v + 'px'],
    ['unknownAlphaSlider', 'unknownAlpha', (v) => v + '%'],
    ['trailSlider', 'trails', (v) => v + '%'],
    ['elevationSlider', 'elevation', (v) => v.toFixed(0) + '°', clearTrails],
    ['orbitSlider', 'orbitSpeed', (v) => v + '%'],
    ['zoomSlider', 'zoom', (v) => v + '%', clearTrails]
];

// ===== SPECTRUM PALETTES =====
// Pre-built so the render loop never formats color strings per particle.

const SPECTRUM_STEPS = 64;
const ENERGY_COLORS = [];
const DOPPLER_COLORS = [];

for (let i = 0; i <= SPECTRUM_STEPS; i++) {
    const t = i / SPECTRUM_STEPS;
    ENERGY_COLORS.push(`hsl(${Math.round(t * 275)}, 100%, ${Math.round(58 + t * 10)}%)`);
    const d = t * 2 - 1;  // −1 approaching (blue) … +1 receding (red)
    DOPPLER_COLORS.push(d < 0
        ? `hsl(214, ${Math.round(-d * 100)}%, ${Math.round(88 + d * 28)}%)`
        : `hsl(4, ${Math.round(d * 100)}%, ${Math.round(88 - d * 30)}%)`);
}

// ===== INITIALIZATION =====

function init() {
    DOM.gridCtx = DOM.gridCanvas.getContext('2d');
    DOM.matterCtx = DOM.matterCanvas.getContext('2d');
    DOM.fieldCtx = DOM.fieldCanvas.getContext('2d');

    resizeCanvases();
    setupEventListeners();
    initializeUniverse();
    applySpectrum();

    if (window.innerWidth < 600) {
        DOM.controlPanel.classList.add('collapsed');
        DOM.collapseBtn.textContent = '▶';
    }
    requestAnimationFrame(animate);
}

function resizeCanvases() {
    STATE.dpr = Math.min(window.devicePixelRatio || 1, 2);
    STATE.w = window.innerWidth;
    STATE.h = window.innerHeight;

    [DOM.gridCanvas, DOM.matterCanvas, DOM.fieldCanvas].forEach((canvas) => {
        canvas.width = Math.floor(STATE.w * STATE.dpr);
        canvas.height = Math.floor(STATE.h * STATE.dpr);
    });
    [DOM.gridCtx, DOM.matterCtx, DOM.fieldCtx].forEach((ctx) => {
        ctx.setTransform(STATE.dpr, 0, 0, STATE.dpr, 0, 0);
    });

    STATE.cx = STATE.w * 0.5;
    STATE.cy = STATE.h * 0.55;
    STATE.radius = Math.min(STATE.w, STATE.h) * 0.5;
    STATE.unit = STATE.radius / 400;
    updateSingularity();
}

function updateSingularity() {
    const total = STATE.particles.length || 1;
    STATE.criticality = Math.min(1, STATE.pool.length / (total * STATE.bounceThreshold / 100));
    STATE.effMass = THEORY.effectiveMass(STATE.mass, STATE.pool.length, STATE.particleMass);
    STATE.rs = Math.min(STATE.radius * 0.3, THEORY.schwarzschild(STATE.effMass) * STATE.unit);
    STATE.rh = THEORY.kerrHorizon(STATE.rs, STATE.spin);
    // Shell theorem: matter that falls in was already pulling on everything
    // outside it, so the pull on the field follows the core mass alone
    STATE.GM = THEORY.gravity(STATE.mass) * Math.pow(STATE.unit, 3);
}

function initializeUniverse() {
    STATE.pool = [];
    STATE.absorbedTotal = 0;
    STATE.hawkingTotal = 0;
    STATE.bounces = 0;
    STATE.flash = 0;
    STATE.time = 0;
    STATE.accretionRate = 0;
    STATE.multitarityLinks = [];

    STATE.particles = [];
    updateSingularity();
    for (let i = 0; i < STATE.particleCount; i++) {
        STATE.particles.push(new UniverseParticle(i % 5, Math.random() < STATE.knownRatio));
    }
    updateSingularity();
    buildPolarityNodes();

    clearTrails();
    updateStats();
}

// Poles come in ± pairs so the net charge of the universe is always zero
function buildPolarityNodes() {
    const pairs = THEORY.polePairsPerShell(STATE.dimensionality, STATE.polarityStrength);
    STATE.polarityNodes = [[], [], [], [], []];
    for (let layer = 0; layer < 5; layer++) {
        for (let n = 0; n < pairs; n++) {
            const strength = 0.3 + Math.random() * STATE.polarityStrength;
            STATE.polarityNodes[layer].push(new PolarityNode(layer, strength, 1));
            STATE.polarityNodes[layer].push(new PolarityNode(layer, strength, -1));
        }
    }
}

function reassignKnown() {
    STATE.particles.forEach((p) => { p.isKnown = Math.random() < STATE.knownRatio; });
}

function syncParticleCount() {
    const particles = STATE.particles;
    while (particles.length < STATE.particleCount) {
        particles.push(new UniverseParticle(particles.length % 5, Math.random() < STATE.knownRatio));
    }
    while (particles.length > STATE.particleCount) {
        const p = particles.pop();
        if (!p.active) STATE.pool.splice(STATE.pool.indexOf(p), 1);
        p.gen = -1;
    }
}

function clearTrails() {
    if (DOM.matterCtx) DOM.matterCtx.clearRect(0, 0, STATE.w, STATE.h);
}

// ===== SINGULARITY EVENTS (all conserve matter) =====

// Crossing the horizon: the particle leaves the field and its mass joins the singularity
function absorb(p) {
    p.active = false;
    p.gen++;
    STATE.pool.push(p);
    STATE.absorbedTotal++;
    STATE.absorbedThisFrame++;
}

// Hawking radiation can only return matter the singularity is holding
function emitHawking() {
    const rate = THEORY.hawkingRate(STATE.hawking, STATE.effMass) * STATE.speed;
    let emissions = Math.min(6, Math.floor(rate));
    if (Math.random() < rate - Math.floor(rate)) emissions++;

    for (let e = 0; e < emissions && STATE.pool.length; e++) {
        const p = STATE.pool.splice(Math.floor(Math.random() * STATE.pool.length), 1)[0];
        p.active = true;
        p.isKnown = true;
        p.hawking = 1;
        p.launch(1.15 + Math.random() * 0.25);
        STATE.hawkingTotal++;
        updateSingularity();
    }
}

// The bounce releases everything the horizon held, as Known matter
function triggerBounce() {
    STATE.bounces++;
    STATE.flash = 1;
    STATE.shock = STATE.rh;

    const released = STATE.pool;
    STATE.pool = [];
    updateSingularity();

    // Released matter is thrown back out into its scale shell, hot and revealed
    released.forEach((p) => {
        p.active = true;
        p.isKnown = Math.random() < 0.7;
        p.hawking = 0;
        p.respawn();
        p.heat = 1;
    });

    STATE.particles.forEach((p) => {
        if (!p.active || released.indexOf(p) !== -1) return;
        const r = Math.hypot(p.x, p.y, p.z) || 1;
        const kick = (2 + Math.random() * 2) * STATE.unit * Math.max(0.1, 1 - r / (STATE.radius * 1.4));
        p.vx += (p.x / r) * kick;
        p.vy += (p.y / r) * kick;
        p.vz += (p.z / r) * kick;
        p.heat = 1;
    });
}

// ===== SIMULATION =====

function simulate(step) {
    STATE.time += step;
    STATE.absorbedThisFrame = 0;
    updateSingularity();

    STATE.polarityNodes.forEach((layer) => layer.forEach((node) => node.update(step)));

    const particles = STATE.particles;
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p.active) continue;
        const result = p.update(step);
        if (result === 'absorbed') absorb(p);
        else if (result === 'escaped') p.respawn();
    }

    updateSingularity();
    emitHawking();
    updateMultitarityLinks(step);

    STATE.accretionRate = STATE.accretionRate * 0.97 + (STATE.absorbedThisFrame / step) * 0.03;

    if (STATE.criticality >= 1 && DOM.enableBounce.checked) triggerBounce();

    STATE.flash = Math.max(0, STATE.flash - 0.015 * step);
    STATE.shock += 9 * STATE.unit * step;
}

function updateMultitarityLinks(step) {
    STATE.multitarityLinks = STATE.multitarityLinks.filter((link) => link.update(step));

    // Keep the web renewing toward its target density
    const particles = STATE.particles;
    const target = THEORY.targetLinks(particles.length - STATE.pool.length, STATE.multitarityDensity);
    const range2 = STATE.connectionRange * STATE.connectionRange;
    let budget = Math.min(12, target - STATE.multitarityLinks.length);

    while (budget-- > 0 && particles.length > 1) {
        const a = particles[Math.floor(Math.random() * particles.length)];
        if (!a.active) continue;
        for (let tries = 0; tries < 8; tries++) {
            const b = particles[Math.floor(Math.random() * particles.length)];
            if (!b.active || b.layer === a.layer) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dz = a.z - b.z;
            if (dx * dx + dy * dy + dz * dz < range2) {
                STATE.multitarityLinks.push(new MultitarityLink(a, b));
                break;
            }
        }
    }
}

// ===== RENDERING =====

const frontParticles = [];

function render(step) {
    updateCamera(step);

    const g = DOM.gridCtx;
    const m = DOM.matterCtx;
    const f = DOM.fieldCtx;
    const hs = STATE.rh * CAM.scale0;          // horizon radius on screen

    g.clearRect(0, 0, STATE.w, STATE.h);
    if (DOM.gridToggle.checked) drawSpacetimeGrid(g);

    if (STATE.isRunning || STATE.dragging) {
        frontParticles.length = 0;
        // Fade the matter layer to leave trails
        m.globalCompositeOperation = 'destination-out';
        m.fillStyle = `rgba(0, 0, 0, ${STATE.dragging ? 0.5 : 1 - STATE.trails / 100})`;
        m.fillRect(0, 0, STATE.w, STATE.h);
        m.globalCompositeOperation = 'lighter';
        drawParticles(m, hs, false);
        m.globalCompositeOperation = 'source-over';
        m.globalAlpha = 1;
    }

    f.clearRect(0, 0, STATE.w, STATE.h);
    drawLensHalo(f, hs);
    if (DOM.showDisk.checked) drawAccretionDisk(f, false, hs);

    if (DOM.showPolarity.checked) {
        STATE.polarityNodes.forEach((layer, idx) => {
            if (!isLayerVisible(idx)) return;
            layer.forEach((node) => node.draw(f, STATE.currentLayer === 5 ? 0.7 : 1));
        });
    }

    if (DOM.showMultitarity.checked) {
        f.setLineDash([3, 3]);
        STATE.multitarityLinks.forEach((link) => {
            if (isLayerVisible(link.a.layer) || isLayerVisible(link.b.layer)) link.draw(f, hs);
        });
        f.setLineDash([]);
    }

    drawHorizon(f, hs);

    // Matter in front of the shadow is drawn over it
    f.globalCompositeOperation = 'lighter';
    drawParticles(f, hs, true);
    f.globalCompositeOperation = 'source-over';
    f.globalAlpha = 1;

    if (DOM.showDisk.checked) drawAccretionDisk(f, true, hs);
    if (DOM.showJets.checked) drawJets(f, hs);
    if (DOM.showRings.checked) drawRings(f, hs);
    drawBounce(f);
}

function isLayerVisible(layer) {
    return STATE.currentLayer === 5 || STATE.currentLayer === layer;
}

function drawParticles(ctx, hs, frontPass) {
    const showKnown = DOM.showKnown.checked;
    const showUnknown = DOM.showUnknown.checked;
    const unknownAlpha = STATE.unknownAlpha / 100;
    const mode = STATE.colorMode;
    const vref = Math.sqrt(STATE.GM / STATE.rh);
    const hs2 = Math.pow(hs * 1.1, 2);
    const list = frontPass ? frontParticles : STATE.particles;

    for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (!p.active || !isLayerVisible(p.layer)) continue;
        if (p.isKnown ? !showKnown : !showUnknown) continue;
        if (!project(p.x, p.y, p.z, P)) continue;

        // Matter nearer than the singularity and over its shadow waits for the front pass
        if (!frontPass && P.z < CAM.dist) {
            const sx = P.x - STATE.cx;
            const sy = P.y - STATE.cy;
            if (sx * sx + sy * sy < hs2) {
                frontParticles.push(p);
                continue;
            }
        }

        const scale = SCALES[p.layer];
        // Line-of-sight velocity: negative = moving toward the camera
        const vlos = p.vx * CAM.fx + p.vy * CAM.fy + p.vz * CAM.fz;
        let alpha;
        let color;

        if (p.hawking > 0) {
            color = '#c9f6ff';
            alpha = 1;
        } else {
            if (mode === 'energy') {
                const speed = Math.hypot(p.vx, p.vy, p.vz);
                const e = Math.max(0, Math.min(1, (speed / vref - 0.12) / 0.8));
                color = ENERGY_COLORS[Math.round(e * SPECTRUM_STEPS)];
            } else if (mode === 'doppler') {
                const d = Math.max(-1, Math.min(1, vlos / (vref * 0.45)));
                color = DOPPLER_COLORS[Math.round((d + 1) / 2 * SPECTRUM_STEPS)];
            } else if (p.isKnown) {
                // Infalling matter heats to white
                color = p.heat > 0.7 ? '#fff6e0' : scale.known;
            } else {
                color = scale.unknown;
            }
            alpha = p.isKnown ? 0.5 + 0.5 * p.heat : unknownAlpha * (0.35 + 0.65 * p.heat);
            // Relativistic beaming: approaching matter shines brighter
            alpha *= Math.max(0.55, Math.min(1.6, 1 - 0.6 * vlos / vref));
        }

        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(P.x, P.y, Math.max(0.4, scale.size * (0.8 + p.heat * 1.1 + p.hawking * 1.5) * P.s), 0, TAU);
        ctx.fill();
    }
}

// Rubber-sheet picture of curvature: a well that deepens with mass,
// dented by + poles and lifted by − poles
function drawSpacetimeGrid(ctx) {
    const lines = 26;
    const samples = 52;
    const extent = STATE.radius * 1.5;
    const base = -STATE.radius * 0.22;
    const depth = Math.min(STATE.radius * 0.9, STATE.radius * 0.32 * Math.sqrt(STATE.effMass / 30));
    const rs = Math.max(STATE.rs, 1);
    const poles = [];
    STATE.polarityNodes.forEach((layer) => layer.forEach((n) => poles.push(n)));
    const sigma2 = Math.pow(STATE.radius * 0.06, 2);
    const light = STATE.background === 'white';

    const height = (x, z) => {
        const r2 = x * x + z * z;
        let y = base - depth * rs / Math.sqrt(r2 + rs * rs);
        for (let i = 0; i < poles.length; i++) {
            const n = poles[i];
            const dx = x - n.x;
            const dz = z - n.z;
            y -= n.charge * n.strength * 6 * STATE.unit * Math.exp(-(dx * dx + dz * dz) / (2 * sigma2));
        }
        return y;
    };

    ctx.lineWidth = 0.8;
    for (let axis = 0; axis < 2; axis++) {
        for (let i = 0; i <= lines; i++) {
            const a = -extent + (2 * extent * i) / lines;
            let prevOk = false;
            let px = 0;
            let py = 0;
            for (let j = 0; j <= samples; j++) {
                const b = -extent + (2 * extent * j) / samples;
                const x = axis ? a : b;
                const z = axis ? b : a;
                const ok = project(x, height(x, z), z, P);
                if (ok && prevOk) {
                    const fade = Math.max(0, 1 - Math.hypot(x, z) / extent);
                    ctx.strokeStyle = light
                        ? `rgba(70, 40, 160, ${0.5 * fade})`
                        : `rgba(150, 120, 255, ${0.42 * fade})`;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(P.x, P.y);
                    ctx.stroke();
                }
                prevOk = ok;
                px = P.x;
                py = P.y;
            }
        }
    }
}

function drawLensHalo(ctx, hs) {
    const c = STATE.criticality;
    const R = hs * (3 + STATE.lensing / 40);
    const g = ctx.createRadialGradient(STATE.cx, STATE.cy, hs, STATE.cx, STATE.cy, R);
    g.addColorStop(0, `rgba(255, ${Math.round(200 - c * 90)}, ${Math.round(120 - c * 40)}, ${0.22 + c * 0.25})`);
    g.addColorStop(0.3, 'rgba(150, 100, 255, 0.10)');
    g.addColorStop(1, 'rgba(20, 0, 40, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(STATE.cx, STATE.cy, R, 0, TAU);
    ctx.fill();
}

// The disk lies in the spin plane. Segments behind the singularity are drawn
// before the shadow, nearer ones after it. Beaming brightens the approaching side.
function drawAccretionDisk(ctx, front, hs) {
    const rings = 14;
    const segments = 72;
    const c = STATE.criticality;
    const spinRate = 0.004 + STATE.spin * 0.012;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (let i = 0; i < rings; i++) {
        const f = i / (rings - 1);
        const r = STATE.rs * (1.6 + f * 3.2);
        const hue = 42 - f * 38;
        const light = 88 - f * 40;
        const baseAlpha = (0.5 - f * 0.32) * (0.7 + c * 0.5);
        const omega = STATE.time * spinRate / Math.pow(f + 0.4, 1.5);
        ctx.lineWidth = Math.max(0.6, (2 + (1 - f) * 2) * STATE.unit * CAM.scale0);

        let prevOk = false;
        let px = 0;
        let py = 0;
        let pz = 0;
        for (let j = 0; j <= segments; j++) {
            const th = (j / segments) * TAU;
            const ok = project(Math.cos(th) * r, 0, Math.sin(th) * r, P);
            if (ok && prevOk) {
                const isFront = (P.z + pz) / 2 < CAM.dist;
                if (isFront === front) {
                    // Orbital velocity direction (−sin θ, 0, cos θ) against the line of sight
                    const vlos = -Math.sin(th) * CAM.fx + Math.cos(th) * CAM.fz;
                    const beam = 1 - 0.65 * vlos;
                    const streak = 0.55 + 0.45 * Math.sin(th * 5 - omega);
                    ctx.strokeStyle = `hsla(${hue}, 100%, ${light}%, ${Math.min(1, baseAlpha * beam * streak)})`;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(P.x, P.y);
                    ctx.stroke();
                }
            }
            prevOk = ok;
            px = P.x;
            py = P.y;
            pz = P.z;
        }

        // Lensed image of the far side, bent up and over the shadow
        if (front && DOM.cinematicToggle.checked && STATE.lensing > 0) {
            const edgeOn = Math.cos(CAM.pitch);
            ctx.strokeStyle = `hsla(${hue}, 100%, ${light}%, ${baseAlpha * edgeOn * STATE.lensing / 100 * 0.8})`;
            ctx.lineWidth = Math.max(0.5, (1.5 + (1 - f) * 1.5) * STATE.unit * CAM.scale0);
            ctx.beginPath();
            ctx.ellipse(STATE.cx, STATE.cy, hs * (1.25 + f * 0.9), hs * (1.25 + f * 0.9) * (0.75 + 0.25 * edgeOn), 0, Math.PI, TAU);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawHorizon(ctx, hs) {
    const c = STATE.criticality;

    // Photon ring
    ctx.save();
    ctx.shadowColor = 'rgba(255, 190, 110, 0.9)';
    ctx.shadowBlur = 25 + c * 25;
    ctx.strokeStyle = `rgba(255, ${Math.round(214 - c * 80)}, ${Math.round(150 - c * 60)}, 0.9)`;
    ctx.lineWidth = 1.5 + c * 1.5;
    ctx.beginPath();
    ctx.arc(STATE.cx, STATE.cy, hs * 1.04, 0, TAU);
    ctx.stroke();
    ctx.restore();

    // Event horizon: nothing escapes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(STATE.cx, STATE.cy, hs, 0, TAU);
    ctx.fill();
}

// Twin jets along the spin axis, as long as the accretion rate is high
function drawJets(ctx, hs) {
    const strength = Math.min(1, STATE.accretionRate * 1.5);
    if (strength < 0.02) return;
    const length = STATE.rh * (2 + strength * 14);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    [1, -1].forEach((dir) => {
        if (!project(0, dir * STATE.rh, 0, P)) return;
        const bx = P.x;
        const by = P.y;
        if (!project(0, dir * length, 0, P)) return;
        const grad = ctx.createLinearGradient(bx, by, P.x, P.y);
        grad.addColorStop(0, `rgba(200, 245, 255, ${0.9 * strength})`);
        grad.addColorStop(0.4, `rgba(127, 233, 255, ${0.45 * strength})`);
        grad.addColorStop(1, 'rgba(123, 92, 255, 0)');
        ctx.strokeStyle = grad;
        [hs * 0.5, hs * 0.22, hs * 0.08].forEach((width) => {
            ctx.lineWidth = Math.max(1, width);
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(P.x, P.y);
            ctx.stroke();
        });
    });
    ctx.restore();
}

function drawRings(ctx, hs) {
    // Photon sphere
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.arc(STATE.cx, STATE.cy, STATE.rs * 1.5 * CAM.scale0, 0, TAU);
    ctx.stroke();

    // Ergosphere equator at r_s in the spin plane
    if (STATE.spin > 0.01) {
        ctx.strokeStyle = 'rgba(164, 120, 255, 0.45)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let j = 0; j <= 64; j++) {
            const th = (j / 64) * TAU;
            if (!project(Math.cos(th) * STATE.rs, 0, Math.sin(th) * STATE.rs, P)) continue;
            if (j === 0) ctx.moveTo(P.x, P.y);
            else ctx.lineTo(P.x, P.y);
        }
        ctx.stroke();
    }
    ctx.setLineDash([]);
}

function drawBounce(ctx) {
    if (STATE.flash <= 0) return;
    ctx.fillStyle = `rgba(255, 236, 200, ${STATE.flash * 0.3})`;
    ctx.fillRect(0, 0, STATE.w, STATE.h);
    ctx.strokeStyle = `rgba(255, 220, 160, ${STATE.flash})`;
    ctx.lineWidth = 3 + STATE.flash * 6;
    ctx.beginPath();
    ctx.arc(STATE.cx, STATE.cy, STATE.shock * CAM.scale0, 0, TAU);
    ctx.stroke();
}

// ===== ANIMATION LOOP =====

function animate() {
    if (STATE.isRunning) simulate(STATE.speed);
    render(STATE.isRunning ? STATE.speed : 0);

    STATE.frameCount++;
    const now = performance.now();
    if (now - STATE.lastTime >= 1000) {
        STATE.fps = STATE.frameCount;
        STATE.frameCount = 0;
        STATE.lastTime = now;
    }
    if (STATE.frameCount % 10 === 0) updateStats();

    requestAnimationFrame(animate);
}

function updateStats() {
    const particles = STATE.particles;
    const total = particles.length || 1;
    const inHorizon = STATE.pool.length;
    let inField = 0;
    let known = 0;
    let deep = 0;
    particles.forEach((p) => {
        if (!p.active) return;
        inField++;
        if (p.isKnown) known++;
        deep += p.depth;
    });

    const knownPercent = Math.round((known / Math.max(1, inField)) * 100);
    DOM.knownSpace.textContent = knownPercent + '%';
    DOM.unknownSpace.textContent = (100 - knownPercent) + '%';
    DOM.fpsCount.textContent = STATE.fps;

    let poles = 0;
    let charge = 0;
    STATE.polarityNodes.forEach((layer) => layer.forEach((n) => { poles++; charge += n.charge; }));
    DOM.polarityNodes.textContent = `${poles} · ${charge}`;
    DOM.multitarityLinks.textContent = STATE.multitarityLinks.length;
    DOM.deepIndex.textContent = Math.round(deep);

    DOM.horizonRadius.textContent = (STATE.rh / STATE.unit).toFixed(1);
    DOM.effectiveMass.textContent = STATE.effMass.toFixed(1);
    DOM.hawkingCount.textContent = STATE.hawkingTotal;

    // Conservation ledger
    DOM.fieldCount.textContent = inField;
    DOM.horizonCount.textContent = inHorizon;
    DOM.conservedTotal.textContent = (inField + inHorizon === total ? '✓ ' : '✗ ') + total;

    DOM.absorbedCount.textContent = STATE.absorbedTotal;
    DOM.bounceCount.textContent = STATE.bounces;
    DOM.infoRecovered.textContent =
        Math.min(100, Math.round((STATE.hawkingTotal / Math.max(1, STATE.absorbedTotal)) * 100)) + '%';

    DOM.knownPhase.textContent = knownPercent > 50 ? 'Revealed' : knownPercent > 15 ? 'Emerging' : 'Observable';
    DOM.unknownPhase.textContent = knownPercent > 50 ? 'Receding' : 'Latent';

    const c = STATE.criticality;
    let phase = 'Accreting';
    if (STATE.flash > 0.3) phase = 'BIG BOUNCE';
    else if (c >= 1) phase = 'Saturated';
    else if (c >= 0.85) phase = 'Critical';
    else if (c >= 0.5) phase = 'Unstable';
    else if (STATE.accretionRate > 0.4) phase = 'Feeding';
    DOM.singularityPhase.textContent = phase;
    DOM.criticalityBar.style.width = Math.round(c * 100) + '%';
}

// ===== SPECTRUM =====

function applySpectrum() {
    Object.keys(BACKGROUNDS).forEach((key) => DOM.viewport.classList.remove('bg-' + key));
    DOM.viewport.classList.add('bg-' + STATE.background);
    DOM.viewport.classList.toggle('inverted', DOM.invertColors.checked);
    DOM.viewport.classList.toggle('cinematic', DOM.cinematicToggle.checked);

    const mode = STATE.colorMode;
    DOM.spectrumKey.classList.toggle('hidden', mode === 'natural');
    DOM.spectrumBar.className = 'spectrum-bar ' + mode;
    DOM.spectrumLow.textContent = mode === 'doppler' ? 'Approaching' : 'Low energy';
    DOM.spectrumHigh.textContent = mode === 'doppler' ? 'Receding' : 'High energy';
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    SLIDERS.forEach(([id, key, format, onChange, divisor]) => {
        const slider = $(id);
        const display = $(id.replace('Slider', 'Value'));
        slider.addEventListener('input', () => {
            STATE[key] = parseFloat(slider.value) / (divisor || 1);
            display.textContent = format(STATE[key]);
            if (onChange) onChange();
        });
    });

    DOM.backgroundSelect.addEventListener('change', () => {
        STATE.background = DOM.backgroundSelect.value;
        applySpectrum();
    });
    DOM.colorModeSelect.addEventListener('change', () => {
        STATE.colorMode = DOM.colorModeSelect.value;
        applySpectrum();
    });
    DOM.invertColors.addEventListener('change', applySpectrum);
    DOM.cinematicToggle.addEventListener('change', () => { applySpectrum(); clearTrails(); });
    DOM.gridToggle.addEventListener('change', applySpectrum);

    DOM.pauseBtn.addEventListener('click', togglePause);
    DOM.resetBtn.addEventListener('click', resetUniverse);
    DOM.collapseNowBtn.addEventListener('click', triggerBounce);
    DOM.exportBtn.addEventListener('click', exportImage);
    DOM.infoBtn.addEventListener('click', () => DOM.infoModal.classList.remove('hidden'));
    document.querySelector('.modal-close').addEventListener('click', () => DOM.infoModal.classList.add('hidden'));
    DOM.infoModal.addEventListener('click', (e) => {
        if (e.target === DOM.infoModal) DOM.infoModal.classList.add('hidden');
    });
    DOM.hideUiBtn.addEventListener('click', toggleUi);
    DOM.showUiBtn.addEventListener('click', toggleUi);

    DOM.collapseBtn.addEventListener('click', () => {
        const collapsed = DOM.controlPanel.classList.toggle('collapsed');
        DOM.collapseBtn.textContent = collapsed ? '▶' : '◀';
    });

    DOM.sectionToggles.forEach((heading) => {
        heading.addEventListener('click', () => heading.parentElement.classList.toggle('closed'));
    });

    DOM.layerBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            STATE.currentLayer = parseInt(btn.dataset.layer);
            DOM.layerBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            clearTrails();
        });
    });

    // Drag to orbit the camera, scroll to zoom, double-click to reset the view
    DOM.fieldCanvas.addEventListener('pointerdown', (e) => {
        STATE.dragging = true;
        STATE.dragX = e.clientX;
        STATE.dragY = e.clientY;
        DOM.fieldCanvas.setPointerCapture(e.pointerId);
    });
    DOM.fieldCanvas.addEventListener('pointermove', (e) => {
        if (!STATE.dragging) return;
        CAM.yaw -= (e.clientX - STATE.dragX) * 0.006;
        if (DOM.cinematicToggle.checked) {
            setSlider('elevationSlider', STATE.elevation + (e.clientY - STATE.dragY) * 0.25);
        }
        STATE.dragX = e.clientX;
        STATE.dragY = e.clientY;
    });
    const endDrag = () => { STATE.dragging = false; };
    DOM.fieldCanvas.addEventListener('pointerup', endDrag);
    DOM.fieldCanvas.addEventListener('pointercancel', endDrag);
    DOM.fieldCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        setSlider('zoomSlider', STATE.zoom * (e.deltaY > 0 ? 0.92 : 1.08));
    }, { passive: false });
    DOM.fieldCanvas.addEventListener('dblclick', () => {
        CAM.yaw = 0.7;
        setSlider('elevationSlider', 16);
        setSlider('zoomSlider', 100);
    });

    document.addEventListener('keydown', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT') return;
        const key = e.key.toLowerCase();
        if (key === ' ') { e.preventDefault(); togglePause(); }
        else if (key === 'b') triggerBounce();
        else if (key === 'r') resetUniverse();
        else if (key === 'h') toggleUi();
        else if (key === 'c') toggleSwitch(DOM.cinematicToggle);
        else if (key === 'g') toggleSwitch(DOM.gridToggle);
        else if (key === 'i') toggleSwitch(DOM.invertColors);
        else if (key === 'escape') DOM.infoModal.classList.add('hidden');
    });

    window.addEventListener('resize', () => { resizeCanvases(); clearTrails(); });
}

// Set a slider programmatically, clamped to its range, and fire its handler
function setSlider(id, value) {
    const slider = $(id);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    slider.value = String(Math.max(min, Math.min(max, value)));
    slider.dispatchEvent(new Event('input'));
}

function toggleSwitch(input) {
    input.checked = !input.checked;
    input.dispatchEvent(new Event('change'));
}

function togglePause() {
    STATE.isRunning = !STATE.isRunning;
    DOM.pauseBtn.textContent = STATE.isRunning ? '⏸ Pause' : '▶ Play';
}

function resetUniverse() {
    initializeUniverse();
    STATE.isRunning = true;
    DOM.pauseBtn.textContent = '⏸ Pause';
}

function toggleUi() {
    document.body.classList.toggle('ui-hidden');
}

function exportImage() {
    const out = document.createElement('canvas');
    out.width = DOM.matterCanvas.width;
    out.height = DOM.matterCanvas.height;
    const ctx = out.getContext('2d');
    ctx.fillStyle = BACKGROUNDS[STATE.background];
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(DOM.gridCanvas, 0, 0);
    ctx.drawImage(DOM.matterCanvas, 0, 0);
    ctx.drawImage(DOM.fieldCanvas, 0, 0);

    if (DOM.invertColors.checked) {
        const img = ctx.getImageData(0, 0, out.width, out.height);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
            d[i] = 255 - d[i];
            d[i + 1] = 255 - d[i + 1];
            d[i + 2] = 255 - d[i + 2];
        }
        ctx.putImageData(img, 0, 0);
    }

    const link = document.createElement('a');
    link.href = out.toDataURL('image/png');
    link.download = `guu-2-singularity-${Date.now()}.png`;
    link.click();
}

// ===== STARTUP =====

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
