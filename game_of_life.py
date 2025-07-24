import pygame
import numpy as np
import sys
import math
import random
from enum import Enum
import os

class Pattern(Enum):
    RANDOM = "Random"
    GLIDER = "Glider"
    BLINKER = "Blinker"
    TOAD = "Toad"
    BEACON = "Beacon"
    PULSAR = "Pulsar"
    GOSPER_GLIDER_GUN = "Gosper Glider Gun"

class SoundSystem:
    def __init__(self):
        pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)
        self.enabled = True
        self.volume = 0.3
        
        # Generate procedural sounds
        self.birth_sound = self.generate_birth_sound()
        self.death_sound = self.generate_death_sound()
        self.pattern_sound = self.generate_pattern_sound()
        
        # Ambient music generation
        self.ambient_playing = False
        self.last_population = 0
        
    def generate_birth_sound(self):
        """Generate a pleasant chime for cell birth"""
        duration = 0.3
        sample_rate = 22050
        frames = int(duration * sample_rate)
        
        # Create a pleasant chord (C major)
        frequencies = [523.25, 659.25, 783.99]  # C5, E5, G5
        sound_array = np.zeros(frames)
        
        for freq in frequencies:
            wave = np.sin(2 * np.pi * freq * np.linspace(0, duration, frames))
            # Apply envelope
            envelope = np.exp(-np.linspace(0, 3, frames))
            sound_array += wave * envelope * 0.3
        
        # Convert to pygame sound
        sound_array = np.array([sound_array, sound_array]).T
        sound_array = (sound_array * 32767).astype(np.int16)
        return pygame.sndarray.make_sound(sound_array)
    
    def generate_death_sound(self):
        """Generate a subtle pop for cell death"""
        duration = 0.15
        sample_rate = 22050
        frames = int(duration * sample_rate)
        
        # Create a dampened pop sound
        frequency = 150  # Low frequency
        wave = np.sin(2 * np.pi * frequency * np.linspace(0, duration, frames))
        
        # Sharp attack, quick decay
        envelope = np.exp(-np.linspace(0, 8, frames))
        sound_array = wave * envelope * 0.4
        
        # Convert to pygame sound
        sound_array = np.array([sound_array, sound_array]).T
        sound_array = (sound_array * 32767).astype(np.int16)
        return pygame.sndarray.make_sound(sound_array)
    
    def generate_pattern_sound(self):
        """Generate a magical sparkle for pattern loading"""
        duration = 0.8
        sample_rate = 22050
        frames = int(duration * sample_rate)
        
        # Create ascending sparkle
        base_freq = 440
        sound_array = np.zeros(frames)
        
        for i in range(5):
            freq = base_freq * (1.5 ** i)
            start_frame = i * frames // 8
            end_frame = start_frame + frames // 4
            
            if end_frame > frames:
                end_frame = frames
                
            wave_frames = end_frame - start_frame
            wave = np.sin(2 * np.pi * freq * np.linspace(0, wave_frames/sample_rate, wave_frames))
            envelope = np.exp(-np.linspace(0, 2, wave_frames))
            
            sound_array[start_frame:end_frame] += wave * envelope * 0.2
        
        # Convert to pygame sound
        sound_array = np.array([sound_array, sound_array]).T
        sound_array = (sound_array * 32767).astype(np.int16)
        return pygame.sndarray.make_sound(sound_array)
    
    def play_birth(self):
        if self.enabled:
            self.birth_sound.set_volume(self.volume)
            self.birth_sound.play()
    
    def play_death(self):
        if self.enabled:
            self.death_sound.set_volume(self.volume * 0.6)
            self.death_sound.play()
    
    def play_pattern_load(self):
        if self.enabled:
            self.pattern_sound.set_volume(self.volume * 0.8)
            self.pattern_sound.play()
    
    def update_ambient(self, population, max_population):
        """Update ambient sound based on population density"""
        if not self.enabled:
            return
            
        # Simple ambient drone that changes with population
        population_ratio = population / max(max_population, 1)
        
        # You could implement ambient music here
        # For now, we'll keep it simple
        pass
    
    def toggle_sound(self):
        self.enabled = not self.enabled
        if not self.enabled:
            pygame.mixer.stop()
    
    def set_volume(self, volume):
        self.volume = max(0.0, min(1.0, volume))

class Particle:
    def __init__(self, x, y, particle_type="birth"):
        self.x = x
        self.y = y
        self.vx = random.uniform(-2, 2)
        self.vy = random.uniform(-2, 2)
        self.life = 30
        self.max_life = 30
        self.size = random.uniform(2, 6)
        self.particle_type = particle_type
        
        if particle_type == "birth":
            self.color = (0, 255, 100)
        elif particle_type == "death":
            self.color = (255, 50, 50)
        else:
            self.color = (255, 255, 255)
    
    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.life -= 1
        self.vx *= 0.98  # Air resistance
        self.vy *= 0.98
        
        # Fade out
        alpha = self.life / self.max_life
        self.color = tuple(int(c * alpha) for c in self.color)
        self.size *= 0.98
        
        return self.life > 0
    
    def draw(self, screen):
        if self.life > 0:
            pygame.draw.circle(screen, self.color, 
                             (int(self.x), int(self.y)), 
                             max(1, int(self.size)))

class Trail:
    def __init__(self):
        self.points = []
        self.max_length = 20
    
    def add_point(self, x, y, color):
        self.points.append({
            'x': x, 'y': y, 'color': color, 'life': self.max_length
        })
        if len(self.points) > self.max_length:
            self.points.pop(0)
    
    def update(self):
        for point in self.points:
            point['life'] -= 1
        self.points = [p for p in self.points if p['life'] > 0]
    
    def draw(self, screen):
        for i, point in enumerate(self.points):
            alpha = point['life'] / self.max_length
            color = tuple(int(c * alpha) for c in point['color'])
            size = max(1, int(alpha * 3))
            pygame.draw.circle(screen, color, 
                             (point['x'], point['y']), size)

class GameOfLife:
    def __init__(self, width=800, height=600, cell_size=10):
        pygame.init()
        self.width = width
        self.height = height
        self.cell_size = cell_size
        self.cols = width // cell_size
        self.rows = height // cell_size
        
        # VFX Systems
        self.particles = []
        self.trails = {}
        self.cell_ages = np.zeros((self.rows, self.cols))
        self.dynamic_bg_time = 0
        
        # Sound System
        self.sound_system = SoundSystem()
        
        # Game state
        self.grid = np.zeros((self.rows, self.cols), dtype=int)
        self.next_grid = np.zeros((self.rows, self.cols), dtype=int)
        
        # Display
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Game of Life with VFX")
        self.clock = pygame.time.Clock()
        
        # Colors
        self.dead_color = (20, 20, 30)
        self.alive_color = (255, 255, 255)
        self.particle_colors = {
            'birth': (0, 255, 100),
            'death': (255, 50, 50),
            'stable': (100, 100, 255)
        }
        
        # Additional attributes from original class
        self.grid_width = self.cols
        self.grid_height = self.rows
        self.running = False
        self.generation = 0
        
        # Original colors for compatibility
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
        births = 0
        deaths = 0
        
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                neighbors = self.count_neighbors(i, j)
                old_state = self.grid[i, j]
                
                if old_state == 1:
                    if neighbors in [2, 3]:
                        new_grid[i, j] = 1
                        # Cell survives - increment age
                        self.cell_ages[i, j] += 1
                    else:
                        # Cell dies - create death particle
                        x = j * self.cell_size + self.cell_size // 2
                        y = i * self.cell_size + self.cell_size // 2
                        for _ in range(3):
                            self.particles.append(Particle(x, y, "death"))
                        self.cell_ages[i, j] = 0
                        deaths += 1
                else:
                    if neighbors == 3:
                        new_grid[i, j] = 1
                        # Cell born - create birth particle
                        x = j * self.cell_size + self.cell_size // 2
                        y = i * self.cell_size + self.cell_size // 2
                        for _ in range(5):
                            self.particles.append(Particle(x, y, "birth"))
                        self.cell_ages[i, j] = 1
                        births += 1
        
        # Play sounds based on activity (limit to prevent audio overload)
        if births > 0:
            # Play birth sound with probability based on birth count
            if random.random() < min(births / 10, 0.8):
                self.sound_system.play_birth()
        
        if deaths > 0:
            # Play death sound with probability based on death count
            if random.random() < min(deaths / 15, 0.6):
                self.sound_system.play_death()
        
        self.grid = new_grid
        self.generation += 1
        
        # Update ambient sound
        current_population = np.sum(self.grid)
        max_population = self.grid_width * self.grid_height
        self.sound_system.update_ambient(current_population, max_population)
    
    def draw_grid(self):
        # Dynamic background
        self.dynamic_bg_time += 0.02
        bg_intensity = 10 + 5 * math.sin(self.dynamic_bg_time)
        bg_color = (int(bg_intensity), int(bg_intensity), int(bg_intensity * 1.5))
        self.screen.fill(bg_color)
        
        # Draw cells with age-based coloring
        for i in range(self.grid_height):
            for j in range(self.grid_width):
                x = j * self.cell_size
                y = i * self.cell_size
                
                if self.grid[i, j] == 1:
                    # Age-based coloring
                    age = min(self.cell_ages[i, j], 50)
                    age_factor = age / 50
                    
                    # Color interpolation from young (green) to old (red)
                    red = int(255 * age_factor)
                    green = int(255 * (1 - age_factor * 0.5))
                    blue = int(100 * (1 - age_factor))
                    
                    color = (red, green, blue)
                    
                    # Pulsing effect for old cells
                    if age > 30:
                        pulse = 0.8 + 0.2 * math.sin(self.dynamic_bg_time * 5)
                        color = tuple(int(c * pulse) for c in color)
                    
                    pygame.draw.rect(self.screen, color, 
                                   (x, y, self.cell_size - 1, self.cell_size - 1))
                    
                    # Add trail
                    trail_key = (i, j)
                    if trail_key not in self.trails:
                        self.trails[trail_key] = Trail()
                    self.trails[trail_key].add_point(
                        x + self.cell_size // 2, 
                        y + self.cell_size // 2, 
                        color
                    )
                else:
                    # Draw grid lines for empty cells
                    pygame.draw.rect(self.screen, (40, 40, 60), 
                                   (x, y, self.cell_size - 1, self.cell_size - 1), 1)
        
        # Update and draw trails
        for trail in list(self.trails.values()):
            trail.update()
            trail.draw(self.screen)
        
        # Clean up empty trails
        self.trails = {k: v for k, v in self.trails.items() if v.points}
        
        # Update and draw particles
        active_particles = []
        for particle in self.particles:
            if particle.update():
                particle.draw(self.screen)
                active_particles.append(particle)
        self.particles = active_particles
    
    def load_pattern(self, pattern):
        self.grid.fill(0)
        self.generation = 0
        self.cell_ages.fill(0)  # Reset ages
        self.particles.clear()  # Clear particles
        self.trails.clear()  # Clear trails
        
        # Play pattern loading sound
        self.sound_system.play_pattern_load()
        
        if pattern == Pattern.RANDOM:
            self.grid = np.random.choice([0, 1], size=(self.grid_height, self.grid_width), p=[0.8, 0.2])
            # Add spawn particles for random pattern
            for i in range(self.grid_height):
                for j in range(self.grid_width):
                    if self.grid[i, j] == 1:
                        x = j * self.cell_size + self.cell_size // 2
                        y = i * self.cell_size + self.cell_size // 2
                        self.particles.append(Particle(x, y, "birth"))
                        self.cell_ages[i, j] = 1
        
        elif pattern == Pattern.GLIDER:
            x, y = self.grid_height // 2, self.grid_width // 2
            glider = [(0, 1), (1, 2), (2, 0), (2, 1), (2, 2)]
            for dx, dy in glider:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
                    # Add spawn particle
                    px = (y + dy) * self.cell_size + self.cell_size // 2
                    py = (x + dx) * self.cell_size + self.cell_size // 2
                    self.particles.append(Particle(px, py, "birth"))
                    self.cell_ages[x + dx, y + dy] = 1
        
        elif pattern == Pattern.BLINKER:
            x, y = self.grid_height // 2, self.grid_width // 2
            for i in range(3):
                if 0 <= x < self.grid_height and 0 <= y + i < self.grid_width:
                    self.grid[x, y + i] = 1
                    # Add spawn particle
                    px = (y + i) * self.cell_size + self.cell_size // 2
                    py = x * self.cell_size + self.cell_size // 2
                    self.particles.append(Particle(px, py, "birth"))
                    self.cell_ages[x, y + i] = 1
        
        elif pattern == Pattern.TOAD:
            x, y = self.grid_height // 2, self.grid_width // 2
            toad = [(0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (1, 2)]
            for dx, dy in toad:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
                    # Add spawn particle
                    px = (y + dy) * self.cell_size + self.cell_size // 2
                    py = (x + dx) * self.cell_size + self.cell_size // 2
                    self.particles.append(Particle(px, py, "birth"))
                    self.cell_ages[x + dx, y + dy] = 1
        
        elif pattern == Pattern.BEACON:
            x, y = self.grid_height // 2, self.grid_width // 2
            beacon = [(0, 0), (0, 1), (1, 0), (1, 1), (2, 2), (2, 3), (3, 2), (3, 3)]
            for dx, dy in beacon:
                if 0 <= x + dx < self.grid_height and 0 <= y + dy < self.grid_width:
                    self.grid[x + dx, y + dy] = 1
                    # Add spawn particle
                    px = (y + dy) * self.cell_size + self.cell_size // 2
                    py = (x + dx) * self.cell_size + self.cell_size // 2
                    self.particles.append(Particle(px, py, "birth"))
                    self.cell_ages[x + dx, y + dy] = 1
        
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
                    # Add spawn particle
                    px = (y + dy) * self.cell_size + self.cell_size // 2
                    py = (x + dx) * self.cell_size + self.cell_size // 2
                    self.particles.append(Particle(px, py, "birth"))
                    self.cell_ages[x + dx, y + dy] = 1
        
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
                    # Add spawn particle
                    px = (y + dy) * self.cell_size + self.cell_size // 2
                    py = (x + dx) * self.cell_size + self.cell_size // 2
                    self.particles.append(Particle(px, py, "birth"))
                    self.cell_ages[x + dx, y + dy] = 1
    
    def draw_info(self):
        font = pygame.font.Font(None, 36)
        status = 'Running' if self.running else 'Paused'
        alive_cells = np.sum(self.grid)
        info_text = f"Gen: {self.generation} | {status} | Cells: {alive_cells}"
        text = font.render(info_text, True, self.GREEN)
        self.screen.blit(text, (10, 10))
        
        # VFX info
        font_small = pygame.font.Font(None, 24)
        vfx_info = f"Particles: {len(self.particles)} | Trails: {len(self.trails)}"
        vfx_text = font_small.render(vfx_info, True, (100, 200, 255))
        self.screen.blit(vfx_text, (10, 40))
        
        # Sound info
        sound_status = "ON" if self.sound_system.enabled else "OFF"
        sound_info = f"Sound: {sound_status} | Volume: {int(self.sound_system.volume * 100)}%"
        sound_text = font_small.render(sound_info, True, (255, 200, 100))
        self.screen.blit(sound_text, (10, 60))
        
        controls = [
            "Controls:",
            "SPACE - Play/Pause",
            "C - Clear grid",
            "R - Random pattern",
            "1-6 - Load patterns",
            "M - Toggle sound",
            "+ / - - Volume up/down",
            "Left Click - Toggle cell",
            "ESC - Quit"
        ]
        
        y_offset = 90
        for control in controls:
            text = font_small.render(control, True, self.GREEN)
            self.screen.blit(text, (10, y_offset))
            y_offset += 25
    
    def handle_mouse_click(self, pos):
        x, y = pos
        grid_x = x // self.cell_size
        grid_y = y // self.cell_size
        
        if 0 <= grid_x < self.grid_width and 0 <= grid_y < self.grid_height:
            old_state = self.grid[grid_y, grid_x]
            self.grid[grid_y, grid_x] = 1 - old_state
            
            # Add particle effect based on the action
            px = grid_x * self.cell_size + self.cell_size // 2
            py = grid_y * self.cell_size + self.cell_size // 2
            
            if old_state == 0:  # Cell was born
                for _ in range(3):
                    self.particles.append(Particle(px, py, "birth"))
                self.cell_ages[grid_y, grid_x] = 1
                self.sound_system.play_birth()
            else:  # Cell died
                for _ in range(2):
                    self.particles.append(Particle(px, py, "death"))
                self.cell_ages[grid_y, grid_x] = 0
                self.sound_system.play_death()
    
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
                    
                    elif event.key == pygame.K_m:
                        self.sound_system.toggle_sound()
                    
                    elif event.key == pygame.K_PLUS or event.key == pygame.K_EQUALS:
                        new_volume = min(1.0, self.sound_system.volume + 0.1)
                        self.sound_system.set_volume(new_volume)
                    
                    elif event.key == pygame.K_MINUS:
                        new_volume = max(0.0, self.sound_system.volume - 0.1)
                        self.sound_system.set_volume(new_volume)
                
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