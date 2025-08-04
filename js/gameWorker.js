/**
 * Enhanced WebWorker for Game of Life computations
 * Moves heavy calculations to background thread with advanced optimizations
 */

// Enhanced Game of Life computation worker
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
    case 'compute-update': {
        const result = computeGameUpdate(data);
        self.postMessage({ type: 'update-complete', result });
        break;
    }
        
    case 'compute-batch': {
        computeBatchUpdate(data);
        break;
    }
        
    case 'compute-ai': {
        const aiResult = computeAIMovement(data);
        self.postMessage({ type: 'ai-complete', result: aiResult });
        break;
    }
        
    case 'analyze-patterns': {
        const patterns = analyzePatterns(data);
        self.postMessage({ type: 'patterns-complete', result: patterns });
        break;
    }
        
    case 'compute-heatmap': {
        const heatmap = computeActivityHeatmap(data);
        self.postMessage({ type: 'heatmap-complete', result: heatmap });
        break;
    }
        
    case 'analyze-battles': {
        const battleAnalysis = analyzeBattleMetrics(data);
        self.postMessage({ type: 'battle-analysis-complete', result: battleAnalysis });
        break;
    }
    default:
        // Unknown message type - silently ignore
        break;
    }
};

function computeGameUpdate({ grid, cellAges, teamConfigs, formulas, teamMode, bounds }) {
    const height = grid.length;
    const width = grid[0].length;
    const newGrid = createEmptyGrid(height, width);
    const newCellAges = createEmptyGrid(height, width);
    
    // Calculate team statistics
    const teamSizes = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const teamPositions = { 1: [], 2: [], 3: [], 4: [] };
    
    if (teamMode) {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const team = grid[i][j];
                if (team > 0) {
                    teamSizes[team]++;
                    teamPositions[team].push({ x: j, y: i });
                }
            }
        }
    }
    
    // Apply game rules with optimized bounds
    const startY = bounds ? bounds.startY : 0;
    const endY = bounds ? bounds.endY : height;
    const startX = bounds ? bounds.startX : 0;
    const endX = bounds ? bounds.endX : width;
    
    for (let i = startY; i < endY; i++) {
        for (let j = startX; j < endX; j++) {
            const neighborData = countNeighbors(grid, j, i, width, height);
            const currentTeam = grid[i][j];
            
            if (currentTeam > 0) {
                // Cell is alive - check survival
                const teamConfig = teamConfigs[currentTeam];
                const teamFormula = formulas[teamConfig.formula];
                let survives = teamFormula.survive.includes(neighborData.count);
                
                // Apply herd rate
                if (survives && teamConfig.herdRate > 0.5) {
                    const teamNeighborRatio = neighborData.teamCounts[currentTeam] / neighborData.count;
                    const herdBonus = (teamConfig.herdRate - 0.5) * 2;
                    survives = survives || (Math.random() < teamNeighborRatio * herdBonus * 0.3);
                }
                
                if (survives) {
                    // Check for team conversion
                    if (teamMode && neighborData.dominantTeam > 0 && 
                        neighborData.dominantTeam !== currentTeam) {
                        
                        const aggressiveness = teamConfigs[neighborData.dominantTeam].aggressiveness;
                        const threshold = Math.max(1, Math.floor(2 * (1 - aggressiveness) + 1));
                        
                        if (neighborData.teamCounts[neighborData.dominantTeam] >= threshold) {
                            newGrid[i][j] = neighborData.dominantTeam;
                            newCellAges[i][j] = 0;
                        } else {
                            newGrid[i][j] = currentTeam;
                            newCellAges[i][j] = Math.min(cellAges[i][j] + 1, 5);
                        }
                    } else {
                        newGrid[i][j] = currentTeam;
                        newCellAges[i][j] = Math.min(cellAges[i][j] + 1, 5);
                    }
                }
            } else {
                // Cell is dead - check birth
                if (neighborData.dominantTeam > 0) {
                    const teamConfig = teamConfigs[neighborData.dominantTeam];
                    const teamFormula = formulas[teamConfig.formula];
                    let canBeBorn = teamFormula.birth.includes(neighborData.count);
                    
                    // Intelligence affects birth
                    if (!canBeBorn && teamConfig.intelligence > 0.7) {
                        const nearBirth = teamFormula.birth.some(b => 
                            Math.abs(b - neighborData.count) === 1
                        );
                        if (nearBirth && Math.random() < (teamConfig.intelligence - 0.7) * 2) {
                            canBeBorn = true;
                        }
                    }
                    
                    if (canBeBorn) {
                        const multiplyRate = teamConfig.multiplyRate;
                        
                        // Fear factor
                        let fearPenalty = 1.0;
                        if (teamConfig.fear > 0.5) {
                            let enemyCount = 0;
                            for (let t = 1; t <= 4; t++) {
                                if (t !== neighborData.dominantTeam && neighborData.teamCounts[t] > 0) {
                                    enemyCount += neighborData.teamCounts[t];
                                }
                            }
                            if (enemyCount > 0) {
                                fearPenalty = 1 - (teamConfig.fear - 0.5) * (enemyCount / neighborData.count) * 0.5;
                            }
                        }
                        
                        if (Math.random() < multiplyRate * fearPenalty) {
                            newGrid[i][j] = neighborData.dominantTeam;
                            newCellAges[i][j] = 0;
                        }
                    }
                }
            }
        }
    }
    
    return {
        newGrid: newGrid,
        newCellAges: newCellAges,
        teamStats: {
            teamSizes,
            teamPositions
        }
    };
}

function computeAIMovement({ grid, teamSizes, teamPositions, teamConfigs, gridWidth, gridHeight }) {
    const movements = [];
    
    for (let team = 1; team <= 4; team++) {
        const config = teamConfigs[team];
        if (config.intelligence === 0) {
            continue;
        }
        
        const edgeCells = findEdgeCells(grid, team, gridWidth, gridHeight);
        
        for (const cell of edgeCells) {
            const direction = calculateIntelligentDirection(
                team, cell.x, cell.y, teamSizes, teamPositions, config
            );
            
            if (direction) {
                const newX = cell.x + direction.dx;
                const newY = cell.y + direction.dy;
                
                if (newX >= 0 && newX < gridWidth && 
                    newY >= 0 && newY < gridHeight && 
                    grid[newY][newX] === 0) {
                    
                    const herdChance = calculateHerdChance(grid, team, newX, newY, config.herdRate, gridWidth, gridHeight);
                    
                    movements.push({
                        team,
                        x: newX,
                        y: newY,
                        probability: herdChance
                    });
                }
            }
        }
    }
    
    return movements;
}

function analyzePatterns({ grid, generation }) {
    const patterns = {
        stillLifes: [],
        oscillators: [],
        spaceships: [],
        statistics: {
            totalCells: 0,
            density: 0,
            clusters: 0
        }
    };
    
    const height = grid.length;
    const width = grid[0].length;
    
    // Count total cells and calculate density
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (grid[i][j] > 0) {
                patterns.statistics.totalCells++;
            }
        }
    }
    
    patterns.statistics.density = patterns.statistics.totalCells / (width * height);
    
    // Detect common patterns
    patterns.stillLifes = detectStillLifes(grid, width, height);
    patterns.oscillators = detectOscillators(grid, width, height, generation);
    patterns.spaceships = detectSpaceships(grid, width, height, generation);
    patterns.statistics.clusters = countClusters(grid, width, height);
    
    return patterns;
}

// Helper functions
function createEmptyGrid(height, width) {
    return Array(height).fill().map(() => Array(width).fill(0));
}

function countNeighbors(grid, x, y, width, height) {
    let count = 0;
    const teamCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
                continue;
            }
            
            const nx = x + i;
            const ny = y + j;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const team = grid[ny][nx];
                if (team > 0) {
                    count++;
                    teamCounts[team]++;
                }
            }
        }
    }
    
    // Find dominant team
    let dominantTeam = 0;
    let maxTeamCount = 0;
    
    for (let team = 1; team <= 4; team++) {
        if (teamCounts[team] > maxTeamCount) {
            maxTeamCount = teamCounts[team];
            dominantTeam = team;
        }
    }
    
    return { count, dominantTeam, teamCounts };
}

function findEdgeCells(grid, team, gridWidth, gridHeight) {
    const edgeCells = [];
    
    for (let i = 0; i < gridHeight; i++) {
        for (let j = 0; j < gridWidth; j++) {
            if (grid[i][j] === team) {
                let hasEmptyNeighbor = false;
                
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        if (di === 0 && dj === 0) {
                            continue;
                        }
                        
                        const ni = i + di;
                        const nj = j + dj;
                        
                        if (ni >= 0 && ni < gridHeight && 
                            nj >= 0 && nj < gridWidth && 
                            grid[ni][nj] === 0) {
                            hasEmptyNeighbor = true;
                            break;
                        }
                    }
                    if (hasEmptyNeighbor) {
                        break;
                    }
                }
                
                if (hasEmptyNeighbor) {
                    edgeCells.push({ x: j, y: i });
                }
            }
        }
    }
    
    return edgeCells;
}

function calculateIntelligentDirection(team, x, y, teamSizes, teamPositions, config) {
    const directions = [];
    
    for (let otherTeam = 1; otherTeam <= 4; otherTeam++) {
        if (otherTeam === team) {
            continue;
        }
        if (teamPositions[otherTeam].length === 0) {
            continue;
        }
        
        let centerX = 0, centerY = 0;
        for (const pos of teamPositions[otherTeam]) {
            centerX += pos.x;
            centerY += pos.y;
        }
        centerX /= teamPositions[otherTeam].length;
        centerY /= teamPositions[otherTeam].length;
        
        const dx = centerX - x;
        const dy = centerY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const ndx = dx / distance;
            const ndy = dy / distance;
            
            let weight = 0;
            
            if (teamSizes[otherTeam] > teamSizes[team]) {
                weight -= config.fear * (teamSizes[otherTeam] / teamSizes[team] - 1);
            }
            
            if (teamSizes[otherTeam] < teamSizes[team]) {
                weight += config.intelligence * (1 - teamSizes[otherTeam] / teamSizes[team]);
            }
            
            weight += config.aggressiveness * 0.3;
            weight *= Math.max(0, 1 - distance / 30);
            
            directions.push({ dx: ndx * weight, dy: ndy * weight });
        }
    }
    
    let totalDx = 0, totalDy = 0;
    for (const dir of directions) {
        totalDx += dir.dx;
        totalDy += dir.dy;
    }
    
    if (Math.abs(totalDx) > 0.1 || Math.abs(totalDy) > 0.1) {
        return {
            dx: totalDx > 0.1 ? 1 : (totalDx < -0.1 ? -1 : 0),
            dy: totalDy > 0.1 ? 1 : (totalDy < -0.1 ? -1 : 0)
        };
    }
    
    return null;
}

function calculateHerdChance(grid, team, x, y, herdRate, gridWidth, gridHeight) {
    let teamNeighbors = 0;
    
    for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) {
                continue;
            }
            
            const ni = y + di;
            const nj = x + dj;
            
            if (ni >= 0 && ni < gridHeight && 
                nj >= 0 && nj < gridWidth && 
                grid[ni][nj] === team) {
                teamNeighbors++;
            }
        }
    }
    
    const minNeighbors = Math.floor(herdRate * 3);
    return teamNeighbors >= minNeighbors ? 1.0 : 0.3 + (0.7 * teamNeighbors / minNeighbors);
}

function detectStillLifes() {
    // Implementation for detecting stable patterns
    return [];
}

function detectOscillators() {
    // Implementation for detecting oscillating patterns
    return [];
}

function detectSpaceships() {
    // Implementation for detecting moving patterns
    return [];
}

function countClusters(grid, width, height) {
    // Implementation for counting connected components
    let clusters = 0;
    const visited = createEmptyGrid(height, width);
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (grid[i][j] > 0 && !visited[i][j]) {
                clusters++;
                floodFill(grid, visited, j, i, width, height);
            }
        }
    }
    
    return clusters;
}

function floodFill(grid, visited, x, y, width, height) {
    if (x < 0 || x >= width || y < 0 || y >= height || 
        visited[y][x] || grid[y][x] === 0) {
        return;
    }
    
    visited[y][x] = true;
    
    // Check 8 directions
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx !== 0 || dy !== 0) {
                floodFill(grid, visited, x + dx, y + dy, width, height);
            }
        }
    }
}

function getNeighbors(grid, x, y, width, height) {
    const neighbors = [];
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
                continue;
            }
            
            const newRow = y + i;
            const newCol = x + j;
            
            if (newRow >= 0 && newRow < height && 
                newCol >= 0 && newCol < width) {
                neighbors.push(grid[newRow][newCol]);
            }
        }
    }
    
    return neighbors;
}

// Enhanced batch computation for multiple generations
function computeBatchUpdate({ grid, cellAges, teamConfigs, formulas, teamMode, generations, batchSize = 10 }) {
    const startTime = performance.now();
    let currentGrid = grid.map(row => [...row]);
    let currentCellAges = cellAges.map(row => [...row]);
    
    for (let gen = 0; gen < generations; gen++) {
        const updateResult = computeGameUpdate({
            grid: currentGrid,
            cellAges: currentCellAges,
            teamConfigs,
            formulas,
            teamMode,
            bounds: null
        });
        
        currentGrid = updateResult.newGrid;
        currentCellAges = updateResult.newCellAges;
        
        // Send progress updates
        if ((gen + 1) % batchSize === 0 || gen === generations - 1) {
            const progress = (gen + 1) / generations;
            self.postMessage({
                type: 'batch-progress',
                result: {
                    progress,
                    generation: gen + 1,
                    newGrid: currentGrid,
                    newCellAges: currentCellAges,
                    teamStats: updateResult.teamStats,
                    processingTime: performance.now() - startTime
                }
            });
        }
    }
    
    self.postMessage({
        type: 'batch-complete',
        result: {
            newGrid: currentGrid,
            newCellAges: currentCellAges,
            generationsProcessed: generations,
            totalTime: performance.now() - startTime
        }
    });
}

// Compute activity heatmap for performance analysis
function computeActivityHeatmap({ grid, previousGrid }) {
    const height = grid.length;
    const width = grid[0].length;
    const heatmap = createEmptyGrid(height, width);
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            // Calculate activity level based on changes
            const current = grid[i][j];
            const previous = previousGrid ? previousGrid[i][j] : 0;
            
            let activity = 0;
            
            // Cell state change
            if (current !== previous) {
                activity += 1;
            }
            
            // Neighbor activity
            const neighbors = getNeighbors(grid, j, i, width, height);
            const neighborCount = neighbors.filter(n => n > 0).length;
            activity += neighborCount * 0.1;
            
            // Territory conflict detection
            const uniqueNeighbors = new Set(neighbors.filter(n => n > 0));
            if (uniqueNeighbors.size > 1) {
                activity += 0.5; // Conflict zone
            }
            
            heatmap[i][j] = Math.min(activity, 1);
        }
    }
    
    return heatmap;
}

// Analyze battle metrics and team performance
function analyzeBattleMetrics({ grid, cellAges, generation }) {
    const height = grid.length;
    const width = grid[0].length;
    
    const analysis = {
        generation,
        teams: {},
        battlefronts: [],
        territoryControl: {},
        efficiency: {},
        threats: {},
        timestamp: Date.now()
    };
    
    // Initialize team data
    for (let team = 1; team <= 4; team++) {
        analysis.teams[team] = {
            population: 0,
            territory: 0,
            averageAge: 0,
            frontlineLength: 0,
            clusters: 0,
            density: 0
        };
    }
    
    // Analyze each cell
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const team = grid[i][j];
            const age = cellAges[i][j];
            
            if (team > 0) {
                analysis.teams[team].population++;
                analysis.teams[team].averageAge += age;
                
                // Check if this is a frontline cell
                const neighbors = getNeighbors(grid, j, i, width, height);
                const enemyNeighbors = neighbors.filter(n => n > 0 && n !== team).length;
                
                if (enemyNeighbors > 0) {
                    analysis.teams[team].frontlineLength++;
                    
                    // Record battlefront
                    analysis.battlefronts.push({
                        x: j,
                        y: i,
                        team: team,
                        enemyCount: enemyNeighbors,
                        intensity: enemyNeighbors / neighbors.filter(n => n > 0).length
                    });
                }
            }
        }
    }
    
    // Calculate derived metrics
    const totalCells = width * height;
    for (let team = 1; team <= 4; team++) {
        const teamData = analysis.teams[team];
        if (teamData.population > 0) {
            teamData.averageAge /= teamData.population;
            teamData.territory = (teamData.population / totalCells) * 100;
            teamData.density = teamData.population / (width * height);
            teamData.clusters = countTeamClusters(grid, team, width, height);
            
            // Calculate efficiency metrics
            analysis.efficiency[team] = {
                growthRate: teamData.population / Math.max(generation, 1),
                survivalRate: teamData.averageAge / 30, // Assuming max age of 30
                combatEfficiency: teamData.frontlineLength / Math.max(teamData.population, 1),
                territorialControl: teamData.territory / Math.max(teamData.clusters, 1)
            };
            
            // Threat assessment
            analysis.threats[team] = {
                borderPressure: teamData.frontlineLength / Math.max(teamData.population, 1),
                enemyProximity: calculateEnemyProximity(grid, team, width, height),
                vulnerabilityIndex: calculateVulnerability(grid, team, width, height)
            };
        }
    }
    
    // Territory control analysis
    const dominantTeam = Object.entries(analysis.teams)
        .reduce((max, [team, data]) => data.population > max.population ? { team: parseInt(team), ...data } : max, { population: 0 });
    
    analysis.territoryControl = {
        dominantTeam: dominantTeam.team || 0,
        controlPercentage: dominantTeam.territory || 0,
        contested: analysis.battlefronts.length,
        totalBattlefronts: analysis.battlefronts.length
    };
    
    return analysis;
}

function countTeamClusters(grid, team, width, height) {
    let clusters = 0;
    const visited = createEmptyGrid(height, width);
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (grid[i][j] === team && !visited[i][j]) {
                clusters++;
                teamFloodFill(grid, visited, j, i, width, height, team);
            }
        }
    }
    
    return clusters;
}

function teamFloodFill(grid, visited, x, y, width, height, team) {
    if (x < 0 || x >= width || y < 0 || y >= height || 
        visited[y][x] || grid[y][x] !== team) {
        return;
    }
    
    visited[y][x] = true;
    
    // Check 8 directions
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx !== 0 || dy !== 0) {
                teamFloodFill(grid, visited, x + dx, y + dy, width, height, team);
            }
        }
    }
}

function calculateEnemyProximity(grid, team, width, height) {
    let totalProximity = 0;
    let teamCells = 0;
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (grid[i][j] === team) {
                teamCells++;
                
                // Check proximity to enemies
                let minEnemyDistance = Infinity;
                for (let ei = 0; ei < height; ei++) {
                    for (let ej = 0; ej < width; ej++) {
                        const enemyTeam = grid[ei][ej];
                        if (enemyTeam > 0 && enemyTeam !== team) {
                            const distance = Math.sqrt((i - ei) ** 2 + (j - ej) ** 2);
                            minEnemyDistance = Math.min(minEnemyDistance, distance);
                        }
                    }
                }
                
                if (minEnemyDistance !== Infinity) {
                    totalProximity += 1 / Math.max(minEnemyDistance, 1);
                }
            }
        }
    }
    
    return teamCells > 0 ? totalProximity / teamCells : 0;
}

function calculateVulnerability(grid, team, width, height) {
    let vulnerability = 0;
    let teamCells = 0;
    
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (grid[i][j] === team) {
                teamCells++;
                
                const neighbors = getNeighbors(grid, j, i, width, height);
                const sameTeamNeighbors = neighbors.filter(n => n === team).length;
                const enemyNeighbors = neighbors.filter(n => n > 0 && n !== team).length;
                const totalNeighbors = neighbors.filter(n => n > 0).length;
                
                // Higher vulnerability if surrounded by enemies or isolated
                if (totalNeighbors > 0) {
                    vulnerability += enemyNeighbors / totalNeighbors;
                } else if (sameTeamNeighbors === 0) {
                    vulnerability += 1; // Isolated cell
                }
            }
        }
    }
    
    return teamCells > 0 ? vulnerability / teamCells : 0;
}
