# Trio Club Portal • ITM (sls) Baroda University
### Official Appointment & Joining Letter Studio • Multi-Chapter Management Suite

An enterprise-grade, multi-organization official joining letter generator and team management portal designed for **AWS Student Builder Group (AWS SBG)**, **Techno Lab (Techno+Techies Community)**, and **Google Developer Groups on Campus (GDGoC)** at **ITM (sls) Baroda University**.

---

## ⚡ Key Highlights & Capabilities

- ☁️ **AWS Student Builder Group**: Cloud & DevOps chapter roster & official letters.
- 🔬 **Techno Lab (Techno+Techies Community)**: Robotics, IoT & AI innovation chapter administration.
- 🌐 **GDGoC ITMBU**: Google Developer Groups on Campus chapter with authentic Google design language.
- 👑 **Universal Master Command Console**: Centralized institutional oversight & cross-chapter governance.
- 🔐 **Zero-Trust Security & RBAC**: Strict role-based access control, cryptographic verification, and dynamic canvas CAPTCHA anti-bot protection.
- 📄 **Print-Perfect Joining Letters**: Formatted to institutional standards for standard US Letter & A4 with digital signatures and QR verification.
- ⚡ **Multi-Device Real-Time Cloud Synchronization**: Supabase PostgreSQL WebSocket realtime updates with background auto-sync across all clients.

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

Configure your environment variables via `.env` in the frontend directory:

### Frontend (`offer-letter-genrator/.env`)
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-publishable-key
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (`Offer-Letter-DB/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/aws_sbg_itmbu
```

---

## 🛡️ Security Architecture

1. **Anti-Bot Security CAPTCHA**: Dynamic client-rendered canvas with noise injection, skew angles, audio accessibility, and case-insensitive comparison.
2. **Strict RBAC Enforcement**: Role separation across Super Admin, Chapter Leads, Associate Co-Leads, Faculty Mentors, and Student Members.
3. **Secret Isolation**: All credentials, tokens, and database keys are securely managed via environment variables and `.gitignore`.
4. **Zero-Scroll Cinematic Glassmorphic Interface**: Fully responsive viewport fitting `100vh` on all modern displays.

---

## 🌐 Deployment (Vercel / Cloudflare Pages)

1. **Framework Preset**: Create React App / Other
2. **Root Directory**: `offer-letter-genrator`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Environment Variables**: Set `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.

---

## 🏛️ Institution & Department

**Department of Computer Science & Engineering**  
ITM (sls) Baroda University, Vadodara, Gujarat, India  
*"Think Big... Think Beyond"*
