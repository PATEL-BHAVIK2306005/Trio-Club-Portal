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
      background: '#ffffff',
      color: '#0f172a'
    });
  };

  const handleDeleteClick = async (deptName) => {
    const memberCount = orgMembers.filter(m => m.department === deptName).length;

    const result = await Swal.fire({
      title: `Delete "${deptName}"?`,
      html: memberCount > 0 
        ? `<p style="color: #475569; font-size: 13.5px; line-height: 1.5;">⚠️ <strong>${memberCount} member(s)</strong> currently belong to this department.<br/>Deleting it will reassign them to <em>"General / Unassigned"</em>.</p>`
        : `<p style="color: #475569; font-size: 13.5px;">Are you sure you want to remove this department wing from <strong>${activeClub.shortName}</strong>?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#0f172a',
      confirmButtonText: 'Yes, Delete Department',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      color: '#0f172a'
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
        background: '#ffffff',
        color: '#0f172a'
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container dept-modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
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
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Manage Club Departments
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
                  {activeClub.name || activeClub.shortName} &bull; Wings & Divisions
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

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '24px', gap: '20px' }}>
          
          {/* Section 1: Add Department Form */}
          <form className="add-dept-form-box" onSubmit={handleAddSubmit} style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>
              Create New Department / Wing
            </label>
            <div className="add-dept-input-row" style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. AI & Cloud Security Wing, Research..."
                value={newDeptName}
                onChange={(e) => {
                  setNewDeptName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 18px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Wing
              </button>
            </div>
            {errorMsg && <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, margin: '6px 0 0 0' }}>{errorMsg}</p>}
          </form>

          {/* Section 2: Active Departments List */}
          <div className="existing-depts-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Active Departments in {activeClub.shortName} ({activeDeptsList.length})
              </span>
              <small style={{ color: '#64748b', fontSize: '11px', fontWeight: 500 }}>Click trash icon to delete</small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {activeDeptsList.map((dept) => {
                const count = orgMembers.filter(m => m.department === dept).length;
                return (
                  <div
                    key={dept}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569'
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{dept}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: count > 0 ? '#e0f2fe' : '#f1f5f9',
                        color: count > 0 ? '#0284c7' : '#64748b'
                      }}>
                        {count} {count === 1 ? 'member' : 'members'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(dept)}
                        title={`Delete ${dept}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '6px',
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
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '16px 24px',
          borderTop: '1.5px solid #f1f5f9'
        }}>
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
}
