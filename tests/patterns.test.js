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
            
            // Should default to team 1
            let team1Count = 0;
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (grid[i][j] === 1) team1Count++;
                }
            }
            
            expect(team1Count).toBe(3);
        });
    });

    describe('Pattern Definitions', () => {
        test('should have valid glider pattern', () => {
            expect(PATTERNS.glider).toBeDefined();
            expect(Array.isArray(PATTERNS.glider)).toBe(true);
            expect(PATTERNS.glider.length).toBeGreaterThan(0);
            
            // Each row should be an array
            PATTERNS.glider.forEach(row => {
                expect(Array.isArray(row)).toBe(true);
            });
        });

        test('should have valid blinker pattern', () => {
            expect(PATTERNS.blinker).toBeDefined();
            expect(Array.isArray(PATTERNS.blinker)).toBe(true);
            
            // Blinker should be 1x3 or 3x1
            const pattern = PATTERNS.blinker;
            const totalCells = pattern.flat().filter(cell => cell === 1).length;
            expect(totalCells).toBe(3);
        });

        test('should have consistent pattern format', () => {
            Object.values(PATTERNS).forEach(pattern => {
                expect(Array.isArray(pattern)).toBe(true);
                
                // Each pattern should be rectangular (all rows same length)
                if (pattern.length > 0) {
                    const firstRowLength = pattern[0].length;
                    pattern.forEach(row => {
                        expect(row.length).toBe(firstRowLength);
                    });
                    
                    // Should only contain 0s and 1s
                    pattern.forEach(row => {
                        row.forEach(cell => {
                            expect([0, 1]).toContain(cell);
                        });
                    });
                }
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
