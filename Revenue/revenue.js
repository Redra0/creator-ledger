// ─── Data ─────────────────────────────────────────────────────────────────────
const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

const revenueByMonth = [
  { month: 'Dec', yt: 3400, pt: 1450, deal: 350,  total: 5200  },
  { month: 'Jan', yt: 2900, pt: 1560, deal: 240,  total: 4700  },
  { month: 'Feb', yt: 3800, pt: 1780, deal: 520,  total: 6100  },
  { month: 'Mar', yt: 4200, pt: 1820, deal: 780,  total: 6800  },
  { month: 'Apr', yt: 4630, pt: 1940, deal: 1260, total: 7830  },
  { month: 'May', yt: 5720, pt: 2060, deal: 1460, total: 9240  },
];

const transactions = [
  { source: 'YouTube AdSense — May payout',        date: 'May 21', stream: 'yt',    amount: 4820, delta: 19  },
  { source: 'YouTube Memberships — May',           date: 'May 21', stream: 'yt',    amount: 900,  delta: 12  },
  { source: 'Patreon — May pledge collection',     date: 'May 1',  stream: 'pt',    amount: 2060, delta: 6   },
  { source: 'SaaS brand deal — final payment',     date: 'May 5',  stream: 'deal',  amount: 1460, delta: -42 },
  { source: 'YouTube AdSense — Apr payout',        date: 'Apr 21', stream: 'yt',    amount: 3980, delta: 9   },
  { source: 'YouTube Memberships — Apr',           date: 'Apr 21', stream: 'yt',    amount: 650,  delta: 8   },
  { source: 'Patreon — Apr pledge collection',     date: 'Apr 1',  stream: 'pt',    amount: 1940, delta: 7   },
  { source: 'Creator toolkit collab — Apr',        date: 'Apr 12', stream: 'deal',  amount: 1260, delta: 62  },
  { source: 'YouTube AdSense — Mar payout',        date: 'Mar 21', stream: 'yt',    amount: 3650, delta: -4  },
  { source: 'Patreon — Mar pledge collection',     date: 'Mar 1',  stream: 'pt',    amount: 1820, delta: 2   },
  { source: 'Brand deal — productivity app',       date: 'Mar 18', stream: 'deal',  amount: 780,  delta: 50  },
  { source: 'YouTube AdSense — Feb payout',        date: 'Feb 21', stream: 'yt',    amount: 3800, delta: 31  },
  { source: 'Patreon — Feb pledge collection',     date: 'Feb 1',  stream: 'pt',    amount: 1780, delta: 14  },
];

const streams = [
  { key: 'yt',   name: 'YouTube',  sub: 'AdSense + memberships', color: '#FF5757', icon: '▶', iconBg: 'rgba(255,87,87,0.12)' },
  { key: 'pt',   name: 'Patreon',  sub: '247 active patrons',    color: '#FFB547', icon: 'P', iconBg: 'rgba(255,181,71,0.12)' },
  { key: 'deal', name: 'Brand Deals', sub: 'Sponsorships',       color: '#00E5A0', icon: '$', iconBg: 'rgba(0,229,160,0.12)' },
];

const reliability = [
  { name: 'Patreon',     color: '#FFB547', score: 96, badge: 'Very stable',  badgeBg: 'rgba(255,181,71,0.1)',  badgeColor: '#FFB547' },
  { name: 'YouTube',     color: '#FF5757', score: 74, badge: 'Moderate',     badgeBg: 'rgba(255,87,87,0.1)',   badgeColor: '#FF5757' },
  { name: 'Brand Deals', color: '#00E5A0', score: 48, badge: 'Inconsistent', badgeBg: 'rgba(0,229,160,0.1)',   badgeColor: '#00E5A0' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => '$' + n.toLocaleString();

function streamBadgeClass(key) {
  return { yt: 'badge-yt', pt: 'badge-pt', deal: 'badge-deal' }[key] || 'badge-other';
}
function streamLabel(key) {
  return { yt: 'YouTube', pt: 'Patreon', deal: 'Brand Deal' }[key] || key;
}

// ─── Area / line chart (canvas) ───────────────────────────────────────────────
function drawChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const W      = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
  const H      = 160;
  canvas.width  = W;
  canvas.height = H;

  const pad    = { top: 12, right: 8, bottom: 8, left: 48 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...revenueByMonth.map(d => d.total)) * 1.1;
  const n      = revenueByMonth.length;

  function xPos(i) { return pad.left + (i / (n - 1)) * chartW; }
  function yPos(v) { return pad.top + chartH - (v / maxVal) * chartH; }

  // Y-axis gridlines + labels
  const ticks = [0, 3000, 6000, 9000];
  ctx.font        = '10px DM Mono, monospace';
  ctx.fillStyle   = '#4A4A58';
  ctx.textAlign   = 'right';
  ticks.forEach(t => {
    const y = yPos(t);
    ctx.beginPath();
    ctx.strokeStyle = '#222228';
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 4]);
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText(t === 0 ? '0' : `$${t / 1000}k`, pad.left - 6, y + 3);
  });

  // Draw each stream as stacked filled area
  const stackKeys = ['deal', 'pt', 'yt'];
  const stackColors = {
    yt:   { fill: 'rgba(255,87,87,0.18)',   line: '#FF5757' },
    pt:   { fill: 'rgba(255,181,71,0.18)',  line: '#FFB547' },
    deal: { fill: 'rgba(0,229,160,0.18)',   line: '#00E5A0' },
  };

  // Draw areas bottom-up (deal lowest, then pt, then yt on top)
  stackKeys.forEach(key => {
    const vals = revenueByMonth.map(d => d[key]);

    // Area
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(vals[0]));
    vals.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.lineTo(xPos(n - 1), yPos(0));
    ctx.lineTo(xPos(0), yPos(0));
    ctx.closePath();
    ctx.fillStyle = stackColors[key].fill;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(vals[0]));
    vals.forEach((v, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(v)); });
    ctx.strokeStyle = stackColors[key].line;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Dots on last point
    const lastX = xPos(n - 1);
    const lastY = yPos(vals[n - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = stackColors[key].line;
    ctx.fill();
  });

  // Total line
  ctx.beginPath();
  revenueByMonth.forEach((d, i) => {
    i === 0 ? ctx.moveTo(xPos(i), yPos(d.total)) : ctx.lineTo(xPos(i), yPos(d.total));
  });
  ctx.strokeStyle = 'rgba(240,239,232,0.2)';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // X-axis labels
  const labelsEl = document.getElementById('chartXLabels');
  if (labelsEl) {
    labelsEl.innerHTML = months.map(m =>
      `<div class="chart-x-label">${m}</div>`
    ).join('');
  }
}

// ─── Stream totals list ───────────────────────────────────────────────────────
function renderStreamList() {
  const el = document.getElementById('streamList');
  if (!el) return;
  const grandTotal = revenueByMonth.reduce((s, d) => s + d.total, 0);

  el.innerHTML = streams.map(s => {
    const total = revenueByMonth.reduce((sum, d) => sum + d[s.key], 0);
    const pct   = Math.round((total / grandTotal) * 100);
    const maxM  = Math.max(...revenueByMonth.map(d => d[s.key]));

    return `
    <div class="stream-item">
      <div class="stream-icon" style="background:${s.iconBg};color:${s.color};">${s.icon}</div>
      <div class="stream-info">
        <div class="stream-name">${s.name}</div>
        <div class="stream-sub">${s.sub}</div>
        <div class="stream-bar-track">
          <div class="stream-bar-fill" style="width:${pct}%;background:${s.color}"></div>
        </div>
      </div>
      <div class="stream-right">
        <div class="stream-amount" style="color:${s.color}">${fmt(total)}</div>
        <div class="stream-pct">${pct}% of total</div>
      </div>
    </div>`;
  }).join('');
}

// ─── MoM bars ─────────────────────────────────────────────────────────────────
function renderMoM() {
  const el  = document.getElementById('momBars');
  if (!el) return;
  const max = Math.max(...revenueByMonth.map(d => d.total));

  el.innerHTML = revenueByMonth.map((d, i) => {
    const prev    = i > 0 ? revenueByMonth[i - 1].total : null;
    const deltaVal = prev !== null ? Math.round(((d.total - prev) / prev) * 100) : null;
    const deltaStr = deltaVal === null ? '—' : (deltaVal >= 0 ? `+${deltaVal}%` : `${deltaVal}%`);
    const deltaCol = deltaVal === null ? 'var(--text3)' : deltaVal >= 0 ? 'var(--green)' : 'var(--red)';
    const fillPct  = Math.round((d.total / max) * 100);
    const fillCol  = i === revenueByMonth.length - 1 ? 'var(--green)' : 'var(--border2)';

    return `
    <div class="mom-row">
      <div class="mom-month">${d.month}</div>
      <div class="mom-bar-wrap">
        <div class="mom-track">
          <div class="mom-fill" style="width:${fillPct}%;background:${fillCol}"></div>
        </div>
        <div class="mom-val" style="color:${i === revenueByMonth.length - 1 ? 'var(--green)' : 'var(--text2)'}">${fmt(d.total)}</div>
      </div>
      <div class="mom-delta" style="color:${deltaCol}">${deltaStr}</div>
    </div>`;
  }).join('');
}

// ─── Reliability ──────────────────────────────────────────────────────────────
function renderReliability() {
  const el = document.getElementById('reliabilityList');
  if (!el) return;

  el.innerHTML = reliability.map(r => `
    <div class="rel-item">
      <div class="rel-dot" style="background:${r.color}"></div>
      <div class="rel-name">${r.name}</div>
      <div class="rel-score-wrap">
        <div class="rel-score-track">
          <div class="rel-score-fill" style="width:${r.score}%;background:${r.color}"></div>
        </div>
        <div class="rel-score-val" style="color:${r.color}">${r.score}</div>
      </div>
      <div class="rel-badge" style="background:${r.badgeBg};color:${r.badgeColor}">${r.badge}</div>
    </div>
  `).join('');
}

// ─── Transaction table ────────────────────────────────────────────────────────
function renderTable() {
  const el = document.getElementById('revTableBody');
  if (!el) return;

  el.innerHTML = transactions.map(t => {
    const deltaStr = t.delta >= 0 ? `↑ ${t.delta}%` : `↓ ${Math.abs(t.delta)}%`;
    const deltaClass = t.delta > 0 ? 'up' : t.delta < 0 ? 'down' : 'flat';
    return `
    <div class="rev-row">
      <div class="rev-source">${t.source}</div>
      <div class="rev-date">${t.date}</div>
      <div><span class="rev-stream-badge ${streamBadgeClass(t.stream)}">${streamLabel(t.stream)}</span></div>
      <div class="rev-amount">${fmt(t.amount)}</div>
      <div class="rev-delta ${deltaClass}">${deltaStr}</div>
    </div>`;
  }).join('');
}

// ─── Period toggle ────────────────────────────────────────────────────────────
function initPeriod() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Re-render with filtered data in a real app
    });
  });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function initModal() {
  const overlay   = document.getElementById('modalOverlay');
  const openBtn   = document.getElementById('addRevenueBtn');
  const closeBtn  = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('modalCancel');

  const open = () => {
    if (!overlay) return;
    const modal = overlay.querySelector('.modal');
    if (modal) {
      const existing = modal.querySelector('.revenue-success');
      if (existing) existing.remove();
      const body = modal.querySelector('.modal-body');
      const footer = modal.querySelector('.modal-footer');
      if (body) body.style.display = '';
      if (footer) footer.style.display = '';
    }
    overlay.classList.add('open');
  };
  const close = () => overlay && overlay.classList.remove('open');

  openBtn  && openBtn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  cancelBtn && cancelBtn.addEventListener('click', close);
  overlay  && overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  const saveBtn = overlay ? overlay.querySelector('.modal-footer .btn.btn-primary') : null;
  if (saveBtn) saveBtn.addEventListener('click', saveRevenue);
}

// ─── Save / success for Add Revenue ───────────────────────────────────────────
function saveRevenue() {
  const overlay = document.getElementById('modalOverlay');
  const modal   = overlay ? overlay.querySelector('.modal') : null;
  if (!modal) return;

  // hide body + footer
  const body = modal.querySelector('.modal-body');
  const footer = modal.querySelector('.modal-footer');
  if (body) body.style.display = 'none';
  if (footer) footer.style.display = 'none';

  const existing = modal.querySelector('.revenue-success');
  if (!existing) {
    const srcInput = modal.querySelector('.modal-body .field-group input[type="text"]');
    const amtInput = modal.querySelector('.modal-body input[type="number"]');
    const src = srcInput ? (srcInput.value || 'Entry') : 'Entry';
    const amt = amtInput ? (amtInput.value ? `$${parseFloat(amtInput.value).toFixed(2)}` : '$0.00') : '$0.00';

    const success = document.createElement('div');
    success.className = 'revenue-success';
    success.innerHTML = `
      <div class="success-ring">✓</div>
      <div class="success-title">Entry added</div>
      <div class="success-sub">${amt} · ${src}</div>
      <button class="btn btn-primary" id="revenueDone" style="margin-top:8px;">Done</button>
    `;
    modal.appendChild(success);

    const doneBtn = modal.querySelector('#revenueDone');
    if (doneBtn) doneBtn.addEventListener('click', () => {
      // close and reset
      if (overlay) overlay.classList.remove('open');
      if (srcInput) srcInput.value = '';
      if (amtInput) amtInput.value = '';
      success.remove();
      if (body) body.style.display = '';
      if (footer) footer.style.display = '';
    });
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  drawChart();
  renderStreamList();
  renderMoM();
  renderReliability();
  renderTable();
  initPeriod();
  initModal();
  initSidebar();

  // Redraw chart on resize
  window.addEventListener('resize', drawChart);
});

  // ─── Sidebar navigation ──────────────────────────────────────────────────────
  function initSidebar() {
    const items = document.querySelectorAll('.nav .nav-item');
    if (!items || items.length === 0) return;

    items.forEach(item => {
      const icon = item.querySelector('.nav-icon');
      const target = item.dataset.href || item.dataset.page || (icon && icon.dataset.page);
      if (!target) return;
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        try {
          const url = new URL(target, window.location.origin);
          if (url.pathname !== window.location.pathname) window.location.href = url.pathname + url.search + url.hash;
        } catch (e) {
          if (target !== window.location.pathname) window.location.href = target;
        }
      });
    });

    // mark active based on current path
    const path = window.location.pathname;
    items.forEach(item => {
      const icon = item.querySelector('.nav-icon');
      const target = item.dataset.href || item.dataset.page || (icon && icon.dataset.page);
      if (!target) return;
      try {
        const url = new URL(target, window.location.origin);
        if (url.pathname === path) {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      } catch (e) {
        if (target === path || window.location.href.endsWith(target)) {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      }
    });
  }

  // Export placeholder
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      alert('Export to CSV — coming soon!');
    });
  }
