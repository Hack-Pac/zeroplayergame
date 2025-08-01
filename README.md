# Zero Player Game - Conway's Game of Life

A multiplayer implementation of Conway's Game of Life with team-based gameplay, GIF recording, and community showcase features.

## Overview

This project implements Conway's Game of Life as a "zero-player game" where evolution is determined by the initial state and rules. Features include:
- Team-based gameplay with color-coded cells (Red, Blue, Green, Yellow)
- GIF recording and sharing functionality
- Pattern library with classic Game of Life patterns
- Community showcase for sharing creations
- Interactive canvas with pan/zoom controls

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for cloning the repository)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zeroplayergame.git
cd zeroplayergame
```

### 2. Set Up Python Environment

It's recommended to use a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

The project requires:
- `pygame==2.5.2` - For the Python implementation
- `numpy==1.26.4` - For array operations

### 4. Run the Application

```bash
python app.py
```

The application will start on `http://localhost:5000`

## Usage

### Basic Controls

- **Click/Drag** - Draw cells on the canvas
- **Space** - Play/Pause the simulation
- **C** - Clear the board
- **R** - Randomize the board
- **Mouse Wheel** - Zoom in/out
- **Right Click + Drag** - Pan the canvas

### Team Selection

Select a team color from the radio buttons to place colored cells. Teams compete for dominance on the board.

### Pattern Library

Access pre-built patterns including:
- Glider
- Glider Gun
- Pulsar
- Pentadecathlon
- And more!

### GIF Recording

1. Click the camera button to start recording
2. Let the simulation run
3. Click stop to generate a GIF
4. Share your creation to the community showcase

### Keyboard Shortcuts

- **1-5** - Quick team selection
- **+/-** - Zoom in/out
- **G** - Toggle grid
- **H** - Show help

## Project Structure

```
zeroplayergame/
├── app.py              # Flask server
├── index.html          # Main HTML page
├── style.css           # Styling
├── game.js             # Game logic (duplicate)
├── game_of_life.py     # Python implementation
├── requirements.txt    # Python dependencies
└── js/                 # JavaScript modules
    ├── camera.js       # Camera controls
    ├── constants.js    # Game constants
    ├── game.js         # Main game logic
    ├── gifRecorder.js  # GIF recording
    ├── gifShowcase.js  # Community showcase
    ├── help.js         # Help modal
    ├── main.js         # Entry point
    ├── patterns.js     # Pattern library
    ├── pixelFont.js    # Pixel font rendering
    ├── teamConfig.js   # Team configuration
    └── vendor/         # Third-party libraries
        ├── gif.js      # GIF creation library
        └── gif.worker.js
```

## Python Implementation

The standalone Python version (`game_of_life.py`) offers advanced features for experimentation and analysis:

### Visual Effects System
- Particle effects for cell births and deaths
- Trail systems showing cell evolution patterns
- Glow effects highlighting active regions
- Customizable particle behaviors and lifespans

### Procedural Sound Engine
- Dynamic audio generation based on simulation events
- Frequency modulation reflecting population density
- Harmonic patterns corresponding to stable structures
- Real-time synthesis without external audio files

### Advanced Drawing Tools
- **Brush Tool**: Variable size cell painting with pressure sensitivity
- **Line Tool**: Precise straight-line cell placement
- **Rectangle Tool**: Rapid area filling and clearing
- **Circle Tool**: Circular pattern generation
- **Erase Tool**: Selective cell removal with adjustable radius

### Analytics and Metrics
- Population statistics and growth rate analysis
- Pattern recognition and classification
- Spatial distribution mapping
- Performance profiling and optimization data

### Running the Python Version

```bash
# Install dependencies
pip install pygame numpy

# Run the enhanced version
python game_of_life.py
```

The Python implementation serves as a testing ground for new features and provides a foundation for advanced Conway's Game of Life research.

## Configuration

### Server Settings

Modify `app.py` to change:
- Port: Default is 5000
- Host: Default is '0.0.0.0' (accessible from network)
- Debug mode: Set to False for production

### Game Settings

Edit `js/constants.js` to modify:
- Grid size
- Cell size
- Animation speed
- Team colors
- Pattern definitions

## Development

### Running in Development Mode

The Flask server runs with debug mode enabled by default:

```bash
python app.py
```

This enables:
- Auto-reload on file changes
- Detailed error messages
- Debug toolbar

### Making Changes

1. Frontend changes: Edit files in `js/` directory
2. Styles: Modify `style.css`
3. Backend: Update `app.py` (minimal backend logic)

### Testing

No automated tests are currently configured. Test manually by:
1. Drawing patterns and verifying evolution
2. Testing all UI controls
3. Verifying GIF recording works
4. Checking team interactions

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 5000
# On macOS/Linux:
lsof -ti:5000 | xargs kill -9
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Module Import Errors**
- Ensure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`

**GIF Recording Not Working**
- Check browser console for errors
- Ensure sufficient memory for GIF creation
- Try smaller recording areas

**Canvas Performance Issues**
- Reduce grid size in constants
- Use Chrome for best performance
- Clear board between simulations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- JavaScript: Use ES6+ features
- Python: Follow PEP 8
- Comment complex logic
- Keep functions focused and small

## License

This project is open source. Please check the repository for license details.

## Acknowledgments

- Conway's Game of Life created by John Conway
- GIF.js library for GIF creation
- Flask framework for web serving