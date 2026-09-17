import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import { registerSupabaseUser } from '../services/supabaseService';
import Swal from 'sweetalert2';

export default function AuthScreen({ onLogin, visibleChapters = { AWS_SBG: true, TECHNO_LAB: true, GDGOC: true } }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
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

  const handleLoginFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your username or registered email address');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const isSuperAdminUser = role === 'SUPER_ADMIN' || cleanUsername === 'superadmin' || cleanUsername === 'bhavik.itmbu@gmail.com' || cleanUsername === 'bhavik.patel@itmbu.ac.in';

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
      organization: selectedSection,
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
        });
      } else {
        setErrorMsg(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setIsRegistering(false);
      setErrorMsg(err.message || 'An error occurred during registration.');
    }
  };


  const getBannerClass = (orgId) => {
    if (orgId === 'AWS_SBG') return 'banner-aws';
    if (orgId === 'TECHNO_LAB') return 'banner-techno';
    return 'banner-gdgoc';
  };

  return (
    <div className="auth-wrapper">
      {/* Background ambient lighting effects */}
      <div className="auth-bg-glow glow-1"></div>
      <div className="auth-bg-glow glow-2"></div>

      <div className="auth-card-container">
        
        {/* Header Branding */}
        <div className="auth-university-crest">
          <div className="crest-badge">ITM (sls) BARODA UNIVERSITY</div>
          <p className="crest-sub">Official Core Team Joining Letter & Administration Portal</p>
        </div>

        {/* SECTION SELECTION BUTTONS */}
        <div className="section-slider-wrapper">
          <label className="slider-label">SELECT CHAPTER / SECTION TO ACCESS</label>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${availableChapters.length}, 1fr)`, gap: '8px', background: '#0a0f1d', padding: '6px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            {availableChapters.map(orgKey => {
              const club = CLUB_CONFIGS[orgKey];
              const isSelected = selectedSection === orgKey;
              return (
                <button
                  key={orgKey}
                  type="button"
                  onClick={() => {
                    setSelectedSection(orgKey);
                    setErrorMsg('');
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: isSelected ? `1px solid ${club.primaryColor || '#38bdf8'}` : '1px solid transparent',
                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>
                    {orgKey === 'AWS_SBG' ? '☁️' : (orgKey === 'TECHNO_LAB' ? '🔬' : '🌐')}
                  </span>
                  <span>{club.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Club Badge Banner */}
        <div className={`active-club-badge-banner ${getBannerClass(selectedSection)}`} style={{ borderColor: activeClub.primaryColor }}>
          <div className="banner-logo-tag" style={{ background: activeClub.primaryColor }}>
            {activeClub.shortName}
          </div>
          <div className="banner-text-details">
            <h4>{activeClub.name}</h4>
            <span>Official Student Community • {activeClub.email}</span>
          </div>
        </div>

        {/* Auth Mode Tab Switcher: Sign In vs Register New User */}
        <div className="auth-mode-tabs-container" style={{ display: 'flex', gap: '8px', margin: '14px 0 18px 0' }}>
          <button
            type="button"
            className={`btn-auth-mode-tab ${authMode === 'login' ? 'active-mode' : ''}`}
            onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: authMode === 'login' ? '1px solid #38bdf8' : '1px solid #1e293b',
              background: authMode === 'login' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.6)',
              color: authMode === 'login' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔑 Sign In
          </button>
          
          <button
            type="button"
            className={`btn-auth-mode-tab ${authMode === 'register' ? 'active-mode' : ''}`}
            onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: authMode === 'register' ? '1px solid #10b981' : '1px solid #1e293b',
              background: authMode === 'register' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)',
              color: authMode === 'register' ? '#10b981' : '#94a3b8',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ Register New Student
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-banner" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {authMode === 'login' && (
          <form className="auth-form" onSubmit={handleLoginFormSubmit}>
            <div className="auth-form-group">
              <label>Username / Registered Email *</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. superadmin or bhavik.itmbu@gmail.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-group">
              <label>Password *</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="auth-form-group">
              <label>Access Role / Privilege Level</label>
              <select
                className="auth-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="SUPER_ADMIN">👑 Super Admin (Universal Master - All Chapters)</option>
                <option value="ORGANIZER">🎖️ Chapter Lead / Organizer</option>
                <option value="CO_LEAD">⭐ Associate Coordinator</option>
                <option value="ADMIN">🛡️ Core Administrative Wing</option>
                <option value="MEMBER">🎓 Registered Student / General Member</option>
              </select>
            </div>

            <button type="submit" className="btn-auth-submit" style={{ background: activeClub.primaryColor || '#0284c7' }}>
              🚀 Launch {activeClub.shortName} Portal
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {authMode === 'register' && (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="auth-form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. Bhavikkumar Patel"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-group">
              <label>Student Email ID (@itmbu.ac.in or personal) *</label>
              <input
                type="email"
                className="auth-input"
                placeholder="e.g. bhavik.itmbu@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="auth-form-group">
                <label>Branch / Degree *</label>
                <select
                  className="auth-select"
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                >
                  <option value="B.Tech CSE">B.Tech CSE</option>
                  <option value="B.Tech IT">B.Tech IT</option>
                  <option value="B.Tech AI &amp; DS">B.Tech AI &amp; DS</option>
                  <option value="B.Tech Cyber Security">B.Tech Cyber Security</option>
                  <option value="BCA / MCA">BCA / MCA</option>
                  <option value="Diploma Engineering">Diploma Engineering</option>
                </select>
              </div>

              <div className="auth-form-group">
                <label>Semester *</label>
                <select
                  className="auth-select"
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

            <div className="auth-form-group">
              <label>Set Password (Min 6 chars) *</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Create secure password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={isRegistering}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              {isRegistering ? '⏳ Registering in Cloud Database...' : `✨ Complete ${activeClub.shortName} Registration`}
            </button>
          </form>
        )}

        {/* Quick Demo Logins Helper */}
        <div className="demo-credentials-box">
          <div className="demo-header">
            <span>💡 Quick Test Credentials:</span>
          </div>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip chip-super"
              onClick={() => {
                setUsername('superadmin');
                setPassword('admin123');
                setRole('SUPER_ADMIN');
                setAuthMode('login');
              }}
            >
              👑 Super Admin (All Chapters)
            </button>
            <button
              type="button"
              className="demo-chip chip-lead"
              onClick={() => {
                setUsername(selectedSection === 'AWS_SBG' ? 'bhavik.lead' : (selectedSection === 'TECHNO_LAB' ? 'vansham.lead' : 'harshil.lead'));
                setPassword('lead123');
                setRole('ORGANIZER');
                setAuthMode('login');
              }}
            >
              🎖️ {activeClub.shortName} Lead
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
