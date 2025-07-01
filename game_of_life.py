import pygame
import numpy as np
import sys
from enum import Enum

class Pattern(Enum):
    RANDOM = "Random"
    GLIDER = "Glider"
    BLINKER = "Blinker"
    TOAD = "Toad"
    BEACON = "Beacon"
    PULSAR = "Pulsar"
    GOSPER_GLIDER_GUN = "Gosper Glider Gun"

class GameOfLife:
    def __init__(self, width=800, height=600, cell_size=10):
        self.width = width
        self.height = height
        self.cell_size = cell_size
        self.grid_width = width // cell_size
        self.grid_height = height // cell_size
        
        self.grid = np.zeros((self.grid_height, self.grid_width), dtype=int)
        self.running = False
        self.generation = 0
        
        pygame.init()
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Conway's Game of Life - Zero Player Game")
        self.clock = pygame.time.Clock()
        
        self.BLACK = (0, 0, 0)
        self.WHITE = (255, 255, 255)
        self.GRAY = (128, 128, 128)
        self.GREEN = (0, 255, 0)
        
    def count_neighbors(self, x, y):
        count = 0
        for i in range(-1, 2):
            for j in range(-1, 2):
                if i == 0 and j == 0:
                    continue
                nx, ny = x + i, y + j
                if 0 <= nx < self.grid_height and 0 <= ny < self.grid_width:
                    count += self.grid[nx, ny]
        return count
    
    def update_grid(self):
        new_grid = np.zeros_like(self.grid)
        
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                neighbors = self.count_neighbors(i, j)
                
                if self.grid[i, j] == 1:
                    if neighbors in [2, 3]:
                        new_grid[i, j] = 1
                else:
                    if neighbors == 3:
                        new_grid[i, j] = 1
        
        self.grid = new_grid
        self.generation += 1
    
    def draw_grid(self):
        self.screen.fill(self.BLACK)
        
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                x = j * self.cell_size
                y = i * self.cell_size
                
                if self.grid[i, j] == 1:
                    pygame.draw.rect(self.screen, self.WHITE, 
                                   (x, y, self.cell_size - 1, self.cell_size - 1))
                else:
                    pygame.draw.rect(self.screen, self.GRAY, 
                                   (x, y, self.cell_size - 1, self.cell_size - 1), 1)
    
    def load_pattern(self, pattern):
        self.grid.fill(0)
        self.generation = 0
        
        if pattern == Pattern.RANDOM:
            self.grid = np.random.choice([0, 1], size=(self.grid_height, self.grid_width), p=[0.8, 0.2])
        
        elif pattern == Pattern.GLIDER:
            x, y = self.grid_height // 2, self.grid_width // 2
            glider = [(0, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
            for dx, dy in glider:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
        
        elif pattern == Pattern.BLINKER:
            x, y = self.grid_height // 2, self.grid_width // 2
            for i in range(3):
                if 0 <= x < self.grid_height and 0 <= y + i < self.grid_width:
                    self.grid[x, y + i] = 1
        
        elif pattern == Pattern.TOAD:
            x, y = self.grid_height // 2, self.grid_width // 2
            toad = [(0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (1, 2)]
            for dx, dy in toad:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
        
        elif pattern == Pattern.BEACON:
            x, y = self.grid_height // 2, self.grid_width // 2
            beacon = [(0, 0), (0, 1), (1, 0), (1, 1), (2, 2), (2, 3), (3, 2), (3, 3)]
            for dx, dy in beacon:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
        
        elif pattern == Pattern.PULSAR:
            x, y = self.grid_height // 2 - 6, self.grid_width // 2 - 6
            pulsar = [
                (0, 2), (0, 3), (0, 4), (0, 8), (0, 9), (0, 10),
                (2, 0), (2, 5), (2, 7), (2, 12),
                (3, 0), (3, 5), (3, 7), (3, 12),
                (4, 0), (4, 5), (4, 7), (4, 12),
                (5, 2), (5, 3), (5, 4), (5, 8), (5, 9), (5, 10),
                (7, 2), (7, 3), (7, 4), (7, 8), (7, 9), (7, 10),
                (8, 0), (8, 5), (8, 7), (8, 12),
                (9, 0), (9, 5), (9, 7), (9, 12),
                (10, 0), (10, 5), (10, 7), (10, 12),
                (12, 2), (12, 3), (12, 4), (12, 8), (12, 9), (12, 10)
            ]
            for dx, dy in pulsar:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
        
        elif pattern == Pattern.GOSPER_GLIDER_GUN:
            x, y = 10, 10
            gun = [
                (0, 24), (1, 22), (1, 24), (2, 12), (2, 13), (2, 20), (2, 21), (2, 34), (2, 35),
                (3, 11), (3, 15), (3, 20), (3, 21), (3, 34), (3, 35), (4, 0), (4, 1), (4, 10),
                (4, 16), (4, 20), (4, 21), (5, 0), (5, 1), (5, 10), (5, 14), (5, 16), (5, 17),
                (5, 22), (5, 24), (6, 10), (6, 16), (6, 24), (7, 11), (7, 15), (8, 12), (8, 13)
            ]
            for dx, dy in gun:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
    
    def draw_info(self):
        font = pygame.font.Font(None, 36)
        status = 'Running' if self.running else 'Paused'
        info_text = f"Generation: {self.generation} | {status}"
        text = font.render(info_text, True, self.GREEN)
        self.screen.blit(text, (10, 10))
        
        font_small = pygame.font.Font(None, 24)
        controls = [
            "Controls:",
            "SPACE - Play/Pause",
            "C - Clear grid",
            "R - Random pattern",
            "1-7 - Load patterns",
            "Left Click - Toggle cell",
            "ESC - Quit"
        ]
        
        y_offset = 50
        for control in controls:
            text = font_small.render(control, True, self.GREEN)
            self.screen.blit(text, (10, y_offset))
            y_offset += 25
    
    def handle_mouse_click(self, pos):
        x, y = pos
        grid_x = x // self.cell_size
        grid_y = y // self.cell_size
        
        if 0 <= grid_x < self.grid_width and 0 <= grid_y < self.grid_height:
            self.grid[grid_y, grid_x] = 1 - self.grid[grid_y, grid_x]
    
    def run(self):
        self.load_pattern(Pattern.RANDOM)
        
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        pygame.quit()
                        sys.exit()
                    
                    elif event.key == pygame.K_SPACE:
                        self.running = not self.running
                    
                    elif event.key == pygame.K_c:
                        self.grid.fill(0)
                        self.generation = 0
                        self.running = False
                    
                    elif event.key == pygame.K_r:
                        self.load_pattern(Pattern.RANDOM)
                    
                    elif event.key == pygame.K_1:
                        self.load_pattern(Pattern.GLIDER)
                    
                    elif event.key == pygame.K_2:
                        self.load_pattern(Pattern.BLINKER)
                    
                    elif event.key == pygame.K_3:
                        self.load_pattern(Pattern.TOAD)
                    
                    elif event.key == pygame.K_4:
                        self.load_pattern(Pattern.BEACON)
                    
                    elif event.key == pygame.K_5:
                        self.load_pattern(Pattern.PULSAR)
                    
                    elif event.key == pygame.K_6:
                        self.load_pattern(Pattern.GOSPER_GLIDER_GUN)
                
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if event.button == 1 and not self.running:
                        self.handle_mouse_click(event.pos)
            
            if self.running:
                self.update_grid()
            
            self.draw_grid()
            self.draw_info()
            pygame.display.flip()
            self.clock.tick(10)

if __name__ == "__main__":
    game = GameOfLife()
    game.run()