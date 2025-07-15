// GIF Recording functionality

export class GifRecorder {
    constructor(game, showcaseManager = null) {
        this.game = game;
        this.showcaseManager = showcaseManager;
        this.recording = false;
        this.frames = [];
        this.settings = null;
        this.worker = null;
        this.recordingStartGeneration = 0;
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const recordBtn = document.getElementById('recordBtn');
        const gifModal = document.getElementById('gifModal');
        const gifCloseBtn = gifModal.querySelector('.close');
        const startRecordingBtn = document.getElementById('startRecording');
        const cancelRecordingBtn = document.getElementById('cancelRecording');
        const gifQualitySlider = document.getElementById('gifQuality');
        
        recordBtn.addEventListener('click', () => {
            gifModal.style.display = 'block';
        });
        
        gifCloseBtn.addEventListener('click', () => {
            gifModal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === gifModal) {
                gifModal.style.display = 'none';
            }
        });
        
        gifQualitySlider.addEventListener('input', (e) => {
            e.target.nextElementSibling.textContent = e.target.value;
        });
        
        startRecordingBtn.addEventListener('click', () => {
            this.startRecording();
        });
        
        cancelRecordingBtn.addEventListener('click', () => {
            this.cancelRecording();
        });
    }
    
    startRecording() {
        // Get settings
        this.settings = {
            generations: parseInt(document.getElementById('gifGenerations').value),
            frameRate: parseInt(document.getElementById('gifFrameRate').value),
            quality: parseInt(document.getElementById('gifQuality').value),
            scale: parseFloat(document.getElementById('gifScale').value),
            captureInterval: parseInt(document.getElementById('gifCaptureInterval').value)
        };
        
        // Create scaled canvas for GIF
        const scaledWidth = Math.floor(this.game.canvas.width * this.settings.scale);
        const scaledHeight = Math.floor(this.game.canvas.height * this.settings.scale);
        
        // Initialize GIF worker
        this.worker = new GIF({
            workers: 2,
            quality: this.settings.quality,
            width: scaledWidth,
            height: scaledHeight,
            workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
        });
        
        this.worker.on('finished', (blob) => {
            this.onGifFinished(blob);
        });
        
        this.worker.on('progress', (p) => {
            this.updateProgress(p, true);
        });
        
        // Start recording
        this.recording = true;
        this.frames = [];
        this.recordingStartGeneration = this.game.generation;
        
        // Update UI
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('recordingProgress').style.display = 'block';
        document.getElementById('gifModal').querySelector('.gif-settings').style.display = 'none';
        
        // Start simulation if not running
        if (!this.game.running) {
            this.game.togglePlay();
        }
        
        this.updateProgress(0, false);
    }
    
    cancelRecording() {
        this.recording = false;
        this.frames = [];
        
        if (this.worker) {
            this.worker.abort();
            this.worker = null;
        }
        
        // Reset UI
        document.getElementById('startRecording').style.display = 'block';
        document.getElementById('recordingProgress').style.display = 'none';
        document.getElementById('gifModal').querySelector('.gif-settings').style.display = 'block';
        document.getElementById('gifModal').style.display = 'none';
    }
    
    captureFrame() {
        if (!this.recording) return;
        
        const generationsSinceStart = this.game.generation - this.recordingStartGeneration;
        
        // Check if we should capture this frame
        if (generationsSinceStart % this.settings.captureInterval !== 0) {
            return;
        }
        
        // Check if we've captured enough
        if (generationsSinceStart >= this.settings.generations) {
            this.finishRecording();
            return;
        }
        
        // Create temporary canvas for scaled frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.game.canvas.width * this.settings.scale;
        tempCanvas.height = this.game.canvas.height * this.settings.scale;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Scale and draw
        tempCtx.scale(this.settings.scale, this.settings.scale);
        tempCtx.drawImage(this.game.canvas, 0, 0);
        
        // Calculate delay based on frame rate and capture interval
        const delay = (1000 / this.settings.frameRate) * this.settings.captureInterval;
        
        // Add frame to GIF
        this.worker.addFrame(tempCanvas, { delay: delay });
        
        // Update progress
        const progress = generationsSinceStart / this.settings.generations;
        this.updateProgress(progress, false);
    }
    
    updateProgress(progress, isRendering) {
        const percentage = Math.round(progress * 100);
        const progressFill = document.querySelector('.progress-fill');
        progressFill.style.width = percentage + '%';
        
        if (isRendering) {
            document.getElementById('recordingStatus').textContent = `Rendering GIF... ${percentage}%`;
        } else {
            const current = this.game.generation - this.recordingStartGeneration;
            document.getElementById('recordingStatus').textContent = 
                `${current}/${this.settings.generations}`;
        }
    }
    
    finishRecording() {
        this.recording = false;
        document.getElementById('recordingStatus').textContent = 'Rendering GIF...';
        document.getElementById('cancelRecording').disabled = true;
        
        // Render the GIF
        this.worker.render();
    }
    
    onGifFinished(blob) {
        // Reset UI first
        this.cancelRecording();
        
        // Create options for the user
        const choice = confirm('GIF created successfully!\n\nClick OK to save to the GIF Showcase\nClick Cancel to download directly');
        
        if (choice && this.showcaseManager) {
            // Save to showcase
            this.showcaseManager.saveFromRecorder(blob, {
                generations: this.settings.generationsToRecord,
                frameRate: this.settings.frameRate
            });
        } else {
            // Download directly
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `game-of-life-${Date.now()}.gif`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('GIF saved successfully!');
        }
    }
    
    isRecording() {
        return this.recording;
    }
}