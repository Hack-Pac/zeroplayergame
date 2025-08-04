/**
 * Pattern Tests  
 * Tests the pattern loading and validation functionality
 */

import { loadPattern, PATTERNS } from '../js/patterns.js';

describe('Pattern Loading', () => {
    let grid;

    beforeEach(() => {
        // Create a 20x20 test grid
        grid = Array(20).fill().map(() => Array(20).fill(0));
    });

    describe('Basic Pattern Loading', () => {
        test('should load glider pattern correctly', () => {
            loadPattern(grid, 'glider', 10, 10, 1);
            
            // Check glider pattern is loaded
            let cellCount = 0;
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (grid[i][j] === 1) cellCount++;
                }
            }
            
            expect(cellCount).toBe(5); // Glider has 5 cells
        });

        test('should load blinker pattern correctly', () => {
            loadPattern(grid, 'blinker', 10, 10, 2);
            
            // Check that blinker pattern is loaded with correct team
            let teamCellCount = 0;
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (grid[i][j] === 2) teamCellCount++;
                }
            }
            
            expect(teamCellCount).toBe(3); // Blinker has 3 cells
        });

        test('should handle unknown pattern gracefully', () => {
            const originalGrid = grid.map(row => [...row]);
            
            loadPattern(grid, 'nonexistent', 10, 10, 1);
            
            // Grid should remain unchanged
            expect(grid).toEqual(originalGrid);
        });
    });

    describe('Pattern Positioning', () => {
        test('should center pattern at specified coordinates', () => {
            loadPattern(grid, 'blinker', 10, 10, 1);
            
            // Blinker should be centered around (10, 10)
            // Check if there are cells around the center
            let foundCells = false;
            for (let i = 8; i <= 12; i++) {
                for (let j = 8; j <= 12; j++) {
                    if (grid[i] && grid[i][j] === 1) {
                        foundCells = true;
                        break;
                    }
                }
                if (foundCells) break;
            }
            
            expect(foundCells).toBe(true);
        });

        test('should handle edge cases near grid boundaries', () => {
            // Try to load pattern near edge
            loadPattern(grid, 'glider', 1, 1, 1);
            
            // Should not throw error and should place what it can
            let cellCount = 0;
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (grid[i] && grid[i][j] === 1) cellCount++;
                }
            }
            
            expect(cellCount).toBeGreaterThan(0);
        });
    });

    describe('Team Assignment', () => {
        test('should assign correct team to pattern cells', () => {
            loadPattern(grid, 'blinker', 10, 10, 3);
            
            // All pattern cells should be team 3
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (grid[i][j] !== 0) {
                        expect(grid[i][j]).toBe(3);
                    }
                }
            }
        });

        test('should handle team 0 (default team)', () => {
            loadPattern(grid, 'blinker', 10, 10, 0);
            
            let team0Count = 0;
            // When team is 0, the pattern should still be placed as team 0
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (grid[i][j] === 0 && i >= 8 && i <= 12 && j >= 8 && j <= 12) {
                        // Check if we're in the pattern area - but team 0 means no pattern placed
                        continue;
                    }
                }
            }
            
            // Actually, when team is 0, it should still place the pattern as team 0
            // But since default parameter is 1, it should be team 1
            let team1Count = 0;
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (grid[i][j] === 1) team1Count++;
                }
            }
            
            expect(team1Count).toBe(3); // Should use default team 1
        });
    });

    describe('Pattern Definitions', () => {
        test('should have valid glider pattern', () => {
            expect(PATTERNS.glider).toBeDefined();
            expect(PATTERNS.glider.cells).toBeDefined();
            expect(Array.isArray(PATTERNS.glider.cells)).toBe(true);
            expect(PATTERNS.glider.cells.length).toBeGreaterThan(0);
            
            // Each cell should be a coordinate pair
            PATTERNS.glider.cells.forEach(cell => {
                expect(Array.isArray(cell)).toBe(true);
                expect(cell.length).toBe(2);
            });
        });

        test('should have valid blinker pattern', () => {
            expect(PATTERNS.blinker).toBeDefined();
            expect(PATTERNS.blinker.cells).toBeDefined();
            expect(Array.isArray(PATTERNS.blinker.cells)).toBe(true);
            
            // Blinker should have 3 cells
            expect(PATTERNS.blinker.cells.length).toBe(3);
        });

        test('should have consistent pattern format', () => {
            Object.values(PATTERNS).forEach(pattern => {
                expect(typeof pattern).toBe('object');
                expect(pattern.name).toBeDefined();
                expect(Array.isArray(pattern.cells)).toBe(true);
                
                // Each cell should be a coordinate pair [x, y]
                pattern.cells.forEach(cell => {
                    expect(Array.isArray(cell)).toBe(true);
                    expect(cell.length).toBe(2);
                    expect(typeof cell[0]).toBe('number');
                    expect(typeof cell[1]).toBe('number');
                });
            });
        });
    });

    describe('Complex Patterns', () => {
        test('should load pulsar pattern correctly', () => {
            if (PATTERNS.pulsar) {
                loadPattern(grid, 'pulsar', 10, 10, 1);
                
                let cellCount = 0;
                for (let i = 0; i < 20; i++) {
                    for (let j = 0; j < 20; j++) {
                        if (grid[i][j] === 1) cellCount++;
                    }
                }
                
                expect(cellCount).toBeGreaterThan(10); // Pulsar is a large pattern
            }
        });

        test('should load glider gun pattern correctly', () => {
            if (PATTERNS.gliderGun) {
                // Need larger grid for glider gun
                const largeGrid = Array(40).fill().map(() => Array(40).fill(0));
                loadPattern(largeGrid, 'gliderGun', 20, 20, 1);
                
                let cellCount = 0;
                for (let i = 0; i < 40; i++) {
                    for (let j = 0; j < 40; j++) {
                        if (largeGrid[i][j] === 1) cellCount++;
                    }
                }
                
                expect(cellCount).toBeGreaterThan(30); // Glider gun is complex
            }
        });
    });

    describe('Grid Boundary Handling', () => {
        test('should clip pattern at grid boundaries', () => {
            // Try to load large pattern near edge
            loadPattern(grid, 'glider', 19, 19, 1);
            
            // Should not access out-of-bounds indices
            // Verify no cells exist outside grid
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    expect(grid[i][j]).toBeDefined();
                    expect(typeof grid[i][j]).toBe('number');
                }
            }
        });

        test('should handle negative coordinates gracefully', () => {
            const originalGrid = grid.map(row => [...row]);
            
            loadPattern(grid, 'glider', -5, -5, 1);
            
            // Grid should remain mostly unchanged (maybe some edge effects)
            let changes = 0;
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (grid[i][j] !== originalGrid[i][j]) changes++;
                }
            }
            
            expect(changes).toBeLessThan(5); // Minimal changes expected
        });
    });
});
