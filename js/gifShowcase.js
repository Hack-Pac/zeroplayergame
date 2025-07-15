// GIF Showcase management

export class GifShowcaseManager {
    constructor() {
        this.gifs = [];
        this.storageKey = 'gameOfLifeGifShowcase';
        this.maxGifs = 50; // Maximum number of GIFs to store
        
        this.initializeEventListeners();
        this.loadFromStorage();
    } 
    //fix this later
    initializeEventListeners() {
        const showcaseBtn = document.getElementById('showcaseBtn');
        const modal = document.getElementById('showcaseModal');
        const closeBtn = modal.querySelector('.close');
        const uploadBtn = document.getElementById('uploadGifBtn');
        const fileInput = document.getElementById('gifFileInput');
        const sortSelect = document.getElementById('sortSelect');
        
        // Open modal
        showcaseBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            this.renderGallery();
        });
        
        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Upload button
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'image/gif') {
                this.handleFileUpload(file);
            }
            // Reset input
            e.target.value = '';
        });
        
        // Sort change
        sortSelect.addEventListener('change', () => {
            this.renderGallery();
        });
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.gifs = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading GIFs from storage:', error);
            this.gifs = [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.gifs));
        } catch (error) {
            console.error('Error saving GIFs to storage:', error);
            // If storage is full, remove oldest GIFs
            if (error.name === 'QuotaExceededError') {
                this.gifs = this.gifs.slice(-Math.floor(this.maxGifs / 2));
                this.saveToStorage();
            }
        }
    }
    
    async handleFileUpload(file) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const dataUrl = e.target.result;
            const name = prompt('Enter a name for this GIF:', file.name.replace('.gif', ''));
            
            if (name) {
                await this.addGif({
                    name: name,
                    dataUrl: dataUrl,
                    localFile: true,
                    timestamp: Date.now(),
                    size: file.size
                });
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    async addGif(gifData) {
        // Generate thumbnail
        const thumbnail = await this.generateThumbnail(gifData.dataUrl);
        
        const gifEntry = {
            id: Date.now().toString(),
            name: gifData.name || 'Untitled',
            thumbnailUrl: thumbnail,
            fullUrl: gifData.url || gifData.dataUrl,
            timestamp: gifData.timestamp || Date.now(),
            generations: gifData.generations || 'Unknown',
            frameRate: gifData.frameRate || 'Unknown',
            localFile: gifData.localFile || false
        };
        
        // Add to beginning of array
        this.gifs.unshift(gifEntry);
        
        // Limit number of GIFs
        if (this.gifs.length > this.maxGifs) {
            this.gifs = this.gifs.slice(0, this.maxGifs);
        }
        
        this.saveToStorage();
        this.renderGallery();
    }
    
    async generateThumbnail(gifUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Create thumbnail at 150x150
                canvas.width = 150;
                canvas.height = 150;
                
                // Calculate dimensions to maintain aspect ratio
                const aspectRatio = img.width / img.height;
                let drawWidth = canvas.width;
                let drawHeight = canvas.height;
                
                if (aspectRatio > 1) {
                    drawHeight = canvas.width / aspectRatio;
                } else {
                    drawWidth = canvas.height * aspectRatio;
                }
                
                const x = (canvas.width - drawWidth) / 2;
                const y = (canvas.height - drawHeight) / 2;
                
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, x, y, drawWidth, drawHeight);
                
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            
            img.onerror = () => {
                // Return a placeholder if thumbnail generation fails
                resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkdJRjwvdGV4dD48L3N2Zz4=');
            };
            
            img.src = gifUrl;
        });
    }
    
    deleteGif(id) {
        if (confirm('Are you sure you want to delete this GIF?')) {
            this.gifs = this.gifs.filter(gif => gif.id !== id);
            this.saveToStorage();
            this.renderGallery();
        }
    }
    
    sortGifs() {
        const sortBy = document.getElementById('sortSelect').value;
        
        switch (sortBy) {
            case 'recent':
                this.gifs.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'oldest':
                this.gifs.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case 'name':
                this.gifs.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
    }
    
    renderGallery() {
        const gallery = document.getElementById('gifGallery');
        const emptyMessage = document.getElementById('emptyShowcase');
        const gifCount = document.getElementById('gifCount');
        
        // Update count
        gifCount.textContent = `${this.gifs.length} GIF${this.gifs.length !== 1 ? 's' : ''} in showcase`;
        
        if (this.gifs.length === 0) {
            gallery.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        }
        
        gallery.style.display = 'grid';
        emptyMessage.style.display = 'none';
        
        // Sort GIFs
        this.sortGifs();
        
        // Clear gallery
        gallery.innerHTML = '';
        
        // Render each GIF
        this.gifs.forEach(gif => {
            const gifElement = this.createGifElement(gif);
            gallery.appendChild(gifElement);
        });
    }
    
    createGifElement(gif) {
        const div = document.createElement('div');
        div.className = 'gif-item';
        
        const date = new Date(gif.timestamp).toLocaleDateString();
        
        div.innerHTML = `
            <img src="${gif.thumbnailUrl}" alt="${gif.name}" class="gif-thumbnail">
            <div class="gif-info">
                <div class="gif-name" title="${gif.name}">${gif.name}</div>
                <div class="gif-metadata">
                    ${date}
                    ${gif.generations !== 'Unknown' ? `• ${gif.generations} gen` : ''}
                </div>
                <div class="gif-actions">
                    <button class="view-btn" data-id="${gif.id}">View</button>
                    <button class="download-btn" data-id="${gif.id}">Download</button>
                    <button class="delete-btn" data-id="${gif.id}">Delete</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const viewBtn = div.querySelector('.view-btn');
        const downloadBtn = div.querySelector('.download-btn');
        const deleteBtn = div.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', () => this.viewGif(gif));
        downloadBtn.addEventListener('click', () => this.downloadGif(gif));
        deleteBtn.addEventListener('click', () => this.deleteGif(gif.id));
        
        return div;
    }
    
    viewGif(gif) {
        window.open(gif.fullUrl, '_blank');
    }
    
    downloadGif(gif) {
        const link = document.createElement('a');
        link.href = gif.fullUrl;
        link.download = `${gif.name}.gif`;
        link.click();
    }
    
    // Method to be called from GIF recorder
    async saveFromRecorder(blob, settings) {
        const dataUrl = await this.blobToDataUrl(blob);
        const name = prompt('Enter a name for this GIF:', `Game_${new Date().toISOString().slice(0, 10)}`);
        
        if (name) {
            await this.addGif({
                name: name,
                dataUrl: dataUrl,
                generations: settings.generations,
                frameRate: settings.frameRate,
                timestamp: Date.now()
            });
            
            // Show the showcase modal
            document.getElementById('showcaseModal').style.display = 'block';
        }
    }
    
    blobToDataUrl(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
}