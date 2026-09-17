import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import { registerSupabaseUser } from '../services/supabaseService';
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

  const handleLoginFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your username or registered email address');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const isSuperAdminUser = isSuperAdminMode || role === 'SUPER_ADMIN' || cleanUsername === 'superadmin' || cleanUsername === 'bhavik.itmbu@gmail.com' || cleanUsername === 'bhavik.patel@itmbu.ac.in';

    let effectiveRole = isSuperAdminUser ? 'SUPER_ADMIN' : role;
    let displayName = username.trim();

    if (effectiveRole === 'SUPER_ADMIN') {
      displayName = cleanUsername.includes('bhavik') || cleanUsername === 'superadmin' ? 'Bhavikkumar Patel (Super Admin)' : 'Super Admin (Universal)';
    } else if (effectiveRole === 'ORGANIZER') {
      displayName = `${activeClub.shortName} Organizer / Lead`;
    } else if (effectiveRole === 'CO_LEAD') {
      displayName = `${activeClub.shortName} Associate Coordinator`;
    } else if (effectiveRole === 'ADMIN') {
      displayName = `${activeClub.shortName} Section Admin`;
    } else {
      displayName = `${username.trim()} (General Member)`;
    }

    // Process login session with cross-club permissions for Super Admin
    const userSession = {
      username: username.trim(),
      role: effectiveRole,
      organization: isSuperAdminUser ? selectedSection : selectedSection,
      allowedOrgs: effectiveRole === 'SUPER_ADMIN' ? ['AWS_SBG', 'TECHNO_LAB', 'GDGOC'] : [selectedSection],
      displayName: displayName,
      loginTime: new Date().toISOString()
    };

    onLogin(userSession);
  };

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
              <p>Your student profile has been registered in the official ITMBU database. You can now log in using your email.</p>
            </div>
          `,
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Proceed to Sign In 🔑'
        }).then(() => {
          setUsername(regEmail.trim());
          setRole('MEMBER');
          setAuthMode('login');
          setIsSuperAdminMode(false);
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
                if (nextState) {
                  setRole('SUPER_ADMIN');
                  setUsername('superadmin');
                  setPassword('admin123');
                  setAuthMode('login');
                } else {
                  setRole('ORGANIZER');
                  setUsername('');
                  setPassword('');
                }
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
                {isSuperAdminMode ? 'ACTIVE MODE' : 'SEPARATE LOGIN'}
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
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
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
                Central management terminal for multi-chapter administration, roster approvals, and audit trail operations.
              </p>
            </div>
          )}

          {/* Error Message Display */}
          {errorMsg && (
            <div className="auth-error-alert">
              <span className="err-icon">⚠️</span>
              <span>{errorMsg}</span>
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
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <button
                type="submit"
                className="btn-auth-primary-submit"
                style={{
                  background: `linear-gradient(135deg, ${activeClub.primaryColor} 0%, ${activeClub.accentColor || activeClub.primaryColor} 100%)`,
                  color: '#111827',
                  boxShadow: `0 8px 24px ${activeClub.primaryColor}40`
                }}
              >
                🚀 Launch {activeClub.shortName} Portal
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
                    placeholder="superadmin or registered admin email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
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
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#111827',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
                }}
              >
                ⚡ Authenticate Super Admin Master Session
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Footer */}
          <div className="auth-quick-helpers">
            <div className="helpers-header">
              <span>💡 Quick Test Credentials:</span>
            </div>
            <div className="helpers-buttons">
              {!isSuperAdminMode ? (
                <>
                  <button
                    type="button"
                    className="helper-chip chip-lead"
                    onClick={() => {
                      setUsername(selectedSection === 'AWS_SBG' ? 'bhavik.lead' : (selectedSection === 'TECHNO_LAB' ? 'vansham.lead' : 'harshil.lead'));
                      setPassword('lead123');
                      setRole('ORGANIZER');
                      setAuthMode('login');
                    }}
                  >
                    🎖️ {activeClub.shortName} Lead
                  </button>

                  <button
                    type="button"
                    className="helper-chip chip-super"
                    onClick={() => {
                      setIsSuperAdminMode(true);
                      setUsername('superadmin');
                      setPassword('admin123');
                      setRole('SUPER_ADMIN');
                      setAuthMode('login');
                    }}
                  >
                    👑 Super Admin Portal
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="helper-chip chip-super"
                    onClick={() => {
                      setUsername('superadmin');
                      setPassword('admin123');
                    }}
                  >
                    🔑 Quick Fill: superadmin / admin123
                  </button>
                  <button
                    type="button"
                    className="helper-chip chip-return"
                    onClick={() => {
                      setIsSuperAdminMode(false);
                      setUsername('');
                      setPassword('');
                      setRole('ORGANIZER');
                    }}
                  >
                    ← Back to Club Portal
                  </button>
                </>
              )}
            </div>
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
