// Error handling and validation utilities

export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.initializeGlobalHandler();
    }
    
    initializeGlobalHandler() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
        });
    }
    
    logError(type, error, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            type: type,
            message: error.message || error.toString(),
            stack: error.stack,
            context: context
        };
        
        this.errors.push(errorEntry);
        
        // Limit error history
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        console.error(`[${type}]`, error, context);
        
        // Show user-friendly message for critical errors
        if (this.isCriticalError(error)) {
            this.showUserError('A critical error occurred. Please refresh the page.');
        }
    }
    
    isCriticalError(error) {
        const criticalPatterns = [
            /out of memory/i,
            /maximum call stack/i,
            /network error/i
        ];
        
        return criticalPatterns.some(pattern => 
            pattern.test(error.message || error.toString())
        );
    }
    
    showUserError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close">&times;</button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 4px;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds or on click
        const removeError = () => errorDiv.remove();
        errorDiv.querySelector('.error-close').addEventListener('click', removeError);
        setTimeout(removeError, 10000);
    }
    
    getErrorReport() {
        return {
            errors: this.errors,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
    }
    
    exportErrorLog() {
        const report = this.getErrorReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString().slice(0, 16)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

export class InputValidator {
    static validateGridSize(width, height) {
        const errors = [];
        
        if (!Number.isInteger(width) || width < 10 || width > 1000) {
            errors.push('Width must be an integer between 10 and 1000');
        }
        
        if (!Number.isInteger(height) || height < 10 || height > 1000) {
            errors.push('Height must be an integer between 10 and 1000');
        }
        
        if (width * height > 500000) {
            errors.push('Grid too large. Maximum 500,000 cells allowed');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    static validateSpeed(speed) {
        const errors = [];
        
        if (!Number.isInteger(speed) || speed < 1 || speed > 100) {
            errors.push('Speed must be an integer between 1 and 100');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    static validateTeamConfig(config) {
        const errors = [];
        
        const requiredFields = ['intelligence', 'aggressiveness', 'fear', 'multiplyRate', 'herdRate'];
        for (const field of requiredFields) {
            if (typeof config[field] !== 'number' || config[field] < 0 || config[field] > 2) {
                errors.push(`${field} must be a number between 0 and 2`);
            }
        }
        
        if (!config.formula || typeof config.formula !== 'string') {
            errors.push('Formula must be a valid string');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    static validateSaveData(saveData) {
        const errors = [];
        
        const requiredFields = ['name', 'grid', 'gridWidth', 'gridHeight'];
        for (const field of requiredFields) {
            if (!saveData[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        if (saveData.grid && (!Array.isArray(saveData.grid) || !Array.isArray(saveData.grid[0]))) {
            errors.push('Grid must be a 2D array');
        }
        
        if (saveData.gridWidth && saveData.gridHeight && saveData.grid) {
            if (saveData.grid.length !== saveData.gridHeight || 
                saveData.grid[0].length !== saveData.gridWidth) {
                errors.push('Grid dimensions do not match specified width/height');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    static sanitizeInput(input, type = 'string') {
        switch (type) {
            case 'string':
                return String(input).trim().slice(0, 100); // Limit length
            case 'number':
                const num = Number(input);
                return isNaN(num) ? 0 : num;
            case 'boolean':
                return Boolean(input);
            default:
                return input;
        }
    }
}

export class MemoryManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.memoryCheckInterval = 30000; // Check every 30 seconds
        this.maxHistoryLength = 1000;
        this.startMemoryMonitoring();
    }
    
    startMemoryMonitoring() {
        setInterval(() => {
            this.checkMemoryUsage();
        }, this.memoryCheckInterval);
    }
    
    checkMemoryUsage() {
        // Clean up old analytics data
        if (this.game.analytics) {
            this.cleanupAnalyticsHistory();
        }
        
        // Clean up GIF showcase if too many items
        if (this.game.gifShowcaseManager) {
            this.cleanupGifShowcase();
        }
        
        // Force garbage collection if available (dev mode)
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
    }
    
    cleanupAnalyticsHistory() {
        const analytics = this.game.analytics;
        
        // Limit population history
        for (const team in analytics.populationHistory) {
            if (analytics.populationHistory[team].length > this.maxHistoryLength) {
                analytics.populationHistory[team] = analytics.populationHistory[team]
                    .slice(-this.maxHistoryLength);
            }
        }
        
        // Limit battle events
        if (analytics.battleEvents.length > this.maxHistoryLength) {
            analytics.battleEvents = analytics.battleEvents.slice(-this.maxHistoryLength);
        }
    }
    
    cleanupGifShowcase() {
        const showcase = this.game.gifShowcaseManager;
        const maxGifs = 20; // Reduce from default if memory is a concern
        
        if (showcase.gifs.length > maxGifs) {
            showcase.gifs = showcase.gifs.slice(0, maxGifs);
            showcase.saveToStorage();
        }
    }
    
    estimateMemoryUsage() {
        let estimate = 0;
        
        // Grid memory
        estimate += this.game.gridWidth * this.game.gridHeight * 8; // Two grids (main + ages)
        
        // Analytics memory
        if (this.game.analytics) {
            for (const team in this.game.analytics.populationHistory) {
                estimate += this.game.analytics.populationHistory[team].length * 8;
            }
            estimate += this.game.analytics.battleEvents.length * 50; // Rough estimate per event
        }
        
        // GIF showcase memory (rough estimate)
        if (this.game.gifShowcaseManager) {
            estimate += this.game.gifShowcaseManager.gifs.length * 100000; // ~100KB per GIF
        }
        
        return Math.round(estimate / 1024 / 1024 * 100) / 100; // Convert to MB
    }
    
    getMemoryRecommendations() {
        const usage = this.estimateMemoryUsage();
        const recommendations = [];
        
        if (usage > 100) {
            recommendations.push('High memory usage detected. Consider clearing analytics history.');
        }
        
        if (this.game.gridWidth * this.game.gridHeight > 100000) {
            recommendations.push('Large grid size may impact performance. Consider reducing field size.');
        }
        
        if (this.game.analytics && this.game.analytics.populationHistory[1].length > 500) {
            recommendations.push('Analytics history is large. Consider clearing or reducing retention.');
        }
        
        return recommendations;
    }
}
