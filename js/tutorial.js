/**
 * Interactive Tutorial System
 * Provides step-by-step onboarding for new users
 */

export class TutorialManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.tutorialSteps = this.defineTutorialSteps();
        
        this.createTutorialUI();
        this.checkFirstVisit();
    }
    
    defineTutorialSteps() {
        return [
            {
                id: 'welcome',
                title: 'Welcome to Zero Player Game!',
                content: 'This is Conway\'s Game of Life with team-based gameplay. Let\'s learn the basics!',
                target: null,
                action: null,
                highlight: false
            },
            {
                id: 'canvas',
                title: 'The Game Board',
                content: 'This is your game board. Click anywhere to place cells and watch them evolve!',
                target: '#gameCanvas',
                action: () => this.highlightElement('#gameCanvas'),
                highlight: true
            },
            {
                id: 'draw-cell',
                title: 'Draw Your First Cell',
                content: 'Click on the game board to place a cell. Try clicking a few spots!',
                target: '#gameCanvas',
                action: () => this.waitForCellPlacement(),
                highlight: true,
                waitFor: 'cell-placed'
            },
            {
                id: 'teams',
                title: 'Team Selection',
                content: 'Choose different teams (colors) to create competing populations. Try selecting Team 2 (Blue).',
                target: 'input[value="2"]',
                action: () => this.highlightElement('input[value="2"]'),
                highlight: true,
                waitFor: 'team-selected'
            },
            {
                id: 'patterns',
                title: 'Pre-built Patterns',
                content: 'Use these buttons to load famous Game of Life patterns. Try the Glider!',
                target: '[data-pattern="glider"]',
                action: () => this.highlightElement('[data-pattern="glider"]'),
                highlight: true,
                waitFor: 'pattern-loaded'
            },
            {
                id: 'play',
                title: 'Start the Simulation',
                content: 'Click Play to watch your cells evolve according to Conway\'s rules!',
                target: '#playPauseBtn',
                action: () => this.highlightElement('#playPauseBtn'),
                highlight: true,
                waitFor: 'simulation-started'
            },
            {
                id: 'controls',
                title: 'Camera Controls',
                content: 'Use your mouse wheel to zoom, and hold Shift while dragging to pan around.',
                target: '#gameCanvas',
                action: () => this.demonstrateZoom(),
                highlight: false
            },
            {
                id: 'team-stats',
                title: 'Team Competition',
                content: 'When multiple teams exist, you\'ll see statistics here showing which team is winning!',
                target: '#teamStats',
                action: () => this.ensureTeamMode(),
                highlight: true
            },
            {
                id: 'advanced',
                title: 'Advanced Features',
                content: 'Explore team configurations, GIF recording, and analytics panels for deeper gameplay!',
                target: '.team-config',
                action: () => this.highlightElement('.team-config'),
                highlight: false
            },
            {
                id: 'complete',
                title: 'Tutorial Complete!',
                content: 'You\'re ready to explore the fascinating world of cellular automata. Have fun experimenting!',
                target: null,
                action: () => this.celebrateCompletion(),
                highlight: false
            }
        ];
    }
    
    createTutorialUI() {
        // Create tutorial overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.innerHTML = `
            <div class="tutorial-modal">
                <div class="tutorial-header">
                    <h3 class="tutorial-title"></h3>
                    <button class="tutorial-close" aria-label="Close tutorial">&times;</button>
                </div>
                <div class="tutorial-content">
                    <p class="tutorial-text"></p>
                    <div class="tutorial-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <span class="progress-text">Step 1 of ${this.tutorialSteps.length}</span>
                    </div>
                </div>
                <div class="tutorial-footer">
                    <button class="tutorial-btn tutorial-skip">Skip Tutorial</button>
                    <div class="tutorial-nav">
                        <button class="tutorial-btn tutorial-prev" disabled>Previous</button>
                        <button class="tutorial-btn tutorial-next primary">Next</button>
                    </div>
                </div>
            </div>
            <div class="tutorial-highlight"></div>
        `;
        
        document.body.appendChild(this.overlay);
        this.addTutorialEventListeners();
    }
    
    addTutorialEventListeners() {
        const modal = this.overlay.querySelector('.tutorial-modal');
        
        // Navigation buttons
        this.overlay.querySelector('.tutorial-next').addEventListener('click', () => this.nextStep());
        this.overlay.querySelector('.tutorial-prev').addEventListener('click', () => this.previousStep());
        this.overlay.querySelector('.tutorial-skip').addEventListener('click', () => this.endTutorial());
        this.overlay.querySelector('.tutorial-close').addEventListener('click', () => this.endTutorial());
        
        // Prevent clicks from closing tutorial
        modal.addEventListener('click', (e) => e.stopPropagation());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                // Allow clicking outside to continue on certain steps
                if (this.tutorialSteps[this.currentStep].waitFor) {
                    return;
                }
                this.nextStep();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            switch (e.key) {
                case 'ArrowRight':
                case 'Enter':
                    e.preventDefault();
                    this.nextStep();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousStep();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.endTutorial();
                    break;
            }
        });
    }
    
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('zeroPlayerGame_tutorialCompleted');
        if (!hasVisited) {
            // Show tutorial prompt
            setTimeout(() => this.showTutorialPrompt(), 1000);
        }
    }
    
    showTutorialPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'tutorial-prompt';
        prompt.innerHTML = `
            <div class="prompt-content">
                <h3>👋 First time here?</h3>
                <p>Would you like a quick tutorial to learn the basics?</p>
                <div class="prompt-buttons">
                    <button class="tutorial-btn" onclick="this.parentElement.parentElement.parentElement.remove()">No thanks</button>
                    <button class="tutorial-btn primary" id="startTutorial">Yes, show me around!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        prompt.querySelector('#startTutorial').addEventListener('click', () => {
            prompt.remove();
            this.startTutorial();
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (prompt.parentElement) {
                prompt.remove();
            }
        }, 10000);
    }
    
    startTutorial() {
        this.isActive = true;
        this.currentStep = 0;
        this.overlay.classList.add('active');
        this.showCurrentStep();
        
        // Pause the game during tutorial
        if (this.game.running) {
            this.game.togglePlay();
        }
    }
    
    showCurrentStep() {
        const step = this.tutorialSteps[this.currentStep];
        const modal = this.overlay.querySelector('.tutorial-modal');
        
        // Update content
        this.overlay.querySelector('.tutorial-title').textContent = step.title;
        this.overlay.querySelector('.tutorial-text').textContent = step.content;
        this.overlay.querySelector('.progress-text').textContent = 
            `Step ${this.currentStep + 1} of ${this.tutorialSteps.length}`;
        
        // Update progress bar
        const progressFill = this.overlay.querySelector('.progress-fill');
        const progress = ((this.currentStep + 1) / this.tutorialSteps.length) * 100;
        progressFill.style.width = `${progress}%`;
        
        // Update navigation buttons
        this.overlay.querySelector('.tutorial-prev').disabled = this.currentStep === 0;
        const nextBtn = this.overlay.querySelector('.tutorial-next');
        nextBtn.textContent = this.currentStep === this.tutorialSteps.length - 1 ? 'Finish' : 'Next';
        
        // Handle highlighting and targeting
        this.clearHighlights();
        if (step.highlight && step.target) {
            this.highlightElement(step.target);
            this.positionModal(step.target);
        } else {
            this.centerModal();
        }
        
        // Execute step action
        if (step.action) {
            step.action();
        }
        
        // Set up wait conditions
        if (step.waitFor) {
            this.setupWaitCondition(step.waitFor);
            nextBtn.disabled = true;
            nextBtn.textContent = 'Waiting...';
        } else {
            nextBtn.disabled = false;
        }
    }
    
    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const highlight = this.overlay.querySelector('.tutorial-highlight');
        
        highlight.style.left = rect.left - 10 + 'px';
        highlight.style.top = rect.top - 10 + 'px';
        highlight.style.width = rect.width + 20 + 'px';
        highlight.style.height = rect.height + 20 + 'px';
        highlight.classList.add('active');
        
        // Add pulsing effect
        element.classList.add('tutorial-target');
    }
    
    clearHighlights() {
        this.overlay.querySelector('.tutorial-highlight').classList.remove('active');
        document.querySelectorAll('.tutorial-target').forEach(el => {
            el.classList.remove('tutorial-target');
        });
    }
    
    positionModal(targetSelector) {
        const target = document.querySelector(targetSelector);
        const modal = this.overlay.querySelector('.tutorial-modal');
        
        if (!target) {
            this.centerModal();
            return;
        }
        
        const targetRect = target.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        
        // Position modal near but not overlapping the target
        let left = targetRect.right + 20;
        let top = targetRect.top;
        
        // Adjust if modal would go off-screen
        if (left + modalRect.width > window.innerWidth) {
            left = targetRect.left - modalRect.width - 20;
        }
        
        if (top + modalRect.height > window.innerHeight) {
            top = window.innerHeight - modalRect.height - 20;
        }
        
        if (left < 20) left = 20;
        if (top < 20) top = 20;
        
        modal.style.position = 'fixed';
        modal.style.left = left + 'px';
        modal.style.top = top + 'px';
        modal.style.transform = 'none';
    }
    
    centerModal() {
        const modal = this.overlay.querySelector('.tutorial-modal');
        modal.style.position = 'fixed';
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
    }
    
    setupWaitCondition(condition) {
        const nextBtn = this.overlay.querySelector('.tutorial-next');
        
        const checkCondition = () => {
            let conditionMet = false;
            
            switch (condition) {
                case 'cell-placed':
                    conditionMet = this.hasAnyCells();
                    break;
                case 'team-selected':
                    conditionMet = this.game.currentTeam > 1;
                    break;
                case 'pattern-loaded':
                    conditionMet = this.hasAnyCells();
                    break;
                case 'simulation-started':
                    conditionMet = this.game.running;
                    break;
            }
            
            if (conditionMet) {
                nextBtn.disabled = false;
                nextBtn.textContent = 'Continue';
                this.showSuccessMessage();
            } else {
                setTimeout(checkCondition, 500);
            }
        };
        
        checkCondition();
    }
    
    hasAnyCells() {
        for (let i = 0; i < this.game.gridHeight; i++) {
            for (let j = 0; j < this.game.gridWidth; j++) {
                if (this.game.grid[i][j] > 0) return true;
            }
        }
        return false;
    }
    
    showSuccessMessage() {
        const content = this.overlay.querySelector('.tutorial-text');
        const originalText = content.textContent;
        content.innerHTML = `${originalText} <span class="tutorial-success">✅ Great job!</span>`;
        
        setTimeout(() => {
            content.textContent = originalText;
        }, 2000);
    }
    
    nextStep() {
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.currentStep++;
            this.showCurrentStep();
        } else {
            this.endTutorial();
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showCurrentStep();
        }
    }
    
    endTutorial() {
        this.isActive = false;
        this.overlay.classList.remove('active');
        this.clearHighlights();
        
        // Mark tutorial as completed
        localStorage.setItem('zeroPlayerGame_tutorialCompleted', 'true');
        
        // Show completion message
        this.showCompletionToast();
    }
    
    demonstrateZoom() {
        let zoomDirection = 1;
        let zoomCount = 0;
        
        const demoZoom = () => {
            if (zoomCount >= 6) return;
            
            const newZoom = this.game.camera.zoom * (zoomDirection > 0 ? 1.2 : 0.8);
            this.game.camera.zoom = Math.max(0.5, Math.min(2, newZoom));
            this.game.draw();
            this.game.updateZoomInfo();
            
            zoomDirection *= -1;
            zoomCount++;
            
            setTimeout(demoZoom, 800);
        };
        
        setTimeout(demoZoom, 500);
    }
    
    ensureTeamMode() {
        if (!this.game.teamMode) {
            // Create a multi-team scenario
            this.game.clear();
            
            // Place some red cells
            for (let i = 0; i < 3; i++) {
                this.game.grid[20][20 + i] = 1;
            }
            
            // Place some blue cells
            for (let i = 0; i < 3; i++) {
                this.game.grid[22][20 + i] = 2;
            }
            
            this.game.teamMode = true;
            this.game.draw();
            this.game.updateTeamStats();
            document.getElementById('teamStats').style.display = 'flex';
        }
    }
    
    celebrateCompletion() {
        // Create confetti effect
        this.createConfetti();
        
        // Show achievement
        setTimeout(() => {
            this.showAchievement('Tutorial Master', 'You\'ve completed the tutorial!');
        }, 1000);
    }
    
    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = ['#ff4444', '#4444ff', '#44ff44', '#ffff44'][Math.floor(Math.random() * 4)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    showAchievement(title, description) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-notification';
        achievement.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">🏆</div>
                <div class="achievement-text">
                    <h4>${title}</h4>
                    <p>${description}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(achievement);
        
        setTimeout(() => achievement.classList.add('show'), 100);
        setTimeout(() => {
            achievement.classList.remove('show');
            setTimeout(() => achievement.remove(), 300);
        }, 4000);
    }
    
    showCompletionToast() {
        const toast = document.createElement('div');
        toast.className = 'tutorial-toast';
        toast.textContent = 'Tutorial completed! 🎉';
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Public API
    restart() {
        this.currentStep = 0;
        this.startTutorial();
    }
    
    skip() {
        this.endTutorial();
    }
}
