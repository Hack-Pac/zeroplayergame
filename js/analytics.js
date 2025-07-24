// Battle Analytics Dashboard

import { TEAM_COLORS } from './constants.js';

export class BattleAnalytics {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.isEnabled = false;
        this.canvas = null;
        this.ctx = null;
        
        this.populationHistory = {
            1: [], 2: [], 3: [], 4: []
        };
        this.battleEvents = [];
        this.territoryData = [];
        this.formationDetections = [];
        this.resourceCompetition = [];
        
        // config
        this.maxHistoryLength = 200; // Keep last 200 generations
        this.heatmapAlpha = 0.3;
        this.chartHeight = 150;
        this.chartWidth = 300;
        
        // battle tracking
        this.battleStats = {
            1: { kills: 0, deaths: 0, territory: 0, efficiency: 0 },
            2: { kills: 0, deaths: 0, territory: 0, efficiency: 0 },
            3: { kills: 0, deaths: 0, territory: 0, efficiency: 0 },
            4: { kills: 0, deaths: 0, territory: 0, efficiency: 0 }
        };
        
        this.initializeUI();
    }
    
    initializeUI() {
        // modular ui panel
        const analyticsPanel = document.createElement('div');
        analyticsPanel.id = 'analyticsPanel';
        analyticsPanel.className = 'analytics-panel collapsed';
        analyticsPanel.innerHTML = `
            <div class="analytics-header">
                <h3>📊 Battle Analytics</h3>
                <button id="toggleAnalytics" class="analytics-toggle">▼</button>
            </div>
            <div class="analytics-content">
                <div class="analytics-tabs">
                    <button class="analytics-tab active" data-tab="population">Population</button>
                    <button class="analytics-tab" data-tab="heatmap">Territory</button>
                    <button class="analytics-tab" data-tab="efficiency">Efficiency</button>
                    <button class="analytics-tab" data-tab="formations">Formations</button>
                    <button class="analytics-tab" data-tab="resources">Resources</button>
                </div>
                
                <div class="analytics-sections">
                    <div class="analytics-section active" id="population-section">
                        <canvas id="populationChart" width="300" height="150"></canvas>
                        <div class="population-stats">
                            <div class="stat-row">
                                <span class="team-1">Red: <span id="pop-1">0</span></span>
                                <span class="team-2">Blue: <span id="pop-2">0</span></span>
                            </div>
                            <div class="stat-row">
                                <span class="team-3">Green: <span id="pop-3">0</span></span>
                                <span class="team-4">Yellow: <span id="pop-4">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-section" id="heatmap-section">
                        <div class="heatmap-controls">
                            <label>
                                <input type="checkbox" id="showHeatmap" checked>
                                Show Territory Heatmap
                            </label>
                            <label>
                                Intensity: <input type="range" id="heatmapIntensity" min="0.1" max="1" step="0.1" value="0.3">
                            </label>
                        </div>
                        <div class="territory-stats">
                            <h4>Territory Control</h4>
                            <div id="territoryStats"></div>
                        </div>
                    </div>
                    
                    <div class="analytics-section" id="efficiency-section">
                        <canvas id="efficiencyChart" width="300" height="150"></canvas>
                        <div class="efficiency-stats">
                            <h4>Battle Efficiency (K/D Ratio)</h4>
                            <div id="efficiencyStats"></div>
                        </div>
                    </div>
                    
                    <div class="analytics-section" id="formations-section">
                        <div class="formation-detector">
                            <h4>Formation Patterns Detected</h4>
                            <div id="formationList"></div>
                        </div>
                    </div>
                    
                    <div class="analytics-section" id="resources-section">
                        <div class="resource-competition">
                            <h4>Resource Competition</h4>
                            <canvas id="resourceChart" width="300" height="100"></canvas>
                            <div id="resourceStats"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const controlsElement = document.querySelector('.controls');
        controlsElement.parentNode.insertBefore(analyticsPanel, controlsElement);
        
        this.setupEventListeners();
        
        this.populationCanvas = document.getElementById('populationChart');
        this.populationCtx = this.populationCanvas.getContext('2d');
        this.efficiencyCanvas = document.getElementById('efficiencyChart');
        this.efficiencyCtx = this.efficiencyCanvas.getContext('2d');
        this.resourceCanvas = document.getElementById('resourceChart');
        this.resourceCtx = this.resourceCanvas.getContext('2d');
    }
    
    setupEventListeners() {
        // listeners for certain toggles
        document.getElementById('toggleAnalytics').addEventListener('click', () => {
            const panel = document.getElementById('analyticsPanel');
            const button = document.getElementById('toggleAnalytics');
            
            panel.classList.toggle('collapsed');
            button.textContent = panel.classList.contains('collapsed') ? '▼' : '▲';
            this.isEnabled = !panel.classList.contains('collapsed');
        });
        
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        document.getElementById('showHeatmap').addEventListener('change', (e) => {
            this.showHeatmap = e.target.checked;
        });
        
        document.getElementById('heatmapIntensity').addEventListener('input', (e) => {
            this.heatmapAlpha = parseFloat(e.target.value);
        });
        
        this.showHeatmap = true;
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.analytics-section').forEach(section => {
            section.classList.toggle('active', section.id === `${tabName}-section`);
        });
    }
    
    update() {
        if (!this.isEnabled) return;
        
        this.collectPopulationData();
        this.analyzeTerritory();
        this.trackBattleEvents();
        this.detectFormations();
        this.updateResourceStats();
        this.render();
    }
    
    collectPopulationData() {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                const team = this.game.grid[i][j];
                if (team > 0) {
                    counts[team]++;
                }
            }
        }
        
        // popul.
        for (let team = 1; team <= 4; team++) {
            this.populationHistory[team].push(counts[team]);
            if (this.populationHistory[team].length > this.maxHistoryLength) {
                this.populationHistory[team].shift();
            }
        }
        
        // UI updated sequentially
        for (let team = 1; team <= 4; team++) {
            const element = document.getElementById(`pop-${team}`);
            if (element) element.textContent = counts[team];
        }
    }
    
    analyzeTerritory() {
        const territoryControl = { 1: 0, 2: 0, 3: 0, 4: 0 };
        const cellCount = this.game.gridWidth * this.game.gridHeight;
        
        // territory calculation
        // dependent on population history
        for (let team = 1; team <= 4; team++) {
            const population = this.populationHistory[team][this.populationHistory[team].length - 1] || 0;
            territoryControl[team] = (population / cellCount) * 100;
            this.battleStats[team].territory = territoryControl[team];
        }
        
        const territoryStatsElement = document.getElementById('territoryStats');
        if (territoryStatsElement) {
            let html = '';
            for (let team = 1; team <= 4; team++) {
                const color = TEAM_COLORS[team];
                const percentage = territoryControl[team].toFixed(1);
                html += `
                    <div class="territory-stat" style="color: ${color}">
                        Team ${team}: ${percentage}%
                        <div class="territory-bar">
                            <div class="territory-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                        </div>
                    </div>
                `;
            }
            territoryStatsElement.innerHTML = html;
        }
    }
    
    trackBattleEvents() {
        if (!this.previousGrid) {
            this.previousGrid = this.copyGrid();
            return;
        }
        
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                const currentTeam = this.game.grid[i][j];
                const previousTeam = this.previousGrid[i][j];
                
                if (previousTeam > 0 && currentTeam !== previousTeam) {
                    if (currentTeam === 0) {
                        // Cell died
                        this.battleStats[previousTeam].deaths++;
                    } else {
                        // Cell was converted
                        this.battleStats[previousTeam].deaths++;
                        this.battleStats[currentTeam].kills++;
                        
                        this.battleEvents.push({
                            generation: this.game.generation,
                            x: j, y: i,
                            attacker: currentTeam,
                            defender: previousTeam,
                            type: 'conversion'
                        });
                    }
                }
            }
        }
        
        for (let team = 1; team <= 4; team++) {
            const stats = this.battleStats[team];
            stats.efficiency = stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
        }
        
        this.previousGrid = this.copyGrid();
        
        this.battleEvents = this.battleEvents.filter(event => 
            this.game.generation - event.generation < 50
        );
    }
    
    detectFormations() {
        const formations = this.findKnownFormations();
        
        const formationListElement = document.getElementById('formationList');
        if (formationListElement && formations.length > 0) {
            let html = '';
            formations.forEach(formation => {
                const color = TEAM_COLORS[formation.team];
                html += `
                    <div class="formation-item" style="border-left: 3px solid ${color}">
                        <strong>${formation.name}</strong> - Team ${formation.team}
                        <br><small>Position: (${formation.x}, ${formation.y})</small>
                    </div>
                `;
            });
            formationListElement.innerHTML = html;
        } else if (formationListElement) {
            formationListElement.innerHTML = '<div class="no-formations">No formations detected</div>';
        }
    }
    
    findKnownFormations() {
        const formations = [];
        const patterns = {
            'Glider': [
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 1]
            ],
            'Block': [
                [1, 1],
                [1, 1]
            ],
            'Blinker': [
                [1, 1, 1]
            ],
            'Toad': [
                [0, 1, 1, 1],
                [1, 1, 1, 0]
            ]
        };
        
        // Search for each pattern
        Object.entries(patterns).forEach(([name, pattern]) => {
            const found = this.searchPattern(pattern);
            formations.push(...found.map(f => ({ ...f, name })));
        });
        
        return formations;
    }
    
    searchPattern(pattern) {
        const found = [];
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;
        
        for (let team = 1; team <= 4; team++) {
            for (let y = 0; y <= this.game.gridHeight - patternHeight; y++) {
                for (let x = 0; x <= this.game.gridWidth - patternWidth; x++) {
                    if (this.matchesPattern(pattern, x, y, team)) {
                        found.push({ x, y, team });
                    }
                }
            }
        }
        
        return found;
    }
    
    matchesPattern(pattern, startX, startY, team) {
        for (let py = 0; py < pattern.length; py++) {
            for (let px = 0; px < pattern[py].length; px++) {
                const expectedCell = pattern[py][px];
                const actualCell = this.game.grid[startY + py][startX + px];
                
                if (expectedCell === 1 && actualCell !== team) return false;
                if (expectedCell === 0 && actualCell !== 0) return false;
            }
        }
        return true;
    }
    
    updateResourceStats() {
        if (!this.game.advancedAI || !this.game.advancedAI.resources) return;
        
        const resourceStats = { captured: { 1: 0, 2: 0, 3: 0, 4: 0 }, total: 0 };
        
        this.game.advancedAI.resources.forEach(resource => {
            resourceStats.total++;
            if (resource.controlledBy) {
                resourceStats.captured[resource.controlledBy]++;
            }
        });
        
        const resourceStatsElement = document.getElementById('resourceStats');
        if (resourceStatsElement) {
            let html = `<div>Total Resources: ${resourceStats.total}</div>`;
            for (let team = 1; team <= 4; team++) {
                const color = TEAM_COLORS[team];
                html += `
                    <div style="color: ${color}">
                        Team ${team}: ${resourceStats.captured[team]} resources
                    </div>
                `;
            }
            resourceStatsElement.innerHTML = html;
        }
    }
    
    copyGrid() {
        const copy = [];
        for (let i = 0; i < this.game.gridHeight; i++) {
            copy[i] = [...this.game.grid[i]];
        }
        return copy;
    }
    
    render() {
        this.renderPopulationChart();
        this.renderHeatmapOverlay();
        this.renderEfficiencyChart();
        this.renderResourceChart();
        this.updateEfficiencyStats();
    }
    
    renderPopulationChart() {
        const ctx = this.populationCtx;
        const canvas = this.populationCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = (canvas.width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = (canvas.height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Find max population for scaling
        let maxPop = 1;
        for (let team = 1; team <= 4; team++) {
            const teamMax = Math.max(...this.populationHistory[team]);
            if (teamMax > maxPop) maxPop = teamMax;
        }
        
        // Draw population lines
        for (let team = 1; team <= 4; team++) {
            const history = this.populationHistory[team];
            if (history.length < 2) continue;
            
            ctx.strokeStyle = TEAM_COLORS[team];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < history.length; i++) {
                const x = (canvas.width / (this.maxHistoryLength - 1)) * i;
                const y = canvas.height - (history[i] / maxPop) * canvas.height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
    }
    
    // heatmap rendering modular display
    renderHeatmapOverlay() {
        if (!this.showHeatmap || !this.game.canvas) return;
        
        const gameCtx = this.game.ctx;
        const cellSize = this.game.cellSize;
        
        const heatmapCanvas = document.createElement('canvas');
        heatmapCanvas.width = this.game.canvas.width;
        heatmapCanvas.height = this.game.canvas.height;
        const heatmapCtx = heatmapCanvas.getContext('2d');
        
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                const team = this.game.grid[i][j];
                if (team === 0) continue;
                
                const strength = this.calculateTerritoryStrength(j, i, team);
                const color = TEAM_COLORS[team];
                
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                
                heatmapCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${strength * this.heatmapAlpha})`;
                heatmapCtx.fillRect(
                    j * cellSize,
                    i * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }
        
        gameCtx.globalCompositeOperation = 'overlay';
        gameCtx.drawImage(heatmapCanvas, 0, 0);
        gameCtx.globalCompositeOperation = 'source-over';
    }
    
    calculateTerritoryStrength(x, y, team) {
        let teamNeighbors = 0;
        let totalNeighbors = 0;
        
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.game.gridWidth && ny >= 0 && ny < this.game.gridHeight) {
                    const neighborTeam = this.game.grid[ny][nx];
                    if (neighborTeam > 0) {
                        totalNeighbors++;
                        if (neighborTeam === team) {
                            teamNeighbors++;
                        }
                    }
                }
            }
        }
        
        return totalNeighbors > 0 ? (teamNeighbors / totalNeighbors) : 0;
    }
    
    renderEfficiencyChart() {
        const ctx = this.efficiencyCtx;
        const canvas = this.efficiencyCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw efficiency bars
        const barWidth = canvas.width / 4;
        const maxEfficiency = Math.max(...Object.values(this.battleStats).map(s => s.efficiency), 1);
        
        for (let team = 1; team <= 4; team++) {
            const efficiency = this.battleStats[team].efficiency;
            const barHeight = (efficiency / maxEfficiency) * canvas.height * 0.8;
            const x = (team - 1) * barWidth + barWidth * 0.1;
            const y = canvas.height - barHeight;
            
            ctx.fillStyle = TEAM_COLORS[team];
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            // Draw efficiency value
            ctx.fillStyle = '#fff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                efficiency.toFixed(1),
                x + barWidth * 0.4,
                y - 5
            );
        }
    }
    
    renderResourceChart() {
        if (!this.game.advancedAI || !this.resourceCtx) return;
        
        const ctx = this.resourceCtx;
        const canvas = this.resourceCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // visualize resource competition over time
        // TODO: expand this and make it more fleshed out
        ctx.strokeStyle = '#66ff66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    
    updateEfficiencyStats() {
        const efficiencyStatsElement = document.getElementById('efficiencyStats');
        if (!efficiencyStatsElement) return;
        
        let html = '';
        for (let team = 1; team <= 4; team++) {
            const stats = this.battleStats[team];
            const color = TEAM_COLORS[team];
            html += `
                <div class="efficiency-stat" style="color: ${color}">
                    Team ${team}: ${stats.efficiency.toFixed(2)} 
                    (${stats.kills}K/${stats.deaths}D)
                </div>
            `;
        }
        efficiencyStatsElement.innerHTML = html;
    }
    
    reset() {
        this.populationHistory = { 1: [], 2: [], 3: [], 4: [] };
        this.battleEvents = [];
        this.territoryData = [];
        this.formationDetections = [];
        this.resourceCompetition = [];
        this.battleStats = {
            1: { kills: 0, deaths: 0, territory: 0, efficiency: 0 },
            2: { kills: 0, deaths: 0, territory: 0, efficiency: 0 },
            3: { kills: 0, deaths: 0, territory: 0, efficiency: 0 },
            4: { kills: 0, deaths: 0, territory: 0, efficiency: 0 }
        };
        this.previousGrid = null;
    }
    
    exportData() {
        return {
            populationHistory: this.populationHistory,
            battleEvents: this.battleEvents,
            battleStats: this.battleStats,
            generation: this.game.generation
        };
    }
}
