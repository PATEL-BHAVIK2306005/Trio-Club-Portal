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
  // MongoDB Save Handler
  onSaveToDatabase,
  isSavingToDb,
  dbSaveStatus
}) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  
  // Selected club module in Branding Settings (Super Admin can switch between AWS_SBG and TECHNO_LAB, regular admin is locked to their org)
  const [selectedModule, setSelectedModule] = useState(isSuperAdmin ? activeOrg : (currentUser?.organization || 'AWS_SBG'));

  const itmbuInputRef = useRef(null);
  const clubLogoInputRef = useRef(null);
  const organizerSigInputRef = useRef(null);
  const advisorSigInputRef = useRef(null);
  const mentorSigInputRef = useRef(null);

  const activeClub = CLUB_CONFIGS[selectedModule] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = selectedModule === 'AWS_SBG';

  // Active module getters & handlers based on selectedModule
  const currentClubLogo = isAWS ? awsClubLogo : technoClubLogo;
  const onUploadCurrentClubLogo = isAWS ? onUploadAwsClubLogo : onUploadTechnoClubLogo;

  const currentOrganizerSig = isAWS ? awsOrganizerSig : technoOrganizerSig;
  const onUploadCurrentOrganizerSig = isAWS ? onUploadAwsOrganizerSig : onUploadTechnoOrganizerSig;

  const currentAdvisorSig = isAWS ? awsAdvisorSig : technoAdvisorSig;
  const onUploadCurrentAdvisorSig = isAWS ? onUploadAwsAdvisorSig : onUploadTechnoAdvisorSig;

  const currentMentorSig = isAWS ? awsMentorSig : technoMentorSig;
  const onUploadCurrentMentorSig = isAWS ? onUploadAwsMentorSig : onUploadTechnoMentorSig;

  const currentConfig = isAWS ? awsConfig : technoConfig;

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
  };

  const handleSaveBoth = () => {
    if (onSaveToDatabase) {
      onSaveToDatabase('ALL');
    }
  };

  return (
    <div className="branding-settings-wrapper">
      
      {/* Top Hero Banner */}
      <div className="branding-hero-banner">
        <div className="branding-hero-content">
          <div className="branding-top-badges">
            <span className={`branding-badge ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
              {isSuperAdmin ? '👑 SUPER ADMIN &bull; UNIVERSAL BRANDING SUITE' : `${activeClub.shortName} &bull; BRAND ASSET MANAGEMENT`}
            </span>
            {dbSaveStatus && (
              <span className="db-save-toast">
                {dbSaveStatus}
              </span>
            )}
          </div>
          <h2>🎨 University Branding & Digital Signature Suite</h2>
          <p>
            Configure official institutional crests for <strong>ITM (sls) BARODA UNIVERSITY</strong>, customize club emblems, and upload high-resolution digital signatures directly to <strong>MongoDB Compass</strong>.
          </p>
        </div>

        {/* Global Save Action Card */}
        <div className="branding-hero-action">
          <div className="db-sync-info">
            <span className="db-pill-live">● MongoDB Compass Live Sync</span>
            <small>Collection: <code>brandings</code></small>
          </div>
          
          <div className="save-btn-group">
            <button
              className="btn-save-database-primary"
              onClick={handleSaveCurrent}
              disabled={isSavingToDb}
            >
              {isSavingToDb ? '⏳ Saving to MongoDB...' : `💾 Save ${activeClub.shortName} Branding to MongoDB`}
            </button>
            {isSuperAdmin && (
              <button
                className="btn-save-database-secondary"
                onClick={handleSaveBoth}
                disabled={isSavingToDb}
              >
                ⚡ Save All (AWS + Techno)
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
            <span className="module-desc">Switch between club modules to customize branding and executive signature vaults</span>
          </div>
          <div className="module-toggle-pills">
            <button
              className={`btn-module-pill ${selectedModule === 'AWS_SBG' ? 'active-aws' : ''}`}
              onClick={() => setSelectedModule('AWS_SBG')}
            >
              <span className="pill-icon">☁️</span>
              <span className="pill-text">AWS Student Builder Group Module</span>
              <span className="pill-tag">AWS SBG</span>
            </button>
            <button
              className={`btn-module-pill ${selectedModule === 'TECHNO_LAB' ? 'active-techno' : ''}`}
              onClick={() => setSelectedModule('TECHNO_LAB')}
            >
              <span className="pill-icon">🔬</span>
              <span className="pill-text">Techno Lab Module</span>
              <span className="pill-tag">Techno Lab</span>
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
            <div className="b-card-icon">{isAWS ? '☁️' : '🔬'}</div>
            <div>
              <h3>{activeClub.name} Emblem</h3>
              <span>Official Club Brand Logo (Top-Left of Letterhead)</span>
            </div>
            <span className={`club-tag-pill ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
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
            ) : (
              <div className="techno-badge-logo preview-inner">
                <div className="techno-pill">TECHNO LAB</div>
                <div className="techno-sub">Techno+Techiz Innovation Hub</div>
                <div className="techno-campus">ITM (sls) Baroda University</div>
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
      <div className="branding-subtitle-card" style={{ background: '#131b2e', border: '1px solid #23314a', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
        <div className="branding-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="b-card-icon" style={{ fontSize: '24px' }}>🏷️</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Letterhead Chapter Subtitle & Department Affiliation Line</h3>
              <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>The official chapter tagline printed directly below university crest & club logos</span>
            </div>
          </div>
          <span className={`club-tag-pill ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
            {activeClub.shortName}
          </span>
        </div>

        <div className="branding-subtitle-body">
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '13.5px' }}>Chapter Affiliation & Department Line *</span>
              <span className="editable-pill-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>✏️ Live Editable</span>
            </label>
            <input
              type="text"
              className="form-input form-input-live-edit"
              placeholder={activeClub.subtitle}
              value={currentConfig?.subtitle !== undefined ? currentConfig.subtitle : activeClub.subtitle}
              onChange={(e) => {
                const val = e.target.value;
                if (isAWS) {
                  onChangeAwsConfig(prev => ({ ...prev, subtitle: val }));
                } else {
                  onChangeTechnoConfig(prev => ({ ...prev, subtitle: val }));
                }
              }}
              style={{ width: '100%', padding: '12px 14px', fontSize: '14px', borderRadius: '8px', background: '#0a0f1d', border: '1px solid #38bdf8', color: '#f8fafc' }}
            />
          </div>

          {/* Live Letterhead Header Preview Box */}
          <div className="subtitle-live-preview-box" style={{ background: '#0a0f1d', padding: '14px 18px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              🔍 Live Letterhead Header Preview:
            </span>
            <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '12px', color: '#38bdf8', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: '1.5' }}>
              {(currentConfig?.subtitle !== undefined && currentConfig?.subtitle !== '') ? currentConfig.subtitle : activeClub.subtitle}
            </div>
            <div style={{ height: '2px', background: activeClub.primaryColor || '#00d2ff', marginTop: '8px', opacity: 0.8, borderRadius: '2px' }}></div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-brand-reset"
              onClick={() => {
                if (isAWS) {
                  onChangeAwsConfig(prev => ({ ...prev, subtitle: activeClub.subtitle }));
                } else {
                  onChangeTechnoConfig(prev => ({ ...prev, subtitle: activeClub.subtitle }));
                }
              }}
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}
            >
              🔄 Reset to Default Club Tagline
            </button>
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
            {isSavingToDb ? '⏳ Saving...' : '💾 Save to MongoDB Compass'}
          </button>
        </div>

        <div className="vault-grid">
          
          {/* Signatory 1: Lead Organizer / President */}
          <div className="vault-item-card">
            <div className="vault-item-header">
              <span className="sig-role-badge">SIGNATORY 1</span>
              <strong>{isAWS ? 'AWS SBG Leader / Organizer' : 'President & Lead Organizer'}</strong>
            </div>

            <div className="vault-sig-preview">
              {currentOrganizerSig ? (
                <img src={currentOrganizerSig} alt="Organizer Signature" className="vault-sig-img" />
              ) : (
                <div className="sig-stylized">{currentConfig?.organizerName || activeClub.organizer?.name || 'Organizer'}</div>
              )}
            </div>

            <div className="vault-sig-meta">
              <span>{currentConfig?.organizerName || activeClub.organizer?.name}</span>
              <small>{currentConfig?.organizerTitle || activeClub.organizer?.title}</small>
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

          {/* Signatory 2: Advisor Section */}
          <div className="vault-item-card highlight-advisor-card">
            <div className="vault-item-header">
              <span className="sig-role-badge advisor-badge">SIGNATORY 2</span>
              <strong>Advisor Section (Optional)</strong>
            </div>

            <div className="vault-sig-preview">
              {currentAdvisorSig ? (
                <img src={currentAdvisorSig} alt="Advisor Signature" className="vault-sig-img" />
              ) : (
                <div className="sig-stylized adv-sig">{currentConfig?.advisorName || activeClub.advisor?.name || 'Advisor'}</div>
              )}
            </div>

            <div className="vault-sig-meta">
              <span>{currentConfig?.advisorName || activeClub.advisor?.name || 'Advisor (Optional)'}</span>
              <small>{currentConfig?.advisorTitle || activeClub.advisor?.title || 'Student Advisor'}</small>
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
          <span>💾 All changes saved here will be stored in your local MongoDB instance (<strong>aws_sbg_itmbu.brandings</strong>) and automatically loaded into all letters.</span>
        </div>
        <button
          className="btn-save-database-primary btn-large"
          onClick={handleSaveCurrent}
          disabled={isSavingToDb}
        >
          {isSavingToDb ? '⏳ Saving to MongoDB...' : `💾 Save ${activeClub.shortName} Branding & Signatures to MongoDB Compass`}
        </button>
      </div>

    </div>
  );
}
