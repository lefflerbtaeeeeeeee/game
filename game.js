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
