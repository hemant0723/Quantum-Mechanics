/* ===== Helpers ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const getParam = (k) => new URLSearchParams(location.search).get(k);
const fmt = (x) => (x ?? x === 0) ? x : "—";

// Detect touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

// Add touch/no-touch class to body
if (isTouchDevice) {
  document.body.classList.add('is-touch-device');
} else {
  document.body.classList.add('no-touch-device');
}

// Handle viewport height on mobile
function updateVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial setup
updateVH();
window.addEventListener('resize', updateVH);
window.addEventListener('orientationchange', updateVH);

// Initialize the app when DOM is fully loaded
function initApp() {
  // Smooth scroll to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initApp);

/* ===== Tabs ===== */
function setupTabs() {
  const tabs = $$('.tab');
  const panels = $$('.panel');
  let activeTab = 0;
  let isAnimating = false;
  const ANIMATION_DURATION = 300;

  function switchTab(index, instant = false) {
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
        isAnimating = false;
      }, ANIMATION_DURATION);
    } else {
      nextPanel.style.opacity = '1';
      isAnimating = false;
    }
    
    activeTab = index;
    
    // Save active tab to session storage
    sessionStorage.setItem('activeTab', index);
    
    // Scroll to top of panel on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({
        top: nextPanel.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  }
  
  // Initialize tabs
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchTab(index));
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
  
  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.tab !== undefined) {
      switchTab(e.state.tab);
    }
  });
}

document.addEventListener('DOMContentLoaded', setupTabs);

const DATA = window.DATA;

/* ===== Header & Info fill ===== */
(function fillHeader(){
  const c = DATA.course;
  $('#course-title').textContent = c.titleEn;
  $('#course-subtitle').textContent = `${c.titleZh} • ${c.code} • ${c.semester}`;
  $('#instructor-name').textContent = `${c.instructor.nameEn} / ${c.instructor.nameZh}`;
  $('#course-time').textContent = c.time;
  $('#course-location').textContent = c.location;
  $('#course-credits').textContent = `${c.credits} credits`;
  $('#footer-year').textContent = new Date().getFullYear();

  // Info section
  $('#course-desc').textContent = c.description;
  $('#course-goals').textContent = c.goals;
  $('#course-prereq').textContent = c.prerequisites;
  $('#office-hours').textContent = c.officeHours;

  const infoRows = [
    ["Course Code", c.code],
    ["Class Code", c.classCode],
    ["Semester", c.semester],
    ["Institute", c.institute],
    ["Type", c.type],
    ["Credit(s)", c.credits],
    ["Year", c.yearSpan],
    ["Language", c.language],
    ["Capacity", `Total ${c.capacity.total}, outside-dept limit ${c.capacity.outsideDeptLimit}`],
    ["Time", c.time],
    ["Location", c.location]
  ].map(([k,v]) => `<tr><td class="muted">${k}</td><td>${fmt(v)}</td></tr>`).join('');
  $('#info-table').innerHTML = infoRows;

  // Evaluation
  $('#eval-list').innerHTML = c.evaluation.map(e => `<li>${e.item} — <strong>${e.weight}%</strong></li>`).join('');

  // Policies
  $('#policy-list').innerHTML = c.policies.map(p=>`<li>${p}</li>`).join('');

  //* ===== Student Selection ===== */
function setupStudentSelection() {
  const studentId = getParam('student');
  const student = studentId ? DATA.students.find(s => s.id === studentId) : null;
  const selector = $('.selector');
  const select = $('#student-select');
  const copyBtn = $('#copy-link');

  // Show loading state
  selector.classList.add('is-loading');
  
  // Add accessibility attributes
  select.setAttribute('aria-label', 'Select your name from the list');
  copyBtn.setAttribute('aria-label', 'Copy your personal link');
  
  // Simulate loading (in case of API calls in the future)
  setTimeout(() => {
    if (student) {
      // Update for specific student view
      document.title = `${student.name} | ${DATA.course.titleEn}`;
      selector.style.display = 'none';
      
      // Add a back button for mobile
      if (window.innerWidth < 768) {
        const backBtn = document.createElement('button');
        backBtn.className = 'back-btn';
        backBtn.innerHTML = '&larr; Back to all students';
        backBtn.onclick = () => {
          window.history.back();
        };
        document.body.insertBefore(backBtn, document.body.firstChild);
      }
    } else {
      // Populate student dropdown
      select.innerHTML = '<option value="" disabled selected>Select your name</option>';
      
      // Sort students alphabetically by name
      const sortedStudents = [...DATA.students].sort((a, b) => 
        a.name.localeCompare(b.name, undefined, {sensitivity: 'base'})
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
      
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          const url = new URL(window.location.href);
          url.searchParams.set('student', e.target.value);
          window.history.pushState({}, '', url);
          window.location.reload();
        }
      });
      
      // Show selector
      selector.style.display = 'flex';
    }
    
    // Remove loading state
    selector.classList.remove('is-loading');
  }, 300);
  
  // Copy personal link
  copyBtn.addEventListener('click', async () => {
    if (!select.value) {
      select.focus();
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
  
  // Handle back/forward navigation
  window.addEventListener('popstate', () => {
    window.location.reload();
  });
}

// Global reference to the student select element
let studentSelect;

// Initialize the application
function initApp() {
  setupStudentSelection();
  studentSelect = document.getElementById('student-select');
  
  // Handle student selection changes
  if (studentSelect) {
    studentSelect.addEventListener('change', () => {
      renderAttendance();
      renderAssignments();
    });
  }
  
  // Initial renders
  renderAttendance();
  renderAssignments();
  
  // Set up other event listeners
  document.getElementById('att-month')?.addEventListener('input', renderAttendance);
  document.getElementById('att-clear-filter')?.addEventListener('click', () => {
    const monthInput = document.getElementById('att-month');
    if (monthInput) {
      monthInput.value = '';
      renderAttendance();
    }
  });
  
  document.getElementById('book-search')?.addEventListener('input', renderBooks);
});

/* ===== Syllabus ===== */
(function renderSyllabus(){
  const tbody = $('#syllabus-table tbody');
  tbody.innerHTML = DATA.course.syllabus
    .map(w => `<tr><td>Week ${w.week}</td><td>${w.date}</td><td>${w.topic}</td></tr>`)
    .join('');
})();

/* ===== Attendance ===== */
function renderAttendance(){
  const sel = document.getElementById('student-select');
  const name = sel ? sel.value : '';
  const month = $('#att-month').value; // YYYY-MM
  let rows = DATA.attendance.filter(a => a.student === name);
  if (month) rows = rows.filter(a => a.date.startsWith(month));
  const tbody = $('#att-table tbody');
  tbody.innerHTML = rows
    .sort((a,b)=> a.date>b.date ? -1:1)
    .map(r => `<tr><td>${r.date}</td><td>${r.status}</td><td>${fmt(r.notes)}</td></tr>`)
    .join('') || `<tr><td colspan="3">No attendance records yet.</td></tr>`;
}
$('#att-month').addEventListener('input', renderAttendance);
$('#att-clear-filter').addEventListener('click', ()=>{ $('#att-month').value=''; renderAttendance(); });

/* ===== Assignments & Marks ===== */
function renderAssignments(){
  const sel = document.getElementById('student-select');
  const name = sel ? sel.value : '';
  const marksBy = DATA.marks.filter(m=>m.student===name).reduce((a,m)=> (a[m.assignmentId]=m, a), {});
  const tbody = $('#assn-table tbody');
  tbody.innerHTML = DATA.assignments
    .slice()
    .sort((a,b)=> a.due>b.due?1:-1)
    .map(a=>{
      const mk = marksBy[a.id];
      const status = mk ? 'Graded' : (a.due ? (new Date(a.due) < new Date() ? 'Overdue' : 'Open') : 'Open');
      const badge = mk ? 'ok' : (status==='Overdue' ? 'danger' : 'warn');
      return `<tr>
        <td>${a.title}</td>
        <td>${fmt(a.subject)}</td>
        <td>${fmt(a.assigned)}</td>
        <td>${fmt(a.due)}</td>
        <td>${mk ? mk.marks : '—'}</td>
        <td>${mk ? mk.max   : '—'}</td>
        <td>${a.solutionUrl ? `<a class="link" href="${a.solutionUrl}" target="_blank">Open</a>` : '—'}</td>
        <td><span class="badge ${badge}">${status}</span></td>
      </tr>`;
    }).join('') || `<tr><td colspan="8">No assignments yet.</td></tr>`;
}

/* ===== Homework ===== */
(function renderHomework(){
  const box = $('#hw-list');
  const today = new Date().toISOString().slice(0,10);
  box.innerHTML = DATA.homework
    .slice()
    .sort((a,b)=> a.due>b.due?1:-1)
    .map(h=>{
      const st = h.due && h.due < today ? 'overdue' : 'open';
      const badge = st==='overdue'?'danger':'warn';
      return `<div class="hw-card">
        <div class="meta"><strong>${h.title}</strong><span class="badge ${badge}">${st}</span></div>
        <div class="meta"><span>${fmt(h.subject)}</span><span>Due: ${fmt(h.due)}</span></div>
        <p>${fmt(h.notes)}</p>
      </div>`;
    }).join('') || `<p class="muted">No homework posted yet.</p>`;
})();

/* ===== Books & References ===== */
function renderBooks(){
  const q = ($('#book-search').value||'').toLowerCase();
  const tbody = $('#books-table tbody');
  const combined = [
    ...(DATA.course.textbooks || []).map(b => ({...b, type:b.type||"Textbook"})),
    ...(DATA.course.references || []).map(b => ({...b, type:b.type||"Reference"})),
    ...(DATA.books || [])
  ];
  tbody.innerHTML = combined
    .filter(b => [b.title, b.authors, b.type].some(x => (x||'').toLowerCase().includes(q)))
    .map(b => `<tr>
      <td>${b.type||'—'}</td>
      <td>${b.title||'—'}</td>
      <td>${b.authors||'—'}</td>
      <td>${b.link ? `<a class="link" target="_blank" href="${b.link}">Open</a>` : '—'}</td>
    </tr>`).join('');
}
$('#book-search').addEventListener('input', renderBooks);

/* ===== Initial renders ===== */
renderAttendance();
renderAssignments();
renderBooks();
