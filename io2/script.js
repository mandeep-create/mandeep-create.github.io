/*! IO2 · Multi-Agent AI Network
   © 2026 Mandeep S. Bhullar · SpinalXeno™. All rights reserved. SpinalXeno™ is a trademark of Mandeep S. Bhullar.
   Unauthorized copying, modification or redistribution of this code is prohibited.
   Digitally signed by SpinalXeno, signing key fingerprint (SHA-256) 25666eb2cf27368640bb41154733bfdc1f8a07b194aec7661659fc7b565155b3 */
// ===== CONFIGURATION =====

const CONFIG = {
    MODELS: {
        INTERNAL: 'internal',    // Green - Local processing
        CLOUD: 'cloud',          // Pink - Remote processing
        EXTERNAL: 'external'     // Cyan - Third-party
    },
    LOGIC_MODES: {
        // Foundation modes
        DREAM: 'dream',
        THINKING: 'thinking',
        MEMORY: 'memory',
        LEARNING: 'learning',
        CHAOS: 'chaos',
        // Advanced logic modes
        REASONING: 'reasoning',           // Logical inference chains
        PATTERN_RECOGNITION: 'pattern_recognition', // Feature extraction
        REINFORCEMENT: 'reinforcement',   // Reward optimization
        GRADIENT_DESCENT: 'gradient_descent', // Loss minimization
        CLUSTERING: 'clustering',         // Group formation
        OPTIMIZATION: 'optimization',     // Parameter tuning
        PREDICTION: 'prediction',         // Future modeling
        ANOMALY_DETECTION: 'anomaly_detection', // Outlier identification
        CONSENSUS: 'consensus',           // Agreement seeking
        ADVERSARIAL: 'adversarial'        // Competitive training
    },
    INTERACTIONS: {
        COOPERATIVE: 'cooperative',       // Assist each other
        COMPETITIVE: 'competitive',       // Compete for resources
        INDEPENDENT: 'independent',       // Separate operation
        HIERARCHICAL: 'hierarchical',     // Command structure
        SWARM: 'swarm'                    // Emergent behavior
    },
    CONNECTOR_TYPES: {
        SOLID: 'solid',                   // Strong connections
        DOTTED: 'dotted',                 // Weak connections
        PULSING: 'pulsing',               // Active communication
        ARROW: 'arrow',                   // Directional flow
        RAINBOW: 'rainbow'                // Cross-model
    },
    COLORS: {
        INTERNAL: { r: 0, g: 255, b: 136 },
        CLOUD: { r: 255, g: 0, b: 110 },
        EXTERNAL: { r: 0, g: 217, b: 255 },
        CONNECTION: { r: 255, g: 170, b: 0 },
        BG: { r: 5, g: 8, b: 16 }
    }
};

// ===== VISUAL THEMES =====

const rgb = (r, g, b) => ({ r, g, b });
const THEMES = {
    cyberpunk: { internal: rgb(0, 255, 136),  cloud: rgb(255, 0, 110),   external: rgb(0, 217, 255),  connection: rgb(255, 170, 0),   bg: rgb(5, 8, 16) },
    matrix:    { internal: rgb(0, 255, 65),   cloud: rgb(170, 255, 0),   external: rgb(0, 200, 170),  connection: rgb(210, 255, 210), bg: rgb(0, 6, 2) },
    aurora:    { internal: rgb(124, 255, 203), cloud: rgb(179, 136, 255), external: rgb(72, 201, 255), connection: rgb(255, 240, 170), bg: rgb(4, 8, 20) },
    quantum:   { internal: rgb(164, 107, 255), cloud: rgb(255, 79, 216),  external: rgb(79, 209, 255), connection: rgb(255, 255, 255), bg: rgb(6, 3, 16) },
    organic:   { internal: rgb(155, 229, 100), cloud: rgb(255, 179, 71),  external: rgb(224, 122, 95), connection: rgb(240, 220, 170), bg: rgb(10, 8, 4) },
    neon:      { internal: rgb(255, 0, 255),  cloud: rgb(255, 255, 0),   external: rgb(0, 255, 255),  connection: rgb(255, 80, 80),   bg: rgb(0, 0, 0) }
};

const rgba = (c, a) => `rgba(${c.r | 0}, ${c.g | 0}, ${c.b | 0}, ${a})`;
const mix = (a, b, t) => rgb(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);

let nextParticleId = 0;

// ===== ADVANCED PARTICLE CLASS =====

class AdvancedParticle {
    constructor(x, y, model) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.ax = 0;
        this.ay = 0;
        
        this.model = model;
        this.mass = Math.random() * 0.5 + 0.5;
        this.charge = Math.random() > 0.5 ? 1 : -1;
        
        this.activation = 0;
        this.maxActivation = Math.random() * 0.6 + 0.4;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        this.memory = [];
        this.trail = [];
        this.maxTrailLength = 20;
        
        this.homeX = x;
        this.homeY = y;
        this.distanceFromHome = 0;
        
        // Advanced attributes
        this.reward = 0;
        this.gradient = 0;
        this.clusterId = -1;
        this.confidence = Math.random();
        this.messageQueue = [];
        this.lastMessageTime = 0;
        this.communicationPartner = null;
        this.id = nextParticleId++;
    }

    update(sameModelParticles, otherModelParticles, mode, speed, connectionRange, interactionMode) {
        this.ax = 0;
        this.ay = 0;

        // Apply logic mode behavior
        this.applyLogicMode(sameModelParticles, mode, connectionRange);

        // Apply interaction mode behavior
        this.applyInteractionMode(
            sameModelParticles, 
            otherModelParticles, 
            interactionMode, 
            connectionRange
        );

        // Cursor probe - attention pulls nearby agents in and wakes them up
        const mouse = STATE.mouse;
        if (mouse.active) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 160 && dist > 1) {
                const k = 1 - dist / 160;
                this.ax += (dx / dist) * 0.02 * k;
                this.ay += (dy / dist) * 0.02 * k;
                this.activation += 0.05 * k;
            }
        }

        // Physics
        this.vx += this.ax;
        this.vy += this.ay;
        this.vx *= 0.97;
        this.vy *= 0.97;

        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Boundary wrapping (the trail restarts so it doesn't streak across the screen)
        let wrapped = true;
        if (this.x < 0) this.x = window.innerWidth;
        else if (this.x > window.innerWidth) this.x = 0;
        else if (this.y < 0) this.y = window.innerHeight;
        else if (this.y > window.innerHeight) this.y = 0;
        else wrapped = false;
        if (wrapped) this.trail.length = 0;

        // Update distance from home
        this.distanceFromHome = Math.hypot(this.x - this.homeX, this.y - this.homeY);

        // Decay activation
        this.activation = Math.min(1, Math.max(0, this.activation - 0.015));
        this.pulsePhase += 0.05;

        // Update trail
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Memory management
        if (Math.random() < 0.03) {
            this.memory.push({x: this.x, y: this.y});
            if (this.memory.length > 50) this.memory.shift();
        }
    }

    applyLogicMode(particles, mode, range) {
        switch(mode) {
            case CONFIG.LOGIC_MODES.DREAM:
                this.dreamLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.THINKING:
                this.thinkingLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.MEMORY:
                this.memoryLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.LEARNING:
                this.learningLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.CHAOS:
                this.chaosLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.REASONING:
                this.reasoningLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.PATTERN_RECOGNITION:
                this.patternRecognitionLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.REINFORCEMENT:
                this.reinforcementLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.GRADIENT_DESCENT:
                this.gradientDescentLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.CLUSTERING:
                this.clusteringLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.OPTIMIZATION:
                this.optimizationLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.PREDICTION:
                this.predictionLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.ANOMALY_DETECTION:
                this.anomalyDetectionLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.CONSENSUS:
                this.consensusLogic(particles, range);
                break;
            case CONFIG.LOGIC_MODES.ADVERSARIAL:
                this.adversarialLogic(particles, range);
                break;
        }
    }

    // ===== FOUNDATION LOGIC MODES =====

    dreamLogic(particles, range) {
        this.ax += (Math.random() - 0.5) * 0.3;
        this.ay += (Math.random() - 0.5) * 0.3;

        particles.forEach(p => {
            if (p === this) return;
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < range && dist > 0) {
                const force = 0.001 / dist;
                this.ax += (dx / dist) * force;
                this.ay += (dy / dist) * force;
            }
        });

        const homeDx = this.homeX - this.x;
        const homeDy = this.homeY - this.y;
        this.ax += homeDx * 0.0005;
        this.ay += homeDy * 0.0005;

        this.activation += Math.random() * 0.4;
    }

    thinkingLogic(particles, range) {
        let nearbyCount = 0;
        particles.forEach(p => {
            if (p === this) return;
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < range && dist > 5) {
                nearbyCount++;
                const force = 0.0015 / dist;
                this.ax += (dx / dist) * force;
                this.ay += (dy / dist) * force;
            }
        });

        this.activation += nearbyCount * 0.02;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const toCenterX = centerX - this.x;
        const toCenterY = centerY - this.y;
        this.ax += toCenterX * 0.0001;
        this.ay += toCenterY * 0.0001;
    }

    memoryLogic(particles, range) {
        if (this.memory.length > 0 && Math.random() < 0.05) {
            const memory = this.memory[Math.floor(Math.random() * this.memory.length)];
            const dx = memory.x - this.x;
            const dy = memory.y - this.y;
            const dist = Math.hypot(dx, dy) + 1;
            this.ax += (dx / dist) * 0.002;
            this.ay += (dy / dist) * 0.002;
            this.activation = Math.min(this.maxActivation, this.activation + 0.25);
        }

        particles.forEach(p => {
            if (p === this) return;
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < range * 1.5 && dist > 0) {
                const force = 0.002 / dist;
                this.ax += (dx / dist) * force;
                this.ay += (dy / dist) * force;
            }
        });
    }

    learningLogic(particles, range) {
        particles.forEach(p => {
            if (p === this) return;
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < range && dist > 0) {
                const force = 0.0025 / (1 + dist * 0.01);
                this.ax += (dx / dist) * force;
                this.ay += (dy / dist) * force;
                this.activation += 0.01;
            }
        });

        if (Math.random() < 0.02) {
            this.vx *= 1.1;
            this.vy *= 1.1;
        }
    }

    chaosLogic(particles, range) {
        this.ax += (Math.random() - 0.5) * 0.8;
        this.ay += (Math.random() - 0.5) * 0.8;

        particles.forEach(p => {
            if (p === this) return;
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            const dist = Math.hypot(dx, dy) + 1;

            if (dist < range) {
                const force = -0.003 / dist;
                this.ax += (dx / dist) * force;
                this.ay += (dy / dist) * force;
            }
        });

        this.activation += Math.random() * 0.7;
    }

    // ===== ADVANCED LOGIC MODES =====

    reasoningLogic(particles, range) {
        // Logical inference chains - particles follow each other in sequence
        let nearest = null;
        let nearestDist = range;

        particles.forEach(p => {
            if (p === this) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < nearestDist && p.activation > this.activation) {
                nearest = p;
                nearestDist = dist;
            }
        });

        if (nearest) {
            const dx = nearest.x - this.x;
            const dy = nearest.y - this.y;
            const dist = Math.hypot(dx, dy);
            const force = 0.003 / dist;
            this.ax += (dx / dist) * force;
            this.ay += (dy / dist) * force;
            this.activation += 0.03;
        }

        // Weak random exploration
        this.ax += (Math.random() - 0.5) * 0.1;
        this.ay += (Math.random() - 0.5) * 0.1;
    }

    patternRecognitionLogic(particles, range) {
        // Feature extraction - particles align with common patterns
        let alignmentX = 0, alignmentY = 0, alignmentCount = 0;

        particles.forEach(p => {
            if (p === this) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < range && dist > 0) {
                alignmentX += p.vx;
                alignmentY += p.vy;
                alignmentCount++;
            }
        });

        if (alignmentCount > 0) {
            this.ax += (alignmentX / alignmentCount) * 0.001;
            this.ay += (alignmentY / alignmentCount) * 0.001;
            this.activation += alignmentCount * 0.01;
        }
    }

    reinforcementLogic(particles, range) {
        // Reward-driven optimization
        let rewardSignal = 0;
        let rewardCount = 0;

        particles.forEach(p => {
            if (p === this || p.activation <= 0) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < range) {
                rewardSignal += p.activation;
                rewardCount++;
            }
        });

        if (rewardCount > 0) {
            this.reward = rewardSignal / rewardCount;
            // Move toward high reward
            const dx = this.reward > 0.5 ? Math.random() - 0.5 : -(Math.random() - 0.5);
            const dy = this.reward > 0.5 ? Math.random() - 0.5 : -(Math.random() - 0.5);
            this.ax += dx * this.reward;
            this.ay += dy * this.reward;
        }

        this.activation += this.reward * 0.02;
    }

    gradientDescentLogic(particles, range) {
        // Loss minimization - move toward lower "loss"
        let gradient = 0;
        let minActivation = this.activation;
        let downwardX = 0, downwardY = 0;

        particles.forEach(p => {
            if (p === this) return;
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < range && dist > 0) {
                if (p.activation < minActivation) {
                    downwardX = dx / dist;
                    downwardY = dy / dist;
                    minActivation = p.activation;
                    gradient = 0.003;
                }
            }
        });

        this.ax -= downwardX * gradient;
        this.ay -= downwardY * gradient;
        this.gradient = gradient;
    }

    clusteringLogic(particles, range) {
        // Group formation - particles cluster with similar particles
        let centroidX = 0, centroidY = 0, clusterSize = 0;

        particles.forEach(p => {
            if (p === this) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < range && dist > 0) {
                centroidX += p.x;
                centroidY += p.y;
                clusterSize++;
            }
        });

        if (clusterSize > 0) {
            centroidX /= clusterSize;
            centroidY /= clusterSize;
            const dx = centroidX - this.x;
            const dy = centroidY - this.y;
            const dist = Math.hypot(dx, dy) + 1;
            this.ax += (dx / dist) * 0.002;
            this.ay += (dy / dist) * 0.002;
            this.clusterId = Math.floor(centroidX / 100 + centroidY / 100);
            this.activation += clusterSize * 0.005;
        }
    }

    optimizationLogic(particles, range) {
        // Parameter tuning - adjust movement based on neighbors
        let optimalX = this.x, optimalY = this.y;
        let bestFitness = -Infinity;

        particles.forEach(p => {
            if (p === this) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < range) {
                const fitness = p.activation * (range - dist) / range;
                if (fitness > bestFitness) {
                    bestFitness = fitness;
                    optimalX = p.x;
                    optimalY = p.y;
                }
            }
        });

        if (bestFitness > -Infinity) {
            const dx = optimalX - this.x;
            const dy = optimalY - this.y;
            const dist = Math.hypot(dx, dy) + 1;
            this.ax += (dx / dist) * 0.002;
            this.ay += (dy / dist) * 0.002;
        }
    }

    predictionLogic(particles, range) {
        // Future modeling - extrapolate particle trajectories
        particles.forEach(p => {
            if (p === this) return;
            const dx = p.x - this.x;
            const dy = p.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < range && dist > 0) {
                // Move toward predicted future position
                const futureX = p.x + p.vx * 10;
                const futureY = p.y + p.vy * 10;
                const predDx = futureX - this.x;
                const predDy = futureY - this.y;
                const predDist = Math.hypot(predDx, predDy) + 1;
                this.ax += (predDx / predDist) * 0.0015;
                this.ay += (predDy / predDist) * 0.0015;
            }
        });
    }

    anomalyDetectionLogic(particles, range) {
        // Outlier identification - avoid unusual particles
        let meanActivation = 0;
        let count = 0;

        particles.forEach(p => {
            if (p === this) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < range) {
                meanActivation += p.activation;
                count++;
            }
        });

        if (count > 0) {
            meanActivation /= count;
            particles.forEach(p => {
                if (p === this) return;
                const dist = Math.hypot(p.x - this.x, p.y - this.y);
                if (dist < range && Math.abs(p.activation - meanActivation) > meanActivation * 0.5) {
                    // Repel from anomalies
                    const dx = p.x - this.x;
                    const dy = p.y - this.y;
                    this.ax -= (dx / dist) * 0.002;
                    this.ay -= (dy / dist) * 0.002;
                    this.activation += 0.02;
                }
            });
        }
    }

    consensusLogic(particles, range) {
        // Agreement seeking - move toward center of active particles
        let consensusX = 0, consensusY = 0, consensusCount = 0;

        particles.forEach(p => {
            if (p === this || p.activation < 0.3) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < range) {
                consensusX += p.x;
                consensusY += p.y;
                consensusCount++;
            }
        });

        if (consensusCount > 0) {
            consensusX /= consensusCount;
            consensusY /= consensusCount;
            const dx = consensusX - this.x;
            const dy = consensusY - this.y;
            const dist = Math.hypot(dx, dy) + 1;
            this.ax += (dx / dist) * 0.0025;
            this.ay += (dy / dist) * 0.0025;
            this.activation += consensusCount * 0.008;
        }
    }

    adversarialLogic(particles, range) {
        // Competitive training - compete with similar particles
        let competitor = null;
        let maxConflict = 0;

        particles.forEach(p => {
            if (p === this) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if (dist < range) {
                const conflict = Math.abs(p.activation - this.activation);
                if (conflict > maxConflict) {
                    maxConflict = conflict;
                    competitor = p;
                }
            }
        });

        if (competitor) {
            // Move away from competitor
            const dx = competitor.x - this.x;
            const dy = competitor.y - this.y;
            const dist = Math.hypot(dx, dy) + 1;
            this.ax -= (dx / dist) * 0.003;
            this.ay -= (dy / dist) * 0.003;
            this.activation += 0.03;
        }

        // Spontaneous activation increase
        this.activation += Math.random() * 0.1;
    }

    // ===== INTERACTION MODES =====

    applyInteractionMode(sameModel, otherModels, mode, range) {
        switch(mode) {
            case CONFIG.INTERACTIONS.COOPERATIVE:
                this.cooperativeInteraction(otherModels, range);
                break;
            case CONFIG.INTERACTIONS.COMPETITIVE:
                this.competitiveInteraction(otherModels, range);
                break;
            case CONFIG.INTERACTIONS.INDEPENDENT:
                // No cross-model interaction
                break;
            case CONFIG.INTERACTIONS.HIERARCHICAL:
                this.hierarchicalInteraction(otherModels, range);
                break;
            case CONFIG.INTERACTIONS.SWARM:
                this.swarmInteraction(sameModel, otherModels, range);
                break;
        }
    }

    cooperativeInteraction(otherModels, range) {
        // Assist other models - move toward them
        otherModels.forEach(other => {
            const dist = Math.hypot(other.x - this.x, other.y - this.y);
            if (dist < range * 1.5 && dist > 0) {
                const force = 0.0008 / dist;
                this.ax += (other.x - this.x) / dist * force;
                this.ay += (other.y - this.y) / dist * force;
                other.activation += 0.005;
            }
        });
    }

    competitiveInteraction(otherModels, range) {
        // Compete for resources - repel other models
        otherModels.forEach(other => {
            const dist = Math.hypot(other.x - this.x, other.y - this.y);
            if (dist < range * 2 && dist > 0) {
                const force = -0.0012 / dist;
                this.ax += (other.x - this.x) / dist * force;
                this.ay += (other.y - this.y) / dist * force;
                this.activation += 0.01;
            }
        });
    }

    hierarchicalInteraction(otherModels, range) {
        // Follow command structure based on model priority
        const modelPriority = {
            [CONFIG.MODELS.INTERNAL]: 3,
            [CONFIG.MODELS.CLOUD]: 2,
            [CONFIG.MODELS.EXTERNAL]: 1
        };

        const myPriority = modelPriority[this.model];

        otherModels.forEach(other => {
            const otherPriority = modelPriority[other.model];
            const dist = Math.hypot(other.x - this.x, other.y - this.y);

            if (dist < range * 2 && dist > 0) {
                if (otherPriority > myPriority) {
                    // Follow higher priority
                    const force = 0.001 / dist;
                    this.ax += (other.x - this.x) / dist * force;
                    this.ay += (other.y - this.y) / dist * force;
                } else if (otherPriority < myPriority) {
                    // Command lower priority
                    const force = -0.0008 / dist;
                    this.ax += (other.x - this.x) / dist * force;
                    this.ay += (other.y - this.y) / dist * force;
                }
            }
        });
    }

    swarmInteraction(sameModel, otherModels, range) {
        // Local rules creating emergent behavior
        // Separation, alignment, cohesion + cross-model interaction

        let sepX = 0, sepY = 0;
        let aliX = 0, aliY = 0;
        let cohX = 0, cohY = 0;
        let sepCount = 0, aliCount = 0, cohCount = 0;

        sameModel.forEach(p => {
            if (p === this) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);

            if (dist < range && dist > 0) {
                // Separation
                sepX -= (p.x - this.x) / dist;
                sepY -= (p.y - this.y) / dist;
                sepCount++;

                // Alignment
                aliX += p.vx;
                aliY += p.vy;
                aliCount++;

                // Cohesion
                cohX += p.x;
                cohY += p.y;
                cohCount++;
            }
        });

        if (sepCount > 0) this.ax += sepX * 0.001;
        if (aliCount > 0) this.ax += (aliX / aliCount) * 0.0005;
        if (cohCount > 0) this.ax += (cohX / cohCount - this.x) * 0.0003;

        if (sepCount > 0) this.ay += sepY * 0.001;
        if (aliCount > 0) this.ay += (aliY / aliCount) * 0.0005;
        if (cohCount > 0) this.ay += (cohY / cohCount - this.y) * 0.0003;

        // Weak cross-model attraction
        otherModels.forEach(other => {
            const dist = Math.hypot(other.x - this.x, other.y - this.y);
            if (dist < range * 1.2 && dist > 0) {
                const force = 0.0003 / dist;
                this.ax += (other.x - this.x) / dist * force;
                this.ay += (other.y - this.y) / dist * force;
            }
        });
    }

    getColor() {
        const colors = CONFIG.COLORS;
        switch(this.model) {
            case CONFIG.MODELS.INTERNAL:
                return colors.INTERNAL;
            case CONFIG.MODELS.CLOUD:
                return colors.CLOUD;
            case CONFIG.MODELS.EXTERNAL:
                return colors.EXTERNAL;
            default:
                return colors.INTERNAL;
        }
    }

    draw(ctx) {
        const color = this.getColor();
        const a = this.activation;

        // Draw trail
        if (this.trail.length > 1 && a > 0.02) {
            ctx.strokeStyle = rgba(color, a * 0.25);
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        const radius = 1.5 + a * 3.5;

        // Glow halo (additive, much cheaper than shadowBlur)
        if (a > 0.15) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = rgba(color, a * 0.12);
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius * 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        // Core
        ctx.fillStyle = rgba(color, 0.55 + a * 0.45);
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Hot white centre when fully fired
        if (a > 0.6) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(a - 0.6) * 1.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// ===== STATE MANAGEMENT =====

const STATE = {
    logicMode: CONFIG.LOGIC_MODES.DREAM,
    interactionMode: CONFIG.INTERACTIONS.COOPERATIVE,
    isRunning: true,
    speed: 1.0,
    particleCount: 80, // per model
    connectionRange: 150,
    crossModelCommunication: 0.5,
    theme: 'cyberpunk',
    
    fps: 60,
    frameCount: 0,
    lastTime: Date.now(),
    
    particles: {
        [CONFIG.MODELS.INTERNAL]: [],
        [CONFIG.MODELS.CLOUD]: [],
        [CONFIG.MODELS.EXTERNAL]: []
    },
    
    connections: [],
    crossModelMessages: [],
    
    neuralActivity: { internal: 0, cloud: 0, external: 0 },
    coherence: 0,
    latency: 0,
    synchronization: 0,

    all: [],
    packets: [],
    rings: [],
    clusters: [],
    shocks: [],
    latencySamples: [],
    mouse: { x: 0, y: 0, active: false },
    frame: 0,
    dpr: 1,
    W: 0,
    H: 0
};

// ===== DOM ELEMENTS =====

const DOM = {
    canvas: document.getElementById('canvas'),
    ctx: null,
    
    // Controls
    logicModeSelect: document.getElementById('logicModeSelect'),
    modelInteraction: document.getElementById('modelInteraction'),
    speedSlider: document.getElementById('speedSlider'),
    particleSlider: document.getElementById('particleSlider'),
    connectionSlider: document.getElementById('connectionSlider'),
    communicationSlider: document.getElementById('communicationSlider'),
    colorSelect: document.getElementById('colorSelect'),
    showConnections: document.getElementById('showConnections'),
    showCommunication: document.getElementById('showCommunication'),
    showClusters: document.getElementById('showClusters'),
    
    // Buttons
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn'),
    infoBtn: document.getElementById('infoBtn'),
    collapseBtn: document.getElementById('collapseBtn'),
    
    // Display
    speedValue: document.getElementById('speedValue'),
    particleValue: document.getElementById('particleValue'),
    connectionValue: document.getElementById('connectionValue'),
    communicationValue: document.getElementById('communicationValue'),
    
    // Stats
    fpsCount: document.getElementById('fpsCount'),
    modeDisplay: document.getElementById('modeDisplay'),
    interactionDisplay: document.getElementById('interactionDisplay'),
    internalActivity: document.getElementById('internalActivity'),
    cloudActivity: document.getElementById('cloudActivity'),
    externalActivity: document.getElementById('externalActivity'),
    internalConnections: document.getElementById('internalConnections'),
    cloudConnections: document.getElementById('cloudConnections'),
    externalConnections: document.getElementById('externalConnections'),
    crossModelConnections: document.getElementById('crossModelConnections'),
    coherenceLevel: document.getElementById('coherenceLevel'),
    latencyLevel: document.getElementById('latencyLevel'),
    syncLevel: document.getElementById('syncLevel'),
    
    // Model indicators
    internalCount: document.querySelector('.internal-model .model-count'),
    cloudCount: document.querySelector('.cloud-model .model-count'),
    externalCount: document.querySelector('.external-model .model-count'),
    
    // Communication
    messageFeed: document.getElementById('messageFeed'),
    feedClearBtn: document.getElementById('feedClearBtn'),
    
    // Modal
    infoModal: document.getElementById('infoModal'),
    controlPanel: document.querySelector('.control-panel')
};

// ===== INITIALIZATION =====

function init() {
    DOM.ctx = DOM.canvas.getContext('2d');

    resizeCanvas();
    applyTheme(DOM.colorSelect.value);
    initializeParticles();
    setupEventListeners();
    requestAnimationFrame(animate);

    addSystemMessage('System initialized...');
}

function resizeCanvas() {
    // Render at device resolution so the network stays sharp on Retina screens
    STATE.dpr = Math.min(window.devicePixelRatio || 1, 2);
    STATE.W = window.innerWidth;
    STATE.H = window.innerHeight;
    DOM.canvas.width = Math.round(STATE.W * STATE.dpr);
    DOM.canvas.height = Math.round(STATE.H * STATE.dpr);
    DOM.ctx.setTransform(STATE.dpr, 0, 0, STATE.dpr, 0, 0);
    paintBackground(1);
    if (!STATE.isRunning) STATE.all.forEach(p => p.draw(DOM.ctx));
}

function paintBackground(alpha) {
    DOM.ctx.fillStyle = rgba(CONFIG.COLORS.BG, alpha);
    DOM.ctx.fillRect(0, 0, STATE.W, STATE.H);
}

function applyTheme(name) {
    const theme = THEMES[name] || THEMES.cyberpunk;
    STATE.theme = name;
    CONFIG.COLORS = {
        INTERNAL: theme.internal,
        CLOUD: theme.cloud,
        EXTERNAL: theme.external,
        CONNECTION: theme.connection,
        BG: theme.bg
    };

    // Re-colour the whole interface to match
    const css = c => `rgb(${c.r}, ${c.g}, ${c.b})`;
    const root = document.documentElement.style;
    root.setProperty('--internal-color', css(theme.internal));
    root.setProperty('--cloud-color', css(theme.cloud));
    root.setProperty('--external-color', css(theme.external));
    root.setProperty('--connection-color', css(theme.connection));
    root.setProperty('--bg-darker', css(theme.bg));

    paintBackground(1);
}

function initializeParticles() {
    STATE.particles[CONFIG.MODELS.INTERNAL] = [];
    STATE.particles[CONFIG.MODELS.CLOUD] = [];
    STATE.particles[CONFIG.MODELS.EXTERNAL] = [];

    // Internal particles - left third
    for (let i = 0; i < STATE.particleCount; i++) {
        const x = Math.random() * (window.innerWidth / 3);
        const y = Math.random() * window.innerHeight;
        STATE.particles[CONFIG.MODELS.INTERNAL].push(
            new AdvancedParticle(x, y, CONFIG.MODELS.INTERNAL)
        );
    }

    // Cloud particles - middle third
    for (let i = 0; i < STATE.particleCount; i++) {
        const x = (window.innerWidth / 3) + Math.random() * (window.innerWidth / 3);
        const y = Math.random() * window.innerHeight;
        STATE.particles[CONFIG.MODELS.CLOUD].push(
            new AdvancedParticle(x, y, CONFIG.MODELS.CLOUD)
        );
    }

    // External particles - right third
    for (let i = 0; i < STATE.particleCount; i++) {
        const x = (2 * window.innerWidth / 3) + Math.random() * (window.innerWidth / 3);
        const y = Math.random() * window.innerHeight;
        STATE.particles[CONFIG.MODELS.EXTERNAL].push(
            new AdvancedParticle(x, y, CONFIG.MODELS.EXTERNAL)
        );
    }

    STATE.all = [
        ...STATE.particles[CONFIG.MODELS.INTERNAL],
        ...STATE.particles[CONFIG.MODELS.CLOUD],
        ...STATE.particles[CONFIG.MODELS.EXTERNAL]
    ];
    STATE.all.forEach((p, i) => { p.idx = i; });
    STATE.packets = [];
    STATE.rings = [];
    STATE.clusters = [];

    addSystemMessage(`Initialized ${STATE.particleCount} particles per model`);
}

function setupEventListeners() {
    DOM.logicModeSelect.addEventListener('change', (e) => {
        STATE.logicMode = e.target.value;
        updateModeDisplay();
        addSystemMessage(`Logic mode switched to: ${STATE.logicMode.toUpperCase()}`);
    });

    DOM.modelInteraction.addEventListener('change', (e) => {
        STATE.interactionMode = e.target.value;
        updateInteractionDisplay();
        addSystemMessage(`Interaction mode: ${STATE.interactionMode.toUpperCase()}`);
    });

    DOM.speedSlider.addEventListener('input', (e) => {
        STATE.speed = parseFloat(e.target.value);
        DOM.speedValue.textContent = STATE.speed.toFixed(1) + 'x';
    });

    DOM.particleSlider.addEventListener('input', (e) => {
        STATE.particleCount = parseInt(e.target.value);
        DOM.particleValue.textContent = STATE.particleCount;
        initializeParticles();
        addSystemMessage(`Particle density: ${STATE.particleCount} per model`);
    });

    DOM.connectionSlider.addEventListener('input', (e) => {
        STATE.connectionRange = parseInt(e.target.value);
        DOM.connectionValue.textContent = STATE.connectionRange + 'px';
    });

    DOM.communicationSlider.addEventListener('input', (e) => {
        STATE.crossModelCommunication = parseFloat(e.target.value);
        DOM.communicationValue.textContent = Math.round(parseFloat(e.target.value) * 100) + '%';
    });

    DOM.colorSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        addSystemMessage(`Visual theme: ${e.target.value.toUpperCase()}`);
    });

    DOM.showClusters.addEventListener('change', () => {
        if (!DOM.showClusters.checked) STATE.clusters = [];
    });

    DOM.pauseBtn.addEventListener('click', togglePause);
    DOM.resetBtn.addEventListener('click', reset);
    DOM.exportBtn.addEventListener('click', exportScreenshot);
    DOM.infoBtn.addEventListener('click', showInfo);
    DOM.collapseBtn.addEventListener('click', toggleControlPanel);
    DOM.feedClearBtn.addEventListener('click', clearFeed);

    document.querySelector('.modal-close').addEventListener('click', hideInfo);
    DOM.infoModal.addEventListener('click', (e) => {
        if (e.target === DOM.infoModal) hideInfo();
    });

    // Cursor probe: hover to focus attention, click to fire a probe pulse
    DOM.canvas.addEventListener('pointermove', (e) => {
        STATE.mouse.x = e.clientX;
        STATE.mouse.y = e.clientY;
        STATE.mouse.active = true;
    });
    DOM.canvas.addEventListener('pointerleave', () => { STATE.mouse.active = false; });
    DOM.canvas.addEventListener('pointerup', (e) => {
        if (e.pointerType !== 'mouse') STATE.mouse.active = false;
    });
    DOM.canvas.addEventListener('pointerdown', (e) => {
        STATE.shocks.push({ x: e.clientX, y: e.clientY });
    });

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', resizeCanvas);
}

function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, select, textarea')) return;
    if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;

    switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); togglePause(); break;
        case 'r': reset(); break;
        case 'i': DOM.infoModal.classList.contains('hidden') ? showInfo() : hideInfo(); break;
        case 'escape': hideInfo(); break;
        case 'h': document.body.classList.toggle('ui-hidden'); break;
        case 'e': exportScreenshot(); break;
        case 'c': DOM.showClusters.click(); break;
    }
}

// ===== SPATIAL GRID =====
// Agents only look at the 3x3 cells around them instead of every agent on screen.

const GRID = { size: 300, cells: new Map() };

function cellKey(cx, cy) {
    return (cx + 10) * 10000 + (cy + 10);
}

function buildGrid(all, size) {
    GRID.size = size;
    GRID.cells.clear();
    for (const p of all) {
        const key = cellKey(Math.floor(p.x / size), Math.floor(p.y / size));
        let cell = GRID.cells.get(key);
        if (!cell) GRID.cells.set(key, cell = []);
        cell.push(p);
    }
}

function forNeighbors(p, fn) {
    const cx = Math.floor(p.x / GRID.size);
    const cy = Math.floor(p.y / GRID.size);
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const cell = GRID.cells.get(cellKey(cx + i, cy + j));
            if (cell) for (let k = 0; k < cell.length; k++) fn(cell[k]);
        }
    }
}

function nearest(particles, x, y) {
    let best = null, bestD = Infinity;
    for (const p of particles) {
        const d = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (d < bestD) { bestD = d; best = p; }
    }
    return best;
}

// ===== ANIMATION LOOP =====

function animate() {
    if (STATE.isRunning) {
        // Fade the previous frame for motion trails
        paintBackground(0.1);

        const all = STATE.all;
        // Cell size covers the furthest reach of any behaviour (2x connection range)
        buildGrid(all, STATE.connectionRange * 2);

        const same = [], other = [];
        for (const particle of all) {
            same.length = 0;
            other.length = 0;
            forNeighbors(particle, q => (q.model === particle.model ? same : other).push(q));
            particle.update(
                same,
                other,
                STATE.logicMode,
                STATE.speed,
                STATE.connectionRange,
                STATE.interactionMode
            );
        }

        applyShocks();
        computePairs(all);

        // Draw connections
        drawConnections();

        // Clusters
        if (DOM.showClusters.checked) {
            if (STATE.frame % 15 === 0) findClusters();
            drawClusters();
        }

        // Draw particles
        all.forEach(particle => particle.draw(DOM.ctx));

        // Messages in flight
        updatePackets();
        drawProbe();

        // Generate cross-model communications
        if (Math.random() < STATE.crossModelCommunication * 0.05) {
            generateCrossModelCommunication();
        }

        // Update statistics (a few times a second is plenty for the DOM)
        if (STATE.frame % 6 === 0) updateStats();
        STATE.frame++;
    }

    // FPS counter
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

// ===== CONNECTIONS =====

const PAIRS = { same: [], cross: [], counts: { internal: 0, cloud: 0, external: 0, cross: 0 } };

function computePairs(all) {
    const range = STATE.connectionRange;
    const far = range * 1.5;
    const r2 = range * range;
    const f2 = far * far;
    const counts = PAIRS.counts;

    // Flat [p1, p2, distance, ...] lists, rebuilt each frame
    PAIRS.same.length = 0;
    PAIRS.cross.length = 0;
    counts.internal = counts.cloud = counts.external = counts.cross = 0;

    for (const p of all) {
        forNeighbors(p, q => {
            if (q.id <= p.id) return;
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const d2 = dx * dx + dy * dy;
            if (q.model === p.model) {
                if (d2 < r2) {
                    PAIRS.same.push(p, q, Math.sqrt(d2));
                    counts[p.model]++;
                }
            } else if (d2 < f2) {
                PAIRS.cross.push(p, q, Math.sqrt(d2));
                counts.cross++;
            }
        });
    }
}

function drawConnections() {
    const ctx = DOM.ctx;
    const range = STATE.connectionRange;
    const far = range * 1.5;

    // Same-model links (solid), batched by model and opacity band: one stroke per band
    if (DOM.showConnections.checked) {
        const bands = new Map();
        const s = PAIRS.same;
        for (let i = 0; i < s.length; i += 3) {
            const p1 = s[i], p2 = s[i + 1], d = s[i + 2];
            const opacity = (1 - d / range) * (p1.activation + p2.activation) / 2 * 0.6;
            if (opacity <= 0.02) continue;

            const band = Math.min(9, (opacity * 10) | 0);
            const key = p1.model + band;
            let b = bands.get(key);
            if (!b) bands.set(key, b = { color: p1.getColor(), band, pts: [] });
            b.pts.push(p1.x, p1.y, p2.x, p2.y);

            // Strong links occasionally carry a data pulse
            if (opacity > 0.3 && STATE.packets.length < 60 && Math.random() < 0.0008) {
                sendPacket(p1, p2, null);
            }
        }

        bands.forEach(b => {
            const o = (b.band + 0.5) / 10;
            ctx.strokeStyle = rgba(b.color, o);
            ctx.lineWidth = 0.5 + o * 1.5;
            ctx.beginPath();
            for (let i = 0; i < b.pts.length; i += 4) {
                ctx.moveTo(b.pts[i], b.pts[i + 1]);
                ctx.lineTo(b.pts[i + 2], b.pts[i + 3]);
            }
            ctx.stroke();
        });
    }

    // Cross-model links: faint ones dotted, strong ones as rainbow gradients between the two models
    if (DOM.showCommunication.checked && STATE.crossModelCommunication > 0) {
        const comm = STATE.crossModelCommunication;
        const c = PAIRS.cross;
        const dotted = new Map();
        const bright = [];

        for (let i = 0; i < c.length; i += 3) {
            const p1 = c[i], p2 = c[i + 1], d = c[i + 2];
            const opacity = (1 - d / far) * (p1.activation + p2.activation) / 2 * comm * 0.4;
            if (opacity <= 0.01) continue;

            if (opacity > 0.1 && bright.length < 240) {
                bright.push(p1, p2, opacity);
            } else {
                const band = Math.min(9, (opacity * 20) | 0);
                let pts = dotted.get(band);
                if (!pts) dotted.set(band, pts = []);
                pts.push(p1.x, p1.y, p2.x, p2.y);
            }
        }

        ctx.setLineDash([2, 3]);
        dotted.forEach((pts, band) => {
            const o = (band + 0.5) / 20;
            ctx.strokeStyle = rgba(CONFIG.COLORS.CONNECTION, o);
            ctx.lineWidth = 0.3 + o;
            ctx.beginPath();
            for (let i = 0; i < pts.length; i += 4) {
                ctx.moveTo(pts[i], pts[i + 1]);
                ctx.lineTo(pts[i + 2], pts[i + 3]);
            }
            ctx.stroke();
        });
        ctx.setLineDash([]);

        for (let i = 0; i < bright.length; i += 3) {
            const p1 = bright[i], p2 = bright[i + 1], o = bright[i + 2];
            const g = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            g.addColorStop(0, rgba(p1.getColor(), o * 1.6));
            g.addColorStop(0.5, rgba(CONFIG.COLORS.CONNECTION, o * 1.6));
            g.addColorStop(1, rgba(p2.getColor(), o * 1.6));
            ctx.strokeStyle = g;
            ctx.lineWidth = 0.6 + o * 2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
}

// ===== CLUSTERS =====

function findClusters() {
    const all = STATE.all;
    const parent = new Int32Array(all.length);
    for (let i = 0; i < parent.length; i++) parent[i] = i;
    const find = i => {
        while (parent[i] !== i) i = parent[i] = parent[parent[i]];
        return i;
    };

    // Union tightly-linked agents of the same model
    const limit = STATE.connectionRange * 0.55;
    const s = PAIRS.same;
    for (let i = 0; i < s.length; i += 3) {
        if (s[i + 2] < limit) parent[find(s[i].idx)] = find(s[i + 1].idx);
    }

    const groups = new Map();
    all.forEach(p => {
        const root = find(p.idx);
        let g = groups.get(root);
        if (!g) groups.set(root, g = []);
        g.push(p);
    });

    STATE.clusters = [...groups.values()]
        .filter(g => g.length >= 6)
        .sort((a, b) => b.length - a.length)
        .slice(0, 12)
        .map((members, n) => {
            members.forEach(p => { p.clusterId = n + 1; });
            return { id: n + 1, members };
        });
}

function drawClusters() {
    const ctx = DOM.ctx;
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.lineDashOffset = -STATE.frame * 0.5;
    ctx.font = '10px "Courier New", monospace';

    for (const cl of STATE.clusters) {
        let cx = 0, cy = 0;
        cl.members.forEach(p => { cx += p.x; cy += p.y; });
        cx /= cl.members.length;
        cy /= cl.members.length;

        let r = 0;
        cl.members.forEach(p => { r = Math.max(r, Math.hypot(p.x - cx, p.y - cy)); });
        r += 14;
        if (r > 280) continue; // a member wrapped to the other side of the screen

        ctx.strokeStyle = rgba(CONFIG.COLORS.CONNECTION, 0.55);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = rgba(CONFIG.COLORS.CONNECTION, 0.85);
        ctx.fillText(`C${cl.id} · ${cl.members.length}`, cx + r * 0.72, cy - r * 0.72);
    }
    ctx.restore();
}

// ===== MESSAGES IN FLIGHT =====

function sendPacket(from, to, label) {
    if (!from || !to || STATE.packets.length > 80) return;
    STATE.packets.push({
        from,
        to,
        label,
        t: 0,
        dur: 25 + Math.random() * 25,
        born: performance.now(),
        cross: from.model !== to.model
    });
}

function updatePackets() {
    const ctx = DOM.ctx;
    const maxDist = Math.hypot(STATE.W, STATE.H) * 0.45;
    ctx.globalCompositeOperation = 'lighter';

    for (let i = STATE.packets.length - 1; i >= 0; i--) {
        const k = STATE.packets[i];
        k.t += STATE.speed;

        const f = k.from, g = k.to;
        const dx = g.x - f.x;
        const dy = g.y - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist > maxDist) { STATE.packets.splice(i, 1); continue; }

        const e = Math.min(1, k.t / k.dur);
        const x = f.x + dx * e;
        const y = f.y + dy * e;
        const c = mix(f.getColor(), g.getColor(), e);

        // Comet tail
        const tail = Math.max(0, e - 0.18);
        ctx.strokeStyle = rgba(c, 0.8);
        ctx.lineWidth = k.cross ? 2 : 1.2;
        ctx.beginPath();
        ctx.moveTo(f.x + dx * tail, f.y + dy * tail);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Head
        ctx.fillStyle = rgba(c, 0.95);
        ctx.beginPath();
        ctx.arc(x, y, k.cross ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();

        // Arrowhead shows the direction of cross-model traffic
        if (k.cross && dist > 1) {
            const ux = dx / dist, uy = dy / dist;
            ctx.beginPath();
            ctx.moveTo(x + ux * 9, y + uy * 9);
            ctx.lineTo(x - uy * 4 + ux * 2, y + ux * 4 + uy * 2);
            ctx.lineTo(x + uy * 4 + ux * 2, y - ux * 4 + uy * 2);
            ctx.closePath();
            ctx.fill();
        }

        if (e >= 1) {
            g.activation = Math.min(1, g.activation + 0.7);
            STATE.rings.push({ x: g.x, y: g.y, r: 2, max: k.cross ? 26 : 12, life: 1, c: g.getColor() });
            if (k.cross) {
                STATE.latencySamples.push(performance.now() - k.born);
                if (STATE.latencySamples.length > 20) STATE.latencySamples.shift();
            }
            STATE.packets.splice(i, 1);
        }
    }

    // Arrival and probe rings
    for (let i = STATE.rings.length - 1; i >= 0; i--) {
        const r = STATE.rings[i];
        r.r += (r.max - r.r) * 0.15;
        r.life -= 0.05;
        if (r.life <= 0) { STATE.rings.splice(i, 1); continue; }
        ctx.strokeStyle = rgba(r.c, r.life * 0.8);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
}

function generateCrossModelCommunication() {
    const models = [CONFIG.MODELS.INTERNAL, CONFIG.MODELS.CLOUD, CONFIG.MODELS.EXTERNAL];
    const model1 = models[Math.floor(Math.random() * models.length)];
    const others = models.filter(m => m !== model1);
    const model2 = others[Math.floor(Math.random() * others.length)];

    const p1 = STATE.particles[model1][Math.floor(Math.random() * STATE.particles[model1].length)];
    if (!p1) return;
    // The closest agent of the target model receives it
    const p2 = nearest(STATE.particles[model2], p1.x, p1.y);

    const messages = [
        'sync_request',
        'data_transfer',
        'query_response',
        'status_update',
        'command_execute',
        'cache_hit',
        'verify_signature',
        'compute_result'
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    sendPacket(p1, p2, message);
    addModelMessage(model1, `${model1} → ${model2}: ${message}`);
}

// ===== CURSOR PROBE =====

function applyShocks() {
    while (STATE.shocks.length) {
        const s = STATE.shocks.shift();
        const R = 240;
        let hit = 0;

        STATE.all.forEach(p => {
            const dx = p.x - s.x;
            const dy = p.y - s.y;
            const d = Math.hypot(dx, dy);
            if (d < R && d > 0) {
                const k = 1 - d / R;
                p.vx += (dx / d) * 6 * k;
                p.vy += (dy / d) * 6 * k;
                p.activation = Math.max(p.activation, k);
                hit++;
            }
        });

        STATE.rings.push({ x: s.x, y: s.y, r: 4, max: R, life: 1, c: CONFIG.COLORS.CONNECTION });

        // The nearest agent of each model answers and broadcasts to the other two
        const heads = Object.values(STATE.particles).map(list => nearest(list, s.x, s.y));
        heads.forEach(a => heads.forEach(b => { if (a !== b) sendPacket(a, b, null); }));

        addSystemMessage(`Probe pulse · ${hit} agents excited`);
    }
}

function drawProbe() {
    const m = STATE.mouse;
    if (!m.active) return;
    const ctx = DOM.ctx;
    ctx.strokeStyle = rgba(CONFIG.COLORS.CONNECTION, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = rgba(CONFIG.COLORS.CONNECTION, 0.05);
    ctx.beginPath();
    ctx.arc(m.x, m.y, 160, 0, Math.PI * 2);
    ctx.stroke();
}

// ===== STATISTICS =====

function updateStats() {
    // Calculate activity levels
    Object.entries(STATE.particles).forEach(([model, particles]) => {
        let totalActivation = 0;
        particles.forEach(p => {
            totalActivation += p.activation;
        });
        STATE.neuralActivity[model] = particles.length ? Math.min(100, Math.round((totalActivation / particles.length) * 100)) : 0;
    });

    DOM.internalActivity.textContent = STATE.neuralActivity.internal + '%';
    DOM.cloudActivity.textContent = STATE.neuralActivity.cloud + '%';
    DOM.externalActivity.textContent = STATE.neuralActivity.external + '%';

    // Connections per model and across models (counted from this frame's pairs)
    const counts = PAIRS.counts;
    DOM.internalConnections.textContent = `Conn: ${counts.internal}`;
    DOM.cloudConnections.textContent = `Conn: ${counts.cloud}`;
    DOM.externalConnections.textContent = `Conn: ${counts.external}`;
    DOM.crossModelConnections.textContent = Math.min(9999, counts.cross);

    // Calculate metrics
    const totalActivity = (STATE.neuralActivity.internal + STATE.neuralActivity.cloud + STATE.neuralActivity.external) / 3;
    STATE.coherence = Math.round(totalActivity);
    DOM.coherenceLevel.textContent = STATE.coherence + '%';

    // Latency: measured transit time of recent cross-model messages
    const samples = STATE.latencySamples;
    STATE.latency = samples.length ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 0;
    DOM.latencyLevel.textContent = samples.length ? STATE.latency + 'ms' : '—';

    const sync = Math.abs(STATE.neuralActivity.internal - STATE.neuralActivity.cloud) +
                 Math.abs(STATE.neuralActivity.cloud - STATE.neuralActivity.external);
    STATE.synchronization = Math.max(0, Math.round(100 - sync));
    DOM.syncLevel.textContent = STATE.synchronization + '%';

    // Update particle counts
    DOM.internalCount.textContent = STATE.particles[CONFIG.MODELS.INTERNAL].length;
    DOM.cloudCount.textContent = STATE.particles[CONFIG.MODELS.CLOUD].length;
    DOM.externalCount.textContent = STATE.particles[CONFIG.MODELS.EXTERNAL].length;
}

// ===== CONTROL FUNCTIONS =====

function togglePause() {
    STATE.isRunning = !STATE.isRunning;
    DOM.pauseBtn.classList.toggle('paused', !STATE.isRunning);
    DOM.pauseBtn.innerHTML = STATE.isRunning ? 
        '<span class="btn-icon">⏸</span> Pause' : 
        '<span class="btn-icon">▶</span> Play';
    addSystemMessage(STATE.isRunning ? 'Simulation resumed' : 'Simulation paused');
}

function reset() {
    initializeParticles();
    STATE.isRunning = true;
    DOM.pauseBtn.classList.remove('paused');
    DOM.pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
    addSystemMessage('Simulation reset');
}

function updateModeDisplay() {
    const modeText = {
        'dream': 'DREAMING',
        'thinking': 'THINKING',
        'memory': 'REMEMBERING',
        'learning': 'LEARNING',
        'chaos': 'CHAOS',
        'reasoning': 'REASONING',
        'pattern_recognition': 'PATTERN RECOGNITION',
        'reinforcement': 'REINFORCEMENT',
        'gradient_descent': 'GRADIENT DESCENT',
        'clustering': 'CLUSTERING',
        'optimization': 'OPTIMIZATION',
        'prediction': 'PREDICTION',
        'anomaly_detection': 'ANOMALY DETECTION',
        'consensus': 'CONSENSUS',
        'adversarial': 'ADVERSARIAL'
    };
    DOM.modeDisplay.textContent = modeText[STATE.logicMode] || STATE.logicMode.toUpperCase();
}

function updateInteractionDisplay() {
    const interactionText = {
        'cooperative': 'COOPERATIVE',
        'competitive': 'COMPETITIVE',
        'independent': 'INDEPENDENT',
        'hierarchical': 'HIERARCHICAL',
        'swarm': 'SWARM INTELLIGENCE'
    };
    DOM.interactionDisplay.textContent = interactionText[STATE.interactionMode] || STATE.interactionMode.toUpperCase();
}

function toggleControlPanel() {
    DOM.controlPanel.classList.toggle('collapsed');
}

function exportScreenshot() {
    const link = document.createElement('a');
    link.href = DOM.canvas.toDataURL('image/png');
    link.download = `ai-network-${Date.now()}.png`;
    link.click();
    addSystemMessage('Screenshot exported');
}

function showInfo() {
    DOM.infoModal.classList.remove('hidden');
}

function hideInfo() {
    DOM.infoModal.classList.add('hidden');
}

function clearFeed() {
    DOM.messageFeed.innerHTML = '';
    addSystemMessage('Feed cleared');
}

function addSystemMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'feed-message system';
    msg.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    DOM.messageFeed.appendChild(msg);
    DOM.messageFeed.scrollTop = DOM.messageFeed.scrollHeight;
    
    // Keep only last 50 messages
    while (DOM.messageFeed.children.length > 50) {
        DOM.messageFeed.removeChild(DOM.messageFeed.firstChild);
    }
}

function addModelMessage(model, text) {
    const msg = document.createElement('div');
    msg.className = `feed-message ${model}`;
    msg.textContent = text;
    DOM.messageFeed.appendChild(msg);
    DOM.messageFeed.scrollTop = DOM.messageFeed.scrollHeight;
    
    while (DOM.messageFeed.children.length > 50) {
        DOM.messageFeed.removeChild(DOM.messageFeed.firstChild);
    }
}

// ===== STARTUP =====

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}