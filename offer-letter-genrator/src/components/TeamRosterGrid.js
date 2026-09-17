import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

export default function TeamRosterGrid({
  members,
  selectedMember,
  onSelectMember,
  onOpenBatchModal,
  onOpenAddMemberModal,
  onOpenPromoteModal,
  activeOrg = 'AWS_SBG',
  currentUser = null
}) {
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';

  // Can current user promote members?
  const canPromote = Boolean(
    currentUser && (
      currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ORGANIZER' ||
      currentUser.role === 'CO_LEAD' ||
      currentUser.role === 'ADMIN' ||
      currentUser.username?.toLowerCase().includes('organizer') ||
      currentUser.username?.toLowerCase().includes('lead') ||
      currentUser.username?.toLowerCase().includes('admin')
    )
  );

  // Filter members by current active organization first, then department and search
  const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);

  const filteredMembers = orgMembers.filter(member => {
    const matchesDept = selectedDept === 'All' || member.department === selectedDept;
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (member.designation && member.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (member.department && member.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (member.roleType && member.roleType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const getDeptColor = (dept) => {
    switch (dept) {
      case 'Executive Leadership':
      case 'Core Leadership': return isAWS ? '#ff9900' : '#00d2ff';
      case 'Event Management':
      case 'Outreach & Event Operations': return '#10b981';
      case 'Technical Team':
      case 'Robotics & IoT Wing': return '#f59e0b';
      case 'Designing Team':
      case 'Creative & Media Wing': return '#8b5cf6';
      case 'Social Media + HOST':
      case 'AI & Machine Learning Wing': return '#06b6d4';
      case 'Outreach and PR':
      case 'Web & App Development': return '#3b82f6';
      case 'Community Partner':
      case 'Cyber Security & CP Wing': return '#ec4899';
      case 'Faculty Mentors':
      case 'Advisory & Mentors': return '#f97316';
      case 'General / Unassigned': return '#eab308';
      default: return '#38bdf8';
    }
  };

  const departmentsList = activeClub.departments || ['All'];

  return (
    <div className="roster-panel">
      
      {/* Top Header: Title, Counter & Action Buttons */}
      <div className="roster-header">
        <div className="roster-title-box">
          <div className="roster-title-row">
            <span className={`org-chip-pill ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
              {activeClub.shortName}
            </span>
            <h2 className="roster-title">Core Team Roster</h2>
          </div>
          <span className="roster-counter">{filteredMembers.length} Members in {activeClub.shortName}</span>
        </div>
        
        <div className="roster-header-actions">
          {onOpenAddMemberModal && (
            <button
              className="btn-add-member"
              title="Add New Team Member"
              onClick={onOpenAddMemberModal}
            >
              ➕ Add Member
            </button>
          )}

          <button className={`btn-batch-generate ${isAWS ? 'btn-aws-bg' : 'btn-techno-bg'}`} onClick={onOpenBatchModal}>
            <span>⚡ Batch Print</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder={`🔍 Search ${activeClub.shortName} members by name or role...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="btn-clear-search" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      {/* Department Tabs */}
      <div className="dept-tabs-scroll">
        {departmentsList.map((dept) => {
          const count = dept === 'All'
            ? orgMembers.length
            : orgMembers.filter(m => m.department === dept).length;

          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`dept-tab-btn ${selectedDept === dept ? 'active' : ''}`}
            >
              <span
                className="dept-color-dot"
                style={{ backgroundColor: getDeptColor(dept) }}
              ></span>
              <span className="dept-name">{dept}</span>
              <span className="dept-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Member Cards List */}
      <div className="roster-grid">
        {filteredMembers.length === 0 ? (
          <div className="empty-roster-state">
            <p>No members found matching your search.</p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isSelected = selectedMember && (
              (selectedMember._id && member._id && selectedMember._id === member._id) ||
              (selectedMember.id && member.id && selectedMember.id === member.id) ||
              (selectedMember.name && member.name && selectedMember.name.trim().toLowerCase() === member.name.trim().toLowerCase())
            );
            const deptColor = getDeptColor(member.department);
            const isGeneral = member.roleType === 'General Member';

            return (
              <div
                key={member._id || member.name}
                className={`member-card ${isSelected ? 'selected' : ''} ${member.isCoLead ? 'is-colead-card' : ''} ${isGeneral ? 'is-general-card' : ''}`}
                onClick={() => onSelectMember(member)}
                style={{ borderLeftColor: deptColor }}
              >
                <div className="card-top-row">
                  <div className="member-name-heading">
                    <span className="name-text">{member.name}</span>
                    {member.isCoLead && (
                      <span className="badge-colead">ASSOC COORD</span>
                    )}
                    {member.roleType === 'Organizer' && (
                      <span className="badge-organizer">ORGANIZER</span>
                    )}
                    {member.roleType === 'Club Head' && (
                      <span className="badge-director">HEAD</span>
                    )}
                    {member.roleType === 'University Event + Club Coordinator' && (
                      <span className="badge-advisor" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>COORDINATOR</span>
                    )}
                    {member.roleType === 'Advisor' && (
                      <span className="badge-advisor">ADVISOR</span>
                    )}
                    {isGeneral && (
                      <span className="badge-general-reg" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>GENERAL MEMBER</span>
                    )}
                  </div>

                  <span className="branch-tag">
                    {member.semester && member.semester !== 'Faculty' ? `Sem ${member.semester} • ` : ''}{member.branch || 'B.Tech'}
                  </span>
                </div>

                <div className="card-designation">{member.designation || (isGeneral ? 'General Member (Registered)' : 'Core Member')}</div>

                <div className="card-footer-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span className="card-dept-tag" style={{ color: deptColor }}>
                    {member.department || 'General'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {canPromote && onOpenPromoteModal && isGeneral && (
                      <button
                        className="btn-card-promote-mini"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPromoteModal(member);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#fff',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Promote General Member to Core Role"
                      >
                        ⭐ Promote
                      </button>
                    )}

                    <span className="btn-preview-indicator">
                      {isSelected ? '✓ Viewing Letter' : 'Generate Letter →'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
