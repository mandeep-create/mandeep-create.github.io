/*! OI.IO · Single Black Hole Singularity Mechanism
   © 2026 Mandeep S. Bhullar · SpinalXeno™. All rights reserved. SpinalXeno™ is a trademark of Mandeep S. Bhullar.
   Unauthorized copying, modification or redistribution of this code is prohibited.
   Digitally signed by SpinalXeno, signing key fingerprint (SHA-256) 25666eb2cf27368640bb41154733bfdc1f8a07b194aec7661659fc7b565155b3 */

// ===== OI.IO · PALETTE =====

const TAU = Math.PI * 2;

// Scale shells: each scale orbits at its own distance (fraction of the view
// radius) and thickness. Known matter burns ice-blue, Unknown hot pink.
const SCALES = [
    { name: 'Planck',  shell: [0.26, 0.44], thick: 0.04, size: 0.9, known: [255, 255, 255], unknown: [255, 110, 199] },
    { name: 'Quantum', shell: [0.36, 0.60], thick: 0.07, size: 1.1, known: [170, 252, 255], unknown: [255, 62, 165] },
    { name: 'Atomic',  shell: [0.52, 0.78], thick: 0.11, size: 1.3, known: [77, 232, 255],  unknown: [232, 40, 127] },
    { name: 'Cosmic',  shell: [0.70, 1.00], thick: 0.18, size: 1.6, known: [111, 155, 255], unknown: [200, 40, 120] },
    { name: 'Meta',    shell: [0.92, 1.30], thick: 0.40, size: 1.9, known: [194, 139, 255], unknown: [255, 90, 213] }
];

const NEON = {
    gravity: [166, 255, 0],
    magnetic: [0, 225, 255],
    toroidal: [255, 0, 230],
    jet: [154, 216, 255],
    jetMid: [138, 107, 255],
    spark: [255, 209, 255],
    link: [217, 194, 255],
    hawking: [255, 246, 168],
    plus: [255, 46, 46],
    minus: [46, 123, 255]
};

// Iridescent disk: white-hot → cyan → azure → violet → magenta
const DISK_STOPS = [
    [0.00, [255, 255, 255]],
    [0.18, [140, 250, 255]],
    [0.45, [60, 140, 255]],
    [0.72, [170, 70, 255]],
    [1.00, [255, 50, 170]]
];

// Backgrounds: [centre, middle, edge] of the radial gradient
const BACKGROUNDS = {
    abyss: ['#170a3d', '#070320', '#010007'],
    black: ['#000000', '#000000', '#000000'],
    ultraviolet: ['#2e0a5c', '#12032e', '#050010'],
    royal: ['#2a1060', '#140838', '#06021a'],
    ocean: ['#002a44', '#00111c', '#000308'],
    teal: ['#003a3d', '#001a1f', '#00080a'],
    aurora: ['#00332a', '#001410', '#000403'],
    ember: ['#3a0c00', '#140400', '#040000'],
    crimson: ['#3d0016', '#18000a', '#060003'],
    rose: ['#4a1d3a', '#22101e', '#0b050a'],
    slate: ['#2a2f3a', '#151820', '#07080c'],
    white: ['#ffffff', '#f5f3ff', '#e6e1f5'],
    cream: ['#fffdf5', '#f6efdc', '#e8dcc0']
};

// Image filters applied over the whole viewport (gamma is added separately)
const FILTERS = {
    none: '',
    invert: 'invert(1)',
    invertHue: 'invert(1) hue-rotate(180deg)',
    xray: 'invert(1) grayscale(1) contrast(1.35)',
    infrared: 'sepia(1) saturate(4.5) hue-rotate(-25deg) contrast(1.1)',
    night: 'grayscale(1) sepia(1) hue-rotate(65deg) saturate(5) brightness(1.15)',
    uv: 'hue-rotate(215deg) saturate(1.8)',
    vivid: 'saturate(2.2) contrast(1.15)',
    mono: 'grayscale(1) contrast(1.15)',
    sepia: 'sepia(0.85) contrast(1.05)'
};

// Themes recolor the whole mechanism: matter, disk, fields, jets, grid and panels
const THEMES = {
    plasma: {
        known: [[255, 255, 255], [170, 252, 255], [77, 232, 255], [111, 155, 255], [194, 139, 255]],
        unknown: [[255, 110, 199], [255, 62, 165], [232, 40, 127], [200, 40, 120], [255, 90, 213]],
        disk: [[0, [255, 255, 255]], [0.18, [140, 250, 255]], [0.45, [60, 140, 255]], [0.72, [170, 70, 255]], [1, [255, 50, 170]]],
        gravity: [166, 255, 0], magnetic: [0, 225, 255], toroidal: [255, 0, 230],
        hawking: [255, 246, 168], jetMid: [138, 107, 255], link: [217, 194, 255],
        ui: ['#8cfaff', '#ff3ea5', '#a46bff']
    },
    solar: {
        known: [[255, 255, 240], [255, 240, 170], [255, 210, 90], [255, 170, 60], [255, 130, 60]],
        unknown: [[200, 60, 255], [160, 50, 230], [130, 40, 210], [100, 40, 190], [180, 70, 255]],
        disk: [[0, [255, 255, 255]], [0.2, [255, 245, 170]], [0.45, [255, 180, 60]], [0.72, [255, 90, 30]], [1, [200, 20, 60]]],
        gravity: [0, 255, 170], magnetic: [80, 170, 255], toroidal: [255, 60, 120],
        hawking: [180, 240, 255], jetMid: [255, 150, 60], link: [255, 220, 180],
        ui: ['#ffd36b', '#ff5a3c', '#ff9a3c']
    },
    emerald: {
        known: [[240, 255, 245], [170, 255, 210], [80, 255, 170], [40, 220, 160], [60, 200, 255]],
        unknown: [[190, 90, 255], [160, 70, 240], [130, 60, 220], [110, 50, 200], [200, 110, 255]],
        disk: [[0, [255, 255, 255]], [0.2, [190, 255, 160]], [0.45, [60, 230, 140]], [0.72, [0, 170, 200]], [1, [40, 60, 200]]],
        gravity: [255, 230, 0], magnetic: [0, 255, 255], toroidal: [255, 60, 200],
        hawking: [255, 250, 190], jetMid: [60, 230, 140], link: [200, 255, 220],
        ui: ['#7dffb2', '#c06bff', '#3fd6c0']
    },
    infrared: {
        known: [[255, 255, 255], [255, 255, 150], [255, 220, 60], [255, 160, 40], [255, 110, 40]],
        unknown: [[150, 0, 40], [180, 0, 60], [120, 0, 80], [90, 0, 90], [200, 30, 70]],
        disk: [[0, [255, 255, 255]], [0.2, [255, 255, 120]], [0.45, [255, 170, 0]], [0.72, [230, 40, 0]], [1, [90, 0, 60]]],
        gravity: [255, 240, 120], magnetic: [255, 90, 0], toroidal: [255, 0, 90],
        hawking: [255, 255, 255], jetMid: [255, 120, 0], link: [255, 200, 150],
        ui: ['#ffd84a', '#ff3b1f', '#ff8a00']
    },
    synthwave: {
        known: [[255, 255, 255], [140, 240, 255], [60, 200, 255], [90, 120, 255], [170, 100, 255]],
        unknown: [[255, 140, 60], [255, 100, 80], [255, 70, 120], [230, 50, 150], [255, 170, 80]],
        disk: [[0, [255, 255, 255]], [0.2, [255, 190, 240]], [0.45, [255, 60, 180]], [0.72, [140, 60, 255]], [1, [40, 80, 255]]],
        gravity: [255, 220, 60], magnetic: [0, 240, 255], toroidal: [255, 60, 200],
        hawking: [255, 255, 200], jetMid: [255, 60, 180], link: [255, 200, 240],
        ui: ['#4ff0ff', '#ff5ec4', '#ffb347']
    },
    glacial: {
        known: [[255, 255, 255], [220, 240, 255], [190, 225, 255], [160, 205, 255], [200, 215, 255]],
        unknown: [[90, 120, 190], [80, 110, 180], [70, 100, 170], [60, 90, 160], [110, 140, 210]],
        disk: [[0, [255, 255, 255]], [0.2, [220, 240, 255]], [0.45, [150, 200, 255]], [0.72, [80, 130, 220]], [1, [40, 60, 140]]],
        gravity: [200, 230, 255], magnetic: [120, 210, 255], toroidal: [170, 180, 255],
        hawking: [255, 255, 255], jetMid: [150, 200, 255], link: [210, 225, 255],
        ui: ['#cfe8ff', '#7fb2ff', '#9aa8ff']
    },
    aurora: {
        known: [[235, 255, 250], [150, 255, 220], [60, 255, 180], [0, 230, 200], [0, 200, 255]],
        unknown: [[255, 80, 200], [220, 60, 220], [180, 60, 255], [140, 60, 255], [255, 120, 220]],
        disk: [[0, [255, 255, 255]], [0.2, [180, 255, 220]], [0.45, [0, 255, 170]], [0.72, [0, 180, 255]], [1, [150, 60, 255]]],
        gravity: [255, 255, 120], magnetic: [0, 255, 200], toroidal: [255, 80, 220],
        hawking: [255, 250, 200], jetMid: [0, 200, 255], link: [200, 255, 240],
        ui: ['#5dffc8', '#ff63d8', '#6aa8ff']
    }
};
const THEME_ORDER = Object.keys(THEMES);

// Set by applyTheme
let THEME_HALO = [[140, 250, 255], [255, 50, 170]];
let GRID_COLORS = [[110, 120, 255], [170, 80, 255], [255, 40, 200], [255, 200, 245]];

const FOCUS_LABELS = {
    whole: 'Whole System', core: 'Singularity Core', photon: 'Photon Ring', disk: 'Accretion Disk',
    toroidal: 'Toroidal Field', jetN: 'North Quasar Jet', jetS: 'South Quasar Jet',
    shell0: 'Planck Shell', shell1: 'Quantum Shell', shell2: 'Atomic Shell', shell3: 'Cosmic Shell', shell4: 'Meta Shell',
    pole: 'Polarity Pole', particle: 'Particle', hawking: 'Hawking Emission'
};
const FOCUS_ORDER = Object.keys(FOCUS_LABELS);

const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function mixRgb(a, b, t) {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
    ];
}

function diskColor(f) {
    f = clamp(f, 0, 1);
    for (let i = 1; i < DISK_STOPS.length; i++) {
        if (f <= DISK_STOPS[i][0]) {
            const [f0, c0] = DISK_STOPS[i - 1];
            const [f1, c1] = DISK_STOPS[i];
            return mixRgb(c0, c1, (f - f0) / (f1 - f0));
        }
    }
    return DISK_STOPS[DISK_STOPS.length - 1][1];
}

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// ===== THEORY =====

const THEORY = {
    // Effective mass: core mass plus every particle held inside the horizon
    effectiveMass: (core, contained, m) => core + contained * m,

    schwarzschild: (mass) => 8 + mass * 0.9,

    // Kerr outer horizon: r₊ = ½ r_s (1 + √(1 − a²)), so spin shrinks the horizon
    kerrHorizon: (rs, a) => 0.5 * rs * (1 + Math.sqrt(1 - a * a)),

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

// ===== STATE =====

const STATE = {
    particles: [],
    pool: [],                       // particles held inside the horizon
    polarityNodes: [[], [], [], [], []],
    multitarityLinks: [],
    knots: [],
    sparks: [],
    ripples: [],
    stars: [],
    nebulae: [],

    currentLayer: 5,

    // Singularity
    mass: 30,
    spin: 0.6,                      // signed: + anticlockwise, − clockwise (seen from above)
    hawking: 30,
    bounceThreshold: 40,
    particleMass: 0.05,
    viscosity: 30,
    lensing: 60,

    // Fields & quasar
    fieldIntensity: 100,
    blinkRate: 50,
    fieldDensity: 2,
    jetPower: 100,

    // Color & spectrum
    theme: 'plasma',
    background: 'abyss',
    customBg: '#1a0b3d',
    lightBg: false,
    filter: 'none',
    gamma: 1,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueShift: 0,
    colorMode: 'natural',

    // Theory
    knownRatio: 0.05,
    infinityParam: 1000,
    dimensionality: 4,
    polarityStrength: 2,
    multitarityDensity: 50,
    decoherence: 30,

    // Visualization & camera
    speed: 1,
    particleCount: 1400,
    connectionRange: 200,
    unknownAlpha: 60,
    trails: 75,
    elevation: 14,
    orbitSpeed: 15,
    zoom: 1,

    // Focus
    focus: 'whole',
    follow: null,                   // { obj, gen } while following a pole or particle
    awaitHawking: false,

    // Geometry
    w: 0, h: 0, dpr: 1,
    cx: 0, cy: 0,
    radius: 0, unit: 1,

    // Singularity dynamics
    dir: -1,                        // world orbit direction (−1 shows anticlockwise from above)
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
    shake: 0,
    twist: 0,
    fieldPhase: 0,
    fieldFlash: 0,
    time: 0,

    fps: 60,
    frameCount: 0,
    lastTime: performance.now(),
    isRunning: true,
    dragging: false
};

// ===== CAMERA =====

const CAM = {
    yaw: 0.7,
    pitch: 0,
    zoom: 1,
    f: 1,
    tx: 0, ty: 0, tz: 0,            // look-at target
    px: 0, py: 0, pz: 0,            // position
    rx: 1, ry: 0, rz: 0,            // right
    ux: 0, uy: 1, uz: 0,            // up
    fx: 0, fy: 0, fz: -1,           // forward
    moving: 0
};

const P = { x: 0, y: 0, s: 1, z: 0 };      // reusable projection result
const SING = { x: 0, y: 0, s: 1, z: 1, ok: false };

function project(x, y, z, out) {
    const dx = x - CAM.px;
    const dy = y - CAM.py;
    const dz = z - CAM.pz;
    const zc = dx * CAM.fx + dy * CAM.fy + dz * CAM.fz;
    if (zc < 2) return false;
    const s = CAM.f / zc;
    out.x = STATE.cx + (dx * CAM.rx + dy * CAM.ry + dz * CAM.rz) * s;
    out.y = STATE.cy - (dx * CAM.ux + dy * CAM.uy + dz * CAM.uz) * s;
    out.s = s;
    out.z = zc;
    return true;
}

function updateCamera(step) {
    const cinematic = DOM.cinematicToggle.checked;
    if (cinematic && !STATE.dragging) CAM.yaw += STATE.orbitSpeed * 0.00006 * step;
    CAM.pitch = cinematic ? STATE.elevation * Math.PI / 180 : 1.5533;

    // Glide toward the focus target and zoom
    const goal = focusGoal();
    const gx = goal[0] - CAM.tx;
    const gy = goal[1] - CAM.ty;
    const gz = goal[2] - CAM.tz;
    const k = STATE.follow ? 0.18 : 0.08;
    CAM.tx += gx * k;
    CAM.ty += gy * k;
    CAM.tz += gz * k;
    const prevZoom = CAM.zoom;
    CAM.zoom += (STATE.zoom - CAM.zoom) * 0.1;
    CAM.moving = Math.hypot(gx, gy, gz) * k / STATE.radius + Math.abs(CAM.zoom - prevZoom) / CAM.zoom;

    CAM.f = STATE.radius * 2.4;
    const dist = CAM.f / CAM.zoom;
    const cp = Math.cos(CAM.pitch);
    let px = CAM.tx + dist * cp * Math.sin(CAM.yaw);
    let py = CAM.ty + dist * Math.sin(CAM.pitch);
    let pz = CAM.tz + dist * cp * Math.cos(CAM.yaw);

    // Never fly through the event horizon
    const d0 = Math.hypot(px, py, pz);
    const minD = STATE.rh * 1.8;
    if (d0 < minD) {
        const s = minD / (d0 || 1);
        px *= s;
        py *= s;
        pz *= s;
    }
    CAM.px = px;
    CAM.py = py;
    CAM.pz = pz;

    let fx = CAM.tx - px;
    let fy = CAM.ty - py;
    let fz = CAM.tz - pz;
    const fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl;
    fy /= fl;
    fz /= fl;
    CAM.fx = fx;
    CAM.fy = fy;
    CAM.fz = fz;

    // right = forward × worldUp, up = right × forward
    const rl = Math.hypot(fz, fx);
    if (rl > 1e-4) {
        CAM.rx = -fz / rl;
        CAM.ry = 0;
        CAM.rz = fx / rl;
    }
    CAM.ux = CAM.ry * fz - CAM.rz * fy;
    CAM.uy = CAM.rz * fx - CAM.rx * fz;
    CAM.uz = CAM.rx * fy - CAM.ry * fx;

    // Cinematic shake after a bounce
    STATE.cx = STATE.w * 0.5 + (Math.random() - 0.5) * STATE.shake * 10;
    STATE.cy = STATE.h * 0.53 + (Math.random() - 0.5) * STATE.shake * 10;

    SING.ok = project(0, 0, 0, SING);
}

// ===== SPRITES =====
// Pre-rendered glows so each particle is one drawImage.

const SPRITES = { known: [], unknown: [], energy: [], doppler: [], hot: null, hawking: null, white: null };
const SPECTRUM_STEPS = 48;

function makeSprite(rgb) {
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 48;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.13, rgba(rgb, 1));
    grad.addColorStop(0.38, rgba(rgb, 0.3));
    grad.addColorStop(1, rgba(rgb, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, 48, 48);
    return c;
}

function buildSprites() {
    SCALES.forEach((s, i) => {
        SPRITES.known[i] = makeSprite(s.known);
        SPRITES.unknown[i] = makeSprite(s.unknown);
    });
    for (let i = 0; i <= SPECTRUM_STEPS; i++) {
        const t = i / SPECTRUM_STEPS;
        SPRITES.energy.push(makeSprite(hslToRgb(t * 275, 100, 60)));
        const d = t * 2 - 1;  // −1 approaching (blue) … +1 receding (red)
        SPRITES.doppler.push(makeSprite(d < 0
            ? mixRgb([235, 240, 255], [40, 110, 255], -d)
            : mixRgb([255, 240, 235], [255, 40, 30], d)));
    }
    SPRITES.hot = makeSprite([230, 255, 255]);
    SPRITES.hawking = makeSprite(NEON.hawking);
    SPRITES.white = makeSprite([255, 255, 255]);
}

// ===== POLARITY NODE CLASS =====

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
        this.angle += STATE.dir * Math.sqrt(STATE.GM / (r * r * r)) * 0.6 * step;
        this.phase += this.frequency * step;
        this.x = Math.cos(this.angle) * r;
        this.y = this.lift * r;
        this.z = Math.sin(this.angle) * r;
        this.radius = (14 + this.strength * 14 + Math.sin(this.phase) * 5) * STATE.unit;
        this.reach2 = Math.pow(this.radius * 4, 2);
    }

    draw(ctx, alpha) {
        if (!project(this.x, this.y, this.z, P)) return;
        const rgb = this.charge > 0 ? NEON.plus : NEON.minus;
        const radius = Math.min(400, this.radius * P.s);
        const sx = P.x;
        const sy = P.y;

        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        g.addColorStop(0, rgba(rgb, 0.5 * alpha));
        g.addColorStop(0.35, rgba(rgb, 0.16 * alpha));
        g.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, TAU);
        ctx.fill();

        // Spinning field ring in the orbital plane
        const ringR = this.radius * 0.55;
        ctx.strokeStyle = rgba(rgb, 0.85 * alpha);
        ctx.lineWidth = 0.7;
        ctx.setLineDash([3, 4]);
        ctx.lineDashOffset = -STATE.time * 0.4 * this.charge;
        ctx.beginPath();
        for (let j = 0; j <= 28; j++) {
            const th = (j / 28) * TAU + this.phase;
            if (!project(this.x + Math.cos(th) * ringR, this.y, this.z + Math.sin(th) * ringR, P)) continue;
            if (j === 0) ctx.moveTo(P.x, P.y);
            else ctx.lineTo(P.x, P.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        const core = clamp(6 * Math.sqrt(radius / 20), 4, 40);
        ctx.globalAlpha = alpha;
        ctx.drawImage(SPRITES.white, sx - core / 2, sy - core / 2, core, core);
        ctx.globalAlpha = 1;
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
        const opacity = life * pulse * this.strength * 0.5;
        if (opacity < 0.01) return;

        if (!project(this.a.x, this.a.y, this.a.z, P)) return;
        const ax = P.x;
        const ay = P.y;
        if (!project(this.b.x, this.b.y, this.b.z, P)) return;

        // Gravitational lensing bends each link toward the singularity
        const mx = (ax + P.x) / 2;
        const my = (ay + P.y) / 2;
        const tx = SING.x - mx;
        const ty = SING.y - my;
        const dm = Math.hypot(tx, ty) + 1;
        const bend = Math.min(0.7, (STATE.lensing / 100) * (hs * 3) / dm);

        ctx.strokeStyle = rgba(NEON.link, opacity);
        ctx.lineWidth = 0.5 + pulse * 0.4;
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

    // Place the particle in its scale shell on a near-circular orbit that follows the spin
    respawn() {
        const scale = SCALES[this.layer];
        const r = STATE.radius * (scale.shell[0] + Math.random() * (scale.shell[1] - scale.shell[0]));
        const angle = Math.random() * TAU;
        const v = STATE.dir * Math.sqrt(STATE.GM / r) * (0.85 + Math.random() * 0.2);
        const lift = (Math.random() + Math.random() - 1) * scale.thick;

        this.x = Math.cos(angle) * r;
        this.y = lift * r;
        this.z = Math.sin(angle) * r;
        this.vx = -Math.sin(angle) * v + (Math.random() - 0.5) * 0.3 * STATE.unit;
        this.vy = (Math.random() - 0.5) * Math.abs(v) * scale.thick;
        this.vz = Math.cos(angle) * v + (Math.random() - 0.5) * 0.3 * STATE.unit;
        this.depth = 0;
        this.heat = 0;
        this.hawking = 0;
        this.gen++;
    }

    // Launch from the horizon along a random direction (Hawking emission)
    launch(speedFactor) {
        const u = Math.random() * 2 - 1;
        const phi = Math.random() * TAU;
        const s = Math.sqrt(1 - u * u);
        const nx = s * Math.cos(phi);
        const ny = u;
        const nz = s * Math.sin(phi);
        const r = STATE.rh * 1.08;
        const v = Math.sqrt((2 * STATE.GM) / r) * speedFactor;
        const swirl = 0.3 * Math.abs(STATE.spin) * STATE.dir;

        this.x = nx * r;
        this.y = ny * r;
        this.z = nz * r;
        this.vx = nx * v - nz * v * swirl;
        this.vy = ny * v;
        this.vz = nz * v + nx * v * swirl;
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

        // Frame dragging inside the ergosphere: matter co-rotates with the spin
        const a = Math.abs(STATE.spin);
        const ergo = STATE.rs * (2 + a * 2);
        if (r < ergo) {
            const rxz = Math.hypot(this.x, this.z) || 0.001;
            const tx = STATE.dir * -this.z / rxz;
            const tz = STATE.dir * this.x / rxz;
            const vt = this.vx * tx + this.vz * tz;
            const kd = 0.03 * (1 - r / ergo) * h;
            const dv = (a * Math.sqrt(STATE.GM / r) - vt) * kd;
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

        // Decoherence: cold, distant matter drifts back toward the background ratio
        const deco = STATE.decoherence * 0.00012 * h;
        if (this.isKnown && this.heat < 0.25 && !this.hawking && Math.random() < deco * (1 - STATE.knownRatio)) {
            this.isKnown = false;
        } else if (!this.isKnown && Math.random() < deco * STATE.knownRatio) {
            this.isKnown = true;
        }

        this.depth += h * 0.001 * Math.log(STATE.infinityParam) * (STATE.rh / r);
        if (this.hawking > 0) this.hawking = Math.max(0, this.hawking - 0.02 * h);
        return null;
    }
}

// ===== DOM =====

const $ = (id) => document.getElementById(id);

const DOM = {
    viewport: $('viewport'),
    gridCanvas: $('gridCanvas'),
    matterCanvas: $('matterCanvas'),
    fieldCanvas: $('fieldCanvas'),
    bloomCanvas: $('bloomCanvas'),
    gridCtx: null,
    matterCtx: null,
    fieldCtx: null,
    bloomCtx: null,

    cinematicToggle: $('cinematicToggle'),
    gridToggle: $('gridToggle'),
    gravityToggle: $('gravityToggle'),
    magneticToggle: $('magneticToggle'),
    toroidalToggle: $('toroidalToggle'),
    bloomToggle: $('bloomToggle'),

    focusSelect: $('focusSelect'),
    themeSelect: $('themeSelect'),
    backgroundSelect: $('backgroundSelect'),
    customBgInput: $('customBgInput'),
    customBgValue: $('customBgValue'),
    filterSelect: $('filterSelect'),
    colorModeSelect: $('colorModeSelect'),
    resetColorsBtn: $('resetColorsBtn'),
    gammaFuncs: [$('gammaR'), $('gammaG'), $('gammaB')],
    showStars: $('showStars'),

    showKnown: $('showKnown'),
    showUnknown: $('showUnknown'),
    showPolarity: $('showPolarity'),
    showMultitarity: $('showMultitarity'),
    showDisk: $('showDisk'),
    showJets: $('showJets'),
    showRings: $('showRings'),
    enableBounce: $('enableBounce'),

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

    spinDisplay: $('spinDisplay'),
    twistDisplay: $('twistDisplay'),
    zoomDisplay: $('zoomDisplay'),
    horizonRadius: $('horizonRadius'),
    effectiveMass: $('effectiveMass'),
    jetDisplay: $('jetDisplay'),
    fieldCount: $('fieldCount'),
    horizonCount: $('horizonCount'),
    conservedTotal: $('conservedTotal'),
    knownSpace: $('knownSpace'),
    unknownSpace: $('unknownSpace'),
    infoRecovered: $('infoRecovered'),
    absorbedCount: $('absorbedCount'),
    hawkingCount: $('hawkingCount'),
    bounceCount: $('bounceCount'),
    polarityNodes: $('polarityNodes'),
    multitarityLinks: $('multitarityLinks'),
    fpsCount: $('fpsCount'),

    focusPhase: $('focusPhase'),
    knownPhase: $('knownPhase'),
    singularityPhase: $('singularityPhase'),
    criticalityBar: $('criticalityBar'),

    spectrumKey: $('spectrumKey'),
    spectrumBar: $('spectrumBar'),
    spectrumLow: $('spectrumLow'),
    spectrumHigh: $('spectrumHigh'),

    infoModal: $('infoModal'),
    controlPanel: document.querySelector('.control-panel')
};

// Zoom slider is logarithmic: 0 → 0.25×, 100 → 40×
const ZOOM_MIN = 0.25;
const ZOOM_SPAN = 160;
const zoomFromSlider = (v) => ZOOM_MIN * Math.pow(ZOOM_SPAN, v / 100);
const sliderFromZoom = (z) => 100 * Math.log(z / ZOOM_MIN) / Math.log(ZOOM_SPAN);
const formatZoom = (z) => (z < 10 ? z.toFixed(1) : z.toFixed(0)) + '×';
const formatSpin = (v) => (v >= 0 ? '⟲ ' : '⟳ ') + Math.abs(v).toFixed(2);

// Every slider: [element id, state key, display formatter, side effect, value transform]
const SLIDERS = [
    ['massSlider', 'mass', (v) => v.toFixed(0)],
    ['spinSlider', 'spin', formatSpin],
    ['hawkingSlider', 'hawking', (v) => v + '%'],
    ['bounceSlider', 'bounceThreshold', (v) => v + '%'],
    ['particleMassSlider', 'particleMass', (v) => v.toFixed(2)],
    ['viscositySlider', 'viscosity', (v) => v + '%'],
    ['lensingSlider', 'lensing', (v) => v + '%'],
    ['gammaSlider', 'gamma', (v) => v.toFixed(2), applyColorFilters],
    ['brightnessSlider', 'brightness', (v) => v + '%', applyColorFilters],
    ['contrastSlider', 'contrast', (v) => v + '%', applyColorFilters],
    ['saturationSlider', 'saturation', (v) => v + '%', applyColorFilters],
    ['hueSlider', 'hueShift', (v) => v + '°', applyColorFilters],
    ['zoomSlider', 'zoom', formatZoom, null, zoomFromSlider],
    ['elevationSlider', 'elevation', (v) => v.toFixed(0) + '°'],
    ['orbitSlider', 'orbitSpeed', (v) => v + '%'],
    ['fieldIntensitySlider', 'fieldIntensity', (v) => v + '%'],
    ['blinkSlider', 'blinkRate', (v) => v + '%'],
    ['fieldDensitySlider', 'fieldDensity', (v) => v.toFixed(0)],
    ['jetPowerSlider', 'jetPower', (v) => v + '%'],
    ['knownRatioSlider', 'knownRatio', (v) => Math.round(v * 100) + '%', reassignKnown, (v) => v / 100],
    ['infinitySlider', 'infinityParam', (v) => v.toFixed(0)],
    ['dimensionalitySlider', 'dimensionality', (v) => v + 'D', buildPolarityNodes],
    ['polaritySlider', 'polarityStrength', (v) => v.toFixed(1), buildPolarityNodes],
    ['multitaritySlider', 'multitarityDensity', (v) => v + '%'],
    ['decoherenceSlider', 'decoherence', (v) => v + '%'],
    ['speedSlider', 'speed', (v) => v.toFixed(1) + 'x'],
    ['particleSlider', 'particleCount', (v) => v.toFixed(0), syncParticleCount],
    ['connectionSlider', 'connectionRange', (v) => v + 'px'],
    ['unknownAlphaSlider', 'unknownAlpha', (v) => v + '%'],
    ['trailSlider', 'trails', (v) => v + '%']
];

// ===== INITIALIZATION =====

function init() {
    DOM.gridCtx = DOM.gridCanvas.getContext('2d');
    DOM.matterCtx = DOM.matterCanvas.getContext('2d');
    DOM.fieldCtx = DOM.fieldCanvas.getContext('2d');
    DOM.bloomCtx = DOM.bloomCanvas.getContext('2d');

    buildSprites();
    applyTheme(STATE.theme);
    resizeCanvases();
    buildSky();
    setupEventListeners();
    initializeUniverse();
    applyLook();

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
    DOM.bloomCanvas.width = Math.max(1, Math.floor(STATE.w / 3));
    DOM.bloomCanvas.height = Math.max(1, Math.floor(STATE.h / 3));

    STATE.cx = STATE.w * 0.5;
    STATE.cy = STATE.h * 0.53;
    STATE.radius = Math.min(STATE.w, STATE.h) * 0.5;
    STATE.unit = STATE.radius / 400;
    updateSingularity();
}

function updateSingularity() {
    const total = STATE.particles.length || 1;
    const a = Math.abs(STATE.spin);
    STATE.dir = STATE.spin >= 0 ? -1 : 1;
    STATE.criticality = Math.min(1, STATE.pool.length / (total * STATE.bounceThreshold / 100));
    STATE.effMass = THEORY.effectiveMass(STATE.mass, STATE.pool.length, STATE.particleMass);
    STATE.rs = Math.min(STATE.radius * 0.3, THEORY.schwarzschild(STATE.effMass) * STATE.unit);
    STATE.rh = THEORY.kerrHorizon(STATE.rs, a);
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
    STATE.shake = 0;
    STATE.twist = 0;
    STATE.fieldFlash = 0;
    STATE.time = 0;
    STATE.accretionRate = 0;
    STATE.multitarityLinks = [];
    STATE.knots = [];
    STATE.sparks = [];
    STATE.ripples = [];
    STATE.follow = null;

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

// Distant stars and nebulae on a far celestial sphere
function buildSky() {
    const starColors = [[255, 255, 255], [180, 210, 255], [255, 200, 240], [255, 232, 190], [170, 255, 240]];
    STATE.stars = [];
    for (let i = 0; i < 900; i++) {
        const u = Math.random() * 2 - 1;
        const phi = Math.random() * TAU;
        const s = Math.sqrt(1 - u * u);
        STATE.stars.push({
            x: s * Math.cos(phi), y: u, z: s * Math.sin(phi),
            size: 0.4 + Math.pow(Math.random(), 3) * 1.6,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            twinkle: Math.random() * TAU,
            rate: 0.01 + Math.random() * 0.04
        });
    }
    const nebulaColors = [[255, 0, 170], [0, 200, 255], [140, 60, 255], [0, 255, 190], [255, 80, 60], [90, 40, 255], [255, 0, 120]];
    STATE.nebulae = nebulaColors.map((color) => {
        const u = (Math.random() * 2 - 1) * 0.7;
        const phi = Math.random() * TAU;
        const s = Math.sqrt(1 - u * u);
        return { x: s * Math.cos(phi), y: u, z: s * Math.sin(phi), color, size: 0.22 + Math.random() * 0.3 };
    });
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
    if (STATE.follow && STATE.follow.obj instanceof PolarityNode) setFocus('core');
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

// ===== FOCUS =====

function jetStrength() {
    return Math.min(1.2, 0.12 + STATE.accretionRate * 0.75) * STATE.jetPower / 100;
}

function jetLength() {
    return STATE.rh * (14 + 30 * Math.min(1, jetStrength()));
}

function focusGoal() {
    const follow = STATE.follow;
    if (follow) {
        const obj = follow.obj;
        if (follow.gen !== null && (obj.gen !== follow.gen || !obj.active)) {
            setFocus('core');   // the followed particle fell in or was re-emitted
            return [0, 0, 0];
        }
        return [obj.x, obj.y, obj.z];
    }
    if (STATE.focus === 'jetN') return [0, jetLength() * 0.5, 0];
    if (STATE.focus === 'jetS') return [0, -jetLength() * 0.5, 0];
    return [0, 0, 0];
}

function setFocus(name, obj) {
    STATE.focus = name;
    STATE.follow = null;
    STATE.awaitHawking = false;
    let zoom = STATE.zoom;

    if (name === 'whole') zoom = 1;
    else if (name === 'core') zoom = 0.2 * STATE.radius / STATE.rh;
    else if (name === 'photon') zoom = 0.32 * STATE.radius / STATE.rh;
    else if (name === 'disk') zoom = 0.45 * STATE.radius / (STATE.rs * 4.8);
    else if (name === 'toroidal') zoom = 0.42 * STATE.radius / (STATE.rs * 5.2);
    else if (name === 'jetN' || name === 'jetS') zoom = 0.55 * STATE.radius / (jetLength() * 0.55);
    else if (name.indexOf('shell') === 0) zoom = 0.95 / SCALES[parseInt(name.slice(5))].shell[1];
    else if (name === 'pole') {
        const target = obj || nearestPole();
        if (target) STATE.follow = { obj: target, gen: null };
        zoom = 7;
    } else if (name === 'particle') {
        const target = obj || randomActiveParticle();
        if (target) STATE.follow = { obj: target, gen: target.gen };
        zoom = 9;
    } else if (name === 'hawking') {
        STATE.awaitHawking = true;
        zoom = Math.max(zoom, 3);
    }

    setZoom(zoom);
    DOM.focusSelect.value = name;
    DOM.focusPhase.textContent = STATE.awaitHawking ? 'Waiting for Hawking…' : FOCUS_LABELS[name];
}

function nearestPole() {
    let best = null;
    let bestD = Infinity;
    STATE.polarityNodes.forEach((layer) => layer.forEach((n) => {
        const d = Math.hypot(n.x - CAM.px, n.y - CAM.py, n.z - CAM.pz);
        if (d < bestD) { bestD = d; best = n; }
    }));
    return best;
}

function randomActiveParticle() {
    const active = STATE.particles.filter((p) => p.active && p.isKnown);
    const list = active.length ? active : STATE.particles.filter((p) => p.active);
    return list[Math.floor(Math.random() * list.length)] || null;
}

// Click picking: the nearest pole, particle, jet or the black hole under the pointer
function pickAt(x, y) {
    // A click on the shadow itself always dives to the core
    const hs = SING.ok ? STATE.rh * SING.s : 0;
    if (SING.ok && Math.hypot(SING.x - x, SING.y - y) < hs * 1.05) { setFocus('core'); return; }

    let best = null;
    let bestD = 18 * 18;

    STATE.polarityNodes.forEach((layer, idx) => {
        if (!isLayerVisible(idx)) return;
        layer.forEach((n) => {
            if (!project(n.x, n.y, n.z, P)) return;
            const d = (P.x - x) ** 2 + (P.y - y) ** 2;
            if (d < bestD) { bestD = d; best = ['pole', n]; }
        });
    });

    STATE.particles.forEach((p) => {
        if (!p.active || !isLayerVisible(p.layer) || !project(p.x, p.y, p.z, P)) return;
        const d = (P.x - x) ** 2 + (P.y - y) ** 2;
        if (d < bestD * 0.6) { bestD = d; best = ['particle', p]; }
    });

    if (best) { setFocus(best[0], best[1]); return; }

    if (SING.ok && Math.hypot(SING.x - x, SING.y - y) < hs * 1.4) { setFocus('core'); return; }

    if (DOM.showJets.checked) {
        [['jetN', 1], ['jetS', -1]].forEach(([name, dir]) => {
            if (best || !project(0, dir * STATE.rh, 0, P)) return;
            const bx = P.x;
            const by = P.y;
            if (!project(0, dir * jetLength(), 0, P)) return;
            const vx = P.x - bx;
            const vy = P.y - by;
            const t = clamp(((x - bx) * vx + (y - by) * vy) / (vx * vx + vy * vy || 1), 0, 1);
            if (Math.hypot(bx + vx * t - x, by + vy * t - y) < 10) { best = name; setFocus(name); }
        });
    }
}

// ===== SINGULARITY EVENTS (all conserve matter) =====

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

        if (STATE.awaitHawking) {
            STATE.awaitHawking = false;
            STATE.follow = { obj: p, gen: p.gen };
            setZoom(8);
            DOM.focusPhase.textContent = FOCUS_LABELS.hawking;
        }
    }
}

// The bounce releases everything the horizon held, reconnects the magnetic
// field and sends gravitational waves across spacetime
function triggerBounce() {
    STATE.bounces++;
    STATE.flash = 1;
    STATE.shake = 1;
    STATE.shock = STATE.rh;
    STATE.twist = 0;
    STATE.fieldFlash = 1;
    STATE.ripples.push({ age: 0, amp: STATE.radius * 0.07 });

    const released = STATE.pool;
    STATE.pool = [];
    updateSingularity();

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

    // Spin winds the magnetic field and turns every field line
    const a = Math.abs(STATE.spin);
    STATE.fieldPhase += STATE.dir * (0.0015 + a * 0.012) * step;
    STATE.twist = Math.min(4, STATE.twist + a * 0.0012 * step);

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
    updateQuasar(step);

    if (STATE.criticality >= 1 && DOM.enableBounce.checked) triggerBounce();

    STATE.flash = Math.max(0, STATE.flash - 0.015 * step);
    STATE.shake = Math.max(0, STATE.shake - 0.03 * step);
    STATE.fieldFlash = Math.max(0, STATE.fieldFlash - 0.012 * step);
    STATE.shock += 9 * STATE.unit * step;
    STATE.ripples.forEach((rp) => { rp.age += step; });
    STATE.ripples = STATE.ripples.filter((rp) => rp.age < 360);
}

function updateMultitarityLinks(step) {
    STATE.multitarityLinks = STATE.multitarityLinks.filter((link) => link.update(step));

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

// Knots race outward along the jets; radiated sparks fly off their sides
function updateQuasar(step) {
    const s = jetStrength();
    const len = jetLength();

    [1, -1].forEach((dir) => {
        if (Math.random() < 0.35 * s * step) {
            STATE.knots.push({ dir, y: STATE.rh * 1.1, v: (9 + Math.random() * 8) * STATE.unit, size: 0.6 + Math.random() * 0.8 });
        }
    });
    let sparks = 4 * s * step;
    while (sparks > 0) {
        if (Math.random() < sparks) {
            STATE.sparks.push({
                dir: Math.random() < 0.5 ? 1 : -1,
                y: STATE.rh * 1.2 + Math.random() * len * 0.8,
                ang: Math.random() * TAU,
                len: (0.3 + Math.random() * 1.2) * STATE.rh,
                life: 1,
                decay: 0.03 + Math.random() * 0.06
            });
        }
        sparks -= 1;
    }

    STATE.knots.forEach((k) => { k.y += k.v * step; });
    STATE.knots = STATE.knots.filter((k) => k.y < len);
    STATE.sparks.forEach((sp) => { sp.life -= sp.decay * step; });
    STATE.sparks = STATE.sparks.filter((sp) => sp.life > 0);
}

// ===== FIELD LINES =====
// Every field line is rebuilt each frame from the system's motion, projected
// once, then stroked in two passes (behind and in front of the horizon).

const FIELD_POOL = [];
let fieldCount = 0;

function fieldLine(n, rgb, base, width, dash, dashSpeed, phase) {
    let L = FIELD_POOL[fieldCount];
    if (!L || L.pts.length < n * 4) {
        L = { pts: new Float32Array(Math.max(n, 160) * 4) };
        FIELD_POOL[fieldCount] = L;
    }
    fieldCount++;
    L.n = 0;
    L.rgb = rgb;
    L.width = width;
    L.dash = dash;
    L.dashOffset = -STATE.time * dashSpeed;

    // Neon blink: smooth pulse plus rare bright flickers
    const rate = 0.01 + STATE.blinkRate / 100 * 0.1;
    const wave = 0.5 + 0.5 * Math.sin(STATE.time * rate + phase);
    let alpha = base * (STATE.fieldIntensity / 100) * (0.4 + 0.6 * wave * wave) * (1 + STATE.fieldFlash * 2.5);
    if (Math.random() < 0.003 * STATE.blinkRate / 50) alpha *= 2.2;
    L.alpha = Math.min(1, alpha);
    return L;
}

function addPoint(L, x, y, z) {
    const o = L.n * 4;
    const ok = project(x, y, z, P);
    L.pts[o] = P.x;
    L.pts[o + 1] = P.y;
    L.pts[o + 2] = P.z;
    L.pts[o + 3] = ok ? 1 : 0;
    L.n++;
}

function buildFieldLines() {
    fieldCount = 0;
    const lines = [];
    const a = Math.abs(STATE.spin);
    const dir = STATE.dir;
    const density = STATE.fieldDensity;
    const rs = STATE.rs;
    const rh = STATE.rh;
    const phase0 = STATE.fieldPhase;

    // Gravity: lines pouring into the singularity, twisted into spirals by frame dragging
    if (DOM.gravityToggle.checked) {
        const count = 10 + 8 * density;
        const rOut = STATE.radius * 1.35;
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let k = 0; k < count; k++) {
            const yk = 1 - (2 * (k + 0.5)) / count;
            const theta0 = Math.acos(yk);
            const phi0 = k * golden + phase0 * 0.2;
            const L = fieldLine(30, NEON.gravity, 0.34, 0.6, [5, 30], 2.2, k * 1.3);
            for (let i = 0; i < 30; i++) {
                const r = rOut * Math.pow((rh * 1.05) / rOut, i / 29);
                const pull = rh / r;
                const phi = phi0 + dir * a * 2.2 * Math.pow(pull, 0.7);
                const theta = theta0 + (Math.PI / 2 - theta0) * 0.35 * pull;
                const st = Math.sin(theta);
                addPoint(L, r * st * Math.cos(phi), r * Math.cos(theta), r * st * Math.sin(phi));
            }
            lines.push(L);
        }
    }

    // Magnetic: dipole loops anchored to the spinning horizon, wound up by the spin,
    // plus open lines coiling around each jet
    if (DOM.magneticToggle.checked) {
        const loops = 4 + 2 * density;
        [2.4, 3.8, 6.0].forEach((shell, si) => {
            const Lw = shell * rs;
            const s0 = Math.sqrt(Math.min(0.98, (rh * 1.05) / Lw));
            const theta0 = Math.asin(s0);
            const spinRate = 2.4 / shell;
            for (let k = 0; k < loops; k++) {
                const phiK = (k / loops) * TAU + phase0 * spinRate;
                const L = fieldLine(36, NEON.magnetic, 0.55, 0.7, [4, 22], 1.4, k * 2.1 + si);
                for (let i = 0; i < 36; i++) {
                    const theta = theta0 + ((Math.PI - 2 * theta0) * i) / 35;
                    const st = Math.sin(theta);
                    const r = Lw * st * st;
                    const phi = phiK + dir * STATE.twist * (1 - st * st) * 1.5;
                    addPoint(L, r * st * Math.cos(phi), r * Math.cos(theta), r * st * Math.sin(phi));
                }
                lines.push(L);
            }
        });

        if (DOM.showJets.checked) {
            const len = jetLength() * 0.9;
            const strength = 0.3 + Math.min(1, jetStrength());
            [1, -1].forEach((jd) => {
                for (let k = 0; k < 3 + density; k++) {
                    const phiK = (k / (3 + density)) * TAU + phase0 * 2;
                    const L = fieldLine(44, NEON.magnetic, 0.5 * strength, 0.6, [3, 16], 3, k + jd);
                    for (let i = 0; i < 44; i++) {
                        const y = rh * 1.1 + ((len - rh * 1.1) * i) / 43;
                        const rho = rh * (0.25 + 0.5 * (y / len));
                        const phi = phiK + dir * (1 + STATE.twist) * (y / (rh * 3));
                        addPoint(L, rho * Math.cos(phi), jd * y, rho * Math.sin(phi));
                    }
                    lines.push(L);
                }
            });
        }
    }

    // Toroidal: helical lines wound around nested tori that wrap the disk
    if (DOM.toroidalToggle.checked) {
        const R0 = rs * 3.6;
        const feed = 0.5 + Math.min(1, STATE.accretionRate * 1.2);
        [0.6, 1.0, 1.4].forEach((minor, ti) => {
            const r0 = rs * minor;
            for (let k = 0; k < 1 + density; k++) {
                const q = 7 + ti * 2 + k;
                const offset = (k / (1 + density)) * TAU;
                const L = fieldLine(160, NEON.toroidal, 0.42 * feed, 0.6, [3, 18], 1.8, ti * 1.7 + k);
                for (let i = 0; i < 160; i++) {
                    const u = (i / 159) * TAU;
                    const phi = u + phase0 * 0.8;
                    const psi = q * u + offset + dir * STATE.time * 0.02 + STATE.twist * 0.5;
                    const ring = R0 + r0 * Math.cos(psi);
                    addPoint(L, ring * Math.cos(phi), r0 * Math.sin(psi), ring * Math.sin(phi));
                }
                lines.push(L);
            }
        });
    }
    return lines;
}

function strokeFieldLines(ctx, lines, front) {
    const depth = SING.ok ? SING.z : Infinity;
    for (let li = 0; li < lines.length; li++) {
        const L = lines[li];
        if (L.alpha < 0.01) continue;
        const p = L.pts;
        let pen = false;
        let any = false;
        ctx.beginPath();
        for (let i = 1; i < L.n; i++) {
            const a = (i - 1) * 4;
            const b = i * 4;
            if (!p[a + 3] || !p[b + 3] || ((p[a + 2] + p[b + 2]) * 0.5 < depth) !== front) {
                pen = false;
                continue;
            }
            if (!pen) {
                ctx.moveTo(p[a], p[a + 1]);
                pen = true;
            }
            ctx.lineTo(p[b], p[b + 1]);
            any = true;
        }
        if (!any) continue;

        // Neon: soft glow, thin bright filament, then racing white-hot pulses
        ctx.setLineDash([]);
        ctx.lineWidth = L.width * 4;
        ctx.strokeStyle = rgba(L.rgb, L.alpha * 0.1);
        ctx.stroke();
        ctx.lineWidth = L.width;
        ctx.strokeStyle = rgba(L.rgb, L.alpha * 0.75);
        ctx.stroke();
        ctx.setLineDash(L.dash);
        ctx.lineDashOffset = L.dashOffset;
        ctx.lineWidth = L.width * 1.5;
        ctx.strokeStyle = rgba(mixRgb(L.rgb, [255, 255, 255], 0.6), L.alpha);
        ctx.stroke();
    }
    ctx.setLineDash([]);
}

// ===== RENDERING =====

const frontParticles = [];

function render(step) {
    updateCamera(step);

    const g = DOM.gridCtx;
    const m = DOM.matterCtx;
    const f = DOM.fieldCtx;
    const hs = SING.ok ? STATE.rh * SING.s : 0;     // horizon radius on screen

    g.clearRect(0, 0, STATE.w, STATE.h);
    if (DOM.showStars.checked) drawSky(g, hs);
    if (DOM.gridToggle.checked) drawSpacetimeGrid(g);

    if (STATE.isRunning || STATE.dragging || CAM.moving > 0.0005) {
        frontParticles.length = 0;
        const moving = STATE.dragging || CAM.moving > 0.002 || STATE.follow;
        m.globalCompositeOperation = 'destination-out';
        m.fillStyle = `rgba(0, 0, 0, ${moving ? 0.55 : 1 - STATE.trails / 100})`;
        m.fillRect(0, 0, STATE.w, STATE.h);
        m.globalCompositeOperation = 'lighter';
        drawParticles(m, hs, false);
        m.globalCompositeOperation = 'source-over';
        m.globalAlpha = 1;
    }

    const lines = buildFieldLines();

    f.clearRect(0, 0, STATE.w, STATE.h);
    f.globalCompositeOperation = 'lighter';
    if (SING.ok) drawLensHalo(f, hs);
    if (DOM.showDisk.checked) drawAccretionDisk(f, false, hs);
    strokeFieldLines(f, lines, false);

    if (DOM.showPolarity.checked) {
        STATE.polarityNodes.forEach((layer, idx) => {
            if (!isLayerVisible(idx)) return;
            layer.forEach((node) => node.draw(f, STATE.currentLayer === 5 ? 0.75 : 1));
        });
    }

    if (DOM.showMultitarity.checked) {
        f.setLineDash([2, 4]);
        STATE.multitarityLinks.forEach((link) => {
            if (isLayerVisible(link.a.layer) || isLayerVisible(link.b.layer)) link.draw(f, hs);
        });
        f.setLineDash([]);
    }

    f.globalCompositeOperation = 'source-over';
    if (SING.ok) drawHorizon(f, hs);
    f.globalCompositeOperation = 'lighter';

    // Matter in front of the shadow is drawn over it
    drawParticles(f, hs, true);
    f.globalAlpha = 1;

    if (DOM.showDisk.checked) drawAccretionDisk(f, true, hs);
    strokeFieldLines(f, lines, true);
    if (DOM.showJets.checked) drawQuasar(f);
    if (DOM.showRings.checked && SING.ok) drawRings(f);
    drawBounce(f);
    f.globalCompositeOperation = 'source-over';

    if (DOM.bloomToggle.checked) {
        const b = DOM.bloomCtx;
        const bw = DOM.bloomCanvas.width;
        const bh = DOM.bloomCanvas.height;
        b.clearRect(0, 0, bw, bh);
        b.drawImage(DOM.matterCanvas, 0, 0, bw, bh);
        b.drawImage(DOM.fieldCanvas, 0, 0, bw, bh);
    }
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
    const depth = SING.ok ? SING.z : -Infinity;

    for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (!p.active || !isLayerVisible(p.layer)) continue;
        if (p.isKnown ? !showKnown : !showUnknown) continue;
        if (!project(p.x, p.y, p.z, P)) continue;

        // Matter nearer than the singularity and over its shadow waits for the front pass
        if (!frontPass && P.z < depth) {
            const sx = P.x - SING.x;
            const sy = P.y - SING.y;
            if (sx * sx + sy * sy < hs2) {
                frontParticles.push(p);
                continue;
            }
        }

        const scale = SCALES[p.layer];
        const vlos = p.vx * CAM.fx + p.vy * CAM.fy + p.vz * CAM.fz;
        let alpha;
        let sprite;

        if (p.hawking > 0) {
            sprite = SPRITES.hawking;
            alpha = 1;
        } else {
            if (mode === 'energy') {
                const speed = Math.hypot(p.vx, p.vy, p.vz);
                const e = clamp((speed / vref - 0.12) / 0.8, 0, 1);
                sprite = SPRITES.energy[Math.round(e * SPECTRUM_STEPS)];
            } else if (mode === 'doppler') {
                const d = clamp(vlos / (vref * 0.45), -1, 1);
                sprite = SPRITES.doppler[Math.round((d + 1) / 2 * SPECTRUM_STEPS)];
            } else if (p.isKnown) {
                sprite = p.heat > 0.7 ? SPRITES.hot : SPRITES.known[p.layer];
            } else {
                sprite = SPRITES.unknown[p.layer];
            }
            alpha = p.isKnown ? 0.6 + 0.4 * p.heat : unknownAlpha * (0.4 + 0.6 * p.heat);
            // Relativistic beaming: approaching matter shines brighter
            alpha *= clamp(1 - 0.6 * vlos / vref, 0.5, 1.7);
        }

        const r = Math.min(48, scale.size * (0.8 + p.heat * 1.1 + p.hawking * 1.6) * P.s);
        const d = Math.max(1.2, r * 5);
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.drawImage(sprite, P.x - d / 2, P.y - d / 2, d, d);
    }
}

// Starfield and nebulae, with starlight lensed into an Einstein ring
function drawSky(ctx, hs) {
    const R = STATE.radius * 60;
    const light = STATE.lightBg;

    if (!light) {
        STATE.nebulae.forEach((n) => {
            if (!project(CAM.px + n.x * R, CAM.py + n.y * R, CAM.pz + n.z * R, P)) return;
            const size = n.size * R * P.s;
            const g = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, size);
            g.addColorStop(0, rgba(n.color, 0.09));
            g.addColorStop(0.5, rgba(n.color, 0.035));
            g.addColorStop(1, rgba(n.color, 0));
            ctx.fillStyle = g;
            ctx.fillRect(P.x - size, P.y - size, size * 2, size * 2);
        });
    }

    const thetaE = hs * (1.3 + STATE.lensing / 100 * 1.6);
    const t = STATE.time;
    STATE.stars.forEach((s) => {
        if (!project(CAM.px + s.x * R, CAM.py + s.y * R, CAM.pz + s.z * R, P)) return;
        let x = P.x;
        let y = P.y;
        let mag = 1;
        if (SING.ok && thetaE > 0) {
            const dx = x - SING.x;
            const dy = y - SING.y;
            const d = Math.hypot(dx, dy) || 0.001;
            // Point-lens image: θ = ½(β + √(β² + 4θ_E²))
            const img = 0.5 * (d + Math.sqrt(d * d + 4 * thetaE * thetaE));
            if (img < hs * 1.02) return;
            const u = d / thetaE;
            mag = Math.min(5, (u * u + 2) / (u * Math.sqrt(u * u + 4)));
            x = SING.x + (dx / d) * img;
            y = SING.y + (dy / d) * img;
        }
        const tw = 0.55 + 0.45 * Math.sin(t * s.rate + s.twinkle);
        const size = s.size * Math.sqrt(mag);
        ctx.fillStyle = light ? `rgba(40, 30, 90, ${0.5 * tw})` : rgba(s.color, Math.min(1, 0.85 * tw * mag));
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
    });
}

// Rubber-sheet picture of curvature: a well that deepens with mass, dented by
// + poles, lifted by − poles and rippled by gravitational waves after a bounce
const GRID_COLORS_LIGHT = [[60, 50, 170], [110, 30, 170], [170, 0, 120], [120, 0, 80]];

function drawSpacetimeGrid(ctx) {
    const lines = 30;
    const samples = 60;
    const extent = STATE.radius * 1.6;
    const base = -STATE.radius * 0.22;
    const depth = Math.min(STATE.radius * 0.9, STATE.radius * 0.32 * Math.sqrt(STATE.effMass / 30));
    const rs = Math.max(STATE.rs, 1);
    const poles = [];
    STATE.polarityNodes.forEach((layer) => layer.forEach((n) => poles.push(n)));
    const sigma2 = Math.pow(STATE.radius * 0.06, 2);
    const ripples = STATE.ripples;
    const waveSpeed = 7 * STATE.unit;
    const waveWidth = STATE.radius * 0.12;
    const palette = STATE.lightBg ? GRID_COLORS_LIGHT : GRID_COLORS;

    const height = (x, z) => {
        const r2 = x * x + z * z;
        const r = Math.sqrt(r2);
        let y = base - depth * rs / Math.sqrt(r2 + rs * rs);
        for (let i = 0; i < poles.length; i++) {
            const n = poles[i];
            const dx = x - n.x;
            const dz = z - n.z;
            y -= n.charge * n.strength * 6 * STATE.unit * Math.exp(-(dx * dx + dz * dz) / (2 * sigma2));
        }
        for (let i = 0; i < ripples.length; i++) {
            const rp = ripples[i];
            const front = r - waveSpeed * rp.age;
            const envelope = Math.exp(-(front * front) / (2 * waveWidth * waveWidth)) * (1 - rp.age / 360);
            y += rp.amp * envelope * Math.cos(front / (waveWidth * 0.25));
        }
        return y;
    };

    // Batch segments by brightness and color so the grid is ~20 strokes
    const buckets = [];
    for (let i = 0; i < 20; i++) buckets.push(new Path2D());

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
                const y = height(x, z);
                const ok = project(x, y, z, P);
                if (ok && prevOk) {
                    const fade = Math.max(0, 1 - Math.hypot(x, z) / extent);
                    if (fade > 0.02) {
                        const dip = clamp((base - y) / depth, 0, 0.999);
                        const bucket = Math.min(4, Math.floor(fade * 5)) * 4 + Math.floor(dip * 4);
                        buckets[bucket].moveTo(px, py);
                        buckets[bucket].lineTo(P.x, P.y);
                    }
                }
                prevOk = ok;
                px = P.x;
                py = P.y;
            }
        }
    }

    ctx.lineWidth = 0.7;
    for (let i = 0; i < 20; i++) {
        const fade = (Math.floor(i / 4) + 0.5) / 5;
        ctx.strokeStyle = rgba(palette[i % 4], 0.5 * fade);
        ctx.stroke(buckets[i]);
    }
}

function drawLensHalo(ctx, hs) {
    const c = STATE.criticality;
    const R = hs * (3 + STATE.lensing / 35);
    const g = ctx.createRadialGradient(SING.x, SING.y, hs, SING.x, SING.y, R);
    g.addColorStop(0, rgba(mixRgb(THEME_HALO[0], THEME_HALO[1], c), 0.3 + c * 0.25));
    g.addColorStop(0.3, 'rgba(120, 70, 255, 0.12)');
    g.addColorStop(1, 'rgba(40, 0, 80, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(SING.x, SING.y, R, 0, TAU);
    ctx.fill();
}

// The disk lies in the spin plane: segments behind the singularity are drawn
// before the shadow, nearer ones after it. Beaming brightens the approaching side.
function drawAccretionDisk(ctx, front, hs) {
    const rings = 18;
    const segments = 90;
    const c = STATE.criticality;
    const a = Math.abs(STATE.spin);
    const spinRate = 0.004 + a * 0.012;
    const dir = STATE.dir;
    const depth = SING.ok ? SING.z : Infinity;

    ctx.save();
    ctx.lineCap = 'round';

    for (let i = 0; i < rings; i++) {
        const f = i / (rings - 1);
        const r = STATE.rs * (1.6 + f * 3.4);
        const shimmer = 0.06 * Math.sin(STATE.time * 0.01 + i * 0.7);
        const color = diskColor(f + shimmer);
        const baseAlpha = (0.55 - f * 0.33) * (0.75 + c * 0.5);
        const omega = STATE.time * spinRate / Math.pow(f + 0.4, 1.5);
        ctx.lineWidth = clamp((1.4 + (1 - f) * 2.2) * STATE.unit * SING.s, 0.5, 9);

        let prevOk = false;
        let px = 0;
        let py = 0;
        let pz = 0;
        for (let j = 0; j <= segments; j++) {
            const th = (j / segments) * TAU;
            const ok = project(Math.cos(th) * r, 0, Math.sin(th) * r, P);
            if (ok && prevOk && ((P.z + pz) / 2 < depth) === front) {
                // Orbital velocity dir·(−sin θ, 0, cos θ) against the line of sight
                const vlos = dir * (-Math.sin(th) * CAM.fx + Math.cos(th) * CAM.fz);
                const beam = 1 - 0.7 * vlos;
                const streak = 0.5 + 0.5 * Math.sin(th * 5 - dir * omega);
                ctx.strokeStyle = rgba(color, Math.min(1, baseAlpha * beam * streak));
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(P.x, P.y);
                ctx.stroke();
            }
            prevOk = ok;
            px = P.x;
            py = P.y;
            pz = P.z;
        }

        // Lensed image of the far side, bent up and over the shadow
        if (front && SING.ok && DOM.cinematicToggle.checked && STATE.lensing > 0 && i % 2 === 0) {
            const edgeOn = Math.cos(CAM.pitch);
            const lr = hs * (1.22 + f * 0.95);
            ctx.strokeStyle = rgba(color, baseAlpha * edgeOn * STATE.lensing / 100 * 0.85);
            ctx.lineWidth = clamp((1 + (1 - f) * 1.4) * STATE.unit * SING.s, 0.4, 6);
            ctx.beginPath();
            ctx.ellipse(SING.x, SING.y, lr, lr * (0.72 + 0.28 * edgeOn), 0, Math.PI, TAU);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawHorizon(ctx, hs) {
    const c = STATE.criticality;

    // Event horizon: nothing escapes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(SING.x, SING.y, hs, 0, TAU);
    ctx.fill();

    // Photon ring: a razor-thin white filament with a neon glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = rgba(mixRgb(THEME_HALO[0], THEME_HALO[1], c), 0.95);
    ctx.shadowBlur = 18 + c * 22;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.1 + c;
    ctx.beginPath();
    ctx.arc(SING.x, SING.y, hs * 1.035, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = rgba(THEME_HALO[0], 0.35);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(SING.x, SING.y, hs * 1.09, 0, TAU);
    ctx.stroke();
    ctx.restore();
}

// Razor-thin relativistic beams with racing knots and radiated sparks
function drawQuasar(ctx) {
    const s = jetStrength();
    if (s < 0.02) return;
    const len = jetLength();
    const flicker = 0.85 + 0.15 * Math.sin(STATE.time * 0.9) + Math.random() * 0.08;
    const bright = Math.min(1, s * flicker);

    ctx.save();
    ctx.lineCap = 'round';
    [1, -1].forEach((dir) => {
        if (!project(0, dir * STATE.rh * 1.05, 0, P)) return;
        const bx = P.x;
        const by = P.y;
        if (!project(0, dir * len, 0, P)) return;
        const ex = P.x;
        const ey = P.y;

        [[5, NEON.jetMid, 0.12], [1.8, NEON.jet, 0.4], [0.8, [255, 255, 255], 1]].forEach(([width, rgb, alpha]) => {
            const grad = ctx.createLinearGradient(bx, by, ex, ey);
            grad.addColorStop(0, rgba(rgb, alpha * bright));
            grad.addColorStop(0.55, rgba(rgb, alpha * bright * 0.6));
            grad.addColorStop(1, rgba(rgb, 0));
            ctx.strokeStyle = grad;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        });

        // Blazing base where the beam leaves the pole
        const flare = 10 + 18 * bright;
        ctx.globalAlpha = bright;
        ctx.drawImage(SPRITES.white, bx - flare / 2, by - flare / 2, flare, flare);
        ctx.globalAlpha = 1;
    });

    // Energy knots
    STATE.knots.forEach((k) => {
        if (!project(0, k.dir * k.y, 0, P)) return;
        const x = P.x;
        const y = P.y;
        const fade = 1 - k.y / len;
        const size = Math.max(3, k.size * 7 * Math.sqrt(P.s));
        ctx.globalAlpha = Math.min(1, fade * 1.4);
        ctx.drawImage(SPRITES.white, x - size / 2, y - size / 2, size, size);
        if (project(0, k.dir * Math.max(STATE.rh, k.y - k.v * 7), 0, P)) {
            ctx.strokeStyle = rgba(NEON.jet, fade);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(P.x, P.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    });
    ctx.globalAlpha = 1;

    // Radiated sparks
    ctx.lineWidth = 0.6;
    STATE.sparks.forEach((sp) => {
        if (!project(0, sp.dir * sp.y, 0, P)) return;
        const x0 = P.x;
        const y0 = P.y;
        const reach = sp.len * (1.2 - sp.life * 0.6);
        if (!project(Math.cos(sp.ang) * reach, sp.dir * (sp.y + reach * 0.4), Math.sin(sp.ang) * reach, P)) return;
        ctx.strokeStyle = rgba(NEON.spark, sp.life * 0.85);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(P.x, P.y);
        ctx.stroke();
        ctx.fillStyle = rgba([255, 255, 255], sp.life);
        ctx.fillRect(P.x - 0.8, P.y - 0.8, 1.6, 1.6);
    });
    ctx.restore();
}

function drawRings(ctx) {
    const a = Math.abs(STATE.spin);

    // Photon sphere
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 0.7;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.arc(SING.x, SING.y, STATE.rs * 1.5 * SING.s, 0, TAU);
    ctx.stroke();

    // Ergosphere equator at r_s in the spin plane
    if (a > 0.01) {
        ctx.strokeStyle = 'rgba(180, 120, 255, 0.55)';
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -STATE.time * 0.3 * STATE.dir;
        ctx.beginPath();
        for (let j = 0; j <= 72; j++) {
            const th = (j / 72) * TAU;
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
    ctx.fillStyle = `rgba(200, 245, 255, ${STATE.flash * 0.22})`;
    ctx.fillRect(0, 0, STATE.w, STATE.h);

    // Shockwave ring racing outward through the disk plane
    ctx.strokeStyle = rgba([255, 255, 255], STATE.flash);
    ctx.lineWidth = 1 + STATE.flash * 2;
    ctx.beginPath();
    for (let j = 0; j <= 96; j++) {
        const th = (j / 96) * TAU;
        if (!project(Math.cos(th) * STATE.shock, 0, Math.sin(th) * STATE.shock, P)) continue;
        if (j === 0) ctx.moveTo(P.x, P.y);
        else ctx.lineTo(P.x, P.y);
    }
    ctx.stroke();
    if (SING.ok) {
        ctx.strokeStyle = rgba([255, 60, 200], STATE.flash * 0.6);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(SING.x, SING.y, STATE.shock * SING.s * 0.8, 0, TAU);
        ctx.stroke();
    }
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
    particles.forEach((p) => {
        if (!p.active) return;
        inField++;
        if (p.isKnown) known++;
    });

    DOM.spinDisplay.textContent = formatSpin(STATE.spin);
    DOM.twistDisplay.textContent = STATE.twist.toFixed(2);
    DOM.zoomDisplay.textContent = formatZoom(CAM.zoom);

    DOM.horizonRadius.textContent = (STATE.rh / STATE.unit).toFixed(1);
    DOM.effectiveMass.textContent = STATE.effMass.toFixed(1);
    DOM.jetDisplay.textContent = Math.round(Math.min(1.2, jetStrength()) * 100) + '%';

    // Conservation ledger
    DOM.fieldCount.textContent = inField;
    DOM.horizonCount.textContent = inHorizon;
    DOM.conservedTotal.textContent = (inField + inHorizon === total ? '✓ ' : '✗ ') + total;

    const knownPercent = Math.round((known / Math.max(1, inField)) * 100);
    DOM.knownSpace.textContent = knownPercent + '%';
    DOM.unknownSpace.textContent = (100 - knownPercent) + '%';
    DOM.infoRecovered.textContent =
        Math.min(100, Math.round((STATE.hawkingTotal / Math.max(1, STATE.absorbedTotal)) * 100)) + '%';

    DOM.absorbedCount.textContent = STATE.absorbedTotal;
    DOM.hawkingCount.textContent = STATE.hawkingTotal;
    DOM.bounceCount.textContent = STATE.bounces;

    let poles = 0;
    let charge = 0;
    STATE.polarityNodes.forEach((layer) => layer.forEach((n) => { poles++; charge += n.charge; }));
    DOM.polarityNodes.textContent = `${poles} · ${charge}`;
    DOM.multitarityLinks.textContent = STATE.multitarityLinks.length;
    DOM.fpsCount.textContent = STATE.fps;

    DOM.knownPhase.textContent = knownPercent > 50 ? 'Revealed' : knownPercent > 15 ? 'Emerging' : 'Observable';

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

// ===== COLOR & SPECTRUM =====

function hexToRgb(hex) {
    const v = parseInt(hex.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

const toHex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const luminance = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

function applyTheme(key) {
    const t = THEMES[key];
    STATE.theme = key;
    SCALES.forEach((s, i) => {
        s.known = t.known[i];
        s.unknown = t.unknown[i];
    });
    DISK_STOPS.length = 0;
    t.disk.forEach((stop) => DISK_STOPS.push(stop));
    NEON.gravity = t.gravity;
    NEON.magnetic = t.magnetic;
    NEON.toroidal = t.toroidal;
    NEON.hawking = t.hawking;
    NEON.jetMid = t.jetMid;
    NEON.link = t.link;
    THEME_HALO = [t.disk[1][1], t.disk[4][1]];
    GRID_COLORS = [
        mixRgb(t.disk[2][1], [90, 90, 255], 0.4),
        t.disk[3][1],
        t.disk[4][1],
        mixRgb(t.disk[4][1], [255, 255, 255], 0.65)
    ];

    SCALES.forEach((s, i) => {
        SPRITES.known[i] = makeSprite(s.known);
        SPRITES.unknown[i] = makeSprite(s.unknown);
    });
    SPRITES.hot = makeSprite(mixRgb(t.known[1], [255, 255, 255], 0.6));
    SPRITES.hawking = makeSprite(t.hawking);

    // Panels, switches and legend follow the theme too
    const root = document.documentElement.style;
    const set = (name, rgb) => {
        root.setProperty('--' + name, toHex(rgb));
        root.setProperty('--' + name + '-rgb', rgb.join(', '));
    };
    set('ice', hexToRgb(t.ui[0]));
    set('pink', hexToRgb(t.ui[1]));
    set('violet', hexToRgb(t.ui[2]));
    set('lime', t.gravity);
    set('cyan', t.magnetic);
    set('magenta', t.toroidal);
    set('gold', t.hawking);
    set('known', t.known[2]);
    set('unknown', t.unknown[1]);

    if (DOM.themeSelect) DOM.themeSelect.value = key;
}

function backgroundStops() {
    if (STATE.background !== 'custom') return BACKGROUNDS[STATE.background];
    const c = hexToRgb(STATE.customBg);
    const light = luminance(c) > 0.5;
    return [
        toHex(mixRgb(c, [255, 255, 255], light ? 0.5 : 0.18)),
        toHex(c),
        toHex(mixRgb(c, [0, 0, 0], light ? 0.12 : 0.65))
    ];
}

function applyBackground() {
    const stops = backgroundStops();
    DOM.viewport.style.background =
        `radial-gradient(ellipse at 50% 53%, ${stops[0]} 0%, ${stops[1]} 45%, ${stops[2]} 100%)`;
    STATE.lightBg = luminance(hexToRgb(stops[1])) > 0.5;
    DOM.viewport.classList.toggle('light-bg', STATE.lightBg);
}

// The full CSS filter for the viewport; gamma uses an SVG transfer function
function cssFilter(includeGamma) {
    const parts = [];
    if (FILTERS[STATE.filter]) parts.push(FILTERS[STATE.filter]);
    if (STATE.brightness !== 100) parts.push(`brightness(${STATE.brightness / 100})`);
    if (STATE.contrast !== 100) parts.push(`contrast(${STATE.contrast / 100})`);
    if (STATE.saturation !== 100) parts.push(`saturate(${STATE.saturation / 100})`);
    if (STATE.hueShift !== 0) parts.push(`hue-rotate(${STATE.hueShift}deg)`);
    if (includeGamma && Math.abs(STATE.gamma - 1) > 0.001) parts.push('url(#gammaFilter)');
    return parts.length ? parts.join(' ') : 'none';
}

function applyColorFilters() {
    DOM.gammaFuncs.forEach((fn) => { if (fn) fn.setAttribute('exponent', String(1 / STATE.gamma)); });
    DOM.viewport.style.filter = cssFilter(true);
}

function applyLook() {
    applyBackground();
    applyColorFilters();
    DOM.viewport.classList.toggle('cinematic', DOM.cinematicToggle.checked);
    DOM.viewport.classList.toggle('bloom', DOM.bloomToggle.checked);

    const mode = STATE.colorMode;
    DOM.spectrumKey.classList.toggle('hidden', mode === 'natural');
    DOM.spectrumBar.className = 'spectrum-bar ' + mode;
    DOM.spectrumLow.textContent = mode === 'doppler' ? 'Approaching' : 'Low energy';
    DOM.spectrumHigh.textContent = mode === 'doppler' ? 'Receding' : 'High energy';
}

function resetColors() {
    applyTheme('plasma');
    STATE.background = 'abyss';
    DOM.backgroundSelect.value = 'abyss';
    STATE.filter = 'none';
    DOM.filterSelect.value = 'none';
    STATE.colorMode = 'natural';
    DOM.colorModeSelect.value = 'natural';
    setSlider('gammaSlider', 1);
    setSlider('brightnessSlider', 100);
    setSlider('contrastSlider', 100);
    setSlider('saturationSlider', 100);
    setSlider('hueSlider', 0);
    applyLook();
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    SLIDERS.forEach(([id, key, format, onChange, transform]) => {
        const slider = $(id);
        const display = $(id.replace('Slider', 'Value'));
        slider.addEventListener('input', () => {
            const raw = parseFloat(slider.value);
            STATE[key] = transform ? transform(raw) : raw;
            display.textContent = format(STATE[key]);
            if (onChange) onChange();
        });
    });

    DOM.focusSelect.addEventListener('change', () => setFocus(DOM.focusSelect.value));
    DOM.themeSelect.addEventListener('change', () => applyTheme(DOM.themeSelect.value));
    DOM.backgroundSelect.addEventListener('change', () => {
        STATE.background = DOM.backgroundSelect.value;
        applyLook();
    });
    DOM.customBgInput.addEventListener('input', () => {
        STATE.customBg = DOM.customBgInput.value;
        DOM.customBgValue.textContent = STATE.customBg;
        STATE.background = 'custom';
        DOM.backgroundSelect.value = 'custom';
        applyLook();
    });
    DOM.filterSelect.addEventListener('change', () => {
        STATE.filter = DOM.filterSelect.value;
        applyColorFilters();
    });
    DOM.colorModeSelect.addEventListener('change', () => {
        STATE.colorMode = DOM.colorModeSelect.value;
        applyLook();
    });
    DOM.resetColorsBtn.addEventListener('click', resetColors);
    [DOM.bloomToggle, DOM.gridToggle].forEach((el) => el.addEventListener('change', applyLook));
    DOM.cinematicToggle.addEventListener('change', () => { applyLook(); clearTrails(); });

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

    // Drag to orbit, pinch or scroll to zoom, click to fly to an object
    const pointers = new Map();
    let moved = 0;
    DOM.fieldCanvas.addEventListener('pointerdown', (e) => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        DOM.fieldCanvas.setPointerCapture(e.pointerId);
        STATE.dragging = true;
        if (pointers.size === 1) moved = 0;
    });
    DOM.fieldCanvas.addEventListener('pointermove', (e) => {
        const prev = pointers.get(e.pointerId);
        if (!prev) return;
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        moved += Math.abs(dx) + Math.abs(dy);

        if (pointers.size === 2) {
            const other = [...pointers.entries()].find(([id]) => id !== e.pointerId)[1];
            const before = Math.hypot(prev.x - other.x, prev.y - other.y) || 1;
            const after = Math.hypot(e.clientX - other.x, e.clientY - other.y) || 1;
            setZoom(STATE.zoom * (after / before));
        } else {
            CAM.yaw -= dx * 0.006;
            if (DOM.cinematicToggle.checked) setSlider('elevationSlider', STATE.elevation + dy * 0.25);
        }
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    const endPointer = (e) => {
        const p = pointers.get(e.pointerId);
        pointers.delete(e.pointerId);
        if (pointers.size === 0) {
            STATE.dragging = false;
            if (p && moved < 6 && e.type === 'pointerup') pickAt(p.x, p.y);
        }
    };
    DOM.fieldCanvas.addEventListener('pointerup', endPointer);
    DOM.fieldCanvas.addEventListener('pointercancel', endPointer);
    DOM.fieldCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        setZoom(STATE.zoom * Math.exp(-e.deltaY * 0.0015));
    }, { passive: false });
    DOM.fieldCanvas.addEventListener('dblclick', () => {
        CAM.yaw = 0.7;
        setSlider('elevationSlider', 14);
        setFocus('whole');
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
        else if (key === '1') toggleSwitch(DOM.gravityToggle);
        else if (key === '2') toggleSwitch(DOM.magneticToggle);
        else if (key === '3') toggleSwitch(DOM.toroidalToggle);
        else if (key === 'l') toggleSwitch(DOM.bloomToggle);
        else if (key === 'i') {
            STATE.filter = STATE.filter === 'invert' ? 'none' : 'invert';
            DOM.filterSelect.value = STATE.filter;
            applyColorFilters();
        }
        else if (key === 't') applyTheme(THEME_ORDER[(THEME_ORDER.indexOf(STATE.theme) + 1) % THEME_ORDER.length]);
        else if (key === 'f') setFocus(FOCUS_ORDER[(FOCUS_ORDER.indexOf(STATE.focus) + 1) % FOCUS_ORDER.length]);
        else if (key === '+' || key === '=') setZoom(STATE.zoom * 1.25);
        else if (key === '-' || key === '_') setZoom(STATE.zoom / 1.25);
        else if (key === 'escape') DOM.infoModal.classList.add('hidden');
    });

    window.addEventListener('resize', () => { resizeCanvases(); clearTrails(); });
}

// Set a slider programmatically, clamped to its range, and fire its handler
function setSlider(id, value) {
    const slider = $(id);
    slider.value = String(clamp(value, parseFloat(slider.min), parseFloat(slider.max)));
    slider.dispatchEvent(new Event('input'));
}

function setZoom(z) {
    setSlider('zoomSlider', sliderFromZoom(clamp(z, ZOOM_MIN, ZOOM_MIN * ZOOM_SPAN)));
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
    setFocus(STATE.focus === 'pole' || STATE.focus === 'particle' || STATE.focus === 'hawking' ? 'whole' : STATE.focus);
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
    ctx.fillStyle = backgroundStops()[1];
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(DOM.gridCanvas, 0, 0);
    ctx.drawImage(DOM.matterCanvas, 0, 0);
    ctx.drawImage(DOM.fieldCanvas, 0, 0);
    if (DOM.bloomToggle.checked) {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.5;
        ctx.drawImage(DOM.bloomCanvas, 0, 0, out.width, out.height);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    // Apply the color grade: CSS filters where the canvas supports them, then gamma
    let final = out;
    const css = cssFilter(false);
    if (css !== 'none' && 'filter' in ctx) {
        final = document.createElement('canvas');
        final.width = out.width;
        final.height = out.height;
        const fctx = final.getContext('2d');
        fctx.filter = css;
        fctx.drawImage(out, 0, 0);
        fctx.filter = 'none';
    }
    const needInvert = css !== 'none' && !('filter' in ctx) && /invert/.test(css);
    if (Math.abs(STATE.gamma - 1) > 0.001 || needInvert) {
        const fctx = final.getContext('2d');
        const img = fctx.getImageData(0, 0, final.width, final.height);
        const d = img.data;
        const lut = new Uint8ClampedArray(256);
        for (let v = 0; v < 256; v++) {
            const x = needInvert ? 255 - v : v;
            lut[v] = Math.round(255 * Math.pow(x / 255, 1 / STATE.gamma));
        }
        for (let i = 0; i < d.length; i += 4) {
            d[i] = lut[d[i]];
            d[i + 1] = lut[d[i + 1]];
            d[i + 2] = lut[d[i + 2]];
        }
        fctx.putImageData(img, 0, 0);
    }

    const link = document.createElement('a');
    link.href = final.toDataURL('image/png');
    link.download = `oi-io-singularity-${Date.now()}.png`;
    link.click();
}

// ===== STARTUP =====

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
