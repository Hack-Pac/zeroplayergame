class GameOfLife {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 10;
        this.gridWidth = 80;
        this.gridHeight = 60;
        
        // Fixed canvas size for viewport
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Camera/viewport properties
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            minZoom: 0.25,
            maxZoom: 4
        };
        
        // Mouse state
        this.mouse = {
            lastX: 0,
            lastY: 0,
            isPanning: false,
            isDrawing: false,
            panStartX: 0,
            panStartY: 0,
            cameraStartX: 0,
            cameraStartY: 0
        };
        
        this.grid = this.createGrid();
        this.cellAges = this.createGrid(); // Track age of each cell for fade-in effect
        this.fadeInDuration = 5; // Number of generations for complete fade-in
        this.running = false;
        this.generation = 0;
        this.speed = 10;
        this.lastDrawnCell = null; // Track last cell to prevent duplicates
        this.currentTeam = 0; // Currently selected team
        this.teamColors = {
            0: '#ffffff', // White for no team
            1: '#ff4444', // Red
            2: '#4444ff', // Blue
            3: '#44ff44', // Green
            4: '#ffff44'  // Yellow
        };
        
        // Team configuration with default values
        this.teamConfigs = {
            1: { // Red team
                formula: 'conway',
                intelligence: 0.5,    // 0-1: How smart the team is at seeking/avoiding
                aggressiveness: 0.5,  // 0-1: How likely to convert enemy cells
                fear: 0.5,           // 0-1: Tendency to avoid larger teams
                multiplyRate: 1.0,   // 0.5-2: Multiplication speed modifier
                herdRate: 0.5        // 0-1: How closely cells stick together
            },
            2: { // Blue team
                formula: 'conway',
                intelligence: 0.5,
                aggressiveness: 0.5,
                fear: 0.5,
                multiplyRate: 1.0,
                herdRate: 0.5
            },
            3: { // Green team
                formula: 'conway',
                intelligence: 0.5,
                aggressiveness: 0.5,
                fear: 0.5,
                multiplyRate: 1.0,
                herdRate: 0.5
            },
            4: { // Yellow team
                formula: 'conway',
                intelligence: 0.5,
                aggressiveness: 0.5,
                fear: 0.5,
                multiplyRate: 1.0,
                herdRate: 0.5
            }
        };
        
        // Define game formulas (B = birth, S = survive)
        this.formulas = {
            conway: { birth: [3], survive: [2, 3] },
            highlife: { birth: [3, 6], survive: [2, 3] },
            daynight: { birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
            seeds: { birth: [2], survive: [] },
            life34: { birth: [3, 4], survive: [3, 4] },
            diamoeba: { birth: [3, 5, 6, 7, 8], survive: [5, 6, 7, 8] },
            morley: { birth: [3, 6, 8], survive: [2, 4, 5] },
            anneal: { birth: [4, 6, 7, 8], survive: [3, 5, 6, 7, 8] }
        };
        this.teamMode = false; // Whether team mode is active
        
        this.initializeEventListeners();
        this.loadPattern('random');
        this.draw();
    }
    
    createGrid() {
        return Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
    }
    
    initializeEventListeners() {
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('randomBtn').addEventListener('click', () => this.loadPattern('random'));
        
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPattern(e.target.dataset.pattern));
        });
        
        document.getElementById('nameBtn').addEventListener('click', () => this.drawName());
        document.getElementById('nameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.drawName();
        });
        
        // Team selection
        document.querySelectorAll('input[name="team"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentTeam = parseInt(e.target.value);
                this.teamMode = this.hasMultipleTeams();
                document.getElementById('teamStats').style.display = this.teamMode ? 'flex' : 'none';
            });
        });
        
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speed;
        });
        
        // Field size controls
        document.getElementById('applySize').addEventListener('click', () => {
            const newWidth = parseInt(document.getElementById('fieldWidth').value);
            const newHeight = parseInt(document.getElementById('fieldHeight').value);
            this.resizeField(newWidth, newHeight);
        });
        
        // Reset view button
        document.getElementById('resetView').addEventListener('click', () => {
            this.camera.x = 0;
            this.camera.y = 0;
            this.camera.zoom = 1;
            this.draw();
            this.updateZoomInfo();
        });
        
        // Initial zoom info
        this.updateZoomInfo();
        
        // Remove single click handler since we'll handle it differently
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Modal controls
        const configBtn = document.getElementById('configBtn');
        const modal = document.getElementById('configModal');
        const closeBtn = document.getElementsByClassName('close')[0];
        const applyConfigBtn = document.getElementById('applyConfig');
        const configTeamSelect = document.getElementById('configTeamSelect');
        
        configBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            this.loadTeamConfig(parseInt(configTeamSelect.value));
        });
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        configTeamSelect.addEventListener('change', (e) => {
            this.loadTeamConfig(parseInt(e.target.value));
        });
        
        // Slider event listeners
        const sliders = ['intelligence', 'aggressiveness', 'fear', 'multiplyRate', 'herdRate'];
        sliders.forEach(slider => {
            const input = document.getElementById(slider);
            const display = input.nextElementSibling;
            
            input.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                let displayValue;
                
                if (slider === 'multiplyRate') {
                    displayValue = (value / 100).toFixed(1);
                } else {
                    displayValue = (value / 100).toFixed(2);
                }
                
                display.textContent = displayValue;
            });
        });
        
        applyConfigBtn.addEventListener('click', () => {
            this.saveTeamConfig(parseInt(configTeamSelect.value));
            modal.style.display = 'none';
        });
    }
    
    loadTeamConfig(teamId) {
        const config = this.teamConfigs[teamId];
        document.getElementById('formula').value = config.formula;
        document.getElementById('intelligence').value = config.intelligence * 100;
        document.getElementById('aggressiveness').value = config.aggressiveness * 100;
        document.getElementById('fear').value = config.fear * 100;
        document.getElementById('multiplyRate').value = config.multiplyRate * 100;
        document.getElementById('herdRate').value = config.herdRate * 100;
        
        // Update display values
        document.getElementById('intelligence').nextElementSibling.textContent = config.intelligence.toFixed(2);
        document.getElementById('aggressiveness').nextElementSibling.textContent = config.aggressiveness.toFixed(2);
        document.getElementById('fear').nextElementSibling.textContent = config.fear.toFixed(2);
        document.getElementById('multiplyRate').nextElementSibling.textContent = config.multiplyRate.toFixed(1);
        document.getElementById('herdRate').nextElementSibling.textContent = config.herdRate.toFixed(2);
    }
    
    saveTeamConfig(teamId) {
        this.teamConfigs[teamId] = {
            formula: document.getElementById('formula').value,
            intelligence: parseInt(document.getElementById('intelligence').value) / 100,
            aggressiveness: parseInt(document.getElementById('aggressiveness').value) / 100,
            fear: parseInt(document.getElementById('fear').value) / 100,
            multiplyRate: parseInt(document.getElementById('multiplyRate').value) / 100,
            herdRate: parseInt(document.getElementById('herdRate').value) / 100
        };
    }
    
    handleCanvasClick(event) {
        // This method is no longer used - handled in mousedown/up instead
    }
    
    countNeighbors(x, y) {
        let count = 0;
        let teamCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const nx = x + i;
                const ny = y + j;
                
                if (nx >= 0 && nx < this.gridHeight && ny >= 0 && ny < this.gridWidth) {
                    const team = this.grid[nx][ny];
                    if (team > 0) {
                        count++;
                        teamCounts[team]++;
                    }
                }
            }
        }
        
        // Find dominant team among neighbors
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
    
    update() {
        const newGrid = this.createGrid();
        const newCellAges = this.createGrid();
        
        // Calculate team statistics for intelligent behavior
        let teamSizes = { 1: 0, 2: 0, 3: 0, 4: 0 };
        let teamPositions = { 1: [], 2: [], 3: [], 4: [] };
        
        if (this.teamMode) {
            for (let i = 0; i < this.gridHeight; i++) {
                for (let j = 0; j < this.gridWidth; j++) {
                    const team = this.grid[i][j];
                    if (team > 0) {
                        teamSizes[team]++;
                        teamPositions[team].push({ x: j, y: i });
                    }
                }
            }
        }
        
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                const neighborData = this.countNeighbors(i, j);
                const currentTeam = this.grid[i][j];
                
                if (currentTeam > 0) {
                    // Cell is alive - check survival rules for its team
                    const teamConfig = this.teamConfigs[currentTeam];
                    const teamFormula = this.formulas[teamConfig.formula];
                    let survives = teamFormula.survive.includes(neighborData.count);
                    
                    // Herd rate affects survival - cells with more team neighbors are more likely to survive
                    if (survives && teamConfig.herdRate > 0.5) {
                        const teamNeighborRatio = neighborData.teamCounts[currentTeam] / neighborData.count;
                        const herdBonus = (teamConfig.herdRate - 0.5) * 2; // 0 to 1
                        survives = survives || (Math.random() < teamNeighborRatio * herdBonus * 0.3);
                    }
                    
                    if (survives) {
                        // Apply aggressiveness factor for team conversion
                        if (this.teamMode && neighborData.dominantTeam > 0 && 
                            neighborData.dominantTeam !== currentTeam) {
                            
                            const aggressiveness = this.teamConfigs[neighborData.dominantTeam].aggressiveness;
                            const threshold = Math.max(1, Math.floor(2 * (1 - aggressiveness) + 1));
                            
                            if (neighborData.teamCounts[neighborData.dominantTeam] >= threshold) {
                                newGrid[i][j] = neighborData.dominantTeam;
                                newCellAges[i][j] = 0;
                            } else {
                                newGrid[i][j] = currentTeam;
                                newCellAges[i][j] = Math.min(this.cellAges[i][j] + 1, this.fadeInDuration);
                            }
                        } else {
                            newGrid[i][j] = currentTeam;
                            newCellAges[i][j] = Math.min(this.cellAges[i][j] + 1, this.fadeInDuration);
                        }
                    }
                    // Cell dies if it doesn't meet survival conditions
                } else {
                    // Cell is dead - check birth rules for dominant team
                    if (neighborData.dominantTeam > 0) {
                        const teamConfig = this.teamConfigs[neighborData.dominantTeam];
                        const teamFormula = this.formulas[teamConfig.formula];
                        let canBeBorn = teamFormula.birth.includes(neighborData.count);
                        
                        // Intelligence affects birth patterns - smarter teams can adapt birth conditions
                        if (!canBeBorn && teamConfig.intelligence > 0.7) {
                            // High intelligence teams can sometimes birth with one neighbor count off
                            const nearBirth = teamFormula.birth.some(b => 
                                Math.abs(b - neighborData.count) === 1
                            );
                            if (nearBirth && Math.random() < (teamConfig.intelligence - 0.7) * 2) {
                                canBeBorn = true;
                            }
                        }
                        
                        if (canBeBorn) {
                            const multiplyRate = teamConfig.multiplyRate;
                            
                            // Fear factor affects birth when enemy teams are nearby
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
                            
                            const birthChance = Math.random();
                            if (birthChance < multiplyRate * fearPenalty) {
                                newGrid[i][j] = neighborData.dominantTeam;
                                newCellAges[i][j] = 0;
                            }
                        }
                    }
                }
            }
        }
        
        // Apply intelligence-based movement for cells at the edge of groups
        if (this.teamMode) {
            this.applyIntelligentBehavior(newGrid, teamSizes, teamPositions);
        }
        
        this.grid = newGrid;
        this.cellAges = newCellAges;
        this.generation++;
        this.updateInfo();
        if (this.teamMode) this.updateTeamStats();
    }
    
    applyIntelligentBehavior(grid, teamSizes, teamPositions) {
        for (let team = 1; team <= 4; team++) {
            const config = this.teamConfigs[team];
            if (config.intelligence === 0) continue;
            
            // Find cells at the edge of groups
            const edgeCells = this.findEdgeCells(team);
            
            for (const cell of edgeCells) {
                const { x, y } = cell;
                
                // Calculate direction based on intelligence and other factors
                const direction = this.calculateIntelligentDirection(
                    team, x, y, teamSizes, teamPositions, config
                );
                
                if (direction) {
                    const newX = x + direction.dx;
                    const newY = y + direction.dy;
                    
                    // Check bounds and if target is empty
                    if (newX >= 0 && newX < this.gridWidth && 
                        newY >= 0 && newY < this.gridHeight && 
                        grid[newY][newX] === 0) {
                        
                        // Apply herd rate - cells are more likely to move if they maintain group cohesion
                        const herdChance = this.calculateHerdChance(team, newX, newY, config.herdRate);
                        
                        if (Math.random() < herdChance) {
                            grid[newY][newX] = team;
                            this.cellAges[newY][newX] = 0;
                        }
                    }
                }
            }
        }
    }
    
    findEdgeCells(team) {
        const edgeCells = [];
        
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                if (this.grid[i][j] === team) {
                    // Check if cell is at edge (has at least one empty neighbor)
                    let hasEmptyNeighbor = false;
                    
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (di === 0 && dj === 0) continue;
                            
                            const ni = i + di;
                            const nj = j + dj;
                            
                            if (ni >= 0 && ni < this.gridHeight && 
                                nj >= 0 && nj < this.gridWidth && 
                                this.grid[ni][nj] === 0) {
                                hasEmptyNeighbor = true;
                                break;
                            }
                        }
                        if (hasEmptyNeighbor) break;
                    }
                    
                    if (hasEmptyNeighbor) {
                        edgeCells.push({ x: j, y: i });
                    }
                }
            }
        }
        
        return edgeCells;
    }
    
    calculateIntelligentDirection(team, x, y, teamSizes, teamPositions, config) {
        const directions = [];
        
        // Calculate attractions and repulsions
        for (let otherTeam = 1; otherTeam <= 4; otherTeam++) {
            if (otherTeam === team) continue;
            if (teamPositions[otherTeam].length === 0) continue;
            
            // Calculate center of mass for other team
            let centerX = 0, centerY = 0;
            for (const pos of teamPositions[otherTeam]) {
                centerX += pos.x;
                centerY += pos.y;
            }
            centerX /= teamPositions[otherTeam].length;
            centerY /= teamPositions[otherTeam].length;
            
            // Calculate direction vector
            const dx = centerX - x;
            const dy = centerY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Normalize direction
                const ndx = dx / distance;
                const ndy = dy / distance;
                
                // Determine if we should approach or avoid
                let weight = 0;
                
                // Fear factor - avoid larger teams
                if (teamSizes[otherTeam] > teamSizes[team]) {
                    weight -= config.fear * (teamSizes[otherTeam] / teamSizes[team] - 1);
                }
                
                // Intelligence factor - seek smaller teams
                if (teamSizes[otherTeam] < teamSizes[team]) {
                    weight += config.intelligence * (1 - teamSizes[otherTeam] / teamSizes[team]);
                }
                
                // Aggressiveness factor - more likely to approach enemies
                weight += config.aggressiveness * 0.3;
                
                // Distance factor - closer targets are more influential
                weight *= Math.max(0, 1 - distance / 30);
                
                directions.push({ dx: ndx * weight, dy: ndy * weight });
            }
        }
        
        // Sum all direction vectors
        let totalDx = 0, totalDy = 0;
        for (const dir of directions) {
            totalDx += dir.dx;
            totalDy += dir.dy;
        }
        
        // Convert to discrete direction
        if (Math.abs(totalDx) > 0.1 || Math.abs(totalDy) > 0.1) {
            return {
                dx: totalDx > 0.1 ? 1 : (totalDx < -0.1 ? -1 : 0),
                dy: totalDy > 0.1 ? 1 : (totalDy < -0.1 ? -1 : 0)
            };
        }
        
        return null;
    }
    
    calculateHerdChance(team, x, y, herdRate) {
        // Count team neighbors around the new position
        let teamNeighbors = 0;
        
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                
                const ni = y + di;
                const nj = x + dj;
                
                if (ni >= 0 && ni < this.gridHeight && 
                    nj >= 0 && nj < this.gridWidth && 
                    this.grid[ni][nj] === team) {
                    teamNeighbors++;
                }
            }
        }
        
        // Higher herd rate means cells need more neighbors to move
        const minNeighbors = Math.floor(herdRate * 3);
        return teamNeighbors >= minNeighbors ? 1.0 : 0.3 + (0.7 * teamNeighbors / minNeighbors);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Calculate visible area
        const startX = Math.floor(this.camera.x / this.cellSize);
        const startY = Math.floor(this.camera.y / this.cellSize);
        const endX = Math.ceil((this.camera.x + this.canvas.width / this.camera.zoom) / this.cellSize);
        const endY = Math.ceil((this.camera.y + this.canvas.height / this.camera.zoom) / this.cellSize);
        
        // Draw grid lines (only in visible area)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5 / this.camera.zoom;
        
        for (let i = Math.max(0, startY); i <= Math.min(this.gridHeight, endY); i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX * this.cellSize, i * this.cellSize);
            this.ctx.lineTo(endX * this.cellSize, i * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let j = Math.max(0, startX); j <= Math.min(this.gridWidth, endX); j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.cellSize, startY * this.cellSize);
            this.ctx.lineTo(j * this.cellSize, endY * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw cells (only in visible area)
        for (let i = Math.max(0, startY); i < Math.min(this.gridHeight, endY); i++) {
            for (let j = Math.max(0, startX); j < Math.min(this.gridWidth, endX); j++) {
                const team = this.grid[i][j];
                if (team > 0) {
                    // Calculate opacity based on cell age
                    const opacity = this.cellAges[i][j] / this.fadeInDuration;
                    const color = this.teamColors[team] || this.teamColors[0];
                    
                    // Extract RGB values from hex color
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    
                    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    
                    this.ctx.fillRect(
                        j * this.cellSize + 1,
                        i * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                }
            }
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    loadPattern(pattern) {
        this.clear();
        
        const patterns = {
            random: () => {
                for (let i = 0; i < this.gridHeight; i++) {
                    for (let j = 0; j < this.gridWidth; j++) {
                        this.grid[i][j] = Math.random() < 0.2 ? (this.currentTeam || 1) : 0;
                    }
                }
            },
            
            glider: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                const glider = [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
                glider.forEach(([dx, dy]) => {
                    if (x + dx < this.gridHeight && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = this.currentTeam || 1;
                    }
                });
            },
            
            blinker: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                for (let i = 0; i < 3; i++) {
                    if (y + i < this.gridWidth) {
                        this.grid[x][y + i] = this.currentTeam || 1;
                    }
                }
            },
            
            toad: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                const toad = [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]];
                toad.forEach(([dx, dy]) => {
                    if (x + dx < this.gridHeight && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = this.currentTeam || 1;
                    }
                });
            },
            
            beacon: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                const beacon = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]];
                beacon.forEach(([dx, dy]) => {
                    if (x + dx < this.gridHeight && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = this.currentTeam || 1;
                    }
                });
            },
            
            pulsar: () => {
                const x = Math.floor(this.gridHeight / 2) - 6;
                const y = Math.floor(this.gridWidth / 2) - 6;
                const pulsar = [
                    [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
                    [2, 0], [2, 5], [2, 7], [2, 12],
                    [3, 0], [3, 5], [3, 7], [3, 12],
                    [4, 0], [4, 5], [4, 7], [4, 12],
                    [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
                    [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
                    [8, 0], [8, 5], [8, 7], [8, 12],
                    [9, 0], [9, 5], [9, 7], [9, 12],
                    [10, 0], [10, 5], [10, 7], [10, 12],
                    [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10]
                ];
                pulsar.forEach(([dx, dy]) => {
                    if (x + dx >= 0 && x + dx < this.gridHeight && y + dy >= 0 && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = this.currentTeam || 1;
                    }
                });
            },
            
            gosperGliderGun: () => {
                const x = 10;
                const y = 10;
                const gun = [
                    [0, 24], [1, 22], [1, 24], [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
                    [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35], [4, 0], [4, 1], [4, 10],
                    [4, 16], [4, 20], [4, 21], [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17],
                    [5, 22], [5, 24], [6, 10], [6, 16], [6, 24], [7, 11], [7, 15], [8, 12], [8, 13]
                ];
                gun.forEach(([dx, dy]) => {
                    if (x + dx < this.gridHeight && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = this.currentTeam || 1;
                    }
                });
            }
        };
        
        if (patterns[pattern]) {
            patterns[pattern]();
            // Set cell ages to maximum for immediate visibility
            for (let i = 0; i < this.gridHeight; i++) {
                for (let j = 0; j < this.gridWidth; j++) {
                    if (this.grid[i][j] > 0) {
                        this.cellAges[i][j] = this.fadeInDuration;
                    }
                }
            }
            this.teamMode = this.hasMultipleTeams();
            document.getElementById('teamStats').style.display = this.teamMode ? 'flex' : 'none';
            this.draw();
        }
    }
    
    clear() {
        this.grid = this.createGrid();
        this.cellAges = this.createGrid(); // Reset cell ages
        this.generation = 0;
        this.running = false;
        this.teamMode = false;
        document.getElementById('teamStats').style.display = 'none';
        this.updateInfo();
        this.draw();
        document.getElementById('playPauseBtn').textContent = 'Play';
    }
    
    togglePlay() {
        this.running = !this.running;
        document.getElementById('playPauseBtn').textContent = this.running ? 'Pause' : 'Play';
        this.updateInfo();
        
        if (this.running) {
            this.run();
        }
    }
    
    run() {
        if (!this.running) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => this.run(), 1000 / this.speed);
    }
    
    updateInfo() {
        document.getElementById('generation').textContent = `Generation: ${this.generation}`;
        document.getElementById('status').textContent = this.running ? 'Running' : 'Paused';
    }

    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (event.button === 0 && !event.shiftKey) {
            // Left click without shift - drawing mode
            this.mouse.isDrawing = true;
            this.mouse.isPanning = false;
            this.lastDrawnCell = null;
            this.drawCell(event);
        } else if (event.button === 0 && event.shiftKey || event.button === 2) {
            // Shift+left click or right click - panning mode
            this.mouse.isPanning = true;
            this.mouse.isDrawing = false;
            this.mouse.panStartX = x;
            this.mouse.panStartY = y;
            this.mouse.cameraStartX = this.camera.x;
            this.mouse.cameraStartY = this.camera.y;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.mouse.isPanning) {
            // Pan the camera
            const dx = x - this.mouse.panStartX;
            const dy = y - this.mouse.panStartY;
            this.camera.x = this.mouse.cameraStartX - dx / this.camera.zoom;
            this.camera.y = this.mouse.cameraStartY - dy / this.camera.zoom;
            this.draw();
        } else if (this.mouse.isDrawing) {
            this.drawCell(event);
        }
        
        // Update cursor
        if (event.shiftKey && !this.mouse.isPanning) {
            this.canvas.style.cursor = 'grab';
        } else if (!this.mouse.isPanning) {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    handleMouseUp(event) {
        this.mouse.isDrawing = false;
        this.mouse.isPanning = false;
        this.lastDrawnCell = null;
        this.canvas.style.cursor = event.shiftKey ? 'grab' : 'crosshair';
    }
    
    handleWheel(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Get world coordinates before zoom
        const worldX = (mouseX + this.camera.x * this.camera.zoom) / this.camera.zoom;
        const worldY = (mouseY + this.camera.y * this.camera.zoom) / this.camera.zoom;
        
        // Adjust zoom
        const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
        this.camera.zoom = Math.max(this.camera.minZoom, 
                          Math.min(this.camera.maxZoom, this.camera.zoom * zoomDelta));
        
        // Adjust camera to keep mouse position fixed
        this.camera.x = worldX - mouseX / this.camera.zoom;
        this.camera.y = worldY - mouseY / this.camera.zoom;
        
        this.draw();
        this.updateZoomInfo();
    }
    
    updateZoomInfo() {
        const zoomPercent = Math.round(this.camera.zoom * 100);
        document.getElementById('zoomInfo').textContent = `Zoom: ${zoomPercent}%`;
    }
    
    resizeField(newWidth, newHeight) {
        if (newWidth < 50 || newWidth > 500 || newHeight < 50 || newHeight > 500) {
            alert('Field size must be between 50 and 500');
            return;
        }
        
        // Create new grids
        const oldGrid = this.grid;
        const oldAges = this.cellAges;
        this.gridWidth = newWidth;
        this.gridHeight = newHeight;
        this.grid = this.createGrid();
        this.cellAges = this.createGrid();
        
        // Copy old data
        const copyHeight = Math.min(oldGrid.length, this.gridHeight);
        const copyWidth = Math.min(oldGrid[0].length, this.gridWidth);
        
        for (let i = 0; i < copyHeight; i++) {
            for (let j = 0; j < copyWidth; j++) {
                this.grid[i][j] = oldGrid[i][j];
                this.cellAges[i][j] = oldAges[i][j];
            }
        }
        
        this.draw();
    }

    drawCell(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates
        const worldX = (x / this.camera.zoom) + this.camera.x;
        const worldY = (y / this.camera.zoom) + this.camera.y;
        
        const gridX = Math.floor(worldX / this.cellSize);
        const gridY = Math.floor(worldY / this.cellSize);
        
        // Check if we're in bounds and not redrawing the same cell
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            // Prevent redrawing the same cell during drag
            if (this.lastDrawnCell && this.lastDrawnCell.x === gridX && this.lastDrawnCell.y === gridY) {
                return;
            }
            
            this.grid[gridY][gridX] = this.currentTeam || 1;
            this.cellAges[gridY][gridX] = this.fadeInDuration; // Make drawn cells fully visible
            this.lastDrawnCell = { x: gridX, y: gridY };
            this.teamMode = this.hasMultipleTeams();
            document.getElementById('teamStats').style.display = this.teamMode ? 'flex' : 'none';
            this.draw();
        }
    }

    hasMultipleTeams() {
        const teams = new Set();
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                if (this.grid[i][j] > 0) {
                    teams.add(this.grid[i][j]);
                    if (teams.size > 1) return true;
                }
            }
        }
        return false;
    }

    updateTeamStats() {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                const team = this.grid[i][j];
                if (team > 0) {
                    counts[team]++;
                }
            }
        }
        
        for (let team = 1; team <= 4; team++) {
            document.querySelector(`#stat${team} span`).textContent = counts[team];
        }
    }

    drawName() {
        const name = document.getElementById('nameInput').value.trim().toUpperCase();
        if (!name) return;
        
        this.clear();
        
        // 5x7 pixel font for letters and numbers
        const pixelFont = {
            'A': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'B': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
            'C': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
            'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
            'E': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            'F': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
            'G': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'H': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'I': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
            'J': [[0,0,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
            'K': [[1,0,0,0,1],[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
            'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'P': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
            'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
            'R': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
            'S': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
            'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            'V': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
            'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
            'X': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1]],
            'Y': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
            'Z': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
            '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
            '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
            '3': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '4': [[0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
            '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '6': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
            '8': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            '9': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
            ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
            '.': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,1,1,0,0],[0,1,1,0,0]],
            '!': [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]]
        };
        
        // Calculate starting position to center the text
        const letterWidth = 6; // 5 pixels + 1 space
        const letterHeight = 7;
        const totalWidth = name.length * letterWidth - 1;
        const startX = Math.floor((this.gridWidth - totalWidth) / 2);
        const startY = Math.floor((this.gridHeight - letterHeight) / 2);
        
        // Draw each letter
        for (let i = 0; i < name.length; i++) {
            const char = name[i];
            const charPattern = pixelFont[char] || pixelFont[' '];
            
            for (let row = 0; row < charPattern.length; row++) {
                for (let col = 0; col < charPattern[row].length; col++) {
                    if (charPattern[row][col] === 1) {
                        const x = startX + i * letterWidth + col;
                        const y = startY + row;
                        
                        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                            this.grid[y][x] = this.currentTeam || 1;
                            this.cellAges[y][x] = this.fadeInDuration;
                        }
                    }
                }
            }
        }
        
        this.teamMode = this.hasMultipleTeams();
        document.getElementById('teamStats').style.display = this.teamMode ? 'flex' : 'none';
        this.draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameOfLife();
});