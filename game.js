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
        this.running = false;
        this.generation = 0;
        this.speed = 10;
        
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
        
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speed;
        });
        
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }
    
    handleCanvasClick(event) {
        if (this.running) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            this.grid[gridY][gridX] = this.grid[gridY][gridX] ? 0 : 1;
            this.draw();
        }
    }
    
    countNeighbors(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const nx = x + i;
                const ny = y + j;
                
                if (nx >= 0 && nx < this.gridHeight && ny >= 0 && ny < this.gridWidth) {
                    count += this.grid[nx][ny];
                }
            }
        }
        return count;
    }
    
    update() {
        const newGrid = this.createGrid();
        
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                const neighbors = this.countNeighbors(i, j);
                
                if (this.grid[i][j] === 1) {
                    if (neighbors === 2 || neighbors === 3) {
                        newGrid[i][j] = 1;
                    }
                } else {
                    if (neighbors === 3) {
                        newGrid[i][j] = 1;
                    }
                }
            }
        }
        
        this.grid = newGrid;
        this.generation++;
        this.updateInfo();
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
        
        this.ctx.fillStyle = '#fff';
        for (let i = 0; i < this.gridHeight; i++) {
            for (let j = 0; j < this.gridWidth; j++) {
                if (this.grid[i][j] === 1) {
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
                        this.grid[i][j] = Math.random() < 0.2 ? 1 : 0;
                    }
                }
            },
            
            glider: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                const glider = [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
                glider.forEach(([dx, dy]) => {
                    if (x + dx < this.gridHeight && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = 1;
                    }
                });
            },
            
            blinker: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                for (let i = 0; i < 3; i++) {
                    if (y + i < this.gridWidth) {
                        this.grid[x][y + i] = 1;
                    }
                }
            },
            
            toad: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                const toad = [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]];
                toad.forEach(([dx, dy]) => {
                    if (x + dx < this.gridHeight && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = 1;
                    }
                });
            },
            
            beacon: () => {
                const x = Math.floor(this.gridHeight / 2);
                const y = Math.floor(this.gridWidth / 2);
                const beacon = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]];
                beacon.forEach(([dx, dy]) => {
                    if (x + dx < this.gridHeight && y + dy < this.gridWidth) {
                        this.grid[x + dx][y + dy] = 1;
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
                        this.grid[x + dx][y + dy] = 1;
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
                        this.grid[x + dx][y + dy] = 1;
                    }
                });
            }
        };
        
        if (patterns[pattern]) {
            patterns[pattern]();
            this.draw();
        }
    }
    
    clear() {
        this.grid = this.createGrid();
        this.generation = 0;
        this.running = false;
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
}

document.addEventListener('DOMContentLoaded', () => {
    new GameOfLife();
});