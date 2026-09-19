import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { sendVerificationEmail } from '../services/emailService';

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

export default function UsersTable({
  users = [],
  currentUser = null,
  activeOrg = 'AWS_SBG',
  onPromoteUser,
  onAddUser,
  onBulkAddUser,
  onEditUser,
  onDeleteUser,
  onResendVerification
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Authorization: Can current user promote?
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

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesOrg = selectedOrg === 'ALL' || u.organization === selectedOrg || u.organization === 'ALL';
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || u.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.designation && u.designation.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q));

    return matchesOrg && matchesRole && matchesStatus && matchesSearch;
  });

  // KPI Metrics
  const totalUsers = users.length;
  const generalMembersCount = users.filter((u) => u.role === 'General Member').length;
  const organizersCount = users.filter((u) => u.role === 'Organizer' || u.role === 'Associate Coordinator' || u.role === 'Co-Lead').length;
  const emailVerifiedCount = users.filter((u) => u.emailConfirmed || u.email_confirmed).length;

  // Toggle selection
  const handleToggleSelect = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredUsers.map((u) => u.id || u._id || u.email);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedUserIds.includes(id));
    if (isAllSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Chapter', 'Department', 'Designation', 'Semester', 'Branch', 'Email Verified', 'Status', 'Registered At'];
    const rows = filteredUsers.map((u) => [
      `"${u.id || u._id || ''}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || ''}"`,
      `"${u.organization || 'AWS_SBG'}"`,
      `"${u.department || ''}"`,
      `"${u.designation || ''}"`,
      `"${u.semester || ''}"`,
      `"${u.branch || ''}"`,
      `"${u.emailConfirmed || u.email_confirmed ? 'Verified' : 'Pending'}"`,
      `"${u.status || 'ACTIVE'}"`,
      `"${u.createdAt || u.created_at || new Date().toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ITMBU_Users_Table_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Organizer':
        return { bg: 'rgba(255, 153, 0, 0.15)', text: '#ff9900', border: 'rgba(255, 153, 0, 0.4)', icon: '🚀' };
      case 'Associate Coordinator':
      case 'Co-Lead':
        return { bg: 'rgba(0, 210, 255, 0.15)', text: '#00d2ff', border: 'rgba(0, 210, 255, 0.4)', icon: '⭐' };
      case 'Executive Secretary':
        return { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.4)', icon: '📜' };
      case 'Treasurer & Finance Head':
        return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: 'rgba(234, 179, 8, 0.4)', icon: '💰' };
      case 'Technical Lead & Architect':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.4)', icon: '💻' };
      case 'Creative & Media Director':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.4)', icon: '🎨' };
      case 'Outreach & PR Head':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)', icon: '🌐' };
      case 'Core Team Member':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.4)', icon: '👥' };
      case 'Club Head':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.4)', icon: '👑' };
      case 'University Event + Club Coordinator':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.4)', icon: '🎯' };
      case 'Auditor & Compliance Officer':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.4)', icon: '👁️' };
      case 'Advisor':
        return { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: 'rgba(249, 115, 22, 0.4)', icon: '🎓' };
      case 'Admin':
        return { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.4)', icon: '🛡️' };
      case 'General Member':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)', icon: '👤' };
      case 'Faculty Mentor':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)', icon: '🏛️' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', icon: '👤' };
    }
  };

  const handleResend = async (user) => {
    if (onResendVerification) {
      onResendVerification(user);
    } else {
      try {
        await sendVerificationEmail(user.email);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Verification email dispatched to ${user.email} via Supabase Email Service`,
          showConfirmButton: false,
          timer: 3000,
          background: '#101626',
          color: '#f8fafc'
        });
      } catch (err) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: `Failed to dispatch email: ${err.message}`,
          showConfirmButton: false,
          timer: 3000,
          background: '#101626',
          color: '#f8fafc'
        });
      }
    }
  };

  return (
    <div className="users-table-module-wrapper" style={{ padding: '4px' }}>
      
      {/* 1. TOP KPI SUMMARY METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '24px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '12px', borderRadius: '10px' }}>👥</div>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Registered Users</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>{totalUsers}</h3>
            <span style={{ fontSize: '11px', color: '#38bdf8' }}>Across Portal Database</span>
          </div>
        </div>

        <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '24px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '12px', borderRadius: '10px' }}>👤</div>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Members</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>{generalMembersCount}</h3>
            <span style={{ fontSize: '11px', color: '#f59e0b' }}>Awaiting Promotion</span>
          </div>
        </div>

        <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '24px', background: 'rgba(255, 153, 0, 0.15)', color: '#ff9900', padding: '12px', borderRadius: '10px' }}>⭐</div>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organizers & Associate Coordinators</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#ff9900' }}>{organizersCount}</h3>
            <span style={{ fontSize: '11px', color: '#ff9900' }}>Executive Leadership</span>
          </div>
        </div>

        <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '24px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '12px', borderRadius: '10px' }}>📧</div>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supabase Email Verified</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#10b981' }}>{emailVerifiedCount}</h3>
            <span style={{ fontSize: '11px', color: '#10b981' }}>Authenticated Accounts</span>
          </div>
        </div>
      </div>

      {/* 2. TOOLBAR: SEARCH & FILTERS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: 1 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Search users by name, email, role, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', background: '#111828', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ padding: '9px 14px', background: '#111828', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}
          >
            <option value="ALL">All Roles ({users.length})</option>
            {OFFICIAL_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Chapter Filter */}
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            style={{ padding: '9px 14px', background: '#111828', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}
          >
            <option value="ALL">All Chapters</option>
            <option value="AWS_SBG">☁️ AWS SBG Chapter</option>
            <option value="TECHNO_LAB">🔬 Techno Lab Chapter</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '9px 14px', background: '#111828', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_PROMOTION">Pending Promotion</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onAddUser && (
            <button
              onClick={onAddUser}
              style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              ➕ Add User
            </button>
          )}

          {onBulkAddUser && (
            <button
              onClick={onBulkAddUser}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
              title="Bulk Import Members via CSV or Spreadsheet"
            >
              📥 Bulk Import
            </button>
          )}

          <button
            onClick={handleExportCSV}
            style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#cbd5e1', border: '1px solid #334155', padding: '9px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            title="Export full user table to CSV"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* 3. TABLE CONTAINER */}
      <div style={{ overflowX: 'auto', background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id || u._id || u.email))}
                />
              </th>
              <th style={{ padding: '12px 16px' }}>USER / STUDENT</th>
              <th style={{ padding: '12px 16px' }}>ROLE TIER</th>
              <th style={{ padding: '12px 16px' }}>CHAPTER</th>
              <th style={{ padding: '12px 16px' }}>BRANCH & SEM</th>
              <th style={{ padding: '12px 16px' }}>EMAIL STATUS</th>
              <th style={{ padding: '12px 16px' }}>ROLE STATUS</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const userId = user.id || user._id || user.email;
                const isSelected = selectedUserIds.includes(userId);
                const roleBadge = getRoleBadgeStyle(user.role || user.roleType);
                const isGeneral = user.role === 'General Member' || user.roleType === 'General Member';
                const isVerified = Boolean(user.emailConfirmed || user.email_confirmed);

                return (
                  <tr
                    key={userId}
                    style={{
                      borderBottom: '1px solid #1e293b',
                      background: isSelected ? 'rgba(56, 189, 248, 0.08)' : (isGeneral ? 'rgba(245, 158, 11, 0.03)' : 'transparent'),
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(userId)}
                      />
                    </td>

                    {/* User Profile */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                          {user.avatar || (user.name ? user.name[0].toUpperCase() : '👤')}
                        </div>
                        <div>
                          <strong style={{ color: '#f8fafc', fontSize: '13.5px', display: 'block' }}>{user.name}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Pill */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: roleBadge.bg,
                          color: roleBadge.text,
                          border: `1px solid ${roleBadge.border}`,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}
                      >
                        <span>{roleBadge.icon}</span>
                        <span>{user.role || user.roleType || 'General Member'}</span>
                      </span>
                    </td>

                    {/* Chapter */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: user.organization === 'TECHNO_LAB' ? '#00d2ff' : (user.organization === 'ALL' ? '#a855f7' : '#ff9900')
                        }}
                      >
                        {user.organization === 'TECHNO_LAB' ? '🔬 Techno Lab' : (user.organization === 'ALL' ? '👑 Universal' : '☁️ AWS SBG')}
                      </span>
                    </td>

                    {/* Branch & Sem */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: '#cbd5e1', fontSize: '12px' }}>
                        <div>{user.branch || 'B.Tech CSE'}</div>
                        <small style={{ color: '#94a3b8' }}>Semester {user.semester || '3'}</small>
                      </div>
                    </td>

                    {/* Supabase Email Verification Status */}
                    <td style={{ padding: '12px 16px' }}>
                      {isVerified ? (
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                          ✓ Confirmed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResend(user)}
                          style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          title="Click to resend verification email via Supabase"
                        >
                          ✉️ Unconfirmed (Resend)
                        </button>
                      )}
                    </td>

                    {/* Promotion Status */}
                    <td style={{ padding: '12px 16px' }}>
                      {isGeneral ? (
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700 }}>
                          Pending Promotion
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700 }}>
                          Active & Issued
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {canPromote && onPromoteUser && (
                          <button
                            onClick={() => onPromoteUser(user)}
                            style={{
                              background: isGeneral ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(56, 189, 248, 0.12)',
                              color: isGeneral ? '#ffffff' : '#38bdf8',
                              border: isGeneral ? 'none' : '1px solid rgba(56, 189, 248, 0.3)',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              cursor: 'pointer'
                            }}
                            title="Promote User to Official Core Team Role"
                          >
                            ⭐ {isGeneral ? 'Promote' : 'Elevate'}
                          </button>
                        )}

                        {onEditUser && (
                          <button
                            onClick={() => onEditUser(user)}
                            style={{ background: 'rgba(30, 41, 59, 0.8)', color: '#cbd5e1', border: '1px solid #334155', padding: '5px 8px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer' }}
                            title="Edit User"
                          >
                            ✏️
                          </button>
                        )}

                        {onDeleteUser && (
                          <button
                            onClick={() => onDeleteUser(user)}
                            style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '5px 8px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer' }}
                            title="Delete User Record"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
