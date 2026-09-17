import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import { registerSupabaseUser } from '../services/supabaseService';
import Swal from 'sweetalert2';

export default function AuthScreen({ onLogin }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [selectedSection, setSelectedSection] = useState('AWS_SBG'); // 'AWS_SBG' or 'TECHNO_LAB'
  
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

  const activeClub = CLUB_CONFIGS[selectedSection];

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
      allowedOrgs: effectiveRole === 'SUPER_ADMIN' ? ['AWS_SBG', 'TECHNO_LAB'] : [selectedSection],
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
            <div style="text-align: left; font-size: 14px; line-height: 1.6;">
              <p>Welcome <b>${regName}</b> to <b>${activeClub.name}</b>!</p>
              <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 10px 14px; margin: 12px 0;">
                <p style="margin: 0; color: #0284c7; font-weight: 700;">📧 Confirmation Email Dispatched:</p>
                <p style="margin: 4px 0 0 0; color: #334155;">A verification email has been sent to <b>${regEmail}</b> via Supabase Email Service.</p>
              </div>
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 10px 14px;">
                <p style="margin: 0; color: #b45309; font-weight: 700;">👥 Role: General Member</p>
                <p style="margin: 4px 0 0 0; color: #334155;">Your profile is enrolled as a <b>General Member</b>. Club Organizers & Associate Coordinators will review and promote you to elevated leadership/core roles & generate your official appointment letter.</p>
              </div>
            </div>
          `,
          confirmButtonColor: selectedSection === 'AWS_SBG' ? '#ff9900' : '#00d2ff',
          confirmButtonText: 'Proceed to Sign In'
        }).then(() => {
          setAuthMode('login');
          setUsername(regEmail.trim());
          setRole('MEMBER');
        });
      }
    } catch (err) {
      setIsRegistering(false);
      setErrorMsg(`Registration failed: ${err.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="auth-screen-wrapper">
      {/* Background ambient lighting effects */}
      <div className="auth-bg-glow glow-1"></div>
      <div className="auth-bg-glow glow-2"></div>

      <div className="auth-card-container">
        
        {/* Header Branding */}
        <div className="auth-university-crest">
          <div className="crest-badge">ITM (sls) BARODA UNIVERSITY</div>
          <p className="crest-sub">Official Core Team Joining Letter & Administration Portal</p>
        </div>

        {/* SECTION SELECTION SLIDER */}
        <div className="section-slider-wrapper">
          <label className="slider-label">SELECT CHAPTER / SECTION TO ACCESS</label>
          <div className="section-slider-pill">
            <button
              type="button"
              className={`slider-option ${selectedSection === 'AWS_SBG' ? 'active-aws' : ''}`}
              onClick={() => {
                setSelectedSection('AWS_SBG');
                setErrorMsg('');
              }}
            >
              <span className="slider-icon">☁️</span>
              <span className="slider-text">AWS Student Chapter</span>
            </button>

            <button
              type="button"
              className={`slider-option ${selectedSection === 'TECHNO_LAB' ? 'active-techno' : ''}`}
              onClick={() => {
                setSelectedSection('TECHNO_LAB');
                setErrorMsg('');
              }}
            >
              <span className="slider-icon">🔬</span>
              <span className="slider-text">Techno Lab Chapter</span>
            </button>

            {/* Animated Slider Glider */}
            <div
              className={`slider-glider ${selectedSection === 'TECHNO_LAB' ? 'glider-right' : 'glider-left'}`}
            ></div>
          </div>
        </div>

        {/* Selected Club Badge Banner */}
        <div className={`active-club-badge-banner ${selectedSection === 'AWS_SBG' ? 'banner-aws' : 'banner-techno'}`}>
          <div className="banner-logo-tag">
            {selectedSection === 'AWS_SBG' ? 'AWS' : 'TECHNO'}
          </div>
          <div className="banner-text-details">
            <h4>{activeClub.name}</h4>
            <span>Official Student Community &bull; {activeClub.email}</span>
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
            📝 Register New Member
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-error-box">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginFormSubmit} className="auth-login-form">
            <div className="form-group-auth">
              <label>Username / Official Email</label>
              <input
                type="text"
                className="auth-input"
                placeholder={selectedSection === 'AWS_SBG' ? 'e.g. superadmin, bhavik.itmbu@gmail.com, or aws.organizer' : 'e.g. superadmin, bhavik.itmbu@gmail.com, or technolab.lead'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group-auth">
              <label>Security Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="role-selector-row">
              <span className="role-label">Access Role Authority:</span>
              <div className="role-options-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <label className={`role-pill-label ${role === 'ORGANIZER' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="userRole"
                    value="ORGANIZER"
                    checked={role === 'ORGANIZER'}
                    onChange={() => setRole('ORGANIZER')}
                  />
                  <span>🚀 Lead Organizer</span>
                </label>

                <label className={`role-pill-label ${role === 'CO_LEAD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="userRole"
                    value="CO_LEAD"
                    checked={role === 'CO_LEAD'}
                    onChange={() => setRole('CO_LEAD')}
                  />
                  <span>⭐ Associate Coordinator</span>
                </label>

                <label className={`role-pill-label ${role === 'ADMIN' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="userRole"
                    value="ADMIN"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                  />
                  <span>🛡️ Section Admin</span>
                </label>

                <label className={`role-pill-label ${role === 'SUPER_ADMIN' ? 'selected-super' : ''}`}>
                  <input
                    type="radio"
                    name="userRole"
                    value="SUPER_ADMIN"
                    checked={role === 'SUPER_ADMIN'}
                    onChange={() => setRole('SUPER_ADMIN')}
                  />
                  <span>👑 Super Admin</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className={`btn-auth-submit ${selectedSection === 'AWS_SBG' ? 'btn-aws' : 'btn-techno'}`}
            >
              🔒 Secure Login to {activeClub.shortName} Portal
            </button>
          </form>
        ) : (
          /* 2. REGISTRATION FORM FOR NEW USERS */
          <form onSubmit={handleRegisterSubmit} className="auth-login-form">
            <div className="form-group-auth">
              <label>Full Student Name *</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. Priya Sharma"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group-auth">
              <label>Student Email Address *</label>
              <input
                type="email"
                className="auth-input"
                placeholder="e.g. priya.sharma@itmbu.ac.in"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
              <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                ✉️ Supabase Email Service will dispatch an account verification message.
              </small>
            </div>

            <div className="form-group-auth">
              <label>Create Account Password *</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Minimum 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group-auth">
                <label>Branch / Program</label>
                <input
                  type="text"
                  className="auth-input"
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                  placeholder="e.g. B.Tech CSE"
                />
              </div>

              <div className="form-group-auth">
                <label>Current Semester</label>
                <select
                  className="auth-input"
                  value={regSemester}
                  onChange={(e) => setRegSemester(e.target.value)}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '10px 14px', margin: '4px 0 12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '12px' }}>
                <span>ℹ️</span>
                <span>Automatic Role Assignment: General Member</span>
              </div>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '11.5px', lineHeight: 1.4 }}>
                New accounts register as <b>General Member</b> (Pending Promotion). Club Organizers and Associate Coordinators will evaluate contributions and promote you to Core Team Member, Club Head, or Coordinator roles.
              </p>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className={`btn-auth-submit ${selectedSection === 'AWS_SBG' ? 'btn-aws' : 'btn-techno'}`}
            >
              {isRegistering ? '⏳ Registering & Dispatching Email...' : `🚀 Register for ${activeClub.shortName}`}
            </button>
          </form>
        )}

        {/* Footer Info */}
        <div className="auth-footer-note">
          <span>ITM (sls) Baroda University &bull; Universal Student Portal &bull; {selectedSection === 'AWS_SBG' ? 'aws.itmbu@gmail.com' : 'technolabclub25@gmail.com'}</span>
        </div>

      </div>
    </div>
  );
}
