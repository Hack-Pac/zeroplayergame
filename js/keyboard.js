// Comprehensive keyboard shortcuts and accessibility

export class KeyboardShortcuts {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.shortcuts = new Map();
        this.helpVisible = false;
        
        this.registerShortcuts();
        this.createHelpOverlay();
        this.addEventListeners();
    }
    
    registerShortcuts() {
        // Game controls
        this.shortcuts.set('Space', {
            action: () => this.game.togglePlay(),
            description: 'Play/Pause simulation',
            category: 'Game Control'
        });
        
        this.shortcuts.set('KeyC', {
            action: () => this.game.clear(),
            description: 'Clear board',
            category: 'Game Control'
        });
        
        this.shortcuts.set('KeyR', {
            action: () => this.game.loadPattern('random'),
            description: 'Random pattern',
            category: 'Game Control'
        });
        
        // Team selection (1-5)
        for (let i = 0; i <= 4; i++) {
            this.shortcuts.set(`Digit${i}`, {
                action: () => this.selectTeam(i),
                description: `Select team ${i === 0 ? 'None' : i}`,
                category: 'Team Selection'
            });
        }
        
        // Patterns (Shift + key)
        this.shortcuts.set('KeyG', {
            action: () => this.game.loadPattern('glider'),
            description: 'Load glider pattern',
            category: 'Patterns',
            modifier: 'shift'
        });
        
        this.shortcuts.set('KeyB', {
            action: () => this.game.loadPattern('blinker'),
            description: 'Load blinker pattern',
            category: 'Patterns',
            modifier: 'shift'
        });
        
        this.shortcuts.set('KeyT', {
            action: () => this.game.loadPattern('toad'),
            description: 'Load toad pattern',
            category: 'Patterns',
            modifier: 'shift'
        });
        
        // Speed control
        this.shortcuts.set('Equal', {
            action: () => this.adjustSpeed(1),
            description: 'Increase speed',
            category: 'Speed Control'
        });
        
        this.shortcuts.set('Minus', {
            action: () => this.adjustSpeed(-1),
            description: 'Decrease speed',
            category: 'Speed Control'
        });
        
        // View controls
        this.shortcuts.set('KeyF', {
            action: () => this.fitToScreen(),
            description: 'Fit view to screen',
            category: 'View Control'
        });
        
        this.shortcuts.set('Digit0', {
            action: () => this.resetView(),
            description: 'Reset view',
            category: 'View Control'
        });
        
        // File operations (Ctrl/Cmd + key)
        this.shortcuts.set('KeyS', {
            action: () => this.game.saveLoadManager?.showSaveModal(),
            description: 'Save game',
            category: 'File Operations',
            modifier: 'ctrl'
        });
        
        this.shortcuts.set('KeyO', {
            action: () => this.game.saveLoadManager?.showLoadModal(),
            description: 'Load game',
            category: 'File Operations',
            modifier: 'ctrl'
        });
        
        this.shortcuts.set('KeyE', {
            action: () => this.game.saveLoadManager?.exportToFile(),
            description: 'Export game',
            category: 'File Operations',
            modifier: 'ctrl'
        });
        
        // Help
        this.shortcuts.set('F1', {
            action: () => this.toggleHelp(),
            description: 'Toggle help',
            category: 'Help'
        });
        
        this.shortcuts.set('Slash', {
            action: () => this.toggleHelp(),
            description: 'Toggle help',
            category: 'Help',
            modifier: 'shift'
        });
        
        // Recording
        this.shortcuts.set('KeyP', {
            action: () => this.toggleRecording(),
            description: 'Toggle GIF recording',
            category: 'Recording',
            modifier: 'ctrl'
        });
    }
    
    addEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        // Skip if typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        
        const shortcut = this.shortcuts.get(e.code);
        if (!shortcut) return;
        
        // Check modifier requirements
        const modifierMatch = this.checkModifier(e, shortcut.modifier);
        if (!modifierMatch) return;
        
        e.preventDefault();
        shortcut.action();
    }
    
    handleKeyUp(e) {
        // Handle any key-up specific logic here
    }
    
    checkModifier(e, required) {
        if (!required) return !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
        
        switch (required) {
            case 'ctrl': return e.ctrlKey || e.metaKey;
            case 'shift': return e.shiftKey;
            case 'alt': return e.altKey;
            default: return true;
        }
    }
    
    selectTeam(teamNumber) {
        const radio = document.querySelector(`input[name="team"][value="${teamNumber}"]`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
    }
    
    adjustSpeed(delta) {
        const slider = document.getElementById('speedSlider');
        if (slider) {
            const newValue = Math.max(1, Math.min(20, parseInt(slider.value) + delta));
            slider.value = newValue;
            slider.dispatchEvent(new Event('input'));
        }
    }
    
    fitToScreen() {
        if (this.game.camera) {
            // Calculate zoom to fit entire grid
            const canvasAspect = this.game.canvas.width / this.game.canvas.height;
            const gridAspect = (this.game.gridWidth * this.game.cellSize) / (this.game.gridHeight * this.game.cellSize);
            
            let zoom;
            if (gridAspect > canvasAspect) {
                zoom = this.game.canvas.width / (this.game.gridWidth * this.game.cellSize);
            } else {
                zoom = this.game.canvas.height / (this.game.gridHeight * this.game.cellSize);
            }
            
            this.game.camera.zoom = Math.max(0.1, Math.min(4, zoom * 0.9)); // 90% of fit
            this.game.camera.x = 0;
            this.game.camera.y = 0;
            this.game.draw();
            this.game.updateZoomInfo();
        }
    }
    
    resetView() {
        if (this.game.camera) {
            this.game.camera.reset();
            this.game.draw();
            this.game.updateZoomInfo();
        }
    }
    
    toggleRecording() {
        const recordBtn = document.getElementById('recordBtn');
        if (recordBtn) {
            recordBtn.click();
        }
    }
    
    toggleHelp() {
        this.helpVisible = !this.helpVisible;
        const overlay = document.getElementById('shortcutsHelp');
        overlay.style.display = this.helpVisible ? 'block' : 'none';
    }
    
    createHelpOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'shortcutsHelp';
        overlay.className = 'shortcuts-help-overlay';
        overlay.style.display = 'none';
        
        const categories = this.organizeShortcutsByCategory();
        
        overlay.innerHTML = `
            <div class="shortcuts-help-content">
                <div class="shortcuts-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="shortcuts-close">&times;</button>
                </div>
                <div class="shortcuts-body">
                    ${Object.entries(categories).map(([category, shortcuts]) => `
                        <div class="shortcuts-category">
                            <h4>${category}</h4>
                            <div class="shortcuts-list">
                                ${shortcuts.map(shortcut => `
                                    <div class="shortcut-item">
                                        <span class="shortcut-key">${this.formatKeyDisplay(shortcut.key, shortcut.modifier)}</span>
                                        <span class="shortcut-desc">${shortcut.description}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Event listeners
        overlay.querySelector('.shortcuts-close').addEventListener('click', () => this.toggleHelp());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.toggleHelp();
        });
    }
    
    organizeShortcutsByCategory() {
        const categories = {};
        
        for (const [key, shortcut] of this.shortcuts) {
            const category = shortcut.category || 'Other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({
                key: key,
                modifier: shortcut.modifier,
                description: shortcut.description
            });
        }
        
        return categories;
    }
    
    formatKeyDisplay(key, modifier) {
        let display = '';
        
        if (modifier) {
            switch (modifier) {
                case 'ctrl':
                    display += 'Ctrl + ';
                    break;
                case 'shift':
                    display += 'Shift + ';
                    break;
                case 'alt':
                    display += 'Alt + ';
                    break;
            }
        }
        
        // Convert key codes to readable format
        const keyMap = {
            'Space': 'Space',
            'F1': 'F1',
            'Equal': '+',
            'Minus': '-',
            'Slash': '?',
            'Digit0': '0',
            'Digit1': '1',
            'Digit2': '2',
            'Digit3': '3',
            'Digit4': '4'
        };
        
        if (key.startsWith('Key')) {
            display += key.replace('Key', '');
        } else if (key.startsWith('Digit')) {
            display += key.replace('Digit', '');
        } else {
            display += keyMap[key] || key;
        }
        
        return display;
    }
}

// Touch and mobile support
export class TouchSupport {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.touchState = {
            touches: new Map(),
            lastTap: 0,
            tapCount: 0
        };
        
        this.initializeTouchEvents();
        this.optimizeForMobile();
    }
    
    initializeTouchEvents() {
        const canvas = this.game.canvas;
        
        // Prevent default touch behaviors
        canvas.addEventListener('touchstart', (e) => e.preventDefault());
        canvas.addEventListener('touchmove', (e) => e.preventDefault());
        canvas.addEventListener('touchend', (e) => e.preventDefault());
        
        // Touch event handlers
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }
    
    handleTouchStart(e) {
        const touches = e.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            this.touchState.touches.set(touch.identifier, {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now()
            });
        }
        
        if (touches.length === 1) {
            this.handleSingleTouchStart(touches[0]);
        } else if (touches.length === 2) {
            this.handleTwoTouchStart(touches);
        }
    }
    
    handleTouchMove(e) {
        const touches = e.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const touchData = this.touchState.touches.get(touch.identifier);
            if (touchData) {
                touchData.currentX = touch.clientX;
                touchData.currentY = touch.clientY;
            }
        }
        
        if (this.touchState.touches.size === 1) {
            this.handleSingleTouchMove(touches[0]);
        } else if (this.touchState.touches.size === 2) {
            this.handleTwoTouchMove();
        }
    }
    
    handleTouchEnd(e) {
        const touches = e.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const touchData = this.touchState.touches.get(touch.identifier);
            
            if (touchData) {
                const duration = Date.now() - touchData.startTime;
                const distance = Math.sqrt(
                    Math.pow(touch.clientX - touchData.startX, 2) +
                    Math.pow(touch.clientY - touchData.startY, 2)
                );
                
                // Detect tap vs drag
                if (duration < 300 && distance < 10) {
                    this.handleTap(touch);
                }
                
                this.touchState.touches.delete(touch.identifier);
            }
        }
    }
    
    handleSingleTouchStart(touch) {
        // Start drawing mode
        this.game.mouse.isDrawing = true;
        this.simulateMouseEvent('mousedown', touch);
    }
    
    handleSingleTouchMove(touch) {
        if (this.game.mouse.isDrawing) {
            this.simulateMouseEvent('mousemove', touch);
        }
    }
    
    handleTwoTouchStart(touches) {
        // Initialize pinch-to-zoom
        this.touchState.pinchDistance = this.getTouchDistance(touches[0], touches[1]);
        this.touchState.pinchCenter = this.getTouchCenter(touches[0], touches[1]);
        this.touchState.initialZoom = this.game.camera.zoom;
    }
    
    handleTwoTouchMove() {
        const touchArray = Array.from(this.touchState.touches.values());
        if (touchArray.length !== 2) return;
        
        const currentDistance = this.getTouchDistance(
            { clientX: touchArray[0].currentX, clientY: touchArray[0].currentY },
            { clientX: touchArray[1].currentX, clientY: touchArray[1].currentY }
        );
        
        const scale = currentDistance / this.touchState.pinchDistance;
        const newZoom = Math.max(0.25, Math.min(4, this.touchState.initialZoom * scale));
        
        this.game.camera.zoom = newZoom;
        this.game.draw();
        this.game.updateZoomInfo();
    }
    
    handleTap(touch) {
        const now = Date.now();
        
        if (now - this.touchState.lastTap < 300) {
            this.touchState.tapCount++;
        } else {
            this.touchState.tapCount = 1;
        }
        
        this.touchState.lastTap = now;
        
        // Double tap to zoom
        if (this.touchState.tapCount === 2) {
            this.handleDoubleTap(touch);
        } else {
            // Single tap to draw
            setTimeout(() => {
                if (this.touchState.tapCount === 1) {
                    this.simulateMouseEvent('click', touch);
                }
            }, 300);
        }
    }
    
    handleDoubleTap(touch) {
        // Zoom in on double tap
        const rect = this.game.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const worldCoords = this.game.camera.screenToWorld(x, y);
        
        // Zoom in by 2x
        const oldZoom = this.game.camera.zoom;
        this.game.camera.zoom = Math.min(4, oldZoom * 2);
        
        // Adjust camera to keep touch point centered
        this.game.camera.x = worldCoords.x - x / this.game.camera.zoom;
        this.game.camera.y = worldCoords.y - y / this.game.camera.zoom;
        
        this.game.draw();
        this.game.updateZoomInfo();
    }
    
    simulateMouseEvent(type, touch) {
        const rect = this.game.canvas.getBoundingClientRect();
        const event = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0,
            preventDefault: () => {},
            target: this.game.canvas
        };
        
        switch (type) {
            case 'mousedown':
                this.game.handleMouseDown(event);
                break;
            case 'mousemove':
                this.game.handleMouseMove(event);
                break;
            case 'click':
                this.game.drawCell(event);
                break;
        }
    }
    
    getTouchDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
    
    getTouchCenter(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
    
    optimizeForMobile() {
        // Add mobile-specific styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .controls {
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .controls button {
                    min-height: 44px;
                    min-width: 44px;
                    font-size: 14px;
                    padding: 8px 12px;
                }
                
                .pattern-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                    gap: 5px;
                }
                
                .team-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 8px;
                }
                
                .modal-content {
                    margin: 5% auto;
                    width: 95%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .instructions {
                    font-size: 12px;
                    text-align: center;
                }
            }
            
            @media (hover: none) {
                .controls button:hover {
                    background-color: #333;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Add viewport meta tag if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        }
    }
}
