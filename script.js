// 画面管理
const screens = {
    title: document.getElementById('titleScreen'),
    game: document.getElementById('gameScreen'),
    result: document.getElementById('resultScreen')
};

// タイトル画面の要素
const playerNameInput = document.getElementById('playerName');
const startButton = document.getElementById('startButton');
const backToTitleButton = document.getElementById('backToTitleButton');

// ゲーム画面の要素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');

// リザルト画面の要素
const scoreList = document.getElementById('scoreList');

// ゲーム状態
let gameState = {
    playerName: '',
    score: 0,
    isRunning: false,
    lastBulletTime: 0,
    lastEnemySpawn: 0,
    bossSpawned: false,
    bossDefeated: false,
    lastBossBulletTime: 0,
    startTime: 0, // ゲーム開始時間
    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        j: false
    }
};

// ゲームオブジェクト
const gameObjects = {
    player: null,
    bullets: [],
    enemies: [],
    boss: null,
    bossBullets: []
};

// 画像リソース
const images = {
    player: null,
    enemy: null,
    boss: null
};

// 画像の読み込み
function loadImages() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalImages = 3;

        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                resolve();
            }
        };

        // プレイヤー画像
        images.player = new Image();
        images.player.onload = checkAllLoaded;
        images.player.onerror = checkAllLoaded;
        images.player.src = 'Hiroto.png';

        // 敵画像
        images.enemy = new Image();
        images.enemy.onload = checkAllLoaded;
        images.enemy.onerror = checkAllLoaded;
        images.enemy.src = 'Ko.png';

        // ボス画像
        images.boss = new Image();
        images.boss.onload = checkAllLoaded;
        images.boss.onerror = checkAllLoaded;
        images.boss.src = 'Shoudai.png';
    });
}

// 定数
const BULLET_INTERVAL = 250; // ミリ秒（発射レートを下げる）
const ENEMY_SPAWN_INTERVAL = 800; // ミリ秒（敵の出現頻度を上げる）
const PLAYER_SPEED = 4; // 移動速度を少し下げる
const BULLET_SPEED = 5; // 弾の速度を下げる
const ENEMY_SPEED = 2;
const PLAYER_SIZE = 30;
const BULLET_SIZE = 5;
const ENEMY_SIZE = 25;
const ENEMY_HP = 5; // 敵の体力を5に増やす
const BOSS_SCORE = 150; // ボス出現スコア
const BOSS_HP = 50; // ボスの体力
const BOSS_SIZE = 50; // ボスのサイズ
const BOSS_SPEED = 3; // ボスの移動速度
const BOSS_BULLET_SPEED = 4; // ボスの弾の速度
const BOSS_BULLET_INTERVAL = 1000; // ボスの弾発射間隔（ミリ秒）
const BOSS_BULLET_SIZE = 8; // ボスの弾のサイズ

// 画面遷移関数
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

// Canvasサイズの設定
function resizeCanvas() {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}

// プレイヤークラス
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 50;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
    }

    update() {
        // キーボード入力に基づいて移動
        if (gameState.keys.a) {
            this.x -= PLAYER_SPEED;
        }
        if (gameState.keys.d) {
            this.x += PLAYER_SPEED;
        }
        if (gameState.keys.w) {
            this.y -= PLAYER_SPEED;
        }
        if (gameState.keys.s) {
            this.y += PLAYER_SPEED;
        }
        
        // 画面外に出ないように制限
        this.x = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(canvas.height - this.height / 2, this.y));
    }

    draw() {
        if (images.player && images.player.complete) {
            // 画像を描画
            ctx.drawImage(
                images.player,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            // 画像が読み込まれていない場合は円で表示
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// 弾クラス
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = BULLET_SIZE;
        this.height = BULLET_SIZE;
    }

    update() {
        this.y -= BULLET_SPEED;
    }

    draw() {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return this.y < 0;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// 敵クラス
class Enemy {
    constructor(x) {
        this.x = x;
        this.y = -ENEMY_SIZE;
        this.width = ENEMY_SIZE;
        this.height = ENEMY_SIZE;
        this.hp = ENEMY_HP;
    }

    update() {
        this.y += ENEMY_SPEED;
    }

    draw() {
        if (images.enemy && images.enemy.complete) {
            // 画像を描画
            ctx.drawImage(
                images.enemy,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            // 画像が読み込まれていない場合は円で表示
            ctx.fillStyle = '#F44336';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // HP表示
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.hp, this.x, this.y + this.height / 2 + 15);
    }

    takeDamage() {
        this.hp--;
        return this.hp <= 0;
    }

    isOffScreen() {
        return this.y > canvas.height;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// ボス敵クラス
class BossEnemy {
    constructor() {
        this.x = canvas.width / 2;
        this.y = BOSS_SIZE + 20;
        this.width = BOSS_SIZE;
        this.height = BOSS_SIZE;
        this.hp = BOSS_HP;
        this.direction = 1; // 1: 右, -1: 左
    }

    update() {
        // 左右に移動
        this.x += BOSS_SPEED * this.direction;
        
        // 画面端で反転
        if (this.x <= this.width / 2 || this.x >= canvas.width - this.width / 2) {
            this.direction *= -1;
        }
        
        // 画面内に制限
        this.x = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, this.x));
    }

    draw() {
        if (images.boss && images.boss.complete) {
            // 画像を描画
            ctx.drawImage(
                images.boss,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            // 画像が読み込まれていない場合は円で表示
            ctx.fillStyle = '#9C27B0';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // HP表示
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS: ${this.hp}`, this.x, this.y + this.height / 2 + 20);
        
        // HPバー
        const barWidth = 100;
        const barHeight = 8;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 15;
        
        // 背景
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // HPバー
        const hpPercent = this.hp / BOSS_HP;
        ctx.fillStyle = hpPercent > 0.5 ? '#4CAF50' : hpPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    }

    takeDamage() {
        this.hp--;
        return this.hp <= 0;
    }

    shoot() {
        // プレイヤーに向かって弾を発射
        const dx = gameObjects.player.x - this.x;
        const dy = gameObjects.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const vx = (dx / distance) * BOSS_BULLET_SPEED;
        const vy = (dy / distance) * BOSS_BULLET_SPEED;
        
        gameObjects.bossBullets.push(new BossBullet(this.x, this.y + this.height / 2, vx, vy));
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// ボスの弾クラス
class BossBullet {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = BOSS_BULLET_SIZE;
        this.height = BOSS_BULLET_SIZE;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 光る効果
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// 当たり判定
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ゲーム初期化
function initGame() {
    gameObjects.player = new Player();
    gameObjects.bullets = [];
    gameObjects.enemies = [];
    gameObjects.boss = null;
    gameObjects.bossBullets = [];
    gameState.score = 0;
    gameState.isRunning = true;
    gameState.startTime = Date.now(); // ゲーム開始時間を記録
    gameState.lastBulletTime = Date.now();
    gameState.lastEnemySpawn = Date.now();
    gameState.bossSpawned = false;
    gameState.bossDefeated = false;
    gameState.lastBossBulletTime = Date.now();
    updateScoreDisplay();
}

// スコア表示更新
function updateScoreDisplay() {
    scoreDisplay.textContent = `スコア: ${gameState.score}`;
}

// 弾の発射（手動）
function shootBullet() {
    // jキーが押された時のみ発射
    if (gameState.keys.j) {
        const now = Date.now();
        if (now - gameState.lastBulletTime >= BULLET_INTERVAL) {
            gameObjects.bullets.push(new Bullet(gameObjects.player.x, gameObjects.player.y - PLAYER_SIZE / 2));
            gameState.lastBulletTime = now;
        }
    }
}

// 敵の生成
function spawnEnemy() {
    // ボス出現中は通常敵を生成しない
    if (gameState.bossSpawned && gameObjects.boss) {
        return;
    }
    
    const now = Date.now();
    if (now - gameState.lastEnemySpawn >= ENEMY_SPAWN_INTERVAL) {
        const x = Math.random() * (canvas.width - ENEMY_SIZE) + ENEMY_SIZE / 2;
        gameObjects.enemies.push(new Enemy(x));
        gameState.lastEnemySpawn = now;
    }
}

// ボスの生成
function spawnBoss() {
    if (!gameState.bossSpawned && gameState.score >= BOSS_SCORE) {
        gameObjects.boss = new BossEnemy();
        gameState.bossSpawned = true;
        // 既存の通常敵をクリア
        gameObjects.enemies = [];
    }
}

// ボスの弾発射
function bossShoot() {
    if (!gameObjects.boss) return;
    
    const now = Date.now();
    if (now - gameState.lastBossBulletTime >= BOSS_BULLET_INTERVAL) {
        gameObjects.boss.shoot();
        gameState.lastBossBulletTime = now;
    }
}

// 衝突判定と処理
function handleCollisions() {
    const playerBounds = gameObjects.player.getBounds();
    
    // プレイヤーの弾と通常敵の衝突
    for (let i = gameObjects.bullets.length - 1; i >= 0; i--) {
        const bullet = gameObjects.bullets[i];
        for (let j = gameObjects.enemies.length - 1; j >= 0; j--) {
            const enemy = gameObjects.enemies[j];
            if (checkCollision(bullet.getBounds(), enemy.getBounds())) {
                // 敵にダメージ
                const isDestroyed = enemy.takeDamage();
                gameObjects.bullets.splice(i, 1);
                
                if (isDestroyed) {
                    gameObjects.enemies.splice(j, 1);
                    gameState.score += 10;
                    updateScoreDisplay();
                }
                break;
            }
        }
    }
    
    // プレイヤーの弾とボスの衝突
    if (gameObjects.boss) {
        for (let i = gameObjects.bullets.length - 1; i >= 0; i--) {
            const bullet = gameObjects.bullets[i];
            if (checkCollision(bullet.getBounds(), gameObjects.boss.getBounds())) {
                const isDestroyed = gameObjects.boss.takeDamage();
                gameObjects.bullets.splice(i, 1);
                
                if (isDestroyed) {
                    gameObjects.boss = null;
                    gameState.bossDefeated = true;
                    gameClear();
                    return;
                }
                break;
            }
        }
    }

    // プレイヤーと通常敵の衝突
    for (let i = gameObjects.enemies.length - 1; i >= 0; i--) {
        const enemy = gameObjects.enemies[i];
        if (checkCollision(playerBounds, enemy.getBounds())) {
            gameOver();
            return;
        }
    }
    
    // プレイヤーとボスの衝突
    if (gameObjects.boss && checkCollision(playerBounds, gameObjects.boss.getBounds())) {
        gameOver();
        return;
    }
    
    // プレイヤーとボスの弾の衝突
    for (let i = gameObjects.bossBullets.length - 1; i >= 0; i--) {
        const bossBullet = gameObjects.bossBullets[i];
        if (checkCollision(playerBounds, bossBullet.getBounds())) {
            gameOver();
            return;
        }
    }
}

// ゲームオーバー処理
function gameOver() {
    gameState.isRunning = false;
    saveScore(gameState.playerName, gameState.score, false);
    showResultScreen();
}

// ゲームクリア処理
function gameClear() {
    gameState.isRunning = false;
    const clearTime = Date.now() - gameState.startTime; // クリア時間を計算（ミリ秒）
    saveScore(gameState.playerName, gameState.score, true, clearTime);
    showResultScreen();
}

// スコアの保存
function saveScore(playerName, score, isClear, clearTime) {
    let scores = JSON.parse(localStorage.getItem('gameScores') || '[]');
    const scoreData = {
        playerName: playerName,
        score: score,
        date: new Date().toISOString(),
        isClear: isClear || false
    };
    
    // Game Clearの場合はクリア時間を記録
    if (isClear && clearTime !== undefined) {
        scoreData.clearTime = clearTime; // ミリ秒
    }
    
    scores.push(scoreData);
    // 最大100件まで保存
    scores = scores.slice(0, 100);
    localStorage.setItem('gameScores', JSON.stringify(scores));
}

// 時間をフォーマット（ミリ秒を分:秒.ミリ秒に変換）
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // 100分の1秒まで表示
    
    if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    } else {
        return `${seconds}.${ms.toString().padStart(2, '0')}`;
    }
}

// リザルト画面の表示
function showResultScreen() {
    const scores = JSON.parse(localStorage.getItem('gameScores') || '[]');
    scoreList.innerHTML = '';
    
    // Game Clearしたもののみをフィルタリング
    const clearScores = scores.filter(record => record.isClear && record.clearTime !== undefined);
    
    if (clearScores.length === 0) {
        scoreList.innerHTML = '<p style="padding: 20px; color: rgba(255, 255, 255, 0.7); text-align: center;">まだクリアしたプレイヤーがいません</p>';
    } else {
        // クリア時間が早い順にソート
        clearScores.sort((a, b) => a.clearTime - b.clearTime);
        
        // タイトルを追加
        const title = document.createElement('div');
        title.style.cssText = 'padding: 15px; margin-bottom: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; font-size: 1.2em; font-weight: bold; text-align: center;';
        title.textContent = '🏆 クリアタイムランキング 🏆';
        scoreList.appendChild(title);
        
        clearScores.forEach((record, index) => {
            const item = document.createElement('div');
            item.className = 'score-item';
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            item.innerHTML = `
                <span class="player-name">${rank}位 ${medal} ${escapeHtml(record.playerName)}</span>
                <span class="score">${formatTime(record.clearTime)}</span>
            `;
            scoreList.appendChild(item);
        });
    }
    
    showScreen('result');
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ゲームループ
function gameLoop() {
    if (!gameState.isRunning) return;

    // 画面クリア
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ボスの生成チェック
    spawnBoss();

    // 弾の発射
    shootBullet();

    // 敵の生成
    spawnEnemy();

    // ボスの弾発射
    bossShoot();

    // プレイヤーの更新と描画
    gameObjects.player.update();
    gameObjects.player.draw();

    // プレイヤーの弾の更新と描画
    for (let i = gameObjects.bullets.length - 1; i >= 0; i--) {
        const bullet = gameObjects.bullets[i];
        bullet.update();
        if (bullet.isOffScreen()) {
            gameObjects.bullets.splice(i, 1);
        } else {
            bullet.draw();
        }
    }

    // 通常敵の更新と描画
    for (let i = gameObjects.enemies.length - 1; i >= 0; i--) {
        const enemy = gameObjects.enemies[i];
        enemy.update();
        if (enemy.isOffScreen()) {
            gameObjects.enemies.splice(i, 1);
        } else {
            enemy.draw();
        }
    }

    // ボスの更新と描画
    if (gameObjects.boss) {
        gameObjects.boss.update();
        gameObjects.boss.draw();
    }

    // ボスの弾の更新と描画
    for (let i = gameObjects.bossBullets.length - 1; i >= 0; i--) {
        const bossBullet = gameObjects.bossBullets[i];
        bossBullet.update();
        if (bossBullet.isOffScreen()) {
            gameObjects.bossBullets.splice(i, 1);
        } else {
            bossBullet.draw();
        }
    }

    // 衝突判定
    handleCollisions();

    requestAnimationFrame(gameLoop);
}

// イベントリスナー
startButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name === '') {
        alert('プレイヤー名を入力してください');
        return;
    }
    gameState.playerName = name;
    resizeCanvas();
    initGame();
    showScreen('game');
    gameLoop();
});

backToTitleButton.addEventListener('click', () => {
    playerNameInput.value = '';
    showScreen('title');
});

// キーボード入力の処理
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'j') {
        if (gameState.isRunning) {
            e.preventDefault(); // ページスクロールを防ぐ
            gameState.keys[key] = true;
        }
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'j') {
        gameState.keys[key] = false;
    }
});

// ウィンドウリサイズ時の処理
window.addEventListener('resize', () => {
    if (gameState.isRunning) {
        resizeCanvas();
    }
});

// 初期化
// DOMContentLoaded イベントで初期化を確実に実行
document.addEventListener('DOMContentLoaded', async () => {
    // 画像を読み込む
    await loadImages();
    showScreen('title');
});

