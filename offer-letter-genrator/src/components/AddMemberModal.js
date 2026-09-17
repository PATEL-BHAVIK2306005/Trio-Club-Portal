import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

// Official System Roles with Enhanced 15-Tier RBAC
export const OFFICIAL_ROLES = [
  { value: 'Organizer', label: '🚀 Organizer (Lead / President)' },
  { value: 'Associate Coordinator', label: '⭐ Associate Coordinator' },
  { value: 'Executive Secretary', label: '📜 Executive Secretary' },
  { value: 'Treasurer & Finance Head', label: '💰 Treasurer & Finance Head' },
  { value: 'Technical Lead & Architect', label: '💻 Technical Lead & Architect' },
  { value: 'Creative & Media Director', label: '🎨 Creative & Media Director' },
  { value: 'Outreach & PR Head', label: '🌐 Outreach & PR Head' },
  { value: 'Core Team Member', label: '👥 Core Team Member' },
  { value: 'Club Head', label: '👑 Club Head (Department/Wing Lead)' },
  { value: 'University Event + Club Coordinator', label: '🎯 University Event + Club Coordinator' },
  { value: 'Auditor & Compliance Officer', label: '👁️ Auditor & Compliance Officer' },
  { value: 'Advisor', label: '🎓 Advisor' },
  { value: 'Admin', label: '🛡️ Admin' },
  { value: 'General Member', label: '👤 General Member' },
  { value: 'Faculty Mentor', label: '🏛️ Faculty Mentor / Patron' }
];

export default function AddMemberModal({
  isOpen,
  onClose,
  onAddMember,
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
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>➕ Add New Team Member</h3>
            <span className={`modal-club-badge ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
              Adding to {activeClub.shortName}
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body modal-form-grid">
          
          {/* Full Name */}
          <div className="form-group">
            <label>Full Name *</label>
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
            <label>Official Student / University Email ID *</label>
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
            <label>Role Type *</label>
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
            <label>Designation / Letter Title *</label>
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
            <label>Department / Wing</label>
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
            <label>Semester</label>
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
            <label>Branch / Degree</label>
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
            <label>Custom Letter Ref ID (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder={`e.g. ${activeClub.refPrefix}-101`}
              value={formData.letterRefId}
              onChange={(e) => setFormData({ ...formData, letterRefId: e.target.value })}
            />
          </div>

          {/* Co-Lead Checkbox */}
          <div className="form-group full-col">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isCoLead}
                onChange={(e) => setFormData({ ...formData, isCoLead: e.target.checked })}
              />
              <span>Is Department Associate Coordinator? (Grants Associate Coordinator tag & executive letterhead clause)</span>
            </label>
          </div>

          {/* Key Responsibilities */}
          <div className="form-group full-col">
            <label>Key Responsibilities</label>
            <div className="resp-add-row">
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

          <div className="modal-footer full-col">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn-primary-action ${isAWS ? 'btn-aws-bg' : 'btn-techno-bg'}`}>
              💾 Save & Generate Letter
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
