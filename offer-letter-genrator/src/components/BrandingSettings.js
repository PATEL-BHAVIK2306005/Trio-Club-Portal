import React, { useRef, useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

export default function BrandingSettings({
  currentUser,
  activeOrg = 'AWS_SBG',
  itmbuLogo,
  onUploadItmbuLogo,
  // AWS Branding Props
  awsClubLogo,
  onUploadAwsClubLogo,
  awsOrganizerSig,
  onUploadAwsOrganizerSig,
  awsAdvisorSig,
  onUploadAwsAdvisorSig,
  awsMentorSig,
  onUploadAwsMentorSig,
  awsConfig,
  onChangeAwsConfig,
  // Techno Lab Branding Props
  technoClubLogo,
  onUploadTechnoClubLogo,
  technoOrganizerSig,
  onUploadTechnoOrganizerSig,
  technoAdvisorSig,
  onUploadTechnoAdvisorSig,
  technoMentorSig,
  onUploadTechnoMentorSig,
  technoConfig,
  onChangeTechnoConfig,
  // GDGoC Branding Props
  gdgocClubLogo,
  onUploadGdgocClubLogo,
  gdgocOrganizerSig,
  onUploadGdgocOrganizerSig,
  gdgocAdvisorSig,
  onUploadGdgocAdvisorSig,
  gdgocMentorSig,
  onUploadGdgocMentorSig,
  gdgocConfig,
  onChangeGdgocConfig,
  // Database / Local Save Handler
  onSaveToDatabase,
  isSavingToDb,
  dbSaveStatus
}) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  
  // Selected club module in Branding Settings (Super Admin can switch between AWS_SBG, TECHNO_LAB, GDGOC)
  const [selectedModule, setSelectedModule] = useState(isSuperAdmin ? activeOrg : (currentUser?.organization || 'AWS_SBG'));
  const [subtitleSavedToast, setSubtitleSavedToast] = useState(false);

  const itmbuInputRef = useRef(null);
  const clubLogoInputRef = useRef(null);
  const organizerSigInputRef = useRef(null);
  const advisorSigInputRef = useRef(null);
  const mentorSigInputRef = useRef(null);

  const activeClub = CLUB_CONFIGS[selectedModule] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = selectedModule === 'AWS_SBG';
  const isTechno = selectedModule === 'TECHNO_LAB';
  const isGdgoc = selectedModule === 'GDGOC';

  // Active module getters based on selectedModule
  const currentClubLogo = isAWS ? awsClubLogo : (isTechno ? technoClubLogo : gdgocClubLogo);
  const onUploadCurrentClubLogo = isAWS ? onUploadAwsClubLogo : (isTechno ? onUploadTechnoClubLogo : onUploadGdgocClubLogo);

  const currentOrganizerSig = isAWS ? awsOrganizerSig : (isTechno ? technoOrganizerSig : gdgocOrganizerSig);
  const onUploadCurrentOrganizerSig = isAWS ? onUploadAwsOrganizerSig : (isTechno ? onUploadTechnoOrganizerSig : onUploadGdgocOrganizerSig);

  const currentAdvisorSig = isAWS ? awsAdvisorSig : (isTechno ? technoAdvisorSig : gdgocAdvisorSig);
  const onUploadCurrentAdvisorSig = isAWS ? onUploadAwsAdvisorSig : (isTechno ? onUploadTechnoAdvisorSig : onUploadGdgocAdvisorSig);

  const currentMentorSig = isAWS ? awsMentorSig : (isTechno ? technoMentorSig : gdgocMentorSig);
  const onUploadCurrentMentorSig = isAWS ? onUploadAwsMentorSig : (isTechno ? onUploadTechnoMentorSig : onUploadGdgocMentorSig);

  const currentConfig = isAWS ? awsConfig : (isTechno ? technoConfig : gdgocConfig);

  const updateCurrentConfig = (updater) => {
    if (isAWS && onChangeAwsConfig) {
      onChangeAwsConfig(updater);
    } else if (isTechno && onChangeTechnoConfig) {
      onChangeTechnoConfig(updater);
    } else if (isGdgoc && onChangeGdgocConfig) {
      onChangeGdgocConfig(updater);
    }
  };

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        callback(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCurrent = () => {
    if (onSaveToDatabase) {
      onSaveToDatabase(selectedModule);
    }
    setSubtitleSavedToast(true);
    setTimeout(() => setSubtitleSavedToast(false), 3000);
  };

  const handleSaveBoth = () => {
    if (onSaveToDatabase) {
      onSaveToDatabase('ALL');
    }
  };

  const getChipClass = () => {
    if (isAWS) return 'chip-aws';
    if (isTechno) return 'chip-techno';
    return 'chip-gdgoc';
  };

  return (
    <div className="branding-settings-wrapper">
      
      {/* Top Hero Banner */}
      <div className="branding-hero-banner">
        <div className="branding-hero-content">
          <div className="branding-top-badges">
            <span className={`branding-badge ${getChipClass()}`}>
              {isSuperAdmin ? 'SUPER ADMIN • CAMPUS CORE LINK CLUB BRANDING SUITE' : `${activeClub.shortName} • BRAND ASSET MANAGEMENT`}
            </span>
            {dbSaveStatus && (
              <span className="db-save-toast">
                {dbSaveStatus}
              </span>
            )}
          </div>
          <h2>🎨 University Branding & Digital Signature Suite</h2>
          <p>
            Configure official institutional crests for <strong>ITM (sls) BARODA UNIVERSITY</strong>, customize chapter emblems, and upload high-resolution digital signatures directly for <strong>{activeClub.name}</strong>.
          </p>
        </div>

        {/* Global Save Action Card */}
        <div className="branding-hero-action">
          <div className="db-sync-info">
            <span className="db-pill-live">● Cloud & Local Live Sync</span>
            <small>Active Chapter: <code>{selectedModule}</code></small>
          </div>
          
          <div className="save-btn-group">
            <button
              className="btn-save-database-primary"
              onClick={handleSaveCurrent}
              disabled={isSavingToDb}
            >
              {isSavingToDb ? '⏳ Saving...' : `💾 Save ${activeClub.shortName} Branding`}
            </button>
            {isSuperAdmin && (
              <button
                className="btn-save-database-secondary"
                onClick={handleSaveBoth}
                disabled={isSavingToDb}
              >
                ⚡ Save All 3 Chapters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUPER ADMIN MODULE SWITCHER */}
      {isSuperAdmin ? (
        <div className="super-admin-branding-modules">
          <div className="module-switch-header">
            <span className="module-label">SUPER ADMIN BRANDING MODULE CONTROLS:</span>
            <span className="module-desc">Switch between club modules to customize branding, emails, and executive signature vaults</span>
          </div>
          <div className="module-toggle-pills">
            <button
              className={`btn-module-pill ${selectedModule === 'AWS_SBG' ? 'active-aws' : ''}`}
              onClick={() => setSelectedModule('AWS_SBG')}
            >
              <span className="pill-icon">☁️</span>
              <span className="pill-text">AWS Student Builder Group</span>
              <span className="pill-tag">AWS SBG</span>
            </button>
            <button
              className={`btn-module-pill ${selectedModule === 'TECHNO_LAB' ? 'active-techno' : ''}`}
              onClick={() => setSelectedModule('TECHNO_LAB')}
            >
              <span className="pill-icon">🔬</span>
              <span className="pill-text">Techno Lab Club</span>
              <span className="pill-tag">Techno Lab</span>
            </button>
            <button
              className={`btn-module-pill ${selectedModule === 'GDGOC' ? 'active-gdgoc' : ''}`}
              onClick={() => setSelectedModule('GDGOC')}
            >
              <span className="pill-icon">🌐</span>
              <span className="pill-text">GDGoC ITMBU Chapter</span>
              <span className="pill-tag">GDGoC</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-locked-module-badge">
          <span>🔒 Single Admin View: Locked to <strong>{activeClub.name}</strong></span>
        </div>
      )}

      {/* SECTION 1: LOGOS GRID */}
      <div className="branding-cards-grid">
        
        {/* CARD 1: ITM (sls) BARODA UNIVERSITY OFFICIAL CREST (Universal) */}
        <div className="branding-card highlight-uni-card">
          <div className="branding-card-header">
            <div className="b-card-icon">🏛️</div>
            <div>
              <h3>ITM (sls) BARODA UNIVERSITY Crest</h3>
              <span>Universal Institutional Seal (Top-Right of all Letters)</span>
            </div>
            <span className="universal-badge">UNIVERSAL</span>
          </div>

          <div className="branding-preview-box">
            {itmbuLogo ? (
              <img src={itmbuLogo} alt="ITMBU Logo" className="branding-logo-img" />
            ) : (
              <div className="itmbu-placeholder-logo preview-inner">
                <div className="itmbu-title">ITM (sls)</div>
                <div className="itmbu-sub">BARODA UNIVERSITY</div>
                <div className="itmbu-loc">VADODARA, GUJARAT</div>
                <span className="itmbu-hint">Universal Institutional Seal</span>
              </div>
            )}
          </div>

          <div className="branding-card-actions">
            <input
              type="file"
              ref={itmbuInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => handleFileUpload(e, onUploadItmbuLogo)}
            />
            <button
              className="btn-brand-upload"
              onClick={() => itmbuInputRef.current.click()}
            >
              📁 {itmbuLogo ? 'Change University Crest' : 'Upload University Crest PNG'}
            </button>
            {itmbuLogo && (
              <button
                className="btn-brand-reset"
                onClick={() => onUploadItmbuLogo(null)}
              >
                Reset Default
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: ACTIVE CLUB EMBLEM */}
        <div className="branding-card">
          <div className="branding-card-header">
            <div className="b-card-icon">{isAWS ? '☁️' : (isTechno ? '🔬' : '🌐')}</div>
            <div>
              <h3>{activeClub.name} Emblem</h3>
              <span>Official Club Brand Logo (Top-Left of Letterhead)</span>
            </div>
            <span className={`club-tag-pill ${getChipClass()}`}>
              {activeClub.shortName}
            </span>
          </div>

          <div className="branding-preview-box">
            {currentClubLogo ? (
              <img src={currentClubLogo} alt={`${activeClub.name} Logo`} className="branding-logo-img" />
            ) : isAWS ? (
              <div className="aws-badge-logo preview-inner">
                <div className="aws-pill">AWS</div>
                <div className="aws-sub">Student Builder Group</div>
                <div className="aws-campus">ITM (sls) Baroda University</div>
              </div>
            ) : isTechno ? (
              <div className="techno-badge-logo preview-inner">
                <div className="techno-pill">TECHNO LAB</div>
                <div className="techno-sub">Techno+Techies Community</div>
                <div className="techno-campus">ITM (sls) Baroda University</div>
              </div>
            ) : (
              <div className="gdgoc-badge-logo preview-inner" style={{ textAlign: 'center' }}>
                <div className="gdgoc-pill-white">
                  <svg width="22" height="14" viewBox="0 0 120 76" fill="none" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                    <line x1="42" y1="12" x2="16" y2="38" stroke="#EA4335" strokeWidth="14" strokeLinecap="round"/>
                    <line x1="16" y1="38" x2="42" y2="64" stroke="#4285F4" strokeWidth="14" strokeLinecap="round"/>
                    <line x1="78" y1="12" x2="104" y2="38" stroke="#0F9D58" strokeWidth="14" strokeLinecap="round"/>
                    <line x1="104" y1="38" x2="78" y2="64" stroke="#FBBC04" strokeWidth="14" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#3c4043' }}>GDG</span>
                </div>
                <div style={{ fontSize: '11px', color: '#4285F4', fontWeight: 700, marginTop: '4px' }}>Google Developer Groups on Campus</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>ITM (sls) Baroda University</div>
              </div>
            )}
          </div>

          <div className="branding-card-actions">
            <input
              type="file"
              ref={clubLogoInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => handleFileUpload(e, onUploadCurrentClubLogo)}
            />
            <button
              className="btn-brand-upload"
              onClick={() => clubLogoInputRef.current.click()}
            >
              📁 {currentClubLogo ? 'Change Club Logo' : `Upload ${activeClub.shortName} Logo PNG`}
            </button>
            {currentClubLogo && (
              <button
                className="btn-brand-reset"
                onClick={() => onUploadCurrentClubLogo(null)}
              >
                Reset Default
              </button>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 1.5: LETTERHEAD SUBTITLE & CHAPTER AFFILIATION LINE */}
      <div className="branding-subtitle-card">
        <div className="branding-card-header">
          <div className="branding-card-title-group">
            <div className="b-card-icon">🏷️</div>
            <div>
              <h3>Letterhead Chapter Subtitle & Department Affiliation Line</h3>
              <span>The official chapter tagline and contact email printed directly on official letterheads</span>
            </div>
          </div>
          <span className={`club-tag-pill ${getChipClass()}`}>
            {activeClub.shortName}
          </span>
        </div>

        <div className="branding-subtitle-body">
          <div className="branding-input-grid">
            {/* Tagline input */}
            <div className="form-group">
              <label>
                <span>Chapter Affiliation & Department Line *</span>
                <span className="editable-pill-badge badge-blue">✏️ Live Editable</span>
              </label>
              <input
                type="text"
                className="form-input form-input-live-edit"
                placeholder={activeClub.subtitle}
                value={currentConfig?.subtitle !== undefined ? currentConfig.subtitle : activeClub.subtitle}
                onChange={(e) => {
                  const val = e.target.value;
                  updateCurrentConfig(prev => ({ ...prev, subtitle: val }));
                }}
              />
            </div>

            {/* Official Chapter Email input */}
            <div className="form-group">
              <label>
                <span>Official Chapter Contact Email *</span>
                <span className="editable-pill-badge badge-green">✉️ Live Editable</span>
              </label>
              <input
                type="email"
                className="form-input form-input-live-edit"
                placeholder={activeClub.email}
                value={currentConfig?.contactEmail !== undefined ? currentConfig.contactEmail : activeClub.email}
                onChange={(e) => {
                  const val = e.target.value;
                  updateCurrentConfig(prev => ({ ...prev, contactEmail: val }));
                }}
              />
            </div>
          </div>

          {/* Live Letterhead Header Preview Box */}
          <div className="subtitle-live-preview-box">
            <div className="preview-top-info">
              <span className="preview-label">
                🔍 LIVE LETTERHEAD HEADER PREVIEW:
              </span>
              <span className="preview-email-tag">
                ✉️ {(currentConfig?.contactEmail !== undefined && currentConfig?.contactEmail !== '') ? currentConfig.contactEmail : activeClub.email}
              </span>
            </div>
            <div className="preview-tagline-text">
              {(currentConfig?.subtitle !== undefined && currentConfig?.subtitle !== '') ? currentConfig.subtitle : activeClub.subtitle}
            </div>
            <div className="preview-accent-divider" style={{ background: activeClub.primaryColor || '#0284c7' }}></div>
          </div>

          {/* ACTIONS ROW WITH SAVE BUTTON */}
          <div className="branding-subtitle-footer">
            <div>
              {subtitleSavedToast && (
                <span className="save-success-toast">
                  ✅ Changes Saved Successfully!
                </span>
              )}
            </div>
            <div className="subtitle-action-buttons">
              <button
                type="button"
                className="btn-brand-reset-plain"
                onClick={() => {
                  updateCurrentConfig(prev => ({ ...prev, subtitle: activeClub.subtitle, contactEmail: activeClub.email }));
                }}
              >
                🔄 Reset to Default Club Tagline & Email
              </button>
              <button
                type="button"
                className="btn-save-tagline"
                onClick={handleSaveCurrent}
                disabled={isSavingToDb}
              >
                {isSavingToDb ? '⏳ Saving...' : '💾 Save Chapter Subtitle & Email'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DIGITAL SIGNATURE VAULT */}
      <div className="branding-vault-section">
        <div className="vault-header-row">
          <div>
            <h3 className="vault-title">✍️ {activeClub.name} Digital Signature Vault</h3>
            <p className="vault-desc">
              Upload transparent background <code>.png</code> signatures for <strong>{activeClub.shortName}</strong> leadership. If no signature image is uploaded, an elegant stylized signature will render automatically.
            </p>
          </div>
          <button
            className="btn-save-database-primary"
            onClick={handleSaveCurrent}
            disabled={isSavingToDb}
          >
            {isSavingToDb ? '⏳ Saving...' : `💾 Save Signatures to Database`}
          </button>
        </div>

        <div className="vault-grid">
          
          {/* Signatory 1: Lead / Organizer */}
          <div className="vault-item-card">
            <div className="vault-item-header">
              <span className="sig-role-badge lead-badge">SIGNATORY 1</span>
              <strong>Club Lead / Organizer</strong>
            </div>

            <div className="vault-sig-preview">
              {currentOrganizerSig ? (
                <img src={currentOrganizerSig} alt="Club Lead Signature" className="vault-sig-img" />
              ) : (
                <div className="sig-stylized">{currentConfig?.organizerName || activeClub.organizer?.name || 'Bhavikkumar Patel'}</div>
              )}
            </div>

            <div className="vault-sig-meta">
              <span>{currentConfig?.organizerName || activeClub.organizer?.name || 'Bhavikkumar Patel'}</span>
              <small>{currentConfig?.organizerTitle || activeClub.organizer?.title || 'Organizer / Lead'}</small>
            </div>

            <div className="vault-actions">
              <input
                type="file"
                ref={organizerSigInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, onUploadCurrentOrganizerSig)}
              />
              <button
                className="btn-vault-btn"
                onClick={() => organizerSigInputRef.current.click()}
              >
                {currentOrganizerSig ? '🔄 Change Signature' : '✍️ Upload PNG'}
              </button>
              {currentOrganizerSig && (
                <button
                  className="btn-vault-reset"
                  onClick={() => onUploadCurrentOrganizerSig(null)}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Signatory 2: Faculty Advisor */}
          <div className="vault-item-card">
            <div className="vault-item-header">
              <span className="sig-role-badge advisor-badge">SIGNATORY 2</span>
              <strong>Faculty Advisor / Coordinator</strong>
            </div>

            <div className="vault-sig-preview">
              {currentAdvisorSig ? (
                <img src={currentAdvisorSig} alt="Faculty Advisor Signature" className="vault-sig-img" />
              ) : (
                <div className="sig-stylized fac-sig">{currentConfig?.advisorName || activeClub.advisor?.name || 'Prof. Bhumika Patel'}</div>
              )}
            </div>

            <div className="vault-sig-meta">
              <span>{currentConfig?.advisorName || activeClub.advisor?.name || 'Prof. Bhumika Patel'}</span>
              <small>{currentConfig?.advisorTitle || activeClub.advisor?.title || 'Faculty Advisor'}</small>
            </div>

            <div className="vault-actions">
              <input
                type="file"
                ref={advisorSigInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, onUploadCurrentAdvisorSig)}
              />
              <button
                className="btn-vault-btn"
                onClick={() => advisorSigInputRef.current.click()}
              >
                {currentAdvisorSig ? '🔄 Change Signature' : '✍️ Upload PNG'}
              </button>
              {currentAdvisorSig && (
                <button
                  className="btn-vault-reset"
                  onClick={() => onUploadCurrentAdvisorSig(null)}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Signatory 3: Faculty Mentor */}
          <div className="vault-item-card">
            <div className="vault-item-header">
              <span className="sig-role-badge mentor-badge">SIGNATORY 3</span>
              <strong>Faculty Mentor / Head</strong>
            </div>

            <div className="vault-sig-preview">
              {currentMentorSig ? (
                <img src={currentMentorSig} alt="Faculty Mentor Signature" className="vault-sig-img" />
              ) : (
                <div className="sig-stylized fac-sig">{currentConfig?.mentorName || activeClub.mentor?.name || 'Dr. Pradeep Laxkar'}</div>
              )}
            </div>

            <div className="vault-sig-meta">
              <span>{currentConfig?.mentorName || activeClub.mentor?.name || 'Dr. Pradeep Laxkar'}</span>
              <small>{currentConfig?.mentorTitle || activeClub.mentor?.title || 'Faculty Mentor / Head'}</small>
            </div>

            <div className="vault-actions">
              <input
                type="file"
                ref={mentorSigInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, onUploadCurrentMentorSig)}
              />
              <button
                className="btn-vault-btn"
                onClick={() => mentorSigInputRef.current.click()}
              >
                {currentMentorSig ? '🔄 Change Signature' : '✍️ Upload PNG'}
              </button>
              {currentMentorSig && (
                <button
                  className="btn-vault-reset"
                  onClick={() => onUploadCurrentMentorSig(null)}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER SAVE BAR */}
      <div className="branding-bottom-bar">
        <div className="b-bottom-info">
          <span>💾 All changes saved here will be stored in your database and automatically loaded into all letters.</span>
        </div>
        <button
          className="btn-save-database-primary btn-large"
          onClick={handleSaveCurrent}
          disabled={isSavingToDb}
        >
          {isSavingToDb ? '⏳ Saving to Database...' : `💾 Save ${activeClub.shortName} Branding & Signatures`}
        </button>
      </div>

    </div>
  );
}
