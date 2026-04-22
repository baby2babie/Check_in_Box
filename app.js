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

  // ✅ แสดง skeleton 4 ใบก่อน
  if (grid) {
    grid.innerHTML = `
      <div class="lb-skeleton" style="height:180px;"></div>
      <div class="lb-skeleton" style="height:180px;"></div>
      <div class="lb-skeleton" style="height:180px;"></div>
      <div class="lb-skeleton" style="height:180px;"></div>
    `;
  }

  await initLiff();

  const params = new URLSearchParams(window.location.search);
  const room   = params.get('room');
  const token  = params.get('token');

  if (room) {
    document.getElementById('lb-room-label').textContent = 'ห้อง ' + room;
    await loadLootBoxForRoom(room);
  } else if (token) {
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

  LB_CONFIG.forEach((cfg, i) => {
    const info     = boxes[cfg.milestone] || {};
    const hasBox   = info.token && !info.opened;
    const isOpened = info.token &&  info.opened;
    const isLocked = !info.token;

    const card = document.createElement('div');
    card.className = 'lb-card'
      + (hasBox   ? ' can-open' : '')
      + (isOpened ? ' used'     : '')
      + (isLocked ? ' locked'   : '');

    card.id = 'lb-card-' + cfg.milestone;
    card.setAttribute('data-theme', cfg.theme);
    card.style.animationDelay = (i * 0.08) + 's'; // ✅ stagger

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

    // ✅ fade-in ทีละใบ
    setTimeout(() => card.classList.add('fade-in'), i * 80);
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
  const isBigWin = amount >= 25;
  const isLegend = amount >= 45;
  const uid = 'epic-coin-' + Math.random().toString(36).substr(2, 9);
  
  // สีทองระดับ High-End
  const goldWhite  = '#FFFFFF';
  const goldSun    = '#FFD700';
  const goldBright = '#FDE68A';
  const goldMain   = '#FACC15';
  const goldDeep   = '#B45309';

  // ตั้งค่าความอลังการ (รัศมีแฉกจะหมุนวนรอบๆ)
  const rayOpacity = isLegend ? '0.5' : isBigWin ? '0.3' : '0.1';
  const glowSize   = isLegend ? '60' : isBigWin ? '50' : '40';

  return `
  <svg width="140" height="140" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="margin: -10px;">
    <defs>
      <radialGradient id="${uid}-core" cx="50%" cy="50%" r="50%">
        <stop offset="20%"  stop-color="${goldWhite}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${goldSun}"   stop-opacity="0"/>
      </radialGradient>

      <linearGradient id="${uid}-slash" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="45%" stop-color="white" stop-opacity="0"/>
        <stop offset="50%" stop-color="white" stop-opacity="0.6"/>
        <stop offset="55%" stop-color="white" stop-opacity="0"/>
      </linearGradient>

      <radialGradient id="${uid}-metal" cx="30%" cy="30%" r="70%">
        <stop offset="0%"   stop-color="${goldBright}"/>
        <stop offset="50%"  stop-color="${goldMain}"/>
        <stop offset="100%" stop-color="${goldDeep}"/>
      </radialGradient>
    </defs>

    <g transform="translate(60,60)" opacity="${rayOpacity}">
      ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => `
        <polygon points="0,0 -4,-60 4,-60" fill="${goldSun}" transform="rotate(${deg})" opacity="0.4"/>
      `).join('')}
    </g>

    <circle cx="60" cy="60" r="${glowSize}" fill="url(#${uid}-core)" opacity="0.6"/>

    <circle cx="60" cy="62" r="39" fill="${goldDeep}"/>
    
    <circle cx="60" cy="60" r="38" fill="url(#${uid}-metal)"/>
    
    <circle cx="60" cy="60" r="38" fill="url(#${uid}-slash)"/>
    
    ${isBigWin ? `
      <circle cx="35" cy="35" r="2" fill="white">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="85" cy="45" r="1.5" fill="white">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
    ` : ''}

    <text x="60" y="73" text-anchor="middle" font-size="38" font-weight="900" 
          font-family="Arial Black" fill="${goldDeep}" opacity="0.6">฿</text>
    <text x="60" y="71" text-anchor="middle" font-size="38" font-weight="900" 
          font-family="Arial Black" fill="${goldWhite}">฿</text>
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
