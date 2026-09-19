import React, { useState, useEffect } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

// Official System Roles with Enhanced 15-Tier RBAC
export const PROMOTABLE_ROLES = [
  { value: 'Core Team Member', label: '👥 Core Team Member', defaultDesig: 'Core Team Member' },
  { value: 'Associate Coordinator', label: '⭐ Associate Coordinator', defaultDesig: 'Associate Coordinator', isCoLead: true },
  { value: 'Executive Secretary', label: '📜 Executive Secretary', defaultDesig: 'Executive Secretary & Documentation Head' },
  { value: 'Treasurer & Finance Head', label: '💰 Treasurer & Finance Head', defaultDesig: 'Treasurer & Finance Controller' },
  { value: 'Technical Lead & Architect', label: '💻 Technical Lead & Architect', defaultDesig: 'Technical Lead & Cloud Architect' },
  { value: 'Creative & Media Director', label: '🎨 Creative & Media Director', defaultDesig: 'Director of Creative & Media Strategy' },
  { value: 'Outreach & PR Head', label: '🌐 Outreach & PR Head', defaultDesig: 'Head of Outreach & Public Relations' },
  { value: 'Club Head', label: '👑 Club Head (Department/Wing Lead)', defaultDesig: 'Head of Department' },
  { value: 'University Event + Club Coordinator', label: '🎯 University Event + Club Coordinator', defaultDesig: 'Lead University Coordinator' },
  { value: 'Organizer', label: '🚀 Lead Organizer / President', defaultDesig: 'Lead Organizer & President' },
  { value: 'Advisor', label: '🎓 Student / Senior Advisor', defaultDesig: 'Student Advisor' },
  { value: 'Admin', label: '🛡️ Section Administrator', defaultDesig: 'Club Administrator' },
  { value: 'Faculty Mentor', label: '🏛️ Faculty Mentor / Patron', defaultDesig: 'Faculty Mentor' }
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
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>🌟 Promote Member & Issue Appointment</h3>
            <span className={`modal-club-badge ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
              Authority: Organizer / Associate Coordinator ({activeClub.shortName})
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Current Member Info Banner */}
        <div className="promote-current-member-banner" style={{ margin: '16px 24px 0 24px', background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate for Promotion:</span>
            <h4 style={{ margin: '2px 0 0 0', color: '#f8fafc', fontSize: '16px', fontWeight: 800 }}>{member.name}</h4>
            <span style={{ fontSize: '12px', color: '#38bdf8' }}>{formData.email || member.email || 'Student Account'} &bull; Semester {member.semester || '3'}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Current Status:</span>
            <span className="tag-general-member" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
              {member.roleType || 'General Member'}
            </span>
          </div>
        </div>

        {/* Promotion Form */}
        <form onSubmit={handleSubmit} className="modal-body modal-form-grid" style={{ paddingTop: '16px' }}>
          
          {/* Promoted Role Selection */}
          <div className="form-group">
            <label style={{ color: '#38bdf8', fontWeight: 700 }}>🌟 Select Promoted Role Tier *</label>
            <select
              className="form-select"
              value={formData.roleType}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{ borderColor: '#38bdf8' }}
              required
            >
              {PROMOTABLE_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Department / Wing */}
          <div className="form-group">
            <label>Assigned Department / Wing *</label>
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
            <label>Official Letterhead Designation / Title *</label>
            <input
              type="text"
              className="form-input form-input-live-edit"
              placeholder="e.g. Associate Coordinator - Technical Team"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
          </div>

          {/* Official Email ID */}
          <div className="form-group">
            <label>Recipient Official Email ID *</label>
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
            <label>Appointment Letter Ref No. *</label>
            <input
              type="text"
              className="form-input"
              value={formData.letterRefId}
              onChange={(e) => setFormData({ ...formData, letterRefId: e.target.value })}
              required
            />
          </div>

          {/* Co-Lead Privilege Checkbox */}
          <div className="form-group full-col" style={{ display: 'flex', alignItems: 'center', paddingTop: '10px' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isCoLead}
                onChange={(e) => setFormData({ ...formData, isCoLead: e.target.checked })}
              />
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>Grant Associate Coordinator Executive Clause in Letter</span>
            </label>
          </div>

          {/* Responsibilities */}
          <div className="form-group full-col">
            <label>Key Responsibilities & Deliverables</label>
            <div className="resp-add-row">
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
              />
              <button type="button" className="btn-add-resp" onClick={addResp}>Add</button>
            </div>

            <ul className="resp-pill-list">
              {formData.responsibilities.map((r, i) => (
                <li key={i}>
                  <span>• {r}</span>
                  <button type="button" onClick={() => removeResp(i)}>✕</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="modal-footer full-col">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn-primary-action ${isAWS ? 'btn-aws-bg' : 'btn-techno-bg'}`}>
              🌟 Confirm Promotion & Issue Official Letter
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
