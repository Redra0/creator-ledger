// ─── Data ─────────────────────────────────────────────────────────────────────
const quarters = [
  { id:'q1', label:'Q1 2026', period:'Jan – Mar', due:'Apr 15, 2026', target:3100, paid:3100, status:'paid',     color:'#00E5A0', bgColor:'rgba(0,229,160,0.12)'  },
  { id:'q2', label:'Q2 2026', period:'Apr – Jun', due:'Jun 16, 2026', target:3320, paid:3320, status:'paid',     color:'#00E5A0', bgColor:'rgba(0,229,160,0.12)'  },
  { id:'q3', label:'Q3 2026', period:'Jul – Sep', due:'Jul 15, 2026', target:3160, paid:2310, status:'partial',  color:'#FFB547', bgColor:'rgba(255,181,71,0.12)' },
  { id:'q4', label:'Q4 2026', period:'Oct – Dec', due:'Jan 15, 2027', target:4200, paid:0,    status:'upcoming', color:'#4A4A58', bgColor:'rgba(74,74,88,0.12)'   },
];

const deductions = [
  { icon:'👤', name:'Freelancer fees',        amount:1200 },
  { icon:'💻', name:'Software subscriptions', amount:94   },
  { icon:'🎬', name:'Production costs',        amount:260  },
  { icon:'🎙', name:'Equipment',              amount:86   },
  { icon:'📚', name:'Education',              amount:20   },
];

const reservationLog = [
  { source:'YouTube AdSense — May payout', sub:'YouTube',   date:'May 21', income:4820, rate:25, status:'reserved' },
  { source:'YouTube Memberships — May',    sub:'YouTube',   date:'May 21', income:900,  rate:25, status:'reserved' },
  { source:'Patreon — May pledges',        sub:'Patreon',   date:'May 1',  income:2060, rate:25, status:'reserved' },
  { source:'SaaS brand deal payment',      sub:'Sponsored', date:'May 5',  income:1460, rate:25, status:'reserved' },
  { source:'YouTube AdSense — Apr payout', sub:'YouTube',   date:'Apr 21', income:3980, rate:25, status:'paid'     },
  { source:'YouTube Memberships — Apr',    sub:'YouTube',   date:'Apr 21', income:650,  rate:25, status:'paid'     },
  { source:'Patreon — Apr pledges',        sub:'Patreon',   date:'Apr 1',  income:1940, rate:25, status:'paid'     },
  { source:'Creator toolkit collab',       sub:'Sponsored', date:'Apr 12', income:1260, rate:25, status:'paid'     },
  { source:'YouTube AdSense — Mar payout', sub:'YouTube',   date:'Mar 21', income:3650, rate:25, status:'paid'     },
  { source:'Patreon — Mar pledges',        sub:'Patreon',   date:'Mar 1',  income:1820, rate:25, status:'paid'     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => '$' + Number(n).toLocaleString();

// ─── Quarters ─────────────────────────────────────────────────────────────────
function renderQuarters() {
  const el = document.getElementById('quartersList');
  if (!el) return;
  el.innerHTML = quarters.map(q => {
    const pct        = q.target > 0 ? Math.round((q.paid / q.target) * 100) : 0;
    const amtColor   = q.status === 'paid' ? 'var(--green)' : q.status === 'partial' ? 'var(--amber)' : 'var(--text3)';
    const statusLabel= q.status === 'paid' ? '✓ Paid' : q.status === 'partial' ? `${pct}% reserved` : 'Upcoming';
    return `
    <div class="quarter-item">
      <div class="q-badge" style="background:${q.bgColor};color:${q.color}">${q.id.toUpperCase()}</div>
      <div class="q-info">
        <div class="q-label">${q.label}</div>
        <div class="q-due">Due ${q.due}</div>
        ${q.status !== 'upcoming' ? `<div class="q-progress"><div class="q-progress-fill" style="width:${Math.min(pct,100)}%;background:${q.color}"></div></div>` : ''}
      </div>
      <div class="q-right">
        <div class="q-amount" style="color:${amtColor}">${fmt(q.paid)}</div>
        <div class="q-status ${q.status}">${statusLabel}</div>
      </div>
    </div>`;
  }).join('');
}

// ─── Deductions ───────────────────────────────────────────────────────────────
function renderDeductions() {
  const el    = document.getElementById('deductionsList');
  if (!el) return;
  const total = deductions.reduce((s, d) => s + d.amount, 0);
  el.innerHTML = deductions.map(d => `
    <div class="deduction-item">
      <div class="deduction-left"><div class="deduction-icon">${d.icon}</div><div class="deduction-name">${d.name}</div></div>
      <div class="deduction-amt">−${fmt(d.amount)}</div>
    </div>`).join('') +
    `<div class="deduction-item" style="border-top:1px solid var(--border2);margin-top:4px;padding-top:10px;">
      <div class="deduction-left"><div style="font-size:12px;font-weight:600;color:var(--text2);">Total deductions</div></div>
      <div class="deduction-amt">−${fmt(total)}</div>
    </div>`;
}

// ─── Log ──────────────────────────────────────────────────────────────────────
function renderLog() {
  const el = document.getElementById('logTableBody');
  if (!el) return;
  el.innerHTML = reservationLog.map(r => {
    const reserved   = Math.round(r.income * (r.rate / 100));
    const statusLabel= r.status === 'reserved' ? '◈ Reserved' : r.status === 'paid' ? '✓ Paid' : 'Pending';
    return `
    <div class="log-row">
      <div><div class="log-source">${r.source}</div><div class="log-sub">${r.sub}</div></div>
      <div class="log-date">${r.date}</div>
      <div class="log-income">${fmt(r.income)}</div>
      <div class="log-rate">${r.rate}%</div>
      <div class="log-reserved">${fmt(reserved)}</div>
      <div><span class="log-status-badge status-${r.status}">${statusLabel}</span></div>
    </div>`;
  }).join('');
}

// ─── Rate pills ───────────────────────────────────────────────────────────────
function initRatePills() {
  document.querySelectorAll('.rate-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.rate-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      if (pill.dataset.rate === 'custom') {
        const rate = prompt('Enter your custom tax reserve rate (%):', '27');
        if (rate && !isNaN(rate)) pill.textContent = `${rate}%`;
      }
    });
  });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const openModal  = () => document.getElementById('taxOverlay').classList.add('open');
const closeModal = () => document.getElementById('taxOverlay').classList.remove('open');

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderQuarters();
  renderDeductions();
  renderLog();
  initRatePills();

  document.getElementById('logPaymentBtn').addEventListener('click', openModal);
  document.getElementById('taxClose').addEventListener('click', closeModal);
  document.getElementById('taxCancel').addEventListener('click', closeModal);
  document.getElementById('taxOverlay').addEventListener('click', e => { if (e.target.id === 'taxOverlay') closeModal(); });
  document.getElementById('taxSave').addEventListener('click', closeModal);
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      document.getElementById('ratePills').scrollIntoView({ behavior:'smooth', block:'center' });
    });
  }

  // ─── Sidebar navigation (simple) ─────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const href = item.dataset.href;
      if (href && href !== '#') window.location.href = href;
    });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
