/* ===== Helpers ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const debounce = (fn, ms = 150) => {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
};
const getParam = (k) => new URLSearchParams(location.search).get(k);
const fmt = (x) => (x ?? x === 0) ? x : "—";
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
function animateCount(el, from, to, ms = 800, formatter = (v) => v.toFixed(0)) {
  if (!el) return;
  const start = performance.now();
  function frame(now) {
    const t = clamp((now - start) / ms, 0, 1);
    const v = from + (to - from) * easeOutCubic(t);
    el.textContent = formatter(v);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Map overall score (0..100) to a color: 0=red -> 50=yellow -> 75+=green
function scoreToColor(score) {
  const t = clamp((score || 0) / 75, 0, 1); // cap at 75 for green
  const hue = Math.round(120 * t); // 0 (red) -> 120 (green)
  return `hsl(${hue} 85% 45%)`;
}

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
    this.setupTranscriptPortal();
    this.initialRenders();
    this.setupAnimations();
    this.setupAdmin();
    // Mark initialized to avoid double-init from fallback loader
    window.appInitialized = true;
  }

  setupAnimations() {
    const toReveal = [
      ...document.querySelectorAll('.card, .table, .accordion details, section.panel, header .header-actions, .tabs .tab')
    ];
    toReveal.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });
    toReveal.forEach(el => io.observe(el));
  }

  applyRowAppear(tbody) {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach((row, i) => {
      row.style.animationDelay = `${Math.min(i * 40, 400)}ms`;
      row.classList.add('row-appear');
    });
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
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join(' | ');
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
    const DEFAULT_PIN = '988746';
    const hasPin = true; // always show login; accept DEFAULT_PIN or stored PIN

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
          if (val === DEFAULT_PIN) {
            this.setAdminAuthed(12);
            close();
            const idx = this.panelIndexById?.admin;
            if (typeof idx === 'number') this.switchTab(idx);
            return;
          }
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

  // Order assignments as H1..H7, then MID, then H8..H12, then others (END last)
  getAssignmentOrder(a) {
    const id = String(a?.id || '').toUpperCase();
    const m = id.match(/^H(\d+)$/);
    if (m) return parseInt(m[1], 10);
    if (id === 'MID') return 7.5;
    if (id === 'END') return 9999;
    return 9000; // any others near the end but before END
  }

  fillHeaderAndInfo() {
    const c = this.DATA.course || {};
    const title = c.titleEn || 'Course';
    const subtitle = [c.code, c.semester].filter(Boolean).join(' ');
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
    // Ensure ASCII-safe subtitle to avoid mojibake
    setText('#course-subtitle', [c.code, c.semester].filter(Boolean).join(' ') || '-');
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
        this.renderNotes();
        this.renderResults();
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
    const exportXlsxBtn = document.getElementById('adm-export-xlsx');
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

    exportXlsxBtn?.addEventListener('click', () => {
      if (typeof this.exportHomeworkExcel6 === 'function') this.exportHomeworkExcel6();
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

  // Export homework-only marks to Excel (5-mark scale)
  exportHomeworkExcel5() {
    try {
      if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Check network.');
        return;
      }
      const scale = 5;
      const students = (this.DATA.students || []).slice();
      const hwAssn = (this.DATA.assignments || [])
        .filter(a => /^H\d+$/i.test(a.id || '') && Number(a.max) === scale)
        .sort((a,b) => this.getAssignmentOrder(a) - this.getAssignmentOrder(b));
      const assnIds = hwAssn.map(a => String(a.id).toUpperCase());

      const marksBy = new Map();
      for (const r of (this.DATA.marks || [])) {
        const id = String(r.assignmentId || '').toUpperCase();
        if (!/^H\d+$/.test(id)) continue;
        if (Number(r.max) !== scale) continue;
        if (!marksBy.has(id)) marksBy.set(id, new Map());
        marksBy.get(id).set(String(r.student), Number(r.marks));
      }

      const header = ['Student ID', 'Name', ...assnIds, 'Total'];
      const rows = [header];
      for (const s of students) {
        const row = [s.id, s.name];
        let total = 0;
        for (const id of assnIds) {
          const v = marksBy.get(id)?.get(s.id);
          const num = (typeof v === 'number') ? v : '';
          if (typeof v === 'number') total += v;
          row.push(num);
        }
        row.push(total);
        rows.push(row);
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Homework (5)');
      XLSX.writeFile(wb, 'homework-5-mark-scale.xlsx');
    } catch (e) {
      console.error(e);
      alert('Failed to export Excel. See console for details.');
    }
  }

  // Export 6-mark scale homework with Best 10 of 11 total
  exportHomeworkExcel6() {
    try {
      if (typeof XLSX === 'undefined') {
        alert('Excel library not loaded. Check network.');
        return;
      }
      const scale = 6;
      const students = (this.DATA.students || []).slice();
      const hwAssn = (this.DATA.assignments || [])
        .filter(a => /^H\d+$/i.test(a.id || '') && Number(a.max || a.maxMarks) === scale)
        .sort((a,b) => this.getAssignmentOrder(a) - this.getAssignmentOrder(b));
      const assnIds = hwAssn.map(a => String(a.id).toUpperCase());

      // marksBy[assignmentId][studentId] = marks
      const marksBy = new Map();
      for (const r of (this.DATA.marks || [])) {
        const id = String(r.assignmentId || '').toUpperCase();
        if (!/^H\d+$/.test(id)) continue;
        if (Number(r.max) !== scale) continue;
        if (!marksBy.has(id)) marksBy.set(id, new Map());
        marksBy.get(id).set(String(r.student), Number(r.marks));
      }

      const header = ['Student ID', 'Name', ...assnIds, 'Best10Total (out of 60)'];
      const rows = [header];
      for (const s of students) {
        const row = [s.id, s.name];
        const vals = [];
        for (const id of assnIds) {
          const v = marksBy.get(id)?.get(s.id);
          const num = (typeof v === 'number') ? v : '';
          if (typeof v === 'number') vals.push(v); else vals.push(0);
          row.push(num);
        }
        // Best 10 of 11
        const best = vals
          .filter(v => typeof v === 'number')
          .sort((a,b) => b - a)
          .slice(0, Math.min(10, vals.length));
        const bestTotal = best.reduce((n, v) => n + (v || 0), 0);
        row.push(bestTotal);
        rows.push(row);
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Homework (6-best10)');
      XLSX.writeFile(wb, 'homework-6-mark-scale.xlsx');
    } catch (e) {
      console.error(e);
      alert('Failed to export Excel. See console for details.');
    }
  }

  initialRenders() {
    // Critical first paint
    this.renderRosterTable();
    this.renderSyllabus();
    this.renderAttendance();
    this.renderGradingScale();
    // Do not move grading scale into Results; keep it off the Results page
    // Skip marks table in Homework; keep the page clean

    // Non-critical: schedule when idle
    const idle = (cb) => (window.requestIdleCallback ? requestIdleCallback(cb, { timeout: 500 }) : setTimeout(cb, 0));
    idle(() => { this.renderHomework(); this.renderNotes(); });
    idle(() => { this.renderBooks(); this.renderContacts(); });
    idle(() => { this.renderTranscript?.(); this.renderResults?.(); });
    this.setupDiscussion();
  }

  moveGradingScaleToResults() {
    try {
      const table = document.getElementById('grading-table');
      if (!table) return;
      const card = table.closest('.card');
      const results = document.getElementById('results');
      if (card && results && card.parentElement !== results) {
        results.appendChild(card);
      }
    } catch { /* noop */ }
  }

  // ----- Transcript (Results public view) -----
  renderTranscript() {
    const selectedId = this.getSelectedId();
    const card = document.getElementById('transcript');
    if (!selectedId) { if (card) card.style.display = 'none'; return; }
    const students = this.DATA.students || [];
    const student = students.find(s => s.id === selectedId) || {};

    // Fill header info
    const course = this.DATA.course || {};
    const byId = (sel) => document.querySelector(sel);
    if (byId('#tr-student')) byId('#tr-student').textContent = student.name || '-';
    if (byId('#tr-id')) byId('#tr-id').textContent = student.id || '-';
    if (byId('#tr-program')) byId('#tr-program').textContent = student.dept || student.note || '-';
    if (byId('#tr-course')) byId('#tr-course').textContent = [course.code, course.titleEn].filter(Boolean).join(' — ');
    if (byId('#tr-semester')) byId('#tr-semester').textContent = course.semester || '-';
    // Ensure ASCII-safe separator for course text to avoid encoding issues
    try { if (byId('#tr-course')) byId('#tr-course').textContent = [course.code, course.titleEn].filter(Boolean).join(' | '); } catch {}
    // Duplicate into header line and set institute name if present
    try {
      const courseText = byId('#tr-course')?.textContent || '';
      const semText = byId('#tr-semester')?.textContent || '';
      if (byId('#tr-course-dup')) byId('#tr-course-dup').textContent = courseText;
      if (byId('#tr-semester-dup')) byId('#tr-semester-dup').textContent = semText;
      if (byId('#tr-university')) byId('#tr-university').textContent = (this.DATA.course?.institute || byId('#footer-institute')?.textContent || '').trim();
    } catch {}

    // Build marksBy map for this student
    const marksBy = (this.DATA.marks || [])
      .filter(m => m.student === selectedId || m.student === student.name || m.student === student.nameZh)
      .reduce((a, m) => (a[m.assignmentId] = m, a), {});

    const assns = this.DATA.assignments || [];
    const isHW = (a) => /^H\d+$/i.test(String(a.id||''));
    const hwList = assns.filter(isHW);
    const mid = assns.find(a => String(a.id).toUpperCase() === 'MID');
    const end = assns.find(a => String(a.id).toUpperCase() === 'END');
    const sum = (list, pick) => list.reduce((n, a) => n + (pick(a) || 0), 0);

    // Best-10-of-11 homework aggregation (6 marks each)
    const hwItems = hwList.map(a => ({ id: a.id, got: Number((marksBy[a.id]?.marks)) || 0, max: Number(a.max || a.maxMarks || 0) }))
      .sort((x,y) => (y.got - x.got));
    const bestN = Math.min(10, hwItems.length);
    const bestSet = hwItems.slice(0, bestN);
    const hwMax = sum(bestSet, x => x.max);
    const hwGot = sum(bestSet, x => x.got);
    const midMax = (mid && (mid.max || mid.maxMarks)) || 0;
    const midGot = (marksBy[mid?.id || '']?.marks) || 0;
    const endMax = (end && (end.max || end.maxMarks)) || 0;
    const endGot = (marksBy[end?.id || '']?.marks) || 0;

    const TARGET_HW = 60, TARGET_MID = 20, TARGET_END = 20;
    const scaledHW = hwMax ? (hwGot / hwMax) * TARGET_HW : 0;
    const scaledMID = midMax ? (midGot / midMax) * TARGET_MID : 0;
    const scaledEND = endMax ? (endGot / endMax) * TARGET_END : 0;
    const total = Math.round((scaledHW + scaledMID + scaledEND) * 100) / 100;

    // Letter grade from grading scale
    const scale = Array.isArray(course.gradingScale) ? course.gradingScale : [];
    const grade = (() => {
      const t = Math.round(total);
      for (const row of scale) {
        const r = String(row.range || '');
        const m = r.match(/(\d+)\s*-\s*(\d+)/);
        if (m) {
          const lo = parseInt(m[1], 10); const hi = parseInt(m[2], 10);
          if (t >= lo && t <= hi) return row.letter;
          continue;
        }
        const b = r.match(/(\d+)\s*and\s*below/i);
        if (b) { const hi = parseInt(b[1], 10); if (t <= hi) return row.letter; }
      }
      return '-';
    })();
    if (byId('#tr-letter')) byId('#tr-letter').textContent = grade;

    // Breakdown table
    const tbody = document.querySelector('#tr-breakdown tbody');
    if (tbody) {
      tbody.innerHTML = [
        [`Homework (Best ${bestN} of ${hwList.length})`, Math.round(hwGot*10)/10, hwMax, Math.round(scaledHW*10)/10 + ' / ' + TARGET_HW],
        ['Mid-Sem (Exam)', midGot, midMax, Math.round(scaledMID*10)/10 + ' / ' + TARGET_MID],
        ['End-Sem (Exam)', endGot, endMax, Math.round(scaledEND*10)/10 + ' / ' + TARGET_END],
        ['Total', '-', '-', Math.round(total*10)/10 + ' / 100']
      ].map(r => `<tr><td>${r[0]}</td><td>${fmt(r[1])}</td><td>${fmt(r[2])}</td><td>${r[3]}</td></tr>`).join('');
    }
    const note = document.getElementById('tr-note');
    if (note) note.textContent = 'Homework scored on a 6-mark scale; best 10 of 11 counted to 60. Mid and End are 20 each. Passing score is 70 (B-).';
    // (Grading scale removed from transcript)

    // Search and print wires
    const idInput = document.getElementById('tr-search-id');
    const nameInput = document.getElementById('tr-search-name');
    const findBtn = document.getElementById('tr-search-btn');
    const doFind = () => {
      const qid = (idInput?.value || '').trim().toLowerCase();
      const qn = (nameInput?.value || '').trim().toLowerCase();
      if (!qid && !qn) return;
      const match = students.find(s => (
        (qid && String(s.id).toLowerCase() === qid) ||
        (qn && String(s.name).toLowerCase().includes(qn))
      ));
      if (match) {
        const sel = document.getElementById('student-select');
        if (sel) {
          sel.value = match.id;
          sel.dispatchEvent(new Event('change'));
          this.urlStudentId = match.id;
          this.renderTranscript();
        } else {
          this.urlStudentId = match.id;
          this.renderTranscript();
        }
      } else {
        alert('No matching student found');
      }
    };
    if (idInput && !idInput._wired) { idInput._wired = true; idInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doFind(); }); }
    if (nameInput && !nameInput._wired) { nameInput._wired = true; nameInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doFind(); }); }
    if (findBtn && !findBtn._wired) { findBtn._wired = true; findBtn.addEventListener('click', () => { doFind(); this.renderTranscript(); }); }
    // (Print controls removed by request)
    const pdfBtn = document.getElementById('transcript-pdf');
    if (pdfBtn && !pdfBtn._wired) {
      pdfBtn._wired = true;
      pdfBtn.addEventListener('click', async () => {
        const el = document.getElementById('transcript');
        const idTxt = document.getElementById('tr-id')?.textContent?.trim() || 'transcript';
        if (!el) { window.print(); return; }
        const doExport = async () => {
          // Prepare layout specifically for PDF capture
          el.classList.add('pdf-export');
          document.body.classList.add('pdf-exporting');
          const scale = Math.min(3, Math.max(2, (window.devicePixelRatio || 2) * 1.2));
          const opt = {
            margin: 0,
            filename: `transcript-${idTxt}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale, useCORS: true, backgroundColor: '#ffffff' },
            pagebreak: { mode: ['css','avoid-all'], avoid: ['.avoid-break','tr','.kv','.table','.transcript-header','h3'] },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          try { await window.html2pdf().set(opt).from(el).save(); }
          finally { el.classList.remove('pdf-export'); document.body.classList.remove('pdf-exporting'); }
        };

        // Ensure html2pdf is available; try dynamic load if missing
        if (!window.html2pdf) {
          try {
            await new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js';
              s.crossOrigin = 'anonymous';
              s.referrerPolicy = 'no-referrer';
              s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
            });
          } catch {}
        }
        if (window.html2pdf) {
          try { await doExport(); }
          catch (e) { console.error(e); window.print(); }
        } else {
          window.print();
        }
      });
    }
    if (card) card.style.display = '';
    const portalCard = document.querySelector('.portal-card');
    if (portalCard) portalCard.style.display = 'none';
    try {
      if (getParam('print') && !window._autoTranscriptPrinted) {
        window._autoTranscriptPrinted = true;
        setTimeout(() => window.print(), 500);
      }
    } catch {}
  }

  renderGradingScale() {
    const tbody = document.querySelector('#grading-table tbody');
    const note = document.getElementById('grading-note');
    if (note) note.textContent = this.DATA.course?.gradingNote || '';
    if (!tbody) return;
    const scale = Array.isArray(this.DATA.course?.gradingScale) ? this.DATA.course.gradingScale : [];
    tbody.innerHTML = scale.map(row => {
      const noteTxt = row.note ? ` <span class=\"muted\">(${this.escapeHtml(String(row.note))})</span>` : '';
      return `<tr>
        <td>${this.escapeHtml(String(row.letter || ''))}${noteTxt}</td>
        <td>${this.escapeHtml(String(row.point ?? ''))}</td>
        <td>${this.escapeHtml(String(row.range || ''))}</td>
        <td>${this.escapeHtml(String(row.score ?? ''))}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="4">Grading scale not available.</td></tr>';
    this.applyRowAppear(tbody);
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
        <td>${(r.notes == null || r.notes === '')
          ? '—'
          : (/^\s*late\b/i.test(String(r.notes))
            ? `<span class="text-danger">${this.escapeHtml(String(r.notes))}</span>`
            : this.escapeHtml(String(r.notes)))}
        </td>
      </tr>`)
      .join('') || '<tr><td colspan="3">No attendance records yet.</td></tr>';
    this.applyRowAppear(tbody);

    // Render charts beneath filters
    this.renderAttendanceCharts();
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
      .sort((a, b) => {
        const ao = this.getAssignmentOrder(a);
        const bo = this.getAssignmentOrder(b);
        if (ao !== bo) return ao - bo;
        const ad = a.due || '';
        const bd = b.due || '';
        if (ad !== bd) return ad < bd ? -1 : 1;
        return String(a.id||'').localeCompare(String(b.id||''));
      })
      .map(a => {
        const mk = marksBy[a.id];
        // Do not show overdue/open status; all submitted
        
        return `
          <tr>
            <td>${a.title}</td>
            <td>${mk ? mk.marks : '-'}</td>
            <td>${mk ? mk.max : (a.maxMarks || a.max || '-')}</td>
          </tr>
        `;
      })
      .join('') || '<tr><td colspan="3">No assignments found.</td></tr>';
    this.applyRowAppear(tbody);

    // Removed progress ring in Homework section
  }

  renderGradeProgress(selectedId, marksBy, opts = { progressId: 'grade-progress', textId: 'grade-progress-text', segmented: false }) {
    const progWrap = document.getElementById(opts.progressId);
    const progText = document.getElementById(opts.textId);
    if (!progWrap) return;

    const assns = this.DATA.assignments || [];
    const isHW = (a) => /^H\d+$/i.test(String(a.id||''));
    const hwList = assns.filter(isHW);
    const mid = assns.find(a => String(a.id).toUpperCase() === 'MID');
    const end = assns.find(a => String(a.id).toUpperCase() === 'END');

    const sum = (list, pick) => list.reduce((n, a) => n + (pick(a) || 0), 0);
    // Best-10-of-11 homework aggregation (6 marks each)
    const hwItems = hwList.map(a => ({
      id: a.id,
      got: Number((marksBy[a.id]?.marks)) || 0,
      max: Number(a.max || a.maxMarks || 0)
    })).sort((x, y) => (y.got - x.got));
    const bestN1 = Math.min(10, hwItems.length);
    const bestSet1 = hwItems.slice(0, bestN1);
    const hwMax = sum(bestSet1, x => x.max);
    const hwGot = sum(bestSet1, x => x.got);
    const midMax = (mid && (mid.max || mid.maxMarks)) || 0;
    const midGot = (marksBy[mid?.id || '']?.marks) || 0;
    const endMax = (end && (end.max || end.maxMarks)) || 0;
    const endGot = (marksBy[end?.id || '']?.marks) || 0;

    // Course structure targets: HW 60, MID 20, END 20
    // Rescale homework to 60 only if its configured max differs from 60
    const TARGET_HW = 60, TARGET_MID = 20, TARGET_END = 20;
    const scaledHW = hwMax ? (hwGot / hwMax) * TARGET_HW : 0;
    const scaledMID = midMax ? (midGot / midMax) * TARGET_MID : 0;
    const scaledEND = endMax ? (endGot / endMax) * TARGET_END : 0;

    const total = Math.round((scaledHW + scaledMID + scaledEND) * 100) / 100; // 0..100

    // Build ring (reuse attendance ring styling)
    progWrap.innerHTML = '';
    const size = 140; const r = 58; const cx = size/2; const cy = size/2; const c = 2 * Math.PI * r;
    const dashOffset = c * (1 - (Math.min(total,100)/100));
    const ring = document.createElement('div'); ring.className = 'ring';
    if (opts.segmented) {
      const pHW = clamp((scaledHW/100), 0, 1);
      const pMID = clamp((scaledMID/100), 0, 1);
      const pEND = clamp((scaledEND/100), 0, 1);
      const arcHW = c * pHW;
      const arcMID = c * pMID;
      const arcEND = c * pEND;
      ring.innerHTML = `
        <svg viewBox="0 0 ${size} ${size}" class="progress-ring" aria-hidden="true">
          <circle cx="${cx}" cy="${cy}" r="${r}" stroke="var(--line)" stroke-width="12" fill="none" />
          <circle class="seg hw" cx="${cx}" cy="${cy}" r="${r}" stroke="var(--ok)" stroke-linecap="round" stroke-width="12" fill="none"
            style="transform:rotate(-90deg); transform-origin:${cx}px ${cy}px; stroke-dasharray:${arcHW} ${c-arcHW}; stroke-dashoffset:${c}" />
          <circle class="seg mid" cx="${cx}" cy="${cy}" r="${r}" stroke="var(--accent)" stroke-linecap="round" stroke-width="12" fill="none"
            style="transform:rotate(${(-90 + (arcHW/c)*360)}deg); transform-origin:${cx}px ${cy}px; stroke-dasharray:${arcMID} ${c-arcMID}; stroke-dashoffset:${c}" />
          <circle class="seg end" cx="${cx}" cy="${cy}" r="${r}" stroke="var(--info)" stroke-linecap="round" stroke-width="12" fill="none"
            style="transform:rotate(${(-90 + ((arcHW+arcMID)/c)*360)}deg); transform-origin:${cx}px ${cy}px; stroke-dasharray:${arcEND} ${c-arcEND}; stroke-dashoffset:${c}" />
        </svg>
        <div class="pct" aria-label="${total}% total">0%</div>
        <div class="legend">
          <span class="item"><span class="swatch hw"></span>HW</span>
          <span class="item"><span class="swatch mid"></span>Mid</span>
          <span class="item"><span class="swatch end"></span>End</span>
        </div>
      `;
    } else {
      // Use same gradient as attendance ring for consistent styling (unique id per container)
      const gradId = `gradeGrad-${opts.progressId || 'default'}`;
      ring.innerHTML = `
        <svg viewBox="0 0 ${size} ${size}" class="progress-ring" aria-hidden="true">
          <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="var(--ok)" />
              <stop offset="100%" stop-color="var(--accent)" />
            </linearGradient>
          </defs>
          <circle cx="${cx}" cy="${cy}" r="${r}" stroke="var(--line)" stroke-width="12" fill="none" />
          <circle cx="${cx}" cy="${cy}" r="${r}" stroke="url(#${gradId})" stroke-linecap="round"
            stroke-width="12" fill="none" style="transform:rotate(-90deg); transform-origin:${cx}px ${cy}px; stroke-dasharray:${c}; stroke-dashoffset:${c}; transition:stroke-dashoffset 600ms var(--ease-out)" />
        </svg>
        <div class="pct" aria-label="${total}% total">0%</div>
      `;
    }
    progWrap.appendChild(ring);
    if (opts.segmented) {
      requestAnimationFrame(() => {
        ring.querySelectorAll('circle.seg').forEach(seg => {
          seg.style.transition = 'stroke-dashoffset 700ms var(--ease-out)';
          seg.style.strokeDashoffset = '0';
        });
      });
    } else {
      requestAnimationFrame(() => {
        const prog = ring.querySelectorAll('circle')[1];
        if (prog) prog.style.strokeDashoffset = String(dashOffset);
      });
    }
    const pctEl = ring.querySelector('.pct');
    animateCount(pctEl, 0, total, 900, (v)=> `${Math.round(v)}%`);

    if (progText) {
      // Show component breakdown
      const parts = [
        `HW: ${Math.round(scaledHW*10)/10}/${TARGET_HW}`,
        `Mid: ${Math.round(scaledMID*10)/10}/${TARGET_MID}`,
        `End: ${Math.round(scaledEND*10)/10}/${TARGET_END}`
      ];
      progText.textContent = `${Math.round(total*10)/10}/100 • ` + parts.join(' • ');
    }
  }

  renderResults() {
    const selectedId = this.getSelectedId();
    if (!selectedId) return;
    const selected = this.DATA.students.find(s => s.id === selectedId);

    // Build marksBy map similar to assignments view
    const marksBy = (this.DATA.marks || [])
      .filter(m => (
        m.student === selectedId ||
        (selected && (m.student === selected.name || m.student === selected.nameZh))
      ))
      .reduce((a, m) => (a[m.assignmentId] = m, a), {});

    // Progress ring in Results panel
    this.renderGradeProgress(selectedId, marksBy, { progressId: 'res-progress', textId: 'res-progress-text', segmented: false });

    // Breakdown table
    const tbody = document.querySelector('#res-breakdown tbody');
    if (tbody) {
      const assns = this.DATA.assignments || [];
      const isHW = (a) => /^H\d+$/i.test(String(a.id||''));
      const hwList = assns.filter(isHW);
      const mid = assns.find(a => String(a.id).toUpperCase() === 'MID');
      const end = assns.find(a => String(a.id).toUpperCase() === 'END');
      const sum = (list, pick) => list.reduce((n, a) => n + (pick(a) || 0), 0);
      // Best-10-of-11 homework aggregation (6 marks each)
      const hwItems2 = hwList.map(a => ({ id: a.id, got: Number((marksBy[a.id]?.marks)) || 0, max: Number(a.max || a.maxMarks || 0) }))
        .sort((x,y) => (y.got - x.got));
      const bestN2 = Math.min(10, hwItems2.length);
      const bestSet2 = hwItems2.slice(0, bestN2);
      const hwMax = sum(bestSet2, x => x.max);
      const hwGot = sum(bestSet2, x => x.got);
      const midMax = (mid && (mid.max || mid.maxMarks)) || 0;
      const midGot = (marksBy[mid?.id || '']?.marks) || 0;
      const endMax = (end && (end.max || end.maxMarks)) || 0;
      const endGot = (marksBy[end?.id || '']?.marks) || 0;
      const TARGET_HW = 60, TARGET_MID = 20, TARGET_END = 20;
      const scaledHW = hwMax ? (hwGot / hwMax) * TARGET_HW : 0;
      const scaledMID = midMax ? (midGot / midMax) * TARGET_MID : 0;
      const scaledEND = endMax ? (endGot / endMax) * TARGET_END : 0;
      const totHW = hwList.length; const usedHW = Math.min(10, totHW);
      tbody.innerHTML = [
        [`Homework (Best ${usedHW} of ${totHW})`, hwGot, hwMax, Math.round(scaledHW*10)/10 + ' / ' + TARGET_HW],
        ['Mid-Sem (Exam)', midGot, midMax, Math.round(scaledMID*10)/10 + ' / ' + TARGET_MID],
        ['End-Sem (Exam)', endGot, endMax, Math.round(scaledEND*10)/10 + ' / ' + TARGET_END],
      ].map(([n,s,m,w]) => `<tr><td>${n}</td><td>${fmt(s)}</td><td>${fmt(m)}</td><td>${w}</td></tr>`).join('');
    }

    // (Removed small attendance summary card in Results)

    // Marks by assignment (mirror of homework marks table)
    const atbody = document.querySelector('#res-assn-table tbody');
    if (atbody) {
      atbody.innerHTML = (this.DATA.assignments || [])
        .slice()
        .sort((a, b) => {
          const ao = this.getAssignmentOrder(a);
          const bo = this.getAssignmentOrder(b);
          if (ao !== bo) return ao - bo;
          const ad = a.due || '';
          const bd = b.due || '';
          if (ad !== bd) return ad < bd ? -1 : 1;
          return String(a.id||'').localeCompare(String(b.id||''));
        })
        .map(a => {
          const mk = marksBy[a.id];
          return `<tr><td>${this.escapeHtml(a.title || a.id)}</td><td>${mk ? mk.marks : '-'}</td><td>${mk ? mk.max : (a.maxMarks || a.max || '-')}</td></tr>`;
        })
        .join('') || '<tr><td colspan="3">No assignments found.</td></tr>';
      this.applyRowAppear(atbody);
    }
  }

  // ----- Attendance charts (summary ring + timeline) -----
  renderAttendanceCharts() {
    const selectedId = this.getSelectedId();
    const month = document.getElementById('att-month')?.value || '';
    const progressWrap = document.getElementById('att-progress');
    const progressText = document.getElementById('att-progress-text');
    const barsWrap = document.getElementById('att-bars');
    if (!selectedId || !progressWrap) return;

    const allRows = (this.DATA.attendance || []).filter(r => r.student === selectedId);
    const filterByMonth = (r) => !month || String(r.date).startsWith(month);
    const rows = allRows.filter(filterByMonth);
    const uniqDates = (arr) => Array.from(new Set(arr.map(r => r.date))).sort((a,b)=> String(a).localeCompare(String(b)));
    const dates = uniqDates(rows.length ? rows : allRows);

    const mapByDate = new Map(allRows.map(r => [r.date, r]));
    const presentCount = dates.reduce((n, d) => n + ((mapByDate.get(d)?.status === 'Present') ? 1 : 0), 0);
    const total = dates.length;
    const pct = total ? Math.round((presentCount / total) * 100) : 0;

    // Summary ring
    progressWrap.innerHTML = '';
    const size = 140; const r = 58; const cx = size/2; const cy = size/2; const c = 2 * Math.PI * r;
    const dashOffset = c * (1 - (pct/100));
    const ring = document.createElement('div'); ring.className = 'ring';
    ring.innerHTML = `
      <svg viewBox="0 0 ${size} ${size}" class="progress-ring" aria-hidden="true">
        <defs>
          <linearGradient id="attGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--ok)" />
            <stop offset="100%" stop-color="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${r}" stroke="var(--line)" stroke-width="12" fill="none" />
        <circle cx="${cx}" cy="${cy}" r="${r}" stroke="url(#attGrad)" stroke-linecap="round"
          stroke-width="12" fill="none" style="transform:rotate(-90deg); transform-origin:${cx}px ${cy}px; stroke-dasharray:${c}; stroke-dashoffset:${c}; transition:stroke-dashoffset 600ms var(--ease-out)" />
      </svg>
      <div class="pct" aria-label="${pct}% attendance">0%</div>
    `;
    progressWrap.appendChild(ring);
    // trigger transition on next frame
    requestAnimationFrame(() => {
      const prog = ring.querySelectorAll('circle')[1];
      if (prog) prog.style.strokeDashoffset = String(dashOffset);
    });
    const pctEl = ring.querySelector('.pct');
    animateCount(pctEl, 0, pct, 900, (v)=> `${Math.round(v)}%`);

    const txt = month
      ? `${presentCount}/${total} this month • Overall updates live`
      : `${presentCount}/${total} overall`;
    if (progressText) progressText.textContent = txt;

    // If timeline container is absent, skip timeline rendering
    if (!barsWrap) return;

    // Timeline bars
    barsWrap.innerHTML = '';
    const maxH = barsWrap.clientHeight || 120; // px
    const monthSel = document.getElementById('att-month');
    const curMonth = monthSel && monthSel.value ? String(monthSel.value) : '';
    dates.forEach((d, i) => {
      const rec = mapByDate.get(d);
      const st = (rec && rec.status) || 'Absent';
      const cls = st === 'Present' ? 'present' : (/^late/i.test(st) ? 'late' : 'absent');
      const h = st === 'Present' ? maxH : Math.max(18, maxH * 0.3);
      const bar = document.createElement('div');
      bar.className = `bar ${cls}`;
      bar.style.height = `${h}px`;
      const label = new Date(d).toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
      bar.setAttribute('data-tip', `${label} — ${st}`);
      bar.setAttribute('role', 'listitem');
      bar.tabIndex = 0;
      if (curMonth && d.startsWith(curMonth)) bar.classList.add('active');
      bar.setAttribute('aria-label', `${label} ${st}`);
      // click to filter month
      bar.addEventListener('click', () => {
        const m = d.slice(0,7);
        const mi = document.getElementById('att-month');
        if (mi) { mi.value = m; this.renderAttendance(); }
      });
      // keyboard support
      bar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bar.click(); }
      });
      barsWrap.appendChild(bar);
      // staggered appear
      setTimeout(() => bar.classList.add('in'), Math.min(i*30, 300));
    });
  }

  renderHomework() {
    const acc = document.getElementById('hw-accordion');
    if (!acc) return;

    const items = (this.DATA.homework || []).slice().sort((a, b) => {
      const ad = a && a.due ? Date.parse(a.due) : NaN;
      const bd = b && b.due ? Date.parse(b.due) : NaN;
      if (!isNaN(ad) && !isNaN(bd)) return ad - bd;
      if (!isNaN(ad)) return -1;
      if (!isNaN(bd)) return 1;
      return (a.title || '').localeCompare(b.title || '');
    });

    if (!items.length) {
      acc.innerHTML = '<p class="muted">No homework assigned yet.</p>';
      return;
    }

    acc.innerHTML = items.map(h => {
      const due = fmt(h.due);
      const pts = h.points ? `${h.points} pts` : '';
      const linkContent = h.link ? `<div class="hw-iframe-container" data-src="${h.link}" data-title="${h.title}"><div class="iframe-placeholder"><button class="load-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.75a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5a.75.75 0 01.75-.75z" /></svg>Load Homework</button></div></div>` : '';
      const descriptionContent = h.description ? `<p>${this.escapeHtml(h.description)}</p>` : '';

      return `
        <details class="hw-item" data-id="${h.id || ''}">
          <summary>
            <span>${this.escapeHtml(h.title || 'Homework')}</span>
            <span class="hw-summary-right">${[due, pts].filter(Boolean).join(' • ')}</span>
          </summary>
          <div class="hw-content">
            ${descriptionContent}
            ${linkContent}
          </div>
        </details>
      `;
    }).join('');

            acc.querySelectorAll('details.hw-item').forEach(detail => {
      const placeholder = detail.querySelector('.iframe-placeholder');
      if (placeholder) {
        placeholder.addEventListener('click', () => {
          const container = placeholder.parentElement;
          // Show a simple spinner (no flashing progress animation)
          container.innerHTML = `
            <div class="loading-center">
              <span class="loading-spinner" aria-hidden="true"></span>
              <div class="progress-text">Loading…</div>
            </div>
          `;

          const iframe = document.createElement('iframe');
          iframe.src = container.dataset.src;
          iframe.title = container.dataset.title;
          iframe.loading = 'lazy';
          iframe.allowFullscreen = true;
          iframe.style.opacity = '0';
          iframe.style.transition = 'opacity 200ms var(--ease-out)';

          iframe.addEventListener('load', () => {
            container.innerHTML = '';
            container.appendChild(iframe);
            // Fade in to avoid abrupt flash
            requestAnimationFrame(() => { iframe.style.opacity = '1'; });
          }, { once: true });

          // Start loading in background
          document.body.appendChild(iframe);
          // Move into container right away to respect layout
          document.body.removeChild(iframe);
          container.appendChild(iframe);
        });
      }
    });
  }

  renderNotes() {
    const acc = document.getElementById('notes-accordion');
    if (!acc) return;

    const notes = [
      { id: 'N1', title: 'Notes 1', date: '2025-09-11', file: 'assets/notes/QM_Notes1.pdf' },
      { id: 'N2', title: 'Notes 2', date: '2025-09-18', file: 'assets/notes/QM_Notes2.pdf' },
      { id: 'N3', title: 'Notes 3', date: '2025-09-25', file: 'assets/notes/QM_Notes3.pdf' },
      { id: 'N4', title: 'Notes 4', date: '2025-10-02', file: 'assets/notes/QM_Notes4.pdf' },
      { id: 'N5', title: 'Notes 5', date: '2025-10-09', file: 'assets/notes/QM_Notes5.pdf' },
      { id: 'N6', title: 'Notes 6', date: '2025-10-16', file: 'assets/notes/QM_Notes6.pdf' },
      { id: 'N7', title: 'Notes 7', date: '2025-10-23', file: 'assets/notes/QM_Notes7.pdf' },
      { id: 'N8', title: 'Notes 8', date: '2025-10-30', file: 'assets/notes/QM_Notes8.pdf' }
    ];

    // Sort oldest → newest by date (match Homework ordering)
    notes.sort((a,b) => String(a.date).localeCompare(String(b.date)));

    acc.innerHTML = notes.map(n => `
      <details class="note-item" data-id="${n.id}">
        <summary>
          <span>${this.escapeHtml(n.title)}</span>
        </summary>
        <div class="hw-content">
          <div class="row-wrap">
            <a class="link" target="_blank" rel="noopener" href="${n.file}">Open PDF</a>
          </div>
        </div>
      </details>
    `).join('');
  }

  // Wire up the Results entry gate (ID/Name + View/Print)
  setupTranscriptPortal() {
    const idInput = document.getElementById('tr-search-id');
    const nameInput = document.getElementById('tr-search-name');
    const findBtn = document.getElementById('tr-search-btn');
    const printBtn = document.getElementById('transcript-print');
    if (!idInput && !nameInput && !findBtn && !printBtn) return; // results portal not present

    const doFind = () => {
      const students = this.DATA.students || [];
      const qid = (idInput?.value || '').trim().toLowerCase();
      const qn = (nameInput?.value || '').trim().toLowerCase();
      if (!qid && !qn) return;
      const match = students.find(s => (
        (qid && String(s.id).toLowerCase() === qid) ||
        (qn && String(s.name).toLowerCase().includes(qn))
      ));
      if (match) {
        this.urlStudentId = match.id;
        const sel = document.getElementById('student-select');
        if (sel) sel.value = match.id;
        this.renderTranscript();
      } else {
        alert('No matching student found');
      }
    };

    if (idInput && !idInput._wired) { idInput._wired = true; idInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doFind(); }); }
    if (nameInput && !nameInput._wired) { nameInput._wired = true; nameInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doFind(); }); }
    if (findBtn && !findBtn._wired) { findBtn._wired = true; findBtn.addEventListener('click', doFind); }
    if (printBtn && !printBtn._wired) { printBtn._wired = true; printBtn.addEventListener('click', () => window.print()); }
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

// Color management wiring for Theme/Brand selects
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeSel = document.getElementById('theme-select');
  const brandSel = document.getElementById('brand-select');
  if (!themeSel && !brandSel) return;
  const THEME_KEY = 'theme_pref';
  const BRAND_KEY = 'brand_pref';

  const applyTheme = (mode) => {
    if (mode === 'light' || mode === 'dark' || mode === 'contrast') {
      root.setAttribute('data-theme', mode);
      localStorage.setItem(THEME_KEY, mode);
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem(THEME_KEY);
    }
    if (themeSel) themeSel.value = (mode === 'light' || mode === 'dark' || mode === 'contrast') ? mode : 'system';
  };
  const applyBrand = (brand) => {
    const b = (brand === 'blue' || brand === 'green' || brand === 'purple' || brand === 'gold') ? brand : '';
    if (b) { root.setAttribute('data-brand', b); localStorage.setItem(BRAND_KEY, b); }
    else { root.removeAttribute('data-brand'); localStorage.removeItem(BRAND_KEY); }
    if (brandSel) brandSel.value = b;
  };

  // Initialize from saved
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'contrast') applyTheme('contrast');
  else applyTheme(savedTheme || 'system');
  const savedBrand = localStorage.getItem(BRAND_KEY) || '';
  applyBrand(savedBrand);

  themeSel?.addEventListener('change', () => {
    const v = themeSel.value;
    applyTheme(v === 'system' ? null : v);
  });
  brandSel?.addEventListener('change', () => {
    applyBrand(brandSel.value || '');
  });
});
