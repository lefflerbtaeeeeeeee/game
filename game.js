// Game Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

const playerWidth = 50;
const playerHeight = 50;
const playerVelocity = 5;
const jumpStrength = 15;
const gravity = 0.8;

let playerX = 100;
let playerY = SCREEN_HEIGHT - playerHeight - 100;
let yVelocity = 0;
let jumping = false;
let falling = false;
let checkpointReached = false;

const blocks = [
    { x: 100, y: SCREEN_HEIGHT - 200, width: 200, height: 20 },
    { x: 350, y: SCREEN_HEIGHT - 300, width: 200, height: 20 },
    { x: 600, y: SCREEN_HEIGHT - 400, width: 200, height: 20 }
];

const checkpoint = { x: 650, y: SCREEN_HEIGHT - 500, width: 50, height: 50 };

// Event Listener for Player Controls
let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Game Loop
function gameLoop() {
    // Clear the screen
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Player movement
    if (keys['ArrowLeft']) {
        playerX -= playerVelocity;
    }
    if (keys['ArrowRight']) {
        playerX += playerVelocity;
    }

    // Jumping
    if (keys['Space'] && !jumping && !falling) {
        jumping = true;
        yVelocity = -jumpStrength;
    }

    // Apply gravity
    if (jumping || falling) {
        yVelocity += gravity;
        playerY += yVelocity;
    }

    // Check for collisions with blocks (platforms)
    let onGround = false;
    for (let block of blocks) {
        if (playerY + playerHeight <= block.y && playerY + playerHeight + yVelocity >= block.y) {
            if (playerX + playerWidth / 2 > block.x && playerX + playerWidth / 2 < block.x + block.width) {
                playerY = block.y - playerHeight;
                yVelocity = 0;
                jumping = false;
                falling = false;
                onGround = true;
                break;
            }
        }
    }

    // Fall if not on the ground
    if (!onGround && playerY + playerHeight < SCREEN_HEIGHT) {
        falling = true;
    } else {
        falling = false;
    }

    // Check if player reaches the checkpoint
    if (
        playerX + playerWidth > checkpoint.x &&
        playerX < checkpoint.x + checkpoint.width &&
        playerY + playerHeight > checkpoint.y &&
        playerY < checkpoint.y + checkpoint.height
    ) {
        checkpointReached = true;
    }

    // Draw player
    ctx.fillStyle = 'green';
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

    // Draw blocks
    ctx.fillStyle = 'black';
    for (let block of blocks) {
        ctx.fillRect(block.x, block.y, block.width, block.height);
    }

    // Draw checkpoint
    if (!checkpointReached) {
        ctx.fillStyle = 'red';
        ctx.fillRect(checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height);
    }

    // Display checkpoint reached message
    if (checkpointReached) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Checkpoint Reached!', SCREEN_WIDTH / 2 - 150, SCREEN_HEIGHT / 2);
    }

    // Repeat the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
// Game Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

const playerWidth = 50;
const playerHeight = 50;
const playerVelocity = 5;
const jumpStrength = 15;
const gravity = 0.8;

let playerX = 100;
let playerY = SCREEN_HEIGHT - playerHeight - 100;
let yVelocity = 0;
let jumping = false;
let falling = false;
let checkpointReached = false;
let points = 0;  // Points system
let startTime = Date.now();  // Timer start time

const blocks = [
    { x: 100, y: SCREEN_HEIGHT - 200, width: 200, height: 20 },
    { x: 350, y: SCREEN_HEIGHT - 300, width: 200, height: 20 },
    { x: 600, y: SCREEN_HEIGHT - 400, width: 200, height: 20 }
];

const checkpoint = { x: 650, y: SCREEN_HEIGHT - 500, width: 50, height: 50 };

// Event Listener for Player Controls
let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Game Loop
function gameLoop() {
    // Clear the screen
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Player movement
    if (keys['ArrowLeft']) {
        playerX -= playerVelocity;
    }
    if (keys['ArrowRight']) {
        playerX += playerVelocity;
    }

    // Jumping
    if (keys['Space'] && !jumping && !falling) {
        jumping = true;
        yVelocity = -jumpStrength;
    }

    // Apply gravity
    if (jumping || falling) {
        yVelocity += gravity;
        playerY += yVelocity;
    }

    // Check for collisions with blocks (platforms)
    let onGround = false;
    for (let block of blocks) {
        if (playerY + playerHeight <= block.y && playerY + playerHeight + yVelocity >= block.y) {
            if (playerX + playerWidth / 2 > block.x && playerX + playerWidth / 2 < block.x + block.width) {
                playerY = block.y - playerHeight;
                yVelocity = 0;
                jumping = false;
                falling = false;
                if (!block.landed) {
                    block.landed = true; // Mark this block as "landed" by the player
                    points += 10;  // Add points for landing on a new block
                }
                onGround = true;
                break;
            }
        }
    }

    // Fall if not on the ground
    if (!onGround && playerY + playerHeight < SCREEN_HEIGHT) {
        falling = true;
    } else {
        falling = false;
    }

    // Check if player reaches the checkpoint
    if (
        playerX + playerWidth > checkpoint.x &&
        playerX < checkpoint.x + checkpoint.width &&
        playerY + playerHeight > checkpoint.y &&
        playerY < checkpoint.y + checkpoint.height
    ) {
        checkpointReached = true;
        points += 50;  // Add points for reaching the checkpoint
    }

    // Timer logic
    let elapsedTime = Math.floor((Date.now() - startTime) / 1000);  // Timer in seconds

    // Draw player
    ctx.fillStyle = 'green';
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

    // Draw blocks
    ctx.fillStyle = 'black';
    for (let block of blocks) {
        ctx.fillRect(block.x, block.y, block.width, block.height);
    }

    // Draw checkpoint
    if (!checkpointReached) {
        ctx.fillStyle = 'red';
        ctx.fillRect(checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height);
    }

    // Display checkpoint reached message
    if (checkpointReached) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Checkpoint Reached!', SCREEN_WIDTH / 2 - 150, SCREEN_HEIGHT / 2);
    }

    // Display Timer and Points
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Time: ${elapsedTime}s`, 20, 30);
    ctx.fillText(`Points: ${points}`, 20, 60);

    // Repeat the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
