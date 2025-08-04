/**
 * Core Game Logic Tests
 * Tests the fundamental Conway's Game of Life rules and team interactions
 */

import { GameOfLife } from '../js/game.js';

// Mock all the dependencies
jest.mock('../js/constants.js', () => ({
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    CELL_SIZE: 10,
    DEFAULT_GRID_WIDTH: 80,
    DEFAULT_GRID_HEIGHT: 60,
    FADE_IN_DURATION: 5,
    DEFAULT_SPEED: 10,
    TEAM_COLORS: {
        0: '#ffffff',
        1: '#ff4444',
        2: '#4444ff',
        3: '#44ff44',
        4: '#ffff44'
    },
    GAME_FORMULAS: {
        conway: { birth: [3], survive: [2, 3] }
    }
}));

jest.mock('../js/camera.js', () => ({
    Camera: jest.fn().mockImplementation(() => ({
        x: 0,
        y: 0,
        zoom: 1,
        reset: jest.fn(),
        startPan: jest.fn(),
        updatePan: jest.fn(),
        endPan: jest.fn(),
        handleZoom: jest.fn(),
        screenToWorld: jest.fn((x, y) => ({ x, y })),
        getVisibleBounds: jest.fn(() => ({
            startX: 0,
            startY: 0,
            endX: 80,
            endY: 60
        })),
        getZoomPercentage: jest.fn(() => 100),
        mouse: { isPanning: false }
    }))
}));

// Mock other dependencies with minimal implementations
const mockDependencies = [
    'teamConfig', 'gifRecorder', 'gifShowcase', 'help', 'pixelFont',
    'patterns', 'advancedAI', 'analytics', 'performance', 'saveLoad',
    'errorHandling', 'keyboard'
].forEach(dep => {
    jest.mock(`../js/${dep}.js`, () => ({}));
});

describe('GameOfLife Core Logic', () => {
    let game;

    beforeEach(() => {
        // Reset DOM mocks
        document.getElementById.mockImplementation((id) => {
            const mockElement = {
                textContent: '',
                value: '',
                style: { display: 'none' },
                addEventListener: jest.fn(),
                innerHTML: ''
            };
            
            if (id === 'gameCanvas') {
                return {
                    ...mockElement,
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
                    getBoundingClientRect: jest.fn(() => ({
                        left: 0, top: 0, width: 800, height: 600
                    }))
                };
            }
            return mockElement;
        });

        document.querySelectorAll.mockReturnValue([]);
        
        game = new GameOfLife();
    });

    describe('Grid Management', () => {
        test('should create empty grid with correct dimensions', () => {
            const grid = game.createGrid();
            expect(grid).toHaveLength(60); // DEFAULT_GRID_HEIGHT
            expect(grid[0]).toHaveLength(80); // DEFAULT_GRID_WIDTH
            expect(grid[0][0]).toBe(0);
        });

        test('should clear grid and reset generation', () => {
            // Set up some cells
            game.grid[5][5] = 1;
            game.grid[5][6] = 2;
            game.generation = 10;

            game.clear();

            expect(game.grid[5][5]).toBe(0);
            expect(game.grid[5][6]).toBe(0);
            expect(game.generation).toBe(0);
        });
    });

    describe('Neighbor Counting', () => {
        test('should count neighbors correctly', () => {
            // Create a simple pattern
            game.grid[5][5] = 1;
            game.grid[5][6] = 1;
            game.grid[6][5] = 1;

            const neighbors = game.countNeighbors(5, 5);
            expect(neighbors.count).toBe(2);
        });

        test('should identify dominant team', () => {
            // Set up mixed neighbors
            game.grid[4][4] = 1; // Red team
            game.grid[4][5] = 1; // Red team
            game.grid[4][6] = 2; // Blue team
            game.grid[5][4] = 1; // Red team

            const neighbors = game.countNeighbors(5, 5);
            expect(neighbors.dominantTeam).toBe(1); // Red should dominate (3 vs 1)
            expect(neighbors.teamCounts[1]).toBe(3);
            expect(neighbors.teamCounts[2]).toBe(1);
        });

        test('should handle edge cases at grid boundaries', () => {
            const neighbors = game.countNeighbors(0, 0);
            expect(neighbors.count).toBe(0);
            expect(neighbors.dominantTeam).toBe(0);
        });
    });

    describe('Conway\'s Game of Life Rules', () => {
        test('should apply birth rule correctly', () => {
            // Set up exactly 3 neighbors for birth
            game.grid[4][5] = 1;
            game.grid[5][4] = 1;
            game.grid[5][6] = 1;
            
            game.update();
            
            // Cell at (5,5) should be born
            expect(game.grid[5][5]).toBe(1);
        });

        test('should apply survival rules correctly', () => {
            // Set up a cell with 2 neighbors (should survive)
            game.grid[5][5] = 1;
            game.grid[4][5] = 1;
            game.grid[5][4] = 1;
            
            const oldGeneration = game.generation;
            game.update();
            
            expect(game.grid[5][5]).toBe(1); // Should survive
            expect(game.generation).toBe(oldGeneration + 1);
        });

        test('should apply death rules correctly', () => {
            // Set up a cell with 1 neighbor (should die)
            game.grid[5][5] = 1;
            game.grid[4][5] = 1;
            
            game.update();
            
            expect(game.grid[5][5]).toBe(0); // Should die
        });
    });

    describe('Team Detection', () => {
        test('should detect single team', () => {
            game.grid[5][5] = 1;
            game.grid[5][6] = 1;
            
            expect(game.hasMultipleTeams()).toBe(false);
        });

        test('should detect multiple teams', () => {
            game.grid[5][5] = 1; // Red
            game.grid[5][6] = 2; // Blue
            
            expect(game.hasMultipleTeams()).toBe(true);
        });

        test('should handle empty grid', () => {
            expect(game.hasMultipleTeams()).toBe(false);
        });
    });

    describe('Pattern Loading', () => {
        test('should load random pattern', () => {
            // Mock Math.random to be predictable
            const originalRandom = Math.random;
            Math.random = jest.fn()
                .mockReturnValueOnce(0.1) // Should create cell
                .mockReturnValueOnce(0.3) // Should not create cell
                .mockReturnValue(0.8); // Should not create cell

            game.loadPattern('random');

            // Should have some cells but not all
            let cellCount = 0;
            for (let i = 0; i < game.gridHeight; i++) {
                for (let j = 0; j < game.gridWidth; j++) {
                    if (game.grid[i][j] > 0) cellCount++;
                }
            }
            expect(cellCount).toBeGreaterThan(0);

            Math.random = originalRandom;
        });
    });

    describe('Game State Management', () => {
        test('should toggle play state', () => {
            expect(game.running).toBe(false);
            
            game.togglePlay();
            expect(game.running).toBe(true);
            
            game.togglePlay();
            expect(game.running).toBe(false);
        });

        test('should update info correctly', () => {
            game.generation = 42;
            game.running = true;
            
            game.updateInfo();
            
            // Check that DOM updates were called
            expect(document.getElementById).toHaveBeenCalledWith('generation');
            expect(document.getElementById).toHaveBeenCalledWith('status');
        });
    });

    describe('Edge Cell Detection', () => {
        test('should find edge cells correctly', () => {
            // Create a 2x2 block - all should be edge cells
            game.grid[5][5] = 1;
            game.grid[5][6] = 1;
            game.grid[6][5] = 1;
            game.grid[6][6] = 1;
            
            const edgeCells = game.findEdgeCells(1);
            expect(edgeCells).toHaveLength(4);
        });

        test('should not find edge cells in completely surrounded areas', () => {
            // Create a cell completely surrounded by same team
            for (let i = 4; i <= 6; i++) {
                for (let j = 4; j <= 6; j++) {
                    game.grid[i][j] = 1;
                }
            }
            
            const edgeCells = game.findEdgeCells(1);
            // Only outer cells should be edge cells, center should not
            const centerCell = edgeCells.find(cell => cell.x === 5 && cell.y === 5);
            expect(centerCell).toBeUndefined();
        });
    });
});
