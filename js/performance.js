// Performance monitoring and optimization utilities

export class PerformanceMonitor {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.metrics = {
            fps: 0,
            updateTime: 0,
            renderTime: 0,
            totalCells: 0,
            activeCells: 0,
            memoryUsage: 0
        };
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.updateTimes = [];
        this.renderTimes = [];
        this.enabled = false;
        
        this.initializeUI();
    }
    
    initializeUI() {
        // Create performance panel
        const panel = document.createElement('div');
        panel.id = 'performancePanel';
        panel.className = 'performance-panel';
        panel.innerHTML = `
            <div class="performance-header">
                <h4>Performance Monitor</h4>
                <button id="togglePerformance">Toggle</button>
            </div>
            <div class="performance-content" style="display: none;">
                <div class="metric">FPS: <span id="fpsValue">0</span></div>
                <div class="metric">Update: <span id="updateTime">0</span>ms</div>
                <div class="metric">Render: <span id="renderTime">0</span>ms</div>
                <div class="metric">Active Cells: <span id="activeCells">0</span></div>
                <div class="metric">Memory: <span id="memoryUsage">0</span>MB</div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        document.getElementById('togglePerformance').addEventListener('click', () => {
            this.enabled = !this.enabled;
            const content = panel.querySelector('.performance-content');
            content.style.display = this.enabled ? 'block' : 'none';
        });
    }
    
    startUpdate() {
        this.updateStartTime = performance.now();
    }
    
    endUpdate() {
        const updateTime = performance.now() - this.updateStartTime;
        this.updateTimes.push(updateTime);
        if (this.updateTimes.length > 60) this.updateTimes.shift();
        this.metrics.updateTime = this.updateTimes.reduce((a, b) => a + b, 0) / this.updateTimes.length;
    }
    
    startRender() {
        this.renderStartTime = performance.now();
    }
    
    endRender() {
        const renderTime = performance.now() - this.renderStartTime;
        this.renderTimes.push(renderTime);
        if (this.renderTimes.length > 60) this.renderTimes.shift();
        this.metrics.renderTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    }
    
    calculateFPS() {
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastTime >= 1000) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
    
    countActiveCells() {
        let count = 0;
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                if (this.game.grid[i][j] > 0) count++;
            }
        }
        this.metrics.activeCells = count;
        this.metrics.totalCells = this.game.gridWidth * this.game.gridHeight;
    }
    
    estimateMemoryUsage() {
        const gridMemory = this.game.gridWidth * this.game.gridHeight * 8; // 2 grids * 4 bytes each
        const historyMemory = this.game.analytics ? this.game.analytics.populationHistory[1].length * 40 : 0;
        this.metrics.memoryUsage = Math.round((gridMemory + historyMemory) / 1024 / 1024 * 100) / 100;
    }
    
    update() {
        if (!this.enabled) return;
        
        this.calculateFPS();
        this.countActiveCells();
        this.estimateMemoryUsage();
        
        // Update UI
        document.getElementById('fpsValue').textContent = this.metrics.fps;
        document.getElementById('updateTime').textContent = this.metrics.updateTime.toFixed(1);
        document.getElementById('renderTime').textContent = this.metrics.renderTime.toFixed(1);
        document.getElementById('activeCells').textContent = this.metrics.activeCells;
        document.getElementById('memoryUsage').textContent = this.metrics.memoryUsage;
    }
    
    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.fps < 30) {
            recommendations.push("Low FPS detected. Consider reducing field size or speed.");
        }
        
        if (this.metrics.updateTime > 16) {
            recommendations.push("Update time is high. Large grid may be causing performance issues.");
        }
        
        if (this.metrics.renderTime > 16) {
            recommendations.push("Render time is high. Consider reducing zoom level or grid complexity.");
        }
        
        if (this.metrics.activeCells / this.metrics.totalCells > 0.7) {
            recommendations.push("High cell density detected. Performance may degrade.");
        }
        
        return recommendations;
    }
}

export class SpatialOptimization {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.activeRegions = new Set();
        this.regionSize = 16; // Size of each optimization region
    }
    
    updateActiveRegions() {
        this.activeRegions.clear();
        
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                if (this.game.grid[i][j] > 0) {
                    // Mark region and surrounding regions as active
                    const regionX = Math.floor(j / this.regionSize);
                    const regionY = Math.floor(i / this.regionSize);
                    
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const rx = regionX + dx;
                            const ry = regionY + dy;
                            if (rx >= 0 && ry >= 0) {
                                this.activeRegions.add(`${rx},${ry}`);
                            }
                        }
                    }
                }
            }
        }
    }
    
    shouldProcessCell(x, y) {
        const regionX = Math.floor(x / this.regionSize);
        const regionY = Math.floor(y / this.regionSize);
        return this.activeRegions.has(`${regionX},${regionY}`);
    }
    
    getActiveRegionBounds() {
        if (this.activeRegions.size === 0) return null;
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const region of this.activeRegions) {
            const [x, y] = region.split(',').map(Number);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
        
        return {
            startX: Math.max(0, minX * this.regionSize),
            startY: Math.max(0, minY * this.regionSize),
            endX: Math.min(this.game.gridWidth, (maxX + 1) * this.regionSize),
            endY: Math.min(this.game.gridHeight, (maxY + 1) * this.regionSize)
        };
    }
}
