import React, { useState, useEffect } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

// Official System Roles with Enhanced 15-Tier RBAC
export const PROMOTABLE_ROLES = [
  { value: 'Core Team Member', label: 'Core Team Member', defaultDesig: 'Core Team Member' },
  { value: 'Associate Coordinator', label: 'Associate Coordinator (Co-Lead)', defaultDesig: 'Associate Coordinator', isCoLead: true },
  { value: 'Executive Secretary', label: 'Executive Secretary', defaultDesig: 'Executive Secretary & Documentation Head' },
  { value: 'Treasurer & Finance Head', label: 'Treasurer & Finance Head', defaultDesig: 'Treasurer & Finance Controller' },
  { value: 'Technical Lead & Architect', label: 'Technical Lead & Architect', defaultDesig: 'Technical Lead & Cloud Architect' },
  { value: 'Creative & Media Director', label: 'Creative & Media Director', defaultDesig: 'Director of Creative & Media Strategy' },
  { value: 'Outreach & PR Head', label: 'Outreach & PR Head', defaultDesig: 'Head of Outreach & Public Relations' },
  { value: 'Club Head', label: 'Club Head (Department/Wing Lead)', defaultDesig: 'Head of Department' },
  { value: 'University Event + Club Coordinator', label: 'University Event + Club Coordinator', defaultDesig: 'Lead University Coordinator' },
  { value: 'Organizer', label: 'Lead Organizer / President', defaultDesig: 'Lead Organizer & President' },
  { value: 'Advisor', label: 'Student / Senior Advisor', defaultDesig: 'Student Advisor' },
  { value: 'Admin', label: 'Section Administrator', defaultDesig: 'Club Administrator' },
  { value: 'Faculty Mentor', label: 'Faculty Mentor / Patron', defaultDesig: 'Faculty Mentor' }
];

export default function PromoteMemberModal({
  isOpen,
  onClose,
  member,
  onPromoteMember,
  activeOrg = 'AWS_SBG',
  departments = []
}) {
  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: isAWS ? 'Technical Team' : 'Robotics & IoT Wing',
    roleType: 'Core Team Member',
    designation: 'Core Team Member',
    isCoLead: false,
    semester: '3',
    branch: 'B.Tech CSE',
    letterRefId: '',
    responsibilities: [
      'Execute departmental deliverables, hands-on cloud tracks, and campus workshops.',
      'Mentor peer students in software engineering, technical projects, and university initiatives.'
    ]
  });

  const [respInput, setRespInput] = useState('');

  // Load member data on open
  useEffect(() => {
    if (member) {
      const generatedRef = member.letterRefId || `${activeClub.refPrefix}-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackEmail = member.email || (member.name ? `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in` : '');
      setFormData({
        name: member.name || '',
        email: fallbackEmail,
        department: member.department && member.department !== 'General / Unassigned' ? member.department : (isAWS ? 'Technical Team' : 'Robotics & IoT Wing'),
        roleType: 'Core Team Member',
        designation: `Core Member - ${member.department && member.department !== 'General / Unassigned' ? member.department : (isAWS ? 'Technical Team' : 'Robotics & IoT Wing')}`,
        isCoLead: false,
        semester: member.semester || '3',
        branch: member.branch || 'B.Tech CSE',
        letterRefId: generatedRef,
        responsibilities: member.responsibilities && member.responsibilities.length > 0 ? member.responsibilities : [
          'Execute departmental deliverables, hands-on technical tracks, and campus workshops.',
          'Mentor peer students in engineering workflows, open-source projects, and university initiatives.'
        ]
      });
    }
  }, [member, activeOrg, isAWS, activeClub.refPrefix]);

  if (!isOpen || !member) return null;

  const handleRoleChange = (newRole) => {
    const roleConfig = PROMOTABLE_ROLES.find(r => r.value === newRole);
    setFormData(prev => ({
      ...prev,
      roleType: newRole,
      designation: roleConfig ? `${roleConfig.defaultDesig} - ${prev.department}` : prev.designation,
      isCoLead: Boolean(roleConfig?.isCoLead)
    }));
  };

  const handleDepartmentChange = (newDept) => {
    setFormData(prev => ({
      ...prev,
      department: newDept,
      designation: `${prev.roleType} - ${newDept}`
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.designation.trim()) {
      alert('Please specify an official designation for the promoted role.');
      return;
    }

    const updatedMember = {
      ...member,
      _id: member._id || member.id || `custom-${Date.now()}`,
      id: member.id || member._id || `custom-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in`,
      department: formData.department,
      roleType: formData.roleType,
      designation: formData.designation.trim(),
      isCoLead: formData.isCoLead,
      semester: formData.semester,
      branch: formData.branch,
      letterRefId: formData.letterRefId,
      status: 'Issued & Active',
      responsibilities: formData.responsibilities,
      organization: member.organization || activeOrg
    };

    onPromoteMember(updatedMember, member);
    onClose();
  };

  const departmentsList = departments && departments.length > 0 
    ? departments.filter(d => d !== 'All') 
    : (activeClub.departments || []).filter(d => d !== 'All');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
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
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Promote Member & Issue Appointment
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
                  Authority: Organizer / Lead ({activeClub.name || activeClub.shortName})
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

        {/* Current Member Info Banner */}
        <div style={{
          margin: '18px 24px 0 24px',
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Candidate for Promotion:
            </span>
            <h4 style={{ margin: '2px 0 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 800 }}>{member.name}</h4>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
              {formData.email || member.email || 'Student Account'} &bull; Semester {member.semester || '3'}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 700 }}>Current Status:</span>
            <span style={{
              background: '#f1f5f9',
              color: '#334155',
              border: '1.5px solid #cbd5e1',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11.5px',
              fontWeight: 700,
              display: 'inline-block',
              marginTop: '2px'
            }}>
              {member.roleType || 'General Member'}
            </span>
          </div>
        </div>

        {/* Promotion Form */}
        <form onSubmit={handleSubmit} className="modal-body modal-form-grid" style={{ padding: '20px 24px 24px 24px', gap: '16px' }}>
          
          {/* Promoted Role Selection */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Select Promoted Role Tier <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-select"
              value={formData.roleType}
              onChange={(e) => handleRoleChange(e.target.value)}
              required
            >
              {PROMOTABLE_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Department / Wing */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Assigned Department / Wing <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Official Designation */}
          <div className="form-group full-col">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Official Letterhead Designation / Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Associate Coordinator - Technical Team"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
          </div>

          {/* Official Email ID */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Recipient Official Email ID <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. student@itmbu.ac.in"
              required
            />
          </div>

          {/* Letter Reference Number */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Appointment Letter Ref No. <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.letterRefId}
              onChange={(e) => setFormData({ ...formData, letterRefId: e.target.value })}
              required
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
                  Grant Associate Coordinator Executive Clause in Letter
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  Designates candidate with executive authority and co-lead signatory block
                </span>
              </div>
            </label>
          </div>

          {/* Responsibilities */}
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
                placeholder="Add specific leadership task / milestone..."
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

          {/* Actions */}
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
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Confirm Promotion & Issue Letter
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
