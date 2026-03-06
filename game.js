// Block Out - 3D Block Stacking Game
// Three.js Implementation

class BlockOut {
    constructor() {
        this.PIT_WIDTH = 7;
        this.PIT_DEPTH = 7;
        this.PIT_HEIGHT = 12;
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('blockOutHighScore')) || 0;
        this.cubesPlayed = 0;
        this.level = 1;
        this.isPaused = false;
        this.isGameOver = false;
        this.fallSpeed = 1000; // ms per drop
        this.lastFallTime = 0;
        
        this.grid = []; // 3D array representing occupied cells
        this.currentPiece = null;
        this.nextPieceType = null;
        this.ghostPiece = null;
        
        this.mainScene = null;
        this.nextScene = null;
        this.mainCamera = null;
        this.nextCamera = null;
        this.mainRenderer = null;
        this.nextRenderer = null;
        
        this.pieceGroup = null;
        this.ghostGroup = null;
        this.stackedPieces = [];
        
        // Camera controls
        this.cameraAngleX = 0;
        this.cameraAngleY = 0;
        this.cameraDistance = 18;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.init();
    }
    
    init() {
        this.initializeGrid();
        this.setupMainScene();
        this.setupNextPieceScene();
        this.updateUI();
        this.spawnNewPiece();
        this.setupControls();
        this.animate();
    }
    
    initializeGrid() {
        this.grid = [];
        for (let x = 0; x < this.PIT_WIDTH; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.PIT_HEIGHT; y++) {
                this.grid[x][y] = [];
                for (let z = 0; z < this.PIT_DEPTH; z++) {
                    this.grid[x][y][z] = null;
                }
            }
        }
    }
    
    setupMainScene() {
        const container = document.getElementById('canvas-container');
        const width = 600;
        const height = 700;
        
        this.mainScene = new THREE.Scene();
        this.mainScene.background = new THREE.Color(0x000000);
        
        this.updateCameraPosition();
        
        this.mainRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.mainRenderer.setSize(width, height);
        container.appendChild(this.mainRenderer.domElement);
        
        // Create wireframe pit
        this.createPit();
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.mainScene.add(ambientLight);
        
        // Setup camera controls
        this.setupCameraControls();
    }
    
    setupNextPieceScene() {
        const canvas = document.getElementById('next-piece-canvas');
        const width = canvas.width;
        const height = canvas.height;
        
        this.nextScene = new THREE.Scene();
        this.nextScene.background = new THREE.Color(0x000000);
        
        this.nextCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        this.nextCamera.position.set(0, 2, 8);
        this.nextCamera.lookAt(0, 0, 0);
        
        this.nextRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.nextRenderer.setSize(width, height);
        canvas.appendChild(this.nextRenderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.nextScene.add(ambientLight);
    }
    
    createPit() {
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        
        // Create concentric rectangles for tunnel effect
        for (let y = 0; y <= this.PIT_HEIGHT; y++) {
            const points = [];
            const offset = y * 0.02;
            
            // Rectangle at this height level
            points.push(new THREE.Vector3(-this.PIT_WIDTH/2 - offset, y, -this.PIT_DEPTH/2 - offset));
            points.push(new THREE.Vector3(this.PIT_WIDTH/2 + offset, y, -this.PIT_DEPTH/2 - offset));
            points.push(new THREE.Vector3(this.PIT_WIDTH/2 + offset, y, this.PIT_DEPTH/2 + offset));
            points.push(new THREE.Vector3(-this.PIT_WIDTH/2 - offset, y, this.PIT_DEPTH/2 + offset));
            points.push(new THREE.Vector3(-this.PIT_WIDTH/2 - offset, y, -this.PIT_DEPTH/2 - offset));
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            this.mainScene.add(line);
        }
        
        // Vertical corner lines
        const corners = [
            [-this.PIT_WIDTH/2, -this.PIT_DEPTH/2],
            [this.PIT_WIDTH/2, -this.PIT_DEPTH/2],
            [this.PIT_WIDTH/2, this.PIT_DEPTH/2],
            [-this.PIT_WIDTH/2, this.PIT_DEPTH/2]
        ];
        
        corners.forEach(([x, z]) => {
            const points = [];
            points.push(new THREE.Vector3(x, 0, z));
            points.push(new THREE.Vector3(x, this.PIT_HEIGHT, z));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            this.mainScene.add(line);
        });
    }
    
    getPieceShapes() {
        // BASIC block set - 3D polycubes
        return {
            SINGLE: [[0, 0, 0]],
            DOUBLE: [[0, 0, 0], [1, 0, 0]],
            TRIPLE_LINE: [[0, 0, 0], [1, 0, 0], [2, 0, 0]],
            TRIPLE_L: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
            QUAD_SQUARE: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]],
            QUAD_T: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]],
            QUAD_L: [[0, 0, 0], [0, 1, 0], [0, 2, 0], [1, 0, 0]],
            QUAD_Z: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]],
            CUBE_2X2X2: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], 
                         [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]],
            CORNER_3D: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
            STAIR_3D: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
            CROSS_3D: [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1]]
        };
    }
    
    getRandomPieceType() {
        const types = Object.keys(this.getPieceShapes());
        return types[Math.floor(Math.random() * types.length)];
    }
    
    createPiece(type) {
        const shapes = this.getPieceShapes();
        const shape = shapes[type];
        
        const piece = {
            type: type,
            blocks: shape.map(([x, y, z]) => ({ x, y, z })),
            position: {
                x: Math.floor(this.PIT_WIDTH / 2),
                y: this.PIT_HEIGHT - 1,
                z: Math.floor(this.PIT_DEPTH / 2)
            },
            rotation: { x: 0, y: 0, z: 0 }
        };
        
        return piece;
    }
    
    spawnNewPiece() {
        if (this.nextPieceType === null) {
            this.nextPieceType = this.getRandomPieceType();
        }
        
        this.currentPiece = this.createPiece(this.nextPieceType);
        this.nextPieceType = this.getRandomPieceType();
        
        // Check if spawn position is blocked
        if (!this.isValidPosition(this.currentPiece)) {
            this.gameOver();
            return;
        }
        
        this.cubesPlayed++;
        this.updateGhostPiece();
        this.renderCurrentPiece();
        this.renderNextPiece();
    }
    
    renderCurrentPiece() {
        if (this.pieceGroup) {
            this.mainScene.remove(this.pieceGroup);
        }
        
        this.pieceGroup = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        this.currentPiece.blocks.forEach(block => {
            const cube = new THREE.LineSegments(edges, material);
            cube.position.set(block.x, block.y, block.z);
            this.pieceGroup.add(cube);
        });
        
        this.pieceGroup.position.set(
            this.currentPiece.position.x - this.PIT_WIDTH / 2,
            this.currentPiece.position.y,
            this.currentPiece.position.z - this.PIT_DEPTH / 2
        );
        
        this.mainScene.add(this.pieceGroup);
    }
    
    renderGhostPiece() {
        if (this.ghostGroup) {
            this.mainScene.remove(this.ghostGroup);
        }
        
        if (!this.ghostPiece) return;
        
        this.ghostGroup = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0x444444 });
        
        this.ghostPiece.blocks.forEach(block => {
            const cube = new THREE.LineSegments(edges, material);
            cube.position.set(block.x, block.y, block.z);
            this.ghostGroup.add(cube);
        });
        
        this.ghostGroup.position.set(
            this.ghostPiece.position.x - this.PIT_WIDTH / 2,
            this.ghostPiece.position.y,
            this.ghostPiece.position.z - this.PIT_DEPTH / 2
        );
        
        this.mainScene.add(this.ghostGroup);
    }
    
    updateGhostPiece() {
        if (!this.currentPiece) return;
        
        this.ghostPiece = JSON.parse(JSON.stringify(this.currentPiece));
        
        // Drop ghost to lowest valid position
        while (this.isValidPosition(this.ghostPiece)) {
            this.ghostPiece.position.y--;
        }
        this.ghostPiece.position.y++; // Move back up one
        
        this.renderGhostPiece();
    }
    
    renderNextPiece() {
        // Clear next scene
        while(this.nextScene.children.length > 0) { 
            this.nextScene.remove(this.nextScene.children[0]); 
        }
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.nextScene.add(ambientLight);
        
        const nextPiece = this.createPiece(this.nextPieceType);
        const group = new THREE.Group();
        const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        nextPiece.blocks.forEach(block => {
            const cube = new THREE.LineSegments(edges, material);
            cube.position.set(block.x, block.y, block.z);
            group.add(cube);
        });
        
        // Center the piece
        const centerX = nextPiece.blocks.reduce((sum, b) => sum + b.x, 0) / nextPiece.blocks.length;
        const centerY = nextPiece.blocks.reduce((sum, b) => sum + b.y, 0) / nextPiece.blocks.length;
        const centerZ = nextPiece.blocks.reduce((sum, b) => sum + b.z, 0) / nextPiece.blocks.length;
        
        group.position.set(-centerX, -centerY, -centerZ);
        this.nextScene.add(group);
    }
    
    isValidPosition(piece) {
        for (let block of piece.blocks) {
            const worldX = piece.position.x + block.x;
            const worldY = piece.position.y + block.y;
            const worldZ = piece.position.z + block.z;
            
            // Check bounds
            if (worldX < 0 || worldX >= this.PIT_WIDTH ||
                worldY < 0 || worldY >= this.PIT_HEIGHT ||
                worldZ < 0 || worldZ >= this.PIT_DEPTH) {
                return false;
            }
            
            // Check collision with stacked pieces
            if (this.grid[worldX][worldY][worldZ] !== null) {
                return false;
            }
        }
        return true;
    }
    
    rotatePiece(axis, direction) {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return;
        
        const originalBlocks = JSON.parse(JSON.stringify(this.currentPiece.blocks));
        
        // Rotate each block around the piece's center
        this.currentPiece.blocks.forEach(block => {
            let newX, newY, newZ;
            
            if (axis === 'x') {
                // Rotate around X axis
                newY = direction > 0 ? -block.z : block.z;
                newZ = direction > 0 ? block.y : -block.y;
                newX = block.x;
            } else if (axis === 'y') {
                // Rotate around Y axis
                newX = direction > 0 ? block.z : -block.z;
                newZ = direction > 0 ? -block.x : block.x;
                newY = block.y;
            } else if (axis === 'z') {
                // Rotate around Z axis
                newX = direction > 0 ? -block.y : block.y;
                newY = direction > 0 ? block.x : -block.x;
                newZ = block.z;
            }
            
            block.x = newX;
            block.y = newY;
            block.z = newZ;
        });
        
        if (!this.isValidPosition(this.currentPiece)) {
            // Rotation invalid, revert
            this.currentPiece.blocks = originalBlocks;
        } else {
            this.updateGhostPiece();
            this.renderCurrentPiece();
        }
    }
    
    movePiece(dx, dy, dz) {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return false;
        
        this.currentPiece.position.x += dx;
        this.currentPiece.position.y += dy;
        this.currentPiece.position.z += dz;
        
        if (!this.isValidPosition(this.currentPiece)) {
            // Move invalid, revert
            this.currentPiece.position.x -= dx;
            this.currentPiece.position.y -= dy;
            this.currentPiece.position.z -= dz;
            return false;
        }
        
        this.updateGhostPiece();
        this.renderCurrentPiece();
        return true;
    }
    
    hardDrop() {
        if (!this.currentPiece || this.isPaused || this.isGameOver) return;
        
        while (this.movePiece(0, -1, 0)) {
            this.score += 2; // Bonus for hard drop
        }
        
        this.lockPiece();
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // Add piece to grid
        this.currentPiece.blocks.forEach(block => {
            const worldX = this.currentPiece.position.x + block.x;
            const worldY = this.currentPiece.position.y + block.y;
            const worldZ = this.currentPiece.position.z + block.z;
            
            if (worldY >= 0 && worldY < this.PIT_HEIGHT) {
                this.grid[worldX][worldY][worldZ] = {
                    x: worldX,
                    y: worldY,
                    z: worldZ
                };
            }
        });
        
        // Add visual representation to stacked pieces
        this.addStackedPieceVisual();
        
        // Check for complete layers
        this.checkAndClearLayers();
        
        // Remove current piece from scene
        if (this.pieceGroup) {
            this.mainScene.remove(this.pieceGroup);
            this.pieceGroup = null;
        }
        
        if (this.ghostGroup) {
            this.mainScene.remove(this.ghostGroup);
            this.ghostGroup = null;
        }
        
        this.currentPiece = null;
        this.updateUI();
        
        // Spawn new piece
        setTimeout(() => this.spawnNewPiece(), 100);
    }
    
    addStackedPieceVisual() {
        const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        const group = new THREE.Group();
        
        this.currentPiece.blocks.forEach(block => {
            const worldX = this.currentPiece.position.x + block.x;
            const worldY = this.currentPiece.position.y + block.y;
            const worldZ = this.currentPiece.position.z + block.z;
            
            if (worldY >= 0 && worldY < this.PIT_HEIGHT) {
                const cube = new THREE.LineSegments(edges, material);
                cube.position.set(
                    worldX - this.PIT_WIDTH / 2,
                    worldY,
                    worldZ - this.PIT_DEPTH / 2
                );
                group.add(cube);
            }
        });
        
        this.mainScene.add(group);
        this.stackedPieces.push(group);
    }
    
    checkAndClearLayers() {
        let layersCleared = 0;
        
        for (let y = 0; y < this.PIT_HEIGHT; y++) {
            let layerFull = true;
            
            for (let x = 0; x < this.PIT_WIDTH; x++) {
                for (let z = 0; z < this.PIT_DEPTH; z++) {
                    if (this.grid[x][y][z] === null) {
                        layerFull = false;
                        break;
                    }
                }
                if (!layerFull) break;
            }
            
            if (layerFull) {
                layersCleared++;
                this.clearLayer(y);
            }
        }
        
        if (layersCleared > 0) {
            // Scoring: 100 points per layer, bonus for multiple layers
            const basePoints = layersCleared * 100;
            const bonus = layersCleared > 1 ? layersCleared * 50 : 0;
            this.score += basePoints + bonus;
            
            // Level up every 500 points
            this.level = Math.floor(this.score / 500) + 1;
            this.fallSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }
    
    clearLayer(layerY) {
        // Remove blocks from grid
        for (let x = 0; x < this.PIT_WIDTH; x++) {
            for (let z = 0; z < this.PIT_DEPTH; z++) {
                this.grid[x][layerY][z] = null;
            }
        }
        
        // Remove visual representation and shift down pieces above
        const newStackedPieces = [];
        
        this.stackedPieces.forEach(group => {
            const keepGroup = new THREE.Group();
            let hasBlocks = false;
            
            group.children.forEach(cube => {
                const worldY = cube.position.y;
                
                if (worldY === layerY) {
                    // Remove this cube (part of cleared layer)
                } else if (worldY > layerY) {
                    // Shift down
                    cube.position.y -= 1;
                    keepGroup.add(cube);
                    hasBlocks = true;
                } else {
                    keepGroup.add(cube);
                    hasBlocks = true;
                }
            });
            
            if (hasBlocks) {
                this.mainScene.remove(group);
                this.mainScene.add(keepGroup);
                newStackedPieces.push(keepGroup);
            } else {
                this.mainScene.remove(group);
            }
        });
        
        this.stackedPieces = newStackedPieces;
        
        // Update grid positions
        for (let y = layerY + 1; y < this.PIT_HEIGHT; y++) {
            for (let x = 0; x < this.PIT_WIDTH; x++) {
                for (let z = 0; z < this.PIT_DEPTH; z++) {
                    if (this.grid[x][y][z] !== null) {
                        this.grid[x][y-1][z] = this.grid[x][y][z];
                        this.grid[x][y][z] = null;
                    }
                }
            }
        }
    }
    
    setupControls() {
        // Keyboard controls for game
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) {
                if (e.code === 'Space') {
                    this.restartGame();
                }
                return;
            }
            
            switch(e.code) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0, 0);
                    break;
                case 'ArrowUp':
                    this.movePiece(0, 0, -1);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 0, 1);
                    break;
                case 'KeyW':
                    this.rotatePiece('z', 1);
                    break;
                case 'KeyS':
                    this.rotatePiece('z', -1);
                    break;
                case 'KeyA':
                    this.rotatePiece('x', -1);
                    break;
                case 'KeyD':
                    this.rotatePiece('x', 1);
                    break;
                case 'KeyQ':
                    this.rotatePiece('y', -1);
                    break;
                case 'KeyE':
                    this.rotatePiece('y', 1);
                    break;
                case 'Space':
                    this.hardDrop();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        });
        
        // Mouse controls for camera
        const canvas = this.mainRenderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            canvas.style.cursor = 'grabbing';
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            
            this.cameraAngleX += deltaX * 0.005;
            this.cameraAngleY += deltaY * 0.005;
            
            // Limit vertical angle to avoid flipping
            this.cameraAngleY = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.cameraAngleY));
            
            this.updateCameraPosition();
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraDistance += e.deltaY * 0.01;
            this.cameraDistance = Math.max(10, Math.min(40, this.cameraDistance));
            this.updateCameraPosition();
        }, { passive: false });
        
        canvas.style.cursor = 'grab';
    }
    
    togglePause() {
        if (this.isGameOver) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pause-overlay').style.display = this.isPaused ? 'block' : 'none';
    }
    
    gameOver() {
        this.isGameOver = true;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('blockOutHighScore', this.highScore);
        }
        
        this.updateUI();
        document.getElementById('game-over-overlay').style.display = 'block';
    }
    
    restartGame() {
        this.score = 0;
        this.cubesPlayed = 0;
        this.level = 1;
        this.fallSpeed = 1000;
        this.isGameOver = false;
        this.isPaused = false;
        
        // Clear grid
        this.initializeGrid();
        
        // Remove all stacked pieces
        this.stackedPieces.forEach(group => {
            this.mainScene.remove(group);
        });
        this.stackedPieces = [];
        
        // Hide overlays
        document.getElementById('game-over-overlay').style.display = 'none';
        document.getElementById('pause-overlay').style.display = 'none';
        
        // Remove current piece
        if (this.pieceGroup) {
            this.mainScene.remove(this.pieceGroup);
            this.pieceGroup = null;
        }
        
        if (this.ghostGroup) {
            this.mainScene.remove(this.ghostGroup);
            this.ghostGroup = null;
        }
        
        this.currentPiece = null;
        this.nextPieceType = null;
        
        this.updateUI();
        this.spawnNewPiece();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('cubes-played').textContent = this.cubesPlayed;
        document.getElementById('high-score').textContent = this.highScore;
        document.getElementById('level').textContent = this.level;
    }
    
    updateCameraPosition() {
        if (!this.mainCamera) return;
        
        const x = this.cameraDistance * Math.sin(this.cameraAngleX) * Math.cos(this.cameraAngleY);
        const y = this.cameraDistance * Math.sin(this.cameraAngleY) + 6;
        const z = this.cameraDistance * Math.cos(this.cameraAngleX) * Math.cos(this.cameraAngleY);
        
        this.mainCamera.position.set(x, y, z);
        this.mainCamera.lookAt(0, 5, 0);
    }
    
    setupCameraControls() {
        // Camera controls are setup in setupControls method
    }
    
    animate(currentTime = 0) {
        requestAnimationFrame((time) => this.animate(time));
        
        if (!this.isPaused && !this.isGameOver && this.currentPiece) {
            // Auto-fall
            if (currentTime - this.lastFallTime > this.fallSpeed) {
                if (!this.movePiece(0, -1, 0)) {
                    // Can't move down, lock piece
                    this.lockPiece();
                }
                this.lastFallTime = currentTime;
            }
        }
        
        // Render scenes
        if (this.mainRenderer && this.mainScene && this.mainCamera) {
            this.mainRenderer.render(this.mainScene, this.mainCamera);
        }
        
        if (this.nextRenderer && this.nextScene && this.nextCamera) {
            this.nextRenderer.render(this.nextScene, this.nextCamera);
        }
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new BlockOut();
});
