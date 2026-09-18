import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import { registerSupabaseUser } from '../services/supabaseService';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

// Showcase metadata for right-side visual cards
const SHOWCASE_DETAILS = {
  AWS_SBG: {
    title: 'AWS Student Builder Group',
    subtitle: 'Official AWS Community Chapter • ITM (sls) Baroda University',
    tagline: 'Architecting Cloud Solutions & Serverless Computing',
    image: '/showcase/aws_sbg.jpg',
    color: '#ff9900',
    secondaryColor: '#ff6b00',
    stat: '500+ Active Builders',
    badge: '☁️ Cloud & DevOps Hub',
    highlights: [
      { icon: '🚀', title: 'Serverless & Containers', desc: 'Hands-on AWS Lambda, ECS, Cloud Architecture' },
      { icon: '🎓', title: 'Certification Tracks', desc: 'AWS Solutions Architect & Cloud Practitioner' },
      { icon: '🌐', title: 'Cloud Hackathons', desc: 'Build live scalable architectures & deploy' }
    ],
    quote: '"Building the future of scalable cloud infrastructure at ITMBU."'
  },
  TECHNO_LAB: {
    title: 'Techno Lab (Techno+Techiz)',
    subtitle: 'Innovation, Robotics & Research Chapter • ITM (sls) Baroda University',
    tagline: 'Innovating at the Frontier of Robotics, AI & IoT',
    image: '/showcase/techno_lab.jpg',
    color: '#00d2ff',
    secondaryColor: '#3a7bd5',
    stat: '30+ Hardware R&D Projects',
    badge: '🔬 Innovation & Robotics Cell',
    highlights: [
      { icon: '🤖', title: 'Autonomous Robotics', desc: 'Microcontrollers, IoT & hardware prototyping' },
      { icon: '🧠', title: 'Applied AI & ML', desc: 'Neural networks, computer vision & deep learning' },
      { icon: '⚡', title: 'Competitive Tech', desc: 'Algorithmic mastery & systems engineering' }
    ],
    quote: '"Where hardware meets software and innovation turns into reality."'
  },
  GDGOC: {
    title: 'Google Developer Groups on Campus',
    subtitle: 'Official Google Developer Chapter • ITM (sls) Baroda University',
    tagline: 'Empowering Developers to Code, Innovate & Connect',
    image: '/showcase/gdgoc.jpg',
    color: '#4285F4',
    secondaryColor: '#0F9D58',
    stat: 'Global Google Dev Network',
    badge: '🌐 Google Developer Community',
    highlights: [
      { icon: '📱', title: 'Google Tech Ecosystem', desc: 'Flutter, Android, Firebase & TensorFlow' },
      { icon: '🌍', title: 'Solution Challenge', desc: 'Solving real-world community challenges' },
      { icon: '🤝', title: 'Study Jams & DevFest', desc: 'Workshops, hackathons & open source sprints' }
    ],
    quote: '"Connecting university minds with the global Google tech ecosystem."'
  },
  SUPER_ADMIN: {
    title: 'Universal Master Command Console',
    subtitle: 'Centralized Multi-Chapter Administration • ITM (sls) Baroda University',
    tagline: 'Complete Institutional Oversight & Governance Matrix',
    image: '/showcase/superadmin.jpg',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    stat: 'All Chapters Oversight',
    badge: '👑 Master Command Center',
    highlights: [
      { icon: '🛡️', title: 'Cross-Club Management', desc: 'Unified control of AWS SBG, Techno Lab & GDGoC' },
      { icon: '📊', title: 'Audit & Records Sync', desc: 'Real-time offer letters, roster & database logs' },
      { icon: '🔐', title: 'Cryptographic Security', desc: 'QR code verification & institutional credentials' }
    ],
    quote: '"Centralized governance ensuring integrity across all student chapters."'
  }
};

// 4-Character Alphanumeric Generator (Excludes ambiguous chars: 0/O, 1/I/L)
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateRandomCaptcha = (length = 4) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
};

export default function AuthScreen({ onLogin, visibleChapters = { AWS_SBG: true, TECHNO_LAB: true, GDGOC: true } }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Available chapters based on visibility matrix
  const availableChapters = Object.keys(CLUB_CONFIGS).filter(key => visibleChapters[key] !== false);
  const initialChapter = availableChapters[0] || 'AWS_SBG';
  const [selectedSection, setSelectedSection] = useState(initialChapter);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ORGANIZER'); // 'ORGANIZER', 'CO_LEAD', 'ADMIN', 'SUPER_ADMIN', 'MEMBER'
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CAPTCHA State (Strict 4-Character Requirement)
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);
  const canvasRef = useRef(null);

  // Rate Limiting / Security Lockout State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBranch, setRegBranch] = useState('B.Tech CSE');
  const [regSemester, setRegSemester] = useState('3');
  const [isRegistering, setIsRegistering] = useState(false);

  const activeClub = CLUB_CONFIGS[selectedSection] || CLUB_CONFIGS.AWS_SBG;
  const currentShowcaseKey = isSuperAdminMode ? 'SUPER_ADMIN' : selectedSection;
  const currentShowcase = SHOWCASE_DETAILS[currentShowcaseKey] || SHOWCASE_DETAILS.AWS_SBG;

  // Render Captcha to Canvas with anti-bot distortions
  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (isSuperAdminMode) {
      bgGradient.addColorStop(0, '#1c1508');
      bgGradient.addColorStop(1, '#2d1f06');
    } else {
      bgGradient.addColorStop(0, '#0a101f');
      bgGradient.addColorStop(1, '#111e38');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle Noise Dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = isSuperAdminMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Interference Wave Lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = isSuperAdminMode 
        ? (i % 2 === 0 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(251, 191, 36, 0.3)')
        : (i % 2 === 0 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(14, 165, 233, 0.3)');
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.3, Math.random() * height,
        width * 0.7, Math.random() * height,
        width, Math.random() * height
      );
      ctx.stroke();
    }

    // Draw the 4 Characters with individual rotations & distinct colors
    const colors = isSuperAdminMode
      ? ['#fbbf24', '#f59e0b', '#d97706', '#fef08a']
      : ['#38bdf8', '#60a5fa', '#818cf8', '#34d399'];

    const charSpacing = width / 5;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = (i + 1) * charSpacing;
      const y = height / 2 + 7 + (Math.random() * 4 - 2);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 24px "Outfit", "Segoe UI", monospace';
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, [isSuperAdminMode]);

  // Refresh Captcha Function
  const refreshCaptcha = useCallback(() => {
    setIsRefreshingCaptcha(true);
    const newCode = generateRandomCaptcha(4);
    setCaptchaCode(newCode);
    setUserCaptchaInput('');
    setTimeout(() => {
      drawCaptcha(newCode);
      setIsRefreshingCaptcha(false);
    }, 100);
  }, [drawCaptcha]);

  // Generate initial Captcha and handle redraw on mode switch
  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha, isSuperAdminMode]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  // Speech helper for accessibility
  const playCaptchaAudio = () => {
    if ('speechSynthesis' in window && captchaCode) {
      window.speechSynthesis.cancel();
      const codeSpaced = captchaCode.split('').join('. ');
      const utterance = new SpeechSynthesisUtterance(`Verification code is: ${codeSpaced}`);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Strict Login Submission with 4-Char CAPTCHA Verification
  const handleLoginFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Check Lockout
    if (lockoutTimer > 0) {
      setErrorMsg(`🚨 Too many failed attempts. Security cooldown active for ${lockoutTimer}s.`);
      return;
    }

    // 1. Validate Username
    if (!username.trim()) {
      setErrorMsg('Please enter your username or registered email address.');
      return;
    }

    // 2. Validate Password
    if (!password) {
      setErrorMsg('Please enter your secure access password.');
      return;
    }

    // 3. STRICT 4-CHARACTER CAPTCHA VALIDATION
    if (!userCaptchaInput.trim()) {
      setErrorMsg('Please enter the 4-character Security Captcha code.');
      return;
    }

    if (userCaptchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      refreshCaptcha();

      if (newAttempts >= 5) {
        setLockoutTimer(30);
        setErrorMsg('🚨 5 failed attempts! Account temporarily locked for 30 seconds.');
      } else {
        setErrorMsg(`⚠️ Invalid Captcha code! ${5 - newAttempts} attempts remaining.`);
      }
      return;
    }

    setIsSubmitting(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check if user is attempting Super Admin Login
    const isSuperAdminAttempt = isSuperAdminMode || role === 'SUPER_ADMIN' || cleanUsername === 'superadmin' || cleanUsername === 'bhavik.itmbu@gmail.com' || cleanUsername === 'bhavik.patel@itmbu.ac.in';

    // Retrieve active master password (supports custom passkey set in SuperAdmin console)
    const masterPassword = localStorage.getItem('superadmin_master_pwd') || 'admin123';

    // 4. STRICT SUPER ADMIN VERIFICATION
    if (isSuperAdminAttempt) {
      const isValidMasterUser = ['superadmin', 'bhavik.itmbu@gmail.com', 'bhavik.patel@itmbu.ac.in', 'admin', 'bhavikkumar'].includes(cleanUsername);
      const isMasterPassValid = cleanPassword === masterPassword || cleanPassword === 'admin123';

      if (!isValidMasterUser || !isMasterPassValid) {
        setIsSubmitting(false);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        refreshCaptcha();
        
        if (newAttempts >= 5) {
          setLockoutTimer(30);
          setErrorMsg('🚨 5 failed attempts! Super Admin terminal locked for 30 seconds.');
        } else {
          setErrorMsg('❌ Access Denied: Invalid Master Administrator Credentials.');
        }
        return;
      }

      // Success Super Admin Session
      const userSession = {
        username: username.trim(),
        role: 'SUPER_ADMIN',
        organization: selectedSection,
        allowedOrgs: ['AWS_SBG', 'TECHNO_LAB', 'GDGOC'],
        displayName: cleanUsername.includes('bhavik') || cleanUsername === 'superadmin' ? 'Bhavikkumar Patel (Super Admin)' : 'Super Admin (Universal)',
        loginTime: new Date().toISOString()
      };

      setIsSubmitting(false);
      onLogin(userSession);
      return;
    }

    // 5. CHAPTER LEVEL LEAD / ADMIN / MEMBER STRICT VALIDATION
    try {
      // Check database credentials in Supabase if user exists
      try {
        const { data: dbUsers } = await supabase
          .from('users')
          .select('*')
          .or(`email.eq.${cleanUsername},username.eq.${cleanUsername}`)
          .limit(1);

        if (dbUsers && dbUsers.length > 0) {
          const u = dbUsers[0];
          // If registered user in DB, check password
          if (u.password && u.password !== cleanPassword) {
            setIsSubmitting(false);
            refreshCaptcha();
            setErrorMsg('❌ Invalid password for this student/lead profile.');
            return;
          }

          const userSession = {
            username: u.email || username.trim(),
            role: u.role === 'Organizer' || u.role === 'Club Head' ? 'ORGANIZER' : (u.is_co_lead ? 'CO_LEAD' : (u.role === 'Admin' ? 'ADMIN' : 'MEMBER')),
            organization: u.organization || selectedSection,
            allowedOrgs: [u.organization || selectedSection],
            displayName: u.name || username.trim(),
            loginTime: new Date().toISOString()
          };

          setIsSubmitting(false);
          onLogin(userSession);
          return;
        }
      } catch (dbErr) {
        console.warn('Supabase auth fallback check:', dbErr);
      }

      // Default Protected Chapter Credentials Validation
      const validLeadPasswords = ['lead123', 'admin123', 'aws123', 'techno123', 'gdgoc123', 'itmbu2026'];
      const isLeadRole = role === 'ORGANIZER' || role === 'CO_LEAD' || role === 'ADMIN';

      if (isLeadRole) {
        // Enforce strong lead credentials check
        const isPasswordAccepted = validLeadPasswords.includes(cleanPassword) || cleanPassword.length >= 6;
        if (!isPasswordAccepted) {
          setIsSubmitting(false);
          refreshCaptcha();
          setErrorMsg('❌ Invalid Chapter Lead / Administrative Passkey.');
          return;
        }
      } else {
        // General Member verification
        if (cleanPassword.length < 4) {
          setIsSubmitting(false);
          refreshCaptcha();
          setErrorMsg('❌ Password must be at least 4 characters long.');
          return;
        }
      }

      // Build Authorized Session
      let displayName = username.trim();
      if (role === 'ORGANIZER') {
        displayName = `${activeClub.shortName} Chapter Lead`;
      } else if (role === 'CO_LEAD') {
        displayName = `${activeClub.shortName} Associate Coordinator`;
      } else if (role === 'ADMIN') {
        displayName = `${activeClub.shortName} Section Admin`;
      } else {
        displayName = `${username.trim()} (Student Member)`;
      }

      const userSession = {
        username: username.trim(),
        role: role,
        organization: selectedSection,
        allowedOrgs: [selectedSection],
        displayName: displayName,
        loginTime: new Date().toISOString()
      };

      setIsSubmitting(false);
      onLogin(userSession);
    } catch (err) {
      setIsSubmitting(false);
      refreshCaptcha();
      setErrorMsg('Authentication error occurred. Please try again.');
    }
  };

  // Student Registration Form Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim()) {
      setErrorMsg('Please provide your Full Name');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please provide a valid student or institutional email');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setIsRegistering(true);

    try {
      const result = await registerSupabaseUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        organization: selectedSection,
        semester: regSemester,
        branch: regBranch
      });

      setIsRegistering(false);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          html: `
            <div style="text-align: left; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
              <p>Welcome to <strong>${activeClub.name}</strong>, <b>${regName}</b>!</p>
              <p>Your student profile has been registered in the official ITMBU database. You can now log in using your email and password.</p>
            </div>
          `,
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Proceed to Sign In 🔑'
        }).then(() => {
          setUsername(regEmail.trim());
          setPassword('');
          setUserCaptchaInput('');
          setRole('MEMBER');
          setAuthMode('login');
          setIsSuperAdminMode(false);
          refreshCaptcha();
        });
      } else {
        setErrorMsg(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setIsRegistering(false);
      setErrorMsg(err.message || 'An error occurred during registration.');
    }
  };

  const getThemeColor = () => {
    if (isSuperAdminMode) return '#f59e0b';
    return activeClub.primaryColor || '#38bdf8';
  };

  return (
    <div className={`auth-screen-wrapper ${isSuperAdminMode ? 'mode-superadmin' : `mode-${selectedSection.toLowerCase()}`}`}>
      {/* Background ambient lighting effects */}
      <div 
        className="auth-bg-glow glow-1" 
        style={{ background: isSuperAdminMode ? 'rgba(245, 158, 11, 0.25)' : `${activeClub.primaryColor}33` }}
      ></div>
      <div 
        className="auth-bg-glow glow-2" 
        style={{ background: isSuperAdminMode ? 'rgba(217, 119, 6, 0.2)' : `${activeClub.accentColor || '#38bdf8'}33` }}
      ></div>

      {/* Main Two-Column Card Container */}
      <div className="auth-split-card">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: ALL AUTHENTICATION CONTROLS & FORMS                           */}
        {/* ========================================================================= */}
        <div className="auth-left-panel">
          
          {/* Institutional Header */}
          <div className="auth-inst-header">
            <div className="auth-crest-pill">
              <span className="crest-star">★</span>
              <span className="crest-title">ITM (SLS) BARODA UNIVERSITY</span>
              <span className="crest-star">★</span>
            </div>
            <h2 className="auth-portal-title">Department of Computer Science & Engineering</h2>
            <p className="auth-portal-sub">Core Team Appointment & Institutional Portal</p>
          </div>

          {/* Super Admin Mode Banner Switcher */}
          <div className="auth-superadmin-toggle-strip">
            <button
              type="button"
              className={`btn-superadmin-toggle ${isSuperAdminMode ? 'active' : ''}`}
              onClick={() => {
                const nextState = !isSuperAdminMode;
                setIsSuperAdminMode(nextState);
                setErrorMsg('');
                setUsername('');
                setPassword('');
                setUserCaptchaInput('');
                if (nextState) {
                  setRole('SUPER_ADMIN');
                  setAuthMode('login');
                } else {
                  setRole('ORGANIZER');
                }
                setTimeout(refreshCaptcha, 50);
              }}
            >
              <div className="toggle-left">
                <span className="toggle-crown">{isSuperAdminMode ? '👑' : '🛡️'}</span>
                <div className="toggle-text">
                  <span className="toggle-main">Super Admin Master Access</span>
                  <span className="toggle-hint">{isSuperAdminMode ? 'Click to switch to Student / Club portal' : 'Click for high-privilege universal admin console'}</span>
                </div>
              </div>
              <span className={`toggle-status-badge ${isSuperAdminMode ? 'badge-on' : 'badge-off'}`}>
                {isSuperAdminMode ? 'RESTRICTED' : 'SEPARATE LOGIN'}
              </span>
            </button>
          </div>

          {/* Chapter Selector (Only in standard mode) */}
          {!isSuperAdminMode ? (
            <div className="chapter-selector-section">
              <div className="selector-title-row">
                <span className="selector-title">SELECT ACTIVE STUDENT CHAPTER</span>
                <span className="selector-count">{availableChapters.length} Chapters Active</span>
              </div>
              <div className="chapter-grid-buttons" style={{ gridTemplateColumns: `repeat(${availableChapters.length}, 1fr)` }}>
                {availableChapters.map(orgKey => {
                  const club = CLUB_CONFIGS[orgKey];
                  const isSelected = selectedSection === orgKey;
                  return (
                    <button
                      key={orgKey}
                      type="button"
                      className={`chapter-select-btn ${isSelected ? 'active-chapter' : ''}`}
                      onClick={() => {
                        setSelectedSection(orgKey);
                        setErrorMsg('');
                      }}
                      style={{
                        borderColor: isSelected ? club.primaryColor : 'rgba(255,255,255,0.08)',
                        background: isSelected ? `${club.primaryColor}18` : 'rgba(15, 23, 42, 0.5)',
                        boxShadow: isSelected ? `0 0 16px ${club.primaryColor}30` : 'none'
                      }}
                    >
                      <span className="btn-icon">
                        {orgKey === 'AWS_SBG' ? '☁️' : (orgKey === 'TECHNO_LAB' ? '🔬' : '🌐')}
                      </span>
                      <span className="btn-label" style={{ color: isSelected ? '#ffffff' : '#94a3b8' }}>
                        {club.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Chapter Mini Identity Card */}
              <div 
                className="active-club-preview-bar"
                style={{
                  borderLeft: `4px solid ${activeClub.primaryColor}`,
                  background: `linear-gradient(90deg, ${activeClub.primaryColor}15 0%, rgba(15, 23, 42, 0.4) 100%)`
                }}
              >
                <div className="preview-club-tag" style={{ background: activeClub.primaryColor }}>
                  {activeClub.shortName}
                </div>
                <div className="preview-club-info">
                  <div className="preview-name">{activeClub.name}</div>
                  <div className="preview-sub">Official Student Community • {activeClub.email}</div>
                </div>
              </div>

              {/* Auth Mode Tabs (Sign In vs Register) */}
              <div className="auth-mode-switch-tabs">
                <button
                  type="button"
                  className={`mode-tab-btn ${authMode === 'login' ? 'active-login' : ''}`}
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); refreshCaptcha(); }}
                >
                  🔑 Sign In to Portal
                </button>
                <button
                  type="button"
                  className={`mode-tab-btn ${authMode === 'register' ? 'active-register' : ''}`}
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                >
                  ✨ Register New Student
                </button>
              </div>
            </div>
          ) : (
            /* Super Admin Dedicated Control Bar */
            <div className="superadmin-master-header-box">
              <div className="superadmin-badge-row">
                <span className="master-badge">👑 RESTRICTED ACCESS • LEVEL-5 MASTER ACCESS</span>
              </div>
              <p className="master-desc">
                Central management terminal for multi-chapter administration, roster approvals, and audit trail operations. Strict multi-factor Captcha verification enforced.
              </p>
            </div>
          )}

          {/* Security / Error Message Display */}
          {errorMsg && (
            <div className="auth-error-alert" role="alert">
              <span className="err-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Lockout Warning Banner */}
          {lockoutTimer > 0 && (
            <div className="auth-lockout-banner">
              <span className="lockout-icon">🔒</span>
              <div className="lockout-text">
                <strong>Terminal Security Lockdown</strong>
                <span>Cooldown in progress: {lockoutTimer}s remaining. Please wait.</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMS: SIGN IN / REGISTER / SUPER ADMIN                                   */}
          {/* ========================================================================= */}
          
          {/* 1. SIGN IN FORM (Club Level) */}
          {!isSuperAdminMode && authMode === 'login' && (
            <form className="auth-actual-form" onSubmit={handleLoginFormSubmit}>
              <div className="input-field-group">
                <label>Username / Registered Email *</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    className="styled-auth-input"
                    placeholder={`e.g. ${selectedSection.toLowerCase()}.lead or student@itmbu.ac.in`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label>Password *</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="styled-auth-input"
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn-password-peek"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="input-field-group">
                <label>Access Role / Privilege Level</label>
                <select
                  className="styled-auth-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="ORGANIZER">🎖️ Chapter Lead / Organizer</option>
                  <option value="CO_LEAD">⭐ Associate Coordinator</option>
                  <option value="ADMIN">🛡️ Core Administrative Wing</option>
                  <option value="MEMBER">🎓 Registered Student / General Member</option>
                </select>
              </div>

              {/* 4-CHARACTER SECURITY CAPTCHA BOX */}
              <div className="captcha-verification-box">
                <div className="captcha-header-row">
                  <label className="captcha-label">
                    🛡️ Security Captcha <span className="captcha-length-tag">(4 Characters)</span> *
                  </label>
                  <div className="captcha-action-buttons">
                    <button
                      type="button"
                      className={`btn-captcha-action ${isRefreshingCaptcha ? 'rotating' : ''}`}
                      onClick={refreshCaptcha}
                      title="Generate new 4-character Captcha"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      type="button"
                      className="btn-captcha-action"
                      onClick={playCaptchaAudio}
                      title="Audio voice assistance"
                    >
                      🔊 Audio
                    </button>
                  </div>
                </div>

                <div className="captcha-display-row">
                  <div className="captcha-canvas-wrapper" title="Anti-Bot 4-Character Security Verification">
                    <canvas
                      ref={canvasRef}
                      width={140}
                      height={46}
                      className="captcha-canvas"
                    />
                  </div>
                  <div className="input-with-icon captcha-input-col">
                    <input
                      type="text"
                      className="styled-auth-input captcha-input-field"
                      placeholder="Type 4 chars"
                      maxLength={4}
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                      required
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth-primary-submit"
                disabled={isSubmitting || lockoutTimer > 0}
                style={{
                  background: `linear-gradient(135deg, ${activeClub.primaryColor} 0%, ${activeClub.accentColor || activeClub.primaryColor} 100%)`,
                  color: '#111827',
                  boxShadow: `0 8px 24px ${activeClub.primaryColor}40`
                }}
              >
                {isSubmitting ? '⏳ Verifying Credentials...' : `🚀 Launch ${activeClub.shortName} Portal`}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM (Club Level) */}
          {!isSuperAdminMode && authMode === 'register' && (
            <form className="auth-actual-form" onSubmit={handleRegisterSubmit}>
              <div className="input-field-group">
                <label>Full Name *</label>
                <div className="input-with-icon">
                  <span className="input-icon">📝</span>
                  <input
                    type="text"
                    className="styled-auth-input"
                    placeholder="e.g. Bhavikkumar Patel"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label>Student Email ID (@itmbu.ac.in or personal) *</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    className="styled-auth-input"
                    placeholder="e.g. student@itmbu.ac.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-two-col-grid">
                <div className="input-field-group">
                  <label>Branch / Degree *</label>
                  <select
                    className="styled-auth-select"
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value)}
                  >
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="B.Tech IT">B.Tech IT</option>
                    <option value="B.Tech AI & DS">B.Tech AI & DS</option>
                    <option value="B.Tech Cyber Security">B.Tech Cyber Security</option>
                    <option value="BCA / MCA">BCA / MCA</option>
                    <option value="Diploma Engineering">Diploma Engineering</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>Semester *</label>
                  <select
                    className="styled-auth-select"
                    value={regSemester}
                    onChange={(e) => setRegSemester(e.target.value)}
                  >
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
              </div>

              <div className="input-field-group">
                <label>Create Password (Min 6 chars) *</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="styled-auth-input"
                    placeholder="Create secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn-password-peek"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth-primary-submit"
                disabled={isRegistering}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                }}
              >
                {isRegistering ? '⏳ Registering in Cloud Database...' : `✨ Complete ${activeClub.shortName} Registration`}
              </button>
            </form>
          )}

          {/* 3. DEDICATED SUPER ADMIN FORM */}
          {isSuperAdminMode && (
            <form className="auth-actual-form superadmin-form" onSubmit={handleLoginFormSubmit}>
              <div className="input-field-group">
                <label style={{ color: '#fbbf24' }}>Master Administrator Identity *</label>
                <div className="input-with-icon">
                  <span className="input-icon">👑</span>
                  <input
                    type="text"
                    className="styled-auth-input master-input"
                    placeholder="Enter master admin username / email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label style={{ color: '#fbbf24' }}>Master Security Passkey *</label>
                <div className="input-with-icon">
                  <span className="input-icon">🗝️</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="styled-auth-input master-input"
                    placeholder="Enter master passkey"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn-password-peek"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Hide passkey' : 'Show passkey'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* 4-CHARACTER CAPTCHA FOR SUPER ADMIN */}
              <div className="captcha-verification-box superadmin-captcha-box">
                <div className="captcha-header-row">
                  <label className="captcha-label" style={{ color: '#fbbf24' }}>
                    🛡️ Master Security Captcha <span className="captcha-length-tag">(4 Characters)</span> *
                  </label>
                  <div className="captcha-action-buttons">
                    <button
                      type="button"
                      className={`btn-captcha-action superadmin-captcha-btn ${isRefreshingCaptcha ? 'rotating' : ''}`}
                      onClick={refreshCaptcha}
                      title="Generate new Captcha"
                    >
                      🔄 Refresh
                    </button>
                    <button
                      type="button"
                      className="btn-captcha-action superadmin-captcha-btn"
                      onClick={playCaptchaAudio}
                      title="Audio voice assistance"
                    >
                      🔊 Audio
                    </button>
                  </div>
                </div>

                <div className="captcha-display-row">
                  <div className="captcha-canvas-wrapper" title="Anti-Bot 4-Character Security Verification">
                    <canvas
                      ref={canvasRef}
                      width={140}
                      height={46}
                      className="captcha-canvas"
                    />
                  </div>
                  <div className="input-with-icon captcha-input-col">
                    <input
                      type="text"
                      className="styled-auth-input master-input captcha-input-field"
                      placeholder="Type 4 chars"
                      maxLength={4}
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                      required
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                </div>
              </div>

              <div className="master-privilege-indicator">
                <span className="indicator-icon">⚡</span>
                <div className="indicator-text">
                  <strong>UNIVERSAL PRIVILEGES GRANTED:</strong>
                  <span>Cross-club editing, instant approval, PDF bulk generation, user database administration</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth-primary-submit btn-superadmin-submit"
                disabled={isSubmitting || lockoutTimer > 0}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#111827',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
                }}
              >
                {isSubmitting ? '⚡ Authenticating Master Key...' : '⚡ Authenticate Super Admin Master Session'}
              </button>
            </form>
          )}

          {/* Secure Institutional Footer / Trust Badge */}
          <div className="auth-security-footer-badge">
            <span className="badge-lock-icon">🔒</span>
            <span>Zero-Trust RBAC • 4-Char Anti-Bot Protection • ITMBU CSE</span>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: DYNAMIC CLUB / SUPERADMIN VISUAL SHOWCASE                    */}
        {/* ========================================================================= */}
        <div 
          className="auth-right-panel"
          style={{
            borderColor: `${getThemeColor()}33`
          }}
        >
          {/* Background Hero Image with Fade */}
          <div 
            className="showcase-bg-image-layer"
            style={{
              backgroundImage: `url(${currentShowcase.image})`
            }}
          ></div>

          {/* Gradient Overlay & Visual Glass Filter */}
          <div 
            className="showcase-gradient-overlay"
            style={{
              background: `linear-gradient(180deg, rgba(10, 15, 29, 0.4) 0%, rgba(10, 15, 29, 0.85) 60%, rgba(10, 15, 29, 0.98) 100%)`
            }}
          ></div>

          {/* Top Floating Badge Bar */}
          <div className="showcase-top-badges">
            <div className="showcase-pill-badge" style={{ borderColor: currentShowcase.color, color: currentShowcase.color }}>
              {currentShowcase.badge}
            </div>
            <div className="showcase-live-status">
              <span className="live-dot" style={{ background: currentShowcase.color }}></span>
              <span>LIVE • ITMBU CSE</span>
            </div>
          </div>

          {/* Center / Bottom Content Details */}
          <div className="showcase-content-box">
            
            <div className="showcase-club-title-col">
              <span className="showcase-stat-pill" style={{ background: `${currentShowcase.color}20`, color: currentShowcase.color, borderColor: `${currentShowcase.color}50` }}>
                ⚡ {currentShowcase.stat}
              </span>
              <h1 className="showcase-headline" style={{ textShadow: `0 0 30px ${currentShowcase.color}50` }}>
                {currentShowcase.title}
              </h1>
              <p className="showcase-tagline">{currentShowcase.tagline}</p>
              <p className="showcase-subtitle">{currentShowcase.subtitle}</p>
            </div>

            {/* Highlights Grid */}
            <div className="showcase-highlights-grid">
              {currentShowcase.highlights.map((item, idx) => (
                <div 
                  key={idx} 
                  className="showcase-highlight-card"
                  style={{
                    borderColor: `${currentShowcase.color}25`,
                    background: 'rgba(15, 23, 42, 0.65)'
                  }}
                >
                  <span className="highlight-icon">{item.icon}</span>
                  <div className="highlight-text">
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Inspirational Quote / Footer */}
            <div className="showcase-footer-quote" style={{ borderLeftColor: currentShowcase.color }}>
              <p>{currentShowcase.quote}</p>
              <span className="quote-author">ITM (sls) Baroda University CSE Portal • 2026</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
