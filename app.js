// ============================================================
//  กล่องสุ่มรางวัล — app.js
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
    `<div class="loading" style="grid-column:1/-1;color:#EF4444">${msg}</div>`;
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
    showError('❌ LIFF เริ่มต้นไม่ได้ กรุณาเปิดผ่าน LINE ครับ');
  }
}

// ============================================================
//  INIT
// ============================================================
async function init() {
  await initLiff();

  const params = new URLSearchParams(window.location.search);
  const room   = params.get('room');

  if (room) {
    // เปิดจาก LINE flex ที่มี ?room=xxx
    document.getElementById('lb-room-label').textContent = 'ห้อง ' + room;
    await loadLootBoxForRoom(room);
  } else if (liffReady && liff.isLoggedIn() && liffProfile) {
    // เปิดจาก rich menu — ใช้ LINE userId
    await loadLootBoxByUserId(liffProfile.userId);
  } else {
    showError('❌ กรุณาเปิดผ่าน LINE ครับ');
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
    const hasBox   = info.token && !info.opened;
    const isOpened = info.token &&  info.opened;
    const isLocked = !info.token;
    const icon     = isOpened ? '🎁' : isLocked ? '🔒' : '🎁';

    const card = document.createElement('div');
    card.className = 'lb-card'
      + (isOpened ? ' used'   : '')
      + (isLocked ? ' locked' : '');
    card.id = 'lb-card-' + cfg.milestone;

    card.innerHTML = `
      <div class="lb-icon-wrap">
        <div class="lb-circle ${cfg.theme}">
          <div class="lb-arc ${cfg.theme}"></div>
          ${icon}
        </div>
      </div>
      <div class="lb-name">${cfg.name}</div>
      <div class="lb-desc">${
        isOpened ? 'เปิดแล้ว' :
        isLocked ? 'ยังไม่ถึงรอบ' :
        cfg.desc
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
//  OPEN LOOT BOX
// ============================================================
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

        // แสดงผลรางวัล
        document.getElementById('lb-spin-state').style.display = 'none';
        document.getElementById('lb-result-icon').innerHTML    = getLootIcon(result.discount_amount);
        document.getElementById('lb-result-name').textContent  = result.prize_name;
        document.getElementById('lb-result-amount').textContent = result.discount_amount;
        document.getElementById('lb-result-state').classList.add('show');

        // อัปเดต card
        const card = document.getElementById('lb-card-' + milestone);
        if (card) {
          card.classList.add('used');
          card.querySelector('.lb-desc').textContent = 'เปิดแล้ว';
          card.onclick = null;
        }

        // ลด count
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

// ============================================================
//  LOOT ICON (coin svg)
// ============================================================
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
    <ellipse cx="50" cy="92" rx="26" ry="7" fill="rgba(0,0,0,0.35)"/>
    <circle cx="50" cy="48" r="42" fill="${c2}"/>
    <circle cx="50" cy="48" r="34" fill="url(#${uid}-coin)"/>
    <circle cx="50" cy="48" r="32" fill="none" stroke="${c3}" stroke-width="2" opacity="0.7"/>
    <ellipse cx="42" cy="28" rx="18" ry="8" fill="white" opacity="0.35"/>
    <text x="50" y="58"
      text-anchor="middle" font-size="34" font-weight="900"
      font-family="Arial Black,Arial"
      fill="${c2}" stroke="${c3}" stroke-width="1.4">฿</text>
  </svg>`;
}

// ============================================================
//  CONFETTI
// ============================================================
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

// ============================================================
//  START
// ============================================================
init();
