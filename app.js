// ============================================================
//  กล่องสุ่มรางวัล — app.js (Premium Animation Edition)
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
let particleAnim = null;

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
    liffReady = false;
  }
}

// ============================================================
//  INIT
// ============================================================
async function init() {
  const grid = document.getElementById('lb-grid');

  if (grid) {
    grid.innerHTML = `
      <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องเงิน</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 7 วัน</div></div>
      <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องทอง</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 14 วัน</div></div>
      <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องแพลตินัม</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 21 วัน</div></div>
      <div class="lb-card lb-skeleton"><div class="lb-icon-wrap" style="opacity:0"></div><div class="lb-name" style="opacity:0">กล่องตำนาน</div><div class="lb-desc" style="opacity:0">กดเพื่อเปิดกล่อง</div><div class="lb-ms" style="opacity:0">ครบ 28 วัน</div></div>
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

// ============================================================
//  LOAD DATA
// ============================================================
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
    card.style.animationDelay = (i * 0.08) + 's';

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

    setTimeout(() => card.classList.add('fade-in'), i * 80);
    grid.appendChild(card);
  });
}

// ============================================================
//  PREMIUM PARTICLE ENGINE (Canvas)
// ============================================================
function initParticleCanvas() {
  const canvas = document.getElementById('lb-particle-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('show');

  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  const particles = [];
  const COLORS = [
    '#E9A84C','#F5C842','#FFFFFF','#38BFA1','#9B7EE8','#E86060',
    '#FFD700','#FFA500','#FF6B9D','#A8F5E0'
  ];

  // Create initial burst
  for (let i = 0; i < 80; i++) {
    const angle = (Math.PI * 2 * i) / 80 + (Math.random() - 0.5) * 0.3;
    const speed = 3 + Math.random() * 8;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 2 + Math.random() * 5,
      life: 1,
      decay: 0.012 + Math.random() * 0.015,
      gravity: 0.15 + Math.random() * 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      isRect: Math.random() > 0.5,
    });
  }

  // Orbiting sparks around center
  const orbiters = Array.from({ length: 12 }, (_, i) => ({
    angle: (Math.PI * 2 * i) / 12,
    radius: 60 + Math.random() * 30,
    speed: 0.05 + Math.random() * 0.04,
    color: COLORS[i % COLORS.length],
    size: 2 + Math.random() * 3,
    life: 1,
  }));

  let frame = 0;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    // Draw orbiters first (only during spin phase, first ~120 frames)
    if (frame < 120) {
      orbiters.forEach(o => {
        o.angle += o.speed;
        const ox = cx + Math.cos(o.angle) * o.radius;
        const oy = cy + Math.sin(o.angle) * o.radius;
        ctx.save();
        ctx.globalAlpha = (1 - frame / 120) * 0.9;
        ctx.fillStyle   = o.color;
        ctx.shadowColor = o.color;
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.arc(ox, oy, o.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // Draw burst particles
    let alive = false;
    particles.forEach(p => {
      if (p.life <= 0) return;
      alive = true;

      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.life -= p.decay;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.isRect) {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (alive || frame < 120) {
      particleAnim = requestAnimationFrame(tick);
    } else {
      canvas.classList.remove('show');
    }
  }

  particleAnim = requestAnimationFrame(tick);
}

function stopParticleCanvas() {
  if (particleAnim) { cancelAnimationFrame(particleAnim); particleAnim = null; }
  const canvas = document.getElementById('lb-particle-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.classList.remove('show');
}

// ============================================================
//  SPIN WRAP — Crystal Orb + CSS micro sparks (ไม่มี orbit ring)
// ============================================================
function injectSpinSparks() {
  const wrap = document.getElementById('lb-spin-wrap');

  // ใส่ orb core
  const icon = document.getElementById('lb-spin-icon');
  icon.innerHTML = '<div class="orb-crystal"></div>';

  // sparks CSS-only รอบ orb
  wrap.querySelectorAll('.orb-sparks').forEach(s => s.remove());
  const sparkWrap = document.createElement('div');
  sparkWrap.className = 'orb-sparks';

  const sparkData = [
    { sx:'55px', sy:'4px',  dx:'8px',  dy:'-22px', color:'#c4b5fd', dur:'2.1s', del:'0s'   },
    { sx:'90px', sy:'35px', dx:'18px', dy:'-10px', color:'#fbbf24', dur:'2.5s', del:'0.4s' },
    { sx:'88px', sy:'72px', dx:'12px', dy:'14px',  color:'#f0abfc', dur:'1.9s', del:'0.8s' },
    { sx:'55px', sy:'100px',dx:'0px',  dy:'20px',  color:'#c4b5fd', dur:'2.3s', del:'1.2s' },
    { sx:'8px',  sy:'72px', dx:'-16px',dy:'10px',  color:'#fbbf24', dur:'2.0s', del:'1.6s' },
    { sx:'6px',  sy:'35px', dx:'-14px',dy:'-12px', color:'#a5f3fc', dur:'2.6s', del:'0.2s' },
  ];
  sparkData.forEach(d => {
    const s = document.createElement('div');
    s.className = 'orb-spark';
    s.style.cssText = `--sx:${d.sx};--sy:${d.sy};--dx:${d.dx};--dy:${d.dy};background:${d.color};box-shadow:0 0 5px 2px ${d.color};animation-duration:${d.dur};animation-delay:-${d.del};`;
    sparkWrap.appendChild(s);
  });
  wrap.appendChild(sparkWrap);
}

// ============================================================
//  RING BURST EFFECT on click
// ============================================================
function triggerRingBurst(x, y) {
  const ring = document.createElement('div');
  ring.className = 'ring-burst';
  ring.style.left   = x + 'px';
  ring.style.top    = y + 'px';
  ring.style.width  = '60px';
  ring.style.height = '60px';
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 700);
}

// ============================================================
//  SCREEN FLASH
// ============================================================
function triggerScreenFlash() {
  const flash = document.createElement('div');
  flash.className = 'screen-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

// ============================================================
//  FLOATING STARS from result
// ============================================================
function spawnResultStars() {
  const popup = document.getElementById('lb-popup');
  const rect  = popup.getBoundingClientRect();
  const cx    = rect.left + rect.width  / 2;
  const cy    = rect.top  + rect.height / 2;
  const icons = ['⭐','✨','💫','🌟','💥','🎊','🎉','💎'];

  for (let i = 0; i < 16; i++) {
    const star = document.createElement('div');
    star.className   = 'result-star';
    star.textContent = icons[Math.floor(Math.random() * icons.length)];
    const angle = (Math.PI * 2 * i) / 16;
    const r     = 60 + Math.random() * 80;
    star.style.left     = (cx + Math.cos(angle) * r * 0.3) + 'px';
    star.style.top      = (cy + Math.sin(angle) * r * 0.3) + 'px';
    star.style.animationDuration  = (0.8 + Math.random() * 0.8) + 's';
    star.style.animationDelay     = (i * 0.05) + 's';
    star.style.fontSize = (12 + Math.random() * 14) + 'px';
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 2000);
  }
}

// ============================================================
//  MAIN: START LOOT OPEN — cinematic sequence
// ============================================================
// tier color map
const TIER_COLORS = {
  gold:   { main:'#E9A84C', dim:'rgba(233,168,76,.3)',  glow:'rgba(233,168,76,.3)'  },
  teal:   { main:'#38BFA1', dim:'rgba(56,191,161,.3)',  glow:'rgba(56,191,161,.3)'  },
  purple: { main:'#9B7EE8', dim:'rgba(155,126,232,.3)', glow:'rgba(155,126,232,.3)' },
  red:    { main:'#E86060', dim:'rgba(232,96,96,.3)',   glow:'rgba(232,96,96,.3)'   },
};
const TIER_CONFETTI = {
  gold:   ['#E9A84C','#FFD700','#FFF176','#fff','#F59E0B'],
  teal:   ['#38BFA1','#6ee7b7','#a7f3d0','#fff','#0d9488'],
  purple: ['#9B7EE8','#c4b5fd','#ddd6fe','#fff','#7c3aed'],
  red:    ['#E86060','#fca5a5','#fecaca','#fff','#b91c1c'],
};

function startLootOpen(milestone, name, token) {
  if (lbOpening) return;
  lbOpening = true;

  // หา theme จาก config
  const cfg  = LB_CONFIG.find(c => c.milestone === milestone) || {};
  const tier = cfg.theme || 'gold';
  const tc   = TIER_COLORS[tier];

  // ตั้งสี ring-2 (วงใน) ตาม tier
  const popup = document.getElementById('lb-popup');
  popup.style.setProperty('--ring-inner',     tc.main);
  popup.style.setProperty('--ring-inner-dim', tc.dim);
  popup.style.setProperty('--ring-inner-glow',tc.glow);

  // --- Phase 0: ring burst + overlay open ---
  const card = document.getElementById('lb-card-' + milestone);
  if (card) {
    const r = card.getBoundingClientRect();
    triggerRingBurst(r.left + r.width / 2, r.top + r.height / 2);
  }

  // show spin state
  document.getElementById('lb-spin-state').style.display   = 'block';
  document.getElementById('lb-result-state').classList.remove('show');
  document.getElementById('lb-popup-title').textContent = `กำลังเปิด ${name}...`;
  document.getElementById('lb-overlay').classList.add('show');

  // inject orb sparks & start canvas particles
  setTimeout(() => {
    injectSpinSparks();
    initParticleCanvas();
  }, 100);

  // --- API call ---
  callGAS('openLootBox', { token })
    .then(result => {
      setTimeout(() => {
        if (!result.success) {
          stopParticleCanvas();
          closeLootPopup();
          showToast('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
          lbOpening = false;
          return;
        }

        // ---- Phase 2: REVEAL ----
        // 1. flash screen
        triggerScreenFlash();

        // 2. stop spin, show result
        setTimeout(() => {
          stopParticleCanvas();
          document.getElementById('lb-spin-state').style.display = 'none';

          // fill result data
          document.getElementById('lb-result-icon').innerHTML    = getBahtBadge(tier);
          document.getElementById('lb-result-name').textContent  = result.prize_name || name;
          const amtEl = document.getElementById('lb-result-amount');
          amtEl.textContent = '';
          // ล้าง tier class เก่า แล้วใส่ใหม่
          ['tier-gold','tier-teal','tier-purple','tier-red'].forEach(c => amtEl.classList.remove(c));
          amtEl.classList.add('tier-' + tier);

          document.getElementById('lb-result-state').classList.add('show');

          // 3. count-up animation for amount
          setTimeout(() => {
            countUp('lb-result-amount', result.discount_amount, 800);
          }, 600);

          // 4. spawn stars
          setTimeout(() => spawnResultStars(), 700);

          // 5. confetti
          setTimeout(() => spawnConfetti(), 900);

          // update card
          if (card) {
            card.classList.add('used');
            card.querySelector('.lb-desc').textContent = 'เปิดแล้ว';
            card.onclick = null;
          }
          const cur = Number(document.getElementById('lb-count').textContent) || 0;
          document.getElementById('lb-count').textContent = Math.max(0, cur - 1);

          lbOpening = false;
        }, 200);

      }, 2200);
    })
    .catch(() => {
      stopParticleCanvas();
      closeLootPopup();
      showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่ครับ', 'error');
      lbOpening = false;
    });
}

// ============================================================
//  COUNT-UP NUMBER ANIMATION
// ============================================================
function countUp(elId, target, duration) {
  const el    = document.getElementById(elId);
  const start = performance.now();
  function step(now) {
    const t       = Math.min(1, (now - start) / duration);
    const eased   = 1 - Math.pow(1 - t, 4); // ease out quart
    const current = Math.round(eased * target);
    el.textContent = current;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

// ============================================================
//  CLOSE
// ============================================================
function closeLootPopup() {
  document.getElementById('lb-overlay').classList.remove('show');
  document.getElementById('lb-confetti').classList.remove('show');
  document.getElementById('lb-confetti').innerHTML = '';
  stopParticleCanvas();
  lbOpening = false;
}

// ============================================================
//  BADGE ICON — เหรียญทอง 3D มีตัว ฿ กลาง + sparks วงรอบเดิม
// ============================================================
function getBahtBadge(tier) {
  const cols = TIER_CONFETTI[tier] || TIER_CONFETTI.gold;

  const sparksHtml = Array.from({length:10}, (_,i) => {
    const sz  = 3 + Math.random() * 4;
    const r   = 46 + Math.random() * 10;
    const dur = (1.6 + Math.random() * .8).toFixed(2);
    const del = -(Math.random() * 2).toFixed(2);
    const col = cols[i % cols.length];
    return `<div class="baht-spark" style="width:${sz}px;height:${sz}px;margin-left:${-sz/2}px;margin-top:${-sz/2}px;background:${col};box-shadow:0 0 5px 2px ${col};--a:${36*i}deg;--r:${r}px;animation-duration:${dur}s;animation-delay:${del}s"></div>`;
  }).join('');

  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:90px;height:90px;">
      <div class="baht-halo tier-${tier}"></div>

      <!-- เหรียญทอง 3D SVG -->
      <div class="baht-badge tier-${tier}" style="background:none;border:none;box-shadow:none;overflow:visible;">
        <svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;filter:drop-shadow(0 6px 18px rgba(180,120,0,0.7)) drop-shadow(0 2px 6px rgba(0,0,0,0.5));">
          <defs>
            <radialGradient id="coinFace" cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stop-color="#FFF9C4"/>
              <stop offset="18%"  stop-color="#FFE566"/>
              <stop offset="45%"  stop-color="#F5B800"/>
              <stop offset="72%"  stop-color="#D48F00"/>
              <stop offset="100%" stop-color="#A06200"/>
            </radialGradient>
            <radialGradient id="coinFaceHover" cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stop-color="#FFFFFF"/>
              <stop offset="15%"  stop-color="#FFF0A0"/>
              <stop offset="40%"  stop-color="#FFD700"/>
              <stop offset="100%" stop-color="#B8860B"/>
            </radialGradient>
            <linearGradient id="coinEdge" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stop-color="#C8860A"/>
              <stop offset="30%"  stop-color="#A06200"/>
              <stop offset="60%"  stop-color="#7A4800"/>
              <stop offset="100%" stop-color="#5A3000"/>
            </linearGradient>
            <linearGradient id="coinShine" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="0.55"/>
              <stop offset="40%"  stop-color="#FFFFFF" stop-opacity="0.08"/>
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
            </linearGradient>
            <filter id="coinInnerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000044"/>
            </filter>
          </defs>

          <!-- edge/thickness — ให้ดูเหมือน 3D -->
          <ellipse cx="45" cy="51" rx="36" ry="8" fill="url(#coinEdge)"/>

          <!-- coin face -->
          <ellipse cx="45" cy="43" rx="36" ry="36" fill="url(#coinFace)"/>

          <!-- ridge ring ขอบเหรียญ -->
          <ellipse cx="45" cy="43" rx="36" ry="36" fill="none" stroke="#C8860A" stroke-width="2.5" opacity="0.6"/>
          <ellipse cx="45" cy="43" rx="31" ry="31" fill="none" stroke="#FFD700" stroke-width="0.8" opacity="0.5"/>

          <!-- ตัว ฿ ตรงกลาง -->
          <text x="45" y="52" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="28" font-weight="900"
                fill="#7A4800" opacity="0.25" transform="translate(1.5,1.5)">฿</text>
          <text x="45" y="52" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="28" font-weight="900"
                fill="url(#coinFaceHover)">฿</text>

          <!-- แสงสะท้อน highlight -->
          <ellipse cx="38" cy="28" rx="14" ry="9" fill="url(#coinShine)" transform="rotate(-20,38,28)"/>

          <!-- แสงวาบเล็กๆ มุมซ้ายบน -->
          <circle cx="28" cy="24" r="3.5" fill="#FFFFFF" opacity="0.45"/>
          <circle cx="28" cy="24" r="1.5" fill="#FFFFFF" opacity="0.9"/>
        </svg>

        ${sparksHtml}
      </div>
    </div>`;
}

// ============================================================
//  CONFETTI — upgraded
// ============================================================
function spawnConfetti() {
  const wrap   = document.getElementById('lb-confetti');
  const colors = ['#F59E0B','#14B8A6','#8B5CF6','#EF4444','#10B981','#F472B6','#FFD700','#FFFFFF'];
  wrap.innerHTML = '';
  wrap.classList.add('show');

  for (let i = 0; i < 80; i++) {
    const dot = document.createElement('div');
    dot.className = 'lb-dot';
    dot.style.left              = Math.random() * 100 + 'vw';
    dot.style.background        = colors[Math.floor(Math.random() * colors.length)];
    dot.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    dot.style.animationDelay    = (Math.random() * 0.8) + 's';
    dot.style.width             = (Math.random() * 10 + 4) + 'px';
    dot.style.height            = (Math.random() * 10 + 4) + 'px';
    dot.style.borderRadius      = Math.random() > 0.5 ? '50%' : '2px';
    dot.style.boxShadow         = `0 0 6px ${colors[Math.floor(Math.random() * colors.length)]}`;
    wrap.appendChild(dot);
  }
  setTimeout(() => wrap.classList.remove('show'), 4500);
}

init();
