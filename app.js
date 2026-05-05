// ============================================================
//  กล่องสุ่มรางวัล — app.js (Premium Edition)
// ============================================================

const GAS_URL = 'https://script.google.com/macros/s/AKfycbx57fi00n2RKu7b5jHu67vzUVwrez1cx6RhW0lvvM9cIkt6_amJzMoVJOJvrwD7imHBnA/exec';
const LIFF_ID = '2004478373-pUgVSZTj';

// กล่อง 4 ใบ — เหมือนกันหมด ต่างที่ milestone + tier
const LB_CONFIG = [
  { milestone: 7,  name: 'กล่องเงิน',     tier: 'silver', ms: 'ms-silver' },
  { milestone: 14, name: 'กล่องทอง',      tier: 'gold',   ms: 'ms-gold'   },
  { milestone: 21, name: 'กล่องแพลตินัม', tier: 'plat',   ms: 'ms-plat'   },
  { milestone: 28, name: 'กล่องตำนาน',    tier: 'legend', ms: 'ms-legend' },
];

// tier config — สี / animation / badge / button
const TIER_CFG = {
  silver: {
    color: '#94A3B8', label: 'SILVER RANK',
    shakeClass: 'shake-soft', tensionDur: '2.6s', glitch: false,
    ringCol: 'rgba(148,163,184,.3)',
    orbits: [
      { r:55, dur:2.2, planets:[{col:'#93D2FF',sz:6,start:0},{col:'#38BFA1',sz:4,start:180}] },
      { r:82, dur:3.8, planets:[{col:'#93D2FF',sz:8,start:60},{col:'#E9A84C',sz:4,start:220},{col:'#93D2FF',sz:5,start:310}] },
      { r:105,dur:5.5, planets:[{col:'#93D2FF',sz:10,start:90},{col:'#9B7EE8',sz:4,start:210},{col:'#93D2FF',sz:4,start:330}] },
    ],
    badge:{ bg:'linear-gradient(145deg,#0a1a2a,#040c14)', border:'rgba(147,210,255,.5)', glow:'rgba(147,210,255,.4)' },
    badgeGrad: 'linear-gradient(160deg,#f0f8ff,#93D2FF 45%,#1a5f8a)',
    btn:{ bg:'linear-gradient(135deg,#475569 0%,#1E293B 100%)', color:'#E2E8F0', glow:'rgba(148,163,184,.4)' },
    confetti: ['#94A3B8','#CBD5E1','#E2E8F0','#fff','#64748B'],
  },
  gold: {
    color: '#F59E0B', label: 'GOLD RANK',
    shakeClass: 'shake-mid', tensionDur: '2.8s', glitch: false,
    ringCol: 'rgba(255,215,0,.32)',
    orbits: [
      { r:53, dur:1.6, planets:[{col:'#FFD700',sz:7,start:0},{col:'#38BFA1',sz:4,start:180}] },
      { r:80, dur:2.8, planets:[{col:'#FFD700',sz:9,start:60},{col:'#E9A84C',sz:5,start:185},{col:'#FF8C00',sz:5,start:305}] },
      { r:103,dur:4.2, planets:[{col:'#FFD700',sz:12,start:120},{col:'#93D2FF',sz:5,start:240},{col:'#FFD700',sz:5,start:5}] },
    ],
    badge:{ bg:'linear-gradient(145deg,#2a1f08,#1a1200)', border:'rgba(255,215,0,.5)', glow:'rgba(255,215,0,.45)' },
    badgeGrad: 'linear-gradient(160deg,#fffde7,#FFD700 45%,#92400E)',
    btn:{ bg:'linear-gradient(135deg,#F59E0B 0%,#B45309 100%)', color:'#1C0A00', glow:'rgba(245,158,11,.55)' },
    confetti: ['#FFD700','#F59E0B','#FEF08A','#fff','#F97316'],
  },
  plat: {
    color: '#A78BFA', label: 'PLATINUM RANK',
    shakeClass: 'shake-hard', tensionDur: '3.0s', glitch: false,
    ringCol: 'rgba(167,139,250,.35)',
    orbits: [
      { r:51, dur:1.1, planets:[{col:'#A78BFA',sz:7,start:0},{col:'#C084FC',sz:4,start:120},{col:'#E9A84C',sz:3,start:240}] },
      { r:78, dur:2.0, planets:[{col:'#A78BFA',sz:9,start:45},{col:'#C084FC',sz:6,start:170},{col:'#93D2FF',sz:4,start:285}] },
      { r:101,dur:3.2, planets:[{col:'#A78BFA',sz:12,start:90},{col:'#C084FC',sz:6,start:205},{col:'#FF5555',sz:4,start:320},{col:'#A78BFA',sz:4,start:5}] },
    ],
    badge:{ bg:'linear-gradient(145deg,#150a2a,#0a0618)', border:'rgba(167,139,250,.5)', glow:'rgba(167,139,250,.45)' },
    badgeGrad: 'linear-gradient(160deg,#faf5ff,#A78BFA 45%,#4c1d95)',
    btn:{ bg:'linear-gradient(135deg,#A78BFA 0%,#5B21B6 100%)', color:'#F5F3FF', glow:'rgba(167,139,250,.55)' },
    confetti: ['#A78BFA','#C084FC','#DDD6FE','#fff','#7C3AED'],
  },
  legend: {
    color: '#EF4444', label: 'LEGENDARY RANK',
    shakeClass: 'shake-chaos', tensionDur: '3.4s', glitch: true,
    ringCol: 'rgba(255,85,85,.42)',
    orbits: [
      { r:50, dur:0.8, planets:[{col:'#FF5555',sz:7,start:0},{col:'#FF8C00',sz:4,start:120},{col:'#FFD700',sz:3,start:240}] },
      { r:77, dur:1.5, planets:[{col:'#FF5555',sz:10,start:60},{col:'#FF8C00',sz:6,start:185},{col:'#FF5555',sz:5,start:305}] },
      { r:100,dur:2.4, planets:[{col:'#FF5555',sz:13,start:90},{col:'#FF8C00',sz:7,start:205},{col:'#FFD700',sz:5,start:315},{col:'#FF5555',sz:4,start:20}] },
    ],
    badge:{ bg:'linear-gradient(145deg,#2a0808,#180404)', border:'rgba(255,85,85,.6)', glow:'rgba(255,60,60,.5)' },
    badgeGrad: 'linear-gradient(160deg,#fff1f2,#FF5555 45%,#7f1d1d)',
    btn:{ bg:'linear-gradient(135deg,#EF4444 0%,#7F1D1D 100%)', color:'#FFF1F2', glow:'rgba(239,68,68,.6)' },
    confetti: ['#FF5555','#FF8C00','#FCA5A5','#fff','#EF4444'],
  },
};

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
    `<div class="loading" style="color:#EF4444">${msg}</div>`;
}

// ============================================================
//  LIFF
// ============================================================
async function initLiff() {
  try {
    await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: true });
    liffReady = true;
    if (!liff.isLoggedIn()) { liff.login({ redirectUri: location.href }); return; }
    liffProfile = await liff.getProfile();
  } catch (e) {
    console.warn('LIFF init failed:', e);
    liffReady = false;
  }
}

// ============================================================
//  INIT
// ============================================================
async function init() {
  const grid = document.getElementById('lb-grid');

  // skeleton
  grid.innerHTML = LB_CONFIG.map(() => `
    <div class="lb-card lb-skeleton"></div>
  `).join('');

  await initLiff();

  const params = new URLSearchParams(window.location.search);
  const room  = params.get('room');
  const token = params.get('token');

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

async function loadLootBoxForRoom(roomNo) {
  try {
    const result = await callGAS('getLootBoxDataByRoom', { roomNo });
    if (!result.success) { showError('❌ ' + (result.message || 'โหลดไม่ได้')); return; }
    renderPage(result);
  } catch (e) { showError('❌ โหลดข้อมูลไม่ได้ กรุณาลองใหม่ครับ'); }
}

async function loadLootBoxByToken(token) {
  try {
    const result = await callGAS('getLootBoxData', { token });
    if (!result.success) { showError('❌ ' + (result.message || 'Token ไม่ถูกต้อง')); return; }
    renderPage(result);
  } catch (e) { showError('❌ โหลดข้อมูลไม่ได้ กรุณาลองใหม่ครับ'); }
}

async function loadLootBoxByUserId(userId) {
  try {
    const result = await callGAS('getLootBoxData', { userId });
    if (!result.success) { showError('❌ ' + (result.message || 'โหลดไม่ได้')); return; }
    renderPage(result);
  } catch (e) { showError('❌ โหลดข้อมูลไม่ได้ กรุณาลองใหม่ครับ'); }
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
    const key  = cfg.milestone;
    // ✅ แก้จาก boxes[cfg.milestone] → boxes[key] รองรับทั้ง string และ number
    const info     = boxes[key] || {};
    const hasBox   = info.token && !info.opened;
    const isOpened = info.token &&  info.opened;
    const isLocked = !info.token;

    const card = document.createElement('div');
    card.className = 'lb-card'
      + (hasBox   ? ' can-open' : '')
      + (isOpened ? ' used'     : '')
      + (isLocked ? ' locked'   : '');
    card.id = 'lb-card-' + key;
    card.setAttribute('data-tier', cfg.tier);
    card.style.setProperty('--t-color', TIER_CFG[cfg.tier].color);

    const subLabel  = key === 'PAID' ? 'จ่ายตรงเวลา'        : `ครบ ${key} วัน`;
    const lockedMsg = key === 'PAID' ? 'จ่ายตรงเวลาเพื่อรับ' : 'ยังไม่ถึงรอบ';

    card.innerHTML = `
      <span class="lb-card-icon">🎁</span>
      <div class="lb-card-name">${cfg.name.toUpperCase()}</div>
      <div class="lb-card-sub">${
        hasBox   ? 'กดเพื่อเปิดกล่อง' :
        isOpened ? 'เปิดแล้ว'         : lockedMsg
      }</div>
      <div class="lb-card-ms ${cfg.ms}">${subLabel}</div>
    `;

    if (hasBox) {
      card.onclick = () => startLootOpen(key, cfg.name, cfg.tier, info.token);
    }

    setTimeout(() => card.classList.add('fade-in'), i * 80);
    grid.appendChild(card);
  });
}

// ============================================================
//  SOLAR SYSTEM HTML
// ============================================================
function buildSolarHTML(tier) {
  const cfg = TIER_CFG[tier];
  const cx = 110, cy = 110, sz = 220;

  let svg = `<svg viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%"><defs>`;
  cfg.orbits.forEach((_,i) =>
    svg += `<filter id="rf${i}${tier}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
  );
  svg += `</defs>`;
  cfg.orbits.forEach((orb, i) => {
    svg += `<circle cx="${cx}" cy="${cy}" r="${orb.r}" fill="none" stroke="${cfg.ringCol}" stroke-width="${i===2?1.5:1}" filter="url(#rf${i}${tier})"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${orb.r}" fill="none" stroke="${cfg.color}" stroke-width="0.4" opacity="0.25"/>`;
  });
  svg += `</svg>`;

  let planets = '';
  cfg.orbits.forEach(orb => {
    orb.planets.forEach(p => {
      const h = p.sz / 2;
      planets += `<div class="planet-css" style="
        width:${p.sz}px;height:${p.sz}px;margin:-${h}px 0 0 -${h}px;
        background:${p.col};
        box-shadow:0 0 ${p.sz*2}px ${p.col},0 0 ${p.sz*3}px ${p.col}88;
        --s:${p.start}deg;--r:${orb.r}px;
        animation-duration:${orb.dur}s;
        animation-delay:-${(p.start/360*orb.dur).toFixed(2)}s;
      "></div>`;
    });
  });

  const sun = `<div class="box-center" id="box-icon" style="
    background:radial-gradient(circle at 35% 35%,#1a1a24,#08080e);
    border:2px solid ${cfg.color};
    box-shadow:0 0 24px ${cfg.color}88,0 0 50px ${cfg.color}44;
  ">🎁</div>`;

  return svg + planets + sun;
}

// ============================================================
//  OPEN LOOT BOX
// ============================================================
function startLootOpen(milestone, name, tier, token) {
  if (lbOpening) return;
  lbOpening = true;

  const cfg     = TIER_CFG[tier];
  const overlay = document.getElementById('lb-overlay');
  const flash   = document.getElementById('flash');

  // set tier color
  document.documentElement.style.setProperty('--t-color', cfg.color);

  // show overlay
  overlay.style.background = '#000';
  overlay.classList.add('active');

  // reset & show spin
  document.getElementById('result-ui').classList.remove('show');
  document.getElementById('spin-wrap').style.display = 'flex';
  document.getElementById('spin-stage').innerHTML = buildSolarHTML(tier);

  // shake
  overlay.classList.remove('shake-soft','shake-mid','shake-hard','shake-chaos');
  overlay.classList.add(cfg.shakeClass);

  // box tension
  const boxIcon = document.getElementById('box-icon');
  boxIcon.style.setProperty('--tension-dur', cfg.tensionDur);
  setTimeout(() => boxIcon.classList.add('box-tension'), 100);

  // legend glitch
  if (cfg.glitch) {
    ['err1','err2','err3'].forEach(id => document.getElementById(id).classList.add('show'));
    setTimeout(() => boxIcon.classList.add('box-glitch'), 1600);
  }

  // API call
  callGAS('openLootBox', { token })
    .then(result => {
      const waitTime = cfg.glitch ? 3600 : 2700;

      setTimeout(() => {
        if (!result.success) {
          closeLootPopup();
          showToast('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
          lbOpening = false;
          return;
        }

        // flash
        flash.style.animation = 'flashTrigger .6s forwards';

        setTimeout(() => {
          flash.style.animation = '';
          overlay.classList.remove('shake-soft','shake-mid','shake-hard','shake-chaos');
          ['err1','err2','err3'].forEach(id => document.getElementById(id).classList.remove('show'));

          // hide spin
          document.getElementById('spin-wrap').style.display = 'none';
          overlay.style.background = 'radial-gradient(circle,#1E293B 0%,#000 100%)';

          // fill badge
          const badge = document.getElementById('res-badge');
          const sym   = badge.querySelector('.res-badge-sym');
          badge.style.cssText = `width:90px;height:90px;border-radius:18px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;animation:badgeFloat 2s ease-in-out infinite alternate;background:${cfg.badge.bg};border:1.5px solid ${cfg.badge.border};box-shadow:0 0 28px ${cfg.badge.glow}`;
          sym.style.cssText   = `font-size:46px;font-weight:900;font-family:Arial Black,sans-serif;position:relative;z-index:1;line-height:1;background:${cfg.badgeGrad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 14px ${cfg.color})`;

          // tier name
          document.getElementById('res-tier-name').textContent = cfg.label;

          // button colors
          const btn = document.getElementById('btn-claim');
          btn.style.setProperty('--btn-bg',    cfg.btn.bg);
          btn.style.setProperty('--btn-color', cfg.btn.color);
          btn.style.setProperty('--btn-glow',  cfg.btn.glow);
          btn.style.color = cfg.btn.color;

          // reset amount animation
          const valEl = document.getElementById('prize-val');
          valEl.style.animation = 'none';
          valEl.textContent = '0';
          void valEl.offsetWidth;
          valEl.style.animation = '';

          // show result
          document.getElementById('result-ui').classList.add('show');

          // update card
          const card = document.getElementById('lb-card-' + milestone);
          if (card) {
            card.classList.add('used');
            card.querySelector('.lb-card-sub').textContent = 'เปิดแล้ว';
            card.onclick = null;
          }
          const cur = Number(document.getElementById('lb-count').textContent) || 0;
          document.getElementById('lb-count').textContent = Math.max(0, cur - 1);

          // count up + confetti
          setTimeout(() => {
            countUp(valEl, result.discount_amount, 1800);
            spawnConfetti(cfg.confetti);
          }, 300);

          lbOpening = false;
        }, 150);
      }, waitTime);
    })
    .catch(() => {
      closeLootPopup();
      showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่ครับ', 'error');
      lbOpening = false;
    });
}

// ============================================================
//  CLOSE
// ============================================================
function closeLootPopup() {
  const overlay = document.getElementById('lb-overlay');
  overlay.classList.remove('active','shake-soft','shake-mid','shake-hard','shake-chaos');
  document.getElementById('result-ui').classList.remove('show');
  document.getElementById('spin-stage').innerHTML = '';
  ['err1','err2','err3'].forEach(id => document.getElementById(id).classList.remove('show'));
  spawnConfettiStop();
  lbOpening = false;
}

// ============================================================
//  COUNT UP
// ============================================================
function countUp(el, target, dur) {
  const t0 = performance.now();
  (function step(now) {
    const t = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - t, 6);
    el.textContent = Math.round(e * target);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  })(t0);
}

// ============================================================
//  CONFETTI
// ============================================================
function spawnConfetti(cols) {
  const w = document.getElementById('lb-confetti');
  w.innerHTML = ''; w.classList.add('show');
  for (let i = 0; i < 140; i++) {
    const d = document.createElement('div');
    d.className = 'c-dot';
    const sz = 4 + Math.random() * 9, rect = Math.random() > .4;
    d.style.cssText = `left:${Math.random()*100}vw;width:${sz}px;height:${rect?sz*2:sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};border-radius:${rect?'2px':'50%'};animation-duration:${1.6+Math.random()*2.2}s;animation-delay:${Math.random()*.6}s;box-shadow:0 0 6px ${cols[Math.floor(Math.random()*cols.length)]}`;
    w.appendChild(d);
  }
  setTimeout(() => spawnConfettiStop(), 5500);
}

function spawnConfettiStop() {
  const w = document.getElementById('lb-confetti');
  w.classList.remove('show');
  w.innerHTML = '';
}

// ============================================================
//  START
// ============================================================
init();
