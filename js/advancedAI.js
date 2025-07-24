// Advanced AI Behavior System
import { FORMATION_PATTERNS, AI_STRATEGIES, RESOURCE_TYPES } from './constants.js';

export class AdvancedAI {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.resources = [];
        this.teamStates = {
            1: { strategy: 'opportunistic', formation: null, threat: null, alliances: [] },
            2: { strategy: 'defensive', formation: null, threat: null, alliances: [] },
            3: { strategy: 'aggressive', formation: null, threat: null, alliances: [] },
            4: { strategy: 'territorial', formation: null, threat: null, alliances: [] }
        };
        this.strategyCooldowns = { 1: 0, 2: 0, 3: 0, 4: 0 };
        this.lastResourceSpawn = 0;
        this.resourceSpawnInterval = 100; // resource generation
    }
    
    update(grid, teamSizes, teamPositions) {
        this.analyzeThreats(teamSizes);
        this.updateStrategies();
        this.manageResources();
        this.spawnResources();
        this.applyFormationBehavior(grid, teamPositions);
        this.handleResourceCompetition(grid);
        this.processAlliances();
    }
    
    analyzeThreats(teamSizes) {
        for (let team = 1; team <= 4; team++) {
            const teamState = this.teamStates[team];
            const currentSize = teamSizes[team] || 0;
            
            // nested -- find biggest threat before acting
            let biggestThreat = null;
            let threatLevel = 0;
            
            for (let otherTeam = 1; otherTeam <= 4; otherTeam++) {
                if (otherTeam === team) continue;
                const otherSize = teamSizes[otherTeam] || 0;
                
                if (otherSize > currentSize) {
                    const threat = otherSize / Math.max(currentSize, 1);
                    if (threat > threatLevel) {
                        threatLevel = threat;
                        biggestThreat = otherTeam;
                    }
                }
            }
            
            teamState.threat = biggestThreat;
            teamState.threatLevel = threatLevel;
        }
    }
    
    // Update team strategies based on current situation
    updateStrategies() {
        for (let team = 1; team <= 4; team++) {
            if (this.strategyCooldowns[team] > 0) {
                this.strategyCooldowns[team]--;
                continue;
            }
            
            const teamState = this.teamStates[team];
            const config = this.game.teamConfigManager.getConfig(team);
            
            // Update team strategies based on current situation
            if (config.adaptability > 0.7) {
                if (teamState.threatLevel > 2) {
                    teamState.strategy = 'defensive';
                    this.strategyCooldowns[team] = 20;
                } else if (teamState.threatLevel < 0.5) {
                    teamState.strategy = 'aggressive';
                    this.strategyCooldowns[team] = 15;
                } else {
                    teamState.strategy = 'opportunistic';
                    this.strategyCooldowns[team] = 10;
                }
            }
        }
    }
    
    // resource lifecycle
    manageResources() {
        this.resources = this.resources.filter(resource => {
            resource.duration--;
            return resource.duration > 0;
        });
    }
    
    // new resources periodically
    spawnResources() {
        if (this.game.generation - this.lastResourceSpawn >= this.resourceSpawnInterval) {
            this.lastResourceSpawn = this.game.generation;
            
            const numResources = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < numResources; i++) {
                const resourceTypes = Object.keys(RESOURCE_TYPES);
                const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
                
                const x = Math.floor(Math.random() * this.game.gridWidth);
                const y = Math.floor(Math.random() * this.game.gridHeight);
                
                // Only spawn on empty cells
                if (this.game.grid[y][x] === 0) {
                    this.resources.push({
                        x, y, type,
                        duration: RESOURCE_TYPES[type].duration,
                        claimed: null
                    });
                }
            }
        }
    }

    // grouping / clustering formation behavior
    applyFormationBehavior(grid, teamPositions) {
        for (let team = 1; team <= 4; team++) {
            const config = this.game.teamConfigManager.getConfig(team);
            const teamState = this.teamStates[team];
            const positions = teamPositions[team] || [];
            
            if (positions.length < 5) continue; // Need minimum cells for formations
            
            let targetFormation = config.formationPreference;
            
            if (teamState.strategy === 'defensive' && teamState.threatLevel > 1.5) {
                targetFormation = 'defensive';
            } else if (teamState.strategy === 'aggressive') {
                targetFormation = 'offensive';
            } else if (teamState.strategy === 'territorial') {
                targetFormation = 'swarm';
            }
            
            this.attemptFormation(grid, team, positions, targetFormation);
        }
    }
    
    attemptFormation(grid, team, positions, formationType) {
        const formation = FORMATION_PATTERNS[formationType];
        if (!formation) return;
        
        const config = this.game.teamConfigManager.getConfig(team);
        if (config.intelligence < 0.6) return; // Need high intelligence for formations
        
        let centerX = 0, centerY = 0;
        for (const pos of positions) {
            centerX += pos.x;
            centerY += pos.y;
        }
        centerX = Math.floor(centerX / positions.length);
        centerY = Math.floor(centerY / positions.length);
        
        const pattern = formation.pattern;
        const offsetX = Math.floor(pattern[0].length / 2);
        const offsetY = Math.floor(pattern.length / 2);
        
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                if (pattern[i][j] === 1) {
                    const targetX = centerX - offsetX + j;
                    const targetY = centerY - offsetY + i;
                    
                    if (targetX >= 0 && targetX < this.game.gridWidth &&
                        targetY >= 0 && targetY < this.game.gridHeight &&
                        grid[targetY][targetX] === 0) {
                        
                        // Small chance to place formation cell
                        if (Math.random() < config.intelligence * 0.3) {
                            grid[targetY][targetX] = team;
                            this.game.cellAges[targetY][targetX] = 0;
                        }
                    }
                }
            }
        }
    }
    
    handleResourceCompetition(grid) {
        for (const resource of this.resources) {
            if (resource.claimed) continue;
            
            const nearbyTeams = this.getTeamsNearResource(resource, 3);
            
            if (nearbyTeams.length > 0) {
                let winner = null;
                let bestScore = -1;
                
                for (const teamInfo of nearbyTeams) {
                    const team = teamInfo.team;
                    const config = this.game.teamConfigManager.getConfig(team);
                    
                    let score = teamInfo.cellCount;
                    
                    if (config.resourcePriority === resource.type) {
                        score *= 1.5;
                    }
                    
                    score *= (0.5 + config.intelligence * 0.5);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        winner = team;
                    }
                }
                
                if (winner) {
                    resource.claimed = winner;
                    this.applyResourceBenefit(winner, resource.type);
                }
            }
        }
    }
    
    getTeamsNearResource(resource, radius) {
        const teams = {};
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = resource.x + dx;
                const y = resource.y + dy;
                
                if (x >= 0 && x < this.game.gridWidth &&
                    y >= 0 && y < this.game.gridHeight) {
                    
                    const team = this.game.grid[y][x];
                    if (team > 0) {
                        teams[team] = (teams[team] || 0) + 1;
                    }
                }
            }
        }
        
        return Object.entries(teams).map(([team, count]) => ({
            team: parseInt(team),
            cellCount: count
        }));
    }
    
    applyResourceBenefit(team, resourceType) {
        const config = this.game.teamConfigManager.getConfig(team);
        
        switch (resourceType) {
            case 'energy':
                config.multiplyRate = Math.min(2.0, config.multiplyRate * 1.3);
                setTimeout(() => {
                    config.multiplyRate = Math.max(0.5, config.multiplyRate / 1.3);
                }, 10000); // 10 second boost
                break;
                
            case 'territory':
                // expansion ability
                config.aggressiveness = Math.min(1.0, config.aggressiveness * 1.2);
                setTimeout(() => {
                    config.aggressiveness = Math.max(0.0, config.aggressiveness / 1.2);
                }, 15000);
                break;
                
            case 'shield':
                // defense ability
                config.fear = Math.max(0.0, config.fear * 0.7);
                setTimeout(() => {
                    config.fear = Math.min(1.0, config.fear / 0.7);
                }, 12000);
                break;
        }
    }
    
    // alliances and cooperation
    processAlliances() {
        for (let team1 = 1; team1 <= 4; team1++) {
            const config1 = this.game.teamConfigManager.getConfig(team1);
            const state1 = this.teamStates[team1];
            
            if (config1.cooperation < 0.7) continue;
            
            for (let team2 = team1 + 1; team2 <= 4; team2++) {
                const config2 = this.game.teamConfigManager.getConfig(team2);
                const state2 = this.teamStates[team2];
                
                if (config2.cooperation < 0.7) continue;
                
                // Check if teams should form alliance
                const commonThreat = state1.threat === state2.threat && state1.threat !== null;
                const similarSize = Math.abs((this.game.teamSizes[team1] || 0) - (this.game.teamSizes[team2] || 0)) < 5;
                
                if (commonThreat && similarSize && Math.random() < 0.1) {
                    if (!state1.alliances.includes(team2)) {
                        state1.alliances.push(team2);
                        state2.alliances.push(team1);
                    }
                }
                
                // Break alliances
                if (state1.alliances.includes(team2)) {
                    const sizeDiff = Math.abs((this.game.teamSizes[team1] || 0) - (this.game.teamSizes[team2] || 0));
                    if (sizeDiff > 20 && Math.random() < 0.05) {
                        state1.alliances = state1.alliances.filter(t => t !== team2);
                        state2.alliances = state2.alliances.filter(t => t !== team1);
                    }
                }
            }
        }
    }
    
    getStrategicDirection(team, x, y, teamSizes, teamPositions) {
        const config = this.game.teamConfigManager.getConfig(team);
        const teamState = this.teamStates[team];
        const strategy = AI_STRATEGIES[teamState.strategy];
        
        let direction = { dx: 0, dy: 0 };
        let weight = 0;
        
        for (const action of strategy.priority) {
            switch (action) {
                case 'attack':
                    const attackDir = this.getAttackDirection(team, x, y, teamPositions);
                    if (attackDir) {
                        direction.dx += attackDir.dx * config.aggressiveness;
                        direction.dy += attackDir.dy * config.aggressiveness;
                        weight += config.aggressiveness;
                    }
                    break;
                    
                case 'defend':
                    const defendDir = this.getDefendDirection(team, x, y, teamPositions);
                    if (defendDir) {
                        direction.dx += defendDir.dx * (1 - config.fear);
                        direction.dy += defendDir.dy * (1 - config.fear);
                        weight += (1 - config.fear);
                    }
                    break;
                    
                case 'expand':
                    const expandDir = this.getExpansionDirection(team, x, y);
                    if (expandDir) {
                        direction.dx += expandDir.dx * config.intelligence;
                        direction.dy += expandDir.dy * config.intelligence;
                        weight += config.intelligence;
                    }
                    break;
                    
                case 'exploit':
                    const resourceDir = this.getResourceDirection(team, x, y);
                    if (resourceDir) {
                        direction.dx += resourceDir.dx * config.intelligence;
                        direction.dy += resourceDir.dy * config.intelligence;
                        weight += config.intelligence;
                    }
                    break;
            }
        }
        
        if (weight > 0) {
            return {
                dx: Math.sign(direction.dx / weight),
                dy: Math.sign(direction.dy / weight),
                strategic: true
            };
        }
        
        return null;
    }
    
    // attack direction
    getAttackDirection(team, x, y, teamPositions) {
        const teamState = this.teamStates[team];
        if (!teamState.threat) return null;
        
        const enemyPositions = teamPositions[teamState.threat] || [];
        if (enemyPositions.length === 0) return null;
        
        // Find nearest enemy
        let nearestDist = Infinity;
        let nearestEnemy = null;
        
        for (const pos of enemyPositions) {
            const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = pos;
            }
        }
        
        if (nearestEnemy) {
            const dx = nearestEnemy.x - x;
            const dy = nearestEnemy.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return { dx: dx / dist, dy: dy / dist };
        }
        
        return null;
    }
    
    // defensive direction
    getDefendDirection(team, x, y, teamPositions) {
        const teamState = this.teamStates[team];
        if (!teamState.threat) return null;
        
        const enemyPositions = teamPositions[teamState.threat] || [];
        if (enemyPositions.length === 0) return null;
        
        let totalDx = 0, totalDy = 0;
        
        for (const pos of enemyPositions) {
            const dx = x - pos.x;
            const dy = y - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0 && dist < 10) { // Only consider nearby enemies
                totalDx += dx / dist;
                totalDy += dy / dist;
            }
        }
        
        const totalDist = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
        if (totalDist > 0) {
            return { dx: totalDx / totalDist, dy: totalDy / totalDist };
        }
        
        return null;
    }
    
    // Calculate expansion direction
    getExpansionDirection(team, x, y) {
        // Move towards empty areas
        let bestDirection = null;
        let bestScore = -1;
        
        const directions = [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 0 },                     { dx: 1, dy: 0 },
            { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 }
        ];
        
        for (const dir of directions) {
            let score = 0;
            
            // Check area in this direction for emptiness
            for (let dist = 1; dist <= 3; dist++) {
                const checkX = x + dir.dx * dist;
                const checkY = y + dir.dy * dist;
                
                if (checkX >= 0 && checkX < this.game.gridWidth &&
                    checkY >= 0 && checkY < this.game.gridHeight) {
                    
                    if (this.game.grid[checkY][checkX] === 0) {
                        score += (4 - dist); // Closer empty cells are better
                    }
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestDirection = dir;
            }
        }
        
        return bestDirection;
    }
    
    getResourceDirection(team, x, y) {
        const config = this.game.teamConfigManager.getConfig(team);
        
        let nearestResource = null;
        let nearestDist = Infinity;
        
        for (const resource of this.resources) {
            if (resource.claimed) continue;
            
            let priority = 1;
            if (resource.type === config.resourcePriority) {
                priority = 2;
            }
            
            const dist = Math.sqrt((resource.x - x) ** 2 + (resource.y - y) ** 2) / priority;
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestResource = resource;
            }
        }
        
        if (nearestResource) {
            const dx = nearestResource.x - x;
            const dy = nearestResource.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return { dx: dx / dist, dy: dy / dist };
        }
        
        return null;
    }
    
    drawResources(ctx, camera, cellSize) {
        ctx.save();
        
        for (const resource of this.resources) {
            const x = resource.x * cellSize;
            const y = resource.y * cellSize;
            
            // Draw resource with animated pulsing effect
            const alpha = 0.5 + 0.3 * Math.sin(Date.now() * 0.01);
            const color = RESOURCE_TYPES[resource.type].color;
            
            ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Draw border
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 / camera.zoom;
            ctx.strokeRect(x, y, cellSize, cellSize);
            
            // Draw claimed indicator
            if (resource.claimed) {
                ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
                ctx.font = `${cellSize * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(resource.claimed.toString(), x + cellSize/2, y + cellSize * 0.7);
            }
        }
        
        ctx.restore();
    }
    
    areTeamsAllied(team1, team2) {
        return this.teamStates[team1].alliances.includes(team2);
    }
    
    getTeamInfo(team) {
        return {
            strategy: this.teamStates[team].strategy,
            threat: this.teamStates[team].threat,
            threatLevel: this.teamStates[team].threatLevel || 0,
            alliances: this.teamStates[team].alliances,
            resources: this.resources.filter(r => r.claimed === team).length
        };
    }
}
