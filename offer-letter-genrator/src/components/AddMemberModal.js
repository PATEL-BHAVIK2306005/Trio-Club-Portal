import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

// Official 5 Core Roles
export const OFFICIAL_ROLES = [
  { value: 'ADMIN', label: '👑 ADMIN (Master Administrator)' },
  { value: 'CO-LEDS', label: '👔 CO-LEDS (Leadership & Ops)' },
  { value: 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)', label: '📜 DOCUMENT-PROVIDER (Legal Advocate)' },
  { value: 'DEVLOPER(FOR ADDING NEW FEATURE)', label: '💻 DEVLOPER (For Adding New Feature)' },
  { value: 'CORE TEAM MEMBER', label: '👥 CORE TEAM MEMBER (Active Member)' }
];

export default function AddMemberModal({
  isOpen,
  onClose,
  onAddMember,
  activeOrg = 'AWS_SBG',
  departments = []
}) {
  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;

  const defaultDept = (departments && departments.length > 0 && departments[0] !== 'All') 
    ? departments.find(d => d !== 'All') 
    : ((activeClub.departments || []).find(d => d !== 'All') || 'Technical Team');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: defaultDept,
    roleType: 'Core Team Member',
    designation: '',
    isCoLead: false,
    semester: '3',
    branch: 'B.Tech CSE',
    letterRefId: '',
    responsibilities: [
      'Execute and support strategic departmental deliverables and technical workshops.',
      'Promote peer learning, open-source projects, and technical skill advancement across campus.'
    ]
  });

  const [respInput, setRespInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) {
      alert('Please provide member name and designation');
      return;
    }

    const fallbackEmail = formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in`;

    const newMember = {
      _id: `${activeOrg.toLowerCase()}-custom-${Date.now()}`,
      organization: activeOrg,
      name: formData.name.trim(),
      email: fallbackEmail,
      department: formData.department,
      roleType: formData.roleType,
      designation: formData.designation.trim(),
      isCoLead: formData.isCoLead || formData.roleType === 'Associate Coordinator',
      semester: formData.semester,
      branch: formData.branch,
      letterRefId: formData.letterRefId || `${activeClub.refPrefix}-${Math.floor(100 + Math.random() * 900)}`,
      responsibilities: formData.responsibilities
    };

    onAddMember(newMember);
    onClose();
  };

  const addResp = () => {
    if (respInput.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, respInput.trim()]
      }));
      setRespInput('');
    }
  };

  const removeResp = (idx) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== idx)
    }));
  };

  const handleRoleChange = (selectedRole) => {
    const isCoLeadRole = selectedRole === 'Associate Coordinator';
    setFormData(prev => ({
      ...prev,
      roleType: selectedRole,
      isCoLead: isCoLeadRole ? true : prev.isCoLead,
      designation: prev.designation ? prev.designation : `${selectedRole} - ${prev.department}`
    }));
  };

  const departmentsList = departments && departments.length > 0 
    ? departments.filter(d => d !== 'All') 
    : (activeClub.departments || []).filter(d => d !== 'All');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#f1f5f9',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Add New Team Member
                </h3>
                <span className="modal-club-badge" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginTop: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeClub.themeColor || '#2563eb' }}></span>
                  Adding to {activeClub.name || activeClub.shortName}
                </span>
              </div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close Modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="modal-body modal-form-grid" style={{ padding: '24px', gap: '16px' }}>
          
          {/* Full Name */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  name: newName,
                  email: prev.email ? prev.email : (newName.trim() ? `${newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in` : '')
                }));
              }}
              required
            />
          </div>

          {/* Official Email ID */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Official University Email ID <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. rahul.sharma@itmbu.ac.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Role Type */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Role Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-select"
              value={formData.roleType}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {OFFICIAL_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Designation / Letter Title */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Designation / Letter Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lead Cloud Architect / Core Member"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
          </div>

          {/* Department / Wing */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Department / Wing
            </label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Semester
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 3 or 5 or Faculty"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </div>

          {/* Branch / Degree */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Branch / Degree
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. B.Tech CSE"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />
          </div>

          {/* Letter Reference Number */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Custom Letter Ref ID <span style={{ fontWeight: 400, color: '#64748b' }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={`e.g. ${activeClub.refPrefix}-101`}
              value={formData.letterRefId}
              onChange={(e) => setFormData({ ...formData, letterRefId: e.target.value })}
            />
          </div>

          {/* Co-Lead Checkbox Card */}
          <div className="form-group full-col">
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: formData.isCoLead ? '#f0fdf4' : '#f8fafc',
              border: `1.5px solid ${formData.isCoLead ? '#86efac' : '#e2e8f0'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <input
                type="checkbox"
                checked={formData.isCoLead}
                onChange={(e) => setFormData({ ...formData, isCoLead: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0f172a', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Is Department Associate Coordinator?
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  Grants official Associate Coordinator badge & executive appointment clause in letterhead
                </span>
              </div>
            </label>
          </div>

          {/* Key Responsibilities */}
          <div className="form-group full-col">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Key Responsibilities & Deliverables
              </label>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#475569',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {formData.responsibilities.length} items
              </span>
            </div>

            <div className="resp-add-row" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add specific deliverable / responsibility..."
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addResp();
                  }
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-add-resp"
                onClick={addResp}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
              {formData.responsibilities.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                    <span style={{ color: '#0ea5e9', fontWeight: 800, marginTop: '1px' }}>•</span>
                    <span style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>
                      {r}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResp(i)}
                    title="Remove responsibility"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '6px',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer full-col" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1.5px solid #f1f5f9'
          }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              style={{
                background: '#ffffff',
                color: '#475569',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1.5px solid #0f172a',
                borderRadius: '10px',
                padding: '10px 24px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                transition: 'all 0.2s'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save & Generate Letter
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
