# AWS SBG & Techno Lab ITMBU - Official Appointment & Offer Letter Generator

An enterprise-grade, dual-organization official appointment letter generator and team roster management portal designed for **AWS Student Builder Group (AWS SBG)** and **Techno Lab** at **ITM (sls) Baroda University**.

---

## ⚡ Multi-Device Real-Time Cloud Synchronization

This application features **multi-client live real-time synchronization**:
- When any client or team leader adds, edits, or deletes a team member on **PC A** (e.g., via a Cloudflare domain, tunnel, or local network), the changes are **instantly synchronized via Supabase PostgreSQL Realtime WebSockets** to **PC B** in real time without needing a manual page refresh.
- **Continuous Background Auto-Sync (15s fallback)** ensures that even across strict proxies, firewalls, or Cloudflare tunnels where WebSocket connections might drop, all connected devices remain 100% in sync.
- **Cloud Departments & Branding Sync**: Custom departments, university logos, and signature vaults are persisted and synchronized across all devices globally.
- **Live Sync Status Badge**: The top navbar shows `⚡ Supabase Cloud (Live)` with pulse feedback and one-click manual refresh.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### 2. Quick Run (Frontend)
```bash
cd offer-letter-genrator
npm install
npm start
```
The application will launch on `http://localhost:3000`.

### 3. (Optional) Run Local MongoDB Backend
```bash
cd Offer-Letter-DB
npm install
npm start
```
The backend API server will run on `http://localhost:5000`.

---

## 🔐 Environment Variables (.env)

Default public cloud credentials are built-in as fallbacks, but you can configure your own via `.env`:

### Frontend (`offer-letter-genrator/.env`)
```env
REACT_APP_SUPABASE_URL=https://hbuhkenlctqefgpqxiah.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_8ng1nrZRN0sP_Kohwj1jjg_mD0ZHsSc
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (`Offer-Letter-DB/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/aws_sbg_itmbu
```

---

## 📦 How to Upload to GitHub Safely

When pushing this project to GitHub:

### Step 1: Verify `.gitignore`
Make sure `.env` files and `node_modules` are ignored (pre-configured in this repository):
```bash
git status
```
Ensure `node_modules/` or sensitive `.env` files do NOT appear in the untracked files list.

### Step 2: Initialize and Push to GitHub
```bash
# In the workspace root directory:
git init
git add .
git commit -m "feat: Dual-club offer letter generator with multi-device realtime cloud sync"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

---

## 🌐 Deploying with Cloudflare / Vercel / Netlify

### Cloudflare Pages / Vercel:
1. **Framework Preset**: Create React App
2. **Root Directory**: `offer-letter-genrator`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Environment Variables**: Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.

---

## 🏛️ Features & Capabilities
- ☁️ **AWS Student Builder Group** & 🔬 **Techno Lab** full dual-roster support
- 📄 **100% Print-Perfect Official Appointment Letters** formatted for standard US Letter & A4
- 👥 **Team Management Suite** with department filtering, role badges, duplicate detection, and CSV export
- 🖨️ **Batch Multi-Letter Generation** for entire departments or custom selected members
- 🎨 **Logos & Digital Signature Vault** for verified official credentials
- ⚡ **Multi-Device Real-Time Sync** powered by Supabase Cloud
