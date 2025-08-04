// Test setup file - runs before all tests
// Mock browser APIs for testing

// Mock canvas context
const mockCanvas = {
    getContext: () => ({
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        fillRect: () => {},
        strokeRect: () => {},
        clearRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        translate: () => {}
    }),
    width: 800,
    height: 600,
    style: { cursor: 'default' },
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600
    })
};

// Mock DOM methods
global.document = {
    getElementById: (id) => {
        if (id === 'gameCanvas') {
            return mockCanvas;
        }
        return {
            textContent: '',
            value: '',
            checked: false,
            style: { display: 'block' },
            addEventListener: () => {},
            removeEventListener: () => {}
        };
    },
    querySelectorAll: () => [],
    querySelector: () => ({
        textContent: '',
        value: '',
        style: { display: 'block' },
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {} }
    }),
    createElement: () => ({
        innerHTML: '',
        style: {},
        appendChild: () => {},
        addEventListener: () => {},
        classList: { add: () => {}, remove: () => {} }
    }),
    body: {
        appendChild: () => {}
    },
    addEventListener: () => {}
};

// Mock window
global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: (callback) => setTimeout(callback, 16),
    cancelAnimationFrame: () => {},
    performance: {
        now: () => Date.now()
    }
};

// Mock localStorage
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
};

// Mock console methods to reduce test noise
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args) => {
    // Only show warnings that aren't from our expected test scenarios
    if (!args.some(arg => typeof arg === 'string' && (
        arg.includes('WebWorker') || 
        arg.includes('Battle scenarios') ||
        arg.includes('Advanced AI')
    ))) {
        originalConsoleWarn(...args);
    }
};

console.error = (...args) => {
    // Only show errors that aren't from our expected test scenarios
    if (!args.some(arg => typeof arg === 'string' && (
        arg.includes('WebWorker') || 
        arg.includes('scenarios')
    ))) {
        originalConsoleError(...args);
    }
};
