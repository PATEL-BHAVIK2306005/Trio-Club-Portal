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
  const isAWS = activeOrg === 'AWS_SBG';

  // Filter for active organization
  const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);

  const targetMembers = selectedDept === 'All'
    ? orgMembers
    : orgMembers.filter(m => m.department === selectedDept);

  const departmentsList = activeClub.departments || ['All'];

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-group">
            <h3>⚡ Batch Joining Letter Print & Export</h3>
            <span className="modal-club-badge">{activeClub.name}</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Select a department to generate and print official joining letters in one batch for <strong>{activeClub.name}</strong>.
          </p>

          <div className="form-group">
            <label>Filter By Department</label>
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

          <div className="batch-preview-list">
            <strong>Members queued for print ({targetMembers.length}):</strong>
            <ul>
              {targetMembers.map(m => (
                <li key={m._id || m.name}>
                  <span className="batch-member-name">{m.name}</span>
                  <span className="batch-role-tag">{m.designation}</span>
                  {m.isCoLead && <span className="batch-colead-badge">ASSOC COORD</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className={`btn-primary-action ${isAWS ? 'btn-aws-bg' : 'btn-techno-bg'}`}
            onClick={() => {
              onBatchPrint(targetMembers);
              onClose();
            }}
          >
            🖨️ Print {targetMembers.length} {activeClub.shortName} Letters Now
          </button>
        </div>
      </div>
    </div>
  );
}
