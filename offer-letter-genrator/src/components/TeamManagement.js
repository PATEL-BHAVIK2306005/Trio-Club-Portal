import React, { useState } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import ManageDepartmentsModal from './ManageDepartmentsModal';
import {
  Search,
  Plus,
  Download,
  RefreshCw,
  Trash2,
  Edit,
  Star,
  FileText,
  LayoutGrid,
  Table as TableIcon,
  Building,
  Users,
  Layers,
  Sparkles,
  UploadCloud,
  CheckSquare
} from 'lucide-react';
import Swal from 'sweetalert2';

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
  onOpenBulkAddModal,
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

  // Toggle Select All Visible Members
  const handleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m._id || m.name));
    }
  };

  // Export Selected or All Members to CSV
  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0
      ? orgMembers.filter(m => selectedIds.includes(m._id || m.name))
      : filteredMembers;

    if (dataToExport.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Members to Export',
        text: 'Select members or filter to export data.',
        confirmButtonColor: '#ff9900'
      });
      return;
    }

    const headers = ['Name', 'Role / Position', 'Department', 'Branch', 'Semester', 'Letter Ref ID', 'Email', 'Role Type'];
    const csvRows = [
      headers.join(','),
      ...dataToExport.map(m => [
        `"${m.name || ''}"`,
        `"${m.designation || ''}"`,
        `"${m.department || ''}"`,
        `"${m.branch || ''}"`,
        `"${m.semester || ''}"`,
        `"${m.letterRefId || ''}"`,
        `"${m.email || ''}"`,
        `"${m.roleType || 'Core Team Member'}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeOrg}_Team_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: 'success',
      title: 'CSV Exported Successfully!',
      text: `Exported ${dataToExport.length} members to CSV.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Bulk Delete Selected Members
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: `Delete ${selectedIds.length} Members?`,
      text: "This action cannot be undone. Selected members will be removed from this chapter's database.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, Delete ${selectedIds.length} Members`,
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        if (onBulkDeleteMembers) {
          onBulkDeleteMembers(selectedIds);
        } else {
          selectedIds.forEach(id => onDeleteMember(id));
        }
        setSelectedIds([]);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `Successfully deleted ${selectedIds.length} members.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Bulk Letter Generation
  const handleBulkGenerateLetters = () => {
    const selectedMembersList = orgMembers.filter(m => selectedIds.includes(m._id || m.name));
    if (selectedMembersList.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Members Selected',
        text: 'Please select members to generate offer letters in batch.',
        confirmButtonColor: '#ff9900'
      });
      return;
    }
    if (onOpenBatchModal) {
      onOpenBatchModal(selectedMembersList);
    }
  };

  // Duplicate Cleaner & Auto Detector
  const handleSelectDuplicates = () => {
    const nameCounts = {};
    orgMembers.forEach(m => {
      const clean = m.name.toLowerCase().trim();
      nameCounts[clean] = (nameCounts[clean] || 0) + 1;
    });

    const duplicateIds = [];
    const seen = new Set();
    orgMembers.forEach(m => {
      const clean = m.name.toLowerCase().trim();
      if (nameCounts[clean] > 1) {
        if (seen.has(clean)) {
          duplicateIds.push(m._id || m.name);
        } else {
          seen.add(clean);
        }
      }
    });

    if (duplicateIds.length === 0) {
      Swal.fire({
        icon: 'success',
        title: 'Clean Roster!',
        text: 'No duplicate member entries found in this chapter.',
        timer: 2200,
        showConfirmButton: false
      });
    } else {
      setSelectedIds(duplicateIds);
      Swal.fire({
        icon: 'warning',
        title: `${duplicateIds.length} Duplicates Selected`,
        text: 'Duplicate member entries have been auto-checked for quick review or deletion.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Review Selection'
      });
    }
  };

  // Department color palette generator
  const getDeptColor = (dept) => {
    switch (dept) {
      case 'Core Leadership':
      case 'Executive Board':
      case 'Executive Leadership': return '#ff9900';
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
        
        <div className="mgmt-kpi-card card-kpi-primary">
          <div className="kpi-icon-box" style={{ background: 'rgba(255, 153, 0, 0.15)', color: '#ff9900' }}>
            <Users size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Roster Members</span>
            <h3 className="kpi-value">{totalMembers}</h3>
            <span className="kpi-trend">Live in {activeClub.shortName} Chapter</span>
          </div>
        </div>

        <div className="mgmt-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Building size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Active Departments</span>
            <h3 className="kpi-value">{totalDepartments}</h3>
            <span className="kpi-trend">Structured Wings</span>
          </div>
        </div>

        <div className="mgmt-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Star size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Leadership & Heads</span>
            <h3 className="kpi-value">{coreLeadersCount}</h3>
            <span className="kpi-trend">Organizers, Associate Coordinators & Heads</span>
          </div>
        </div>

        <div className="mgmt-kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Sparkles size={22} />
          </div>
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
            <Search size={16} className="search-icon-svg" />
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

          {/* Role Filter */}
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
            className="btn-mgmt-secondary"
            onClick={() => setIsDeptModalOpen(true)}
            title="Add or Delete Departments"
          >
            <Building size={14} />
            <span>Manage Depts</span>
          </button>

          <button
            className={`btn-mgmt-primary ${isAWS ? 'btn-aws-primary' : 'btn-techno-primary'}`}
            onClick={onOpenAddMemberModal}
            title="Add new member"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Member</span>
          </button>

          {onOpenBulkAddModal && (
            <button
              className="btn-mgmt-secondary"
              onClick={onOpenBulkAddModal}
              title="Bulk import multiple members via CSV or Spreadsheet"
            >
              <UploadCloud size={14} />
              <span>Bulk Add</span>
            </button>
          )}

          <button className="btn-mgmt-secondary" onClick={handleExportCSV} title="Export roster to CSV">
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button className="btn-mgmt-secondary" onClick={handleSelectDuplicates} title="Auto select duplicate member entries">
            <Sparkles size={14} />
            <span>Duplicates</span>
          </button>

          {onSyncDatabase && (
            <button 
              className={`btn-mgmt-sync ${isSavingToDb ? 'syncing' : ''}`} 
              onClick={() => onSyncDatabase(false)} 
              title={`Force sync with ${dbProvider}${lastSyncTime ? ' (Last synced: ' + lastSyncTime.toLocaleTimeString() + ')' : ''}`}
            >
              <RefreshCw size={14} className={isSavingToDb ? 'spin-anim' : ''} />
              <span>{isSavingToDb ? 'Syncing...' : 'Sync DB'}</span>
            </button>
          )}

          {onResetDatabase && (
            <button className="btn-mgmt-secondary btn-reseed" onClick={onResetDatabase} title="Reset database to default roster">
              <RefreshCw size={14} />
              <span>Reseed</span>
            </button>
          )}

          <div className="view-mode-toggle">
            <button
              className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={15} />
            </button>
            <button
              className={`btn-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

        </div>

      </div>

      {/* Floating Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="mgmt-selection-bar">
          <span className="selection-count">
            <CheckSquare size={16} />
            <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'member' : 'members'} selected
          </span>
          <div className="selection-actions">
            <button className="btn-sel-batch" onClick={handleBulkGenerateLetters}>
              <FileText size={14} />
              <span>Generate Letters ({selectedIds.length})</span>
            </button>
            <button className="btn-sel-export" onClick={handleExportCSV}>
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button className="btn-sel-delete" onClick={handleBulkDelete}>
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
            <button className="btn-sel-clear" onClick={() => setSelectedIds([])}>
              ✕
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
                <th style={{ width: '44px', textAlign: 'center' }}>
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
                <th style={{ textAlign: 'right' }}>MANAGE ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    <div className="empty-state-box">
                      <Users size={36} className="empty-icon" />
                      <p>No team members found matching current filters.</p>
                    </div>
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

                      {/* Name & Role with Modern Avatar + Structured Details */}
                      <td>
                        <div className="table-member-profile-cell">
                          <div 
                            className="member-avatar-chip" 
                            style={{ 
                              background: `linear-gradient(135deg, ${deptColor}33, ${deptColor}15)`, 
                              borderColor: `${deptColor}66` 
                            }}
                          >
                            <span className="member-avatar-initial" style={{ color: deptColor }}>
                              {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                            </span>
                          </div>
                          <div className="member-details-col">
                            <div className="member-name-row">
                              <span className="member-full-name">{member.name}</span>
                              {isGeneral && <span className="badge-new-pill">NEW</span>}
                              {member.isCoLead && <span className="badge-lead-pill">LEAD</span>}
                            </div>
                            <span className="member-designation-text">
                              {member.designation || (isGeneral ? 'General Registered Member' : 'Core Team Member')}
                            </span>
                            <div className="member-ref-row">
                              {member.letterRefId ? (
                                <span className="member-ref-code" title="Official Offer Letter Reference ID">
                                  <FileText size={11} /> {member.letterRefId}
                                </span>
                              ) : (
                                <span className="member-ref-unissued">
                                  <span className="dot-gray"></span> Unissued Letter
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span 
                          className="dept-badge-pill" 
                          style={{ 
                            background: `${deptColor}18`, 
                            borderColor: `${deptColor}44`, 
                            color: deptColor 
                          }}
                        >
                          <span className="dept-dot" style={{ background: deptColor }}></span>
                          {member.department || 'General / Unassigned'}
                        </span>
                      </td>

                      {/* Branch & Semester */}
                      <td>
                        <div className="branch-sem-stack">
                          <span className="branch-title">{member.branch || 'B.Tech CSE'}</span>
                          {member.semester && member.semester !== 'Faculty' ? (
                            <span className="sem-pill">Sem {member.semester}</span>
                          ) : (
                            <span className="sem-pill faculty-pill">Core Faculty</span>
                          )}
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td>
                        <div className="role-status-cell">
                          <span className={`role-pill ${isGeneral ? 'role-pill-general' : (member.isCoLead ? 'role-pill-lead' : 'role-pill-core')}`}>
                            {member.roleType || 'General Member'}
                          </span>
                        </div>
                      </td>

                      {/* Responsibilities count */}
                      <td>
                        <span className="resp-count-badge">
                          <Layers size={13} />
                          <span>{member.responsibilities?.length || 0} Core Tasks</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="table-actions-cluster" style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Promotion Action */}
                          {canPromote && onOpenPromoteModal && (
                            <button
                              className="btn-tbl-action btn-tbl-promote"
                              onClick={() => onOpenPromoteModal(member)}
                              title="Promote Member"
                            >
                              <Star size={13} />
                              <span>{isGeneral ? 'Promote' : 'Elevate'}</span>
                            </button>
                          )}

                          {onSelectMemberForLetter && (
                            <button
                              className="btn-tbl-action btn-tbl-letter"
                              onClick={() => onSelectMemberForLetter(member)}
                              title="Generate Official Letter in Studio"
                            >
                              <FileText size={13} />
                              <span>Letter</span>
                            </button>
                          )}

                          <button
                            className="btn-tbl-action btn-tbl-edit"
                            onClick={() => onOpenEditMemberModal(member)}
                            title="Edit Member Profile"
                          >
                            <Edit size={13} />
                          </button>
                          
                          <button
                            className="btn-tbl-action btn-tbl-delete"
                            title="Delete Member"
                            onClick={() => onDeleteMember(memberId)}
                          >
                            <Trash2 size={13} />
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
              <div 
                key={memberId} 
                className={`mgmt-grid-card ${isChecked ? 'card-selected' : ''} ${isGeneral ? 'card-general-member' : ''}`}
              >
                <div className="grid-card-header">
                  <div className="grid-user-row">
                    <div 
                      className="grid-avatar-chip" 
                      style={{ 
                        background: `linear-gradient(135deg, ${deptColor}33, ${deptColor}15)`, 
                        borderColor: `${deptColor}66` 
                      }}
                    >
                      <span style={{ color: deptColor, fontWeight: 800 }}>
                        {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                      </span>
                    </div>
                    <div className="grid-name-box">
                      <strong className="grid-member-name">{member.name}</strong>
                      <span className="grid-desig-text">{member.designation || 'General Member'}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="grid-card-checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelect(memberId)}
                    title="Select Member"
                  />
                </div>

                <div className="grid-meta-row">
                  <span className="dept-badge-pill" style={{ background: `${deptColor}18`, borderColor: `${deptColor}44`, color: deptColor }}>
                    <span className="dept-dot" style={{ background: deptColor }}></span>
                    {member.department || 'General'}
                  </span>
                  <span className="sem-pill">{member.semester && member.semester !== 'Faculty' ? `Sem ${member.semester}` : 'Faculty'}</span>
                </div>

                {member.letterRefId && (
                  <div className="grid-ref-row">
                    <span className="member-ref-code">
                      <FileText size={11} /> {member.letterRefId}
                    </span>
                  </div>
                )}

                <div className="grid-card-footer" style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  {canPromote && onOpenPromoteModal && (
                    <button
                      className="btn-tbl-action btn-tbl-promote"
                      onClick={() => onOpenPromoteModal(member)}
                      style={{ flex: 1 }}
                    >
                      <Star size={13} />
                      <span>{isGeneral ? 'Promote' : 'Elevate'}</span>
                    </button>
                  )}
                  {onSelectMemberForLetter && (
                    <button
                      className="btn-tbl-action btn-tbl-letter"
                      onClick={() => onSelectMemberForLetter(member)}
                    >
                      <FileText size={13} />
                      <span>Letter</span>
                    </button>
                  )}
                  <button className="btn-tbl-action btn-tbl-edit" onClick={() => onOpenEditMemberModal(member)}>
                    <Edit size={13} />
                  </button>
                  <button className="btn-tbl-action btn-tbl-delete" onClick={() => onDeleteMember(memberId)}>
                    <Trash2 size={13} />
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
