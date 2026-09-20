import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

export default function BatchGeneratorModal({
  isOpen,
  onClose,
  members,
  onBatchPrint,
  activeOrg = 'AWS_SBG'
}) {
  const [selectedDept, setSelectedDept] = useState('All');

  if (!isOpen) return null;

  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;

  // Filter for active organization
  const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);

  const targetMembers = selectedDept === 'All'
    ? orgMembers
    : orgMembers.filter(m => m.department === selectedDept);

  const departmentsList = activeClub.departments || ['All'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        
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
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Batch Letter Print & Export
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
                  {activeClub.name || activeClub.shortName}
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
        <div className="modal-body" style={{ padding: '24px', gap: '16px' }}>
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            Select a department to generate and print official joining letters in one batch for <strong>{activeClub.name}</strong>.
          </p>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Filter By Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-select"
            >
              {departmentsList.map(dept => {
                const count = dept === 'All'
                  ? orgMembers.length
                  : orgMembers.filter(m => m.department === dept).length;
                return (
                  <option key={dept} value={dept}>
                    {dept === 'All' ? `All ${activeClub.shortName} Members (${count})` : `${dept} (${count})`}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 800 }}>
                Members queued for print ({targetMembers.length}):
              </strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {targetMembers.map(m => (
                <div
                  key={m._id || m.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', display: 'block' }}>{m.name}</span>
                    <span style={{ color: '#64748b', fontSize: '11.5px' }}>{m.designation}</span>
                  </div>
                  {m.isCoLead && (
                    <span style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      ASSOC COORD
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
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
            type="button"
            className="btn-primary-action"
            onClick={() => {
              onBatchPrint(targetMembers);
              onClose();
            }}
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
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print {targetMembers.length} {activeClub.shortName} Letters Now
          </button>
        </div>

      </div>
    </div>
  );
}
