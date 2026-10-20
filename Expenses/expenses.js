// ─── Data ─────────────────────────────────────────────────────────────────────
const expenses = [
  { id: 1,  desc: 'Video editor — brand collab batch',  sub: 'Fiverr',              date: 'May 5',  cat: 'freelancer', linked: 'Brand collab — SaaS tool review',       deductible: true,  amount: 600,  pay: 'paypal' },
  { id: 2,  desc: 'Script writer — brand collab',       sub: 'Upwork',              date: 'May 4',  cat: 'freelancer', linked: 'Brand collab — SaaS tool review',       deductible: true,  amount: 300,  pay: 'card'   },
  { id: 3,  desc: 'Motion graphics package',            sub: 'Fiverr',              date: 'May 6',  cat: 'freelancer', linked: 'Brand collab — SaaS tool review',       deductible: true,  amount: 220,  pay: 'card'   },
  { id: 4,  desc: 'Adobe Creative Cloud',               sub: 'Monthly subscription', date: 'May 1',  cat: 'software',   linked: '',                                      deductible: true,  amount: 55,   pay: 'card'   },
  { id: 5,  desc: 'Epidemic Sound',                     sub: 'Music license',       date: 'May 1',  cat: 'software',   linked: '',                                      deductible: true,  amount: 15,   pay: 'card'   },
  { id: 6,  desc: 'CapCut Pro',                         sub: 'Monthly subscription', date: 'May 1',  cat: 'software',   linked: '',                                      deductible: true,  amount: 8,    pay: 'card'   },
  { id: 7,  desc: 'Notion Plus',                        sub: 'Monthly subscription', date: 'May 1',  cat: 'software',   linked: '',                                      deductible: true,  amount: 16,   pay: 'card'   },
  { id: 8,  desc: 'Thumbnail A/B test — growth video',  sub: 'ThumbnailTest.io',    date: 'May 12', cat: 'production', linked: 'How I grew 50k subs in 60 days',        deductible: true,  amount: 80,   pay: 'card'   },
  { id: 9,  desc: 'B-roll footage pack',                sub: 'Storyblocks',         date: 'May 10', cat: 'production', linked: 'How I grew 50k subs in 60 days',        deductible: true,  amount: 180,  pay: 'card'   },
  { id: 10, desc: 'Ring light replacement bulb',        sub: 'Amazon',              date: 'May 3',  cat: 'equipment',  linked: '',                                      deductible: true,  amount: 24,   pay: 'card'   },
  { id: 11, desc: 'Studio foam panels',                 sub: 'Amazon',              date: 'May 8',  cat: 'equipment',  linked: '',                                      deductible: true,  amount: 62,   pay: 'card'   },
  { id: 12, desc: 'Creator economy newsletter',         sub: 'Annual / 12',         date: 'May 1',  cat: 'education',  linked: '',                                      deductible: true,  amount: 20,   pay: 'card'   },
  { id: 13, desc: 'Team dinner — content planning',     sub: 'Personal',            date: 'May 15', cat: 'other',      linked: '',                                      deductible: false, amount: 120,  pay: 'card'   },
  { id: 14, desc: 'Short editing — 3 Shorts',           sub: 'Fiverr',              date: 'May 2',  cat: 'freelancer', linked: 'Patreon monthly Q&A + 3 Shorts',       deductible: true,  amount: 80,   pay: 'paypal' },
];

const monthlyTrend = [
  { month: 'Dec', amount: 1640 },
  { month: 'Jan', amount: 1280 },
  { month: 'Feb', amount: 1890 },
  { month: 'Mar', amount: 1540 },
  { month: 'Apr', amount: 1740 },
  { month: 'May', amount: 2180 },
];

const categories = [
  { id: 'freelancer',  icon: '👤', label: 'Freelancer',  color: '#A78BFA', hint: 'Contractor fees — deductible, issue 1099 if >$600' },
  { id: 'software',    icon: '💻', label: 'Software',    color: '#00E5A0', hint: 'Tools & subscriptions — fully deductible' },
  { id: 'production',  icon: '🎬', label: 'Production',  color: '#FF5757', hint: 'Direct production costs — fully deductible' },
  { id: 'equipment',   icon: '🎙', label: 'Equipment',   color: '#FFB547', hint: 'Hardware — deductible, may need depreciation' },
  { id: 'marketing',   icon: '📣', label: 'Marketing',   color: '#38BDF8', hint: 'Ads & promotion — fully deductible' },
  { id: 'education',   icon: '📚', label: 'Education',   color: '#FB923C', hint: 'Courses & books — deductible if business-related' },
  { id: 'travel',      icon: '✈️', label: 'Travel',      color: '#34D399', hint: 'Business travel — partially deductible' },
  { id: 'studio',      icon: '🏢', label: 'Studio',      color: '#F472B6', hint: 'Home office or rental — deductible' },
  { id: 'other',       icon: '◈',  label: 'Other',       color: '#8C8B99', hint: 'Categorise after review' },
];

// ─── State ────────────────────────────────────────────────────────────────────
let activeFilter  = 'all';
let searchQuery   = '';
let selectedCat   = null;
let selectedPay   = 'card';
let taxDeductible = true;
let currentStep   = 1;
let showDonut     = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt    = n => '$' + Number(n).toLocaleString();
const catObj = id => categories.find(c => c.id === id) || { icon: '◈', label: id, color: '#8C8B99' };

function catBadgeStyle(id) {
  const c = catObj(id);
  return `background:${c.color}1a;color:${c.color}`;
}

// ─── Category bar chart ───────────────────────────────────────────────────────
function renderCategoryBars() {
  const el    = document.getElementById('categoryBars');
  if (!el) return;
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Aggregate by category
  const agg = {};
  expenses.forEach(e => {
    agg[e.cat] = (agg[e.cat] || 0) + e.amount;
  });

  const sorted = Object.entries(agg).sort((a, b) => b[1] - a[1]);

  el.innerHTML = sorted.map(([id, amt]) => {
    const c   = catObj(id);
    const pct = Math.round((amt / total) * 100);
    return `
    <div class="cat-bar-row">
      <div class="cat-bar-icon" style="background:${c.color}1a">${c.icon}</div>
      <div class="cat-bar-info">
        <div class="cat-bar-name">${c.label}</div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width:${pct}%;background:${c.color}"></div>
        </div>
      </div>
      <div class="cat-bar-right">
        <div class="cat-bar-amt" style="color:${c.color}">${fmt(amt)}</div>
        <div class="cat-bar-pct">${pct}%</div>
      </div>
    </div>`;
  }).join('');
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function renderDonut() {
  const svg    = document.getElementById('expDonut');
  const legend = document.getElementById('donutLegend');
  if (!svg || !legend) return;

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const agg   = {};
  expenses.forEach(e => { agg[e.cat] = (agg[e.cat] || 0) + e.amount; });
  const sorted = Object.entries(agg).sort((a,b) => b[1]-a[1]);

  const circ = 301.6;
  let offset = 0;

  // Remove old segments
  svg.querySelectorAll('.donut-seg').forEach(el => el.remove());

  sorted.forEach(([id, amt]) => {
    const c     = catObj(id);
    const share = amt / total;
    const dash  = share * circ;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', 60); circle.setAttribute('cy', 60); circle.setAttribute('r', 48);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', c.color);
    circle.setAttribute('stroke-width', 16);
    circle.setAttribute('stroke-dasharray', `${dash} ${circ - dash}`);
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('transform', 'rotate(-90 60 60)');
    circle.classList.add('donut-seg');
    svg.appendChild(circle);
    offset += dash;
  });

  legend.innerHTML = sorted.map(([id, amt]) => {
    const c   = catObj(id);
    const pct = Math.round((amt / total) * 100);
    return `
    <div class="dl-item">
      <div class="dl-dot" style="background:${c.color}"></div>
      <div class="dl-name">${c.label}</div>
      <div class="dl-pct">${pct}%</div>
      <div class="dl-val">${fmt(amt)}</div>
    </div>`;
  }).join('');
}

// ─── Monthly trend ────────────────────────────────────────────────────────────
function renderTrend() {
  const el  = document.getElementById('trendList');
  if (!el) return;
  const max = Math.max(...monthlyTrend.map(d => d.amount));

  el.innerHTML = monthlyTrend.map((d, i) => {
    const prev      = i > 0 ? monthlyTrend[i-1].amount : null;
    const delta     = prev !== null ? Math.round(((d.amount - prev) / prev) * 100) : null;
    const deltaStr  = delta === null ? '—' : delta >= 0 ? `+${delta}%` : `${delta}%`;
    const deltaCol  = delta === null ? 'var(--text3)' : delta > 0 ? 'var(--red)' : 'var(--green)';
    const isCurrent = i === monthlyTrend.length - 1;
    const fillColor = isCurrent ? 'var(--red)' : 'var(--border2)';
    return `
    <div class="trend-row">
      <div class="trend-month">${d.month}</div>
      <div class="trend-track">
        <div class="trend-fill" style="width:${Math.round((d.amount/max)*100)}%;background:${fillColor}"></div>
      </div>
      <div class="trend-val" style="color:${isCurrent ? 'var(--red)' : 'var(--text2)'}">${fmt(d.amount)}</div>
      <div class="trend-delta" style="color:${deltaCol}">${deltaStr}</div>
    </div>`;
  }).join('');
}

// ─── Expenses table ───────────────────────────────────────────────────────────
function filteredExpenses() {
  return expenses.filter(e => {
    const matchFilter = activeFilter === 'all' || e.cat === activeFilter;
    const matchSearch = e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.sub.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });
}

function renderTable() {
  const el   = document.getElementById('expTableBody');
  if (!el) return;
  const rows = filteredExpenses();

  if (rows.length === 0) {
    el.innerHTML = '<div style="padding:40px 20px;text-align:center;color:var(--text3);font-size:13px;font-family:\'DM Mono\',monospace;">No expenses match your filter.</div>';
    return;
  }

  el.innerHTML = rows.map(e => {
    const c = catObj(e.cat);
    return `
    <div class="exp-row">
      <div>
        <div class="exp-desc">${e.desc}</div>
        <div class="exp-sub">${e.sub}</div>
      </div>
      <div class="exp-date">${e.date}</div>
      <div>
        <span class="exp-cat-badge" style="${catBadgeStyle(e.cat)}">${c.icon} ${c.label}</span>
      </div>
      <div class="exp-linked">${e.linked || '—'}</div>
      <div>
        <span class="deduct-badge ${e.deductible ? 'deduct-yes' : 'deduct-no'}">
          ${e.deductible ? '✓ Yes' : '✗ No'}
        </span>
      </div>
      <div class="exp-amount">−${fmt(e.amount)}</div>
    </div>`;
  }).join('');
}

// ─── Toggle chart/donut ───────────────────────────────────────────────────────
function initToggleView() {
  const btn      = document.getElementById('toggleViewBtn');
  const barsView = document.getElementById('catBarsView');
  const donutView= document.getElementById('catDonutView');
  if (!btn) return;
  btn.addEventListener('click', () => {
    showDonut = !showDonut;
    barsView.classList.toggle('hidden', showDonut);
    donutView.classList.toggle('hidden', !showDonut);
    btn.textContent = showDonut ? 'switch to bars →' : 'switch to chart →';
    if (showDonut) renderDonut();
  });
}

// ─── Filters + search ─────────────────────────────────────────────────────────
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

function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => { searchQuery = input.value; renderTable(); });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function renderCatGrid() {
  const grid = document.getElementById('catGrid');
  if (!grid) return;
  grid.innerHTML = categories.map(c => `
    <div class="cat-item ${selectedCat === c.id ? 'active' : ''}" data-cat="${c.id}" data-hint="${c.hint}">
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-label">${c.label}</div>
    </div>`).join('');

  grid.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('click', () => {
      selectedCat = item.dataset.cat;
      grid.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const hint = document.getElementById('taxHint');
      if (hint) hint.textContent = item.dataset.hint;
    });
  });
}

function goToStep(step) {
  [1,2,3].forEach(s => {
    const b = document.getElementById(`expStepBody${s}`);
    if (b) b.classList.toggle('hidden', s !== step);
  });
  document.querySelectorAll('.estep').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active','done');
    if (s === step) el.classList.add('active');
    if (s < step)   el.classList.add('done');
  });
  const back = document.getElementById('expBack');
  const next = document.getElementById('expNext');
  if (back) back.style.display = step > 1 ? 'inline-flex' : 'none';
  if (next) next.textContent = step === 3 ? '✓ Save Expense' : 'Continue →';
  currentStep = step;
  if (step === 3) populateConfirm();
}

function validateStep(step) {
  if (step === 1) {
    const desc   = document.getElementById('expDesc');
    const amount = document.getElementById('expAmount');
    if (!desc || !desc.value.trim())                    { flash(desc); return false; }
    if (!amount || !amount.value || +amount.value <= 0) { flash(amount); return false; }
    return true;
  }
  if (step === 2) {
    if (!selectedCat) {
      const g = document.getElementById('catGrid');
      if (g) { g.style.outline='1px solid var(--red)'; g.style.borderRadius='8px'; setTimeout(()=>{ g.style.outline=''; },1200); }
      return false;
    }
    return true;
  }
  return true;
}

function flash(el) {
  if (!el) return;
  el.style.borderColor = 'var(--red)';
  setTimeout(() => { el.style.borderColor = ''; }, 1200);
}

function populateConfirm() {
  const desc   = document.getElementById('expDesc');
  const amount = document.getElementById('expAmount');
  const date   = document.getElementById('expDate');
  const linked = document.getElementById('expLinked');
  const c      = catObj(selectedCat || 'other');
  const payMap = { card:'💳 Card', bank:'🏦 Bank', paypal:'P PayPal', crypto:'◎ Crypto', cash:'Cash' };

  set('cfDesc',   desc   ? desc.value : '—');
  set('cfAmount', amount ? `-$${parseFloat(amount.value).toFixed(2)}` : '—');
  set('cfDate2',  date   ? (date.value || 'Today') : 'Today');
  set('cfCat',    selectedCat ? `${c.icon} ${c.label}` : '—');
  set('cfLinked', linked && linked.value ? linked.value : 'Not linked');
  set('cfTax',    taxDeductible ? '✓ Yes — deductible' : '✗ No');
  set('cfPay',    payMap[selectedPay] || selectedPay);

  const impactText = document.getElementById('impactText');
  if (impactText && amount && amount.value) {
    const val      = parseFloat(amount.value);
    const newTotal = 2180 + val;
    const newNet   = 9240 - newTotal;
    const newMargin= Math.round((newNet / 9240) * 100);
    impactText.textContent = `Adding this expense brings May costs to $${newTotal.toLocaleString()} and reduces net profit to $${newNet.toLocaleString()} — margin moves to ${newMargin}%.`;
  }
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function saveExpense() {
  ['.exp-steps','#expStepBody3','.exp-modal-footer'].forEach(sel => {
    const el = document.querySelector(sel); if (el) el.style.display = 'none';
  });
  const modal   = document.querySelector('.exp-modal');
  const existing = modal.querySelector('.exp-success');
  if (!existing) {
    const amount = document.getElementById('expAmount');
    const desc   = document.getElementById('expDesc');
    const val    = amount ? parseFloat(amount.value).toFixed(2) : '0.00';
    const label  = desc   ? desc.value : 'Expense';
    const div    = document.createElement('div');
    div.className = 'exp-success';
    div.innerHTML = `
      <div class="success-ring">✓</div>
      <div class="success-title">Expense logged</div>
      <div class="success-sub">−$${val} · ${label}</div>
      <button class="btn btn-primary" id="successDone" style="margin-top:8px;">Done</button>`;
    modal.appendChild(div);
    document.getElementById('successDone').addEventListener('click', closeModal);
  }
}

function openModal() {
  currentStep = 1; selectedCat = null; selectedPay = 'card'; taxDeductible = true;
  ['expDesc','expAmount','expDate'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const linked = document.getElementById('expLinked'); if (linked) linked.selectedIndex = 0;
  const success = document.querySelector('.exp-success'); if (success) success.remove();
  ['.exp-steps','#expStepBody3','.exp-modal-footer'].forEach(sel => { const el = document.querySelector(sel); if (el) el.style.display = ''; });
  document.querySelectorAll('.pay-pill').forEach(p => p.classList.toggle('active', p.dataset.pay === 'card'));
  const track = document.querySelector('.toggle-track'); if (track) track.classList.add('on');
  const taxLabel = document.getElementById('taxLabel'); if (taxLabel) taxLabel.textContent = 'Yes — business expense';
  renderCatGrid();
  goToStep(1);
  document.getElementById('expOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('expOverlay').classList.remove('open');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryBars();
  renderTrend();
  renderTable();
  initToggleView();
  initFilters();
  initSearch();

  document.getElementById('addExpenseBtn').addEventListener('click', openModal);
  document.getElementById('expClose').addEventListener('click', closeModal);
  document.getElementById('expCancel').addEventListener('click', closeModal);
  document.getElementById('expOverlay').addEventListener('click', e => { if (e.target.id === 'expOverlay') closeModal(); });

  document.getElementById('expNext').addEventListener('click', () => {
    if (currentStep < 3) { if (validateStep(currentStep)) goToStep(currentStep + 1); }
    else saveExpense();
  });
  document.getElementById('expBack').addEventListener('click', () => { if (currentStep > 1) goToStep(currentStep - 1); });

  document.querySelectorAll('.pay-pill').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('.pay-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active'); selectedPay = p.dataset.pay;
    });
  });

  document.getElementById('taxToggle').addEventListener('click', () => {
    taxDeductible = !taxDeductible;
    const track = document.querySelector('.toggle-track');
    if (track) track.classList.toggle('on', taxDeductible);
    const label = document.getElementById('taxLabel');
    if (label) label.textContent = taxDeductible ? 'Yes — business expense' : 'No — personal expense';
  });

  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('exportBtn').addEventListener('click', () => alert('Export to CSV — coming soon!'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ─── Navigation ───────────────────────────────────────────────────────────
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
});
