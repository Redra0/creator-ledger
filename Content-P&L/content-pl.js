// ─── Data ─────────────────────────────────────────────────────────────────────
const allContent = [
  {
    id: 1,
    title: 'How I grew 50k subs in 60 days',
    platform: 'youtube', platformLabel: 'YouTube',
    type: 'organic', date: 'May 14, 2026',
    views: '142k', revenue: 3240, costs: 380, hours: 6,
    costBreakdown: [
      { name: 'Thumbnail design', amount: 80 },
      { name: 'B-roll footage', amount: 180 },
      { name: 'Music license', amount: 120 },
    ],
    notes: 'Best performing video this month. High CTR from thumbnail.'
  },
  {
    id: 2,
    title: 'Honest review: Creator tools tier list',
    platform: 'youtube', platformLabel: 'YouTube',
    type: 'organic', date: 'May 8, 2026',
    views: '87k', revenue: 1940, costs: 160, hours: 4,
    costBreakdown: [
      { name: 'Screen recording tools', amount: 60 },
      { name: 'Music license', amount: 100 },
    ],
    notes: 'Low production cost, high margin. Replicate this format.'
  },
  {
    id: 3,
    title: 'Brand collab — SaaS tool review',
    platform: 'youtube', platformLabel: 'YouTube',
    type: 'sponsored', date: 'May 5, 2026',
    views: '61k', revenue: 1460, costs: 1120, hours: 14,
    costBreakdown: [
      { name: 'Video editor (freelance)', amount: 600 },
      { name: 'Script writer', amount: 300 },
      { name: 'Motion graphics', amount: 220 },
    ],
    notes: 'Production too heavy for the deal size. Negotiate $2k minimum next time.'
  },
  {
    id: 4,
    title: 'Patreon monthly Q&A + 3 Shorts',
    platform: 'patreon', platformLabel: 'Patreon',
    type: 'membership', date: 'May 1, 2026',
    views: '247 patrons', revenue: 2060, costs: 120, hours: 3,
    costBreakdown: [
      { name: 'Zoom recording tools', amount: 40 },
      { name: 'Editing (Shorts)', amount: 80 },
    ],
    notes: 'Highest $/hr content. Recurring monthly — scale patron count.'
  },
  {
    id: 5,
    title: '10 tools every creator needs in 2026',
    platform: 'youtube', platformLabel: 'YouTube',
    type: 'organic', date: 'Apr 28, 2026',
    views: '54k', revenue: 980, costs: 90, hours: 3,
    costBreakdown: [
      { name: 'Music license', amount: 90 },
    ],
    notes: 'Quick listicle format. Strong affiliate potential not yet explored.'
  },
  {
    id: 6,
    title: 'Behind the scenes: My studio setup',
    platform: 'youtube', platformLabel: 'YouTube',
    type: 'organic', date: 'Apr 20, 2026',
    views: '38k', revenue: 620, costs: 0, hours: 2,
    costBreakdown: [],
    notes: 'Zero cost, pure profit. Easy content for off-weeks.'
  },
  {
    id: 7,
    title: 'April Patron exclusive: Deep dive on growth',
    platform: 'patreon', platformLabel: 'Patreon',
    type: 'membership', date: 'Apr 1, 2026',
    views: '247 patrons', revenue: 2060, costs: 80, hours: 2,
    costBreakdown: [
      { name: 'Editing', amount: 80 },
    ],
    notes: 'Recurring base. Raised tier from $6 to $8 this month.'
  },
  {
    id: 8,
    title: 'How I use AI to script videos 10x faster',
    platform: 'youtube', platformLabel: 'YouTube',
    type: 'organic', date: 'Apr 10, 2026',
    views: '92k', revenue: 1740, costs: 200, hours: 5,
    costBreakdown: [
      { name: 'Thumbnail (A/B test)', amount: 120 },
      { name: 'Music license', amount: 80 },
    ],
    notes: 'Good topic. Could repurpose as Patreon exclusive deeper guide.'
  },
];

// ─── State ────────────────────────────────────────────────────────────────────
let activeFilter  = 'all';
let searchQuery   = '';
let sortCol       = 'margin';
let sortDir       = 'desc';
let selectedId    = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = n => '$' + n.toLocaleString();
const pct  = (rev, cost) => rev === 0 ? 0 : Math.round(((rev - cost) / rev) * 100);
const rpm  = (net, hrs)  => hrs === 0 ? net : Math.round(net / hrs);

function marginColor(m) {
  if (m >= 80) return 'var(--green)';
  if (m >= 50) return 'var(--amber)';
  return 'var(--red)';
}
function platformClass(p) {
  return { youtube: 'platform-yt', patreon: 'platform-pt', sponsored: 'platform-bd' }[p] || 'platform-tk';
}

// ─── Filter + sort ────────────────────────────────────────────────────────────
function filteredData() {
  return allContent
    .filter(r => {
      const matchFilter =
        activeFilter === 'all' ||
        r.platform === activeFilter ||
        r.type === activeFilter;
      const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'title':   av = a.title;            bv = b.title;            break;
        case 'revenue': av = a.revenue;          bv = b.revenue;          break;
        case 'costs':   av = a.costs;            bv = b.costs;            break;
        case 'net':     av = a.revenue - a.costs; bv = b.revenue - b.costs; break;
        case 'margin':  av = pct(a.revenue, a.costs); bv = pct(b.revenue, b.costs); break;
        case 'rpm':     av = rpm(a.revenue - a.costs, a.hours); bv = rpm(b.revenue - b.costs, b.hours); break;
        default:        av = 0; bv = 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
}

// ─── Render table ─────────────────────────────────────────────────────────────
function renderTable() {
  const body = document.getElementById('plTableBody');
  if (!body) return;
  const rows = filteredData();

  if (rows.length === 0) {
    body.innerHTML = '<div class="pl-empty">No content matches your filter.</div>';
    return;
  }

  body.innerHTML = rows.map(r => {
    const net  = r.revenue - r.costs;
    const m    = pct(r.revenue, r.costs);
    const rph  = rpm(net, r.hours);
    const col  = marginColor(m);
    const sel  = selectedId === r.id ? 'selected' : '';

    return `
    <div class="pl-row ${sel}" data-id="${r.id}">
      <div class="pl-title-cell">
        <div class="pl-title">${r.title}</div>
        <div class="pl-meta">${r.date} · ${r.views} views</div>
      </div>
      <div>
        <span class="pl-platform-badge ${platformClass(r.platform)}">${r.platformLabel}</span>
      </div>
      <div class="pl-num pos">${fmt(r.revenue)}</div>
      <div class="pl-num ${r.costs > 0 ? 'neg' : 'neu'}">${r.costs > 0 ? fmt(r.costs) : '—'}</div>
      <div class="pl-num pos">${fmt(net)}</div>
      <div class="pl-margin-cell">
        <div class="pl-margin-bar-track">
          <div class="pl-margin-bar-fill" style="width:${m}%;background:${col}"></div>
        </div>
        <span class="pl-num" style="color:${col}">${m}%</span>
      </div>
      <div class="pl-num neu">${r.hours}h</div>
      <div class="pl-rpm">${fmt(rph)}/hr</div>
    </div>`;
  }).join('');

  // Row click → open drawer
  body.querySelectorAll('.pl-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = parseInt(row.dataset.id);
      openDrawer(id);
    });
  });
}

// ─── Render margin bars ───────────────────────────────────────────────────────
function renderMarginBars() {
  const el = document.getElementById('marginBars');
  if (!el) return;

  const types = [
    { label: 'Membership',  filter: r => r.type === 'membership' },
    { label: 'Organic',     filter: r => r.type === 'organic' },
    { label: 'Sponsored',   filter: r => r.type === 'sponsored' },
  ];

  el.innerHTML = types.map(t => {
    const subset  = allContent.filter(t.filter);
    const totRev  = subset.reduce((s, r) => s + r.revenue, 0);
    const totCost = subset.reduce((s, r) => s + r.costs, 0);
    const m       = pct(totRev, totCost);
    const col     = marginColor(m);
    return `
    <div class="mb-row">
      <div class="mb-label">${t.label}</div>
      <div class="mb-track"><div class="mb-fill" style="width:${m}%;background:${col}"></div></div>
      <div class="mb-pct" style="color:${col}">${m}%</div>
      <div class="mb-revenue">${fmt(totRev)}</div>
    </div>`;
  }).join('');
}

// ─── Render donut ─────────────────────────────────────────────────────────────
function renderDonut() {
  const total = allContent.reduce((s, r) => s + r.revenue, 0);
  const platforms = [
    { key: 'youtube', label: 'YouTube', color: '#FF5757', id: 'donut-yt' },
    { key: 'patreon', label: 'Patreon', color: '#FFB547', id: 'donut-pt' },
    { key: 'youtube-sponsored', label: 'Sponsored', color: '#00E5A0', id: 'donut-bd' },
  ];

  // Calculate revenues per group
  const revs = [
    allContent.filter(r => r.platform === 'youtube' && r.type !== 'sponsored').reduce((s,r) => s+r.revenue, 0),
    allContent.filter(r => r.platform === 'patreon').reduce((s,r) => s+r.revenue, 0),
    allContent.filter(r => r.type === 'sponsored').reduce((s,r) => s+r.revenue, 0),
  ];

  const circumference = 301.6;
  let offset = 0;

  platforms.forEach((p, i) => {
    const share = revs[i] / total;
    const dash  = share * circumference;
    const el    = document.getElementById(p.id);
    if (!el) return;
    el.setAttribute('stroke-dasharray', `${dash} ${circumference - dash}`);
    el.setAttribute('stroke-dashoffset', -offset);
    offset += dash;
  });

  // Legend
  const legend = document.getElementById('donutLegend');
  if (!legend) return;
  legend.innerHTML = platforms.map((p, i) => {
    const share = Math.round((revs[i] / total) * 100);
    return `
    <div class="dl-item">
      <div class="dl-dot" style="background:${p.color}"></div>
      <div class="dl-name">${p.label}</div>
      <div class="dl-pct">${share}%</div>
      <div class="dl-val">${fmt(revs[i])}</div>
    </div>`;
  }).join('');
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function openDrawer(id) {
  const r    = allContent.find(x => x.id === id);
  if (!r) return;
  selectedId = id;
  renderTable();

  const net = r.revenue - r.costs;
  const m   = pct(r.revenue, r.costs);
  const rph = rpm(net, r.hours);
  const col = marginColor(m);

  document.getElementById('drawerTitle').textContent = r.title;

  document.getElementById('drawerBody').innerHTML = `
    <div class="drawer-metrics">
      <div class="drawer-metric">
        <div class="drawer-metric-label">REVENUE</div>
        <div class="drawer-metric-val" style="color:var(--green)">${fmt(r.revenue)}</div>
      </div>
      <div class="drawer-metric">
        <div class="drawer-metric-label">NET PROFIT</div>
        <div class="drawer-metric-val" style="color:var(--green)">${fmt(net)}</div>
      </div>
      <div class="drawer-metric">
        <div class="drawer-metric-label">MARGIN</div>
        <div class="drawer-metric-val" style="color:${col}">${m}%</div>
      </div>
      <div class="drawer-metric">
        <div class="drawer-metric-label">$/HOUR</div>
        <div class="drawer-metric-val" style="color:var(--purple)">${fmt(rph)}</div>
      </div>
    </div>

    <div class="drawer-section-title">DETAILS</div>
    <div class="cost-breakdown">
      <div class="cost-item">
        <span class="cost-name">Platform</span>
        <span style="font-family:'DM Mono',monospace;color:var(--text2)">${r.platformLabel}</span>
      </div>
      <div class="cost-item">
        <span class="cost-name">Published</span>
        <span style="font-family:'DM Mono',monospace;color:var(--text2)">${r.date}</span>
      </div>
      <div class="cost-item">
        <span class="cost-name">Views / reach</span>
        <span style="font-family:'DM Mono',monospace;color:var(--text2)">${r.views}</span>
      </div>
      <div class="cost-item">
        <span class="cost-name">Hours spent</span>
        <span style="font-family:'DM Mono',monospace;color:var(--text2)">${r.hours}h</span>
      </div>
    </div>

    ${r.costBreakdown.length > 0 ? `
    <div class="drawer-section-title">COST BREAKDOWN</div>
    <div class="cost-breakdown">
      ${r.costBreakdown.map(c => `
        <div class="cost-item">
          <span class="cost-name">${c.name}</span>
          <span class="cost-val">−${fmt(c.amount)}</span>
        </div>`).join('')}
    </div>` : ''}

    <div class="margin-vis">
      <div class="margin-vis-label">
        <span>Profit margin</span>
        <span style="color:${col}">${m}%</span>
      </div>
      <div class="margin-vis-track">
        <div class="margin-vis-fill" style="width:${m}%;background:${col}"></div>
      </div>
    </div>

    ${r.notes ? `
    <div class="drawer-section-title">NOTES</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.6;background:var(--bg3);border-radius:var(--radius-sm);padding:12px;">
      ${r.notes}
    </div>` : ''}
  `;

  document.getElementById('detailDrawer').classList.add('open');
}

function closeDrawer() {
  selectedId = null;
  renderTable();
  document.getElementById('detailDrawer').classList.remove('open');
}

// ─── Sort ─────────────────────────────────────────────────────────────────────
function initSort() {
  document.querySelectorAll('.pl-sort').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (!col) return;
      if (sortCol === col) {
        sortDir = sortDir === 'desc' ? 'asc' : 'desc';
      } else {
        sortCol = col;
        sortDir = 'desc';
      }
      // Update arrow indicators
      document.querySelectorAll('.sort-arrow').forEach(a => a.classList.remove('active-sort'));
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) {
        arrow.classList.add('active-sort');
        arrow.textContent = sortDir === 'desc' ? '↓' : '↑';
      }
      renderTable();
    });
  });
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderTable();
    });
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value;
    renderTable();
  });
}

// ─── Period toggle ────────────────────────────────────────────────────────────
function initPeriod() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // In a real app, re-fetch data here
    });
  });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function initModal() {
  const overlay    = document.getElementById('modalOverlay');
  const openBtn    = document.getElementById('logContentBtn');
  const closeBtn   = document.getElementById('modalClose');
  const cancelBtn  = document.getElementById('modalCancel');

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

  // Wire Save Content to show a small success / Done screen
  const saveBtn = overlay ? overlay.querySelector('.modal-footer .btn.btn-primary') : null;
  if (saveBtn) saveBtn.addEventListener('click', () => {
    const modal = overlay ? overlay.querySelector('.modal') : null;
    if (!modal) return;

    // hide body/footer
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

// ─── Nav ──────────────────────────────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item[data-href]').forEach(item => {
    item.addEventListener('click', () => {
      const href = item.dataset.href;
      if (href && href !== '#') window.location.href = href;
    });
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderMarginBars();
  renderDonut();
  renderTable();
  initSort();
  initFilters();
  initSearch();
  initPeriod();
  initModal();
  initNav();

  document.getElementById('drawerClose').addEventListener('click', closeDrawer);

  // Export placeholder
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      alert('Export to CSV — coming soon!');
    });
  }
});
