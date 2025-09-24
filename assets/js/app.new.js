/* ===== Helpers ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const debounce = (fn, ms = 150) => {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
};
const getParam = (k) => new URLSearchParams(location.search).get(k);
const fmt = (x) => (x ?? x === 0) ? x : "—";

// Detect touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

// Add touch/no-touch class to body (guard if body not yet parsed)
function tagBodyTouchClass() {
  if (!document.body) return;
  if (isTouchDevice) {
    document.body.classList.add('is-touch-device');
  } else {
    document.body.classList.add('no-touch-device');
  }
}
if (document.body) tagBodyTouchClass();
else document.addEventListener('DOMContentLoaded', tagBodyTouchClass);

// Handle viewport height on mobile
function updateVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial setup
updateVH();
let _vhRAF = 0;
const scheduleVH = () => { if (_vhRAF) return; _vhRAF = requestAnimationFrame(() => { _vhRAF = 0; updateVH(); }); };
window.addEventListener('resize', scheduleVH, { passive: true });
window.addEventListener('orientationchange', scheduleVH, { passive: true });

// Main application class
class CourseApp {
  constructor() {
    this.studentSelect = null;
    this.urlStudentId = null; // when opened via personal link
    this.DATA_ORIGINAL = this.normalizeData(window.DATA || {});
    this.overrides = this.loadOverrides();
    this.DATA = this.buildData();
    // Track which students have unlocked their info (session-only)
    this.unlocked = this.loadUnlocked();
    this.init();
  }

  init() {
    this.fillHeaderAndInfo();
    this.setupTabs();
    this.setupAdminAuth();
    this.setupStudentSelection();
    this.setupEventListeners();
    this.initialRenders();
    this.setupAdmin();
    // Mark initialized to avoid double-init from fallback loader
    window.appInitialized = true;
  }

  // Ensure incoming data matches shapes the app expects
  normalizeData(data) {
    const d = JSON.parse(JSON.stringify(data || {}));
    d.course = d.course || {};

    // Normalize students to [{id, name}]
    const students = d.students || [];
    d.students = students.map((s, idx) => {
      if (typeof s === 'string') {
        return { id: this.slugify(s) || String(idx + 1), name: s };
      }
      // preserve all existing fields and ensure id/name
      return {
        ...s,
        id: s.id || this.slugify(s.name || `student-${idx + 1}`),
        name: s.name || String(s.name || s)
      };
    });

    const toArrayAuthors = (authors) => {
      if (Array.isArray(authors)) return authors.filter(Boolean);
      if (typeof authors === 'string') return authors.split(',').map(a => a.trim()).filter(Boolean);
      return [];
    };

    // Normalize course textbooks/references
    ['textbooks', 'references'].forEach(key => {
      const arr = d.course[key];
      if (Array.isArray(arr)) {
        d.course[key] = arr.map(b => ({
          type: b.type || (key === 'textbooks' ? 'Textbook' : 'Reference'),
          title: b.title || '—',
          authors: toArrayAuthors(b.authors),
          link: b.link || b.url || undefined
        }));
      } else {
        d.course[key] = [];
      }
    });

    // Normalize top-level books
    if (Array.isArray(d.books)) {
      d.books = d.books.map(b => ({
        type: b.type || 'Reference',
        title: b.title || '—',
        authors: toArrayAuthors(b.authors),
        link: b.link || b.url || undefined
      }));
    } else {
      d.books = [];
    }

    // Ensure arrays exist
    d.assignments = Array.isArray(d.assignments) ? d.assignments : [];
    d.marks = Array.isArray(d.marks) ? d.marks : [];
    d.attendance = Array.isArray(d.attendance) ? d.attendance : [];
    d.homework = Array.isArray(d.homework) ? d.homework : [];

    return d;
  }

  // ----- Overrides (admin) -----
  loadOverrides() {
    try { return JSON.parse(localStorage.getItem('qm_overrides_v1') || '{}'); }
    catch { return {}; }
  }

  saveOverrides() {
    localStorage.setItem('qm_overrides_v1', JSON.stringify(this.overrides || {}));
  }

  // ----- Per-student unlock (masking) -----
  loadUnlocked() {
    try { return JSON.parse(sessionStorage.getItem('qm_unlocked_v1') || '{}'); }
    catch { return {}; }
  }

  saveUnlocked() {
    try { sessionStorage.setItem('qm_unlocked_v1', JSON.stringify(this.unlocked || {})); }
    catch { /* ignore */ }
  }

  async unlockStudent(studentId) {
    const pwd = prompt('Enter password (any valid student ID):');
    if (pwd == null) return; // cancelled
    const entered = (pwd || '').trim();
    const matchAny = Array.isArray(this.DATA?.students) && this.DATA.students.some(s => String(s.id) === entered);
    if (!matchAny) { alert('Incorrect password.'); return; }
    // Mark all unlocked for this session
    this.unlocked = this.unlocked || {};
    this.unlocked.ALL = true;
    this.saveUnlocked();
    this.renderRosterTable();
  }

  buildData() {
    // Merge overrides onto original (non-destructive)
    const deepClone = (o) => JSON.parse(JSON.stringify(o));
    const base = deepClone(this.DATA_ORIGINAL);
    const ov = this.overrides || {};
    // Arrays we support overriding/merging
    const mergeUniqBy = (arrA = [], arrB = [], keyFn) => {
      const map = new Map();
      [...arrA, ...arrB].forEach(item => map.set(keyFn(item), item));
      return Array.from(map.values());
    };
    if (ov.course) base.course = { ...base.course, ...ov.course };
    if (ov.students) base.students = ov.students; // replace if provided
    if (ov.assignments) base.assignments = ov.assignments;
    if (ov.marks) base.marks = ov.marks;
    if (ov.homework) base.homework = ov.homework;
    if (ov.books) base.books = ov.books;
    if (ov.attendance) {
      base.attendance = mergeUniqBy(base.attendance, ov.attendance, (r) => `${r.date}|${r.student}|${r.status}|${r.notes||''}`);
    }
    return base;
  }

  // ===== Admin auth (client-side) =====
  isAdminAuthed() {
    try {
      const tok = JSON.parse(localStorage.getItem('qm_admin_authed_v1') || 'null');
      return tok && tok.exp && tok.exp > Date.now();
    } catch { return false; }
  }

  setAdminAuthed(hours = 12) {
    const exp = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem('qm_admin_authed_v1', JSON.stringify({ exp }));
    this.updateAdminTabVisibility();
  }

  logoutAdmin() {
    localStorage.removeItem('qm_admin_authed_v1');
    this.updateAdminTabVisibility();
  }

  updateAdminTabVisibility() {
    const tab = document.getElementById('admin-tab');
    if (!tab) return;
    if (this.isAdminAuthed()) tab.style.display = '';
    else tab.style.display = 'none';
  }

  async sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  setupAdminAuth() {
    // Keyboard shortcut to open login
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        this.openAdminLogin();
      }
    });
    // Query flag ?admin=1 opens login
    const qp = new URLSearchParams(location.search);
    if (qp.get('admin') === '1') {
      this.openAdminLogin();
    }
    // Reveal tab if already authed
    this.updateAdminTabVisibility();
  }

  openAdminLogin() {
    // If already authed, switch to admin tab
    if (this.isAdminAuthed()) {
      const idx = this.panelIndexById?.admin;
      if (typeof idx === 'number') this.switchTab(idx);
      return;
    }
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    const hasPin = !!localStorage.getItem('qm_admin_pin_hash');

    const render = () => {
      modal.innerHTML = hasPin ? `
        <h3>Admin Login</h3>
        <div class="row">
          <label for="adm-pin">Enter 6-digit PIN</label>
          <input type="password" id="adm-pin" inputmode="numeric" maxlength="6" placeholder="••••••" />
        </div>
        <div class="actions">
          <button id="adm-cancel">Cancel</button>
          <button id="adm-login">Login</button>
        </div>
      ` : `
        <h3>Set Admin PIN</h3>
        <p class="muted">Verify identity with TA email and phone, then set a 6-digit PIN.</p>
        <div class="row">
          <label for="adm-email">TA Email</label>
          <input type="email" id="adm-email" placeholder="you@example.com" />
        </div>
        <div class="row">
          <label for="adm-phone">TA Phone</label>
          <input type="tel" id="adm-phone" placeholder="+886 ..." />
        </div>
        <div class="row">
          <label for="adm-newpin">New 6-digit PIN</label>
          <input type="password" id="adm-newpin" inputmode="numeric" maxlength="6" placeholder="••••••" />
        </div>
        <div class="actions">
          <button id="adm-cancel">Cancel</button>
          <button id="adm-setpin">Set PIN</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const close = () => overlay.remove();
      modal.querySelector('#adm-cancel')?.addEventListener('click', close);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

      if (hasPin) {
        modal.querySelector('#adm-login')?.addEventListener('click', async () => {
          const val = modal.querySelector('#adm-pin')?.value?.trim();
          if (!/^\d{6}$/.test(val || '')) { alert('Enter a 6-digit PIN'); return; }
          const hash = await this.sha256Hex(val);
          if (hash === localStorage.getItem('qm_admin_pin_hash')) {
            this.setAdminAuthed(12);
            close();
            const idx = this.panelIndexById?.admin;
            if (typeof idx === 'number') this.switchTab(idx);
          } else {
            alert('Invalid PIN');
          }
        });
      } else {
        modal.querySelector('#adm-setpin')?.addEventListener('click', async () => {
          const email = modal.querySelector('#adm-email')?.value?.trim().toLowerCase();
          const phone = (modal.querySelector('#adm-phone')?.value || '').replace(/\D+/g,'');
          const ta = (this.DATA.course?.tas || [])[0] || {};
          const taEmail = String(ta.email || '').trim().toLowerCase();
          const taPhone = String(ta.phone || '').replace(/\D+/g,'');
          if (!email || !phone) { alert('Provide email and phone'); return; }
          if (email !== taEmail || phone !== taPhone) { alert('Verification failed'); return; }
          const pin = modal.querySelector('#adm-newpin')?.value?.trim();
          if (!/^\d{6}$/.test(pin || '')) { alert('PIN must be 6 digits'); return; }
          const hash = await this.sha256Hex(pin);
          localStorage.setItem('qm_admin_pin_hash', hash);
          this.setAdminAuthed(12);
          close();
          const idx = this.panelIndexById?.admin;
          if (typeof idx === 'number') this.switchTab(idx);
        });
      }
    };

    render();
  }

  slugify(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  fillHeaderAndInfo() {
    const c = this.DATA.course || {};
    const title = c.titleEn || 'Course';
    const subtitle = [c.code, c.semester].filter(Boolean).join(' • ');
    const instructor = c.instructor ? `${c.instructor.nameEn || c.instructor.name || ''}` : '—';
    // TA(s) display: accept string, object {name, affiliation}, or array of those
    const taList = Array.isArray(c.tas) ? c.tas : (c.ta ? [c.ta] : []);
    const taDisplay = taList.length
      ? taList.map(t => {
          if (typeof t === 'string') return t;
          const aff = t.affiliation ? `, ${t.affiliation}` : '';
          return `${t.name || '—'}${aff}`;
        }).join('; ')
      : '—';

    const setText = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val ?? '—'; };
    setText('#course-title', title);
    setText('#course-subtitle', subtitle || '—');
    // Top stays minimal; details go to footer
    setText('#footer-year', new Date().getFullYear());
    setText('#footer-course', title);
    setText('#footer-course-short', title);
    setText('#footer-time', c.time || '—');
    setText('#footer-location', this.englishOnly(c.location) || '—');
    setText('#footer-instructor', instructor);
    setText('#footer-ta', taDisplay);
    setText('#footer-numbers', c.numbers ? `NTU: ${c.numbers.NTU || '—'} / NTHU: ${c.numbers.NTHU || '—'}` : '—');
    setText('#footer-institute', this.englishOnly(c.institute) || '—');

    setText('#course-desc', c.description || '');
    setText('#course-goals', c.goals || '');
    setText('#course-prereq', c.prerequisites || '');
    setText('#office-hours', c.officeHours || '');

    const infoRows = [
      ['Course Code', c.code],
      ['Numbers', c.numbers ? `NTU: ${c.numbers.NTU || '—'} / NTHU: ${c.numbers.NTHU || '—'}` : undefined],
      ['Class Code', c.classCode],
      ['Semester', c.semester],
      ['Institute', this.englishOnly(c.institute)],
      ['Type', c.type],
      ['Credit(s)', c.credits],
      ['Year', c.yearSpan],
      ['Language', c.language],
      ['Capacity', c.capacity ? `Total ${c.capacity.total}, outside-dept limit ${c.capacity.outsideDeptLimit}` : undefined],
      ['Time', c.time],
      ['Location', this.englishOnly(c.location)]
    ].map(([k, v]) => `<tr><td class="muted">${k}</td><td>${fmt(v)}</td></tr>`).join('');

    const infoTable = document.querySelector('#info-table');
    if (infoTable) infoTable.innerHTML = infoRows;

    // Evaluation and policies lists
    const evalList = document.getElementById('eval-list');
    if (evalList && Array.isArray(c.evaluation)) {
      evalList.innerHTML = c.evaluation.map(e => `<li>${e.item} — <strong>${fmt(e.weight)}%</strong></li>`).join('');
    }
    const policyList = document.getElementById('policy-list');
    if (policyList && Array.isArray(c.policies)) {
      policyList.innerHTML = c.policies.map(p => `<li>${p}</li>`).join('');
    }
  }

  englishOnly(val) {
    if (!val) return val;
    // Prefer text before slash (e.g., "… / 中文")
    const parts = String(val).split(' / ');
    return parts[0];
  }

  setupTabs() {
    const tabs = $$('.tab');
    const panels = $$('.panel');
    let activeTab = 0;
    let isAnimating = false;
    const ANIMATION_DURATION = 300;
    const panelIndexById = {};
    panels.forEach((p, i) => (panelIndexById[p.id] = i));

    const switchTab = (index, instant = false) => {
      // Gate admin tab
      const nextIsAdmin = panels[index]?.id === 'admin';
      if (nextIsAdmin && !this.isAdminAuthed()) {
        this.openAdminLogin();
        return;
      }
      if (isAnimating || index === activeTab) return;
      
      isAnimating = true;
      const currentPanel = panels[activeTab];
      const nextPanel = panels[index];
      
      // Update tab states
      tabs[activeTab].classList.remove('active');
      tabs[activeTab].setAttribute('aria-selected', 'false');
      tabs[index].classList.add('active');
      tabs[index].setAttribute('aria-selected', 'true');
      
      // Update panel visibility
      currentPanel.classList.remove('active');
      currentPanel.setAttribute('aria-hidden', 'true');
      // Ensure previous panel is actually hidden (avoid overlap)
      currentPanel.style.display = 'none';

      // Show next panel
      nextPanel.style.display = 'block';
      nextPanel.style.opacity = '0';
      nextPanel.classList.add('active');
      nextPanel.setAttribute('aria-hidden', 'false');
      
      // Animate
      if (!instant) {
        nextPanel.style.transition = `opacity ${ANIMATION_DURATION}ms ease`;
        nextPanel.style.opacity = '1';
        
        setTimeout(() => {
          nextPanel.style.transition = '';
          nextPanel.style.opacity = '';
          // Let CSS control display via class to prevent future overlaps
          nextPanel.style.display = '';
          isAnimating = false;
        }, ANIMATION_DURATION);
      } else {
        nextPanel.style.opacity = '1';
        nextPanel.style.display = '';
        isAnimating = false;
      }
      
      activeTab = index;
      sessionStorage.setItem('activeTab', index);
      
      // Scroll to top of panel on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({
          top: nextPanel.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    };
    // expose for deep-link navigation
    this.switchTab = switchTab;
    this.panelIndexById = panelIndexById;
    
    // Initialize tabs
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        // Use href anchors if present
        if (tab.getAttribute('href')) e.preventDefault();
        // Gate admin tab when clicked
        const isAdmin = panels[index]?.id === 'admin';
        if (isAdmin && !this.isAdminAuthed()) {
          this.openAdminLogin();
          return;
        }
        switchTab(index);
      });
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchTab(index);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (index + 1) % tabs.length;
          tabs[nextIndex].focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (index - 1 + tabs.length) % tabs.length;
          tabs[prevIndex].focus();
        }
      });
    });
    
    // Load saved tab or default to first
    const savedTab = parseInt(sessionStorage.getItem('activeTab'), 10);
    const initialTab = !isNaN(savedTab) && savedTab < tabs.length ? savedTab : 0;
    switchTab(initialTab, true);

    // Reveal admin tab if authed
    this.updateAdminTabVisibility();
  }

  setupStudentSelection() {
    const studentParam = getParam('student');
    const student = studentParam ? this.DATA.students.find(s => s.id === studentParam || this.slugify(s.name) === studentParam) : null;
    const selector = $('.selector');
    const select = $('#student-select');
    const copyBtn = $('#copy-link');

    // Show loading state
    selector?.classList.add('is-loading');
    
    // Add accessibility attributes
    select?.setAttribute('aria-label', 'Select your name from the list');
    copyBtn?.setAttribute('aria-label', 'Copy your personal link');
    
    // Simulate loading
    setTimeout(() => {
      if (student) {
        // Update for specific student view
        document.title = `${student.name} | ${this.DATA.course.titleEn}`;
        if (selector) selector.style.display = 'none';
        // Remember selected via URL so renders work without the dropdown
        this.urlStudentId = student.id;
        
        // Add a back button for mobile
        if (window.innerWidth < 768) {
          const backBtn = document.createElement('button');
          backBtn.className = 'back-btn';
          backBtn.innerHTML = '&larr; Back to all students';
          backBtn.onclick = () => window.history.back();
          document.body.insertBefore(backBtn, document.body.firstChild);
        }
      } else if (select) {
        // Populate student dropdown
        select.innerHTML = '<option value="" disabled selected>Select your name</option>';
        
        // Sort students alphabetically by name
        const sortedStudents = [...this.DATA.students].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
        );
        
        sortedStudents.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.name;
          select.appendChild(opt);
        });
        
        // Auto-select if only one student
        if (sortedStudents.length === 1) {
          select.value = sortedStudents[0].id;
          select.dispatchEvent(new Event('change'));
        }
        
        if (selector) selector.style.display = 'flex';
      }
      
      // Remove loading state
      selector?.classList.remove('is-loading');
    }, 300);
    
    // Copy personal link
    copyBtn?.addEventListener('click', async () => {
      if (!select?.value) {
        select?.focus();
        return;
      }
      
      const url = new URL(window.location.href);
      url.searchParams.set('student', select.value);
      
      try {
        await navigator.clipboard.writeText(url.toString());
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 2000);
        
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for browsers that don't support clipboard API
        const tempInput = document.createElement('input');
        tempInput.value = url.toString();
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        // Show fallback feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Link copied (fallback)';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }
    });
  }

  // Returns the currently selected student ID, from dropdown or URL
  getSelectedId() {
    return (this.studentSelect && this.studentSelect.value) || this.urlStudentId || null;
  }

  setupEventListeners() {
    this.studentSelect = document.getElementById('student-select');
    
    // Student selection
    if (this.studentSelect) {
      this.studentSelect.addEventListener('change', () => {
        this.renderAttendance();
        this.renderAssignments();
        this.renderNotes();
      });
    }
    
    // Attendance filters
    document.getElementById('att-month')?.addEventListener('input', () => this.renderAttendance());
    document.getElementById('att-clear-filter')?.addEventListener('click', () => {
      const monthInput = document.getElementById('att-month');
      if (monthInput) {
        monthInput.value = '';
        this.renderAttendance();
      }
    });
    
    // Book search (debounced)
    const bookSearch = document.getElementById('book-search');
    if (bookSearch) bookSearch.addEventListener('input', debounce(() => this.renderBooks(), 200));

    // Roster search (debounced) and filter
    const rosterSearch = document.getElementById('roster-search');
    if (rosterSearch) rosterSearch.addEventListener('input', debounce(() => this.renderRosterTable(), 200));
    document.getElementById('roster-program')?.addEventListener('change', () => this.renderRosterTable());

    // In-page navigation: switch tabs when clicking footer/header links
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').replace(/^#/, '');
      if (!id) return;
      if (this.panelIndexById && this.panelIndexById[id] !== undefined) {
        e.preventDefault();
        this.switchTab(this.panelIndexById[id]);
      }
    });
  }

  // ----- Admin UI -----
  setupAdmin() {
    const saveAttBtn = document.getElementById('adm-att-save');
    const markAllBtn = document.getElementById('adm-att-all');
    const dateInput = document.getElementById('adm-att-date');
    const listBox = document.getElementById('adm-att-list');
    const logoutBtn = document.getElementById('adm-logout');
    const exportBtn = document.getElementById('adm-export');
    const importBtn = document.getElementById('adm-import');
    const importText = document.getElementById('adm-import-text');
    const clearBtn = document.getElementById('adm-clear');
    if (!listBox) return; // admin panel absent

    // Render list of students with checkboxes
    const renderList = () => {
      listBox.innerHTML = this.DATA.students
        .slice()
        .sort((a,b)=> (a.name||'').localeCompare(b.name||'', undefined, {sensitivity:'base'}))
        .map(s => `
          <label style="display:flex;align-items:center;gap:.5rem">
            <input type="checkbox" class="adm-att-chk" value="${s.id}"/>
            <span>${s.name}${s.nameZh ? ` <span class=\"muted\">(${s.nameZh})</span>` : ''}</span>
          </label>
        `).join('');
    };
    renderList();

    markAllBtn?.addEventListener('click', () => {
      listBox.querySelectorAll('.adm-att-chk').forEach(cb => cb.checked = true);
    });

    saveAttBtn?.addEventListener('click', () => {
      const date = dateInput?.value;
      if (!date) { alert('Please choose a date'); return; }
      const ids = [...listBox.querySelectorAll('.adm-att-chk:checked')].map(cb => cb.value);
      if (!ids.length) { alert('Select at least one student'); return; }
      this.overrides = this.overrides || {};
      this.overrides.attendance = this.overrides.attendance || [];
      ids.forEach(id => this.overrides.attendance.push({ date, student: id, status: 'Present' }));
      this.saveOverrides();
      this.DATA = this.buildData();
      this.renderAttendance();
      alert('Attendance saved');
    });

    exportBtn?.addEventListener('click', async () => {
      const txt = JSON.stringify(this.overrides || {}, null, 2);
      try { await navigator.clipboard.writeText(txt); alert('Overrides copied to clipboard'); }
      catch { (importText || {}).value = txt; alert('Copied to the text area below.'); }
    });

    importBtn?.addEventListener('click', () => {
      const txt = importText?.value?.trim();
      if (!txt) { alert('Paste JSON into the box first'); return; }
      try {
        this.overrides = JSON.parse(txt);
        this.saveOverrides();
        this.DATA = this.buildData();
        this.renderRosterTable();
        this.renderAttendance();
        this.renderAssignments();
        this.renderHomework();
        alert('Overrides imported');
      } catch (e) {
        alert('Invalid JSON');
      }
    });

    clearBtn?.addEventListener('click', () => {
      if (!confirm('Clear all admin overrides?')) return;
      this.overrides = {};
      this.saveOverrides();
      this.DATA = this.buildData();
      this.renderRosterTable();
      this.renderAttendance();
      this.renderAssignments();
      this.renderHomework();
      alert('Overrides cleared');
    });

    logoutBtn?.addEventListener('click', () => {
      this.logoutAdmin();
      // Switch away from admin panel
      const idxInfo = this.panelIndexById?.info ?? 0;
      if (typeof idxInfo === 'number') this.switchTab(idxInfo);
      alert('Logged out of admin');
    });

    // ---- Homework editor ----
    const hwTitle = document.getElementById('adm-hw-title');
    const hwDue = document.getElementById('adm-hw-due');
    const hwPts = document.getElementById('adm-hw-points');
    const hwLink = document.getElementById('adm-hw-link');
    const hwDesc = document.getElementById('adm-hw-desc');
    const hwAdd = document.getElementById('adm-hw-add');
    const hwList = document.getElementById('adm-hw-list');

    const renderHwList = () => {
      if (!hwList) return;
      const items = this.DATA.homework || [];
      hwList.innerHTML = items.length ? items.map(h => `
        <div class="hw-card">
          <div class="meta"><strong>${h.title}</strong><span>${h.points||0} pts</span></div>
          <div class="meta"><span>Due: ${h.due||'—'}</span>${h.link ? `<a class=\"link\" target=\"_blank\" href=\"${h.link}\">Open</a>` : ''}</div>
          <p>${h.description||h.notes||''}</p>
          <div class="row-wrap">
            <button data-id="${h.id}" class="adm-hw-del">Delete</button>
          </div>
        </div>
      `).join('') : '<p class="muted">No homework yet.</p>';
      // wire delete
      hwList.querySelectorAll('.adm-hw-del').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const current = this.overrides?.homework || this.DATA.homework || [];
          const next = current.filter(h => h.id !== id);
          this.overrides = this.overrides || {};
          this.overrides.homework = next;
          this.saveOverrides();
          this.DATA = this.buildData();
          renderHwList();
          this.renderHomework();
        });
      });
    };
    renderHwList();

    hwAdd?.addEventListener('click', () => {
      const title = hwTitle?.value?.trim();
      if (!title) { alert('Please enter a title'); return; }
      const due = hwDue?.value || undefined;
      const points = parseFloat(hwPts?.value || '0') || 0;
      const link = hwLink?.value?.trim() || undefined;
      const description = hwDesc?.value?.trim() || '';
      const item = { id: `H${Date.now()}`, title, due, points, link, description };
      this.overrides = this.overrides || {};
      this.overrides.homework = this.overrides.homework || (this.DATA.homework ? [...this.DATA.homework] : []);
      this.overrides.homework.push(item);
      this.saveOverrides();
      this.DATA = this.buildData();
      renderHwList();
      this.renderHomework();
      hwTitle.value = hwDue.value = hwPts.value = hwLink.value = '';
      hwDesc.value = '';
    });
  }

  initialRenders() {
    // Critical first paint
    this.renderRosterTable();
    this.renderSyllabus();
    this.renderAttendance();
    this.renderAssignments();

    // Non-critical: schedule when idle
    const idle = (cb) => (window.requestIdleCallback ? requestIdleCallback(cb, { timeout: 500 }) : setTimeout(cb, 0));
    idle(() => { this.renderHomework(); this.renderNotes(); });
    idle(() => { this.renderBooks(); this.renderContacts(); });
    this.setupDiscussion();
  }

  renderRosterTable() {
    const tbody = $('#roster-table tbody');
    if (!tbody) return;
    const q = ($('#roster-search')?.value || '').toLowerCase();
    const prog = ($('#roster-program')?.value || '').toLowerCase();

    // Populate program select once with unique values
    const progSel = document.getElementById('roster-program');
    if (progSel && !progSel.dataset.populated) {
      const programs = [...new Set(this.DATA.students
        .map(s => s.note || s.program)
        .filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));
      programs.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        progSel.appendChild(opt);
      });
      progSel.dataset.populated = 'true';
    }

    const matches = (s) => {
      const hay = [s.id, s.name, s.nameZh, s.email, s.dept, s.note, s.program]
        .map(x => String(x || '').toLowerCase());
      const textOk = !q || hay.some(x => x.includes(q));
      const progOk = !prog || hay.includes(prog);
      return textOk && progOk;
    };

    const unlockedAll = !!(this.unlocked && (this.unlocked.ALL || this.unlocked['*']));

    tbody.innerHTML = this.DATA.students
      .slice()
      .filter(matches)
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
      .map(s => {
        const dept = s.dept || '—';
        const program = s.note || s.program || '—';
        const unlocked = unlockedAll || !!(this.unlocked && this.unlocked[String(s.id)]);
        const email = unlocked && s.email
          ? `<a class=\"link\" href=\"mailto:${s.email}\">${s.email}</a>`
          : `*** ${(!unlockedAll && s.email) ? `<button class=\"unlock-btn\" data-student=\"${String(s.id)}\">Unlock</button>` : ''}`;
        const idDisp = unlocked ? (s.id || '—') : (s.id ? '***' : '—');
        const nameCell = `${s.name || '—'}${s.nameZh ? `<div class=\"muted\">${s.nameZh}</div>` : ''}`;
        return `<tr>
          <td data-label=\"ID\">${idDisp}</td>
          <td data-label=\"Name\">${nameCell}</td>
          <td data-label=\"Dept\">${dept}</td>
          <td data-label=\"Program\">${program}</td>
          <td data-label=\"Email\">${email}</td>
        </tr>`;
      })
      .join('') || '<tr><td colspan="5">No matching students.</td></tr>';

    // Wire up unlock buttons
    $$('.unlock-btn', tbody).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sid = e.currentTarget.getAttribute('data-student');
        this.unlockStudent(sid);
      });
    });
  }

  renderContacts() {
    const c = this.DATA.course || {};
    const box = document.getElementById('contacts-box');
    if (!box) return;
    const instructor = c.instructor || {};
    const tas = Array.isArray(c.tas) ? c.tas : (c.ta ? [c.ta] : []);
    const insEmail = instructor.email ? `<a class="link" href="mailto:${instructor.email}">${instructor.email}</a>` : '—';
    const office = c.office || '—';
    const officeHours = c.officeHours || 'By appointment';
    const time = c.time || '—';
    const location = this.englishOnly(c.location) || '—';

    const taList = tas.map(t => {
      const email = t.email ? `<a class=\"link\" href=\"mailto:${t.email}\">${t.email}</a>` : '—';
      const phone = t.phone ? `<br>Phone: <a class=\"link\" href=\"tel:${t.phone.replace(/\s+/g,'')}\">${t.phone}</a>` : '';
      const aff = t.affiliation ? ` (${t.affiliation})` : '';
      return `<li><strong>${t.name || '—'}</strong>${aff}<br>Email: ${email}${phone}</li>`;
    }).join('') || '<li>—</li>';

    box.innerHTML = `
      <div class="card">
        <h3>Instructor</h3>
        <p><strong>${instructor.nameEn || instructor.name || '—'}</strong></p>
        <p>Email: ${insEmail}</p>
        <p>Office Hours: ${officeHours}</p>
        <p>Office: ${office}</p>
        <p>Time: ${time}</p>
        <p>Location: ${location}</p>
      </div>
      <div class="card">
        <h3>Teaching Assistants</h3>
        <ul>${taList}</ul>
      </div>
    `;
  }

  setupDiscussion() {
    const form = document.getElementById('discussion-form');
    const list = document.getElementById('discussion-list');
    if (!form || !list) return;

    const API = (window.COMMENTS_API || '/api/comments');
    const $ = (sel) => document.querySelector(sel);

    const render = async () => {
      list.innerHTML = '<p class="muted">Loading…</p>';
      try {
        const res = await fetch(`${API}?limit=200`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        const items = await res.json();
        list.innerHTML = Array.isArray(items) && items.length ? items.map(p => `
          <div class="post">
            <div class="post-meta"><strong>${this.escapeHtml(p.name || 'Anonymous')}</strong> <span class="muted">• ${new Date(p.createdAt || p.ts || Date.now()).toLocaleString()}</span></div>
            <div class="post-body">${this.escapeHtml(p.msg || '').replace(/\n/g,'<br>')}</div>
            ${p.email ? `<div class="post-contact"><a class="link" href="mailto:${this.escapeHtml(p.email)}">${this.escapeHtml(p.email)}</a></div>` : ''}
          </div>
        `).join('') : '<p class="muted">No messages yet.</p>';
      } catch (err) {
        list.innerHTML = `<p class="muted">Failed to load messages.</p>`;
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#disc-name')?.value?.trim() || '';
      const email = $('#disc-email')?.value?.trim() || '';
      const msg = $('#disc-message')?.value?.trim() || '';
      if (!msg) return;
      const btn = form.querySelector('button[type="submit"]');
      btn?.setAttribute('disabled', 'disabled');
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, msg })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Post failed: ${res.status}`);
        }
        $('#disc-message').value = '';
        await render();
      } catch (err) {
        alert(err.message || 'Failed to post message');
      } finally {
        btn?.removeAttribute('disabled');
      }
    });

    render();
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  renderSyllabus() {
    const tbody = $('#syllabus-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = this.DATA.course.syllabus
      .map(w => `<tr><td>Week ${w.week}</td><td>${w.date}</td><td>${w.topic}</td></tr>`)
      .join('');
  }

  renderAttendance() {
    const selectedId = this.getSelectedId();
    if (!selectedId) return;
    const selected = this.DATA.students.find(s => s.id === selectedId);
    
    const month = $('#att-month')?.value; // YYYY-MM
    // All rows for this student (for overall %)
    const allRows = this.DATA.attendance.filter(a => (
      a.student === selectedId ||
      (selected && (a.student === selected.name || a.student === selected.nameZh))
    ));
    // Apply month filter for table view
    let rows = [...allRows];
    
    if (month) {
      rows = rows.filter(a => a.date.startsWith(month));
    }
    
    const tbody = $('#att-table tbody');
    if (!tbody) return;
    
    // Compute attendance percentages
    const uniqDates = (arr) => Array.from(new Set(arr.map(r => r.date)));
    const presentCount = (arr) => arr.filter(r => r.status === 'Present').length;
    const allDates = uniqDates(allRows);
    const allPresent = presentCount(allRows);
    const allPct = allDates.length ? Math.round((allPresent / allDates.length) * 100) : 0;
    const filtDates = uniqDates(rows);
    const filtPresent = presentCount(rows);
    const filtPct = filtDates.length ? Math.round((filtPresent / filtDates.length) * 100) : 0;
    
    // Render or update summary element above the table
    const attPanel = document.getElementById('attendance');
    if (attPanel) {
      let summary = document.getElementById('att-summary');
      if (!summary) {
        summary = document.createElement('div');
        summary.id = 'att-summary';
        summary.className = 'muted';
        // insert just before the table
        const tableEl = document.getElementById('att-table');
        if (tableEl && tableEl.parentNode) {
          tableEl.parentNode.insertBefore(summary, tableEl);
        } else {
          attPanel.appendChild(summary);
        }
      }
      summary.textContent = month
        ? `Attendance: ${filtPresent}/${filtDates.length} (${filtPct}%) • Overall: ${allPresent}/${allDates.length} (${allPct}%)`
        : `Attendance: ${allPresent}/${allDates.length} (${allPct}%)`;
    }
    
    tbody.innerHTML = rows
      .sort((a, b) => a.date > b.date ? -1 : 1)
      .map(r => `<tr>
        <td>${r.date}</td>
        <td>${r.status}</td>
        <td>${fmt(r.notes)}</td>
      </tr>`)
      .join('') || '<tr><td colspan="3">No attendance records yet.</td></tr>';
  }

  renderAssignments() {
    const selectedId = this.getSelectedId();
    if (!selectedId) return;
    const selected = this.DATA.students.find(s => s.id === selectedId);
    
    const marksBy = this.DATA.marks
      .filter(m => (
        m.student === selectedId ||
        (selected && (m.student === selected.name || m.student === selected.nameZh))
      ))
      .reduce((a, m) => (a[m.assignmentId] = m, a), {});
    
    const tbody = $('#assn-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = this.DATA.assignments
      .slice()
      .sort((a, b) => (a.due || '') > (b.due || '') ? 1 : -1)
      .map(a => {
        const mk = marksBy[a.id];
        const status = mk ? 'Graded' : (a.due ? (new Date(a.due) < new Date() ? 'Overdue' : 'Open') : 'Open');
        const badge = mk ? 'ok' : (status === 'Overdue' ? 'danger' : 'warn');
        
        return `
          <tr>
            <td>${a.title}</td>
            <td>${fmt(a.subject)}</td>
            <td>${fmt(a.assigned)}</td>
            <td>${fmt(a.due)}</td>
            <td>${mk ? mk.marks : '—'}</td>
            <td>${mk ? mk.max : (a.maxMarks || a.max || '—')}</td>
            <td>${a.solutionUrl ? `<a href="${a.solutionUrl}" target="_blank">View</a>` : '—'}</td>
            <td><span class="badge ${badge}">${status}</span></td>
          </tr>
        `;
      })
      .join('') || '<tr><td colspan="8">No assignments found.</td></tr>';
  }

  renderHomework() {
    const acc = document.getElementById('hw-accordion');
    if (!acc) return;

    // Sort: by due date ascending; items without due go last
    const items = (this.DATA.homework || [])
      .slice()
      .sort((a, b) => {
        const ad = a && a.due ? Date.parse(a.due) : NaN;
        const bd = b && b.due ? Date.parse(b.due) : NaN;
        const aHas = !Number.isNaN(ad);
        const bHas = !Number.isNaN(bd);
        if (aHas && bHas) return ad - bd;
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        const ta = (a.title || '').toLowerCase();
        const tb = (b.title || '').toLowerCase();
        if (ta !== tb) return ta < tb ? -1 : 1;
        return String(a.id||'').localeCompare(String(b.id||''));
      });

    if (!items.length) { acc.innerHTML = '<p class="muted">No homework assigned yet.</p>'; return; }

    const html = items.map(h => {
      const due = fmt(h.due);
      const pts = h.points ? `${h.points} pts` : '';
      const linkPart = h.link ? (/\.html?(#|\?|$)/i.test(h.link)
        ? `<div class="hw-iframe" data-src="${h.link}"></div>`
        : `<div style="margin-top:.5rem"><a class="link" target="_blank" href="${h.link}">Open</a></div>`) : '';
      return `
        <details class="hw-item" data-id="${h.id||''}">
          <summary>
            <span>${this.escapeHtml(h.title||'Homework')}</span>
            <span class="hw-summary-right">${[due, pts].filter(Boolean).join(' • ')}</span>
          </summary>
          <div class="hw-content">
            ${h.description ? `<p>${this.escapeHtml(h.description)}</p>` : ''}
            ${linkPart}
          </div>
        </details>
      `;
    }).join('');
    acc.innerHTML = html;

    // Lazy-load iframes when a section is opened
    acc.querySelectorAll('details.hw-item').forEach(det => {
      det.addEventListener('toggle', () => {
        if (!det.open) return;
        const wrap = det.querySelector('.hw-iframe');
        if (wrap && !wrap.dataset.loaded && wrap.dataset.src) {
          wrap.innerHTML = `<iframe src="${wrap.dataset.src}" title="Homework" loading="lazy"></iframe>`;
          wrap.dataset.loaded = '1';
        }
      });
    });
  }

  renderNotes() {
    const acc = document.getElementById('notes-accordion');
    if (!acc) return;

    // Do not reveal actual passwords; show only a hint
    const pwdHint = 'Password hint: your student ID';

    const notes = [
      { id: 'N1', title: 'Notes 1', date: '2025-09-11', file: 'assets/notes/QM_Notes1.pdf' },
      { id: 'N2', title: 'Notes 2', date: '2025-09-18', file: 'assets/notes/QM_Notes2.pdf' },
      { id: 'N3', title: 'Notes 3', date: '2025-09-25', file: 'assets/notes/QM_Notes3.pdf' }
    ];

    // Sort oldest → newest by date (match Homework ordering)
    notes.sort((a,b) => String(a.date).localeCompare(String(b.date)));

    acc.innerHTML = notes.map(n => `
      <details class="note-item" data-id="${n.id}">
        <summary>
          <span>${this.escapeHtml(n.title)}</span>
          <span class="hw-summary-right">${this.escapeHtml(n.date)}</span>
        </summary>
        <div class="hw-content">
          <div class="row-wrap">
            <button class="open-note" data-file="${n.file}">Open PDF</button>
          </div>
          <small class="muted">${this.escapeHtml(pwdHint)}</small>
        </div>
      </details>
    `).join('');

    // Wire up open buttons to prompt for student ID
    acc.querySelectorAll('.open-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const file = btn.getAttribute('data-file');
        this.promptStudentIdAndOpen(file);
      });
    });
  }

  promptStudentIdAndOpen(file) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h3>Enter Student ID</h3>
      <div class="row">
        <label for="note-student-id">Student ID</label>
        <input id="note-student-id" type="text" placeholder="e.g., 123456" />
        <small class="muted">This will be the PDF password.</small>
      </div>
      <div class="actions">
        <button type="button" id="note-cancel">Cancel</button>
        <button type="button" id="note-open">Open</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const input = modal.querySelector('#note-student-id');
    const cancel = modal.querySelector('#note-cancel');
    const open = modal.querySelector('#note-open');
    // Do not pre-fill the student ID to avoid revealing it
    input.focus();

    const close = () => overlay.remove();
    cancel.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') open.click(); });

    open.addEventListener('click', () => {
      const id = input.value.trim();
      if (!id) { input.focus(); return; }
      const exists = Array.isArray(this.DATA?.students) && this.DATA.students.some(s => String(s.id) === id);
      if (!exists) {
        alert('Student ID not found. Please enter a valid ID.');
        input.focus();
        return;
      }
      // Hint to the user; actual password prompt is handled by PDF viewer if PDF is encrypted
      alert('When prompted by the PDF viewer, enter your Student ID as the password.');
      window.open(file, '_blank', 'noopener');
      close();
    });
  }

  renderBooks() {
    const search = $('#book-search')?.value?.toLowerCase() || '';
    const tbody = $('#books-table tbody');
    if (!tbody) return;

    const combined = [
      ...(this.DATA.course.textbooks || []),
      ...(this.DATA.course.references || []),
      ...(this.DATA.books || [])
    ];

    tbody.innerHTML = combined
      .filter(b => [b.title, (b.authors || []).join(', ')]
        .some(x => (String(x || '').toLowerCase()).includes(search)))
      .map(book => `
        <tr>
          <td>${book.title || '—'}</td>
          <td>${(book.authors || []).join(', ') || '—'}</td>
        </tr>
      `)
      .join('') || '<tr><td colspan="2">No books found.</td></tr>';
  }
}

// Initialize the application when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CourseApp());
} else {
  new CourseApp();
}
