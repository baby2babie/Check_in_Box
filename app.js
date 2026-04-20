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
  if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#94a3b8;">กำลังโหลดข้อมูล...</div>';

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

// ... ส่วนเปิดกล่อง (startLootOpen) และอื่นๆ คงเดิมตามที่คุณส่งมา ...

function startLootOpen(milestone, name, token) {
  if (lbOpening) return;
  lbOpening = true;

  document.getElementById('lb-spin-state').style.display = 'block';
  document.getElementById('lb-result-state').classList.remove('show');
  document.getElementById('lb-popup-title').textContent  = `กำลังเปิด ${name}...`;
  document.getElementById('lb-overlay').classList.add('show');

  callGAS('openLootBox', { token })
    .then(result => {
      setTimeout(() => {
        if (!result.success) {
          closeLootPopup();
          showToast('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
          lbOpening = false;
          return;
        }

        document.getElementById('lb-spin-state').style.display = 'none';
        document.getElementById('lb-result-icon').innerHTML    = getLootIcon(result.discount_amount);
        document.getElementById('lb-result-name').textContent  = result.prize_name;
        document.getElementById('lb-result-amount').textContent = result.discount_amount;
        document.getElementById('lb-result-state').classList.add('show');

        const card = document.getElementById('lb-card-' + milestone);
        if (card) {
          card.classList.add('used');
          card.querySelector('.lb-desc').textContent = 'เปิดแล้ว';
          card.onclick = null;
        }

        const cur = Number(document.getElementById('lb-count').textContent) || 0;
        document.getElementById('lb-count').textContent = Math.max(0, cur - 1);

        spawnConfetti();
        lbOpening = false;
      }, 2000);
    })
    .catch(() => {
      closeLootPopup();
      showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่ครับ', 'error');
      lbOpening = false;
    });
}

function closeLootPopup() {
  document.getElementById('lb-overlay').classList.remove('show');
  document.getElementById('lb-confetti').classList.remove('show');
  document.getElementById('lb-confetti').innerHTML = '';
  lbOpening = false;
}

function getLootIcon(amount) {
  const big    = amount >= 30;
  const medium = amount >= 15;
  const c1   = big ? '#FFD700' : medium ? '#FACC15' : '#D4A017';
  const c2   = big ? '#FF8C00' : medium ? '#D97706' : '#92400E';
  const c3   = big ? '#FFF9C4' : medium ? '#FEF08A' : '#FDE68A';
  const glow = big ? '#FFD700' : medium ? '#FACC15' : '#D4A017';
  const uid  = 'coin-' + Math.random().toString(36).substr(2, 9);

  return `
  <svg width="88" height="88" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${uid}-coin" cx="35%" cy="28%" r="65%">
        <stop offset="0%"   stop-color="${c3}"/>
        <stop offset="55%"  stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </radialGradient>
      <radialGradient id="${uid}-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="${glow}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#${uid}-glow)"/>
    <circle cx="50" cy="48" r="42" fill="${c2}"/>
    <circle cx="50" cy="48" r="34" fill="url(#${uid}-coin)"/>
    <circle cx="50" cy="48" r="32" fill="none" stroke="${c3}" stroke-width="2" opacity="0.7"/>
    <text x="50" y="58" text-anchor="middle" font-size="34" font-weight="900" fill="${c2}">฿</text>
  </svg>`;
}

function spawnConfetti() {
  const wrap   = document.getElementById('lb-confetti');
  const colors = ['#F59E0B','#14B8A6','#8B5CF6','#EF4444','#10B981','#F472B6'];
  wrap.innerHTML = '';
  wrap.classList.add('show');

  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.className            = 'lb-dot';
    dot.style.left            = Math.random() * 100 + 'vw';
    dot.style.background      = colors[Math.floor(Math.random() * colors.length)];
    dot.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    dot.style.animationDelay   = (Math.random() * 0.8) + 's';
    dot.style.width  = (Math.random() * 8 + 4) + 'px';
    dot.style.height = (Math.random() * 8 + 4) + 'px';
    wrap.appendChild(dot);
  }
  setTimeout(() => wrap.classList.remove('show'), 4000);
}

init();
