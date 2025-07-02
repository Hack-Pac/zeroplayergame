class GameOfLife {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 10;
        this.gridWidth = 80;
        this.gridHeight = 60;
        
        this.canvas.width = this.gridWidth * this.cellSize;
        this.canvas.height = this.gridHeight * this.cellSize;
        
        this.grid = this.createGrid();
        this.cellAges = this.createGrid(); // Track age of each cell for fade-in effect
        this.fadeInDuration = 5; // Number of generations for complete fade-in
        this.running = false;
        this.generation = 0;
        this.speed = 10;
        this.isDrawing = false; // Track mouse drag state
        this.lastDrawnCell = null; // Track last cell to prevent duplicates
        this.currentTeam = 0; // Currently selected team
        this.teamColors = {
            0: '#ffffff', // White for no team
            1: '#ff4444', // Red
            2: '#4444ff', // Blue
            3: '#44ff44', // Green
            4: '#ffff44'  // Yellow
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
        
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    }
    
    handleCanvasClick(event) {
        if (this.running) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            // Toggle cell with current team
            if (this.grid[gridY][gridX] === 0) {
                this.grid[gridY][gridX] = this.currentTeam || 1; // Use team 1 if no team selected
                this.cellAges[gridY][gridX] = 0;
            } else {
                this.grid[gridY][gridX] = 0;
                this.cellAges[gridY][gridX] = 0;
            }
            this.teamMode = this.hasMultipleTeams();
            document.getElementById('teamStats').style.display = this.teamMode ? 'flex' : 'none';
            this.draw();
        }
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
        
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                const neighborData = this.countNeighbors(i, j);
                const currentTeam = this.grid[i][j];
                
                if (currentTeam > 0) {
                    // Cell is alive
                    if (neighborData.count === 2 || neighborData.count === 3) {
                        // In team mode, cell might change team based on neighbors
                        if (this.teamMode && neighborData.dominantTeam > 0 && 
                            neighborData.teamCounts[neighborData.dominantTeam] >= 2) {
                            newGrid[i][j] = neighborData.dominantTeam;
                            newCellAges[i][j] = currentTeam === neighborData.dominantTeam ? 
                                Math.min(this.cellAges[i][j] + 1, this.fadeInDuration) : 0;
                        } else {
                            newGrid[i][j] = currentTeam;
                            newCellAges[i][j] = Math.min(this.cellAges[i][j] + 1, this.fadeInDuration);
                        }
                    }
                } else {
                    // Cell is dead
                    if (neighborData.count === 3) {
                        // New cell takes the dominant team color
                        newGrid[i][j] = neighborData.dominantTeam || 1;
                        newCellAges[i][j] = 0;
                    }
                }
            }
        }
        
        this.grid = newGrid;
        this.cellAges = newCellAges;
        this.generation++;
        this.updateInfo();
        if (this.teamMode) this.updateTeamStats();
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.gridHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let j = 0; j <= this.gridWidth; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.cellSize, 0);
            this.ctx.lineTo(j * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
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
        if (this.running) return;
        this.isDrawing = true;
        this.lastDrawnCell = null;
        this.drawCell(event);
    }

    handleMouseMove(event) {
        if (!this.isDrawing || this.running) return;
        this.drawCell(event);
    }

    handleMouseUp() {
        this.isDrawing = false;
        this.lastDrawnCell = null;
    }

    drawCell(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        
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