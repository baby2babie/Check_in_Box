const GAS_URL = 'https://script.google.com/macros/s/AKfycbx57fi00n2RKu7b5jHu67vzUVwrez1cx6RhW0lvvM9cIkt6_amJzMoVJOJvrwD7imHBnA/exec';
const LIFF_ID = '2004478373-pUgVSZTj';

const TIER_CFG = {
  paid: {
    color: '#38BFA1', label: 'PAID BONUS',
    shakeClass: 'shake-mid', tensionDur: '2.8s', glitch: false,
    ringCol: 'rgba(56,191,161,.3)',
    orbits: [
      { r:53, dur:2.0, planets:[{col:'#38BFA1',sz:6,start:0},{col:'#A7F3D0',sz:4,start:180}] },
      { r:80, dur:3.2, planets:[{col:'#38BFA1',sz:8,start:60},{col:'#6EE7B7',sz:5,start:200},{col:'#38BFA1',sz:4,start:320}] },
      { r:103,dur:4.8, planets:[{col:'#38BFA1',sz:10,start:90},{col:'#A7F3D0',sz:5,start:210},{col:'#6EE7B7',sz:4,start:330}] },
    ],
    badge:{ bg:'linear-gradient(145deg,#042f2e,#021a1a)', border:'rgba(56,191,161,.5)', glow:'rgba(56,191,161,.4)' },
    badgeGrad: 'linear-gradient(160deg,#ecfdf5,#38BFA1 45%,#065f46)',
    btn:{ bg:'linear-gradient(135deg,#38BFA1 0%,#0F8A72 100%)', color:'#022c22', glow:'rgba(56,191,161,.5)' },
    confetti: ['#38BFA1','#6EE7B7','#A7F3D0','#fff','#059669'],
  }
};

let lbOpening = false, liffReady = false;

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
  t.textContent = msg; t.className = 'toast ' + type;
  setTimeout(() => t.className = 'toast', duration);
}

async function initLiff() {
  try {
    await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: true });
    liffReady = true;
    if (!liff.isLoggedIn()) { liff.login({ redirectUri: location.href }); return; }
  } catch (e) { liffReady = false; }
}

async function init() {
  await initLiff();
  const params = new URLSearchParams(window.location.search);
  const room   = params.get('room');
  if (!room) { renderCard(null); return; }
  document.getElementById('lb-room-label').textContent = 'ห้อง ' + room;
  try {
    const result = await callGAS('getLootBoxDataByRoom', { roomNo: room });
    const info   = (result.boxes || {})["PAID"] || {};
    renderCard(info);
  } catch (e) { renderCard(null); }
}

function renderCard(info) {
  const wrap     = document.getElementById('paid-box-wrap');
  const hasBox   = info && info.token && !info.opened;
  const isOpened = info && info.token &&  info.opened;
  const isLocked = !info || !info.token;

  const card = document.createElement('div');
  card.className = 'lb-card'
    + (hasBox   ? ' can-open' : '')
    + (isOpened ? ' used'     : '')
    + (isLocked ? ' locked'   : '');
  card.style.cssText = '--t-color:#38BFA1; padding:40px 20px; width:100%';
  card.setAttribute('data-tier', 'paid');

  card.innerHTML = `
    <span class="lb-card-icon" style="font-size:64px">${isOpened ? '✅' : hasBox ? '🎁' : '🔒'}</span>
    <div class="lb-card-name" style="font-size:16px;margin-top:16px">PAID BONUS</div>
    <div class="lb-card-sub" style="font-size:14px;margin-top:8px">${
      hasBox   ? 'กดเพื่อเปิดกล่อง!' :
      isOpened ? 'เปิดแล้วเดือนนี้'  :
                 'จ่ายตรงเวลาเพื่อรับกล่อง'
    }</div>
    <div class="lb-card-ms ms-paid" style="margin-top:16px">จ่ายตรงเวลา</div>
  `;

  if (hasBox) {
    card.onclick = () => startLootOpen("PAID", "กล่อง Paid Bonus", "paid", info.token);
  }

  wrap.innerHTML = '';
  wrap.appendChild(card);
  setTimeout(() => card.classList.add('fade-in'), 50);
}

// ========== copy จาก app.js ==========
function buildSolarHTML(tier) {
  const cfg = TIER_CFG[tier];
  const cx = 110, cy = 110, sz = 220;
  let svg = `<svg viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%"><defs>`;
  cfg.orbits.forEach((_,i) => svg += `<filter id="rf${i}${tier}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
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
      planets += `<div class="planet-css" style="width:${p.sz}px;height:${p.sz}px;margin:-${h}px 0 0 -${h}px;background:${p.col};box-shadow:0 0 ${p.sz*2}px ${p.col},0 0 ${p.sz*3}px ${p.col}88;--s:${p.start}deg;--r:${orb.r}px;animation-duration:${orb.dur}s;animation-delay:-${(p.start/360*orb.dur).toFixed(2)}s;"></div>`;
    });
  });
  const sun = `<div class="box-center" id="box-icon" style="background:radial-gradient(circle at 35% 35%,#1a1a24,#08080e);border:2px solid ${cfg.color};box-shadow:0 0 24px ${cfg.color}88,0 0 50px ${cfg.color}44;">🎁</div>`;
  return svg + planets + sun;
}

function startLootOpen(milestone, name, tier, token) {
  if (lbOpening) return;
  lbOpening = true;
  const cfg     = TIER_CFG[tier];
  const overlay = document.getElementById('lb-overlay');
  const flash   = document.getElementById('flash');
  document.documentElement.style.setProperty('--t-color', cfg.color);
  overlay.style.background = '#000';
  overlay.classList.add('active');
  document.getElementById('result-ui').classList.remove('show');
  document.getElementById('spin-wrap').style.display = 'flex';
  document.getElementById('spin-stage').innerHTML = buildSolarHTML(tier);
  overlay.classList.remove('shake-soft','shake-mid','shake-hard','shake-chaos');
  overlay.classList.add(cfg.shakeClass);
  const boxIcon = document.getElementById('box-icon');
  boxIcon.style.setProperty('--tension-dur', cfg.tensionDur);
  setTimeout(() => boxIcon.classList.add('box-tension'), 100);

  callGAS('openLootBox', { token })
    .then(result => {
      setTimeout(() => {
        if (!result.success) {
          closeLootPopup();
          showToast('❌ ' + (result.message || 'เกิดข้อผิดพลาด'), 'error');
          lbOpening = false;
          return;
        }
        flash.style.animation = 'flashTrigger .6s forwards';
        setTimeout(() => {
          flash.style.animation = '';
          overlay.classList.remove('shake-soft','shake-mid','shake-hard','shake-chaos');
          document.getElementById('spin-wrap').style.display = 'none';
          overlay.style.background = 'radial-gradient(circle,#1E293B 0%,#000 100%)';
          const badge = document.getElementById('res-badge');
          const sym   = badge.querySelector('.res-badge-sym');
          badge.style.cssText = `width:90px;height:90px;border-radius:18px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;animation:badgeFloat 2s ease-in-out infinite alternate;background:${cfg.badge.bg};border:1.5px solid ${cfg.badge.border};box-shadow:0 0 28px ${cfg.badge.glow}`;
          sym.style.cssText   = `font-size:46px;font-weight:900;font-family:Arial Black,sans-serif;position:relative;z-index:1;line-height:1;background:${cfg.badgeGrad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 14px ${cfg.color})`;
          document.getElementById('res-tier-name').textContent = cfg.label;
          const btn = document.getElementById('btn-claim');
          btn.style.setProperty('--btn-bg',    cfg.btn.bg);
          btn.style.setProperty('--btn-color', cfg.btn.color);
          btn.style.setProperty('--btn-glow',  cfg.btn.glow);
          btn.style.color = cfg.btn.color;
          const valEl = document.getElementById('prize-val');
          valEl.style.animation = 'none';
          valEl.textContent = '0';
          void valEl.offsetWidth;
          valEl.style.animation = '';
          document.getElementById('result-ui').classList.add('show');
          setTimeout(() => {
            countUp(valEl, result.discount_amount, 1800);
            spawnConfetti(cfg.confetti);
          }, 300);
          lbOpening = false;
        }, 150);
      }, 2700);
    })
    .catch(() => {
      closeLootPopup();
      showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่ครับ', 'error');
      lbOpening = false;
    });
}

function closeLootPopup() {
  const overlay = document.getElementById('lb-overlay');
  overlay.classList.remove('active','shake-soft','shake-mid','shake-hard','shake-chaos');
  document.getElementById('result-ui').classList.remove('show');
  document.getElementById('spin-stage').innerHTML = '';
  spawnConfettiStop();
  lbOpening = false;
}

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

init();