import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import ManageDepartmentsModal from './ManageDepartmentsModal';

export const OFFICIAL_ROLES = [
  'Organizer',
  'Associate Coordinator',
  'Executive Secretary',
  'Treasurer & Finance Head',
  'Technical Lead & Architect',
  'Creative & Media Director',
  'Outreach & PR Head',
  'Core Team Member',
  'Club Head',
  'University Event + Club Coordinator',
  'Auditor & Compliance Officer',
  'Advisor',
  'Admin',
  'General Member',
  'Faculty Mentor'
];

export default function TeamManagement({
  members,
  activeOrg = 'AWS_SBG',
  departments = [],
  currentUser = null,
  onAddDepartment,
  onDeleteDepartment,
  onSelectMemberForLetter,
  onOpenAddMemberModal,
  onOpenEditMemberModal,
  onOpenPromoteModal,
  onDeleteMember,
  onBulkDeleteMembers,
  onOpenBatchModal,
  onResetDatabase,
  onSyncDatabase,
  dbConnected = true,
  dbProvider = 'Supabase Cloud',
  isSavingToDb = false,
  lastSyncTime = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';

  // Authorization: Only Organizers, Associate Coordinators, and Admins can promote General Members
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

  // Filter members for active club
  const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);

  const departmentsList = departments && departments.length > 0 ? departments : (activeClub.departments || ['All']);

  const filteredMembers = orgMembers.filter(member => {
    const matchesDept = selectedDept === 'All' || member.department === selectedDept;
    const matchesRole = selectedRole === 'All' || member.roleType === selectedRole;
    const query = searchQuery.toLowerCase();
    const matchesSearch = member.name.toLowerCase().includes(query) ||
                          (member.designation && member.designation.toLowerCase().includes(query)) ||
                          (member.department && member.department.toLowerCase().includes(query)) ||
                          (member.letterRefId && member.letterRefId.toLowerCase().includes(query)) ||
                          (member.branch && member.branch.toLowerCase().includes(query));

    return matchesDept && matchesRole && matchesSearch;
  });

  // KPI Calculations
  const totalMembers = orgMembers.length;
  const totalDepartments = departmentsList.filter(d => d !== 'All').length;
  const generalMembersCount = orgMembers.filter(m => m.roleType === 'General Member').length;
  const coreLeadersCount = orgMembers.filter(m => m.isCoLead || m.roleType === 'Associate Coordinator' || m.roleType === 'Organizer' || m.roleType === 'Club Head').length;

  // Toggle Single Member Selection
  const handleToggleSelect = (memberId) => {
    setSelectedIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // Select / Deselect All Filtered Members
  const handleSelectAll = () => {
    const allFilteredIds = filteredMembers.map(m => m._id || m.name);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Smart Find & Select Duplicate Records
  const handleSelectDuplicates = () => {
    const nameCounts = {};
    orgMembers.forEach(m => {
      nameCounts[m.name] = (nameCounts[m.name] || 0) + 1;
    });

    const duplicateIds = [];
    const seenNames = new Set();

    orgMembers.forEach(m => {
      if (nameCounts[m.name] > 1) {
        if (seenNames.has(m.name)) {
          // It's a duplicate instance -> mark for deletion
          duplicateIds.push(m._id || m.name);
        } else {
          seenNames.add(m.name);
        }
      }
    });

    if (duplicateIds.length > 0) {
      setSelectedIds(duplicateIds);
    } else {
      alert('No duplicate members found in current club roster!');
    }
  };

  // Trigger Bulk Delete
  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (onBulkDeleteMembers) {
      onBulkDeleteMembers(selectedIds);
      setSelectedIds([]);
    }
  };

  // Export Roster to CSV
  const handleExportCSV = () => {
    const headers = ['Ref ID', 'Name', 'Department', 'Role Type', 'Designation', 'Co-Lead', 'Semester', 'Branch', 'Status'];
    const rows = filteredMembers.map(m => [
      `"${m.letterRefId || ''}"`,
      `"${m.name || ''}"`,
      `"${m.department || ''}"`,
      `"${m.roleType || ''}"`,
      `"${m.designation || ''}"`,
      `"${m.isCoLead ? 'Yes' : 'No'}"`,
      `"${m.semester || ''}"`,
      `"${m.branch || ''}"`,
      `"${m.status || 'Active'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeClub.shortName}_Roster_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const isAllFilteredSelected = filteredMembers.length > 0 && filteredMembers.every(m => selectedIds.includes(m._id || m.name));

  return (
    <div className="team-mgmt-container">
      
      {/* 1. TOP HEADER & METRIC KPI CARDS */}
      <div className="mgmt-kpi-grid">
        
        <div className="mgmt-kpi-card">
          <div className="kpi-icon-box kpi-icon-aws">👥</div>
          <div className="kpi-info">
            <span className="kpi-label">Total Roster Members</span>
            <h3 className="kpi-value">{totalMembers}</h3>
            <span className="kpi-trend">Live in {activeClub.shortName} Chapter</span>
          </div>
        </div>

        <div className="mgmt-kpi-card">
          <div className="kpi-icon-box kpi-icon-purple">🏢</div>
          <div className="kpi-info">
            <span className="kpi-label">Active Departments</span>
            <h3 className="kpi-value">{totalDepartments}</h3>
            <span className="kpi-trend">Structured Wings</span>
          </div>
        </div>

        <div className="mgmt-kpi-card">
          <div className="kpi-icon-box kpi-icon-amber">⭐</div>
          <div className="kpi-info">
            <span className="kpi-label">Leadership & Heads</span>
            <h3 className="kpi-value">{coreLeadersCount}</h3>
            <span className="kpi-trend">Organizers, Associate Coordinators & Heads</span>
          </div>
        </div>

        <div className="mgmt-kpi-card">
          <div className="kpi-icon-box kpi-icon-green">👤</div>
          <div className="kpi-info">
            <span className="kpi-label">General Members</span>
            <h3 className="kpi-value">{generalMembersCount}</h3>
            <span className="kpi-trend">Registered &bull; Ready for Promotion</span>
          </div>
        </div>

      </div>

      {/* 2. ACTIONS & FILTERS TOOLBAR */}
      <div className="mgmt-toolbar">
        
        <div className="toolbar-left">
          <div className="mgmt-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="mgmt-search-input"
              placeholder={`Search ${activeClub.shortName} members by name, role, branch, semester...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn-clear-search" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* Department Filter */}
          <select
            className="mgmt-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departmentsList.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'All' ? `All Departments (${orgMembers.length})` : dept}
              </option>
            ))}
          </select>

          {/* Role Filter with User Specified Official Roles */}
          <select
            className="mgmt-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All">All Roles ({orgMembers.length})</option>
            {OFFICIAL_ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="toolbar-right">
          
          <button
            className="btn-mgmt-dept-manage"
            onClick={() => setIsDeptModalOpen(true)}
            title="Add or Delete Departments"
          >
            🏢 Manage Depts
          </button>

          <button
            className={`btn-mgmt-primary ${isAWS ? 'btn-aws-primary' : 'btn-techno-primary'}`}
            onClick={onOpenAddMemberModal}
          >
            ➕ Add Member
          </button>

          <button className="btn-mgmt-secondary" onClick={handleExportCSV} title="Export roster to CSV">
            📥 Export CSV
          </button>

          <button className="btn-mgmt-secondary" onClick={handleSelectDuplicates} title="Auto select duplicate member entries">
            🧹 Select Duplicates
          </button>

          {onSyncDatabase && (
            <button 
              className={`btn-mgmt-sync ${isSavingToDb ? 'syncing' : ''}`} 
              onClick={() => onSyncDatabase(false)} 
              title={`Force sync with ${dbProvider}${lastSyncTime ? ' (Last synced: ' + lastSyncTime.toLocaleTimeString() + ')' : ''}`}
            >
              {isSavingToDb ? '⏳ Syncing...' : '⚡ Sync DB'}
            </button>
          )}

          {onResetDatabase && (
            <button className="btn-mgmt-danger" onClick={onResetDatabase} title="Reset database to default roster">
              🔄 Reseed Data
            </button>
          )}

          <div className="view-mode-toggle">
            <button
              className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              ☰
            </button>
            <button
              className={`btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ☷
            </button>
          </div>

        </div>

      </div>

      {/* 2b. BULK ACTIONS FLOATING/TOP BAR */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-banner">
          <div className="bulk-info-left">
            <span className="bulk-badge-count">✓ {selectedIds.length} Selected</span>
            <span className="bulk-desc-text">Selected members across the roster are ready for batch actions.</span>
          </div>
          <div className="bulk-actions-right">
            <button className="btn-bulk-delete-action" onClick={handleExecuteBulkDelete}>
              🗑️ Delete Selected ({selectedIds.length})
            </button>
            <button className="btn-bulk-clear" onClick={() => setSelectedIds([])}>
              ✕ Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* 3. ROSTER DISPLAY: TABLE VIEW OR GRID VIEW */}
      {viewMode === 'table' ? (
        <div className="mgmt-table-container">
          <table className="mgmt-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="row-checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleSelectAll}
                    title="Select / Deselect All"
                  />
                </th>
                <th>MEMBER NAME & ROLE</th>
                <th>DEPARTMENT / WING</th>
                <th>BRANCH & SEM</th>
                <th>ROLE STATUS</th>
                <th>RESPONSIBILITIES</th>
                <th>MANAGE ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    No team members found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const memberId = member._id || member.name;
                  const isChecked = selectedIds.includes(memberId);
                  const deptColor = getDeptColor(member.department);
                  const isGeneral = member.roleType === 'General Member';

                  return (
                    <tr key={memberId} className={`${isChecked ? 'row-selected' : ''} ${isGeneral ? 'row-general-member' : ''}`}>
                      
                      {/* Checkbox Cell */}
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="row-checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(memberId)}
                        />
                      </td>

                      {/* Name & Role */}
                      <td>
                        <div className="table-member-info">
                          <strong className="table-member-name">
                            {member.name}
                            {isGeneral && <span style={{ marginLeft: '6px', fontSize: '10.5px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '1px 6px', borderRadius: '4px' }}>NEW</span>}
                          </strong>
                          <span className="table-member-desig">{member.designation || (isGeneral ? 'General Member (Registered)' : 'Core Member')}</span>
                          {member.letterRefId ? (
                            <span className="table-member-ref">{member.letterRefId}</span>
                          ) : (
                            <span className="table-member-ref" style={{ color: '#94a3b8' }}>Unissued Letter</span>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="dept-badge-pill" style={{ borderColor: deptColor, color: deptColor }}>
                          {member.department || 'General / Unassigned'}
                        </span>
                      </td>

                      {/* Branch & Semester */}
                      <td>
                        <div className="table-branch-box">
                          <span>{member.branch || 'B.Tech CSE'}</span>
                          {member.semester && member.semester !== 'Faculty' && (
                            <small>Sem: {member.semester}</small>
                          )}
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td>
                        <div className="role-tags-group">
                          <span className={`role-badge ${isGeneral ? 'role-general' : (member.isCoLead ? 'role-colead' : 'role-normal')}`}>
                            {member.roleType || 'General Member'}
                          </span>
                          {member.isCoLead && <span className="tag-colead-mini">ASSOC COORD</span>}
                          {isGeneral && <span className="tag-pending-mini">PENDING PROMOTION</span>}
                        </div>
                      </td>

                      {/* Responsibilities count */}
                      <td>
                        <span className="resp-count-indicator">
                          {member.responsibilities?.length || 0} Core Tasks
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="table-actions-cell" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Promotion Action - Visible to Organizers & Co-Leads */}
                          {canPromote && onOpenPromoteModal && (
                            <button
                              className="btn-tbl-action btn-tbl-promote"
                              onClick={() => onOpenPromoteModal(member)}
                              title="Promote Member to Core Role & Issue Letter (Organizer/Co-Lead Authority)"
                              style={{
                                background: isGeneral ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(56, 189, 248, 0.15)',
                                color: isGeneral ? '#ffffff' : '#38bdf8',
                                border: isGeneral ? 'none' : '1px solid rgba(56, 189, 248, 0.4)',
                                fontWeight: 700,
                                boxShadow: isGeneral ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
                              }}
                            >
                              ⭐ {isGeneral ? 'Promote Member' : 'Promote'}
                            </button>
                          )}

                          {onSelectMemberForLetter && (
                            <button
                              className="btn-tbl-action btn-tbl-letter"
                              onClick={() => onSelectMemberForLetter(member)}
                              title="Generate Official Letter in Studio"
                              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}
                            >
                              📄 Letter
                            </button>
                          )}

                          <button
                            className="btn-tbl-action btn-tbl-edit"
                            onClick={() => onOpenEditMemberModal(member)}
                            title="Edit Member Profile"
                          >
                            ✏️ Edit
                          </button>
                          
                          <button
                            className="btn-tbl-action btn-tbl-delete"
                            title="Delete Member"
                            onClick={() => onDeleteMember(memberId)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="mgmt-grid-container">
          {filteredMembers.map((member) => {
            const memberId = member._id || member.name;
            const isChecked = selectedIds.includes(memberId);
            const deptColor = getDeptColor(member.department);
            const isGeneral = member.roleType === 'General Member';

            return (
              <div key={memberId} className={`mgmt-grid-card ${isChecked ? 'card-selected' : ''} ${isGeneral ? 'card-general-member' : ''}`} style={{ borderLeftColor: deptColor }}>
                <div className="grid-card-header">
                  <div className="grid-name-box">
                    <strong>{member.name}</strong>
                    {member.isCoLead && <span className="badge-colead">ASSOC COORD</span>}
                    {member.roleType === 'Organizer' && <span className="badge-organizer">ORGANIZER</span>}
                    {isGeneral && <span className="badge-general-reg">GENERAL MEMBER</span>}
                  </div>
                  <input
                    type="checkbox"
                    className="grid-card-checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelect(memberId)}
                    title="Select Member"
                  />
                </div>

                <div className="grid-desig-text">{member.designation || 'General Member (Registered)'}</div>

                <div className="grid-meta-row">
                  <span className="dept-tag-pill" style={{ color: deptColor }}>{member.department || 'General / Unassigned'}</span>
                  <span className="branch-text">{member.semester && member.semester !== 'Faculty' ? `Sem ${member.semester} • ` : ''}{member.branch}</span>
                </div>

                <div className="grid-card-footer" style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  {canPromote && onOpenPromoteModal && (
                    <button
                      className="btn-action-promote"
                      onClick={() => onOpenPromoteModal(member)}
                      style={{
                        flex: 1,
                        background: isGeneral ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(56, 189, 248, 0.15)',
                        color: isGeneral ? '#ffffff' : '#38bdf8',
                        border: isGeneral ? 'none' : '1px solid rgba(56, 189, 248, 0.4)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ⭐ {isGeneral ? 'Promote' : 'Elevate'}
                    </button>
                  )}
                  {onSelectMemberForLetter && (
                    <button
                      className="btn-action-letter"
                      onClick={() => onSelectMemberForLetter(member)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      📄 Letter
                    </button>
                  )}
                  <button className="btn-action-edit" onClick={() => onOpenEditMemberModal(member)}>
                    ✏️
                  </button>
                  <button className="btn-action-delete" onClick={() => onDeleteMember(memberId)}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MANAGE DEPARTMENTS MODAL */}
      <ManageDepartmentsModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        activeOrg={activeOrg}
        departments={departmentsList}
        members={members}
        onAddDepartment={onAddDepartment}
        onDeleteDepartment={onDeleteDepartment}
      />

    </div>
  );
}
