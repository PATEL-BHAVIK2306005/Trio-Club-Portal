import React, { useRef, useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

// Modern Feather/Lucide SVG Icons for clean, professional UI
const Icons = {
  Save: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  Mail: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Printer: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  ),
  Download: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Send: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Student: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  ),
  Hash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"></line>
      <line x1="4" y1="15" x2="20" y2="15"></line>
      <line x1="10" y1="3" x2="8" y2="21"></line>
      <line x1="16" y1="3" x2="14" y2="21"></line>
    </svg>
  ),
  Briefcase: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Layers: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Lock: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
  Edit: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  FileText: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  PenTool: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
      <path d="M2 2l7.586 7.586"></path>
      <circle cx="11" cy="11" r="2"></circle>
    </svg>
  ),
  Upload: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  )
};

export default function LetterControls({
  member,
  config,
  clubConfig = CLUB_CONFIGS.AWS_SBG,
  onChangeConfig,
  onSaveConfig,
  itmbuLogo,
  onUploadItmbuLogo,
  clubLogo,
  onUploadClubLogo,
  organizerSignatureImage,
  onUploadOrganizerSignature,
  advisorSignatureImage,
  onUploadAdvisorSignature,
  mentorSignatureImage,
  onUploadMentorSignature,
  onPrint,
  onDownloadPdf,
  onSendEmail
}) {
  const organizerSigInputRef = useRef(null);
  const advisorSigInputRef = useRef(null);
  const mentorSigInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('fields'); // 'fields', 'signatures'
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSave = () => {
    if (onSaveConfig) {
      onSaveConfig();
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isAWS = clubConfig.id === 'AWS_SBG';
  const isTechno = clubConfig.id === 'TECHNO_LAB';

  const getThemeClass = () => {
    if (isAWS) return 'btn-aws-primary';
    if (isTechno) return 'btn-techno-primary';
    return 'btn-gdgoc-primary';
  };

  return (
    <div className="controls-panel">
      {/* Controls Header */}
      <div className="controls-header">
        <div className="controls-title-group">
          <div className="controls-header-badge-row">
            <span className="chapter-pill-indicator">
              {clubConfig.shortName}
            </span>
            <span className="member-target-pill">
              {member ? member.name : 'Select Member'}
            </span>
          </div>
          <h3 className="controls-title">Letter Customization &amp; Signatures</h3>
        </div>

        <div className="letter-header-actions">
          {saveSuccess && (
            <span className="save-success-tag">
              <Icons.Check /> Settings Saved
            </span>
          )}
          <button
            type="button"
            className="btn-letter-action btn-action-outline"
            onClick={handleSave}
            title="Save letterhead customization to memory & cloud storage"
          >
            <Icons.Save />
            <span>Save Settings</span>
          </button>
          <button 
            type="button"
            className="btn-letter-action btn-action-email" 
            onClick={onSendEmail} 
            title={`Send official appointment letter to ${member ? member.name : 'member'} from official club email (${clubConfig.email})`}
          >
            <Icons.Mail />
            <span>Send via Mail</span>
          </button>
          <button 
            type="button"
            className="btn-letter-action btn-action-outline" 
            onClick={onPrint} 
            title="Quick print or standard system PDF dialog"
          >
            <Icons.Printer />
            <span>Print</span>
          </button>
          <button 
            type="button"
            className={`btn-letter-action btn-action-primary ${getThemeClass()}`} 
            onClick={onDownloadPdf} 
            title="Download direct high-resolution Full HD PDF document"
          >
            <Icons.Download />
            <span>Download FHD PDF</span>
          </button>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="controls-subtabs">
        <button
          type="button"
          className={`control-tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
          onClick={() => setActiveTab('fields')}
        >
          <Icons.FileText />
          <span>Letter Details &amp; Contact Info</span>
        </button>
        <button
          type="button"
          className={`control-tab-btn ${activeTab === 'signatures' ? 'active' : ''}`}
          onClick={() => setActiveTab('signatures')}
        >
          <Icons.PenTool />
          <span>Signatures Vault (Organizer, Advisor, Mentor)</span>
        </button>
      </div>

      <div className="controls-body">
        
        {/* TAB 1: LETTER FIELDS */}
        {activeTab === 'fields' && (
          <div className="fields-controls-container">
            
            {/* SECTION 1: LIVE EDITABLE FIELDS */}
            <div className="controls-section-card">
              <div className="section-card-header">
                <div className="section-header-left">
                  <span className="section-icon-badge"><Icons.Edit /></span>
                  <div>
                    <h4 className="section-card-title">Live Editable Attributes</h4>
                    <span className="section-card-desc">Changes here update the appointment letter instantly in real time</span>
                  </div>
                </div>
                <span className="live-sync-pill">
                  <span className="pulse-dot-live"></span> Live Sync Active
                </span>
              </div>

              <div className="fields-grid-3col">
                {/* EDITABLE 1: ISSUE DATE */}
                <div className="form-group-clean">
                  <label className="clean-label">
                    <span className="label-with-icon"><Icons.Calendar /> Issue Date</span>
                    <span className="clean-badge-live">Live</span>
                  </label>
                  <input
                    type="text"
                    value={config.issueDate || ''}
                    onChange={(e) => onChangeConfig('issueDate', e.target.value)}
                    placeholder="e.g. 16 September 2026"
                    className="clean-input"
                  />
                </div>

                {/* EDITABLE 2: OFFICIAL CHAPTER CONTACT EMAIL ID */}
                <div className="form-group-clean">
                  <label className="clean-label">
                    <span className="label-with-icon"><Icons.Send /> Chapter Contact Email</span>
                    <span className="clean-badge-live">Live</span>
                  </label>
                  <input
                    type="email"
                    value={config.contactEmail !== undefined ? config.contactEmail : (clubConfig.email || '')}
                    onChange={(e) => onChangeConfig('contactEmail', e.target.value)}
                    placeholder={clubConfig.email || 'chapter@itmbu.ac.in'}
                    className="clean-input"
                  />
                </div>

                {/* EDITABLE 2b: RECIPIENT STUDENT EMAIL ID */}
                <div className="form-group-clean">
                  <label className="clean-label">
                    <span className="label-with-icon"><Icons.Student /> Recipient Student Email</span>
                    <span className="clean-badge-live">Live</span>
                  </label>
                  <input
                    type="email"
                    value={config.memberEmail !== undefined ? config.memberEmail : (member?.email || '')}
                    onChange={(e) => onChangeConfig('memberEmail', e.target.value)}
                    placeholder="e.g. name@gmail.com or student@itmbu.ac.in"
                    className="clean-input"
                  />
                </div>

                {/* EDITABLE 3: CHAPTER SUBTITLE / AFFILIATION */}
                <div className="form-group-clean full-width-col">
                  <label className="clean-label">
                    <span className="label-with-icon"><Icons.Tag /> Letterhead Chapter Subtitle &amp; Affiliation Line</span>
                    <span className="clean-badge-live">Live</span>
                  </label>
                  <input
                    type="text"
                    value={config.subtitle !== undefined ? config.subtitle : (clubConfig.subtitle || '')}
                    onChange={(e) => onChangeConfig('subtitle', e.target.value)}
                    placeholder={clubConfig.subtitle}
                    className="clean-input"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: MEMBER SPECIFICATIONS (READONLY METRIC TILES) */}
            <div className="controls-section-card">
              <div className="section-card-header">
                <div className="section-header-left">
                  <span className="section-icon-badge badge-locked"><Icons.Lock /></span>
                  <div>
                    <h4 className="section-card-title">Member &amp; Tenure Specifications</h4>
                    <span className="section-card-desc">Populated automatically from team roster and chapter configuration</span>
                  </div>
                </div>
                <span className="roster-sync-pill">Roster Linked</span>
              </div>

              <div className="meta-tiles-grid">
                {/* TILE 1: REFERENCE NUMBER */}
                <div className="meta-spec-tile">
                  <div className="tile-top-row">
                    <span className="tile-label"><Icons.Hash /> Reference Number</span>
                    <span className="tile-lock-icon"><Icons.Lock /></span>
                  </div>
                  <div className="tile-value-text">
                    {member ? (member.letterRefId || `${clubConfig.refPrefix}-${member._id?.substring(0, 5) || '001'}`) : (config.letterRefId || 'AWS-SBG/ITMBU/2026-27/JL-LEAD-01')}
                  </div>
                </div>

                {/* TILE 2: DESIGNATION */}
                <div className="meta-spec-tile">
                  <div className="tile-top-row">
                    <span className="tile-label"><Icons.Briefcase /> Designation</span>
                    <span className="tile-lock-icon"><Icons.Lock /></span>
                  </div>
                  <div className="tile-value-text">
                    {member?.designation || 'AWS SBG Leader / Organizer at ITMBU'}
                  </div>
                </div>

                {/* TILE 3: DEPARTMENT / WING */}
                <div className="meta-spec-tile">
                  <div className="tile-top-row">
                    <span className="tile-label"><Icons.Layers /> Department / Wing</span>
                    <span className="tile-lock-icon"><Icons.Lock /></span>
                  </div>
                  <div className="tile-value-text">
                    {member?.department || 'Core Leadership'}
                  </div>
                </div>

                {/* TILE 4: ACADEMIC TENURE */}
                <div className="meta-spec-tile">
                  <div className="tile-top-row">
                    <span className="tile-label"><Icons.Clock /> Academic Tenure</span>
                    <span className="tile-lock-icon"><Icons.Lock /></span>
                  </div>
                  <div className="tile-value-text">
                    {config.tenure || clubConfig.academicYear || 'Academic Year 2026 – 2027'}
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK SAVE BAR */}
            <div className="controls-bottom-save-bar">
              {saveSuccess && (
                <span className="save-success-tag">
                  <Icons.Check /> Letterhead Configuration Saved Successfully!
                </span>
              )}
              <button
                type="button"
                className="btn-save-letterhead"
                onClick={handleSave}
              >
                <Icons.Save />
                <span>Save Letterhead Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SIGNATURES (ORGANIZER, ADVISOR, FACULTY MENTOR) */}
        {activeTab === 'signatures' && (
          <div className="signatures-controls-grid">
            
            {/* 1. Organizer Signature Card */}
            <div className="sig-control-card">
              <div className="sig-card-header">
                <span className="sig-role-badge">SIGNATORY 1</span>
                <strong>Lead Organizer</strong>
              </div>

              <div className="form-group-compact">
                <label>Organizer Name</label>
                <input
                  type="text"
                  value={config.organizerName ?? ''}
                  onChange={(e) => onChangeConfig('organizerName', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Bhavikkumar Patel"
                />
              </div>

              <div className="form-group-compact">
                <label>Designation / Title</label>
                <input
                  type="text"
                  value={config.organizerTitle ?? ''}
                  onChange={(e) => onChangeConfig('organizerTitle', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Chapter Leader / Organizer"
                />
              </div>

              <div className="form-group-compact">
                <label>Organization / Department</label>
                <input
                  type="text"
                  value={config.organizerOrg ?? ''}
                  onChange={(e) => onChangeConfig('organizerOrg', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. ITM (sls) Baroda University"
                />
              </div>

              <div className="sig-upload-row">
                <input
                  type="file"
                  ref={organizerSigInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, onUploadOrganizerSignature)}
                />
                <button
                  type="button"
                  className="btn-upload-sm"
                  onClick={() => organizerSigInputRef.current.click()}
                >
                  <Icons.Upload />
                  <span>{organizerSignatureImage ? 'Change Signature' : 'Upload PNG'}</span>
                </button>
                {organizerSignatureImage && (
                  <button
                    type="button"
                    className="btn-remove-sm"
                    onClick={() => onUploadOrganizerSignature(null)}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* 2. Faculty Advisor Signature Card */}
            <div className="sig-control-card">
              <div className="sig-card-header">
                <span className="sig-role-badge fac-badge">SIGNATORY 2</span>
                <strong>Faculty Advisor</strong>
              </div>

              <div className="form-group-compact">
                <label>Faculty Advisor Name</label>
                <input
                  type="text"
                  value={config.advisorName ?? ''}
                  onChange={(e) => onChangeConfig('advisorName', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Prof. Bhumika Patel"
                />
              </div>

              <div className="form-group-compact">
                <label>Designation / Role</label>
                <input
                  type="text"
                  value={config.advisorTitle ?? ''}
                  onChange={(e) => onChangeConfig('advisorTitle', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Faculty Advisor & Assistant Professor"
                />
              </div>

              <div className="form-group-compact">
                <label>Faculty Department</label>
                <input
                  type="text"
                  value={config.advisorOrg ?? ''}
                  onChange={(e) => onChangeConfig('advisorOrg', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. CSE & IT Department"
                />
              </div>

              <div className="sig-upload-row">
                <input
                  type="file"
                  ref={advisorSigInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, onUploadAdvisorSignature)}
                />
                <button
                  type="button"
                  className="btn-upload-sm"
                  onClick={() => advisorSigInputRef.current.click()}
                >
                  <Icons.Upload />
                  <span>{advisorSignatureImage ? 'Change Signature' : 'Upload PNG'}</span>
                </button>
                {advisorSignatureImage && (
                  <button
                    type="button"
                    className="btn-remove-sm"
                    onClick={() => onUploadAdvisorSignature(null)}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* 3. Faculty Mentor Signature Card */}
            <div className="sig-control-card">
              <div className="sig-card-header">
                <span className="sig-role-badge fac-badge">SIGNATORY 3</span>
                <strong>Faculty Mentor / Head</strong>
              </div>

              <div className="form-group-compact">
                <label>Faculty Mentor Name</label>
                <input
                  type="text"
                  value={config.mentorName ?? ''}
                  onChange={(e) => onChangeConfig('mentorName', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Dr. Pradeep Laxkar"
                />
              </div>

              <div className="form-group-compact">
                <label>Designation / Title</label>
                <input
                  type="text"
                  value={config.mentorTitle ?? ''}
                  onChange={(e) => onChangeConfig('mentorTitle', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Faculty Mentor / Head"
                />
              </div>

              <div className="form-group-compact">
                <label>Faculty Organization</label>
                <input
                  type="text"
                  value={config.mentorOrg ?? ''}
                  onChange={(e) => onChangeConfig('mentorOrg', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. ITM (sls) Baroda University"
                />
              </div>

              <div className="sig-upload-row">
                <input
                  type="file"
                  ref={mentorSigInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, onUploadMentorSignature)}
                />
                <button
                  type="button"
                  className="btn-upload-sm"
                  onClick={() => mentorSigInputRef.current.click()}
                >
                  <Icons.Upload />
                  <span>{mentorSignatureImage ? 'Change Signature' : 'Upload PNG'}</span>
                </button>
                {mentorSignatureImage && (
                  <button
                    type="button"
                    className="btn-remove-sm"
                    onClick={() => onUploadMentorSignature(null)}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
