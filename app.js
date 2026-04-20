// ตรวจสอบ URL ให้ถูกต้อง (ห้ามมีช่องว่าง)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbx57fi00n2RKu7b5jHu67vzUVwrez1cx6RhW0lvvM9cIkt6_amJzMoVJOJvrwD7imHBnA/exec';
const LIFF_ID = '2004478373-pUgVSZTj';

// ปรับ Milestone ให้ตรงกับรูปภาพ (7, 14, 21, 28)
const LB_CONFIG = [
  { milestone: 7,  name: 'กล่องเงิน',     theme: 'gold',   ms: 'ms-gold'   },
  { milestone: 14, name: 'กล่องทอง',      theme: 'teal',   ms: 'ms-teal'   },
  { milestone: 21, name: 'กล่องแพลตินัม', theme: 'purple', ms: 'ms-purple' },
  { milestone: 28, name: 'กล่องตำนาน',    theme: 'red',    ms: 'ms-red'    },
];

// ในฟังก์ชัน renderLootGrid ให้เพิ่มการเช็คสถานะ
function renderLootGrid(boxes) {
  const grid = document.getElementById('lb-grid');
  grid.innerHTML = '';

  LB_CONFIG.forEach(cfg => {
    const info = boxes[cfg.milestone] || {};
    const isLocked = !info.token; // ถ้าไม่มี token คือยังล็อคอยู่
    
    const card = document.createElement('div');
    card.className = `lb-card ${isLocked ? 'locked' : ''}`;
    
    card.innerHTML = `
      <div class="lb-icon-wrap">
        <div class="lb-circle ${cfg.theme}">
          ${isLocked ? '🔒' : '🎁'}
        </div>
      </div>
      <div class="lb-name" style="font-weight:bold">${cfg.name}</div>
      <div class="lb-desc" style="font-size:12px; color:#94a3b8; margin:4px 0">
        ${isLocked ? 'ยังไม่ถึงรอบ' : 'กดเพื่อเปิดกล่อง'}
      </div>
      <div class="lb-ms ${cfg.ms}">ครบ ${cfg.milestone} วัน</div>
    `;

    if (!isLocked && !info.opened) {
      card.onclick = () => startLootOpen(cfg.milestone, cfg.name, info.token);
    }
    grid.appendChild(card);
  });
}
