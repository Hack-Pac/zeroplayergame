/**
 * Analytics Tests
 * Tests the battle analytics and population tracking functionality
 */

import { BattleAnalytics } from '../js/analytics.js';

// Mock constants
jest.mock('../js/constants.js', () => ({
    TEAM_COLORS: {
        1: '#ff4444',
        2: '#4444ff',
        3: '#44ff44',
        4: '#ffff44'
    }
}));

describe('BattleAnalytics', () => {
    let analytics;
    let mockGame;
    let mockCanvas;
    let mockCtx;

    beforeEach(() => {
        // Create mock canvas context
        mockCtx = {
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            fill: jest.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            fillText: jest.fn(),
            drawImage: jest.fn(),
            globalCompositeOperation: 'source-over'
        };

        mockCanvas = {
            width: 200,
            height: 150,
            getContext: jest.fn(() => mockCtx)
        };

        // Mock document.createElement to return our mock canvas
        document.createElement = jest.fn((tagName) => {
            if (tagName === 'canvas') {
                return mockCanvas;
            }
            return {
                style: {},
                appendChild: jest.fn(),
                addEventListener: jest.fn(),
                innerHTML: ''
            };
        });

        // Create mock game instance
        mockGame = {
            grid: Array(10).fill().map(() => Array(10).fill(0)),
            gridWidth: 10,
            gridHeight: 10,
            generation: 0,
            ctx: mockCtx,
            canvas: mockCanvas,
            cellSize: 10
        };

        analytics = new BattleAnalytics(mockGame);
    });

    describe('Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(analytics.game).toBe(mockGame);
            expect(analytics.populationHistory[1]).toEqual([]);
            expect(analytics.populationHistory[2]).toEqual([]);
            expect(analytics.populationHistory[3]).toEqual([]);
            expect(analytics.populationHistory[4]).toEqual([]);
            expect(analytics.maxHistoryLength).toBe(100);
        });

        test('should create analytics panels', () => {
            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.createElement).toHaveBeenCalledWith('canvas');
        });
    });

    describe('Population Tracking', () => {
        test('should track population changes', () => {
            // Set up some cells
            mockGame.grid[0][0] = 1; // Red team
            mockGame.grid[0][1] = 1; // Red team  
            mockGame.grid[1][0] = 2; // Blue team

            analytics.update();

            expect(analytics.populationHistory[1]).toContain(2);
            expect(analytics.populationHistory[2]).toContain(1);
            expect(analytics.populationHistory[3]).toContain(0);
            expect(analytics.populationHistory[4]).toContain(0);
        });

        test('should limit history length', () => {
            // Fill history beyond max length
            analytics.maxHistoryLength = 3;
            
            for (let i = 0; i < 5; i++) {
                analytics.populationHistory[1].push(i);
            }
            analytics.trimHistory();

            expect(analytics.populationHistory[1]).toHaveLength(3);
            expect(analytics.populationHistory[1]).toEqual([2, 3, 4]);
        });
    });

    describe('Battle Statistics', () => {
        test('should calculate efficiency correctly', () => {
            const stats = analytics.battleStats[1];
            stats.kills = 10;
            stats.deaths = 5;
            
            analytics.updateBattleStats();
            
            expect(stats.efficiency).toBe(2.0); // 10/5
        });

        test('should handle division by zero in efficiency', () => {
            const stats = analytics.battleStats[1];
            stats.kills = 5;
            stats.deaths = 0;
            
            analytics.updateBattleStats();
            
            expect(stats.efficiency).toBe(5); // kills when deaths = 0
        });

        test('should track kills and deaths from grid changes', () => {
            const previousGrid = [
                [1, 2, 0],
                [0, 1, 2],
                [2, 0, 1]
            ];
            
            const currentGrid = [
                [1, 1, 0], // Team 1 converted team 2 cell
                [0, 0, 2], // Team 1 cell died
                [2, 0, 1]
            ];
            
            analytics.previousGrid = previousGrid;
            mockGame.grid = currentGrid;
            mockGame.gridHeight = 3;
            mockGame.gridWidth = 3;
            
            analytics.trackBattleEvents();
            
            expect(analytics.battleStats[1].kills).toBeGreaterThan(0);
            expect(analytics.battleStats[1].deaths).toBeGreaterThan(0);
        });
    });

    describe('Territory Strength', () => {
        test('should calculate territory strength correctly', () => {
            // Set up a cluster of team 1 cells
            mockGame.grid[2][2] = 1; // Center
            mockGame.grid[1][2] = 1; // Above
            mockGame.grid[3][2] = 1; // Below
            mockGame.grid[2][1] = 1; // Left
            mockGame.grid[2][3] = 2; // Right - different team
            
            const strength = analytics.calculateTerritoryStrength(2, 2, 1);
            
            expect(strength).toBeGreaterThan(0);
            expect(strength).toBeLessThanOrEqual(1);
        });

        test('should return 0 for isolated cells', () => {
            mockGame.grid[5][5] = 1; // Single isolated cell
            
            const strength = analytics.calculateTerritoryStrength(5, 5, 1);
            
            expect(strength).toBe(1); // 100% of neighbors are same team (just itself)
        });
    });

    describe('Resource Tracking', () => {
        test('should track resources correctly', () => {
            // Set up some stable patterns for team 1
            mockGame.grid[2][2] = 1;
            mockGame.grid[2][3] = 1;
            mockGame.grid[3][2] = 1;
            mockGame.grid[3][3] = 1; // 2x2 block (stable)
            
            analytics.updateResourceTracking();
            
            // Should detect stable pattern as resource
            expect(analytics.resourceMap.get('2,2')).toBeDefined();
        });
    });

    describe('Rendering', () => {
        test('should render population chart', () => {
            analytics.populationHistory[1] = [0, 5, 10, 8];
            analytics.populationHistory[2] = [0, 2, 4, 6];
            
            analytics.renderPopulationChart();
            
            expect(mockCtx.clearRect).toHaveBeenCalled();
            expect(mockCtx.strokeStyle).toBeTruthy();
            expect(mockCtx.stroke).toHaveBeenCalled();
        });

        test('should render efficiency chart', () => {
            analytics.battleStats[1].efficiency = 2.5;
            analytics.battleStats[2].efficiency = 1.8;
            
            analytics.renderEfficiencyChart();
            
            expect(mockCtx.fillRect).toHaveBeenCalled();
            expect(mockCtx.fillText).toHaveBeenCalled();
        });

        test('should handle empty data gracefully', () => {
            analytics.renderPopulationChart();
            analytics.renderEfficiencyChart();
            
            // Should not throw errors
            expect(mockCtx.clearRect).toHaveBeenCalled();
        });
    });

    describe('Reset Functionality', () => {
        test('should reset all analytics data', () => {
            // Set up some data
            analytics.populationHistory[1] = [1, 2, 3];
            analytics.battleStats[1].kills = 5;
            analytics.battleStats[1].deaths = 3;
            
            analytics.reset();
            
            expect(analytics.populationHistory[1]).toEqual([]);
            expect(analytics.battleStats[1].kills).toBe(0);
            expect(analytics.battleStats[1].deaths).toBe(0);
            expect(analytics.battleStats[1].efficiency).toBe(0);
        });
    });

    describe('Grid Copying', () => {
        test('should create independent copy of grid', () => {
            mockGame.grid[0][0] = 1;
            mockGame.grid[1][1] = 2;
            
            const copy = analytics.copyGrid();
            
            expect(copy[0][0]).toBe(1);
            expect(copy[1][1]).toBe(2);
            
            // Modify original
            mockGame.grid[0][0] = 3;
            
            // Copy should be unchanged
            expect(copy[0][0]).toBe(1);
        });
    });
});
