# ⚡ VORTEX — Premium Digital Portfolio

**Founder:** Mrinmoy J. Borah  
**Contact:** +91 1234567890 | xyz2@gmail.com  
**Stack:** Pure HTML/CSS/JS frontend + Node.js/Express backend + SQLite

---

## 📁 Project Structure

```
vortex/
├── index.html          ← Complete frontend (single-file, zero dependencies)
├── server.js           ← Node.js/Express backend
├── package.json        ← Dependencies
├── vortex.db           ← SQLite database (auto-created on first run)
├── public/             ← (optional) Move index.html here for backend serving
└── README.md
```

---

## 🚀 Quick Start

### Option A — Frontend Only (Static)
Just open `index.html` in any browser. Works immediately with localStorage for message storage.

```bash
# Or serve with a simple HTTP server:
npx serve .
# Visit: http://localhost:3000
```

### Option B — Full Stack (Frontend + Backend)

**Requirements:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Move index.html into public folder
mkdir public
cp index.html public/index.html

# 3. Start the server
npm run dev      # development (auto-restart)
npm start        # production

# 4. Visit
# Frontend:  http://localhost:3000
# API:       http://localhost:3000/api/health
```

---

## 🔐 Authentication

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@vortex.com     | vortex123  |

**Admin dashboard:** Click `[ Admin ]` in the footer or "Admin" in the nav.  
Login credentials: `admin` / `vortex123` (demo credentials shown in the modal).

---

## 🌐 API Reference

### Auth
| Method | Route                  | Auth     | Description        |
|--------|------------------------|----------|--------------------|
| POST   | `/api/auth/login`      | Public   | Login, get JWT     |
| POST   | `/api/auth/register`   | Public   | Register new user  |
| GET    | `/api/auth/me`         | Bearer   | Get current user   |

### Contact / Messages
| Method | Route                  | Auth     | Description               |
|--------|------------------------|----------|---------------------------|
| POST   | `/api/contact`         | Public   | Submit contact form        |
| GET    | `/api/messages`        | Admin    | List all messages          |
| GET    | `/api/messages/stats`  | Admin    | Dashboard stats            |
| PATCH  | `/api/messages/:id`    | Admin    | Update message status      |
| DELETE | `/api/messages/:id`    | Admin    | Delete message             |

### Users
| Method | Route         | Auth  | Description       |
|--------|---------------|-------|-------------------|
| GET    | `/api/users`  | Admin | List all users    |

---

## 🌍 Deployment

### Deploy to Vercel (Recommended for static frontend)

```bash
npm install -g vercel
vercel
# Follow prompts — deploy index.html as static site
```

Add `vercel.json` for backend:
```json
{
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

### Deploy to Railway (Full Stack — Recommended)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select repo → Railway auto-detects Node.js
4. Add env variables: `JWT_SECRET=your_secret_here`
5. Your URL will be: `https://vortex-production.up.railway.app`

### Deploy to Render

1. Push to GitHub
2. [render.com](https://render.com) → New Web Service → Connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add env: `JWT_SECRET=your_secret`

### Deploy to Netlify (Frontend only)

```bash
npm install -g netlify-cli
netlify deploy --dir=. --prod
```

### Deploy to Replit

1. Go to [replit.com](https://replit.com) → Create Repl → Import from GitHub
2. Choose Node.js template
3. Click Run — it installs and starts automatically
4. Your URL: `https://vortex.yourusername.repl.co`

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=change_this_to_a_long_random_string_in_production
NODE_ENV=production
```

---

## 🔧 Customization

### Change founder info
Edit directly in `index.html`:
- Name: Search `Mrinmoy J. Borah`
- Phone: Search `1234567890`
- Email: Search `xyz2@gmail.com`
- Location: Search `Guwahati`

### Add your photo
Replace the image placeholder section with:
```html
<img src="your-photo.jpg" alt="Mrinmoy J. Borah" style="width:100%;height:100%;object-fit:cover;">
```

### Change colors
Edit CSS variables in `index.html`:
```css
:root {
  --orange: #FF6B1A;   /* Change to your brand color */
  --blue: #00D4FF;     /* Change accent color */
}
```

### Connect to Supabase (optional)
Replace `better-sqlite3` with the Supabase client:
```bash
npm install @supabase/supabase-js
```
Update `server.js` to use Supabase tables instead of SQLite.

---

## ✨ Features

- [x] Hero section with animated stats counter
- [x] About section with CMS-editable text (click Edit button)
- [x] 6 service cards with hover animations
- [x] 3 testimonial cards
- [x] Contact form → stored in localStorage + backend API
- [x] Admin dashboard (login: admin/vortex123) — view all messages
- [x] Auth modals (login/signup UI)
- [x] AI chatbot placeholder with keyword responses
- [x] Dark/light mode toggle (persists in localStorage)
- [x] Loading animation
- [x] Scroll reveal animations
- [x] Fully responsive (mobile/tablet/desktop)
- [x] SEO meta tags
- [x] Backend: Node.js + Express + SQLite
- [x] JWT authentication
- [x] REST API

---

## 📄 License

MIT — Free to use and modify for personal and commercial projects.

---

*Built with ⚡ by VORTEX*
