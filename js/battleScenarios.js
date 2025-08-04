/**
 * Battle Scenarios and Enhanced Save/Load System
 * Provides pre-configured battle scenarios and improved save management
 */

export class BattleScenarios {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.scenarios = this.defineBattleScenarios();
        this.createScenariosUI();
    }
    
    defineBattleScenarios() {
        return {
            'classic-battle': {
                name: 'Classic Battle',
                description: 'Two teams face off with basic gliders',
                gridSize: { width: 80, height: 60 },
                teams: [
                    {
                        team: 1,
                        pattern: 'glider',
                        positions: [
                            { x: 10, y: 10 },
                            { x: 15, y: 15 },
                            { x: 20, y: 10 }
                        ],
                        config: {
                            formula: 'conway',
                            intelligence: 0.3,
                            aggressiveness: 0.7,
                            fear: 0.2,
                            multiplyRate: 0.8,
                            herdRate: 0.6
                        }
                    },
                    {
                        team: 2,
                        pattern: 'glider',
                        positions: [
                            { x: 70, y: 50 },
                            { x: 65, y: 45 },
                            { x: 60, y: 50 }
                        ],
                        config: {
                            formula: 'conway',
                            intelligence: 0.5,
                            aggressiveness: 0.5,
                            fear: 0.4,
                            multiplyRate: 0.7,
                            herdRate: 0.8
                        }
                    }
                ]
            },
            
            'fortress-siege': {
                name: 'Fortress Siege',
                description: 'Aggressive attackers vs defensive fortress',
                gridSize: { width: 100, height: 80 },
                teams: [
                    {
                        team: 1, // Attackers
                        pattern: 'custom',
                        customPattern: [
                            [1,1,1],
                            [1,0,1],
                            [1,1,1]
                        ],
                        positions: [
                            { x: 10, y: 20 },
                            { x: 10, y: 40 },
                            { x: 10, y: 60 }
                        ],
                        config: {
                            formula: 'highlife',
                            intelligence: 0.8,
                            aggressiveness: 0.9,
                            fear: 0.1,
                            multiplyRate: 0.9,
                            herdRate: 0.4
                        }
                    },
                    {
                        team: 3, // Defenders
                        pattern: 'block',
                        positions: [
                            { x: 80, y: 35 },
                            { x: 85, y: 35 },
                            { x: 80, y: 45 },
                            { x: 85, y: 45 },
                            { x: 75, y: 40 },
                            { x: 90, y: 40 }
                        ],
                        config: {
                            formula: 'conway',
                            intelligence: 0.6,
                            aggressiveness: 0.3,
                            fear: 0.8,
                            multiplyRate: 0.5,
                            herdRate: 0.9
                        }
                    }
                ]
            },
            
            'four-way-chaos': {
                name: 'Four-Way Chaos',
                description: 'All teams battle in the center',
                gridSize: { width: 100, height: 100 },
                teams: [
                    {
                        team: 1,
                        pattern: 'pulsar',
                        positions: [{ x: 20, y: 20 }],
                        config: {
                            formula: 'conway',
                            intelligence: 0.4,
                            aggressiveness: 0.6,
                            fear: 0.3,
                            multiplyRate: 0.7,
                            herdRate: 0.5
                        }
                    },
                    {
                        team: 2,
                        pattern: 'pentadecathlon',
                        positions: [{ x: 80, y: 20 }],
                        config: {
                            formula: 'daynight',
                            intelligence: 0.7,
                            aggressiveness: 0.4,
                            fear: 0.5,
                            multiplyRate: 0.6,
                            herdRate: 0.7
                        }
                    },
                    {
                        team: 3,
                        pattern: 'gliderGun',
                        positions: [{ x: 20, y: 80 }],
                        config: {
                            formula: 'seeds',
                            intelligence: 0.9,
                            aggressiveness: 0.8,
                            fear: 0.2,
                            multiplyRate: 0.9,
                            herdRate: 0.3
                        }
                    },
                    {
                        team: 4,
                        pattern: 'spaceship',
                        positions: [{ x: 80, y: 80 }],
                        config: {
                            formula: 'brian',
                            intelligence: 0.5,
                            aggressiveness: 0.7,
                            fear: 0.4,
                            multiplyRate: 0.8,
                            herdRate: 0.6
                        }
                    }
                ]
            },
            
            'evolution-lab': {
                name: 'Evolution Laboratory',
                description: 'Study different evolutionary strategies',
                gridSize: { width: 120, height: 80 },
                teams: [
                    {
                        team: 1, // Fast reproduction
                        pattern: 'random',
                        randomDensity: 0.3,
                        area: { x: 10, y: 10, width: 20, height: 20 },
                        config: {
                            formula: 'seeds',
                            intelligence: 0.2,
                            aggressiveness: 0.3,
                            fear: 0.1,
                            multiplyRate: 0.95,
                            herdRate: 0.2
                        }
                    },
                    {
                        team: 2, // Balanced
                        pattern: 'random',
                        randomDensity: 0.25,
                        area: { x: 50, y: 30, width: 20, height: 20 },
                        config: {
                            formula: 'conway',
                            intelligence: 0.5,
                            aggressiveness: 0.5,
                            fear: 0.5,
                            multiplyRate: 0.6,
                            herdRate: 0.5
                        }
                    },
                    {
                        team: 4, // Defensive specialists
                        pattern: 'random',
                        randomDensity: 0.4,
                        area: { x: 90, y: 10, width: 20, height: 20 },
                        config: {
                            formula: 'highlife',
                            intelligence: 0.8,
                            aggressiveness: 0.1,
                            fear: 0.9,
                            multiplyRate: 0.3,
                            herdRate: 0.95
                        }
                    }
                ]
            },
            
            'migration-waves': {
                name: 'Migration Waves',
                description: 'Teams migrate across the field in waves',
                gridSize: { width: 150, height: 60 },
                teams: [
                    {
                        team: 1,
                        pattern: 'glider',
                        positions: Array.from({length: 10}, (_, i) => ({
                            x: 10,
                            y: 5 + i * 5
                        })),
                        config: {
                            formula: 'conway',
                            intelligence: 0.9,
                            aggressiveness: 0.6,
                            fear: 0.2,
                            multiplyRate: 0.7,
                            herdRate: 0.8
                        }
                    },
                    {
                        team: 3,
                        pattern: 'glider',
                        positions: Array.from({length: 10}, (_, i) => ({
                            x: 140,
                            y: 5 + i * 5
                        })),
                        config: {
                            formula: 'conway',
                            intelligence: 0.9,
                            aggressiveness: 0.6,
                            fear: 0.2,
                            multiplyRate: 0.7,
                            herdRate: 0.8
                        }
                    }
                ]
            }
        };
    }
    
    createScenariosUI() {
        // Add scenarios section to controls
        const controls = document.querySelector('.controls');
        const scenariosSection = document.createElement('div');
        scenariosSection.className = 'scenarios-section';
        scenariosSection.innerHTML = `
            <h3>Battle Scenarios</h3>
            <div class="scenarios-grid">
                ${Object.entries(this.scenarios).map(([id, scenario]) => `
                    <div class="scenario-card" data-scenario="${id}">
                        <h4>${scenario.name}</h4>
                        <p>${scenario.description}</p>
                        <div class="scenario-info">
                            <span>🏟️ ${scenario.gridSize.width}×${scenario.gridSize.height}</span>
                            <span>👥 ${scenario.teams.length} teams</span>
                        </div>
                        <button class="scenario-btn" onclick="window.battleScenarios.loadScenario('${id}')">
                            Load Scenario
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        controls.appendChild(scenariosSection);
        
        // Make available globally for button clicks
        window.battleScenarios = this;
    }
    
    async loadScenario(scenarioId) {
        const scenario = this.scenarios[scenarioId];
        if (!scenario) return;
        
        // Show loading indicator
        this.showLoadingIndicator('Loading scenario...');
        
        try {
            // Resize field if needed
            if (scenario.gridSize) {
                this.game.resizeField(scenario.gridSize.width, scenario.gridSize.height);
            }
            
            // Clear current state
            this.game.clear();
            
            // Set up teams
            for (const teamData of scenario.teams) {
                // Configure team settings
                if (teamData.config) {
                    this.game.teamConfigManager.setConfig(teamData.team, teamData.config);
                }
                
                // Place team patterns
                await this.placeTeamPattern(teamData);
            }
            
            // Enable team mode and update UI
            this.game.teamMode = this.game.hasMultipleTeams();
            document.getElementById('teamStats').style.display = this.game.teamMode ? 'flex' : 'none';
            this.game.updateTeamStats();
            this.game.draw();
            
            // Show success message
            this.showSuccessMessage(`Loaded scenario: ${scenario.name}`);
            
            // Auto-start simulation after a brief delay
            setTimeout(() => {
                if (!this.game.running) {
                    this.game.togglePlay();
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error loading scenario:', error);
            this.showErrorMessage('Failed to load scenario');
        } finally {
            this.hideLoadingIndicator();
        }
    }
    
    async placeTeamPattern(teamData) {
        const { team, pattern, positions, customPattern, randomDensity, area } = teamData;
        
        if (pattern === 'random' && area && randomDensity) {
            // Place random cells in specified area
            for (let i = area.y; i < area.y + area.height; i++) {
                for (let j = area.x; j < area.x + area.width; j++) {
                    if (i >= 0 && i < this.game.gridHeight && 
                        j >= 0 && j < this.game.gridWidth) {
                        if (Math.random() < randomDensity) {
                            this.game.grid[i][j] = team;
                            this.game.cellAges[i][j] = this.game.fadeInDuration;
                        }
                    }
                }
            }
        } else if (pattern === 'custom' && customPattern) {
            // Place custom pattern at each position
            for (const pos of positions) {
                this.placeCustomPattern(customPattern, pos.x, pos.y, team);
            }
        } else {
            // Load standard pattern at each position
            const { loadPattern } = await import('./patterns.js');
            for (const pos of positions) {
                loadPattern(this.game.grid, pattern, pos.y, pos.x, team);
                
                // Set cell ages for proper visual effect
                this.setCellAgesAroundPosition(pos.x, pos.y, 10);
            }
        }
    }
    
    placeCustomPattern(pattern, centerX, centerY, team) {
        const offsetY = Math.floor(pattern.length / 2);
        const offsetX = Math.floor(pattern[0].length / 2);
        
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                if (pattern[i][j] === 1) {
                    const x = centerX + j - offsetX;
                    const y = centerY + i - offsetY;
                    
                    if (x >= 0 && x < this.game.gridWidth && 
                        y >= 0 && y < this.game.gridHeight) {
                        this.game.grid[y][x] = team;
                        this.game.cellAges[y][x] = this.game.fadeInDuration;
                    }
                }
            }
        }
    }
    
    setCellAgesAroundPosition(centerX, centerY, radius) {
        for (let i = centerY - radius; i <= centerY + radius; i++) {
            for (let j = centerX - radius; j <= centerX + radius; j++) {
                if (i >= 0 && i < this.game.gridHeight && 
                    j >= 0 && j < this.game.gridWidth && 
                    this.game.grid[i][j] > 0) {
                    this.game.cellAges[i][j] = this.game.fadeInDuration;
                }
            }
        }
    }
    
    showLoadingIndicator(message) {
        const indicator = document.createElement('div');
        indicator.id = 'scenarioLoading';
        indicator.className = 'loading-indicator';
        indicator.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(indicator);
    }
    
    hideLoadingIndicator() {
        const indicator = document.getElementById('scenarioLoading');
        if (indicator) {
            indicator.remove();
        }
    }
    
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showToast(message, 'error');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    exportScenario(name, description) {
        // Create scenario from current game state
        const scenario = {
            name: name || 'Custom Scenario',
            description: description || 'User created scenario',
            gridSize: {
                width: this.game.gridWidth,
                height: this.game.gridHeight
            },
            teams: []
        };
        
        // Extract team data
        const teamData = {};
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                const team = this.game.grid[i][j];
                if (team > 0) {
                    if (!teamData[team]) {
                        teamData[team] = {
                            team,
                            positions: [],
                            config: this.game.teamConfigManager.getConfig(team)
                        };
                    }
                    teamData[team].positions.push({ x: j, y: i });
                }
            }
        }
        
        scenario.teams = Object.values(teamData);
        
        return scenario;
    }
    
    saveAsScenario() {
        const name = prompt('Enter scenario name:');
        if (!name) return;
        
        const description = prompt('Enter scenario description:') || '';
        const scenario = this.exportScenario(name, description);
        
        // Save to localStorage
        const customScenarios = JSON.parse(localStorage.getItem('customScenarios') || '{}');
        const scenarioId = name.toLowerCase().replace(/\s+/g, '-');
        customScenarios[scenarioId] = scenario;
        localStorage.setItem('customScenarios', JSON.stringify(customScenarios));
        
        this.showSuccessMessage('Scenario saved successfully!');
        this.loadCustomScenarios();
    }
    
    loadCustomScenarios() {
        const customScenarios = JSON.parse(localStorage.getItem('customScenarios') || '{}');
        Object.assign(this.scenarios, customScenarios);
        
        // Recreate UI to include custom scenarios
        const existingSection = document.querySelector('.scenarios-section');
        if (existingSection) {
            existingSection.remove();
            this.createScenariosUI();
        }
    }
}
