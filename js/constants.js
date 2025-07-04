// Game constants and configurations

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const CELL_SIZE = 10;
export const DEFAULT_GRID_WIDTH = 80;
export const DEFAULT_GRID_HEIGHT = 60;
export const FADE_IN_DURATION = 5;
export const DEFAULT_SPEED = 10;

// Camera settings
export const CAMERA_CONFIG = {
    minZoom: 0.25,
    maxZoom: 4,
    zoomDelta: {
        in: 1.1,
        out: 0.9
    }
};

// Team colors
export const TEAM_COLORS = {
    0: '#ffffff', // White for no team
    1: '#ff4444', // Red
    2: '#4444ff', // Blue
    3: '#44ff44', // Green
    4: '#ffff44'  // Yellow
};

// Game formulas (B = birth, S = survive)
export const GAME_FORMULAS = {
    conway: { birth: [3], survive: [2, 3] },
    highlife: { birth: [3, 6], survive: [2, 3] },
    daynight: { birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
    seeds: { birth: [2], survive: [] },
    life34: { birth: [3, 4], survive: [3, 4] },
    diamoeba: { birth: [3, 5, 6, 7, 8], survive: [5, 6, 7, 8] },
    morley: { birth: [3, 6, 8], survive: [2, 4, 5] },
    anneal: { birth: [4, 6, 7, 8], survive: [3, 5, 6, 7, 8] }
};

// Default team configuration
export const DEFAULT_TEAM_CONFIG = {
    formula: 'conway',
    intelligence: 0.5,    // 0-1: How smart the team is at seeking/avoiding
    aggressiveness: 0.5,  // 0-1: How likely to convert enemy cells
    fear: 0.5,           // 0-1: Tendency to avoid larger teams
    multiplyRate: 1.0,   // 0.5-2: Multiplication speed modifier
    herdRate: 0.5        // 0-1: How closely cells stick together
};

// Field size constraints
export const FIELD_SIZE = {
    min: 50,
    max: 500,
    step: 10
};

// GIF recording defaults
export const GIF_DEFAULTS = {
    generations: 100,
    frameRate: 10,
    quality: 10,
    scale: 0.5,
    captureInterval: 1
};