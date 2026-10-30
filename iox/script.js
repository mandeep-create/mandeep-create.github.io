/*! IOX · Grand Unified Universe
   © 2026 Mandeep S. Bhullar · SpinalXeno™. All rights reserved. SpinalXeno™ is a trademark of Mandeep S. Bhullar.
   Unauthorized copying, modification or redistribution of this code is prohibited.
   Digitally signed by SpinalXeno, signing key fingerprint (SHA-256) 25666eb2cf27368640bb41154733bfdc1f8a07b194aec7661659fc7b565155b3 */
// ===== GRAND UNIFIED THEORY CONSTANTS =====

const THEORY = {
    // Known/Unknown ratio at different scales
    SCALE_RATIOS: {
        0: 0.0000001,  // Planck scale - almost all unknown
        1: 0.00001,    // Quantum scale
        2: 0.05,       // Atomic scale
        3: 0.05,       // Cosmic scale (observable: 5%)
        4: 1.0         // Meta scale (all known by definition)
    },

    // Dimensional properties
    DIMENSIONS: [
        { name: 'Planck', size: 1e-35, layers: 4 },
        { name: 'Quantum', size: 1e-15, layers: 5 },
        { name: 'Atomic', size: 1e-10, layers: 6 },
        { name: 'Cosmic', size: 1e26, layers: 7 },
        { name: 'Meta', size: Infinity, layers: 11 }
    ],

    // Deep's Paradox - depth increases with depth
    calculateDepth: (scale, infinity) => {
        return Math.sqrt(scale) * Math.log(infinity);
    },

    // Polygarity - multiple poles
    calculatePoles: (dimensionality, strength) => {
        return Math.floor(Math.pow(dimensionality, strength));
    },

    // Multitarity - dimensional links
    calculateLinks: (poles, connectivity) => {
        return poles * (poles - 1) * connectivity;
    }
};

// ===== POLARITY NODE CLASS (Attractor) =====

class PolarityNode {
    constructor(x, y, layer, strength = 1) {
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.strength = strength;
        this.charge = Math.random() > 0.5 ? 1 : -1;
        this.frequency = Math.random() * 0.05 + 0.01;
        this.phase = Math.random() * Math.PI * 2;
        this.radius = 20 + strength * 30;
        this.pull = 0.003 * strength;
    }

    update() {
        this.phase += this.frequency;
        this.radius = 20 + Math.sin(this.phase) * 10 + this.strength * 30;
    }

    getForce(px, py) {
        const dx = this.x - px;
        const dy = this.y - py;
        const dist = Math.hypot(dx, dy);
        
        if (dist > this.radius * 5) return { x: 0, y: 0 };
        
        const force = (this.pull * this.charge) / (dist + 1);
        return {
            x: (dx / (dist + 1)) * force,
            y: (dy / (dist + 1)) * force
        };
    }

    draw(ctx, alpha = 1) {
        // Polarity field visualization
        const color = this.charge > 0 ? 
            `rgba(255, 0, 136, ${alpha * 0.4})` :
            `rgba(0, 255, 255, ${alpha * 0.4})`;
        
        ctx.fillStyle = color;
        ctx.shadowColor = this.charge > 0 ? 
            'rgba(255, 0, 136, 0.6)' : 
            'rgba(0, 255, 255, 0.6)';
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = this.charge > 0 ? '#ff0088' : '#00ffff';
        ctx.shadowColor = 'transparent';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ===== MULTITARITY LINK CLASS =====

class MultitarityLink {
    constructor(source, target, strength = 0.5) {
        this.source = source;
        this.target = target;
        this.strength = strength;
        this.age = 0;
        this.maxAge = 300 + Math.random() * 200;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.dimensionalJump = Math.random() * 5;
    }

    update() {
        this.age += 1;
        this.pulsePhase += 0.02;
        return this.age < this.maxAge;
    }

    draw(ctx, alpha = 1) {
        const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
        const opacity = (1 - this.age / this.maxAge) * this.strength * pulse * alpha;

        ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * 0.6})`;
        ctx.lineWidth = 1 + pulse;
        ctx.setLineDash([3, 3]);
        
        ctx.beginPath();
        ctx.moveTo(this.source.x, this.source.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
}

// ===== UNIVERSE PARTICLE CLASS =====

class UniverseParticle {
    constructor(x, y, layer, isKnown = true) {
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.isKnown = isKnown;
        
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.ax = 0;
        this.ay = 0;
        
        this.mass = Math.random() * 0.5 + 0.5;
        this.activation = Math.random();
        this.depth = 0;
        
        this.trail = [];
        this.maxTrailLength = 25;
        this.color = isKnown ? 
            { r: 0, g: 255, b: 136 } :
            { r: 102, g: 0, b: 102 };
    }

    update(polarityNodes, speed) {
        this.ax = 0;
        this.ay = 0;

        // Polarity field forces
        polarityNodes.forEach(node => {
            const force = node.getForce(this.x, this.y);
            this.ax += force.x;
            this.ay += force.y;
        });

        // Brownian motion (quantum uncertainty)
        this.ax += (Math.random() - 0.5) * 0.1;
        this.ay += (Math.random() - 0.5) * 0.1;

        // Damping
        this.vx += this.ax;
        this.vy += this.ay;
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Movement
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Wrapping
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;

        // Decay activation
        this.activation *= 0.98;

        // Trail
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Depth tracking (Deep's Paradox)
        this.depth += Math.random() * 0.01;
    }

    draw(ctx, knownRatio, unknownAlpha) {
        // Draw trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.activation * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // Draw particle
        const radius = 2 + this.activation * 3;
        
        if (this.isKnown) {
            // Known universe (bright, visible)
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.activation * knownRatio})`;
            ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.activation * 0.8})`;
        } else {
            // Unknown universe (dark, latent)
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.activation * (1 - knownRatio) * unknownAlpha / 100})`;
            ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.activation * 0.2})`;
        }

        ctx.shadowBlur = 8 * this.activation;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = 'transparent';
    }
}

// ===== STATE MANAGEMENT =====

const STATE = {
    layers: [[], [], [], [], []],  // 5 dimensional layers
    polarityNodes: [[], [], [], [], []],
    multitarityLinks: [],
    
    currentLayer: 0,
    currentDimensionality: 4,
    knownRatio: 0.05,
    infinityParam: 1000,
    polarityStrength: 2,
    multitarityDensity: 50,
    
    speed: 5,
    particleCount: 600,
    connectionRange: 200,
    unknownAlpha: 40,
    
    fps: 60,
    frameCount: 0,
    lastTime: Date.now(),
    isRunning: true
};

// ===== DOM ELEMENTS =====

const DOM = {
    universeCanvas: document.getElementById('universeCanvas'),
    unknownCanvas: document.getElementById('unknownCanvas'),
    fieldCanvas: document.getElementById('fieldCanvas'),
    ctx: null,
    unknownCtx: null,
    fieldCtx: null,
    
    // Controls
    knownRatioSlider: document.getElementById('knownRatioSlider'),
    infinitySlider: document.getElementById('infinitySlider'),
    dimensionalitySlider: document.getElementById('dimensionalitySlider'),
    polaritySlider: document.getElementById('polaritySlider'),
    multitaritySlider: document.getElementById('multitaritySlider'),
    speedSlider: document.getElementById('speedSlider'),
    particleSlider: document.getElementById('particleSlider'),
    connectionSlider: document.getElementById('connectionSlider'),
    unknownAlphaSlider: document.getElementById('unknownAlphaSlider'),
    
    // Display
    knownRatioValue: document.getElementById('knownRatioValue'),
    infinityValue: document.getElementById('infinityValue'),
    dimensionalityValue: document.getElementById('dimensionalityValue'),
    polarityValue: document.getElementById('polarityValue'),
    multitarityValue: document.getElementById('multitarityValue'),
    speedValue: document.getElementById('speedValue'),
    particleValue: document.getElementById('particleValue'),
    connectionValue: document.getElementById('connectionValue'),
    unknownAlphaValue: document.getElementById('unknownAlphaValue'),
    
    // Checkboxes
    showKnown: document.getElementById('showKnown'),
    showUnknown: document.getElementById('showUnknown'),
    showPolarity: document.getElementById('showPolarity'),
    showMultitarity: document.getElementById('showMultitarity'),
    showDimensions: document.getElementById('showDimensions'),
    
    // Buttons
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn'),
    infoBtn: document.getElementById('infoBtn'),
    collapseBtn: document.getElementById('collapseBtn'),
    layerBtns: document.querySelectorAll('.layer-btn'),
    
    // Stats
    knownSpace: document.getElementById('knownSpace'),
    unknownSpace: document.getElementById('unknownSpace'),
    dimensional: document.getElementById('dimensional'),
    polarityNodes: document.getElementById('polarityNodes'),
    multitarityLinks: document.getElementById('multitarityLinks'),
    deepIndex: document.getElementById('deepIndex'),
    coherenceK: document.getElementById('coherenceK'),
    entropyU: document.getElementById('entropyU'),
    stability: document.getElementById('stability'),
    fpsCount: document.getElementById('fpsCount'),
    layerDisplay: document.getElementById('layerDisplay'),
    statusDisplay: document.getElementById('statusDisplay'),
    
    // Phase info
    knownPhase: document.getElementById('knownPhase'),
    unknownPhase: document.getElementById('unknownPhase'),
    deepPhase: document.getElementById('deepPhase'),
    
    // Modal
    infoModal: document.getElementById('infoModal'),
    controlPanel: document.querySelector('.control-panel')
};

// ===== INITIALIZATION =====

function init() {
    DOM.ctx = DOM.universeCanvas.getContext('2d');
    DOM.unknownCtx = DOM.unknownCanvas.getContext('2d');
    DOM.fieldCtx = DOM.fieldCanvas.getContext('2d');
    
    resizeCanvases();
    setupEventListeners();
    initializeUniverse();
    animate();
}

function resizeCanvases() {
    DOM.universeCanvas.width = window.innerWidth;
    DOM.universeCanvas.height = window.innerHeight;
    DOM.unknownCanvas.width = window.innerWidth;
    DOM.unknownCanvas.height = window.innerHeight;
    DOM.fieldCanvas.width = window.innerWidth;
    DOM.fieldCanvas.height = window.innerHeight;
}

function initializeUniverse() {
    // Clear all layers
    STATE.layers = [[], [], [], [], []];
    STATE.polarityNodes = [[], [], [], [], []];
    STATE.multitarityLinks = [];

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Initialize each dimensional layer
    for (let layer = 0; layer < 5; layer++) {
        // Create polarity nodes for this layer
        const nodeCount = THEORY.calculatePoles(layer + 2, STATE.polarityStrength);
        
        for (let n = 0; n < nodeCount; n++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            STATE.polarityNodes[layer].push(
                new PolarityNode(x, y, layer, Math.random() * STATE.polarityStrength)
            );
        }

        // Create particles for this layer
        const particlesPerLayer = Math.floor(STATE.particleCount / 5);
        const knownCount = Math.ceil(particlesPerLayer * STATE.knownRatio);

        // Known particles
        for (let i = 0; i < knownCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            STATE.layers[layer].push(
                new UniverseParticle(x, y, layer, true)
            );
        }

        // Unknown particles
        for (let i = 0; i < particlesPerLayer - knownCount; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            STATE.layers[layer].push(
                new UniverseParticle(x, y, layer, false)
            );
        }
    }

    // Initialize multitarity links
    createMultitarityLinks();
    
    updateStats();
}

function createMultitarityLinks() {
    STATE.multitarityLinks = [];
    
    if (STATE.multitarityDensity < 1) return;

    // Create links between particles in different layers
    const linkProbability = STATE.multitarityDensity / 1000;
    
    for (let l1 = 0; l1 < 5; l1++) {
        for (let l2 = l1 + 1; l2 < 5; l2++) {
            for (let p1 of STATE.layers[l1]) {
                for (let p2 of STATE.layers[l2]) {
                    if (Math.random() < linkProbability) {
                        STATE.multitarityLinks.push(
                            new MultitarityLink(p1, p2, Math.random())
                        );
                    }
                }
            }
        }
    }
}

function setupEventListeners() {
    // Theory parameters
    DOM.knownRatioSlider.addEventListener('input', (e) => {
        STATE.knownRatio = parseInt(e.target.value) / 100;
        DOM.knownRatioValue.textContent = e.target.value + '%';
        initializeUniverse();
    });

    DOM.infinitySlider.addEventListener('input', (e) => {
        STATE.infinityParam = parseInt(e.target.value);
        DOM.infinityValue.textContent = STATE.infinityParam;
    });

    DOM.dimensionalitySlider.addEventListener('input', (e) => {
        STATE.currentDimensionality = parseInt(e.target.value);
        DOM.dimensionalityValue.textContent = STATE.currentDimensionality + 'D';
    });

    DOM.polaritySlider.addEventListener('input', (e) => {
        STATE.polarityStrength = parseFloat(e.target.value);
        DOM.polarityValue.textContent = STATE.polarityStrength.toFixed(1);
        initializeUniverse();
    });

    DOM.multitaritySlider.addEventListener('input', (e) => {
        STATE.multitarityDensity = parseInt(e.target.value);
        DOM.multitarityValue.textContent = STATE.multitarityDensity + '%';
        createMultitarityLinks();
    });

    // Visualization parameters
    DOM.speedSlider.addEventListener('input', (e) => {
        STATE.speed = parseInt(e.target.value);
        DOM.speedValue.textContent = STATE.speed + 'x';
    });

    DOM.particleSlider.addEventListener('input', (e) => {
        STATE.particleCount = parseInt(e.target.value);
        DOM.particleValue.textContent = STATE.particleCount;
        initializeUniverse();
    });

    DOM.connectionSlider.addEventListener('input', (e) => {
        STATE.connectionRange = parseInt(e.target.value);
        DOM.connectionValue.textContent = STATE.connectionRange + 'px';
    });

    DOM.unknownAlphaSlider.addEventListener('input', (e) => {
        STATE.unknownAlpha = parseInt(e.target.value);
        DOM.unknownAlphaValue.textContent = STATE.unknownAlpha + '%';
    });

    // Buttons
    DOM.pauseBtn.addEventListener('click', () => {
        STATE.isRunning = !STATE.isRunning;
        DOM.pauseBtn.textContent = STATE.isRunning ? '⏸ Pause' : '▶ Play';
        DOM.statusDisplay.textContent = STATE.isRunning ? 'Running' : 'Paused';
    });

    DOM.resetBtn.addEventListener('click', () => {
        initializeUniverse();
        STATE.isRunning = true;
        DOM.pauseBtn.textContent = '⏸ Pause';
        DOM.statusDisplay.textContent = 'Running';
    });

    DOM.exportBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = DOM.universeCanvas.toDataURL('image/png');
        link.download = `universe-${Date.now()}.png`;
        link.click();
    });

    DOM.infoBtn.addEventListener('click', () => {
        DOM.infoModal.classList.remove('hidden');
    });

    document.querySelector('.modal-close').addEventListener('click', () => {
        DOM.infoModal.classList.add('hidden');
    });

    DOM.collapseBtn.addEventListener('click', () => {
        DOM.controlPanel.classList.toggle('collapsed');
    });

    // Layer buttons
    DOM.layerBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            STATE.currentLayer = idx;
            DOM.layerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const layerNames = ['Planck', 'Quantum', 'Atomic', 'Cosmic', 'Meta'];
            DOM.layerDisplay.textContent = layerNames[idx];
        });
    });

    window.addEventListener('resize', resizeCanvases);
}

// ===== ANIMATION LOOP =====

function animate() {
    // Clear canvases
    DOM.ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    DOM.ctx.fillRect(0, 0, DOM.universeCanvas.width, DOM.universeCanvas.height);

    DOM.unknownCtx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    DOM.unknownCtx.fillRect(0, 0, DOM.unknownCanvas.width, DOM.unknownCanvas.height);

    DOM.fieldCtx.clearRect(0, 0, DOM.fieldCanvas.width, DOM.fieldCanvas.height);

    if (STATE.isRunning) {
        // Update all layers
        for (let layer = 0; layer < 5; layer++) {
            // Update polarity nodes
            STATE.polarityNodes[layer].forEach(node => node.update());

            // Update particles
            STATE.layers[layer].forEach(particle => {
                particle.update(
                    STATE.polarityNodes[layer],
                    STATE.speed
                );
            });
        }

        // Update multitarity links
        STATE.multitarityLinks = STATE.multitarityLinks.filter(link => link.update());

        // Draw layers
        drawLayers();
    }

    updateStats();

    // FPS
    STATE.frameCount++;
    const now = Date.now();
    if (now - STATE.lastTime >= 1000) {
        STATE.fps = STATE.frameCount;
        STATE.frameCount = 0;
        STATE.lastTime = now;
        DOM.fpsCount.textContent = STATE.fps;
    }

    requestAnimationFrame(animate);
}

function drawLayers() {
    const layersToDraw = STATE.currentLayer === 4 ? 
        [0, 1, 2, 3, 4] : [STATE.currentLayer];

    layersToDraw.forEach(layer => {
        const alpha = STATE.currentLayer === 4 ? 0.2 + (4 - layer) * 0.1 : 1;

        // Draw polarity fields
        if (DOM.showPolarity.checked) {
            STATE.polarityNodes[layer].forEach(node => {
                node.draw(DOM.fieldCtx, alpha);
            });
        }

        // Draw particles
        if (DOM.showKnown.checked || DOM.showUnknown.checked) {
            STATE.layers[layer].forEach(particle => {
                if (particle.isKnown && !DOM.showKnown.checked) return;
                if (!particle.isKnown && !DOM.showUnknown.checked) return;

                particle.draw(
                    particle.isKnown ? DOM.ctx : DOM.unknownCtx,
                    STATE.knownRatio,
                    STATE.unknownAlpha
                );
            });
        }

        // Draw multitarity links
        if (DOM.showMultitarity.checked && STATE.currentLayer === 4) {
            STATE.multitarityLinks.forEach(link => {
                link.draw(DOM.fieldCtx, 0.5);
            });
        }
    });

    // Draw dimensional axes
    if (DOM.showDimensions.checked) {
        drawDimensionalAxes();
    }
}

function drawDimensionalAxes() {
    const cx = DOM.universeCanvas.width / 2;
    const cy = DOM.universeCanvas.height / 2;
    const length = 100;

    // Draw axes
    const axes = [
        { color: '#ff0000', dx: length, dy: 0, label: 'X' },
        { color: '#00ff00', dx: 0, dy: length, label: 'Y' },
        { color: '#0000ff', dx: length * 0.7, dy: length * 0.7, label: 'Z' }
    ];

    axes.forEach(axis => {
        DOM.fieldCtx.strokeStyle = axis.color;
        DOM.fieldCtx.lineWidth = 1;
        DOM.fieldCtx.globalAlpha = 0.3;
        DOM.fieldCtx.beginPath();
        DOM.fieldCtx.moveTo(cx, cy);
        DOM.fieldCtx.lineTo(cx + axis.dx, cy + axis.dy);
        DOM.fieldCtx.stroke();
        DOM.fieldCtx.globalAlpha = 1;
    });
}

function updateStats() {
    // Calculate metrics
    let totalKnown = 0, totalUnknown = 0;
    STATE.layers.forEach(layer => {
        layer.forEach(p => {
            if (p.isKnown) totalKnown++;
            else totalUnknown++;
        });
    });

    const total = totalKnown + totalUnknown;
    const knownPercent = Math.round((totalKnown / total) * 100);
    const unknownPercent = 100 - knownPercent;

    DOM.knownSpace.textContent = knownPercent + '%';
    DOM.unknownSpace.textContent = unknownPercent + '%';
    DOM.dimensional.textContent = STATE.currentDimensionality + 'D';

    // Polarity nodes
    let totalNodes = 0;
    STATE.polarityNodes.forEach(layer => totalNodes += layer.length);
    DOM.polarityNodes.textContent = totalNodes;

    // Multitarity links
    DOM.multitarityLinks.textContent = STATE.multitarityLinks.length;

    // Deep's Paradox index
    let deepIndex = 0;
    STATE.layers.forEach(layer => {
        layer.forEach(p => deepIndex += p.depth);
    });
    DOM.deepIndex.textContent = Math.round(deepIndex);

    // Coherence and Entropy
    const avgActivation = STATE.layers.flat().reduce((a, b) => a + b.activation, 0) / total;
    DOM.coherenceK.textContent = Math.round(avgActivation * 100) + '%';
    DOM.entropyU.textContent = Math.round((1 - avgActivation) * 100) + '%';

    // Stability (inverse of entropy)
    DOM.stability.textContent = Math.round(avgActivation * 100) + '%';
}

// ===== STARTUP =====

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}