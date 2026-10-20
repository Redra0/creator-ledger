// ─── Build bar chart ──────────────────────────────────────────────────────────
const chartData = [
  { incomeH: 62, costH: 28, rev: 5200, cost: 1640 },
  { incomeH: 55, costH: 22, rev: 4700, cost: 1280 },
  { incomeH: 70, costH: 31, rev: 6100, cost: 1890 },
  { incomeH: 75, costH: 26, rev: 6800, cost: 1540 },
  { incomeH: 80, costH: 30, rev: 7830, cost: 1740 },
  { incomeH: 92, costH: 24, rev: 9240, cost: 2180 },
];

function buildChart() {
  const chartEl = document.getElementById('chart');
  if (!chartEl) return;

  chartData.forEach(d => {
    const g = document.createElement('div');
    g.className = 'bar-group';
    g.innerHTML = `
      <div class="bar income" style="height:${d.incomeH}%">
        <div class="bar-tooltip">$${d.rev.toLocaleString()}</div>
      </div>
      <div class="bar expense" style="height:${d.costH}%">
        <div class="bar-tooltip">$${d.cost.toLocaleString()}</div>
      </div>`;
    chartEl.appendChild(g);
  });
}

// ─── Sidebar nav active state + navigation ──────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const href = item.dataset.href;
      if (href && href !== '#') {
        window.location.href = href;
      }
    });
  });
}

// ─── Log Content modal (for Dashboard) ───────────────────────────────────────
function initContentModal() {
  const overlay   = document.getElementById('modalOverlay');
  const openBtn   = document.getElementById('logContentBtn');
  const closeBtn  = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('modalCancel');

  const open = () => {
    if (!overlay) return;
    const modal = overlay.querySelector('.modal');
    if (modal) {
      const existing = modal.querySelector('.content-success');
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

  // Wire Save Content to show a small success / Done screen (scoped)
  const saveBtn = overlay ? overlay.querySelector('.modal-footer .btn.btn-primary') : null;
  if (saveBtn) saveBtn.addEventListener('click', () => {
    const modal = overlay ? overlay.querySelector('.modal') : null;
    if (!modal) return;

    const body = modal.querySelector('.modal-body');
    const footer = modal.querySelector('.modal-footer');
    if (body) body.style.display = 'none';
    if (footer) footer.style.display = 'none';

    const existing = modal.querySelector('.content-success');
    if (!existing) {
      const titleInput = modal.querySelector('.modal-body input[type="text"]');
      const numInputs = modal.querySelectorAll('.modal-body input[type="number"]');
      const title = titleInput ? (titleInput.value || 'Content') : 'Content';
      const rev = numInputs && numInputs.length > 0 ? (numInputs[0].value ? `$${parseFloat(numInputs[0].value).toFixed(2)}` : '$0.00') : '$0.00';

      const success = document.createElement('div');
      success.className = 'content-success';
      success.innerHTML = `
        <div class="success-ring">✓</div>
        <div class="success-title">Content logged</div>
        <div class="success-sub">${rev} · ${title}</div>
        <button class="btn btn-primary" id="contentDone" style="margin-top:8px;">Done</button>
      `;
      modal.appendChild(success);

      const done = modal.querySelector('#contentDone');
      if (done) done.addEventListener('click', () => {
        if (overlay) overlay.classList.remove('open');
        if (titleInput) titleInput.value = '';
        if (numInputs && numInputs[0]) numInputs[0].value = '';
        success.remove();
        if (body) body.style.display = '';
        if (footer) footer.style.display = '';
      });
    }
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildChart();
  initNav();
  initContentModal();
});
