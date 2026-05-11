# VALORANT PORTFOLIO PLATFORM
## Yash Kalpesh Mhatre — AI & ML Developer

A cinematic, tactical-UI portfolio platform with secure admin dashboard.

---

## SETUP INSTRUCTIONS

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Access
- **Portfolio**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

---

## DEFAULT CREDENTIALS
```
Username: yash
Password: Valorant@2025
```

⚠️ Change password in `server/server.js` by updating `ADMIN_PASSWORD_HASH`

---

## ARCHITECTURE

```
portfolio-platform/
├── server/
│   ├── server.js          # Express backend + API routes
│   ├── data.json          # All portfolio content (JSON store)
│   └── uploads/
│       ├── projects/      # Project images & files
│       ├── certificates/  # Certificate images & PDFs
│       └── profile/       # Profile photo & resume
├── public/
│   ├── index.html         # Portfolio website
│   ├── style.css          # Valorant tactical UI styles
│   ├── script.js          # Portfolio JS + GSAP animations
│   ├── admin.html         # Admin dashboard
│   └── admin.js           # Admin CRUD operations
└── package.json
```

---

## TECH STACK

| Layer | Tech |
|-------|------|
| Frontend | HTML, CSS, JavaScript, GSAP |
| Backend | Node.js, Express.js |
| File Upload | Multer |
| Authentication | express-session + bcrypt |
| Data Storage | JSON file (no database) |

---

## DESIGN SYSTEM

**Inspired by Valorant's tactical UI**

| Variable | Value |
|----------|-------|
| Background | `#0a0c10` |
| Accent (Red) | `#ff4655` |
| Text | `#ecebe8` |
| Font Display | Orbitron |
| Font Body | Rajdhani |
| Font Mono | Share Tech Mono |

---

## API ENDPOINTS

### Public
- `GET /api/data` — Fetch all portfolio data

### Authentication
- `POST /api/login` — Login
- `POST /api/logout` — Logout
- `GET /api/auth-status` — Check auth status

### Admin (Protected)
- `POST /api/admin/about` — Update about section
- `POST /api/admin/education` — Update education
- `POST /api/admin/semester` — Add semester
- `PUT /api/admin/semester/:id` — Update semester
- `DELETE /api/admin/semester/:id` — Delete semester
- `POST /api/admin/skill` — Add skill
- `DELETE /api/admin/skill/:id` — Delete skill
- `POST /api/admin/project` — Add project
- `PUT /api/admin/project/:id` — Update project
- `DELETE /api/admin/project/:id` — Delete project
- `POST /api/admin/certificate` — Add certificate
- `DELETE /api/admin/certificate/:id` — Delete certificate
- `POST /api/admin/timeline` — Add timeline entry
- `PUT /api/admin/timeline/:id` — Update timeline entry
- `DELETE /api/admin/timeline/:id` — Delete timeline entry
- `POST /api/admin/contact` — Update contact info

---

## FEATURES

✅ Cinematic hero with particle animation  
✅ Valorant-inspired tactical UI design  
✅ GSAP scroll-triggered animations  
✅ Secure admin dashboard with bcrypt auth  
✅ Image / PDF / file upload support  
✅ JSON-based storage (no database)  
✅ Project modal with full details  
✅ Certificate modal viewer  
✅ Interactive timeline  
✅ Project category filters  
✅ Responsive mobile layout  
✅ Session-based authentication  

---

Built with tactical precision. ◈
