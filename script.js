// 画面管理
const screens = {
    title: document.getElementById('titleScreen'),
    characterSelect: document.getElementById('characterSelectScreen'),
    difficulty: document.getElementById('difficultyScreen'),
    shop: document.getElementById('shopScreen'),
    setting: document.getElementById('settingScreen'),
    skillEquip: document.getElementById('skillEquipScreen'),
    game: document.getElementById('gameScreen'),
    result: document.getElementById('resultScreen')
};

// タイトル画面の要素
const playerNameInput = document.getElementById('playerName');
const startButton = document.getElementById('startButton');
const backToTitleButton = document.getElementById('backToTitleButton');
const changeSkinButton = document.getElementById('changeSkinButton');
const skillEquipButton = document.getElementById('skillEquipButton');
const titleStartMenu = document.getElementById('titleStartMenu');
const titleShopMenu = document.getElementById('titleShopMenu');
const titleSettingMenu = document.getElementById('titleSettingMenu');
const titleCoinDisplay = document.getElementById('titleCoinDisplay');
const titleLogo = document.getElementById('titleLogo');

// キャラクター選択画面の要素
const characterSelectList = document.getElementById('characterSelectList');
const characterSelectPreview = document.getElementById('characterSelectPreview');
const characterSelectButton = document.getElementById('characterSelectButton');
const backFromCharacterSelect = document.getElementById('backFromCharacterSelect');

// 難易度選択画面の要素
const easyButton = document.getElementById('easyButton');
const normalButton = document.getElementById('normalButton');
const hardButton = document.getElementById('hardButton');
const kuniButton = document.getElementById('kuniButton'); // 隠し難易度「國」
const backToTitleFromDifficulty = document.getElementById('backToTitleFromDifficulty');
const shopScreen = document.getElementById('shopScreen');
const shopCoinDisplay = document.getElementById('shopCoinDisplay');
const shopTabSkill = document.getElementById('shopTabSkill');
const shopTabSkin = document.getElementById('shopTabSkin');
const shopItemList = document.getElementById('shopItemList');
const shopMessage = document.getElementById('shopMessage');
const backFromShopButton = document.getElementById('backFromShopButton');
const purchaseDialog = document.getElementById('purchaseDialog');
const purchaseYesButton = document.getElementById('purchaseYesButton');
const purchaseNoButton = document.getElementById('purchaseNoButton');
const saveSettingButton = document.getElementById('saveSettingButton');
const cancelSettingButton = document.getElementById('cancelSettingButton');
const backFromSettingButton = document.getElementById('backFromSettingButton');
const bgmValue = document.getElementById('bgmValue');
const seValue = document.getElementById('seValue');
const bgmBar = document.getElementById('bgmBar');
const seBar = document.getElementById('seBar');

// ゲーム画面の要素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const skillSlot1 = document.getElementById('skillSlot1');
const skillSlot2 = document.getElementById('skillSlot2');
const cooldown1 = document.getElementById('cooldown1');
const cooldown2 = document.getElementById('cooldown2');
const upgradeOverlay = document.getElementById('upgradeOverlay');
const upgradeChoices = document.getElementById('upgradeChoices');

// リザルト画面の要素
const scoreList = document.getElementById('scoreList');
const clearBonusDisplay = document.getElementById('clearBonusDisplay');
const skillEquipScreen = document.getElementById('skillEquipScreen');
const skillEquipList = document.getElementById('skillEquipList');
const skillEquipSlots = document.getElementById('skillEquipSlots');
const unequipSkillButton = document.getElementById('unequipSkillButton');
const backFromSkillEquipButton = document.getElementById('backFromSkillEquipButton');
const skillEquipMessage = document.getElementById('skillEquipMessage');

// ゲーム状態
let gameState = {
    playerName: '',
    difficulty: 'normal', // 'easy', 'normal', 'hard', 'kuni'
    score: 0,
    isRunning: false,
    lastBulletTime: 0,
    lastEnemySpawn: 0,
    bossSpawned: false,
    bossDefeated: false,
    lastBossBulletTime: 0,
    startTime: 0, // ゲーム開始時間
    contactCount: 0, // プレイヤーと敵の接触回数（イージーモード用）
    lastContactTime: 0, // 最後の接触時刻（連続接触防止用）
    // 画面と隠し難易度の状態
    currentScreen: 'title',
    secretDifficultyUnlocked: false,
    difficultySKeyCount: 0,
    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        j: false,
        q: false,
        e: false
    }
};

const SAVE_KEY = 'bskGameDataV2';
const DEFAULT_SAVE_DATA = {
    coins: 0,
    purchasedSkills: ['heal'],
    purchasedSkins: ['Hiroto.png'],
    equippedSkills: ['heal', null],
    selectedSkin: 'Hiroto.png',
    audio: { bgm: 70, se: 70 }
};
let saveData = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));

const SHOP_SKILLS = [
    { id: 'heal', name: 'HEAL', price: 0 },
    { id: 'barrier', name: 'BARRIER', price: 30 },
    { id: 'burst', name: 'BURST', price: 50 }
];
const SHOP_SKINS = [
    { id: 'Hiroto.png', name: 'Hiroto', price: 0 },
    { id: 'Iori.png', name: 'Iori', price: 35 },
    { id: 'Yuito.png', name: 'Yuito', price: 35 },
    { id: 'Kajiwara.png', name: 'Kajiwara', price: 40 }
];

let shopTab = 'SKILL';
let shopSelectedIndex = 0;
let titleSelectedIndex = 0;
let settingSelectedIndex = 0;
let pendingPurchaseItem = null;
let pendingPurchaseType = null;
let inPurchaseDialog = false;
let equipSelectMode = false;
let equipSelectIndex = 0;
const skillCooldownState = [{ now: 0, max: 3000 }, { now: 0, max: 5000 }];
let settingDraft = null;
let bossState = 'idle';
let bossNextSkillAt = 0;
let bossBarrierUntil = 0;
let playerBuffs = {
    threeWay: false,
    speedUpStacks: 0,
    homingShot: false,
    attackUp: 0,
    bulletScale: 1,
    invincibleUntil: 0
};
const giftBoxes = [];
let gamePausedForUpgrade = false;
let upgradeChoicesState = [];
let upgradeSelectedIndex = 0;

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
        images.player.src = 'char/player/Hiroto.png';

        // 敵画像
        images.enemy = new Image();
        images.enemy.onload = checkAllLoaded;
        images.enemy.onerror = checkAllLoaded;
        images.enemy.src = 'char/enemy/Ko.png';

        // ボス画像
        images.boss = new Image();
        images.boss.onload = checkAllLoaded;
        images.boss.onerror = checkAllLoaded;
        images.boss.src = 'char/boss/Shoudai.png';
    });
}

// プレイヤースキン一覧（char/player 内の画像ファイル名を追加可能）
const PLAYER_SKIN_OPTIONS = ['Hiroto.png','Iori.png', 'Yuito.png', 'Kajiwara.png'];
let selectedPlayerSkin = 'Hiroto.png';

// 定数（基本値）
const BULLET_INTERVAL = 250; // ミリ秒（発射レートを下げる）
const ENEMY_SPAWN_INTERVAL = 800; // ミリ秒（敵の出現頻度を上げる）
const BASE_PLAYER_SPEED = 4; // 基本移動速度
const BASE_BULLET_SPEED = 5; // 基本弾の速度
const BASE_ENEMY_SPEED = 2; // 基本敵の速度
const PLAYER_SIZE = 75;
const BULLET_SIZE = 5;
const ENEMY_SIZE = 70;
const BOSS_SCORE = 150; // ボス出現スコア
const BOSS_HP = 50; // ボスの体力
const BOSS_SIZE = 95; // ボスのサイズ
const BASE_BOSS_SPEED = 3; // 基本ボスの移動速度
const BASE_BOSS_BULLET_SPEED = 4; // 基本ボスの弾の速度
const BOSS_BULLET_INTERVAL = 1000; // ボスの弾発射間隔（ミリ秒）
const BOSS_BULLET_SIZE = 8; // ボスの弾のサイズ

// BGM管理
const bgm = {
    title: new Audio('bgm/title.ogg'),
    game: new Audio('bgm/game.ogg'),
    boss: new Audio('bgm/boss.ogg')
};

bgm.title.loop = true;
bgm.game.loop = true;
bgm.boss.loop = true;

// タイトルは小さめの音量
bgm.title.volume = 0.3;
bgm.game.volume = 0.6;

// SE管理
const se = {
    gamestart: new Audio('se/gamestart.m4a'),
    bosskill: new Audio('se/bosskill1.m4a'),
    ui: {
        cursor: new Audio('se/ui/cursor.ogg'),
        decide: new Audio('se/ui/decide.ogg'),
        error: new Audio('se/ui/error.ogg')
    },
    // ボス戦突入時に使うSE（存在するファイル名に合わせて追加してください）
    boss: [
        new Audio('se/boss/boss1.m4a'),
        new Audio('se/boss/boss2.m4a'),
        new Audio('se/boss/boss3.m4a')
    ],
    // 難易度選択時のSE
    difficulty: {
        easy: new Audio('se/difficulty/easy.m4a'),
        normal: new Audio('se/difficulty/normal.m4a'),
        hard: new Audio('se/difficulty/hard.m4a'),
        kuni: new Audio('se/difficulty/kokuoka.m4a')
    }
};

// SEの音量調整（少し控えめ）
se.gamestart.volume = 0.8;
se.bosskill.volume = 0.9;
se.boss.forEach(s => s.volume = 0.8);
se.difficulty.easy.volume = 0.8;
se.difficulty.normal.volume = 0.8;
se.difficulty.hard.volume = 0.8;
se.difficulty.kuni.volume = 0.8;
se.ui.cursor.volume = 0.7;
se.ui.decide.volume = 0.8;
se.ui.error.volume = 0.8;

function playUiSe(type) {
    if (!se.ui[type]) return;
    se.ui[type].currentTime = 0;
    se.ui[type].play().catch(() => {});
}

function loadSaveData() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        saveData = {
            ...DEFAULT_SAVE_DATA,
            ...parsed,
            audio: { ...DEFAULT_SAVE_DATA.audio, ...(parsed.audio || {}) }
        };
    } catch {
        saveData = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    }
}

function persistSaveData() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function applyAudioSettings() {
    bgm.title.volume = saveData.audio.bgm / 100 * 0.5;
    bgm.game.volume = saveData.audio.bgm / 100 * 0.8;
    bgm.boss.volume = saveData.audio.bgm / 100 * 0.9;
    const seVol = saveData.audio.se / 100;
    se.gamestart.volume = seVol;
    se.bosskill.volume = seVol;
    se.boss.forEach(s => s.volume = seVol);
    se.difficulty.easy.volume = seVol;
    se.difficulty.normal.volume = seVol;
    se.difficulty.hard.volume = seVol;
    se.difficulty.kuni.volume = seVol;
}

function fadeOutCurrentBgmAndPlayBoss() {
    if (!currentBgm || currentBgm === bgm.boss) {
        bgm.boss.currentTime = 0;
        bgm.boss.play().catch(() => {});
        currentBgm = bgm.boss;
        return;
    }
    const target = currentBgm;
    const startVol = target.volume;
    const start = performance.now();
    function step(ts) {
        const t = Math.min(1, (ts - start) / 1000);
        target.volume = startVol * (1 - t);
        if (t < 1) {
            requestAnimationFrame(step);
            return;
        }
        target.pause();
        applyAudioSettings();
        bgm.boss.currentTime = 0;
        bgm.boss.play().catch(() => {});
        currentBgm = bgm.boss;
    }
    requestAnimationFrame(step);
}

function hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const mod = i % 6;
    const rgb = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q]
    ][mod];
    return rgb.map((x) => Math.round(x * 255));
}

let logoHue = 0;
let lastLogoTs = 0;
function animateTitleLogo(ts) {
    if (!lastLogoTs) lastLogoTs = ts;
    const dt = (ts - lastLogoTs) / 1000;
    lastLogoTs = ts;
    logoHue = (logoHue + dt * 0.12) % 1;
    if (titleLogo) {
        const [r, g, b] = hsvToRgb(logoHue, 0.85, 1);
        titleLogo.style.color = `rgb(${r}, ${g}, ${b})`;
    }
    requestAnimationFrame(animateTitleLogo);
}

function updateCoinDisplays() {
    if (titleCoinDisplay) titleCoinDisplay.textContent = `🪙 ${saveData.coins}`;
    if (shopCoinDisplay) shopCoinDisplay.textContent = `🪙 ${saveData.coins}`;
}

function syncSelectedSkinFromSave() {
    if (saveData.selectedSkin && saveData.purchasedSkins.includes(saveData.selectedSkin)) {
        selectedPlayerSkin = saveData.selectedSkin;
        images.player.src = `char/player/${selectedPlayerSkin}`;
    } else {
        saveData.selectedSkin = 'Hiroto.png';
        selectedPlayerSkin = 'Hiroto.png';
        images.player.src = `char/player/${selectedPlayerSkin}`;
    }
}

let currentBgm = null;

function playBgmForScreen(screenName) {
    let target = null;

    // タイトル画面・キャラクター選択・難易度選択画面で title.ogg
    if (screenName === 'title' || screenName === 'difficulty' || screenName === 'characterSelect' || screenName === 'shop' || screenName === 'setting') {
        target = bgm.title;
    }
    // ゲーム画面では game.ogg
    else if (screenName === 'game') {
        target = bgm.game;
    }

    // 目標BGMが現在と違う場合は切り替え
    if (currentBgm && currentBgm !== target) {
        currentBgm.pause();
        currentBgm.currentTime = 0;
        currentBgm = null;
    }

    if (target && currentBgm !== target) {
        // 再生エラーは握りつぶす（ブラウザの自動再生制限など）
        target.currentTime = 0;
        target.play().catch(() => {});
        currentBgm = target;
    }

    // 対応するBGMがない画面（リザルトなど）は無音
    if (!target && currentBgm) {
        currentBgm.pause();
        currentBgm = null;
    }
}

// 難易度別設定
const DIFFICULTY_SETTINGS = {
    easy: {
        enemyHP: 2,
        maxContacts: 4,
        speedMultiplier: 1.0
    },
    normal: {
        enemyHP: 5,
        maxContacts: 1,
        speedMultiplier: 1.0
    },
    hard: {
        enemyHP: 7,
        maxContacts: 1,
        speedMultiplier: 1.5
    },
    // 隠し難易度「國」：さらに高耐久＆超高速
    kuni: {
        enemyHP: 10,
        maxContacts: 1,
        speedMultiplier: 2.0
    }
};

// 現在の難易度設定に基づく動的な定数
let PLAYER_SPEED = BASE_PLAYER_SPEED;
let BULLET_SPEED = BASE_BULLET_SPEED;
let ENEMY_SPEED = BASE_ENEMY_SPEED;
let ENEMY_HP = 5;
let BOSS_SPEED = BASE_BOSS_SPEED;
let BOSS_BULLET_SPEED = BASE_BOSS_BULLET_SPEED;

// 画面遷移関数
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    screens[screenName].classList.add('active');

    // 現在の画面を記録
    gameState.currentScreen = screenName;

    // 難易度選択画面に入ったらSキー回数をリセット
    if (screenName === 'difficulty') {
        gameState.difficultySKeyCount = 0;
    }

    // キャラクター選択画面に入ったら一覧を構築
    if (screenName === 'characterSelect') {
        buildCharacterSelectList();
    }
    if (screenName === 'title') {
        updateTitleMenuSelection();
    }
    if (screenName === 'shop') {
        renderShop();
    }
    if (screenName === 'setting') {
        settingDraft = { ...saveData.audio };
        renderSettings();
    }
    if (screenName === 'skillEquip') {
        renderSkillEquipScreen();
    }

    // 画面に応じてBGMを切り替え
    playBgmForScreen(screenName);
}

// キャラクター選択画面の一覧を構築（char/player 内の画像を横一列に表示）
let characterSelectPendingSkin = 'Hiroto.png';

function buildCharacterSelectList() {
    if (!characterSelectList || !characterSelectPreview) return;

    characterSelectPendingSkin = selectedPlayerSkin;
    characterSelectList.innerHTML = '';

    PLAYER_SKIN_OPTIONS.forEach((filename) => {
        const purchased = saveData.purchasedSkins.includes(filename);
        const img = document.createElement('img');
        img.className = 'character-thumb' + (filename === characterSelectPendingSkin ? ' selected' : '') + (purchased ? '' : ' locked');
        img.src = 'char/player/' + filename;
        img.alt = filename;
        img.dataset.skin = filename;
        img.addEventListener('click', () => {
            characterSelectPendingSkin = filename;
            characterSelectPreview.src = 'char/player/' + filename;
            characterSelectList.querySelectorAll('.character-thumb').forEach((el) => el.classList.remove('selected'));
            img.classList.add('selected');
        });
        characterSelectList.appendChild(img);
    });

    characterSelectPreview.src = 'char/player/' + characterSelectPendingSkin;
}

function updateTitleMenuSelection() {
    const items = [titleStartMenu, titleShopMenu, titleSettingMenu];
    items.forEach((el, idx) => {
        if (!el) return;
        el.classList.toggle('selected', idx === titleSelectedIndex);
    });
}

function currentShopItems() {
    return shopTab === 'SKILL' ? SHOP_SKILLS : SHOP_SKINS;
}

function renderShop() {
    if (!shopItemList) return;
    updateCoinDisplays();
    shopTabSkill.classList.toggle('selected', shopTab === 'SKILL');
    shopTabSkin.classList.toggle('selected', shopTab === 'SKIN');
    const items = currentShopItems();
    shopSelectedIndex = Math.max(0, Math.min(shopSelectedIndex, items.length - 1));
    shopItemList.innerHTML = '';
    items.forEach((item, idx) => {
        const purchased = shopTab === 'SKILL'
            ? saveData.purchasedSkills.includes(item.id)
            : saveData.purchasedSkins.includes(item.id);
        const equipped = shopTab === 'SKILL'
            ? saveData.equippedSkills.includes(item.id)
            : saveData.selectedSkin === item.id;
        const row = document.createElement('div');
        row.className = `shop-item ${idx === shopSelectedIndex ? 'selected' : ''} ${purchased ? 'purchased' : ''}`;
        const insufficient = !purchased && saveData.coins < item.price;
        row.innerHTML = `
            <span>${item.name}</span>
            <span class="price ${insufficient ? 'insufficient' : ''}">💰 ${item.price}</span>
            <span>${equipped ? (shopTab === 'SKILL' ? 'EQUIP' : 'SELECTED') : (purchased ? '購入済み' : (shopTab === 'SKIN' ? 'LOCKED' : '未購入'))}</span>
        `;
        shopItemList.appendChild(row);
    });
}

function showShopMessage(msg) {
    if (!shopMessage) return;
    shopMessage.textContent = msg;
    setTimeout(() => {
        if (shopMessage.textContent === msg) shopMessage.textContent = '';
    }, 1200);
}

function renderSettings() {
    const vals = [saveData.audio.bgm, saveData.audio.se];
    if (bgmValue) bgmValue.textContent = `${vals[0]}%`;
    if (seValue) seValue.textContent = `${vals[1]}%`;
    if (bgmBar) bgmBar.style.width = `${vals[0]}%`;
    if (seBar) seBar.style.width = `${vals[1]}%`;
    document.querySelectorAll('.setting-item').forEach((el, idx) => {
        el.classList.toggle('selected', idx === settingSelectedIndex);
    });
}

function renderSkillSlots() {
    const names = saveData.equippedSkills.map((id, idx) => id ? id.toUpperCase() : `EMPTY${idx + 1}`);
    if (skillSlot1) {
        skillSlot1.querySelector('.skill-name').textContent = names[0];
        skillSlot1.style.display = saveData.equippedSkills[0] ? 'block' : 'none';
    }
    if (skillSlot2) {
        skillSlot2.querySelector('.skill-name').textContent = names[1];
        skillSlot2.style.display = saveData.equippedSkills[1] ? 'block' : 'none';
    }
    const c1 = skillCooldownState[0];
    const c2 = skillCooldownState[1];
    if (cooldown1) cooldown1.style.width = `${Math.max(0, Math.min(100, c1.now / c1.max * 100))}%`;
    if (cooldown2) cooldown2.style.width = `${Math.max(0, Math.min(100, c2.now / c2.max * 100))}%`;
    if (skillSlot1) skillSlot1.classList.toggle('disabled', c1.now < c1.max);
    if (skillSlot2) skillSlot2.classList.toggle('disabled', c2.now < c2.max);
}

function renderSkillEquipScreen() {
    if (!skillEquipList || !skillEquipSlots) return;
    skillEquipList.innerHTML = '';
    SHOP_SKILLS.forEach((skill) => {
        const purchased = saveData.purchasedSkills.includes(skill.id);
        const row = document.createElement('div');
        row.className = `shop-item ${purchased ? 'purchased' : ''}`;
        row.dataset.skillId = skill.id;
        row.innerHTML = `
            <span>${skill.name}</span>
            <span>${purchased ? '購入済み' : '未購入'}</span>
            <span>${saveData.equippedSkills.includes(skill.id) ? 'EQUIP' : ''}</span>
        `;
        row.addEventListener('click', () => {
            if (!purchased) {
                playUiSe('error');
                skillEquipMessage.textContent = '未購入スキルは装備できません';
                return;
            }
            const targetSlot = equipSelectIndex;
            const already = saveData.equippedSkills.indexOf(skill.id);
            if (already === targetSlot) {
                saveData.equippedSkills[targetSlot] = null;
            } else {
                if (already >= 0) saveData.equippedSkills[already] = saveData.equippedSkills[targetSlot];
                saveData.equippedSkills[targetSlot] = skill.id;
            }
            persistSaveData();
            renderSkillSlots();
            renderSkillEquipScreen();
        });
        skillEquipList.appendChild(row);
    });

    skillEquipSlots.innerHTML = '';
    saveData.equippedSkills.forEach((id, idx) => {
        const div = document.createElement('div');
        div.className = 'equip-slot';
        div.style.borderColor = equipSelectIndex === idx ? '#00e5ff' : 'rgba(255,255,255,0.2)';
        div.textContent = `SLOT${idx + 1}: ${id ? id.toUpperCase() : 'EMPTY'}`;
        skillEquipSlots.appendChild(div);
    });
}

// Canvasサイズの設定
function resizeCanvas() {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}

// 難易度設定の適用
function applyDifficultySettings(difficulty) {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    ENEMY_HP = settings.enemyHP;
    const speedMult = settings.speedMultiplier;
    PLAYER_SPEED = BASE_PLAYER_SPEED * speedMult;
    BULLET_SPEED = BASE_BULLET_SPEED * speedMult;
    ENEMY_SPEED = BASE_ENEMY_SPEED * speedMult;
    BOSS_SPEED = BASE_BOSS_SPEED * speedMult;
    BOSS_BULLET_SPEED = BASE_BOSS_BULLET_SPEED * speedMult;
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
        const speed = PLAYER_SPEED * (1 + playerBuffs.speedUpStacks * 0.1);
        // キーボード入力に基づいて移動
        if (gameState.keys.a) {
            this.x -= speed;
        }
        if (gameState.keys.d) {
            this.x += speed;
        }
        if (gameState.keys.w) {
            this.y -= speed;
        }
        if (gameState.keys.s) {
            this.y += speed;
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
        if (this.vx === undefined) this.vx = 0;
        if (this.vy === undefined) this.vy = -BULLET_SPEED;
        if (this.homing && gameObjects.enemies.length > 0) {
            const target = gameObjects.enemies[0];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const desired = Math.atan2(dy, dx);
            const current = Math.atan2(this.vy, this.vx || 0.0001);
            let diff = desired - current;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const next = current + Math.max(-0.08, Math.min(0.08, diff));
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || BULLET_SPEED;
            this.vx = Math.cos(next) * speed;
            this.vy = Math.sin(next) * speed;
        }
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    isOffScreen() {
        return this.y < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width;
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
        this.dustParticles = [];
        this.lastDustSpawn = 0;
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

        // 白いチリエフェクト：下から上に動く粒子の生成・更新
        const now = Date.now();
        if (now - this.lastDustSpawn > 60) {
            this.lastDustSpawn = now;
            const count = Math.random() > 0.5 ? 1 : 2;
            for (let i = 0; i < count; i++) {
                this.dustParticles.push({
                    x: this.x + (Math.random() - 0.5) * this.width * 1.4,
                    y: this.y + this.height / 2 + Math.random() * 25,
                    vy: 0.6 + Math.random() * 1.0,
                    alpha: 0.5 + Math.random() * 0.5,
                    size: 1.5 + Math.random() * 2.5
                });
            }
        }
        this.dustParticles = this.dustParticles.filter(p => {
            p.y -= p.vy;
            return p.y > -15;
        });
    }

    draw() {
        const numSpikes = 14;
        const baseOuterR = this.width / 2 + 28;
        const baseInnerR = this.width / 2 + 10;
        const rotationAngle = (Date.now() * 0.0012) % (Math.PI * 2);

        const drawSpikyPath = (centerX, centerY, outerR, innerR) => {
            ctx.beginPath();
            for (let i = 0; i <= numSpikes * 2; i++) {
                const angle = (i * Math.PI / numSpikes) - Math.PI / 2;
                const r = (i % 2 === 0) ? outerR : innerR;
                const px = centerX + Math.cos(angle) * r;
                const py = centerY + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
        };

        // オーラ全体を横に回転
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(rotationAngle);
        ctx.translate(-this.x, -this.y);

        // オーラの周りの白い光（じわじわ湧く＝ゆっくり脈動）
        const glowPhase = Math.sin(Date.now() / 700) * 0.5 + 0.5;
        const whiteAlpha = 0.08 + glowPhase * 0.18;
        ctx.globalAlpha = whiteAlpha;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        drawSpikyPath(this.x, this.y, baseOuterR + 18, baseInnerR + 12);
        ctx.fill();
        ctx.globalAlpha = 0.12 + glowPhase * 0.12;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        drawSpikyPath(this.x, this.y, baseOuterR + 22, baseInnerR + 14);
        ctx.stroke();

        // トゲトゲの形の黄色くて透明なオーラ
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = 'rgba(255, 220, 0, 0.6)';
        ctx.strokeStyle = 'rgba(255, 235, 100, 0.5)';
        ctx.lineWidth = 2;
        drawSpikyPath(this.x, this.y, baseOuterR, baseInnerR);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // オーラとは別：下から上に動く白いチリエフェクト（濃さ0.5〜1でランダム）
        ctx.save();
        for (const p of this.dustParticles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

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
        if (this.homing && gameObjects.player) {
            const dx = gameObjects.player.x - this.x;
            const dy = gameObjects.player.y - this.y;
            const desired = Math.atan2(dy, dx);
            const current = Math.atan2(this.vy, this.vx);
            const maxTurn = 0.06;
            let diff = desired - current;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const next = current + Math.max(-maxTurn, Math.min(maxTurn, diff));
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 3.6;
            this.vx = Math.cos(next) * speed;
            this.vy = Math.sin(next) * speed;
        }
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
        if (this.lifeUntil && Date.now() > this.lifeUntil) return true;
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
    // 難易度設定を適用
    applyDifficultySettings(gameState.difficulty);
    
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
    gameState.contactCount = 0; // 接触回数をリセット
    gameState.lastContactTime = 0; // 接触時刻をリセット
    updateScoreDisplay();
}

// スコア表示更新
function updateScoreDisplay() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    let displayText = `スコア: ${gameState.score}`;
    
    // イージーモードの場合は接触回数も表示
    if (gameState.difficulty === 'easy') {
        displayText += ` | 接触回数: ${gameState.contactCount}/${settings.maxContacts}`;
    }
    
    scoreDisplay.textContent = displayText;
}

// 弾の発射（手動）
function shootBullet() {
    // jキーが押された時のみ発射
    if (gameState.keys.j) {
        const now = Date.now();
        if (now - gameState.lastBulletTime >= BULLET_INTERVAL) {
            const spawn = (vx = 0, vy = -BULLET_SPEED) => {
                const b = new Bullet(gameObjects.player.x, gameObjects.player.y - PLAYER_SIZE / 2);
                b.vx = vx;
                b.vy = vy;
                b.width *= playerBuffs.bulletScale;
                b.height *= playerBuffs.bulletScale;
                if (playerBuffs.homingShot) b.homing = true;
                gameObjects.bullets.push(b);
            };
            spawn();
            if (playerBuffs.threeWay) {
                spawn(-1.5, -BULLET_SPEED);
                spawn(1.5, -BULLET_SPEED);
            }
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
        bossState = 'move';
        bossNextSkillAt = Date.now() + 2000;
        bossBarrierUntil = 0;
        // 既存の通常敵をクリア
        gameObjects.enemies = [];
        fadeOutCurrentBgmAndPlayBoss();

        // ボス戦突入SE（ランダムに1つ再生）
        if (se && Array.isArray(se.boss) && se.boss.length > 0) {
            const idx = Math.floor(Math.random() * se.boss.length);
            const audio = se.boss[idx];
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        }
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

function spawnBossSkillBullets() {
    if (!gameObjects.boss) return;
    const boss = gameObjects.boss;
    const difficulty = gameState.difficulty;
    const now = Date.now();
    if (now < bossNextSkillAt) return;
    bossState = 'skill';
    const showSkillText = (text) => {
        const msg = document.createElement('div');
        msg.style.cssText = 'position:absolute;top:90px;left:50%;transform:translateX(-50%);color:#fff;font-weight:bold;font-size:26px;z-index:100;transition:opacity 2s;';
        msg.textContent = text;
        document.body.appendChild(msg);
        requestAnimationFrame(() => { msg.style.opacity = '0'; });
        setTimeout(() => msg.remove(), 2000);
    };
    const spawn8Way = () => {
        for (let i = 0; i < 8; i++) {
            const ang = (Math.PI * 2 * i) / 8;
            gameObjects.bossBullets.push(new BossBullet(boss.x, boss.y, Math.cos(ang) * 3.2, Math.sin(ang) * 3.2));
        }
    };
    if (difficulty === 'normal') {
        spawn8Way();
        showSkillText('スキル：粉雪');
        new Audio('se/boss/8hou.ogg').play().catch(() => {});
    } else if (difficulty === 'hard') {
        spawn8Way();
        const b = new BossBullet(boss.x, boss.y, 0, 3.6);
        b.homing = true;
        b.lifeUntil = Date.now() + 5000;
        gameObjects.bossBullets.push(b);
        showSkillText('スキル：機嫌いいけんついていってやるよ');
        new Audio('se/boss/homing.ogg').play().catch(() => {});
    } else if (difficulty === 'kuni') {
        bossBarrierUntil = Date.now() + 2000;
        showSkillText('お前がいない時もっと強いけどね');
        new Audio('se/boss/muteki.ogg').play().catch(() => {});
        bossNextSkillAt = Date.now() + 8000;
        bossState = 'move';
        return;
    } else {
        spawn8Way();
    }
    bossNextSkillAt = Date.now() + 2000 + Math.random() * 3000;
    bossState = 'move';
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
                const damageTimes = Math.max(1, Math.round(1 + playerBuffs.attackUp));
                let isDestroyed = false;
                for (let d = 0; d < damageTimes; d++) {
                    isDestroyed = enemy.takeDamage();
                    if (isDestroyed) break;
                }
                gameObjects.bullets.splice(i, 1);
                
                if (isDestroyed) {
                    if (Math.random() < 0.05) {
                        giftBoxes.push({ x: enemy.x, y: enemy.y, vy: 1.7 });
                    }
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
                if (Date.now() < bossBarrierUntil) {
                    // 反射バリア: 弾を反転し敵弾化
                    bullet.vx = 0;
                    bullet.vy = 6;
                    gameObjects.bossBullets.push(new BossBullet(bullet.x, bullet.y, bullet.vx, bullet.vy));
                    gameObjects.bullets.splice(i, 1);
                    continue;
                }
                const damageTimes = Math.max(1, Math.round(1 + playerBuffs.attackUp));
                let isDestroyed = false;
                for (let d = 0; d < damageTimes; d++) {
                    isDestroyed = gameObjects.boss.takeDamage();
                    if (isDestroyed) break;
                }
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

    // 接触判定のクールダウン（0.5秒）
    const CONTACT_COOLDOWN = 500;
    const now = Date.now();
    const canContact = (now - gameState.lastContactTime) >= CONTACT_COOLDOWN;
    
    // プレイヤーと通常敵の衝突
    for (let i = gameObjects.enemies.length - 1; i >= 0; i--) {
        const enemy = gameObjects.enemies[i];
        if (checkCollision(playerBounds, enemy.getBounds())) {
            if (Date.now() < playerBuffs.invincibleUntil) continue;
            const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
            
            if (canContact) {
                gameState.contactCount++;
                gameState.lastContactTime = now;
                updateScoreDisplay();
                
                if (gameState.contactCount >= settings.maxContacts) {
                    gameOver();
                    return;
                }
            }
            // イージーモードの場合は接触しても敵を削除せず、接触回数だけ増やす
            // ノーマル/ハードモードの場合は1回でゲームオーバーになるのでここには来ない
        }
    }
    
    // プレイヤーとボスの衝突
    if (gameObjects.boss && checkCollision(playerBounds, gameObjects.boss.getBounds())) {
        if (Date.now() < playerBuffs.invincibleUntil) return;
        const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
        
        if (canContact) {
            gameState.contactCount++;
            gameState.lastContactTime = now;
            updateScoreDisplay();
            
            if (gameState.contactCount >= settings.maxContacts) {
                gameOver();
                return;
            }
        }
    }
    
    // プレイヤーとボスの弾の衝突
    for (let i = gameObjects.bossBullets.length - 1; i >= 0; i--) {
        const bossBullet = gameObjects.bossBullets[i];
        if (checkCollision(playerBounds, bossBullet.getBounds())) {
            if (Date.now() < playerBuffs.invincibleUntil) continue;
            const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
            
            if (canContact) {
                gameState.contactCount++;
                gameState.lastContactTime = now;
                updateScoreDisplay();
                
                if (gameState.contactCount >= settings.maxContacts) {
                    gameOver();
                    return;
                }
            }
            // 接触した弾を削除
            gameObjects.bossBullets.splice(i, 1);
        }
    }
}

// ゲームオーバー処理
function gameOver() {
    gameState.isRunning = false;
    if (clearBonusDisplay) clearBonusDisplay.textContent = '';
    persistSaveData();
    saveScore(gameState.playerName, gameState.score, false);
    showResultScreen();
}

// ゲームクリア処理
function gameClear() {
    gameState.isRunning = false;
    const clearTime = Date.now() - gameState.startTime; // クリア時間を計算（ミリ秒）
    const clearBonus = 15;

    // ボス撃破SE
    if (se && se.bosskill) {
        se.bosskill.currentTime = 0;
        se.bosskill.play().catch(() => {});
    }

    saveData.coins += clearBonus;
    persistSaveData();
    updateCoinDisplays();
    if (clearBonusDisplay) clearBonusDisplay.textContent = `CLEAR BONUS +${clearBonus}`;

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
        isClear: isClear || false,
        difficulty: gameState.difficulty // 難易度を保存
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
            
            // 難易度の表示名を取得
            const difficultyNames = {
                'easy': 'イージー',
                'normal': 'ノーマル',
                'hard': 'ハード',
                'kuni': '國'
            };
            const difficultyName = difficultyNames[record.difficulty] || record.difficulty || 'ノーマル';
            
            item.innerHTML = `
                <span class="player-name">${rank}位 ${medal} ${escapeHtml(record.playerName)} (${difficultyName})</span>
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
    if (gamePausedForUpgrade) {
        requestAnimationFrame(gameLoop);
        return;
    }

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
    spawnBossSkillBullets();

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

    // プレゼントボックス更新と描画
    for (let i = giftBoxes.length - 1; i >= 0; i--) {
        const b = giftBoxes[i];
        b.y += b.vy;
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(b.x - 10, b.y - 10, 20, 20);
        if (b.y > canvas.height + 20) {
            giftBoxes.splice(i, 1);
            continue;
        }
        if (checkCollision(gameObjects.player.getBounds(), { x: b.x - 10, y: b.y - 10, width: 20, height: 20 })) {
            giftBoxes.splice(i, 1);
            openUpgradeChoices();
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

    // スキルクールタイム更新
    skillCooldownState.forEach((s) => {
        s.now = Math.min(s.max, s.now + 16);
    });
    renderSkillSlots();

    requestAnimationFrame(gameLoop);
}

function openUpgradeChoices() {
    const pool = [
        { id: 'coin', label: 'コイン +10', apply: () => { saveData.coins += 10; updateCoinDisplays(); } },
        { id: 'threeWay', label: '3方向ショット', apply: () => { playerBuffs.threeWay = true; } },
        { id: 'speedUp', label: '移動速度 +10%', apply: () => { playerBuffs.speedUpStacks = Math.min(5, playerBuffs.speedUpStacks + 1); } },
        { id: 'homingShot', label: 'ホーミング弾', apply: () => { playerBuffs.homingShot = true; } },
        { id: 'attackUp', label: '攻撃力アップ +20%', apply: () => { playerBuffs.attackUp += 0.2; } },
        { id: 'bulletScale', label: '弾サイズ拡大', apply: () => { playerBuffs.bulletScale = 1.5; } },
        { id: 'invincible', label: '無敵 2秒', apply: () => { playerBuffs.invincibleUntil = Date.now() + 2000; } }
    ].filter((x) => {
        if (x.id === 'threeWay' && playerBuffs.threeWay) return false;
        if (x.id === 'homingShot' && playerBuffs.homingShot) return false;
        return true;
    });
    upgradeChoicesState = [];
    while (upgradeChoicesState.length < 3 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        upgradeChoicesState.push(pool.splice(idx, 1)[0]);
    }
    upgradeSelectedIndex = 0;
    gamePausedForUpgrade = true;
    if (upgradeOverlay) upgradeOverlay.classList.remove('hidden');
    if (upgradeChoices) {
        upgradeChoices.innerHTML = '';
        upgradeChoicesState.forEach((c, idx) => {
            const el = document.createElement('div');
            el.className = `upgrade-choice ${idx === 0 ? 'selected' : ''}`;
            el.textContent = c.label;
            upgradeChoices.appendChild(el);
        });
    }
}

function updateUpgradeSelection() {
    if (!upgradeChoices) return;
    [...upgradeChoices.children].forEach((el, idx) => {
        el.classList.toggle('selected', idx === upgradeSelectedIndex);
    });
}

function attemptBuyOrEquipCurrent() {
    const items = currentShopItems();
    const item = items[shopSelectedIndex];
    if (!item) return;
    const isSkillTab = shopTab === 'SKILL';
    const purchased = isSkillTab
        ? saveData.purchasedSkills.includes(item.id)
        : saveData.purchasedSkins.includes(item.id);

    if (!purchased) {
        if (saveData.coins < item.price) {
            showShopMessage('コインが不足しています');
            playUiSe('error');
            return;
        }
        pendingPurchaseItem = item;
        pendingPurchaseType = isSkillTab ? 'SKILL' : 'SKIN';
        inPurchaseDialog = true;
        purchaseDialog.classList.remove('hidden');
        return;
    }

    if (isSkillTab) {
        equipSelectMode = true;
        equipSelectIndex = 0;
        showShopMessage('スロット1 / スロット2 を上下で選択');
    } else {
        saveData.selectedSkin = item.id;
        selectedPlayerSkin = item.id;
        images.player.src = `char/player/${selectedPlayerSkin}`;
        persistSaveData();
        renderShop();
        showShopMessage('SELECTED');
    }
}

function finalizePurchase() {
    if (!pendingPurchaseItem) return;
    saveData.coins -= pendingPurchaseItem.price;
    if (pendingPurchaseType === 'SKILL') {
        if (!saveData.purchasedSkills.includes(pendingPurchaseItem.id)) {
            saveData.purchasedSkills.push(pendingPurchaseItem.id);
        }
    } else {
        if (!saveData.purchasedSkins.includes(pendingPurchaseItem.id)) {
            saveData.purchasedSkins.push(pendingPurchaseItem.id);
        }
    }
    pendingPurchaseItem = null;
    pendingPurchaseType = null;
    inPurchaseDialog = false;
    purchaseDialog.classList.add('hidden');
    persistSaveData();
    updateCoinDisplays();
    renderShop();
}

// イベントリスナー
startButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name === '') {
        alert('プレイヤー名を入力してください');
        return;
    }
    gameState.playerName = name;

    // 名前入力後、ゲームスタートSEを再生し、鳴り終わってから難易度選択画面へ
    if (se && se.gamestart) {
        try {
            se.gamestart.currentTime = 0;
            se.gamestart.play()
                .then(() => {
                    se.gamestart.addEventListener('ended', () => {
                        showScreen('difficulty');
                    }, { once: true });
                })
                .catch(() => {
                    // 自動再生制限などで失敗した場合は即時遷移
                    showScreen('difficulty');
                });
        } catch {
            showScreen('difficulty');
        }
    } else {
        showScreen('difficulty');
    }
});

if (titleStartMenu) titleStartMenu.addEventListener('click', () => startButton.click());
if (titleShopMenu) titleShopMenu.addEventListener('click', () => showScreen('shop'));
if (titleSettingMenu) titleSettingMenu.addEventListener('click', () => showScreen('setting'));

// CHANGE SKIN：キャラクター選択画面へ遷移
if (changeSkinButton) {
    changeSkinButton.addEventListener('click', () => {
        showScreen('characterSelect');
    });
}

// キャラクター選択画面：SELECT で現在選択中の画像をプレイヤーに設定してタイトルへ
if (characterSelectButton && characterSelectPreview) {
    characterSelectButton.addEventListener('click', () => {
        if (!saveData.purchasedSkins.includes(characterSelectPendingSkin)) {
            playUiSe('error');
            return;
        }
        selectedPlayerSkin = characterSelectPendingSkin;
        saveData.selectedSkin = selectedPlayerSkin;
        persistSaveData();
        const newSrc = 'char/player/' + selectedPlayerSkin;
        images.player.onload = () => {
            showScreen('title');
        };
        images.player.onerror = () => {
            showScreen('title');
        };
        images.player.src = newSrc;
        if (images.player.complete) {
            showScreen('title');
        }
    });
}

// キャラクター選択画面：戻る
if (backFromCharacterSelect) {
    backFromCharacterSelect.addEventListener('click', () => {
        showScreen('title');
    });
}

if (shopTabSkill) {
    shopTabSkill.addEventListener('click', () => {
        shopTab = 'SKILL';
        shopSelectedIndex = 0;
        renderShop();
    });
}
if (shopTabSkin) {
    shopTabSkin.addEventListener('click', () => {
        shopTab = 'SKIN';
        shopSelectedIndex = 0;
        renderShop();
    });
}
if (backFromShopButton) {
    backFromShopButton.addEventListener('click', () => showScreen('title'));
}
if (purchaseYesButton) {
    purchaseYesButton.addEventListener('click', () => finalizePurchase());
}
if (purchaseNoButton) {
    purchaseNoButton.addEventListener('click', () => {
        inPurchaseDialog = false;
        purchaseDialog.classList.add('hidden');
        pendingPurchaseItem = null;
        pendingPurchaseType = null;
    });
}
if (saveSettingButton) {
    saveSettingButton.addEventListener('click', () => {
        if (settingDraft) saveData.audio = { ...settingDraft };
        persistSaveData();
        showScreen('title');
    });
}
if (cancelSettingButton) {
    cancelSettingButton.addEventListener('click', () => {
        settingDraft = null;
        loadSaveData();
        applyAudioSettings();
        showScreen('title');
    });
}
if (backFromSettingButton) {
    backFromSettingButton.addEventListener('click', () => showScreen('title'));
}

if (skillEquipButton) {
    skillEquipButton.addEventListener('click', () => showScreen('skillEquip'));
}
if (backFromSkillEquipButton) {
    backFromSkillEquipButton.addEventListener('click', () => showScreen('shop'));
}
if (unequipSkillButton) {
    unequipSkillButton.addEventListener('click', () => {
        saveData.equippedSkills[equipSelectIndex] = null;
        persistSaveData();
        renderSkillEquipScreen();
        renderSkillSlots();
    });
}

// 難易度選択ボタンのイベント
easyButton.addEventListener('click', () => {
    gameState.difficulty = 'easy';
    // 難易度選択SEを再生し、流れ終わってからゲーム開始
    if (se && se.difficulty && se.difficulty.easy) {
        try {
            se.difficulty.easy.currentTime = 0;
            se.difficulty.easy.play()
                .then(() => {
                    se.difficulty.easy.addEventListener('ended', () => {
                        startGame();
                    }, { once: true });
                })
                .catch(() => {
                    // 自動再生制限などで失敗した場合は即時開始
                    startGame();
                });
        } catch {
            startGame();
        }
    } else {
        startGame();
    }
});

normalButton.addEventListener('click', () => {
    gameState.difficulty = 'normal';
    // 難易度選択SEを再生し、流れ終わってからゲーム開始
    if (se && se.difficulty && se.difficulty.normal) {
        try {
            se.difficulty.normal.currentTime = 0;
            se.difficulty.normal.play()
                .then(() => {
                    se.difficulty.normal.addEventListener('ended', () => {
                        startGame();
                    }, { once: true });
                })
                .catch(() => {
                    // 自動再生制限などで失敗した場合は即時開始
                    startGame();
                });
        } catch {
            startGame();
        }
    } else {
        startGame();
    }
});

hardButton.addEventListener('click', () => {
    gameState.difficulty = 'hard';
    // 難易度選択SEを再生し、流れ終わってからゲーム開始
    if (se && se.difficulty && se.difficulty.hard) {
        try {
            se.difficulty.hard.currentTime = 0;
            se.difficulty.hard.play()
                .then(() => {
                    se.difficulty.hard.addEventListener('ended', () => {
                        startGame();
                    }, { once: true });
                })
                .catch(() => {
                    // 自動再生制限などで失敗した場合は即時開始
                    startGame();
                });
        } catch {
            startGame();
        }
    } else {
        startGame();
    }
});

// 隠し難易度「國」ボタン
if (kuniButton) {
    kuniButton.addEventListener('click', () => {
        // ロック中は起動させない
        if (!gameState.secretDifficultyUnlocked) return;
        gameState.difficulty = 'kuni';
        // 難易度選択SEを再生し、流れ終わってからゲーム開始
        if (se && se.difficulty && se.difficulty.kuni) {
            try {
                se.difficulty.kuni.currentTime = 0;
                se.difficulty.kuni.play()
                    .then(() => {
                        se.difficulty.kuni.addEventListener('ended', () => {
                            startGame();
                        }, { once: true });
                    })
                    .catch(() => {
                        // 自動再生制限などで失敗した場合は即時開始
                        startGame();
                    });
            } catch {
                startGame();
            }
        } else {
            startGame();
        }
    });
}

// 難易度選択画面からタイトルに戻る
backToTitleFromDifficulty.addEventListener('click', () => {
    showScreen('title');
});

// ゲーム開始関数
function startGame() {
    resizeCanvas();
    initGame();
    showScreen('game');
    gameLoop();
}

backToTitleButton.addEventListener('click', () => {
    playerNameInput.value = '';
    showScreen('title');
});

// キーボード入力の処理
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const isEnter = key === 'enter';
    const isCancel = key === 'escape' || key === 'backspace';
    const isUp = key === 'arrowup';
    const isDown = key === 'arrowdown';
    const isLeft = key === 'arrowleft';
    const isRight = key === 'arrowright';

    if (gamePausedForUpgrade) {
        if (isLeft) {
            upgradeSelectedIndex = (upgradeSelectedIndex - 1 + upgradeChoicesState.length) % upgradeChoicesState.length;
            updateUpgradeSelection();
            playUiSe('cursor');
        }
        if (isRight) {
            upgradeSelectedIndex = (upgradeSelectedIndex + 1) % upgradeChoicesState.length;
            updateUpgradeSelection();
            playUiSe('cursor');
        }
        if (isEnter) {
            const choice = upgradeChoicesState[upgradeSelectedIndex];
            if (choice) choice.apply();
            gamePausedForUpgrade = false;
            if (upgradeOverlay) upgradeOverlay.classList.add('hidden');
            persistSaveData();
            playUiSe('decide');
        }
        return;
    }

    if (!gameState.isRunning) {
        if (gameState.currentScreen === 'title') {
            const max = 2;
            if (isUp) {
                titleSelectedIndex = (titleSelectedIndex - 1 + (max + 1)) % (max + 1);
                playUiSe('cursor');
            }
            if (isDown) {
                titleSelectedIndex = (titleSelectedIndex + 1) % (max + 1);
                playUiSe('cursor');
            }
            updateTitleMenuSelection();
            if (isEnter) {
                playUiSe('decide');
                if (titleSelectedIndex === 0) startButton.click();
                if (titleSelectedIndex === 1) showScreen('shop');
                if (titleSelectedIndex === 2) showScreen('setting');
            }
        } else if (gameState.currentScreen === 'shop') {
            const items = currentShopItems();
            if (inPurchaseDialog) {
                if (isEnter) finalizePurchase();
                if (isCancel) {
                    inPurchaseDialog = false;
                    purchaseDialog.classList.add('hidden');
                    pendingPurchaseItem = null;
                    pendingPurchaseType = null;
                }
                return;
            }
            if (equipSelectMode) {
                if (isUp || isDown) {
                    equipSelectIndex = equipSelectIndex === 0 ? 1 : 0;
                    showShopMessage(`スロット${equipSelectIndex + 1} を選択中`);
                }
                if (isEnter) {
                    const item = items[shopSelectedIndex];
                    saveData.equippedSkills[equipSelectIndex] = item.id;
                    equipSelectMode = false;
                    persistSaveData();
                    renderShop();
                    renderSkillSlots();
                    showShopMessage('EQUIP完了');
                }
                if (isCancel) {
                    equipSelectMode = false;
                    showShopMessage('装備選択をキャンセル');
                }
                return;
            }
            if (isLeft || isRight) {
                shopTab = shopTab === 'SKILL' ? 'SKIN' : 'SKILL';
                shopSelectedIndex = 0;
                renderShop();
                playUiSe('cursor');
            }
            if (isUp) {
                shopSelectedIndex = (shopSelectedIndex - 1 + items.length) % items.length;
                renderShop();
                playUiSe('cursor');
            }
            if (isDown) {
                shopSelectedIndex = (shopSelectedIndex + 1) % items.length;
                renderShop();
                playUiSe('cursor');
            }
            if (isEnter) {
                playUiSe('decide');
                attemptBuyOrEquipCurrent();
            }
            if (isCancel) showScreen('title');
        } else if (gameState.currentScreen === 'setting') {
            if (isUp) settingSelectedIndex = (settingSelectedIndex - 1 + 2) % 2;
            if (isDown) settingSelectedIndex = (settingSelectedIndex + 1) % 2;
            if (isLeft || isRight) {
                const dir = isRight ? 5 : -5;
                if (!settingDraft) settingDraft = { ...saveData.audio };
                if (settingSelectedIndex === 0) settingDraft.bgm = Math.max(0, Math.min(100, settingDraft.bgm + dir));
                if (settingSelectedIndex === 1) settingDraft.se = Math.max(0, Math.min(100, settingDraft.se + dir));
                saveData.audio = { ...settingDraft };
                applyAudioSettings();
                renderSettings();
            }
            if (isEnter) {
                saveData.audio = { ...settingDraft };
                persistSaveData();
                showScreen('title');
            }
            if (isCancel) {
                settingDraft = null;
                applyAudioSettings();
                loadSaveData();
                applyAudioSettings();
                showScreen('title');
            }
            renderSettings();
        } else if (gameState.currentScreen === 'skillEquip') {
            const purchasedSkills = SHOP_SKILLS.filter((s) => saveData.purchasedSkills.includes(s.id));
            if (isUp && purchasedSkills.length > 0) {
                shopSelectedIndex = (shopSelectedIndex - 1 + purchasedSkills.length) % purchasedSkills.length;
                renderSkillEquipScreen();
                playUiSe('cursor');
            }
            if (isDown && purchasedSkills.length > 0) {
                shopSelectedIndex = (shopSelectedIndex + 1) % purchasedSkills.length;
                renderSkillEquipScreen();
                playUiSe('cursor');
            }
            if (isLeft || isRight) {
                equipSelectIndex = equipSelectIndex === 0 ? 1 : 0;
                renderSkillEquipScreen();
                playUiSe('cursor');
            }
            if (isEnter && purchasedSkills.length > 0) {
                const skill = purchasedSkills[shopSelectedIndex];
                const existing = saveData.equippedSkills.indexOf(skill.id);
                if (existing === equipSelectIndex) {
                    saveData.equippedSkills[equipSelectIndex] = null;
                } else {
                    if (existing >= 0) saveData.equippedSkills[existing] = saveData.equippedSkills[equipSelectIndex];
                    saveData.equippedSkills[equipSelectIndex] = skill.id;
                }
                persistSaveData();
                renderSkillSlots();
                renderSkillEquipScreen();
                playUiSe('decide');
            }
            if (isCancel) showScreen('shop');
        } else if (gameState.currentScreen === 'difficulty' && isCancel) {
            showScreen('title');
        }
    }

    // 難易度選択画面でのSキー連打による隠し難易度解禁
    if (!gameState.isRunning && gameState.currentScreen === 'difficulty' && key === 's') {
        gameState.difficultySKeyCount++;
        if (!gameState.secretDifficultyUnlocked && gameState.difficultySKeyCount >= 10) {
            gameState.secretDifficultyUnlocked = true;
            if (kuniButton) {
                kuniButton.classList.remove('hidden-difficulty');
                kuniButton.classList.add('kuni-reveal');
            }
        }
    }

    // ゲーム中の移動／射撃キー
    if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'j' || key === 'q' || key === 'e') {
        if (gameState.isRunning) {
            e.preventDefault(); // ページスクロールを防ぐ
            gameState.keys[key] = true;
            if (key === 'q' || key === 'e') {
                const slotIdx = key === 'q' ? 0 : 1;
                const state = skillCooldownState[slotIdx];
                if (state.now >= state.max) {
                    state.now = 0;
                    // ここでスキル効果を簡易発動（例: healで接触回数を1回回復）
                    const skillId = saveData.equippedSkills[slotIdx];
                    if (skillId === 'heal') gameState.contactCount = Math.max(0, gameState.contactCount - 1);
                }
            }
        }
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'a' || key === 's' || key === 'd' || key === 'j' || key === 'q' || key === 'e') {
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
    loadSaveData();
    applyAudioSettings();
    requestAnimationFrame(animateTitleLogo);
    // 画像を読み込む
    await loadImages();
    syncSelectedSkinFromSave();
    updateCoinDisplays();
    renderSettings();
    renderSkillSlots();
    renderShop();
    updateTitleMenuSelection();
    showScreen('title');
});

