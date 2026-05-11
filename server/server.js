const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// ─── Admin credentials (hashed) ────────────────────────────────────────────
const ADMIN_USERNAME = 'yash';
// Password: Valorant@2025
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('Valorant@2025', 10);

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: 'valorant-tactical-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// ─── Multer storage ─────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/projects';
    if (req.path.includes('certificate')) folder = 'uploads/certificates';
    if (req.path.includes('profile')) folder = 'uploads/profile';
    if (req.path.includes('resume')) folder = 'uploads/profile';
    const fullPath = path.join(__dirname, folder);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|zip|rar|tar|gz/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
}
function genId() {
  return Math.random().toString(36).substr(2, 9);
}

// ─── Public API ──────────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => res.json(readData()));

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && await bcrypt.compare(password, ADMIN_PASSWORD_HASH)) {
    req.session.authenticated = true;
    req.session.username = username;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth-status', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

// ─── Admin: About ────────────────────────────────────────────────────────────
app.post('/api/admin/about', requireAuth, upload.single('photo'), (req, res) => {
  const data = readData();
  data.about = {
    ...data.about,
    name: req.body.name || data.about.name,
    title: req.body.title || data.about.title,
    bio: req.body.bio || data.about.bio,
    location: req.body.location || data.about.location,
    tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : data.about.tags,
    photo: req.file ? '/uploads/profile/' + req.file.filename : data.about.photo
  };
  writeData(data);
  res.json({ success: true, data: data.about });
});

// ─── Admin: Education ────────────────────────────────────────────────────────
app.post('/api/admin/education', requireAuth, (req, res) => {
  const data = readData();
  data.education = {
    school: {
      name: req.body.schoolName || data.education.school.name,
      board: req.body.schoolBoard || data.education.school.board,
      year: req.body.schoolYear || data.education.school.year,
      percentage: req.body.schoolPercentage || data.education.school.percentage
    },
    college: {
      name: req.body.collegeName || data.education.college.name,
      course: req.body.collegeCourse || data.education.college.course,
      board: req.body.collegeBoard || data.education.college.board,
      duration: req.body.collegeDuration || data.education.college.duration
    }
  };
  writeData(data);
  res.json({ success: true, data: data.education });
});

// ─── Admin: Semesters ────────────────────────────────────────────────────────
app.post('/api/admin/semester', requireAuth, (req, res) => {
  const data = readData();
  const entry = { id: genId(), semester: parseInt(req.body.semester), percentage: req.body.percentage, status: req.body.status };
  data.semesters.push(entry);
  data.semesters.sort((a, b) => a.semester - b.semester);
  writeData(data);
  res.json({ success: true, entry });
});

app.put('/api/admin/semester/:id', requireAuth, (req, res) => {
  const data = readData();
  const idx = data.semesters.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.semesters[idx] = { ...data.semesters[idx], semester: parseInt(req.body.semester), percentage: req.body.percentage, status: req.body.status };
  writeData(data);
  res.json({ success: true });
});

app.delete('/api/admin/semester/:id', requireAuth, (req, res) => {
  const data = readData();
  data.semesters = data.semesters.filter(s => s.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

// ─── Admin: Skills ───────────────────────────────────────────────────────────
app.post('/api/admin/skill', requireAuth, (req, res) => {
  const data = readData();
  const entry = { id: genId(), name: req.body.name, icon: req.body.icon || '⚡' };
  data.skills.push(entry);
  writeData(data);
  res.json({ success: true, entry });
});

app.delete('/api/admin/skill/:id', requireAuth, (req, res) => {
  const data = readData();
  data.skills = data.skills.filter(s => s.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

// ─── Admin: Projects ─────────────────────────────────────────────────────────
app.post('/api/admin/project', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'files', maxCount: 5 }
]), (req, res) => {
  const data = readData();
  const entry = {
    id: genId(),
    title: req.body.title,
    description: req.body.description,
    tech: req.body.tech ? req.body.tech.split(',').map(t => t.trim()) : [],
    github: req.body.github || '',
    demo: req.body.demo || '',
    category: req.body.category || 'General',
    image: req.files && req.files.image ? '/uploads/projects/' + req.files.image[0].filename : '',
    files: req.files && req.files.files ? req.files.files.map(f => '/uploads/projects/' + f.filename) : []
  };
  data.projects.push(entry);
  writeData(data);
  res.json({ success: true, entry });
});

app.put('/api/admin/project/:id', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'files', maxCount: 5 }
]), (req, res) => {
  const data = readData();
  const idx = data.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const existing = data.projects[idx];
  data.projects[idx] = {
    ...existing,
    title: req.body.title || existing.title,
    description: req.body.description || existing.description,
    tech: req.body.tech ? req.body.tech.split(',').map(t => t.trim()) : existing.tech,
    github: req.body.github || existing.github,
    demo: req.body.demo || existing.demo,
    category: req.body.category || existing.category,
    image: req.files && req.files.image ? '/uploads/projects/' + req.files.image[0].filename : existing.image,
    files: req.files && req.files.files ? [...existing.files, ...req.files.files.map(f => '/uploads/projects/' + f.filename)] : existing.files
  };
  writeData(data);
  res.json({ success: true });
});

app.delete('/api/admin/project/:id', requireAuth, (req, res) => {
  const data = readData();
  data.projects = data.projects.filter(p => p.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

// ─── Admin: Certificates ─────────────────────────────────────────────────────
app.post('/api/admin/certificate', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), (req, res) => {
  const data = readData();
  const entry = {
    id: genId(),
    title: req.body.title,
    issuer: req.body.issuer,
    year: req.body.year,
    image: req.files && req.files.image ? '/uploads/certificates/' + req.files.image[0].filename : '',
    pdf: req.files && req.files.pdf ? '/uploads/certificates/' + req.files.pdf[0].filename : ''
  };
  data.certificates.push(entry);
  writeData(data);
  res.json({ success: true, entry });
});

app.delete('/api/admin/certificate/:id', requireAuth, (req, res) => {
  const data = readData();
  data.certificates = data.certificates.filter(c => c.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

// ─── Admin: Timeline ─────────────────────────────────────────────────────────
app.post('/api/admin/timeline', requireAuth, (req, res) => {
  const data = readData();
  const entry = { id: genId(), year: req.body.year, title: req.body.title, description: req.body.description };
  data.timeline.push(entry);
  data.timeline.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  writeData(data);
  res.json({ success: true, entry });
});

app.put('/api/admin/timeline/:id', requireAuth, (req, res) => {
  const data = readData();
  const idx = data.timeline.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.timeline[idx] = { ...data.timeline[idx], year: req.body.year, title: req.body.title, description: req.body.description };
  writeData(data);
  res.json({ success: true });
});

app.delete('/api/admin/timeline/:id', requireAuth, (req, res) => {
  const data = readData();
  data.timeline = data.timeline.filter(t => t.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

// ─── Admin: Contact ──────────────────────────────────────────────────────────
app.post('/api/admin/contact', requireAuth, upload.single('resume'), (req, res) => {
  const data = readData();
  data.contact = {
    email: req.body.email || data.contact.email,
    github: req.body.github || data.contact.github,
    linkedin: req.body.linkedin || data.contact.linkedin,
    phone: req.body.phone || data.contact.phone,
    resume: req.file ? '/uploads/profile/' + req.file.filename : data.contact.resume
  };
  writeData(data);
  res.json({ success: true, data: data.contact });
});

// ─── Serve HTML files ─────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  VALORANT PORTFOLIO SYSTEM — ONLINE      ║`);
  console.log(`║  http://localhost:${PORT}                   ║`);
  console.log(`║  Admin: http://localhost:${PORT}/admin       ║`);
  console.log(`║  Login: yash / Valorant@2025             ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
});
