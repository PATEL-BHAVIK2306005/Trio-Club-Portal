import React, { useState, useEffect } from 'react';
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

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  onSaveMember,
  activeOrg = 'AWS_SBG',
  departments = []
}) {
  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Technical Team',
    roleType: 'Core Team Member',
    designation: '',
    isCoLead: false,
    semester: '3',
    branch: 'B.Tech CSE',
    letterRefId: '',
    responsibilities: []
  });

  const [respInput, setRespInput] = useState('');

  // Load member data when modal opens or member changes
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || (member.name ? `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in` : ''),
        department: member.department || 'Technical Team',
        roleType: member.roleType || 'Core Team Member',
        designation: member.designation || '',
        isCoLead: Boolean(member.isCoLead),
        semester: member.semester || '3',
        branch: member.branch || 'B.Tech CSE',
        letterRefId: member.letterRefId || '',
        responsibilities: member.responsibilities ? [...member.responsibilities] : []
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) {
      alert('Please provide member name and designation');
      return;
    }

    const updatedMember = {
      ...member,
      name: formData.name.trim(),
      email: formData.email.trim() || `${formData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in`,
      department: formData.department,
      roleType: formData.roleType,
      designation: formData.designation.trim(),
      isCoLead: formData.isCoLead || formData.roleType === 'Associate Coordinator',
      semester: formData.semester,
      branch: formData.branch,
      letterRefId: formData.letterRefId,
      responsibilities: formData.responsibilities,
      organization: activeOrg
    };

    onSaveMember(updatedMember);
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

  const departmentsList = departments && departments.length > 0 
    ? departments.filter(d => d !== 'All') 
    : (activeClub.departments || []).filter(d => d !== 'All');

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>✏️ Edit Team Member Profile</h3>
            <span className={`modal-club-badge ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
              {activeClub.shortName} &bull; {member.name}
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body modal-form-grid">
          
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Official Email ID *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. member@itmbu.ac.in"
              required
            />
          </div>

          <div className="form-group">
            <label>Role Type *</label>
            <select
              className="form-select"
              value={formData.roleType}
              onChange={(e) => setFormData({ ...formData, roleType: e.target.value, isCoLead: e.target.value === 'Associate Coordinator' ? true : formData.isCoLead })}
            >
              {OFFICIAL_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Designation / Letter Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
          </div>

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

          <div className="form-group">
            <label>Semester</label>
            <input
              type="text"
              className="form-input"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Branch / Degree</label>
            <input
              type="text"
              className="form-input"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Letter Reference ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.letterRefId}
              onChange={(e) => setFormData({ ...formData, letterRefId: e.target.value })}
            />
          </div>

          <div className="form-group full-col">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isCoLead}
                onChange={(e) => setFormData({ ...formData, isCoLead: e.target.checked })}
              />
              <span>Is Department Associate Coordinator? (Grants Associate Coordinator tag & executive clause in letter)</span>
            </label>
          </div>

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
              💾 Save Changes & Update Letter
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
