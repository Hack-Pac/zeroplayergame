// Save/Load and State Management System

export class SaveLoadManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.storageKey = 'gameOfLifeSaves';
        this.scenariosKey = 'gameOfLifeScenarios';
        this.maxSaves = 50; // Increased limit
        this.currentSave = null;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = 30000; // 30 seconds
        this.compressionEnabled = true;
        this.currentFilter = '';
        this.currentSort = 'newest';
        
        this.initializeUI();
        this.loadSavesList();
        this.setupAutoSave();
        this.setupAdvancedFeatures();
    }
    
    initializeUI() {
        // Add save/load buttons to controls
        const controls = document.querySelector('.controls');
        const saveLoadSection = document.createElement('div');
        saveLoadSection.className = 'save-load-section';
        saveLoadSection.innerHTML = `
            <button id="saveBtn" title="Save current game state">💾 Save</button>
            <button id="loadBtn" title="Load saved game state">📂 Load</button>
            <button id="exportBtn" title="Export as JSON">📤 Export</button>
            <button id="importBtn" title="Import from JSON">📥 Import</button>
            <input type="file" id="importFile" accept=".json" style="display: none;">
        `;
        controls.appendChild(saveLoadSection);
        
        // Create save/load modal
        this.createSaveLoadModal();
        
        // Event listeners
        document.getElementById('saveBtn').addEventListener('click', () => this.showSaveModal());
        document.getElementById('loadBtn').addEventListener('click', () => this.showLoadModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToFile());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importFromFile(e));
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
    }
    
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.quickSave();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.showLoadModal();
                        break;
                }
            }
        });
    }
    
    setupAutoSave() {
        if (this.autoSaveEnabled) {
            setInterval(() => {
                if (this.game.generation > 0 && this.game.generation % 100 === 0) {
                    this.autoSave();
                }
            }, this.autoSaveInterval);
        }
    }
    
    setupAdvancedFeatures() {
        // Add settings for auto-save and compression
        const controls = document.querySelector('.controls');
        const advancedSection = document.createElement('div');
        advancedSection.className = 'advanced-save-section';
        advancedSection.innerHTML = `
            <details>
                <summary>💾 Save Settings</summary>
                <label>
                    <input type="checkbox" id="autoSaveEnabled" ${this.autoSaveEnabled ? 'checked' : ''}>
                    Auto-save every 100 generations
                </label>
                <label>
                    <input type="checkbox" id="compressionEnabled" ${this.compressionEnabled ? 'checked' : ''}>
                    Compress saves (smaller files)
                </label>
                <button id="quickSaveBtn" title="Quick save (Ctrl+S)">⚡ Quick Save</button>
            </details>
        `;
        controls.appendChild(advancedSection);
        
        document.getElementById('autoSaveEnabled').addEventListener('change', (e) => {
            this.autoSaveEnabled = e.target.checked;
        });
        
        document.getElementById('compressionEnabled').addEventListener('change', (e) => {
            this.compressionEnabled = e.target.checked;
        });
        
        document.getElementById('quickSaveBtn').addEventListener('click', () => this.quickSave());
    }
    
    createSaveLoadModal() {
        const modal = document.createElement('div');
        modal.id = 'saveLoadModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content enhanced-modal">
                <span class="close" id="saveLoadClose">&times;</span>
                <h2 id="saveLoadTitle">Save Game</h2>
                
                <!-- Save Section -->
                <div id="saveSection">
                    <div class="save-input">
                        <label for="saveName">Save Name:</label>
                        <input type="text" id="saveName" placeholder="Enter save name...">
                        <label for="saveDescription">Description (optional):</label>
                        <textarea id="saveDescription" placeholder="Describe this save..." rows="2"></textarea>
                        <div class="save-options">
                            <label>
                                <input type="checkbox" id="saveScreenshot" checked>
                                Include screenshot
                            </label>
                            <label>
                                <input type="checkbox" id="saveAsScenario">
                                Save as battle scenario
                            </label>
                        </div>
                        <button id="confirmSave" class="primary-btn">💾 Save</button>
                    </div>
                </div>
                
                <!-- Load Section -->
                <div id="loadSection" style="display: none;">
                    <div class="saves-filter">
                        <input type="text" id="savesSearch" placeholder="🔍 Search saves...">
                        <select id="savesSort">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name A-Z</option>
                            <option value="generation">Generation</option>
                        </select>
                    </div>
                    <div class="saves-list" id="savesList">
                        <!-- Saves will be populated here -->
                    </div>
                    <div class="saves-actions">
                        <button id="clearAllSaves" class="danger-btn">🗑️ Clear All</button>
                        <button id="exportAllSaves" class="secondary-btn">📦 Export All</button>
                        <button id="importSavesBtn" class="secondary-btn">📥 Import</button>
                        <input type="file" id="importSavesFile" accept=".json" style="display: none;" multiple>
                    </div>
                </div>
                
                <!-- Battle Scenarios Tab -->
                <div class="modal-tabs">
                    <button class="tab-btn active" data-tab="saves">💾 Saves</button>
                    <button class="tab-btn" data-tab="scenarios">⚔️ Scenarios</button>
                    <button class="tab-btn" data-tab="stats">📊 Stats</button>
                </div>
                
                <div id="scenariosTab" class="tab-content" style="display: none;">
                    <div class="scenarios-preview" id="scenariosPreview">
                        <!-- Battle scenarios will be loaded here -->
                    </div>
                </div>
                
                <div id="statsTab" class="tab-content" style="display: none;">
                    <div class="save-load-stats detailed">
                        <div class="stat-group">
                            <h4>Current Game</h4>
                            <div>Generation: <span id="currentGen">0</span></div>
                            <div>Active Cells: <span id="activeCellsCount">0</span></div>
                            <div>Teams Active: <span id="activeTeamsCount">0</span></div>
                            <div>Field Size: <span id="fieldSizeInfo">0×0</span></div>
                        </div>
                        <div class="stat-group">
                            <h4>Save Statistics</h4>
                            <div>Total Saves: <span id="totalSaves">0</span></div>
                            <div>Storage Used: <span id="storageUsed">0 KB</span></div>
                            <div>Last Save: <span id="lastSaveTime">Never</span></div>
                        </div>
                        <div class="stat-group">
                            <h4>Team Analysis</h4>
                            <div id="teamAnalysis">
                                <!-- Team stats will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        document.getElementById('saveLoadClose').addEventListener('click', () => this.hideSaveLoadModal());
        document.getElementById('confirmSave').addEventListener('click', () => this.saveGame());
        document.getElementById('savesSearch').addEventListener('input', (e) => this.filterSaves(e.target.value));
        document.getElementById('savesSort').addEventListener('change', (e) => this.sortSaves(e.target.value));
        document.getElementById('clearAllSaves').addEventListener('click', () => this.clearAllSaves());
        document.getElementById('exportAllSaves').addEventListener('click', () => this.exportAllSaves());
        document.getElementById('importSavesBtn').addEventListener('click', () => document.getElementById('importSavesFile').click());
        document.getElementById('importSavesFile').addEventListener('change', (e) => this.importSaves(e));
        
        // Tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.hideSaveLoadModal();
        });
    }
    
    showSaveModal() {
        const modal = document.getElementById('saveLoadModal');
        document.getElementById('saveLoadTitle').textContent = 'Save Game';
        document.getElementById('saveSection').style.display = 'block';
        document.getElementById('loadSection').style.display = 'none';
        
        // Auto-generate save name
        const now = new Date();
        const defaultName = `Game_${now.getMonth()+1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}`;
        document.getElementById('saveName').value = defaultName;
        
        this.updateStats();
        modal.style.display = 'block';
    }
    
    showLoadModal() {
        const modal = document.getElementById('saveLoadModal');
        document.getElementById('saveLoadTitle').textContent = 'Load Game';
        document.getElementById('saveSection').style.display = 'none';
        document.getElementById('loadSection').style.display = 'block';
        
        this.updateSavesList();
        this.updateStats();
        modal.style.display = 'block';
    }
    
    hideSaveLoadModal() {
        document.getElementById('saveLoadModal').style.display = 'none';
    }
    
    updateStats() {
        let activeCells = 0;
        let activeTeams = new Set();
        
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                const team = this.game.grid[i][j];
                if (team > 0) {
                    activeCells++;
                    activeTeams.add(team);
                }
            }
        }
        
        document.getElementById('currentGen').textContent = this.game.generation;
        document.getElementById('activeCellsCount').textContent = activeCells;
        document.getElementById('activeTeamsCount').textContent = activeTeams.size;
    }
    
    saveGame() {
        const saveName = document.getElementById('saveName').value.trim();
        if (!saveName) {
            alert('Please enter a save name');
            return;
        }
        
        const saveData = this.createSaveData(saveName);
        this.addSaveToStorage(saveData);
        this.hideSaveLoadModal();
        
        // Show success message
        this.showMessage(`Game saved as "${saveName}"`);
    }
    
    createSaveData(name) {
        return {
            id: Date.now().toString(),
            name: name,
            timestamp: new Date().toISOString(),
            generation: this.game.generation,
            grid: this.game.grid.map(row => [...row]),
            cellAges: this.game.cellAges.map(row => [...row]),
            gridWidth: this.game.gridWidth,
            gridHeight: this.game.gridHeight,
            currentTeam: this.game.currentTeam,
            teamMode: this.game.teamMode,
            running: this.game.running,
            speed: this.game.speed,
            teamConfigs: this.game.teamConfigManager.getAllConfigs(),
            camera: {
                x: this.game.camera.x,
                y: this.game.camera.y,
                zoom: this.game.camera.zoom
            }
        };
    }
    
    loadGame(saveData) {
        try {
            // Restore grid
            this.game.gridWidth = saveData.gridWidth;
            this.game.gridHeight = saveData.gridHeight;
            this.game.grid = saveData.grid.map(row => [...row]);
            this.game.cellAges = saveData.cellAges.map(row => [...row]);
            
            // Restore game state
            this.game.generation = saveData.generation;
            this.game.currentTeam = saveData.currentTeam;
            this.game.teamMode = saveData.teamMode;
            this.game.speed = saveData.speed;
            
            // Restore UI state
            document.getElementById('speedSlider').value = saveData.speed;
            document.getElementById('speedValue').textContent = saveData.speed;
            document.getElementById('fieldWidth').value = saveData.gridWidth;
            document.getElementById('fieldHeight').value = saveData.gridHeight;
            
            // Select current team
            const teamRadio = document.querySelector(`input[name="team"][value="${saveData.currentTeam}"]`);
            if (teamRadio) teamRadio.checked = true;
            
            // Restore camera position
            if (saveData.camera) {
                this.game.camera.x = saveData.camera.x;
                this.game.camera.y = saveData.camera.y;
                this.game.camera.zoom = saveData.camera.zoom;
            }
            
            // Restore team configurations
            if (saveData.teamConfigs) {
                this.game.teamConfigManager.configs = saveData.teamConfigs;
            }
            
            // Update display
            this.game.updateInfo();
            this.game.updateZoomInfo();
            this.game.draw();
            
            // Show team stats if needed
            document.getElementById('teamStats').style.display = saveData.teamMode ? 'flex' : 'none';
            
            this.hideSaveLoadModal();
            this.showMessage(`Game "${saveData.name}" loaded successfully`);
            
        } catch (error) {
            console.error('Load error:', error);
            alert('Failed to load game. Save file may be corrupted.');
        }
    }
    
    addSaveToStorage(saveData) {
        let saves = this.getSavesFromStorage();
        saves.unshift(saveData);
        
        // Limit number of saves
        if (saves.length > this.maxSaves) {
            saves = saves.slice(0, this.maxSaves);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(saves));
    }
    
    getSavesFromStorage() {
        try {
            const saves = localStorage.getItem(this.storageKey);
            return saves ? JSON.parse(saves) : [];
        } catch (error) {
            console.error('Error loading saves:', error);
            return [];
        }
    }
    
    updateSavesList() {
        const saves = this.getSavesFromStorage();
        const savesList = document.getElementById('savesList');
        
        if (saves.length === 0) {
            savesList.innerHTML = '<div class="no-saves">No saved games found</div>';
            return;
        }
        
        savesList.innerHTML = saves.map(save => `
            <div class="save-item" data-save-id="${save.id}">
                <div class="save-info">
                    <div class="save-name">${save.name}</div>
                    <div class="save-details">
                        ${new Date(save.timestamp).toLocaleString()} | 
                        Gen: ${save.generation} | 
                        Size: ${save.gridWidth}x${save.gridHeight}
                    </div>
                </div>
                <div class="save-actions">
                    <button class="load-save-btn" onclick="window.saveLoadManager.loadSaveById('${save.id}')">Load</button>
                    <button class="delete-save-btn" onclick="window.saveLoadManager.deleteSaveById('${save.id}')">Delete</button>
                </div>
            </div>
        `).join('');
        
        // Make this instance globally accessible for onclick handlers
        window.saveLoadManager = this;
    }
    
    loadSaveById(saveId) {
        const saves = this.getSavesFromStorage();
        const save = saves.find(s => s.id === saveId);
        if (save) {
            this.loadGame(save);
        }
    }
    
    deleteSaveById(saveId) {
        if (confirm('Are you sure you want to delete this save?')) {
            let saves = this.getSavesFromStorage();
            saves = saves.filter(s => s.id !== saveId);
            localStorage.setItem(this.storageKey, JSON.stringify(saves));
            this.updateSavesList();
        }
    }
    
    exportToFile() {
        const saveData = this.createSaveData('Export_' + new Date().toISOString().slice(0, 16));
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${saveData.name}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Game exported successfully');
    }
    
    importFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const saveData = JSON.parse(e.target.result);
                this.loadGame(saveData);
            } catch (error) {
                console.error('Import error:', error);
                alert('Failed to import file. Invalid format.');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    showMessage(message) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = 'save-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 2000);
    }
    
    loadSavesList() {
        // This method can be called on startup to prepare saves list
        return this.getSavesFromStorage();
    }
    
    // Enhanced save/load methods
    quickSave() {
        const quickSaveName = `QuickSave_${new Date().toLocaleTimeString()}`;
        const saveData = this.createSaveData(quickSaveName);
        this.addSaveToStorage(saveData);
        this.showMessage(`Quick saved: ${quickSaveName}`);
    }
    
    autoSave() {
        const autoSaveName = `AutoSave_Gen${this.game.generation}`;
        const saveData = this.createSaveData(autoSaveName);
        saveData.isAutoSave = true;
        this.addSaveToStorage(saveData);
        this.showMessage('Auto-saved game state', 'info', 1000);
    }
    
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab and mark button as active
        if (tabName === 'saves') {
            document.getElementById('saveSection').style.display = 'block';
            document.getElementById('loadSection').style.display = 'block';
        } else if (tabName === 'scenarios') {
            document.getElementById('scenariosTab').style.display = 'block';
            this.loadScenariosPreview();
        } else if (tabName === 'stats') {
            document.getElementById('statsTab').style.display = 'block';
            this.updateDetailedStats();
        }
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
    
    filterSaves(searchTerm) {
        this.currentFilter = searchTerm.toLowerCase();
        this.updateSavesList();
    }
    
    sortSaves(sortBy) {
        this.currentSort = sortBy;
        this.updateSavesList();
    }
    
    clearAllSaves() {
        if (confirm('Are you sure you want to delete ALL saves? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            this.updateSavesList();
            this.showMessage('All saves cleared');
        }
    }
    
    exportAllSaves() {
        const saves = this.getSavesFromStorage();
        const blob = new Blob([JSON.stringify(saves, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `GameOfLife_AllSaves_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showMessage(`Exported ${saves.length} saves`);
    }
    
    importSaves(event) {
        const files = Array.from(event.target.files);
        let importedCount = 0;
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (Array.isArray(data)) {
                        // Multiple saves
                        data.forEach(save => {
                            if (save.grid && save.name) {
                                save.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                                this.addSaveToStorage(save);
                                importedCount++;
                            }
                        });
                    } else if (data.grid && data.name) {
                        // Single save
                        data.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        this.addSaveToStorage(data);
                        importedCount++;
                    }
                    
                    this.updateSavesList();
                    this.showMessage(`Imported ${importedCount} saves`);
                } catch (error) {
                    console.error('Import error:', error);
                    this.showMessage('Failed to import some files', 'error');
                }
            };
            reader.readAsText(file);
        });
        
        event.target.value = '';
    }
    
    loadScenariosPreview() {
        // This will be populated by the battle scenarios system
        const preview = document.getElementById('scenariosPreview');
        preview.innerHTML = `
            <p>Battle scenarios will be loaded here when the scenarios system is initialized.</p>
            <button onclick="window.battleScenarios?.createScenariosUI()">Load Battle Scenarios</button>
        `;
    }
    
    updateDetailedStats() {
        const saves = this.getSavesFromStorage();
        let storageSize = 0;
        let lastSave = null;
        
        saves.forEach(save => {
            const saveSize = JSON.stringify(save).length;
            storageSize += saveSize;
            if (!lastSave || new Date(save.timestamp) > new Date(lastSave.timestamp)) {
                lastSave = save;
            }
        });
        
        // Update stats display
        document.getElementById('totalSaves').textContent = saves.length;
        document.getElementById('storageUsed').textContent = `${Math.round(storageSize / 1024)} KB`;
        document.getElementById('lastSaveTime').textContent = lastSave ? 
            new Date(lastSave.timestamp).toLocaleString() : 'Never';
        document.getElementById('fieldSizeInfo').textContent = `${this.game.gridWidth}×${this.game.gridHeight}`;
        
        // Team analysis
        const teamAnalysis = document.getElementById('teamAnalysis');
        const teams = new Map();
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                const team = this.game.grid[i][j];
                if (team > 0) {
                    teams.set(team, (teams.get(team) || 0) + 1);
                }
            }
        }
        
        if (teams.size > 0) {
            teamAnalysis.innerHTML = Array.from(teams.entries())
                .map(([team, count]) => `<div>Team ${team}: ${count} cells</div>`)
                .join('');
        } else {
            teamAnalysis.innerHTML = '<div>No active teams</div>';
        }
    }
    
    showMessage(message, type = 'success', duration = 2000) {
        const messageEl = document.createElement('div');
        messageEl.className = `save-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : type === 'info' ? '#2196F3' : '#4CAF50'};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, duration);
    }
}

// Undo/Redo System
export class UndoRedoManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;
        this.isCapturing = false;
        
        this.addUndoRedoButtons();
        this.addKeyboardShortcuts();
    }
    
    addUndoRedoButtons() {
        const controls = document.querySelector('.controls');
        const undoRedoSection = document.createElement('div');
        undoRedoSection.className = 'undo-redo-section';
        undoRedoSection.innerHTML = `
            <button id="undoBtn" title="Undo last action (Ctrl+Z)">↶ Undo</button>
            <button id="redoBtn" title="Redo last action (Ctrl+Y)">↷ Redo</button>
        `;
        controls.appendChild(undoRedoSection);
        
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        this.updateUndoRedoButtons();
    }
    
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    this.redo();
                }
            }
        });
    }
    
    captureState(action = 'unknown') {
        if (this.isCapturing) return; // Prevent recursive captures
        
        const state = {
            action: action,
            timestamp: Date.now(),
            generation: this.game.generation,
            grid: this.game.grid.map(row => [...row]),
            cellAges: this.game.cellAges.map(row => [...row]),
            running: this.game.running
        };
        
        this.undoStack.push(state);
        
        // Limit stack size
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when new action is performed
        this.redoStack = [];
        
        this.updateUndoRedoButtons();
    }
    
    undo() {
        if (this.undoStack.length === 0) return;
        
        // Save current state to redo stack
        const currentState = {
            action: 'current',
            timestamp: Date.now(),
            generation: this.game.generation,
            grid: this.game.grid.map(row => [...row]),
            cellAges: this.game.cellAges.map(row => [...row]),
            running: this.game.running
        };
        this.redoStack.push(currentState);
        
        // Restore previous state
        const previousState = this.undoStack.pop();
        this.restoreState(previousState);
        
        this.updateUndoRedoButtons();
    }
    
    redo() {
        if (this.redoStack.length === 0) return;
        
        // Save current state to undo stack
        const currentState = {
            action: 'undo',
            timestamp: Date.now(),
            generation: this.game.generation,
            grid: this.game.grid.map(row => [...row]),
            cellAges: this.game.cellAges.map(row => [...row]),
            running: this.game.running
        };
        this.undoStack.push(currentState);
        
        // Restore next state
        const nextState = this.redoStack.pop();
        this.restoreState(nextState);
        
        this.updateUndoRedoButtons();
    }
    
    restoreState(state) {
        this.isCapturing = true;
        
        this.game.grid = state.grid.map(row => [...row]);
        this.game.cellAges = state.cellAges.map(row => [...row]);
        this.game.generation = state.generation;
        this.game.running = state.running;
        
        // Update UI
        this.game.updateInfo();
        this.game.draw();
        document.getElementById('playPauseBtn').textContent = state.running ? 'Pause' : 'Play';
        
        this.isCapturing = false;
    }
    
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) undoBtn.disabled = this.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }
    
    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }
}
