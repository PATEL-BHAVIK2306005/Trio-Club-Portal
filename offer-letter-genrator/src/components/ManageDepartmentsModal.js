import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import Swal from 'sweetalert2';

export default function ManageDepartmentsModal({
  isOpen,
  onClose,
  activeOrg = 'AWS_SBG',
  departments = [],
  members = [],
  onAddDepartment,
  onDeleteDepartment
}) {
  const [newDeptName, setNewDeptName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';

  const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);
  const activeDeptsList = departments.filter(d => d !== 'All');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid department name.');
      return;
    }

    if (activeDeptsList.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('A department with this name already exists.');
      return;
    }

    setErrorMsg('');
    onAddDepartment(trimmed, activeOrg);
    setNewDeptName('');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Department "${trimmed}" added!`,
      showConfirmButton: false,
      timer: 2000,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  const handleDeleteClick = async (deptName) => {
    const memberCount = orgMembers.filter(m => m.department === deptName).length;

    const result = await Swal.fire({
      title: `Delete "${deptName}"?`,
      html: memberCount > 0 
        ? `<p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5;">⚠️ <strong>${memberCount} member(s)</strong> currently belong to this department.<br/>Deleting it will reassign them to <em>"General / Unassigned"</em>.</p>`
        : `<p style="color: #cbd5e1; font-size: 13.5px;">Are you sure you want to remove this department wing from <strong>${activeClub.shortName}</strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete Department',
      cancelButtonText: 'Cancel',
      background: '#101626',
      color: '#f8fafc'
    });

    if (result.isConfirmed) {
      onDeleteDepartment(deptName, activeOrg);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Department "${deptName}" removed.`,
        showConfirmButton: false,
        timer: 2000,
        background: '#101626',
        color: '#f8fafc'
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container dept-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <span className={`modal-org-pill ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
              {activeClub.shortName} &bull; WINGS & DEPARTMENTS
            </span>
            <h3>🏢 Manage Club Departments</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close Modal">✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          
          {/* Section 1: Add Department Form */}
          <form className="add-dept-form-box" onSubmit={handleAddSubmit}>
            <label className="dept-form-label">➕ CREATE NEW DEPARTMENT / WING</label>
            <div className="add-dept-input-row">
              <input
                type="text"
                className="dept-text-input"
                placeholder="e.g. AI & Cloud Security Wing, Research Division..."
                value={newDeptName}
                onChange={(e) => {
                  setNewDeptName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
              <button
                type="submit"
                className={`btn-add-dept-submit ${isAWS ? 'btn-aws-primary' : 'btn-techno-primary'}`}
              >
                Add Wing
              </button>
            </div>
            {errorMsg && <p className="dept-error-msg">{errorMsg}</p>}
          </form>

          {/* Section 2: Active Departments List */}
          <div className="existing-depts-section">
            <div className="depts-list-header">
              <span>ACTIVE DEPARTMENTS IN {activeClub.shortName.toUpperCase()} ({activeDeptsList.length})</span>
              <small>Click 🗑️ to remove a wing</small>
            </div>

            <div className="depts-scroll-list">
              {activeDeptsList.map((dept) => {
                const count = orgMembers.filter(m => m.department === dept).length;
                return (
                  <div key={dept} className="dept-item-card">
                    <div className="dept-item-info">
                      <span className="dept-folder-icon">📂</span>
                      <strong className="dept-name-text">{dept}</strong>
                      <span className={`dept-count-badge ${count > 0 ? 'active-count' : 'empty-count'}`}>
                        {count} {count === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn-delete-dept"
                      onClick={() => handleDeleteClick(dept)}
                      title={`Delete ${dept}`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
}
