# Conway's Game of Life - Team Battle Edition

A web-based implementation of Conway's Game of Life featuring team-based gameplay, advanced AI behaviors, performance monitoring, and comprehensive analytics.

## Features

### Core Gameplay
- **Team-based Competition**: Four teams (Red, Blue, Green, Yellow) compete for dominance
- **Multiple Game Rules**: Conway's classic rules plus variants (HighLife, Day & Night, Seeds, etc.)
- **Interactive Canvas**: Click and drag to place cells, zoom and pan controls
- **Pattern Library**: Pre-built patterns including gliders, oscillators, and spaceships
- **Battle Scenarios**: Pre-configured competitive setups

### Advanced Features
- **AI Behaviors**: Configurable team intelligence, aggressiveness, and cooperation
- **WebWorker Optimization**: Background processing for large simulations
- **Performance Monitoring**: Real-time FPS, memory usage, and optimization recommendations
- **Analytics Dashboard**: Population tracking, battle statistics, formation detection
- **GIF Recording**: Capture and share simulations as animated GIFs
- **Save/Load System**: Persistent game states with scenario management
- **Keyboard Shortcuts**: Full keyboard navigation and accessibility

### Technical Features
- **ES6 Modules**: Modern JavaScript architecture with proper module system
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Comprehensive error management and recovery
- **Memory Management**: Automatic cleanup and optimization
- **Extensible Architecture**: Modular design for easy feature additions
- **CI/CD Ready**: Complete testing and deployment pipeline

## Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher (for development and testing)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with ES6 module support
- **Git**: For version control

## Installation

### Quick Start

```bash
git clone https://github.com/Hack-Pac/zeroplayergame.git
cd zeroplayergame

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Development Setup

For development with testing and linting:

```bash
# Install development dependencies
pip install -r requirements-dev.txt
npm install

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## Usage

### Basic Controls

- **Click/Drag**: Draw cells on the canvas
- **Space**: Play/Pause simulation
- **C**: Clear the board
- **R**: Randomize the board
- **Mouse Wheel**: Zoom in/out
- **Right Click + Drag**: Pan the canvas

### Advanced Controls

#### Keyboard Shortcuts
- **1-4**: Select team colors
- **P**: Toggle performance monitor
- **A**: Toggle analytics dashboard
- **G**: Start/stop GIF recording
- **S**: Quick save
- **L**: Quick load
- **H**: Help system
- **F**: Fit to screen
- **Escape**: Reset view

#### Team Configuration
Access team settings to configure:
- **Intelligence**: How smart teams are at strategic decisions
- **Aggressiveness**: Likelihood to convert enemy cells
- **Fear**: Tendency to avoid larger opposing teams
- **Cooperation**: Willingness to form alliances
- **Herd Behavior**: How closely cells stick together

### Game Rules

#### Conway's Classic Rules
- **Birth**: Dead cell with exactly 3 neighbors becomes alive
- **Survival**: Live cell with 2 or 3 neighbors survives
- **Death**: Live cell with fewer than 2 or more than 3 neighbors dies

#### Alternative Rules
- **HighLife**: Birth on 3 or 6 neighbors
- **Day & Night**: Birth on 3,6,7,8; Survival on 3,4,6,7,8
- **Seeds**: Birth on 2 neighbors, no survival
- **Life 3-4**: Birth and survival on 3 or 4 neighbors

## Architecture

### JavaScript Modules

The codebase uses ES6 modules for clean separation of concerns:

#### Core Modules
- **`game.js`**: Main game logic, canvas rendering, and Conway's rules implementation
- **`gameWorker.js`**: WebWorker for background computation of large grids
- **`constants.js`**: Game constants, team colors, rule sets, and configuration
- **`patterns.js`**: Pattern definitions, loading functions, and team assignment

#### User Interface
- **`camera.js`**: Viewport management, zoom/pan controls, and coordinate transforms
- **`main.js`**: Application entry point and initialization
- **`help.js`**: Interactive help system and tutorial guidance
- **`pixelFont.js`**: Custom pixel font rendering for retro aesthetics

#### Advanced Features
- **`analytics.js`**: Battle statistics, population tracking, and formation detection
- **`advancedAI.js`**: Team AI behaviors, strategies, and decision making
- **`performance.js`**: Performance monitoring, FPS tracking, and optimization recommendations
- **`teamConfig.js`**: Team behavior configuration and AI parameter tuning

#### Recording and Sharing
- **`gifRecorder.js`**: GIF creation, frame capture, and export functionality
- **`gifShowcase.js`**: Community showcase management and sharing features

### Performance Optimizations

- **WebWorker Processing**: Large computations run in background threads
- **Spatial Optimization**: Only processes active regions with live cells
- **Memory Management**: Automatic cleanup of analytics history and old data
- **Canvas Optimization**: Efficient rendering with viewport culling
- **Batch Updates**: Multiple generations computed together for speed

## Development

### Project Structure

```
├── js/                     # JavaScript modules
│   ├── game.js            # Main game engine
│   ├── gameWorker.js      # Background processing
│   ├── analytics.js       # Battle analytics
│   ├── advancedAI.js      # AI behaviors
│   ├── performance.js     # Performance monitoring
│   ├── patterns.js        # Pattern library
│   ├── camera.js          # Viewport controls
│   ├── main.js            # Application entry point
│   ├── teamConfig.js      # Team configuration
│   ├── gifRecorder.js     # GIF recording
│   ├── gifShowcase.js     # Community features
│   ├── help.js            # Help system
│   ├── pixelFont.js       # Custom font rendering
│   └── vendor/            # Third-party libraries
│       ├── gif.js         # GIF creation library
│       └── gif.worker.js  # GIF worker thread
├── tests/                 # Jest test suites
│   ├── game.test.js      # Core game logic tests
│   ├── patterns.test.js  # Pattern loading tests
│   └── analytics.test.js # Analytics functionality tests
├── app.py                # Flask server
├── game_of_life.py       # Python implementation
├── index.html           # Main HTML file
├── style.css           # Application styling
├── package.json        # Node.js dependencies and scripts
├── jest.config.js      # Jest testing configuration
├── requirements.txt    # Python production dependencies
└── requirements-dev.txt # Python development dependencies
```

### Testing

The project uses Jest for JavaScript testing with ES6 module support:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test patterns.test.js
```

#### Test Configuration

The Jest configuration (`jest.config.js`) is set up for ES6 modules:
- Uses Node.js experimental VM modules
- Environment set to jsdom for DOM testing
- ES6 module transformation enabled

#### Test Suites
- **`game.test.js`**: Core game logic, Conway's rules, team detection, grid management
- **`patterns.test.js`**: Pattern loading, positioning, team assignment, validation
- **`analytics.test.js`**: Battle statistics, population tracking, data accuracy

All tests use simplified mock objects instead of complex Jest mocking for better ES6 module compatibility.

### Code Quality

```bash
# Lint JavaScript code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Run Python linting (requires dev dependencies)
pylint *.py

# Format Python code
black *.py
```

### ESLint Configuration

The project includes ESLint rules for:
- ES6 module syntax
- Modern JavaScript features
- Code consistency
- Best practices

## CI/CD Setup

### GitHub Actions Pipeline

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.8, 3.9, '3.10', '3.11', '3.12']
        node-version: [16, 18, 20]

    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Set up Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install Python dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Install Node.js dependencies
      run: npm ci
    
    - name: Run JavaScript tests
      run: npm test
    
    - name: Run JavaScript linting
      run: npm run lint
    
    - name: Run Python linting
      run: |
        pylint *.py
        black --check *.py
    
    - name: Test application startup
      run: |
        timeout 10s python app.py || true

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run security audit
      run: |
        npm audit --audit-level high
        pip-audit --require-hashes --desc
```

### Dependency Management

#### Python Dependencies

The project uses two requirements files:
- **`requirements.txt`**: Production dependencies
  ```
  pygame==2.5.2
  numpy>=1.20.0,<1.25.0
  Flask==2.3.3
  ```
  
- **`requirements-dev.txt`**: Development and testing dependencies
  ```
  -r requirements.txt
  pytest>=7.0.0
  pylint>=2.15.0
  black>=22.0.0
  pip-audit>=2.6.0
  ```

#### Node.js Dependencies

Key development dependencies in `package.json`:
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.57.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "test": "NODE_OPTIONS='--experimental-vm-modules' jest",
    "lint": "eslint js/**/*.js --ignore-pattern 'js/vendor/**'",
    "format": "prettier --write js/**/*.js"
  }
}
```

### Deployment

#### Local Development
```bash
# Standard development server
python app.py

# Development with auto-reload
export FLASK_ENV=development
flask run --reload
```

#### Production Deployment
```bash
# Install production WSGI server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app

# With additional configuration
gunicorn --config gunicorn.conf.py app:app
```

#### Docker Support
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Run application
CMD ["python", "app.py"]
```

## Troubleshooting

### Common Issues

#### NumPy Installation Errors
The project uses NumPy version constraints for Python compatibility:

```bash
# If you encounter build errors, update pip first
python -m pip install --upgrade pip

# The project specifies compatible NumPy versions
# For Python 3.8-3.11: numpy>=1.20.0,<1.25.0
# For Python 3.12+: numpy>=1.24.0

# Force reinstall if needed
pip install --force-reinstall "numpy>=1.20.0,<1.25.0"
```

#### Jest ES Module Issues
The testing setup uses experimental VM modules:

```bash
# The NODE_OPTIONS flag is set in package.json scripts
# If running Jest directly, use:
NODE_OPTIONS='--experimental-vm-modules' npx jest

# Or ensure your Node.js version supports ES modules (16+)
node --version
```

#### Performance Issues
Use the built-in performance monitor:
- Press 'P' to toggle performance panel
- Monitor FPS, update time, and memory usage
- Reduce grid size for better performance
- Enable WebWorker processing for large simulations

#### Browser Compatibility
Requirements for full functionality:
- ES6 module support (Chrome 61+, Firefox 60+, Safari 11+)
- WebWorker support for background processing
- Canvas 2D context for rendering
- Modern JavaScript features (async/await, classes, etc.)

### Memory Management

The application includes comprehensive memory management:
- Analytics history limited to prevent memory leaks
- GIF showcase has storage limits and cleanup
- Performance monitor tracks memory usage in real-time
- Automatic cleanup of unused resources and event listeners

### Error Handling

Built-in error handling covers:
- Pattern loading failures with fallback patterns
- WebWorker communication errors
- Canvas rendering issues
- Memory allocation problems
- Network connectivity issues for GIF sharing

## API Documentation

### Core Game Class

```javascript
// Main game instance
const game = new GameOfLife();

// Public methods
game.start()              // Begin simulation
game.stop()               // Pause simulation
game.step()               // Advance one generation
game.clear()              // Clear all cells
game.randomize()          // Fill with random cells
game.loadPattern(name)    // Load predefined pattern
game.setTeam(team)        // Set active team (1-4)
game.resize(width, height) // Change grid dimensions
```

### Analytics System

```javascript
// Analytics instance (auto-created with game)
const analytics = game.analytics;

// Methods
analytics.getPopulationData()    // Current population stats
analytics.getBattleStats()       // Team battle statistics
analytics.getFormations()        // Detected formations
analytics.getRecommendations()   // Performance suggestions
analytics.exportData()           // Export analytics as JSON
```

### Performance Monitor

```javascript
// Performance monitoring
const monitor = game.performanceMonitor;

// Methods
monitor.toggle()                 // Enable/disable monitoring
monitor.getMetrics()            // Current performance metrics
monitor.getRecommendations()    // Optimization suggestions
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the code standards
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Run linting: `npm run lint`
7. Commit with descriptive messages
8. Push and create a pull request

### Code Standards

#### JavaScript
- Use ES6+ features and modern syntax
- Follow ESLint configuration rules
- Use JSDoc comments for public methods
- Prefer const/let over var
- Use arrow functions where appropriate
- Handle errors gracefully

#### Python
- Follow PEP 8 style guidelines
- Use type hints where helpful
- Write docstrings for functions and classes
- Handle exceptions appropriately

#### Testing
- Write unit tests for new features  
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies appropriately
- Aim for good test coverage

### Pull Request Guidelines

- Include a clear description of changes
- Reference any related issues
- Include tests for new functionality
- Ensure all tests pass
- Update documentation as needed
- Keep changes focused and atomic

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Original Conway's Game of Life concept by John Conway
- gif.js library for GIF generation capabilities
- Jest testing framework for comprehensive testing
- Flask web framework for server functionality
- ESLint and Prettier for code quality tools

# Install Node.js dependencies (for development)
npm install

# Run the application
python app.py
```

### Development Setup

For development with testing and linting:

```bash
# Install development dependencies
pip install -r requirements-dev.txt
npm install

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## Usage

### Basic Controls

- **Click/Drag**: Draw cells on the canvas
- **Space**: Play/Pause simulation
- **C**: Clear the board
- **R**: Randomize the board
- **Mouse Wheel**: Zoom in/out
- **Right Click + Drag**: Pan the canvas

### Advanced Controls

#### Keyboard Shortcuts
- **1-4**: Select team colors
- **P**: Toggle performance monitor
- **A**: Toggle analytics dashboard
- **G**: Start/stop GIF recording
- **S**: Quick save
- **L**: Quick load
- **H**: Help system
- **F**: Fit to screen
- **Escape**: Reset view

#### Team Configuration
Access team settings to configure:
- **Intelligence**: How smart teams are at strategic decisions
- **Aggressiveness**: Likelihood to convert enemy cells
- **Fear**: Tendency to avoid larger opposing teams
- **Cooperation**: Willingness to form alliances
- **Herd Behavior**: How closely cells stick together

### Game Rules

#### Conway's Classic Rules
- **Birth**: Dead cell with exactly 3 neighbors becomes alive
- **Survival**: Live cell with 2 or 3 neighbors survives
- **Death**: Live cell with fewer than 2 or more than 3 neighbors dies

#### Alternative Rules
- **HighLife**: Birth on 3 or 6 neighbors
- **Day & Night**: Birth on 3,6,7,8; Survival on 3,4,6,7,8
- **Seeds**: Birth on 2 neighbors, no survival
- **Life 3-4**: Birth and survival on 3 or 4 neighbors

## Architecture

### JavaScript Modules

The codebase uses ES6 modules for clean separation of concerns:

#### Core Modules
- **`game.js`**: Main game logic and canvas rendering
- **`gameWorker.js`**: WebWorker for background computation
- **`constants.js`**: Game constants and configuration
- **`patterns.js`**: Pattern definitions and loading

#### User Interface
- **`camera.js`**: Viewport management and zoom/pan controls
- **`keyboard.js`**: Keyboard shortcuts and accessibility
- **`help.js`**: Interactive help system
- **`tutorial.js`**: Step-by-step onboarding

#### Advanced Features
- **`analytics.js`**: Battle statistics and population tracking
- **`advancedAI.js`**: Team AI behaviors and strategies
- **`performance.js`**: Performance monitoring and optimization
- **`teamConfig.js`**: Team behavior configuration

#### Recording and Sharing
- **`gifRecorder.js`**: GIF creation and export
- **`gifShowcase.js`**: Community showcase management
- **`saveLoad.js`**: Game state persistence

#### Battle System
- **`battleScenarios.js`**: Pre-configured competitive setups
- **`errorHandling.js`**: Error management and recovery

### Performance Optimizations

- **WebWorker Processing**: Large computations run in background threads
- **Spatial Optimization**: Only processes active regions
- **Memory Management**: Automatic cleanup of old data
- **Canvas Optimization**: Efficient rendering with viewport culling
- **Batch Updates**: Multiple generations computed together

## Development

### Project Structure

```
├── js/                     # JavaScript modules
│   ├── game.js            # Main game engine
│   ├── gameWorker.js      # Background processing
│   ├── analytics.js       # Battle analytics
│   ├── advancedAI.js      # AI behaviors
│   ├── performance.js     # Performance monitoring
│   └── vendor/            # Third-party libraries
├── tests/                 # Jest test suites
│   ├── game.test.js      # Core game tests
│   ├── patterns.test.js  # Pattern loading tests
│   └── analytics.test.js # Analytics tests
├── app.py                # Flask server
├── index.html           # Main HTML file
├── style.css           # Styling
├── package.json        # Node.js dependencies
├── jest.config.js      # Test configuration
└── requirements.txt    # Python dependencies
```

### Testing

The project uses Jest for JavaScript testing with ES6 module support:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

#### Test Suites
- **Unit Tests**: Individual module functionality
- **Integration Tests**: Component interaction testing
- **Pattern Tests**: Verify pattern loading and positioning
- **Analytics Tests**: Battle statistics accuracy

### Code Quality

```bash
# Lint JavaScript code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Run Python linting (requires dev dependencies)
pylint *.py

# Format Python code
black *.py
```

## CI/CD

### GitHub Actions Setup

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.8, 3.9, '3.10', '3.11']
        node-version: [16, 18, 20]

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v3
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Set up Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install Python dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Install Node.js dependencies
      run: npm install
    
    - name: Run Python tests
      run: |
        python -m pytest --verbose
        pylint *.py
    
    - name: Run JavaScript tests
      run: |
        npm test
        npm run lint
    
    - name: Test application startup
      run: |
        timeout 10s python app.py || true
```

### Dependency Management

#### Python Dependencies
```bash
# Update requirements.txt
pip freeze > requirements.txt

# Security audit
pip-audit

# Update packages
pip install --upgrade -r requirements.txt
```

#### Node.js Dependencies
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update packages
npm update
```

### Deployment

#### Local Development
```bash
python app.py
# Access at http://localhost:5000
```

#### Production Deployment
```bash
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

#### Docker Support
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## Troubleshooting

### Common Issues

#### NumPy Installation Error
If you encounter NumPy build errors:
```bash
# Update pip first
python -m pip install --upgrade pip

# Install with pre-built wheel
pip install numpy --only-binary=numpy

# For older Python versions, use compatible NumPy
pip install "numpy>=1.20.0,<1.25.0"
```

#### Jest ES Module Issues
For ES6 module testing problems:
```bash
# Ensure Node.js experimental VM modules flag is set
export NODE_OPTIONS="--experimental-vm-modules"

# Or use package.json scripts which include the flag
npm test
```

#### Performance Issues
- Reduce grid size for better performance
- Enable WebWorker processing for large simulations
- Monitor memory usage in Performance panel
- Use spatial optimization for sparse grids

#### Browser Compatibility
- Modern browsers required for ES6 modules
- WebWorker support needed for background processing
- Canvas 2D context required for rendering

### Memory Management

The application includes automatic memory management:
- Analytics history is limited to prevent memory leaks
- GIF showcase has maximum storage limits
- Performance monitor tracks memory usage
- Automatic cleanup of unused resources

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Standards
- Use ES6 modules and modern JavaScript features
- Follow existing code style and naming conventions
- Add JSDoc comments for public methods
- Include unit tests for new features
- Run linting and formatting before commits

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Original Conway's Game of Life concept by John Conway
- gif.js library for GIF generation
- Jest testing framework
- Flask web framework
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