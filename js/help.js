// Help Modal Management

export class HelpManager {
    constructor() {
        this.currentTab = 'getting-started';
        this.initializeEventListeners();
        this.loadSavedTab();
    }
    
    initializeEventListeners() {
        const helpBtn = document.getElementById('helpBtn');
        const modal = document.getElementById('helpModal');
        const closeBtn = modal.querySelector('.close');
        const tabs = document.querySelectorAll('.help-tab');
        
        // Open modal
        helpBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            this.showTab(this.currentTab);
        });
        
        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close on outside click
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.showTab(tabName);
            });
        });
        
        // Keyboard shortcut (F1 or ?)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1' || (e.key === '?' && e.shiftKey)) {
                e.preventDefault();
                modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
                if (modal.style.display === 'block') {
                    this.showTab(this.currentTab);
                }
            }
        });
    }
    
    showTab(tabName) {
        // Update current tab
        this.currentTab = tabName;
        
        // Update tab buttons
        const tabs = document.querySelectorAll('.help-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update content sections
        const sections = document.querySelectorAll('.help-section');
        sections.forEach(section => {
            if (section.id === tabName) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        
        // Save current tab
        this.saveCurrentTab();
    }
    
    saveCurrentTab() {
        try {
            localStorage.setItem('gameOfLifeHelpTab', this.currentTab);
        } catch (e) {
            // Ignore storage errors
        }
    }
    
    loadSavedTab() {
        try {
            const savedTab = localStorage.getItem('gameOfLifeHelpTab');
            if (savedTab) {
                this.currentTab = savedTab;
            }
        } catch (e) {
            // Ignore storage errors
        }
    }
}