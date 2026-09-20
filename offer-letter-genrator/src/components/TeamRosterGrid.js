import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

// Modern SVG Icons for Team Roster
const RosterIcons = {
  Plus: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Zap: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  Users: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  )
};

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
      case 'Core Leadership': return isAWS ? '#f59e0b' : '#0284c7';
      case 'Event Management':
      case 'Outreach & Event Operations': return '#10b981';
      case 'Technical Team':
      case 'Robotics & IoT Wing': return '#d97706';
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
      default: return '#0284c7';
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
              type="button"
              className="btn-add-member"
              title="Add New Team Member"
              onClick={onOpenAddMemberModal}
            >
              <RosterIcons.Plus />
              <span>Add Member</span>
            </button>
          )}

          <button
            type="button"
            className="btn-batch-generate" 
            onClick={onOpenBatchModal}
            title="Batch Print All Joining Letters"
          >
            <RosterIcons.Zap />
            <span>Batch Print</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <span className="search-icon-adornment"><RosterIcons.Search /></span>
        <input
          type="text"
          placeholder={`Search ${activeClub.shortName} members...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button type="button" className="btn-clear-search" onClick={() => setSearchQuery('')}>✕</button>
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
              type="button"
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
                      <span className="badge-advisor">COORDINATOR</span>
                    )}
                    {member.roleType === 'Advisor' && (
                      <span className="badge-advisor">ADVISOR</span>
                    )}
                    {isGeneral && (
                      <span className="badge-general-reg">GENERAL MEMBER</span>
                    )}
                  </div>

                  <span className="branch-tag">
                    {member.semester && member.semester !== 'Faculty' ? `Sem ${member.semester} • ` : ''}{member.branch || 'B.Tech'}
                  </span>
                </div>

                <div className="card-designation">{member.designation || (isGeneral ? 'General Member (Registered)' : 'Core Member')}</div>

                <div className="card-footer-row">
                  <span className="card-dept-tag" style={{ color: deptColor }}>
                    {member.department || 'General'}
                  </span>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {canPromote && onOpenPromoteModal && isGeneral && (
                      <button
                        type="button"
                        className="btn-card-promote-mini"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPromoteModal(member);
                        }}
                        title="Promote General Member to Core Role"
                      >
                        <RosterIcons.Star />
                        <span>Promote</span>
                      </button>
                    )}

                    <span className={`btn-preview-indicator ${isSelected ? 'indicator-active' : ''}`}>
                      {isSelected ? (
                        <>
                          <RosterIcons.Check />
                          <span>Viewing Letter</span>
                        </>
                      ) : (
                        <>
                          <span>Generate Letter</span>
                          <RosterIcons.ArrowRight />
                        </>
                      )}
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
