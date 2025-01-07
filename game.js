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

// Key tracking for player movement and shooting
let keys = {};

// Event listeners for keydown and keyup
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

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

// Boss class (Advanced with multiple attack phases and special moves)
class Boss {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.health = type === 'Stage1' ? 100 : 200;
        this.speed = 2;
        this.type = type;
        this.lastShotTime = Date.now();
        this.attackPhase = 1; // Phase 1 at the start
        this.minions = [];
        this.specialMoveCooldown = 0;
    }

    move() {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const angle = Math.atan2(dy, dx);
        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);
    }

    shoot() {
        if (this.attackPhase === 1) {
            // Phase 1: Regular attack
            if (Date.now() - this.lastShotTime > 1000) {
                let angle = Math.atan2(playerY - this.y, playerX - this.x);
                bullets.push(new Bullet(this.x + bossWidth / 2, this.y + bossHeight / 2, angle, 10));
                enemyShootSound.play();
                this.lastShotTime = Date.now();
            }
        } else if (this.attackPhase === 2) {
            // Phase 2: Split attack pattern
            if (Date.now() - this.lastShotTime > 500) {
                let angles = [-Math.PI / 4, 0, Math.PI / 4];
                angles.forEach(angle => {
                    bullets.push(new Bullet(this.x + bossWidth / 2, this.y + bossHeight / 2, angle, 10));
                });
                enemyShootSound.play();
                this.lastShotTime = Date.now();
            }
        } else if (this.attackPhase === 3) {
            // Phase 3: AoE (Area of Effect) attack
            if (Date.now() - this.specialMoveCooldown > 3000) {
                // Launch an AoE attack in all directions
                for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 4) {
                    bullets.push(new Bullet(this.x + bossWidth / 2, this.y + bossHeight / 2, angle, 15));
                }
                explosionSound.play();
                this.specialMoveCooldown = Date.now();
            }
        }
    }

    draw() {
        ctx.fillStyle = this.type === 'Stage1' ? 'orange' : 'red';
        ctx.fillRect(this.x, this.y, bossWidth, bossHeight);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            explosionSound.play();
            score += 100;
            return true;
        }
        return false;
    }

    summonMinions() {
        if (this.type === 'Stage2' && this.minions.length === 0) {
            for (let i = 0; i < 3; i++) {
                this.minions.push(new Enemy(this.x + Math.random() * 50, this.y + Math.random() * 50, 2, 1000));
            }
        }
    }

    switchPhase() {
        if (this.attackPhase === 1 && this.health <= 50) {
            this.attackPhase = 2;
        } else if (this.attackPhase === 2 && this.health <= 25) {
            this.attackPhase = 3;
        }
    }
}

// Create random target
function createTarget() {
    const x = Math.random() * (SCREEN_WIDTH - targetWidth);
    const y = Math.random() * (SCREEN_HEIGHT - 200);
    targets.push(new Target(x, y, Math.random() * 2 + 2));
}

// Create random power-up
function createPowerUp() {
    const x = Math.random() * (SCREEN_WIDTH - powerUpWidth);
    const y = Math.random() * (SCREEN_HEIGHT - 200);
    const type = Math.random() > 0.5 ? 'doubleDamage' : 'rapidFire';
    powerUps.push(new PowerUp(x, y, type));
}

// Update game state
function update() {
    if (gameOver) return;

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
        if (rapidFire || Date.now() - lastShotTime > 200) {
            let damage = doubleDamage ? 20 : 10;
            bullets.push(new Bullet(playerX + playerWidth / 2, playerY + playerHeight / 2, playerAngle, damage));
            shootSound.play();
            lastShotTime = Date.now();
        }
    }

    // Shoot second player bullet
    if (keys['Enter']) {
        if (rapidFire || Date.now() - lastShotTime > 200) {
            let damage = doubleDamage ? 20 : 10;
            bullets.push(new Bullet(secondPlayerX + playerWidth / 2, secondPlayerY + playerHeight / 2, secondPlayerAngle, damage));
            shootSound.play();
            lastShotTime = Date.now();
        }
    }

    // Move bullets and check for collisions with targets and enemies
    bullets.forEach(bullet => {
        bullet.move();
        bullet.draw();

        targets.forEach((target, index) => {
            if (target.checkCollision(bullet)) {
                score += 10;
                targets.splice(index, 1); // Remove target
                hitTargetSound.play();
                explosionSound.play();
            }
        });

        enemies.forEach((enemy, index) => {
            if (enemy.checkCollision(bullet)) {
                enemies.splice(index, 1); // Remove enemy
                hitEnemySound.play();
                explosionSound.play();
            }
        });

        if (boss && boss.takeDamage(bullet.damage)) {
            enemies = []; // Remove all enemies after boss is defeated
            boss = null;  // Remove boss
        }
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

    // Update boss
    if (boss) {
        boss.move();
        boss.shoot();
        boss.summonMinions();
        boss.switchPhase();
        boss.draw();
    }

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

    // Game Over logic
    if (targets.length === 0) {
        if (boss == null) {
            // Boss level
            boss = new Boss(SCREEN_WIDTH / 2 - bossWidth / 2, 50, level % 2 === 0 ? 'Stage2' : 'Stage1');
        } else {
            gameOver = true;
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('GAME OVER', SCREEN_WIDTH / 2 - 100, SCREEN_HEIGHT / 2);
        }
    }
}

// Start game loop
let lastShotTime = Date.now();
createTarget();
gameLoop();
