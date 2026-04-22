// ============================================================
//  กล่องสุ่มรางวัล — app.js (Updated for PC & Token support)
// ============================================================

const GAS_URL = 'https://script.google.com/macros/s/AKfycbx57fi00n2RKu7b5jHu67vzUVwrez1cx6RhW0lvvM9cIkt6_amJzMoVJOJvrwD7imHBnA/exec';
const LIFF_ID = '2004478373-pUgVSZTj';

const LB_CONFIG = [
  { milestone: 7,  name: 'กล่องเงิน',     desc: 'ส่วนลด 5–10 บาท',  theme: 'gold',   ms: 'ms-gold'   },
  { milestone: 14, name: 'กล่องทอง',      desc: 'ส่วนลด 5–20 บาท', theme: 'teal',   ms: 'ms-teal'   },
  { milestone: 21, name: 'กล่องแพลตินัม', desc: 'ส่วนลด 5–25 บาท', theme: 'purple', ms: 'ms-purple' },
  { milestone: 28, name: 'กล่องตำนาน',    desc: 'ส่วนลด 5–45 บาท', theme: 'red',    ms: 'ms-red'    },
];

let lbOpening   = false;
let liffReady   = false;
let liffProfile = null;

// ============================================================
//  UTILS
// ============================================================
async function callGAS(action, params = {}) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, ...params })
  });
  return res.json();
}

function showToast(msg, type = 'success', duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast ' + type;
  setTimeout(() => t.className = 'toast', duration);
}

function showError(msg) {
  document.getElementById('lb-grid').innerHTML =
    `<div class="loading" style="grid-column:1/-1;color:#EF4444;text-align:center;padding:20px;">${msg}</div>`;
}

// ============================================================
//  LIFF
// ============================================================
async function initLiff() {
  try {
    await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: true });
    liffReady = true;
    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: location.href });
      return;
    }
    liffProfile = await liff.getProfile();
  } catch (e) {
    console.warn('LIFF init failed:', e);
    // ถ้าเปิดบน PC ทั่วไปที่ไม่ผ่าน LINE อาจจะเข้าตรงนี้ ให้ทำงานต่อได้
    liffReady = false; 
  }
}

// ============================================================
//  INIT
// ============================================================
async function init() {
  const grid = document.getElementById('lb-grid');
 if (grid) grid.innerHTML = `
  <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องเงิน</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 7 วัน</div></div>
  <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องทอง</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 14 วัน</div></div>
  <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องแพลตินัม</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 21 วัน</div></div>
  <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องตำนาน</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 28 วัน</div></div>
`;
  await initLiff();

  const params = new URLSearchParams(window.location.search);
  const room   = params.get('room');
  const token  = params.get('token'); // เพิ่มการรับ Token

  if (room) {
    document.getElementById('lb-room-label').textContent = 'ห้อง ' + room;
    await loadLootBoxForRoom(room);
  } else if (token) {
    // ฟังก์ชันใหม่สำหรับโหลดผ่าน Token บน PC
    await loadLootBoxByToken(token); 
  } else if (liffReady && liff.isLoggedIn() && liffProfile) {
    await loadLootBoxByUserId(liffProfile.userId);
  } else {
    showError('❌ ไม่พบข้อมูลห้อง');
  }
}

// เพิ่มฟังก์ชันดึงข้อมูลจาก Token
async function loadLootBoxByToken(token) {
  try {
    const result = await callGAS('getLootBoxData', { token: token });
    if (!result.success) { showError('❌ ' + result.message); return; }
    renderPage(result);
  } catch (e) {
    showError('❌ การเชื่อมต่อขัดข้อง');
  }
}
// ============================================================
//  LOAD DATA
// ============================================================
async function loadLootBoxForRoom(roomNo) {
  try {
    const result = await callGAS('getLootBoxDataByRoom', { roomNo });
    if (!result.success) { showError('❌ ' + (result.message || 'โหลดไม่ได้')); return; }
    renderPage(result);
  } catch (e) {
    showError('❌ โหลดข้อมูลไม่ได้ กรุณาลองใหม่ครับ');
  }
}

async function loadLootBoxByToken(token) {
  try {
    // ใช้ action เดียวกับ getLootBoxData แต่ส่งเป็น token ไป
    const result = await callGAS('getLootBoxData', { token: token });
    if (!result.success) { showError('❌ ' + (result.message || 'Token ไม่ถูกต้อง')); return; }
    renderPage(result);
  } catch (e) {
    showError('❌ โหลดข้อมูลไม่ได้ กรุณาลองใหม่ครับ');
  }
}

async function loadLootBoxByUserId(userId) {
  try {
    const result = await callGAS('getLootBoxData', { userId });
    if (!result.success) { showError('❌ ' + (result.message || 'โหลดไม่ได้')); return; }
    renderPage(result);
  } catch (e) {
    showError('❌ โหลดข้อมูลไม่ได้ กรุณาลองใหม่ครับ');
  }
}

// ============================================================
//  RENDER
// ============================================================
function renderPage(result) {
  if (result.roomNo) {
    document.getElementById('lb-room-label').textContent = 'ห้อง ' + result.roomNo;
  }
  document.getElementById('lb-count').textContent = result.totalBox || 0;
  renderLootGrid(result.boxes || {});
}

function renderLootGrid(boxes) {
  const grid = document.getElementById('lb-grid');
  grid.innerHTML = '';

  LB_CONFIG.forEach(cfg => {
    const info     = boxes[cfg.milestone] || {};
    const hasBox   = info.token && !info.opened; // เงื่อนไข: มีสิทธิ์เปิดและยังไม่ถูกใช้
    const isOpened = info.token &&  info.opened;
    const isLocked = !info.token;

    const card = document.createElement('div');
    // เพิ่มเงื่อนไขใส่คลาส can-open ถ้าพร้อมเปิด
    card.className = 'lb-card'
      + (hasBox   ? ' can-open' : '') 
      + (isOpened ? ' used'     : '')
      + (isLocked ? ' locked'   : '');
    
    card.id = 'lb-card-' + cfg.milestone;
    card.setAttribute('data-theme', cfg.theme); // ใส่ data-theme เพื่อให้สีไฟกะพริบตรงกับธีม

    card.innerHTML = `
      <div class="lb-icon-wrap">
        <div class="lb-circle ${cfg.theme}">
          <div class="lb-arc ${cfg.theme}"></div>
          ${isLocked ? '🔒' : '🎁'}
        </div>
      </div>
      <div class="lb-name">${cfg.name}</div>
      <div class="lb-desc">${
        hasBox   ? 'กดเพื่อเปิดกล่อง' : 
        isOpened ? 'เปิดแล้ว' :
        'ยังไม่ถึงรอบ'
      }</div>
      <div class="lb-ms ${cfg.ms}">ครบ ${cfg.milestone} วัน</div>
    `;

    if (hasBox) {
      card.onclick = () => startLootOpen(cfg.milestone, cfg.name, info.token);
    }
    grid.appendChild(card);
  });
}

// ============================================================
//  TIER CONFIG
// ============================================================
const TIER_CFG = {
  7:  { key:'silver', title:'กำลังเปิดกล่องเงิน',      orbCount:5,  orbDist:'-52px', confettiCount:50,  confettiColors:['#93D2FF','#E0F4FF','#3A8FBF','#FFF','#AAD8FF'], starEmoji:['❄️','✦','⭐'],              shake:false },
  14: { key:'gold',   title:'กำลังเปิดกล่องทอง',       orbCount:6,  orbDist:'-56px', confettiCount:80,  confettiColors:['#FFD700','#E9A84C','#FFF176','#FFF','#FFECB3'],  starEmoji:['⭐','✦','✨','💛'],         shake:false },
  21: { key:'plat',   title:'กำลังเปิดกล่องแพลตินัม',  orbCount:8,  orbDist:'-58px', confettiCount:100, confettiColors:['#A78BFA','#C084FC','#EDD9FF','#FFF','#7C3AED'],  starEmoji:['💜','✦','⭐','✨','💫'],    shake:false },
  28: { key:'legend', title:'กำลังเปิดกล่องตำนาน',     orbCount:10, orbDist:'-60px', confettiCount:160, confettiColors:['#FF5555','#FF8C00','#FFD700','#FF4444','#FFF'],   starEmoji:['🔥','💥','⭐','✦','👑','💫'], shake:true  },
};

// ============================================================
//  OPEN LOOTBOX — Premium Animation
// ============================================================
function startLootOpen(milestone, name, token) {
  if (lbOpening) return;
  lbOpening = true;

  const cfg = TIER_CFG[milestone] || TIER_CFG[14];

  // set tier class on overlay
  const overlay = document.getElementById('lb-overlay');
  overlay.className = 'lb-overlay show tier-' + cfg.key;

  // reset states
  document.getElementById('lb-spin-state').style.display  = 'block';
  document.getElementById('lb-spin-state').style.opacity  = '1';
  document.getElementById('lb-result-state').classList.remove('show');
  document.getElementById('lb-popup-title').textContent   = cfg.title;

  // build orbs
  _buildOrbs(cfg);

  // legend shake after 1.2s
  if (cfg.shake) {
    setTimeout(() => {
      overlay.classList.add('shaking');
      setTimeout(() => overlay.classList.remove('shaking'), 400);
    }, 1200);
  }

  callGAS('openLootBox', { token })
    .then(result => {
      const delay = cfg.shake ? 2200 : 1800;
      setTimeout(() => {
        if (!result.success) {
          closeLootPopup();
          showToast('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
          lbOpening = false;
          return;
        }

        // fade out spin
        const spin = document.getElementById('lb-spin-state');
        spin.style.transition = 'opacity 0.3s';
        spin.style.opacity = '0';

        setTimeout(() => {
          spin.style.display = 'none';

          // fill result
          document.getElementById('lb-result-icon').innerHTML     = _buildCoin(cfg.key);
          document.getElementById('lb-result-name').textContent   = result.prize_name;
          document.getElementById('lb-result-amount').textContent = result.discount_amount;
          _buildStars(cfg);

          document.getElementById('lb-result-state').classList.add('show');

          // update card
          const card = document.getElementById('lb-card-' + milestone);
          if (card) {
            card.classList.remove('can-open');
            card.classList.add('used');
            card.querySelector('.lb-desc').textContent = 'เปิดแล้ว';
            card.onclick = null;
          }

          const cur = Number(document.getElementById('lb-count').textContent) || 0;
          document.getElementById('lb-count').textContent = Math.max(0, cur - 1);

          _spawnConfetti(cfg);

          // legend screen flash
          if (cfg.shake) _legendFlash();

          lbOpening = false;
        }, 350);
      }, delay);
    })
    .catch(() => {
      closeLootPopup();
      showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่ครับ', 'error');
      lbOpening = false;
    });
}

function closeLootPopup() {
  const overlay = document.getElementById('lb-overlay');
  overlay.classList.remove('show');
  overlay.className = 'lb-overlay';
  document.getElementById('lb-confetti').classList.remove('show');
  document.getElementById('lb-confetti').innerHTML = '';
  lbOpening = false;
}

// ============================================================
//  HELPERS
// ============================================================
function _buildOrbs(cfg) {
  const orbit = document.getElementById('lb-orbit');
  if (!orbit) return;
  orbit.innerHTML = '';
  for (let i = 0; i < cfg.orbCount; i++) {
    const angle = (360 / cfg.orbCount) * i;
    const orb = document.createElement('div');
    orb.className = 'lb-orb';
    orb.style.cssText = `--r:${angle}deg;--dist:${cfg.orbDist};--d:${(i*0.1).toFixed(1)}s`;
    orbit.appendChild(orb);
    const tail = document.createElement('div');
    tail.className = 'lb-orb-tail';
    tail.style.cssText = `--r:${angle}deg;--dist:${cfg.orbDist}`;
    orbit.appendChild(tail);
  }
}

function _buildStars(cfg) {
  const wrap = document.getElementById('lb-result-stars');
  if (!wrap) return;
  wrap.innerHTML = '';
  const count = cfg.orbCount + 2;
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i;
    const dist  = 55 + Math.random() * 20;
    const tx = Math.round(Math.cos((angle - 90) * Math.PI / 180) * dist);
    const ty = Math.round(Math.sin((angle - 90) * Math.PI / 180) * dist);
    const emoji = cfg.starEmoji[Math.floor(Math.random() * cfg.starEmoji.length)];
    const sz = (12 + Math.random() * 8).toFixed(0) + 'px';
    const s = document.createElement('div');
    s.className = 'lb-star';
    s.style.cssText = `--tx:${tx}px;--ty:${ty}px;--d:${(Math.random()*0.4).toFixed(2)}s;font-size:${sz}`;
    s.textContent = emoji;
    wrap.appendChild(s);
  }
}

function _buildCoin(tierKey) {
  const styles = {
    silver: { bg:'radial-gradient(circle at 35% 30%,#E8F4FF,#93D2FF 40%,#3A8FBF 80%,#1A5F8A)', border:'#93D2FF', shadow:'0 0 50px rgba(147,210,255,0.7),0 0 100px rgba(147,210,255,0.3)', color:'#0A3A5C' },
    gold:   { bg:'radial-gradient(circle at 35% 30%,#FFE566,#E9A84C 40%,#B8860B 80%,#8B6310)',  border:'#FFD700', shadow:'0 0 50px rgba(255,215,0,0.7),0 0 100px rgba(233,168,76,0.3)',   color:'#5A3200' },
    plat:   { bg:'radial-gradient(circle at 35% 30%,#EDD9FF,#A78BFA 40%,#6D28D9 80%,#3B1279)', border:'#C084FC', shadow:'0 0 70px rgba(192,132,252,0.8),0 0 130px rgba(167,139,250,0.3)', color:'#F5EEFF' },
    legend: { bg:'radial-gradient(circle at 35% 30%,#FFB3B3,#FF5555 40%,#CC0000 80%,#7A0000)', border:'#FF4444', shadow:'0 0 90px rgba(255,68,68,0.9),0 0 160px rgba(255,60,60,0.4)',     color:'#FFE0E0' },
  };
  const s = styles[tierKey] || styles.gold;
  return `<div class="lb-coin lb-coin-${tierKey}" style="background:${s.bg};border-color:${s.border};box-shadow:${s.shadow};color:${s.color}">฿</div>`;
}

function _spawnConfetti(cfg) {
  const wrap = document.getElementById('lb-confetti');
  wrap.innerHTML = '';
  wrap.classList.add('show');
  for (let i = 0; i < cfg.confettiCount; i++) {
    const d = document.createElement('div');
    d.className = 'lb-dot';
    const isCircle = Math.random() > 0.4;
    d.style.cssText = `
      left:${Math.random()*100}vw;
      background:${cfg.confettiColors[Math.floor(Math.random()*cfg.confettiColors.length)]};
      animation-duration:${Math.random()*2+1.2}s;
      animation-delay:${Math.random()*0.8}s;
      width:${Math.random()*9+4}px;
      height:${Math.random()*9+4}px;
      border-radius:${isCircle?'50%':'2px'};
    `;
    wrap.appendChild(d);
  }
  setTimeout(() => wrap.classList.remove('show'), 5000);
}

function _legendFlash() {
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:rgba(255,60,60,0.25);z-index:200;pointer-events:none;transition:opacity 0.5s ease;';
  document.body.appendChild(flash);
  requestAnimationFrame(() => {
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 500);
  });
}

init();
