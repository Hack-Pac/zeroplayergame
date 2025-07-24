// Team configuration management

import { DEFAULT_TEAM_CONFIG } from './constants.js';

export class TeamConfigManager {
    constructor() {
        this.configs = {
            1: { ...DEFAULT_TEAM_CONFIG }, // Red team
            2: { ...DEFAULT_TEAM_CONFIG }, // Blue team
            3: { ...DEFAULT_TEAM_CONFIG }, // Green team
            4: { ...DEFAULT_TEAM_CONFIG }  // Yellow team
        };
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const configBtn = document.getElementById('configBtn');
        const modal = document.getElementById('configModal');
        const closeBtn = modal.querySelector('.close');
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
        const sliders = ['intelligence', 'aggressiveness', 'fear', 'multiplyRate', 'herdRate', 'adaptability', 'cooperation'];
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
        const config = this.configs[teamId];
        document.getElementById('formula').value = config.formula;
        document.getElementById('intelligence').value = config.intelligence * 100;
        document.getElementById('aggressiveness').value = config.aggressiveness * 100;
        document.getElementById('fear').value = config.fear * 100;
        document.getElementById('multiplyRate').value = config.multiplyRate * 100;
        document.getElementById('herdRate').value = config.herdRate * 100;
        document.getElementById('strategy').value = config.strategy;
        document.getElementById('formationPreference').value = config.formationPreference;
        document.getElementById('adaptability').value = config.adaptability * 100;
        document.getElementById('cooperation').value = config.cooperation * 100;
        document.getElementById('resourcePriority').value = config.resourcePriority;
        
        // Update display values
        document.getElementById('intelligence').nextElementSibling.textContent = config.intelligence.toFixed(2);
        document.getElementById('aggressiveness').nextElementSibling.textContent = config.aggressiveness.toFixed(2);
        document.getElementById('fear').nextElementSibling.textContent = config.fear.toFixed(2);
        document.getElementById('multiplyRate').nextElementSibling.textContent = config.multiplyRate.toFixed(1);
        document.getElementById('herdRate').nextElementSibling.textContent = config.herdRate.toFixed(2);
        document.getElementById('adaptability').nextElementSibling.textContent = config.adaptability.toFixed(2);
        document.getElementById('cooperation').nextElementSibling.textContent = config.cooperation.toFixed(2);
    }
    
    saveTeamConfig(teamId) {
        this.configs[teamId] = {
            formula: document.getElementById('formula').value,
            intelligence: parseInt(document.getElementById('intelligence').value) / 100,
            aggressiveness: parseInt(document.getElementById('aggressiveness').value) / 100,
            fear: parseInt(document.getElementById('fear').value) / 100,
            multiplyRate: parseInt(document.getElementById('multiplyRate').value) / 100,
            herdRate: parseInt(document.getElementById('herdRate').value) / 100,
            strategy: document.getElementById('strategy').value,
            formationPreference: document.getElementById('formationPreference').value,
            adaptability: parseInt(document.getElementById('adaptability').value) / 100,
            cooperation: parseInt(document.getElementById('cooperation').value) / 100,
            resourcePriority: document.getElementById('resourcePriority').value
        };
    }
    
    getConfig(teamId) {
        return this.configs[teamId];
    }
    
    getAllConfigs() {
        return this.configs;
    }
}