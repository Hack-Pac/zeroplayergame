// Test setup file - runs before all tests
// Mock browser APIs for testing

// Mock canvas context
const mockCanvas = {
    getContext: jest.fn(() => ({
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        scale: jest.fn(),
        translate: jest.fn()
    })),
    width: 800,
    height: 600,
    style: { cursor: 'default' },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600
    }))
};

// Mock DOM methods
global.document = {
    getElementById: jest.fn((id) => {
        if (id === 'gameCanvas') {
            return mockCanvas;
        }
        return {
            textContent: '',
            value: '',
            style: { display: 'none' },
            addEventListener: jest.fn(),
            innerHTML: '',
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(() => [])
        };
    }),
    querySelector: jest.fn(() => ({
        textContent: '',
        style: { display: 'none' }
    })),
    querySelectorAll: jest.fn(() => []),
    createElement: jest.fn(() => ({
        className: '',
        innerHTML: '',
        style: {},
        appendChild: jest.fn(),
        addEventListener: jest.fn()
    })),
    body: {
        appendChild: jest.fn()
    }
};

global.window = {
    performance: {
        now: jest.fn(() => Date.now())
    },
    localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
    },
    saveLoadManager: null
};

// Mock console to reduce test noise
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
