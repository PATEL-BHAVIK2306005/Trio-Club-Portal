import React, { useRef, useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

export default function LetterControls({
  member,
  config,
  clubConfig = CLUB_CONFIGS.AWS_SBG,
  onChangeConfig,
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
  onDownloadPdf
}) {
  const organizerSigInputRef = useRef(null);
  const advisorSigInputRef = useRef(null);
  const mentorSigInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('fields'); // 'fields', 'signatures', 'branding'

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

  const isAWS = clubConfig.id === 'AWS_SBG';

  return (
    <div className="controls-panel">
      {/* Controls Header */}
      <div className="controls-header">
        <div className="controls-title-group">
          <h3 className="controls-title">Letter Customization &amp; Signatures</h3>
          <span className="controls-subtitle">
            Configuring for: <strong>{member ? member.name : 'Select Member'}</strong> ({clubConfig.shortName})
          </span>
        </div>

        <div className="letter-header-actions">
          <button className="btn-print-secondary" onClick={onPrint} title="Quick print or standard system PDF dialog">
            🖨️ Print
          </button>
          <button 
            className={`btn-print-primary ${isAWS ? 'btn-aws-primary' : 'btn-techno-primary'}`} 
            onClick={onDownloadPdf} 
            title="Download direct high-resolution Full HD PDF document"
          >
            📥 Download FHD PDF
          </button>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="controls-subtabs">
        <button
          className={`control-tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
          onClick={() => setActiveTab('fields')}
        >
          📝 Letter Details
        </button>
        <button
          className={`control-tab-btn ${activeTab === 'signatures' ? 'active' : ''}`}
          onClick={() => setActiveTab('signatures')}
        >
          ✍️ Signatures (Organizer, Advisor, Mentor)
        </button>
      </div>

      <div className="controls-body">
        
        {/* TAB 1: LETTER FIELDS */}
        {activeTab === 'fields' && (
          <div className="fields-tab-container">
            <div className="fields-notice-banner">
              <span className="notice-icon">ℹ️</span>
              <span><strong>Note:</strong> Member details (Designation, Wing, Reference Number) are managed in <strong>Team Management</strong>. Only <strong>Issue Date</strong> and <strong>Official Email ID</strong> are modified here for generation.</span>
            </div>

            <div className="fields-grid">
              {/* EDITABLE 1: ISSUE DATE */}
              <div className="form-group editable-highlight-group">
                <label className="field-label-editable">
                  <span>📅 Issue Date</span>
                  <span className="editable-pill-badge">✏️ Live Editable</span>
                </label>
                <input
                  type="text"
                  value={config.issueDate || ''}
                  onChange={(e) => onChangeConfig('issueDate', e.target.value)}
                  placeholder="e.g. 16 September 2026"
                  className="form-input form-input-live-edit"
                />
              </div>

              {/* EDITABLE 2: OFFICIAL CHAPTER CONTACT EMAIL ID */}
              <div className="form-group editable-highlight-group">
                <label className="field-label-editable">
                  <span>✉️ Chapter Contact Email</span>
                  <span className="editable-pill-badge">✏️ Live Editable</span>
                </label>
                <input
                  type="email"
                  value={config.contactEmail || clubConfig.email}
                  onChange={(e) => onChangeConfig('contactEmail', e.target.value)}
                  placeholder={isAWS ? 'aws.itmbu@gmail.com' : 'technolabclub25@gmail.com'}
                  className="form-input form-input-live-edit"
                />
              </div>

              {/* EDITABLE 2b: RECIPIENT STUDENT EMAIL ID */}
              <div className="form-group editable-highlight-group">
                <label className="field-label-editable">
                  <span>🎓 Recipient Student Email</span>
                  <span className="editable-pill-badge">✏️ Live Editable</span>
                </label>
                <input
                  type="email"
                  value={member?.email || (member?.name ? `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in` : '')}
                  onChange={(e) => onChangeConfig('memberEmail', e.target.value)}
                  placeholder="e.g. student@itmbu.ac.in"
                  className="form-input form-input-live-edit"
                />
              </div>

              {/* EDITABLE 3: CHAPTER SUBTITLE / AFFILIATION */}
              <div className="form-group editable-highlight-group full-col">
                <label className="field-label-editable">
                  <span>🏷️ Letterhead Chapter Subtitle & Affiliation Line</span>
                  <span className="editable-pill-badge">✏️ Live Editable</span>
                </label>
                <input
                  type="text"
                  value={config.subtitle !== undefined ? config.subtitle : clubConfig.subtitle}
                  onChange={(e) => onChangeConfig('subtitle', e.target.value)}
                  placeholder={clubConfig.subtitle}
                  className="form-input form-input-live-edit"
                />
              </div>

              {/* LOCKED 1: LETTER REFERENCE NUMBER */}
              <div className="form-group locked-field-group">
                <label className="field-label-locked">
                  <span>Letter Reference Number</span>
                  <span className="locked-pill-badge">🔒 In Team Profile</span>
                </label>
                <input
                  type="text"
                  value={member ? (member.letterRefId || `${clubConfig.refPrefix}-${member._id?.substring(0, 5) || '001'}`) : (config.letterRefId || '')}
                  readOnly
                  disabled
                  className="form-input form-input-locked"
                  title="Reference IDs are configured in Team Management profile"
                />
              </div>

              {/* LOCKED 2: DESIGNATION */}
              <div className="form-group locked-field-group">
                <label className="field-label-locked">
                  <span>Designation</span>
                  <span className="locked-pill-badge">🔒 In Team Profile</span>
                </label>
                <input
                  type="text"
                  value={member ? member.designation : ''}
                  readOnly
                  disabled
                  className="form-input form-input-locked"
                  title="Member designation is edited in Team Management"
                />
              </div>

              {/* LOCKED 3: DEPARTMENT / WING */}
              <div className="form-group locked-field-group">
                <label className="field-label-locked">
                  <span>Department / Wing</span>
                  <span className="locked-pill-badge">🔒 In Team Profile</span>
                </label>
                <input
                  type="text"
                  value={member ? member.department : ''}
                  readOnly
                  disabled
                  className="form-input form-input-locked"
                  title="Department is edited in Team Management"
                />
              </div>

              {/* LOCKED 4: ACADEMIC TENURE */}
              <div className="form-group locked-field-group">
                <label className="field-label-locked">
                  <span>Academic Tenure</span>
                  <span className="locked-pill-badge">🔒 Fixed Config</span>
                </label>
                <input
                  type="text"
                  value={config.tenure || clubConfig.academicYear || 'Academic Year 2026 – 2027'}
                  readOnly
                  disabled
                  className="form-input form-input-locked"
                  title="Academic tenure for official joining letters"
                />
              </div>
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
                  placeholder="e.g. AWS SBG Leader / Organizer"
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
                  {organizerSignatureImage ? '🔄 Change Signature' : '✍️ Upload Signature PNG'}
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

            {/* 2. ADVISOR SIGNATURE CARD (Advisor Section) */}
            <div className="sig-control-card highlight-advisor-card">
              <div className="sig-card-header">
                <span className="sig-role-badge advisor-badge">SIGNATORY 2 (ADVISOR)</span>
                <strong>Advisor Section</strong>
              </div>

              <div className="form-group-compact">
                <label>Advisor Name</label>
                <input
                  type="text"
                  value={config.advisorName ?? ''}
                  onChange={(e) => onChangeConfig('advisorName', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Vansham Kamboj / Mannan Chauhan"
                />
              </div>

              <div className="form-group-compact">
                <label>Advisor Title</label>
                <input
                  type="text"
                  value={config.advisorTitle ?? ''}
                  onChange={(e) => onChangeConfig('advisorTitle', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. Student Advisor / Mentor"
                />
              </div>

              <div className="form-group-compact">
                <label>Advisor Organization</label>
                <input
                  type="text"
                  value={config.advisorOrg ?? ''}
                  onChange={(e) => onChangeConfig('advisorOrg', e.target.value)}
                  className="form-input-sm"
                  placeholder="e.g. AWS SBG ITMBU"
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
                  {advisorSignatureImage ? '🔄 Change Signature' : '✍️ Upload Advisor Signature'}
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
                <span className="sig-role-badge mentor-badge">SIGNATORY 3</span>
                <strong>Faculty Mentor</strong>
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
                <label>Faculty Title</label>
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
                  {mentorSignatureImage ? '🔄 Change Signature' : '✍️ Upload Mentor Signature'}
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
