/* ═══════════════════════════════════════════════════════════════
   VALORANT PORTFOLIO — ADMIN.JS
   ═══════════════════════════════════════════════════════════════ */

let adminData = {};

// ── TOAST ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('adminToast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type === 'error' ? 'error' : ''} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
async function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    if (res.ok) {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('adminApp').style.display = 'block';
      err.classList.remove('show');
      loadAllData();
    } else {
      err.classList.add('show');
    }
  } catch (e) {
    err.classList.add('show');
  }
}

document.getElementById('loginPass')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

async function doLogout() {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
}

// ── PANEL NAVIGATION ──────────────────────────────────────────────────────
function showPanel(name) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav li a').forEach(a => a.classList.remove('active'));

  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add('active');

  document.querySelectorAll('.sidebar-nav li a').forEach(a => {
    if (a.getAttribute('onclick')?.includes(`'${name}'`)) a.classList.add('active');
  });

  return false;
}

// ── LOAD DATA ─────────────────────────────────────────────────────────────
async function loadAllData() {
  try {
    const res = await fetch('/api/data');
    adminData = await res.json();
    populateDashboard();
    populateAbout();
    populateEducation();
    populateSemesters();
    populateSkills();
    populateProjects();
    populateCertificates();
    populateTimeline();
    populateContact();
  } catch (e) {
    toast('// FAILED TO LOAD DATA', 'error');
  }
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function populateDashboard() {
  const grid = document.getElementById('dashGrid');
  if (!grid) return;
  const stats = [
    { val: adminData.semesters.length, label: 'SEMESTERS', panel: 'semesters' },
    { val: adminData.skills.length, label: 'SKILLS', panel: 'skills' },
    { val: adminData.projects.length, label: 'PROJECTS', panel: 'projects' },
    { val: adminData.certificates.length, label: 'CERTIFICATES', panel: 'certificates' },
    { val: adminData.timeline.length, label: 'TIMELINE ENTRIES', panel: 'timeline' },
  ];
  grid.innerHTML = stats.map(s => `
    <div class="dash-stat" onclick="showPanel('${s.panel}')">
      <div class="dash-stat-val">${s.val}</div>
      <div class="dash-stat-label">// ${s.label}</div>
    </div>
  `).join('');
}

// ── ABOUT ─────────────────────────────────────────────────────────────────
function populateAbout() {
  const a = adminData.about || {};
  setVal('aName', a.name);
  setVal('aTitle', a.title);
  setVal('aLocation', a.location);
  setVal('aBio', a.bio);
  setVal('aTags', (a.tags || []).join(', '));
}

async function saveAbout(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/about', { method: 'POST', body: fd });
    if (res.ok) { toast('// ABOUT UPDATED SUCCESSFULLY'); await loadAllData(); }
    else toast('// ERROR SAVING', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

// ── EDUCATION ─────────────────────────────────────────────────────────────
function populateEducation() {
  const e = adminData.education || {};
  setVal('eSchoolName', e.school?.name);
  setVal('eSchoolBoard', e.school?.board);
  setVal('eSchoolYear', e.school?.year);
  setVal('eSchoolPct', e.school?.percentage);
  setVal('eCollegeName', e.college?.name);
  setVal('eCollegeCourse', e.college?.course);
  setVal('eCollegeBoard', e.college?.board);
  setVal('eCollegeDuration', e.college?.duration);
}

async function saveEducation(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/education', { method: 'POST', body: fd });
    if (res.ok) { toast('// EDUCATION UPDATED'); await loadAllData(); }
    else toast('// ERROR SAVING', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

// ── SEMESTERS ─────────────────────────────────────────────────────────────
function populateSemesters() {
  const tbody = document.getElementById('semTableBody');
  if (!tbody) return;
  tbody.innerHTML = adminData.semesters.map(s => `
    <tr>
      <td><span class="badge badge-accent">SEM ${s.semester}</span></td>
      <td>${s.percentage}%</td>
      <td><span class="badge badge-success">${s.status}</span></td>
      <td class="actions">
        <button class="btn btn-danger btn-sm" onclick="deleteSemester('${s.id}')">✕ DELETE</button>
      </td>
    </tr>
  `).join('');
}

async function addSemester(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/semester', { method: 'POST', body: fd });
    if (res.ok) { toast('// SEMESTER ADDED'); e.target.reset(); await loadAllData(); }
    else toast('// ERROR', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

async function deleteSemester(id) {
  if (!confirm('Delete this semester record?')) return;
  await fetch(`/api/admin/semester/${id}`, { method: 'DELETE' });
  toast('// SEMESTER REMOVED');
  await loadAllData();
}

// ── SKILLS ────────────────────────────────────────────────────────────────
function populateSkills() {
  const list = document.getElementById('skillsList');
  if (!list) return;
  list.innerHTML = adminData.skills.map(s => `
    <div style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.75rem;
      background:var(--accent-dim);border:1px solid var(--border);font-family:var(--f-mono);
      font-size:0.7rem;letter-spacing:0.08em;color:var(--text2)">
      <span>${s.icon}</span>
      <span>${s.name}</span>
      <button onclick="deleteSkill('${s.id}')" style="background:none;border:none;color:#ff4444;
        cursor:pointer;font-size:0.8rem;padding:0 0 0 0.3rem;line-height:1">✕</button>
    </div>
  `).join('');
}

async function addSkill(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/skill', { method: 'POST', body: fd });
    if (res.ok) { toast('// SKILL ADDED'); e.target.reset(); await loadAllData(); }
    else toast('// ERROR', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

async function deleteSkill(id) {
  await fetch(`/api/admin/skill/${id}`, { method: 'DELETE' });
  toast('// SKILL REMOVED');
  await loadAllData();
}

// ── PROJECTS ──────────────────────────────────────────────────────────────
function populateProjects() {
  const tbody = document.getElementById('projTableBody');
  if (!tbody) return;
  tbody.innerHTML = adminData.projects.map(p => `
    <tr>
      <td style="font-weight:600">${p.title}</td>
      <td>${p.category ? `<span class="badge badge-accent">${p.category}</span>` : '—'}</td>
      <td style="font-size:0.8rem;color:var(--text2)">${(p.tech || []).slice(0,3).join(', ')}${p.tech?.length > 3 ? '...' : ''}</td>
      <td class="actions">
        <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">✕ DELETE</button>
      </td>
    </tr>
  `).join('');
}

async function addProject(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/project', { method: 'POST', body: fd });
    if (res.ok) { toast('// PROJECT ADDED'); e.target.reset(); clearPreview('projImgPreview'); await loadAllData(); }
    else toast('// ERROR', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await fetch(`/api/admin/project/${id}`, { method: 'DELETE' });
  toast('// PROJECT REMOVED');
  await loadAllData();
}

// ── CERTIFICATES ──────────────────────────────────────────────────────────
function populateCertificates() {
  const tbody = document.getElementById('certTableBody');
  if (!tbody) return;
  tbody.innerHTML = adminData.certificates.map(c => `
    <tr>
      <td style="font-weight:600">${c.title}</td>
      <td>${c.issuer}</td>
      <td>${c.year}</td>
      <td>
        ${c.image ? '<span class="badge badge-accent">IMG</span>' : ''}
        ${c.pdf ? '<span class="badge badge-success">PDF</span>' : ''}
      </td>
      <td class="actions">
        <button class="btn btn-danger btn-sm" onclick="deleteCertificate('${c.id}')">✕ DELETE</button>
      </td>
    </tr>
  `).join('');
}

async function addCertificate(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/certificate', { method: 'POST', body: fd });
    if (res.ok) { toast('// CERTIFICATE ADDED'); e.target.reset(); clearPreview('certImgPreview'); await loadAllData(); }
    else toast('// ERROR', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

async function deleteCertificate(id) {
  if (!confirm('Delete this certificate?')) return;
  await fetch(`/api/admin/certificate/${id}`, { method: 'DELETE' });
  toast('// CERTIFICATE REMOVED');
  await loadAllData();
}

// ── TIMELINE ──────────────────────────────────────────────────────────────
function populateTimeline() {
  const list = document.getElementById('tlList');
  if (!list) return;
  list.innerHTML = adminData.timeline.map(t => `
    <div style="background:var(--bg);border:1px solid var(--borderl);border-left:2px solid var(--accent);
      padding:1.2rem;margin-bottom:1rem;display:flex;align-items:flex-start;gap:1rem">
      <div style="flex:1">
        <div style="font-family:var(--f-mono);font-size:0.65rem;color:var(--accent);letter-spacing:0.15em;margin-bottom:0.3rem">// ${t.year}</div>
        <div style="font-weight:700;margin-bottom:0.4rem">${t.title}</div>
        <div style="font-size:0.85rem;color:var(--text2);line-height:1.6">${t.description}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteTimeline('${t.id}')">✕</button>
    </div>
  `).join('') || '<div style="color:var(--textd);font-family:var(--f-mono);font-size:0.75rem">No entries yet.</div>';
}

async function addTimeline(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/timeline', { method: 'POST', body: fd });
    if (res.ok) { toast('// MILESTONE ADDED'); e.target.reset(); await loadAllData(); }
    else toast('// ERROR', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

async function deleteTimeline(id) {
  if (!confirm('Delete this timeline entry?')) return;
  await fetch(`/api/admin/timeline/${id}`, { method: 'DELETE' });
  toast('// ENTRY REMOVED');
  await loadAllData();
}

// ── CONTACT ───────────────────────────────────────────────────────────────
function populateContact() {
  const c = adminData.contact || {};
  setVal('cEmail', c.email);
  setVal('cGithub', c.github);
  setVal('cLinkedin', c.linkedin);
  setVal('cPhone', c.phone);
}

async function saveContact(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    const res = await fetch('/api/admin/contact', { method: 'POST', body: fd });
    if (res.ok) { toast('// CONTACT UPDATED'); await loadAllData(); }
    else toast('// ERROR', 'error');
  } catch { toast('// CONNECTION ERROR', 'error'); }
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function previewImg(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(previewId);
    if (img) { img.src = e.target.result; img.classList.add('show'); }
  };
  reader.readAsDataURL(file);
}

function clearPreview(id) {
  const el = document.getElementById(id);
  if (el) { el.src = ''; el.classList.remove('show'); }
}

// ── BOOT ──────────────────────────────────────────────────────────────────
(async function boot() {
  try {
    const res = await fetch('/api/auth-status');
    const { authenticated } = await res.json();
    if (authenticated) {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('adminApp').style.display = 'block';
      await loadAllData();
    }
  } catch (e) {
    console.error('Auth check failed:', e);
  }
})();
