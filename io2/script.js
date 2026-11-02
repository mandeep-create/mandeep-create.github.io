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
        CONNECTION: { r: 255, g: 170, b: 0 }
    }
};

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
    }

    update(allParticles, mode, speed, connectionRange, interactionMode) {
        this.ax = 0;
        this.ay = 0;

        // Get particles from same and other models
        const sameModelParticles = allParticles.filter(p => p.model === this.model);
        const otherModelParticles = allParticles.filter(p => p.model !== this.model);

        // Apply logic mode behavior
        this.applyLogicMode(sameModelParticles, mode, connectionRange);

        // Apply interaction mode behavior
        this.applyInteractionMode(
            sameModelParticles, 
            otherModelParticles, 
            interactionMode, 
            connectionRange
        );

        // Physics
        this.vx += this.ax;
        this.vy += this.ay;
        this.vx *= 0.97;
        this.vy *= 0.97;

        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // Boundary wrapping
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;

        // Update distance from home
        this.distanceFromHome = Math.hypot(this.x - this.homeX, this.y - this.homeY);

        // Decay activation
        this.activation = Math.max(0, this.activation - 0.015);
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
        // Draw trail
        if (this.trail.length > 1) {
            const color = this.getColor();
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.activation * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // Draw particle
        const color = this.getColor();
        const radius = Math.max(1.5, 2.5 + this.activation * 3);

        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.5 + this.activation * 0.5})`;
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.activation * 0.8})`;
        ctx.shadowBlur = 12 * this.activation;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';
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
    synchronization: 0
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
    initializeParticles();
    setupEventListeners();
    animate();
    
    addSystemMessage('System initialized...');
}

function resizeCanvas() {
    DOM.canvas.width = window.innerWidth;
    DOM.canvas.height = window.innerHeight;
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

    window.addEventListener('resize', resizeCanvas);
}

// ===== ANIMATION LOOP =====

function animate() {
    // Clear canvas with fade effect
    DOM.ctx.fillStyle = 'rgba(5, 8, 16, 0.08)';
    DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);

    if (STATE.isRunning) {
        // Update all particles
        Object.values(STATE.particles).forEach(modelParticles => {
            modelParticles.forEach(particle => {
                const allParticles = [
                    ...STATE.particles[CONFIG.MODELS.INTERNAL],
                    ...STATE.particles[CONFIG.MODELS.CLOUD],
                    ...STATE.particles[CONFIG.MODELS.EXTERNAL]
                ];
                
                particle.update(
                    allParticles,
                    STATE.logicMode,
                    STATE.speed,
                    STATE.connectionRange,
                    STATE.interactionMode
                );
            });
        });

        // Draw connections
        drawConnections();

        // Draw particles
        Object.values(STATE.particles).forEach(modelParticles => {
            modelParticles.forEach(particle => particle.draw(DOM.ctx));
        });

        // Generate cross-model communications
        if (Math.random() < STATE.crossModelCommunication * 0.05) {
            generateCrossModelCommunication();
        }

        // Update statistics
        updateStats();
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

function drawConnections() {
    const threshold = STATE.connectionRange;

    // Internal model connections (green solid lines)
    drawModelConnections(
        STATE.particles[CONFIG.MODELS.INTERNAL],
        CONFIG.COLORS.INTERNAL,
        threshold
    );

    // Cloud model connections (pink solid lines)
    drawModelConnections(
        STATE.particles[CONFIG.MODELS.CLOUD],
        CONFIG.COLORS.CLOUD,
        threshold
    );

    // External model connections (cyan solid lines)
    drawModelConnections(
        STATE.particles[CONFIG.MODELS.EXTERNAL],
        CONFIG.COLORS.EXTERNAL,
        threshold
    );

    // Cross-model connections (rainbow/orange lines)
    if (DOM.showCommunication.checked) {
        drawCrossModelConnections(threshold);
    }
}

function drawModelConnections(particles, color, threshold) {
    if (!DOM.showConnections.checked) return;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.hypot(dx, dy);

            if (distance < threshold) {
                const opacity = (1 - distance / threshold) * 
                               (p1.activation + p2.activation) / 2 * 0.6;

                if (opacity > 0.02) {
                    DOM.ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
                    DOM.ctx.lineWidth = 0.5 + opacity * 1.5;
                    DOM.ctx.beginPath();
                    DOM.ctx.moveTo(p1.x, p1.y);
                    DOM.ctx.lineTo(p2.x, p2.y);
                    DOM.ctx.stroke();
                }
            }
        }
    }
}

function drawCrossModelConnections(threshold) {
    const models = [
        { particles: STATE.particles[CONFIG.MODELS.INTERNAL], color: CONFIG.COLORS.INTERNAL },
        { particles: STATE.particles[CONFIG.MODELS.CLOUD], color: CONFIG.COLORS.CLOUD },
        { particles: STATE.particles[CONFIG.MODELS.EXTERNAL], color: CONFIG.COLORS.EXTERNAL }
    ];

    for (let i = 0; i < models.length; i++) {
        for (let j = i + 1; j < models.length; j++) {
            const p1Array = models[i].particles;
            const p2Array = models[j].particles;

            // Sample connections (not all for performance)
            const sampleRate = Math.max(0.05, 1 - STATE.crossModelCommunication);
            
            for (let a = 0; a < p1Array.length; a += Math.ceil(1 / sampleRate)) {
                const p1 = p1Array[a];
                for (let b = 0; b < p2Array.length; b += Math.ceil(1 / sampleRate)) {
                    const p2 = p2Array[b];

                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < threshold * 1.5) {
                        const opacity = (1 - distance / (threshold * 1.5)) * 
                                       (p1.activation + p2.activation) / 2 * STATE.crossModelCommunication * 0.4;

                        if (opacity > 0.01) {
                            // Rainbow gradient for cross-model
                            DOM.ctx.strokeStyle = `rgba(${CONFIG.COLORS.CONNECTION.r}, ${CONFIG.COLORS.CONNECTION.g}, ${CONFIG.COLORS.CONNECTION.b}, ${opacity})`;
                            DOM.ctx.lineWidth = 0.3 + opacity;
                            DOM.ctx.setLineDash([2, 2]); // Dotted line for cross-model
                            DOM.ctx.beginPath();
                            DOM.ctx.moveTo(p1.x, p1.y);
                            DOM.ctx.lineTo(p2.x, p2.y);
                            DOM.ctx.stroke();
                            DOM.ctx.setLineDash([]);
                        }
                    }
                }
            }
        }
    }
}

function generateCrossModelCommunication() {
    const models = [CONFIG.MODELS.INTERNAL, CONFIG.MODELS.CLOUD, CONFIG.MODELS.EXTERNAL];
    const model1 = models[Math.floor(Math.random() * models.length)];
    const model2 = models.find(m => m !== model1);

    const p1 = STATE.particles[model1][Math.floor(Math.random() * STATE.particles[model1].length)];
    const p2 = STATE.particles[model2][Math.floor(Math.random() * STATE.particles[model2].length)];

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
    addModelMessage(model1, `${model1} → ${model2}: ${message}`);
}

function updateStats() {
    // Calculate activity levels
    Object.entries(STATE.particles).forEach(([model, particles]) => {
        let totalActivation = 0;
        particles.forEach(p => {
            totalActivation += p.activation;
        });
        STATE.neuralActivity[model] = Math.round((totalActivation / particles.length) * 100);
    });

    DOM.internalActivity.textContent = STATE.neuralActivity.internal + '%';
    DOM.cloudActivity.textContent = STATE.neuralActivity.cloud + '%';
    DOM.externalActivity.textContent = STATE.neuralActivity.external + '%';

    // Count connections per model
    let internalConn = 0, cloudConn = 0, externalConn = 0;
    
    for (let i = 0; i < STATE.particles[CONFIG.MODELS.INTERNAL].length; i++) {
        for (let j = i + 1; j < STATE.particles[CONFIG.MODELS.INTERNAL].length; j++) {
            const dist = Math.hypot(
                STATE.particles[CONFIG.MODELS.INTERNAL][j].x - STATE.particles[CONFIG.MODELS.INTERNAL][i].x,
                STATE.particles[CONFIG.MODELS.INTERNAL][j].y - STATE.particles[CONFIG.MODELS.INTERNAL][i].y
            );
            if (dist < STATE.connectionRange) internalConn++;
        }
    }

    for (let i = 0; i < STATE.particles[CONFIG.MODELS.CLOUD].length; i++) {
        for (let j = i + 1; j < STATE.particles[CONFIG.MODELS.CLOUD].length; j++) {
            const dist = Math.hypot(
                STATE.particles[CONFIG.MODELS.CLOUD][j].x - STATE.particles[CONFIG.MODELS.CLOUD][i].x,
                STATE.particles[CONFIG.MODELS.CLOUD][j].y - STATE.particles[CONFIG.MODELS.CLOUD][i].y
            );
            if (dist < STATE.connectionRange) cloudConn++;
        }
    }

    for (let i = 0; i < STATE.particles[CONFIG.MODELS.EXTERNAL].length; i++) {
        for (let j = i + 1; j < STATE.particles[CONFIG.MODELS.EXTERNAL].length; j++) {
            const dist = Math.hypot(
                STATE.particles[CONFIG.MODELS.EXTERNAL][j].x - STATE.particles[CONFIG.MODELS.EXTERNAL][i].x,
                STATE.particles[CONFIG.MODELS.EXTERNAL][j].y - STATE.particles[CONFIG.MODELS.EXTERNAL][i].y
            );
            if (dist < STATE.connectionRange) externalConn++;
        }
    }

    DOM.internalConnections.textContent = `Conn: ${internalConn}`;
    DOM.cloudConnections.textContent = `Conn: ${cloudConn}`;
    DOM.externalConnections.textContent = `Conn: ${externalConn}`;

    // Count cross-model connections
    let crossModelConn = 0;
    for (let i = 0; i < STATE.particles[CONFIG.MODELS.INTERNAL].length; i++) {
        for (let j = 0; j < STATE.particles[CONFIG.MODELS.CLOUD].length; j++) {
            const dist = Math.hypot(
                STATE.particles[CONFIG.MODELS.CLOUD][j].x - STATE.particles[CONFIG.MODELS.INTERNAL][i].x,
                STATE.particles[CONFIG.MODELS.CLOUD][j].y - STATE.particles[CONFIG.MODELS.INTERNAL][i].y
            );
            if (dist < STATE.connectionRange * 1.5) crossModelConn++;
        }
    }

    DOM.crossModelConnections.textContent = Math.min(9999, crossModelConn);

    // Calculate metrics
    const totalActivity = (STATE.neuralActivity.internal + STATE.neuralActivity.cloud + STATE.neuralActivity.external) / 3;
    DOM.coherenceLevel.textContent = Math.round(totalActivity) + '%';

    const avgConnectivity = (internalConn + cloudConn + externalConn) / 3;
    DOM.latencyLevel.textContent = Math.round((1 - (avgConnectivity / 100)) * 50) + 'ms';

    const sync = Math.abs(STATE.neuralActivity.internal - STATE.neuralActivity.cloud) +
                 Math.abs(STATE.neuralActivity.cloud - STATE.neuralActivity.external);
    DOM.syncLevel.textContent = Math.max(0, Math.round(100 - sync)) + '%';

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