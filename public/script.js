/* ═══════════════════════════════════════════════════════════════
   VALORANT PORTFOLIO — SCRIPT.JS
   ═══════════════════════════════════════════════════════════════ */

// ── PARTICLE CANVAS ───────────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.8 ? '#ff4655' : '#4a4d60';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
    window.addEventListener('resize', resize);
    loop();
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 120) * 0.06;
          ctx.strokeStyle = '#ff4655';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  init();
})();

// ── NAV ───────────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

// ── REVEAL ON SCROLL ─────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 150);
    }
  });
}, { threshold: 0.1 });

// ── GSAP SCROLL TRIGGERS ──────────────────────────────────────────────────
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Section headers
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      x: -40, opacity: 0, duration: 0.8, ease: 'power2.out'
    });
  });

  // Skill cards stagger
  gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 90%' },
      y: 30, opacity: 0,
      duration: 0.5,
      delay: i * 0.04,
      ease: 'power2.out'
    });
  });
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── MODAL ─────────────────────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) closeModal(m.id);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

// ── CONTACT FORM ──────────────────────────────────────────────────────────
function handleContactSubmit(e) {
  e.preventDefault();
  showToast('// MESSAGE TRANSMITTED SUCCESSFULLY');
  e.target.reset();
}

// ── RENDER FUNCTIONS ──────────────────────────────────────────────────────
let portfolioData = {};

function renderAbout(data) {
  const a = data.about;
  const photo = document.getElementById('aboutPhoto');
  const placeholder = document.getElementById('photoPlaceholder');

  if (a.photo && photo) {
    photo.src = a.photo;
    photo.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
  }

  setText('aboutName', a.name);
  setText('aboutTitle', a.title);
  setText('aboutLocation', a.location);
  setText('aboutBio', a.bio);
  setText('heroName', '');

  // Update hero stats from data
  const heroFirst = document.querySelector('.hero-name-first');
  const heroLast = document.querySelector('.hero-name-last');
  if (heroFirst) heroFirst.textContent = a.name.split(' ')[0];
  if (heroLast) heroLast.textContent = a.name.split(' ').slice(1).join(' ');

  const heroRole = document.getElementById('heroRole');
  if (heroRole) heroRole.textContent = a.title.toUpperCase();

  const tags = document.getElementById('aboutTags');
  if (tags) {
    tags.innerHTML = a.tags.map(t => `<span class="skill-tag">${t}</span>`).join('');
  }
}

function renderEducation(data) {
  const e = data.education;
  setText('schoolName', e.school.name);
  setText('schoolBoard', e.school.board);
  setText('schoolYear', e.school.year);
  setText('schoolPct', e.school.percentage);
  setText('collegeName', e.college.name);
  setText('collegeCourse', e.college.course);
  setText('collegeBoard', e.college.board);
  setText('collegeDuration', e.college.duration);

  // Animate progress bar
  setTimeout(() => {
    const bar = document.getElementById('schoolBar');
    if (bar) bar.style.width = e.school.percentage + '%';
  }, 600);
}

function renderSemesters(data) {
  const grid = document.getElementById('semGrid');
  if (!grid) return;
  grid.innerHTML = data.semesters.map(s => `
    <div class="sem-card reveal">
      <div class="sem-label">// SEMESTER</div>
      <div class="sem-num">SEM ${s.semester}</div>
      <div class="sem-pct">${s.percentage}<span class="sem-pct-sym">%</span></div>
      <div class="sem-status pass">${s.status.toUpperCase()}</div>
      <div class="sem-ring"></div>
    </div>
  `).join('');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function renderSkills(data) {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;
  grid.innerHTML = data.skills.map(s => `
    <div class="skill-card">
      <span class="skill-icon">${s.icon}</span>
      <span class="skill-name">${s.name}</span>
    </div>
  `).join('');
}

function renderProjects(data) {
  const grid = document.getElementById('projectsGrid');
  const filters = document.getElementById('projectFilters');
  if (!grid) return;

  const categories = ['ALL', ...new Set(data.projects.map(p => p.category).filter(Boolean))];

  if (filters) {
    filters.innerHTML = categories.map((cat, i) => `
      <button class="filter-btn ${i === 0 ? 'active' : ''}" onclick="filterProjects('${cat}', this)">${cat}</button>
    `).join('');
  }

  renderProjectCards(data.projects, grid);
}

function renderProjectCards(projects, grid) {
  grid.innerHTML = projects.map(p => `
    <div class="project-card reveal" onclick="openProjectModal('${p.id}')">
      <div class="project-img-wrap">
        ${p.image
          ? `<img src="${p.image}" alt="${p.title}" class="project-img" onerror="this.style.display='none'">`
          : ''}
        <div class="project-img-placeholder">◈</div>
        ${p.category ? `<div class="project-cat-badge">${p.category}</div>` : ''}
      </div>
      <div class="project-body">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tech">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
        <div class="project-links">
          ${p.github ? `<a href="${p.github}" class="proj-link" onclick="event.stopPropagation()" target="_blank">⬡ GITHUB</a>` : ''}
          ${p.demo ? `<a href="${p.demo}" class="proj-link proj-link-primary" onclick="event.stopPropagation()" target="_blank">▶ DEMO</a>` : ''}
          <span class="proj-link" style="margin-left:auto;border-color:var(--accent);color:var(--accent)">VIEW DETAILS</span>
        </div>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function filterProjects(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('projectsGrid');
  const filtered = cat === 'ALL'
    ? portfolioData.projects
    : portfolioData.projects.filter(p => p.category === cat);
  renderProjectCards(filtered, grid);
}

function openProjectModal(id) {
  const p = portfolioData.projects.find(x => x.id === id);
  if (!p) return;
  const content = document.getElementById('projectModalContent');
  content.innerHTML = `
    ${p.image ? `<img src="${p.image}" class="modal-project-img" alt="${p.title}">` : ''}
    <h2 class="modal-project-title">${p.title}</h2>
    <span class="modal-project-cat">// ${p.category || 'PROJECT'}</span>
    <p class="modal-project-desc">${p.description}</p>
    <div class="modal-section-label">TECHNOLOGY STACK</div>
    <div class="modal-tech">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
    <div class="modal-section-label">LINKS & FILES</div>
    <div class="modal-links">
      ${p.github ? `<a href="${p.github}" class="modal-link modal-link-primary" target="_blank">⬡ VIEW ON GITHUB</a>` : ''}
      ${p.demo ? `<a href="${p.demo}" class="modal-link" target="_blank">▶ LIVE DEMO</a>` : ''}
      ${p.files.map(f => `<a href="${f}" class="modal-link" download>⬇ DOWNLOAD FILE</a>`).join('')}
    </div>
  `;
  openModal('projectModal');
}

function renderCertificates(data) {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;
  grid.innerHTML = data.certificates.map(c => `
    <div class="cert-card reveal" onclick="openCertModal('${c.id}')">
      <div class="cert-img-wrap">
        ${c.image ? `<img src="${c.image}" class="cert-img" alt="${c.title}">` : '<div class="cert-placeholder">🏆</div>'}
        <div class="cert-hover-overlay">[ VIEW CERTIFICATE ]</div>
      </div>
      <div class="cert-body">
        <div class="cert-title">${c.title}</div>
        <div class="cert-issuer">${c.issuer}</div>
        <div class="cert-year">// ${c.year}</div>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function openCertModal(id) {
  const c = portfolioData.certificates.find(x => x.id === id);
  if (!c) return;
  const content = document.getElementById('certModalContent');
  content.innerHTML = `
    ${c.image ? `<img src="${c.image}" class="modal-cert-img" alt="${c.title}">` : ''}
    <h2 class="modal-project-title">${c.title}</h2>
    <span class="modal-project-cat">// ${c.issuer} — ${c.year}</span>
    <div class="modal-links" style="margin-top:1.5rem">
      ${c.pdf ? `<a href="${c.pdf}" class="modal-link modal-link-primary" target="_blank" download>⬇ DOWNLOAD PDF</a>` : ''}
      ${c.image ? `<a href="${c.image}" class="modal-link" target="_blank">🔍 FULL IMAGE</a>` : ''}
    </div>
  `;
  openModal('certModal');
}

function renderTimeline(data) {
  const wrap = document.getElementById('timelineWrap');
  if (!wrap) return;
  wrap.innerHTML = data.timeline.map(t => `
    <div class="timeline-item">
      <div class="timeline-node"></div>
      <div class="timeline-year">// ${t.year}</div>
      <div class="timeline-card">
        <div class="timeline-title">${t.title}</div>
        <div class="timeline-desc">${t.description}</div>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('.timeline-item').forEach(el => timelineObserver.observe(el));
}

function renderContact(data) {
  const c = data.contact;
  const links = document.getElementById('contactLinks');
  if (links) {
    const items = [
      { icon: '✉', label: 'EMAIL', val: c.email, href: `mailto:${c.email}` },
      { icon: '⬡', label: 'GITHUB', val: c.github, href: c.github },
      { icon: '◈', label: 'LINKEDIN', val: c.linkedin, href: c.linkedin },
      { icon: '☎', label: 'PHONE', val: c.phone, href: `tel:${c.phone}` }
    ].filter(i => i.val);

    links.innerHTML = items.map(i => `
      <a href="${i.href}" class="contact-link reveal" target="_blank" rel="noopener">
        <span class="contact-link-icon">${i.icon}</span>
        <div class="contact-link-info">
          <span class="contact-link-label">${i.label}</span>
          <span class="contact-link-val">${i.val}</span>
        </div>
      </a>
    `).join('');
    links.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    if (c.resume) {
      resumeBtn.href = c.resume;
      resumeBtn.style.display = 'flex';
    } else {
      resumeBtn.style.display = 'none';
    }
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── BOOT ──────────────────────────────────────────────────────────────────
async function boot() {
  try {
    const res = await fetch('/api/data');
    portfolioData = await res.json();

    renderAbout(portfolioData);
    renderEducation(portfolioData);
    renderSemesters(portfolioData);
    renderSkills(portfolioData);
    renderProjects(portfolioData);
    renderCertificates(portfolioData);
    renderTimeline(portfolioData);
    renderContact(portfolioData);

    // Update hero stats
    const statVals = document.querySelectorAll('.stat-val');
    if (statVals[0]) statVals[0].textContent = portfolioData.semesters.length + '+';
    if (statVals[1]) statVals[1].textContent = portfolioData.projects.length + '+';
    if (statVals[2]) statVals[2].textContent = portfolioData.certificates.length + '+';

    // Init GSAP after render
    setTimeout(initGSAP, 100);
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
    showToast('// CONNECTION ERROR — RETRYING...');
  }
}

window.addEventListener('DOMContentLoaded', boot);
