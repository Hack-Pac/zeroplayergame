// Main Game of Life class

import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, 
    DEFAULT_GRID_WIDTH, DEFAULT_GRID_HEIGHT, 
    FADE_IN_DURATION, DEFAULT_SPEED, 
    TEAM_COLORS, GAME_FORMULAS, FIELD_SIZE 
} from './constants.js';
import { Camera } from './camera.js';
import { TeamConfigManager } from './teamConfig.js';
import { GifRecorder } from './gifRecorder.js';
import { GifShowcaseManager } from './gifShowcase.js';
import { HelpManager } from './help.js';
import { PIXEL_FONT } from './pixelFont.js';
import { loadPattern } from './patterns.js';
import { AdvancedAI } from './advancedAI.js';
import { BattleAnalytics } from './analytics.js';
import { PerformanceMonitor, SpatialOptimization } from './performance.js';
import { SaveLoadManager, UndoRedoManager } from './saveLoad.js';
import { ErrorHandler, InputValidator, MemoryManager } from './errorHandling.js';
import { KeyboardShortcuts, TouchSupport } from './keyboard.js';

export class GameOfLife {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = CELL_SIZE;
        this.gridWidth = DEFAULT_GRID_WIDTH;
        this.gridHeight = DEFAULT_GRID_HEIGHT;
        
        // Fixed canvas size for viewport
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        // Initialize components
        this.camera = new Camera(this.canvas);
        this.teamConfigManager = new TeamConfigManager();
        this.gifShowcaseManager = new GifShowcaseManager();
        this.gifRecorder = new GifRecorder(this, this.gifShowcaseManager);
        this.helpManager = new HelpManager();
        this.advancedAI = new AdvancedAI(this);
        this.analytics = new BattleAnalytics(this);
        
        // New enhanced components - wrap in try-catch for debugging
        try {
            this.errorHandler = new ErrorHandler();
            this.performanceMonitor = new PerformanceMonitor(this);
            this.spatialOptimization = new SpatialOptimization(this);
            this.saveLoadManager = new SaveLoadManager(this);
            this.undoRedoManager = new UndoRedoManager(this);
            this.keyboardShortcuts = new KeyboardShortcuts(this);
            console.log('Enhanced components initialized successfully');
        } catch (error) {
            console.error('Error initializing enhanced components:', error);
            // Fallback initialization
            this.errorHandler = { logError: () => {}, logWarning: () => {} };
            this.performanceMonitor = { startUpdate: () => {}, endUpdate: () => {}, update: () => {}, startRender: () => {}, endRender: () => {} };
            this.spatialOptimization = { updateActiveRegions: () => {}, getActiveRegionBounds: () => null };
            this.saveLoadManager = { init: () => {} };
            this.undoRedoManager = { captureState: () => {} };
            this.keyboardShortcuts = { init: () => {} };
        }
        
        // Initialize WebWorker for performance
        this.initWebWorker();
        
        // Battle scenarios integration - make it optional
        try {
            this.initBattleScenarios();
            this.touchSupport = new TouchSupport(this);
            this.memoryManager = new MemoryManager(this);
            console.log('Optional components initialized');
        } catch (error) {
            console.error('Error initializing optional components:', error);
            // Create fallback objects
            this.touchSupport = { init: () => {} };
            this.memoryManager = { init: () => {} };
        }
        
        // Game state
        this.grid = this.createGrid();
        this.cellAges = this.createGrid();
        this.fadeInDuration = FADE_IN_DURATION;
        this.running = false;
        this.generation = 0;
        this.speed = DEFAULT_SPEED;
        this.lastDrawnCell = null;
        this.currentTeam = 0;
        this.teamColors = TEAM_COLORS;
        this.formulas = GAME_FORMULAS;
        this.teamMode = false;
        this.teamSizes = { 1: 0, 2: 0, 3: 0, 4: 0 }; // Track team sizes for AI
        
        // Mouse state
        this.mouse = {
            isDrawing: false
        };
        
        this.initializeEventListeners();
        this.loadPattern('random');
        this.draw();
        
        // Set initial cursor
        this.canvas.style.cursor = 'crosshair';
    }
    
    createGrid() {
        return Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
    }
    
    initializeEventListeners() {
        // Play/pause and control buttons
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('randomBtn').addEventListener('click', () => this.loadPattern('random'));
        
        // Pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPattern(e.target.dataset.pattern));
        });
        
        // Name drawing
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
        
        // Speed control
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
            this.camera.reset();
            this.draw();
            this.updateZoomInfo();
        });
        
        // Canvas mouse controls
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Initial state
        this.updateZoomInfo();
        document.getElementById('fieldWidth').value = this.gridWidth;
        document.getElementById('fieldHeight').value = this.gridHeight;
    }
    
    // Initialize WebWorker for performance
    initWebWorker() {
        // Temporarily disable WebWorker for debugging
        console.log('WebWorker disabled for debugging - using main thread');
        this.workerEnabled = false;
        
        /* 
        try {
            this.worker = new Worker('/js/gameWorker.js');
            this.workerEnabled = true;
            
            this.worker.onmessage = (e) => {
                this.handleWorkerMessage(e.data);
            };
            
            this.worker.onerror = (error) => {
                console.warn('WebWorker error, falling back to main thread:', error);
                this.workerEnabled = false;
            };
            
            console.log('WebWorker initialized successfully');
        } catch (error) {
            console.warn('WebWorker not available, using main thread:', error);
            this.workerEnabled = false;
        }
        */
    }
    
    // Handle WebWorker messages
    handleWorkerMessage(data) {
        switch (data.type) {
            case 'update-complete':
                this.handleWorkerUpdate(data.result);
                break;
            case 'batch-progress':
                this.handleBatchProgress(data.result);
                break;
            case 'batch-complete':
                this.handleBatchComplete(data.result);
                break;
            case 'battle-analysis-complete':
                this.analytics.updateBattleAnalysis(data.result);
                break;
            case 'heatmap-complete':
                this.performanceMonitor.updateHeatmap(data.result);
                break;
        }
    }
    
    // Initialize battle scenarios
    async initBattleScenarios() {
        try {
            const { BattleScenarios } = await import('./battleScenarios.js');
            this.battleScenarios = new BattleScenarios(this);
            
            // Make globally accessible for UI integration
            window.battleScenarios = this.battleScenarios;
            
            console.log('Battle scenarios initialized');
        } catch (error) {
            console.warn('Failed to load battle scenarios:', error);
            
            // Create a fallback empty scenarios object
            this.battleScenarios = {
                scenarios: {},
                loadScenario: () => console.warn('Battle scenarios not available')
            };
        }
    }
    
    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (event.button === 0 && !event.shiftKey) {
            // Left click without shift - drawing mode
            this.mouse.isDrawing = true;
            this.lastDrawnCell = null;
            this.drawCell(event);
        } else if (event.button === 0 && event.shiftKey || event.button === 2) {
            // Shift+left click or right click - panning mode
            this.mouse.isDrawing = false;
            this.camera.startPan(x, y);
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (this.camera.updatePan(x, y)) {
            this.draw();
        } else if (this.mouse.isDrawing) {
            this.drawCell(event);
        }
        
        // Update cursor
        if (event.shiftKey && !this.camera.mouse.isPanning) {
            this.canvas.style.cursor = 'grab';
        } else if (!this.camera.mouse.isPanning) {
            this.canvas.style.cursor = 'crosshair';
        }
    }
    
    handleMouseUp(event) {
        this.mouse.isDrawing = false;
        this.camera.endPan();
        this.lastDrawnCell = null;
        this.canvas.style.cursor = event.shiftKey ? 'grab' : 'crosshair';
    }
    
    handleWheel(event) {
        event.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        this.camera.handleZoom(event.deltaY, mouseX, mouseY);
        this.draw();
        this.updateZoomInfo();
    }
    
    drawCell(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates
        const worldCoords = this.camera.screenToWorld(x, y);
        
        const gridX = Math.floor(worldCoords.x / this.cellSize);
        const gridY = Math.floor(worldCoords.y / this.cellSize);
        
        // Check if we're in bounds and not redrawing the same cell
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            if (this.lastDrawnCell && this.lastDrawnCell.x === gridX && this.lastDrawnCell.y === gridY) {
                return;
            }
            
            this.grid[gridY][gridX] = this.currentTeam || 1;
            this.cellAges[gridY][gridX] = this.fadeInDuration;
            this.lastDrawnCell = { x: gridX, y: gridY };
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
                
                if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
                    const team = this.grid[ny][nx];
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
    
    update() {
        console.log('update() called');
        // Capture state for undo system
        this.undoRedoManager.captureState('simulation_step');
        
        // Performance monitoring
        this.performanceMonitor.startUpdate();
        
        // Use WebWorker for complex computations if available and beneficial
        if (this.workerEnabled && this.shouldUseWorker()) {
            console.log('Using WebWorker for update');
            this.updateWithWorker();
            return;
        }
        
        // Fallback to main thread computation
        console.log('Using main thread for update');
        this.updateMainThread();
    }
    
    shouldUseWorker() {
        // Use worker for large grids or when multiple teams are active
        const totalCells = this.gridWidth * this.gridHeight;
        const activeTeams = this.hasMultipleTeams() ? this.getActiveTeamCount() : 1;
        
        return totalCells > 5000 || (activeTeams > 2 && totalCells > 2000);
    }
    
    updateWithWorker() {
        // Send game state to worker for computation
        this.worker.postMessage({
            type: 'compute-update',
            data: {
                grid: this.grid,
                cellAges: this.cellAges,
                teamConfigs: this.teamConfigManager.getAllConfigs(),
                formulas: this.formulas,
                teamMode: this.teamMode,
                bounds: this.spatialOptimization.getActiveRegionBounds()
            }
        });
    }
    
    handleWorkerUpdate(result) {
        // Apply worker computation results
        this.grid = result.newGrid;
        this.cellAges = result.newCellAges;
        this.generation++;
        
        // Update UI and analytics
        this.updateInfo();
        this.draw();
        this.updateTeamStats();
        this.analytics.update();
        this.performanceMonitor.endUpdate();
        this.performanceMonitor.update();
    }
    
    handleBatchProgress(result) {
        // Update UI during batch processing
        this.grid = result.newGrid;
        this.cellAges = result.newCellAges;
        this.generation = result.generation;
        
        this.updateInfo();
        this.draw();
        
        // Show progress
        this.showBatchProgress(result.progress, result.processingTime);
    }
    
    handleBatchComplete(result) {
        // Batch processing complete
        this.hideBatchProgress();
        this.performanceMonitor.logBatchPerformance(result.totalTime, result.generationsProcessed);
    }
    
    updateMainThread() {
        try {
            console.log('updateMainThread() starting...');
            
            const newGrid = this.createGrid();
            const newCellAges = this.createGrid();
            
            // Update spatial optimization
            this.spatialOptimization.updateActiveRegions();
            const bounds = this.spatialOptimization.getActiveRegionBounds();
            
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
            
            // Apply game rules (optimized for active regions)
            const startY = bounds ? bounds.startY : 0;
            const endY = bounds ? bounds.endY : this.gridHeight;
            const startX = bounds ? bounds.startX : 0;
            const endX = bounds ? bounds.endX : this.gridWidth;
            
            console.log(`Processing cells from (${startX},${startY}) to (${endX},${endY})`);
            
            for (let i = startY; i < endY; i++) {
                for (let j = startX; j < endX; j++) {
                    const neighborData = this.countNeighbors(j, i);
                    const currentTeam = this.grid[i][j];
                    
                    if (currentTeam > 0) {
                        // Cell is alive - check survival rules
                        const teamConfig = this.teamConfigManager.getConfig(currentTeam);
                        const teamFormula = this.formulas[teamConfig.formula];
                        let survives = teamFormula.survive.includes(neighborData.count);
                        
                        // Herd rate affects survival
                        if (survives && teamConfig.herdRate > 0.5) {
                            const teamNeighborRatio = neighborData.teamCounts[currentTeam] / neighborData.count;
                            const herdBonus = (teamConfig.herdRate - 0.5) * 2;
                            survives = survives || (Math.random() < teamNeighborRatio * herdBonus * 0.3);
                        }
                        
                        if (survives) {
                            // Apply aggressiveness factor for team conversion
                            if (this.teamMode && neighborData.dominantTeam > 0 && 
                                neighborData.dominantTeam !== currentTeam) {
                                
                                const aggressiveness = this.teamConfigManager.getConfig(neighborData.dominantTeam).aggressiveness;
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
                    } else {
                        // Cell is dead - check birth rules
                        if (neighborData.dominantTeam > 0) {
                            const teamConfig = this.teamConfigManager.getConfig(neighborData.dominantTeam);
                            const teamFormula = this.formulas[teamConfig.formula];
                            let canBeBorn = teamFormula.birth.includes(neighborData.count);
                            
                            // Intelligence affects birth patterns
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
                                
                                // Fear factor affects birth
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
                // Update team sizes for AI system
                this.teamSizes = teamSizes;
                
                // Run advanced AI system
                try {
                    this.advancedAI.update(newGrid, teamSizes, teamPositions);
                } catch (error) {
                    console.warn('Advanced AI error:', error);
                }
                
                // Apply traditional intelligent behavior
                try {
                    this.applyIntelligentBehavior(newGrid, teamSizes, teamPositions);
                } catch (error) {
                    console.warn('Intelligent behavior error:', error);
                }
            }
            
            this.grid = newGrid;
            this.cellAges = newCellAges;
            this.generation++;
            this.updateInfo();
            if (this.teamMode) this.updateTeamStats();
            
            // Update analytics
            try {
                this.analytics.update();
            } catch (error) {
                console.warn('Analytics update error:', error);
            }
            
            // Update performance monitoring
            this.performanceMonitor.endUpdate();
            this.performanceMonitor.update();
            
            // Capture frame if recording GIF
            if (this.gifRecorder.isRecording()) {
                this.gifRecorder.captureFrame();
            }
            
            console.log('updateMainThread() completed successfully');
        } catch (error) {
            console.error('Error in updateMainThread:', error);
            // Still increment generation to avoid infinite loop
            this.generation++;
            this.updateInfo();
        }
    }
    
    applyIntelligentBehavior(grid, teamSizes, teamPositions) {
        for (let team = 1; team <= 4; team++) {
            const config = this.teamConfigManager.getConfig(team);
            if (config.intelligence === 0) continue;
            
            const edgeCells = this.findEdgeCells(team);
            
            for (const cell of edgeCells) {
                const { x, y } = cell;
                
                // Use advanced AI for strategic direction, fallback to basic AI
                let direction = this.advancedAI.getStrategicDirection(team, x, y, teamSizes, teamPositions);
                
                if (!direction) {
                    direction = this.calculateIntelligentDirection(
                        team, x, y, teamSizes, teamPositions, config
                    );
                }
                
                if (direction) {
                    const newX = x + direction.dx;
                    const newY = y + direction.dy;
                    
                    if (newX >= 0 && newX < this.gridWidth && 
                        newY >= 0 && newY < this.gridHeight && 
                        grid[newY][newX] === 0) {
                        
                        const herdChance = this.calculateHerdChance(team, newX, newY, config.herdRate);
                        
                        // Increase chance for strategic moves
                        const strategicBonus = direction.strategic ? 0.3 : 0;
                        
                        if (Math.random() < herdChance + strategicBonus) {
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
        
        for (let otherTeam = 1; otherTeam <= 4; otherTeam++) {
            if (otherTeam === team) continue;
            if (teamPositions[otherTeam].length === 0) continue;
            
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
    
    calculateHerdChance(team, x, y, herdRate) {
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
        
        const minNeighbors = Math.floor(herdRate * 3);
        return teamNeighbors >= minNeighbors ? 1.0 : 0.3 + (0.7 * teamNeighbors / minNeighbors);
    }
    
    draw() {
        // Performance monitoring
        this.performanceMonitor.startRender();
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Get visible bounds
        const bounds = this.camera.getVisibleBounds(this.cellSize, this.gridWidth, this.gridHeight);
        
        // Draw grid lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5 / this.camera.zoom;
        
        for (let i = bounds.startY; i <= bounds.endY; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(bounds.startX * this.cellSize, i * this.cellSize);
            this.ctx.lineTo(bounds.endX * this.cellSize, i * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let j = bounds.startX; j <= bounds.endX; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.cellSize, bounds.startY * this.cellSize);
            this.ctx.lineTo(j * this.cellSize, bounds.endY * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw cells
        for (let i = bounds.startY; i < bounds.endY; i++) {
            for (let j = bounds.startX; j < bounds.endX; j++) {
                const team = this.grid[i][j];
                if (team > 0) {
                    const opacity = this.cellAges[i][j] / this.fadeInDuration;
                    const color = this.teamColors[team] || this.teamColors[0];
                    
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
        
        // Draw resources (advanced AI feature)
        if (this.teamMode) {
            this.advancedAI.drawResources(this.ctx, this.camera, this.cellSize);
        }
        
        // Restore context state
        this.ctx.restore();
        
        // End performance monitoring
        this.performanceMonitor.endRender();
    }
    
    loadPattern(pattern) {
        this.clear();
        
        if (pattern === 'random') {
            for (let i = 0; i < this.gridHeight; i++) {
                for (let j = 0; j < this.gridWidth; j++) {
                    this.grid[i][j] = Math.random() < 0.2 ? (this.currentTeam || 1) : 0;
                }
            }
        } else {
            const centerX = Math.floor(this.gridHeight / 2);
            const centerY = Math.floor(this.gridWidth / 2);
            loadPattern(this.grid, pattern, centerX, centerY, this.currentTeam || 1);
        }
        
        this.teamMode = this.hasMultipleTeams();
        document.getElementById('teamStats').style.display = this.teamMode ? 'flex' : 'none';
        this.draw();
    }
    
    clear() {
        this.grid = this.createGrid();
        this.cellAges = this.createGrid();
        this.generation = 0;
        this.updateInfo();
        this.teamMode = false;
        document.getElementById('teamStats').style.display = 'none';
        
        // Reset analytics
        this.analytics.reset();
        
        this.draw();
    }
    
    togglePlay() {
        console.log('togglePlay called, current running state:', this.running);
        this.running = !this.running;
        document.getElementById('playPauseBtn').textContent = this.running ? 'Pause' : 'Play';
        this.updateInfo();
        
        console.log('New running state:', this.running);
        if (this.running) {
            console.log('Starting game loop...');
            this.run();
        }
    }
    
    run() {
        console.log('run() called, running state:', this.running);
        if (!this.running) return;
        
        console.log('Calling update() and draw()...');
        this.update();
        this.draw();
        
        setTimeout(() => this.run(), 1000 / this.speed);
    }
    
    updateInfo() {
        document.getElementById('generation').textContent = `Generation: ${this.generation}`;
        document.getElementById('status').textContent = this.running ? 'Running' : 'Paused';
    }
    
    updateZoomInfo() {
        document.getElementById('zoomInfo').textContent = `Zoom: ${this.camera.getZoomPercentage()}%`;
    }
    
    resizeField(newWidth, newHeight) {
        if (newWidth < FIELD_SIZE.min || newWidth > FIELD_SIZE.max || 
            newHeight < FIELD_SIZE.min || newHeight > FIELD_SIZE.max) {
            alert(`Field size must be between ${FIELD_SIZE.min} and ${FIELD_SIZE.max}`);
            return;
        }
        
        const oldGrid = this.grid;
        const oldAges = this.cellAges;
        this.gridWidth = newWidth;
        this.gridHeight = newHeight;
        this.grid = this.createGrid();
        this.cellAges = this.createGrid();
        
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
            const statElement = document.querySelector(`#stat${team} span`);
            const teamInfo = this.advancedAI.getTeamInfo(team);
            
            // Enhanced display with AI info
            let displayText = `${counts[team]}`;
            
            if (counts[team] > 0) {
                displayText += ` | ${teamInfo.strategy.charAt(0).toUpperCase()}`;
                
                if (teamInfo.threat) {
                    displayText += ` | ⚠️${teamInfo.threat}`;
                }
                
                if (teamInfo.alliances.length > 0) {
                    displayText += ` | 🤝${teamInfo.alliances.join(',')}`;
                }
                
                if (teamInfo.resources > 0) {
                    displayText += ` | 💎${teamInfo.resources}`;
                }
            }
            
            statElement.textContent = displayText;
        }
        
        // Show AI legend when team mode is active
        document.getElementById('aiLegend').style.display = this.teamMode ? 'block' : 'none';
    }
    
    drawName() {
        const name = document.getElementById('nameInput').value.trim().toUpperCase();
        if (!name) return;
        
        this.clear();
        
        let startX = Math.floor(this.gridWidth / 2 - (name.length * 6) / 2);
        let startY = Math.floor(this.gridHeight / 2 - 4);
        
        for (let i = 0; i < name.length; i++) {
            const letter = name[i];
            const pixels = PIXEL_FONT[letter];
            
            if (pixels) {
                for (let row = 0; row < pixels.length; row++) {
                    for (let col = 0; col < pixels[row].length; col++) {
                        if (pixels[row][col] === 1) {
                            const x = startX + i * 6 + col;
                            const y = startY + row;
                            
                            if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                                this.grid[y][x] = this.currentTeam || 1;
                                this.cellAges[y][x] = 0;
                            }
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