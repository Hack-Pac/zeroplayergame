// Camera and viewport management

import { CAMERA_CONFIG } from './constants.js';

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.minZoom = CAMERA_CONFIG.minZoom;
        this.maxZoom = CAMERA_CONFIG.maxZoom;
        
        this.mouse = {
            isPanning: false,
            panStartX: 0,
            panStartY: 0,
            cameraStartX: 0,
            cameraStartY: 0
        };
    }
    
    startPan(x, y) {
        this.mouse.isPanning = true;
        this.mouse.panStartX = x;
        this.mouse.panStartY = y;
        this.mouse.cameraStartX = this.x;
        this.mouse.cameraStartY = this.y;
    }
    
    updatePan(x, y) {
        if (!this.mouse.isPanning) return false;
        
        const dx = x - this.mouse.panStartX;
        const dy = y - this.mouse.panStartY;
        this.x = this.mouse.cameraStartX - dx / this.zoom;
        this.y = this.mouse.cameraStartY - dy / this.zoom;
        
        return true; 
    }
    
    endPan() {
        this.mouse.isPanning = false;
    }
    
    handleZoom(deltaY, mouseX, mouseY) {
        const worldX = (mouseX + this.x * this.zoom) / this.zoom;
        const worldY = (mouseY + this.y * this.zoom) / this.zoom;
        
        const zoomDelta = deltaY > 0 ? CAMERA_CONFIG.zoomDelta.out : CAMERA_CONFIG.zoomDelta.in;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomDelta));
        
        this.x = worldX - mouseX / this.zoom;
        this.y = worldY - mouseY / this.zoom;
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.zoom) + this.x,
            y: (screenY / this.zoom) + this.y
        };
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom,
            y: (worldY - this.y) * this.zoom
        };
    }
    
    getVisibleBounds(cellSize, gridWidth, gridHeight) {
        const startX = Math.floor(this.x / cellSize);
        const startY = Math.floor(this.y / cellSize);
        const endX = Math.ceil((this.x + this.canvas.width / this.zoom) / cellSize);
        const endY = Math.ceil((this.y + this.canvas.height / this.zoom) / cellSize);
        
        return {
            startX: Math.max(0, startX),
            startY: Math.max(0, startY),
            endX: Math.min(gridWidth, endX),
            endY: Math.min(gridHeight, endY)
        };
    }
    
    reset() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }
    
    getZoomPercentage() {
        return Math.round(this.zoom * 100);
    }
}