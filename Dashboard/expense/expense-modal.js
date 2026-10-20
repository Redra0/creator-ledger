// ─── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { id: 'production',  icon: '🎬', label: 'Production',    hint: 'Deductible as direct production cost' },
  { id: 'software',    icon: '💻', label: 'Software',       hint: 'Tools & subscriptions — fully deductible' },
  { id: 'freelancer',  icon: '👤', label: 'Freelancer',     hint: 'Contractor fees — deductible, issue 1099 if >$600' },
  { id: 'equipment',   icon: '🎙', label: 'Equipment',      hint: 'Hardware — deductible, may need depreciation' },
  { id: 'marketing',   icon: '📣', label: 'Marketing',      hint: 'Ads & promotion — fully deductible' },
  { id: 'education',   icon: '📚', label: 'Education',      hint: 'Courses & books — deductible if business-related' },
  { id: 'travel',      icon: '✈️', label: 'Travel',         hint: 'Business travel — partially deductible' },
  { id: 'studio',      icon: '🏢', label: 'Studio / Space', hint: 'Home office or rental — deductible' },
  { id: 'other',       icon: '◈',  label: 'Other',          hint: 'Categorise after review' },
];

// ─── State ────────────────────────────────────────────────────────────────────
let currentStep   = 1;
let selectedCat   = null;
let selectedPay   = 'card';
let taxDeductible = true;

// ─── Render categories ────────────────────────────────────────────────────────
function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  grid.innerHTML = categories.map(c => `
    <div class="cat-item ${selectedCat === c.id ? 'active' : ''}" data-cat="${c.id}" data-hint="${c.hint}">
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-label">${c.label}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.cat-item').forEach(item => {
    item.addEventListener('click', () => {
      selectedCat = item.dataset.cat;
      const hint  = item.dataset.hint;
      grid.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const taxHint = document.getElementById('taxHint');
      if (taxHint) taxHint.textContent = hint;
    });
  });
}

// ─── Step navigation ──────────────────────────────────────────────────────────
function goToStep(step) {
  // Hide all bodies
  [1, 2, 3].forEach(s => {
    const el = document.getElementById(`stepBody${s}`);
    if (el) el.classList.add('hidden');
  });

  // Show current
  const body = document.getElementById(`stepBody${step}`);
  if (body) body.classList.remove('hidden');

  // Update step indicators
  document.querySelectorAll('.estep').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (s === step) el.classList.add('active');
    if (s < step)   el.classList.add('done');
  });

  // Update footer buttons
  const backBtn = document.getElementById('expBack');
  const nextBtn = document.getElementById('expNext');
  if (backBtn) backBtn.style.display = step > 1 ? 'inline-flex' : 'none';
  if (nextBtn) {
    if (step === 3) {
      nextBtn.textContent = '✓ Save Expense';
    } else {
      nextBtn.textContent = 'Continue →';
    }
  }

  currentStep = step;

  // Populate confirm screen
  if (step === 3) populateConfirm();
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep(step) {
  if (step === 1) {
    const desc   = document.getElementById('expDesc');
    const amount = document.getElementById('expAmount');
    if (!desc || !desc.value.trim()) {
      desc && desc.focus();
      flashError(desc);
      return false;
    }
    if (!amount || !amount.value || parseFloat(amount.value) <= 0) {
      amount && amount.focus();
      flashError(amount);
      return false;
    }
    return true;
  }
  if (step === 2) {
    if (!selectedCat) {
      const grid = document.getElementById('categoryGrid');
      if (grid) {
        grid.style.outline = '1px solid var(--red)';
        grid.style.borderRadius = '8px';
        setTimeout(() => { grid.style.outline = ''; }, 1200);
      }
      return false;
    }
    return true;
  }
  return true;
}

function flashError(el) {
  if (!el) return;
  el.style.borderColor = 'var(--red)';
  setTimeout(() => { el.style.borderColor = ''; }, 1200);
}

// ─── Populate confirm ─────────────────────────────────────────────────────────
function populateConfirm() {
  const desc    = document.getElementById('expDesc');
  const amount  = document.getElementById('expAmount');
  const date    = document.getElementById('expDate');
  const content = document.getElementById('expContent');

  const catObj  = categories.find(c => c.id === selectedCat);
  const payMap  = { card: '💳 Card', bank: '🏦 Bank transfer', paypal: 'P PayPal', crypto: '◎ Crypto', cash: 'Cash' };

  setText('cfDesc',     desc    ? desc.value    : '—');
  setText('cfAmount',   amount  ? `-$${parseFloat(amount.value).toFixed(2)}` : '—');
  setText('cfDate',     date    ? (date.value || 'Today') : 'Today');
  setText('cfCategory', catObj  ? `${catObj.icon} ${catObj.label}` : '—');
  setText('cfContent',  content && content.value ? content.value : 'Not linked');
  setText('cfTax',      taxDeductible ? '✓ Yes — deductible' : '✗ No');
  setText('cfPay',      payMap[selectedPay] || selectedPay);

  // Impact bar
  const impactText = document.getElementById('impactText');
  if (impactText && amount && amount.value) {
    const val      = parseFloat(amount.value);
    const margin   = 76; // current avg margin
    const newCost  = 2180 + val;
    const newProfit= 9240 - newCost;
    impactText.textContent =
      `This expense brings your May costs to $${newCost.toLocaleString()} and reduces net profit to $${newProfit.toLocaleString()} — margin drops from ${margin}% to ${Math.round(((9240 - newCost) / 9240) * 100)}%.`;
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── Save & success ───────────────────────────────────────────────────────────
function saveExpense() {
  const overlay = document.getElementById('expenseOverlay');
  const modal   = overlay ? overlay.querySelector('.modal') : null;

  // Hide steps + body, show success
  ['.expense-steps', '#stepBody3', '.modal-footer'].forEach(sel => {
    const el = modal ? modal.querySelector(sel) : null;
    if (el) el.style.display = 'none';
  });

  // Inject success screen
  const existing = modal ? modal.querySelector('.expense-success') : null;
  if (!existing) {
    const amount = document.getElementById('expAmount');
    const desc   = document.getElementById('expDesc');
    const val    = amount ? parseFloat(amount.value).toFixed(2) : '0.00';
    const label  = desc   ? desc.value : 'Expense';

    const success = document.createElement('div');
    success.className = 'expense-success';
    success.innerHTML = `
      <div class="success-ring">✓</div>
      <div class="success-title">Expense logged</div>
      <div class="success-sub">-$${val} · ${label}</div>
      <button class="btn btn-primary" id="successDone" style="margin-top:8px;">Done</button>
    `;
    modal.appendChild(success);
    document.getElementById('successDone').addEventListener('click', closeModal);
  }
}

// ─── Modal open/close ─────────────────────────────────────────────────────────
function openModal() {
  const overlay = document.getElementById('expenseOverlay');
  if (!overlay) return;

  // Reset state
  currentStep   = 1;
  selectedCat   = null;
  selectedPay   = 'card';
  taxDeductible = true;

  // Reset form fields
  ['expDesc', 'expAmount', 'expDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const content = document.getElementById('expContent');
  if (content) content.selectedIndex = 0;

  // Reset success screen
  const success = overlay ? overlay.querySelector('.expense-success') : null;
  if (success) success.remove();
  ['.expense-steps', '#stepBody3', '.modal-footer'].forEach(sel => {
    const el = overlay ? overlay.querySelector(sel) : null;
    if (el) el.style.display = '';
  });

  // Reset payment pills
  if (overlay) {
    overlay.querySelectorAll('.pay-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.pay === 'card');
    });
  }

  // Reset tax toggle
  const track = overlay ? overlay.querySelector('.toggle-track') : null;
  if (track) track.classList.add('on');
  const taxLabel = overlay ? overlay.querySelector('#taxLabel') : null;
  if (taxLabel) taxLabel.textContent = 'Yes — business expense';

  renderCategories();
  goToStep(1);
  overlay.classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('expenseOverlay');
  if (overlay) overlay.classList.remove('open');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Open triggers — works for any button with id="addExpenseBtn"
  const openBtn = document.getElementById('addExpenseBtn');
  if (openBtn) openBtn.addEventListener('click', openModal);

  // Close
  const closeBtn  = document.getElementById('expenseClose');
  const cancelBtn = document.getElementById('expCancel');
  const overlay   = document.getElementById('expenseOverlay');
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (overlay)   overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // Next / Save
  const nextBtn = document.getElementById('expNext');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < 3) {
        if (validateStep(currentStep)) goToStep(currentStep + 1);
      } else {
        saveExpense();
      }
    });
  }

  // Back
  const backBtn = document.getElementById('expBack');
  if (backBtn) backBtn.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  // Payment pills
  document.querySelectorAll('.pay-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pay-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedPay = pill.dataset.pay;
    });
  });

  // Tax toggle
  const taxToggle = document.getElementById('taxToggle');
  if (taxToggle) {
    taxToggle.addEventListener('click', () => {
      taxDeductible = !taxDeductible;
      const track = taxToggle.querySelector('.toggle-track');
      const label = document.getElementById('taxLabel');
      if (track) track.classList.toggle('on', taxDeductible);
      if (label) label.textContent = taxDeductible ? 'Yes — business expense' : 'No — personal expense';
    });
  }

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
