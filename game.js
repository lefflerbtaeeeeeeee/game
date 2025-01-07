// Game Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

const playerWidth = 50;
const playerHeight = 50;
const bulletWidth = 5;
const bulletHeight = 10;
const targetWidth = 30;
const targetHeight = 30;
const enemyWidth = 40;
const enemyHeight = 40;
const powerUpWidth = 20;
const powerUpHeight = 20;
const bossWidth = 100;
const bossHeight = 100;

let playerX = SCREEN_WIDTH / 4 - playerWidth / 2;
let playerY = SCREEN_HEIGHT - 100;
let playerSpeed = 5;
let playerAngle = 0;

let secondPlayerX = SCREEN_WIDTH * 3 / 4 - playerWidth / 2;
let secondPlayerY = SCREEN_HEIGHT - 100;
let secondPlayerSpeed = 5;
let secondPlayerAngle = 0;

let bullets = [];
let targets = [];
let enemies = [];
let powerUps = [];
let score = 0;
let level = 1;
let gameOver = false;
let doubleDamage = false;
let rapidFire = false;
let startTime = Date.now();

// Sounds
const shootSound = new Audio('shoot.mp3');
const hitTargetSound = new Audio('hit-target.mp3');
const hitEnemySound = new Audio('hit-enemy.mp3');
const enemyShootSound = new Audio('enemy-shoot.mp3');
const explosionSound = new Audio('explosion.mp3');
const bossSound = new Audio('boss-sound.mp3');

// Loading screen elements
let assetsLoaded = false;
let totalAssets = 7;  // Number of assets to load (sounds, images, etc.)
let loadedAssets = 0;

// Key tracking for player movement and shooting
let keys = {};

// Event listeners for keydown and keyup
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// Asset loading function
function loadAssets() {
    shootSound.onload = function() { loadedAssets++; updateLoadingScreen(); };
    hitTargetSound.onload = function() { loadedAssets++; updateLoadingScreen(); };
    hitEnemySound.onload = function() { loadedAssets++; updateLoadingScreen(); };
    enemyShootSound.onload = function() { loadedAssets++; updateLoadingScreen(); };
    explosionSound.onload = function() { loadedAssets++; updateLoadingScreen(); };
    bossSound.onload = function() { loadedAssets++; updateLoadingScreen(); };

    // Simulate loading other assets here (images, etc.)
    // Example: You can load images like this:
    // const someImage = new Image();
    // someImage.src = 'path/to/image.png';
    // someImage.onload = () => {
    //   loadedAssets++;
    //   updateLoadingScreen();
    // }

    // Begin loading sounds
    shootSound.src = 'shoot.mp3';
    hitTargetSound.src = 'hit-target.mp3';
    hitEnemySound.src = 'hit-enemy.mp3';
    enemyShootSound.src = 'enemy-shoot.mp3';
    explosionSound.src = 'explosion.mp3';
    bossSound.src = 'boss-sound.mp3';
}

// Update the loading screen
function updateLoadingScreen() {
    if (loadedAssets === totalAssets) {
        assetsLoaded = true;
        startGame();
    }

    // Draw loading screen
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Loading... ' + Math.floor((loadedAssets / totalAssets) * 100) + '%', SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2);
}

// Game start function
function startGame() {
    // Hide the loading screen and start the game loop
    gameLoop();
}

// Bullet class
class Bullet {
    constructor(x, y, angle, damage = 10) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 7;
        this.damage = damage;
    }

    move() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, bulletWidth, bulletHeight);
    }
}

// Target class
class Target {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    move() {
        this.y += this.speed;
        if (this.y > SCREEN_HEIGHT) {
            this.y = -targetHeight;
            this.x = Math.random() * (SCREEN_WIDTH - targetWidth);
        }
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, targetWidth, targetHeight);
    }

    checkCollision(bullet) {
        return bullet.x < this.x + targetWidth &&
               bullet.x + bulletWidth > this.x &&
               bullet.y < this.y + targetHeight &&
               bullet.y + bulletHeight > this.y;
    }
}

// PowerUp class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'doubleDamage' or 'rapidFire'
        this.duration = 5000; // Power-up lasts 5 seconds
        this.startTime = Date.now();
    }

    draw() {
        ctx.fillStyle = this.type === 'doubleDamage' ? 'blue' : 'green';
        ctx.fillRect(this.x, this.y, powerUpWidth, powerUpHeight);
    }

    checkCollision(player) {
        return player.x < this.x + powerUpWidth &&
               player.x + playerWidth > this.x &&
               player.y < this.y + powerUpHeight &&
               player.y + playerHeight > this.y;
    }

    expired() {
        return Date.now() - this.startTime > this.duration;
    }
}

// Enemy class
class Enemy {
    constructor(x, y, speed, shootRate) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.shootRate = shootRate;
        this.lastShotTime = Date.now();
    }

    move() {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const angle = Math.atan2(dy, dx);
        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);
    }

    draw() {
        ctx.fillStyle = 'purple';
        ctx.fillRect(this.x, this.y, enemyWidth, enemyHeight);
    }

    shoot() {
        if (Date.now() - this.lastShotTime > this.shootRate) {
            let angle = Math.atan2(playerY - this.y, playerX - this.x);
            bullets.push(new Bullet(this.x + enemyWidth / 2, this.y + enemyHeight / 2, angle, 10));
            enemyShootSound.play();
            this.lastShotTime = Date.now();
        }
    }
}

// Game loop function
function gameLoop() {
    if (!assetsLoaded) {
        return; // Do nothing until assets are loaded
    }

    // Clear canvas
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Handle player movement
    if (keys['ArrowLeft']) playerX -= playerSpeed;
    if (keys['ArrowRight']) playerX += playerSpeed;
    if (keys['ArrowUp']) playerY -= playerSpeed;
    if (keys['ArrowDown']) playerY += playerSpeed;

    // Handle second player movement
    if (keys['KeyA']) secondPlayerX -= secondPlayerSpeed;
    if (keys['KeyD']) secondPlayerX += secondPlayerSpeed;
    if (keys['KeyW']) secondPlayerY -= secondPlayerSpeed;
    if (keys['KeyS']) secondPlayerY += secondPlayerSpeed;

    // Aim with mouse (or use arrow keys for more control)
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    playerAngle = Math.atan2(mouseY - playerY - playerHeight / 2, mouseX - playerX - playerWidth / 2);

    const secondPlayerMouseX = event.clientX + 50;
    const secondPlayerMouseY = event.clientY + 50;
    secondPlayerAngle = Math.atan2(secondPlayerMouseY - secondPlayerY - playerHeight / 2, secondPlayerMouseX - secondPlayerX - playerWidth / 2);

    // Shoot bullet (Rapid Fire Power-Up)
    if (keys['Space']) {
        let damage = doubleDamage ? 20 : 10;
        bullets.push(new Bullet(playerX + playerWidth / 2, playerY + playerHeight / 2, playerAngle, damage));
        shootSound.play();
    }

    // Shoot second player bullet
    if (keys['Enter']) {
        let damage = doubleDamage ? 20 : 10;
        bullets.push(new Bullet(secondPlayerX + playerWidth / 2, secondPlayerY + playerHeight / 2, secondPlayerAngle, damage));
        shootSound.play();
    }

    // Move bullets and check for collisions with targets and enemies
    bullets.forEach(bullet => {
        bullet.move();
        bullet.draw();
    });

    // Update and move targets
    targets.forEach(target => {
        target.move();
        target.draw();
    });

    // Update enemies
    enemies.forEach(enemy => {
        enemy.move();
        enemy.draw();
        enemy.shoot();
    });

    // Update power-ups
    powerUps.forEach((powerUp, index) => {
        powerUp.draw();
        if (powerUp.checkCollision(playerX, playerY)) {
            if (powerUp.type === 'doubleDamage') doubleDamage = true;
            if (powerUp.type === 'rapidFire') rapidFire = true;
            powerUps.splice(index, 1); // Remove power-up
        }
        if (powerUp.expired()) {
            powerUps.splice(index, 1); // Remove expired power-up
        }
    });

    // Create new power-up
    if (Math.random() < 0.01) createPowerUp();

    // Draw players
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(secondPlayerX, secondPlayerY, playerWidth, playerHeight);

    // Display score and timer
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Time: ${elapsedTime}s`, SCREEN_WIDTH - 150, 30);
}

