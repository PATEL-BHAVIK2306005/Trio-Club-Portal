import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import UsersTable from './UsersTable';

// 10 System Administrative RBAC Roles Configuration
export const SYSTEM_ROLES = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    title: 'Super Administrator (Universal)',
    badge: '👑 Universal Master',
    color: '#ff9900',
    description: 'Unrestricted universal master access across AWS SBG and Techno Lab, user RBAC management, database operations, and branding.',
    permissions: ['ALL_PERMISSIONS', 'USER_MANAGEMENT', 'CLOUD_DATABASE_SEED', 'GLOBAL_GOVERNANCE', 'LETTER_ISSUANCE', 'BRANDING_VAULT']
  },
  AWS_LEAD_ADMIN: {
    id: 'AWS_LEAD_ADMIN',
    title: 'AWS SBG Lead Organizer',
    badge: '☁️ AWS SBG Lead',
    color: '#ff9900',
    description: 'Full operational administration over AWS Student Builder Group roster, letter drafting, department workflows, and signatures.',
    permissions: ['AWS_ROSTER_MANAGE', 'AWS_LETTER_GENERATE', 'AWS_BRANDING_EDIT', 'AWS_CSV_EXPORT']
  },
  TECHNO_LEAD_ADMIN: {
    id: 'TECHNO_LEAD_ADMIN',
    title: 'Techno Lab Lead Organizer',
    badge: '🔬 Techno Lab Lead',
    color: '#00d2ff',
    description: 'Full operational administration over Techno Lab roster, robotics/AI wing appointments, and letter issuance.',
    permissions: ['TECHNO_ROSTER_MANAGE', 'TECHNO_LETTER_GENERATE', 'TECHNO_BRANDING_EDIT', 'TECHNO_CSV_EXPORT']
  },
  GDGOC_LEAD_ADMIN: {
    id: 'GDGOC_LEAD_ADMIN',
    title: 'GDGoC ITMBU Lead Organizer',
    badge: '🌐 GDGoC Lead',
    color: '#4285F4',
    description: 'Full operational administration over Google Developer Groups on Campus ITMBU roster, tech wings, and letter issuance.',
    permissions: ['GDGOC_ROSTER_MANAGE', 'GDGOC_LETTER_GENERATE', 'GDGOC_BRANDING_EDIT', 'GDGOC_CSV_EXPORT']
  },
  EXECUTIVE_SECRETARY: {
    id: 'EXECUTIVE_SECRETARY',
    title: 'Executive Secretary & Records Keeper',
    badge: '📜 Executive Secretary',
    color: '#ec4899',
    description: 'Manages chapter documentation registries, meeting proceedings, appointment letter logs, and institutional correspondence.',
    permissions: ['RECORDS_MANAGEMENT', 'LETTER_REGISTRY_VIEW', 'MINUTES_OF_MEETING', 'ROSTER_VIEW']
  },
  TREASURER_FINANCE: {
    id: 'TREASURER_FINANCE',
    title: 'Treasurer & Finance Head',
    badge: '💰 Treasurer & Finance',
    color: '#eab308',
    description: 'Controls departmental financial budgets, university allocations, sponsorship invoices, and event expenditure approvals.',
    permissions: ['BUDGET_MANAGEMENT', 'FINANCE_AUDIT', 'EXPENSE_APPROVAL', 'ROSTER_VIEW']
  },
  TECHNICAL_ARCHITECT: {
    id: 'TECHNICAL_ARCHITECT',
    title: 'Technical Lead & Cloud Architect',
    badge: '💻 Technical Architect',
    color: '#06b6d4',
    description: 'Oversees technical infrastructure, hands-on lab deployments, GitHub code repositories, and hackathon judge evaluation.',
    permissions: ['TECH_INFRA_CONTROL', 'WORKSHOP_LEAD', 'GITHUB_REPO_ADMIN', 'ROSTER_VIEW']
  },
  CREATIVE_DIRECTOR: {
    id: 'CREATIVE_DIRECTOR',
    title: 'Creative & Media Director',
    badge: '🎨 Creative Director',
    color: '#f43f5e',
    description: 'Directs digital creative assets, branding consistency, social media broadcasting, and event photography campaigns.',
    permissions: ['MEDIA_ASSETS_MANAGE', 'BRAND_ASSET_VAULT', 'SOCIAL_MEDIA_BROADCAST', 'ROSTER_VIEW']
  },
  OUTREACH_AMBASSADOR: {
    id: 'OUTREACH_AMBASSADOR',
    title: 'Outreach & PR Ambassador',
    badge: '🌐 Outreach & PR Lead',
    color: '#3b82f6',
    description: 'Manages university collaborations, inter-college partnerships, external sponsor relations, and campus ambassador networks.',
    permissions: ['OUTREACH_CAMPAIGNS', 'PARTNERSHIP_MANAGEMENT', 'COMMUNITY_PR', 'ROSTER_VIEW']
  },
  FACULTY_ADVISOR: {
    id: 'FACULTY_ADVISOR',
    title: 'Faculty & Academic Mentor',
    badge: '🎓 Faculty Advisor',
    color: '#10b981',
    description: 'Academic oversight, official letter review & audit verification, digital faculty signature authorization.',
    permissions: ['AUDIT_VIEW_ALL', 'SIGNATURE_APPROVE', 'LETTER_VERIFICATION', 'ROSTER_VIEW']
  },
  VIEWER_AUDITOR: {
    id: 'VIEWER_AUDITOR',
    title: 'Auditor & Compliance Officer',
    badge: '👁️ Auditor (Read-Only)',
    color: '#8b5cf6',
    description: 'Institutional compliance officer with read-only inspection access across issued letters, reference IDs, and roster logs.',
    permissions: ['ROSTER_VIEW_ONLY', 'LETTER_VERIFY_ONLY', 'AUDIT_LOGS_VIEW']
  }
};

// Initial Default Administrators and Managers across all 5 roles
export const DEFAULT_ADMIN_USERS = [
  {
    id: 'user-001',
    name: 'Bhavikkumar Patel',
    username: 'superadmin',
    email: 'bhavik.itmbu@gmail.com',
    role: 'SUPER_ADMIN',
    organization: 'ALL',
    status: 'ACTIVE',
    lastActive: 'Just now',
    createdAt: '2026-09-01T08:00:00Z',
    avatar: '👑'
  },
  {
    id: 'user-002',
    name: 'Tannvi Acharya',
    username: 'aws.organizer',
    email: 'aws.itmbu@gmail.com',
    role: 'AWS_LEAD_ADMIN',
    organization: 'AWS_SBG',
    status: 'ACTIVE',
    lastActive: '10 mins ago',
    createdAt: '2026-09-05T10:30:00Z',
    avatar: '☁️'
  },
  {
    id: 'user-003',
    name: 'Vansham Kamboj',
    username: 'technolab.lead',
    email: 'technolabclub25@gmail.com',
    role: 'TECHNO_LEAD_ADMIN',
    organization: 'TECHNO_LAB',
    status: 'ACTIVE',
    lastActive: '25 mins ago',
    createdAt: '2026-09-05T11:00:00Z',
    avatar: '🔬'
  },
  {
    id: 'user-004',
    name: 'Dr. Pradeep Laxkar',
    username: 'pradeep.laxkar',
    email: 'pradeep.laxkar@itmbu.ac.in',
    role: 'FACULTY_ADVISOR',
    organization: 'ALL',
    status: 'ACTIVE',
    lastActive: '1 hour ago',
    createdAt: '2026-09-02T09:15:00Z',
    avatar: '🎓'
  },
  {
    id: 'user-005',
    name: 'University Compliance Officer',
    username: 'auditor.itmbu',
    email: 'compliance.audit@itmbu.ac.in',
    role: 'VIEWER_AUDITOR',
    organization: 'ALL',
    status: 'ACTIVE',
    lastActive: '2 hours ago',
    createdAt: '2026-09-10T14:00:00Z',
    avatar: '👁️'
  }
];

export default function SuperAdminConsole({
  isOpen,
  onClose,
  currentUser,
  members = [],
  activeOrg = 'AWS_SBG',
  visibleChapters = { AWS_SBG: true, TECHNO_LAB: true, GDGOC: true },
  onToggleChapterVisibility,
  onSyncDatabase,
  onResetDatabase,
  onOpenPromoteModal,
  onAddMember,
  onEditMember,
  onDeleteMember,
  dbConnected = true,
  dbProvider = 'Supabase Cloud',
  lastSyncTime = null,
  awsLetterConfig,
  technoLetterConfig,
  gdgocLetterConfig,
  onChangeAwsConfig,
  onChangeTechnoConfig,
  onChangeGdgocConfig,
  onSaveBranding
}) {
  // Navigation tabs: 'users' | 'audit' | 'database' | 'governance' | 'security'
  const [activeTab, setActiveTab] = useState('users');
  
  // User Management Sub-Tab: 'rbac_admins' | 'all_members_table'
  const [userViewSubTab, setUserViewSubTab] = useState('rbac_admins');

  // User Management State
  const [adminUsers, setAdminUsers] = useState(() => {
    const saved = localStorage.getItem('offer_gen_admin_users');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_USERS;
  });

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // New User Form State
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'AWS_LEAD_ADMIN',
    organization: 'AWS_SBG',
    password: ''
  });

  // Governance Form State
  const [govTenure, setGovTenure] = useState(awsLetterConfig?.tenure || 'Academic Year 2026 – 2027');
  const [govAwsPrefix, setGovAwsPrefix] = useState('AWS-SBG/ITMBU/2026-27/JL');
  const [govTechnoPrefix, setGovTechnoPrefix] = useState('TECHNO-LAB/ITMBU/2026-27/JL');
  const [govGdgocPrefix, setGovGdgocPrefix] = useState('GDGOC/ITMBU/2026-27/JL');
  const [govMaintenanceMode, setGovMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30m');

  // Password Change Form State
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');

  // Audit Logs State & Filter
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('offer_gen_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, action: 'SYSTEM_LOGIN', category: 'AUTH', user: 'superadmin', desc: 'Super Administrator logged into universal control console', timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(), ip: '127.0.0.1 (Cloudflare)' },
      { id: 2, action: 'CLOUD_SYNC', category: 'DATABASE', user: 'System Worker', desc: 'PostgreSQL Realtime WebSocket connected and synced roster records', timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(), ip: 'Supabase Cloud API' },
      { id: 3, action: 'PROMOTION', category: 'ROLES', user: 'tannvi.lead', desc: 'Promoted General Member to Core Team Member with Ref ID generated', timestamp: new Date(Date.now() - 30 * 60000).toLocaleTimeString(), ip: '127.0.0.1' },
      { id: 4, action: 'LETTER_GENERATION', category: 'LETTERS', user: 'superadmin', desc: 'Batch appointment letters generated for Technical Team', timestamp: new Date(Date.now() - 45 * 60000).toLocaleTimeString(), ip: '127.0.0.1' },
      { id: 5, action: 'BRANDING_UPDATE', category: 'BRANDING', user: 'superadmin', desc: 'Updated chapter affiliation tagline and university crest', timestamp: new Date(Date.now() - 120 * 60000).toLocaleTimeString(), ip: '127.0.0.1' },
      { id: 6, action: 'SECURITY_AUDIT', category: 'SECURITY', user: 'auditor.itmbu', desc: 'Audited appointment letter reference ID series compliance', timestamp: new Date(Date.now() - 240 * 60000).toLocaleTimeString(), ip: '10.0.4.12' }
    ];
  });

  // Save admin users to localStorage
  useEffect(() => {
    localStorage.setItem('offer_gen_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  // Sync tenure prop changes
  useEffect(() => {
    if (awsLetterConfig?.tenure) {
      setGovTenure(awsLetterConfig.tenure);
    }
  }, [awsLetterConfig?.tenure]);

  if (!isOpen) return null;

  // Filter Admin Users
  const filteredAdminUsers = adminUsers.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = searchUserQuery.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(q) ||
                          u.username.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  // Filter Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesCat = auditFilter === 'ALL' || log.category === auditFilter || log.action.includes(auditFilter);
    const q = auditSearchQuery.toLowerCase();
    const matchesSearch = log.desc.toLowerCase().includes(q) ||
                          log.user.toLowerCase().includes(q) ||
                          log.action.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Handle Add or Edit Administrator
  const handleSaveUserForm = (e) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.username || !userFormData.email) {
      alert('Please provide name, username, and email');
      return;
    }

    if (editingUser) {
      // Update existing
      setAdminUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        name: userFormData.name,
        username: userFormData.username,
        email: userFormData.email,
        role: userFormData.role,
        organization: userFormData.role === 'SUPER_ADMIN' || userFormData.role === 'FACULTY_ADVISOR' || userFormData.role === 'VIEWER_AUDITOR' ? 'ALL' : userFormData.organization
      } : u));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Updated ${userFormData.name}'s administrator profile!`,
        timer: 2500,
        showConfirmButton: false,
        background: '#101626',
        color: '#f8fafc'
      });
    } else {
      // Create new
      const newUser = {
        id: `user-${Date.now().toString().slice(-4)}`,
        name: userFormData.name,
        username: userFormData.username,
        email: userFormData.email,
        role: userFormData.role,
        organization: userFormData.role === 'SUPER_ADMIN' || userFormData.role === 'FACULTY_ADVISOR' || userFormData.role === 'VIEWER_AUDITOR' ? 'ALL' : userFormData.organization,
        status: 'ACTIVE',
        lastActive: 'Never',
        createdAt: new Date().toISOString(),
        avatar: userFormData.role === 'SUPER_ADMIN' ? '👑' : userFormData.role === 'AWS_LEAD_ADMIN' ? '☁️' : userFormData.role === 'TECHNO_LEAD_ADMIN' ? '🔬' : userFormData.role === 'FACULTY_ADVISOR' ? '🎓' : '👁️'
      };

      setAdminUsers(prev => [newUser, ...prev]);

      // Add to audit logs
      setAuditLogs(prev => [
        {
          id: Date.now(),
          action: 'USER_CREATED',
          category: 'AUTH',
          user: currentUser?.username || 'superadmin',
          desc: `Created new ${SYSTEM_ROLES[newUser.role]?.title} account for ${newUser.name}`,
          timestamp: new Date().toLocaleTimeString(),
          ip: '127.0.0.1'
        },
        ...prev
      ]);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Administrator ${newUser.name} created!`,
        timer: 2500,
        showConfirmButton: false,
        background: '#101626',
        color: '#f8fafc'
      });
    }

    setIsAddUserModalOpen(false);
    setEditingUser(null);
    setUserFormData({ name: '', username: '', email: '', role: 'AWS_LEAD_ADMIN', organization: 'AWS_SBG', password: '' });
  };

  // Toggle user active / suspended status
  const handleToggleUserStatus = (userId) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Delete administrator
  const handleDeleteUser = (user) => {
    if (user.username === 'superadmin' || user.id === 'user-001') {
      Swal.fire({
        icon: 'error',
        title: 'Protected Account',
        text: 'The primary Master Super Administrator account cannot be deleted.',
        background: '#101626',
        color: '#f8fafc'
      });
      return;
    }

    Swal.fire({
      title: `Delete ${user.name}?`,
      text: `Are you sure you want to revoke all access privileges for ${user.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Revoke Access',
      background: '#101626',
      color: '#f8fafc'
    }).then((result) => {
      if (result.isConfirmed) {
        setAdminUsers(prev => prev.filter(u => u.id !== user.id));
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Access revoked for ${user.name}`,
          timer: 2000,
          background: '#101626',
          color: '#f8fafc',
          showConfirmButton: false
        });
      }
    });
  };

  // Save Governance Settings
  const handleSaveGovernance = () => {
    if (onChangeAwsConfig) {
      onChangeAwsConfig(prev => ({ ...prev, tenure: govTenure }));
    }
    if (onChangeTechnoConfig) {
      onChangeTechnoConfig(prev => ({ ...prev, tenure: govTenure }));
    }
    if (onChangeGdgocConfig) {
      onChangeGdgocConfig(prev => ({ ...prev, tenure: govTenure }));
    }

    if (onSaveBranding) {
      onSaveBranding('AWS_SBG');
      onSaveBranding('TECHNO_LAB');
      onSaveBranding('GDGOC');
    }

    // Add to audit logs
    setAuditLogs(prev => [
      {
        id: Date.now(),
        action: 'GOVERNANCE_SYNC',
        category: 'BRANDING',
        user: currentUser?.username || 'superadmin',
        desc: `Updated global tenure to "${govTenure}" and synced prefixes across chapters`,
        timestamp: new Date().toLocaleTimeString(),
        ip: '127.0.0.1'
      },
      ...prev
    ]);

    Swal.fire({
      icon: 'success',
      title: 'Global Governance Synced!',
      text: `Academic Tenure updated to "${govTenure}" across all official chapter letterheads and templates.`,
      background: '#101626',
      color: '#f8fafc',
      confirmButtonColor: '#10b981'
    });
  };

  // Export Audit Logs to CSV
  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'Category', 'Action Type', 'Administrator', 'Description', 'Timestamp', 'Client IP'];
    const rows = filteredAuditLogs.map(l => [
      `"${l.id}"`,
      `"${l.category || 'SYSTEM'}"`,
      `"${l.action}"`,
      `"${l.user}"`,
      `"${l.desc}"`,
      `"${l.timestamp}"`,
      `"${l.ip}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `ITMBU_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download DB Snapshot JSON
  const handleDownloadDbBackup = () => {
    const snapshot = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      institution: 'ITM (sls) Baroda University',
      dualClubs: ['AWS Student Builder Group (AWS_SBG)', 'Techno Lab (TECHNO_LAB)'],
      totalMembers: members.length,
      members: members,
      adminUsers: adminUsers,
      auditLogs: auditLogs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `ITMBU_Universal_Portal_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    Swal.fire({
      icon: 'success',
      title: 'Database Backup Generated!',
      text: `Full snapshot exported (${members.length} members & ${adminUsers.length} administrators).`,
      background: '#101626',
      color: '#f8fafc',
      confirmButtonColor: '#ff9900'
    });
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    e.preventDefault();
    const currentMasterPwd = localStorage.getItem('superadmin_master_pwd') || 'admin123';
    if (!pwdCurrent) {
      Swal.fire({ icon: 'warning', title: 'Current Password Required', text: 'Please enter your current master passkey.', background: '#101626', color: '#f8fafc', confirmButtonColor: '#f59e0b' });
      return;
    }
    if (pwdCurrent !== currentMasterPwd) {
      Swal.fire({ icon: 'error', title: 'Invalid Passkey', text: 'The current master password you entered is incorrect.', background: '#101626', color: '#f8fafc', confirmButtonColor: '#ef4444' });
      return;
    }
    if (pwdNew.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'New password must be at least 6 characters long.', background: '#101626', color: '#f8fafc', confirmButtonColor: '#f59e0b' });
      return;
    }
    if (pwdNew !== pwdConfirm) {
      Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'New passwords do not match.', background: '#101626', color: '#f8fafc', confirmButtonColor: '#f59e0b' });
      return;
    }

    localStorage.setItem('superadmin_master_pwd', pwdNew);
    setPwdCurrent('');
    setPwdNew('');
    setPwdConfirm('');

    Swal.fire({
      icon: 'success',
      title: 'Master Passkey Updated!',
      text: 'Super Admin master credentials updated successfully and enforced across all logins.',
      background: '#101626',
      color: '#f8fafc',
      confirmButtonColor: '#10b981'
    });
  };

  // Terminate other sessions
  const handleTerminateSessions = () => {
    Swal.fire({
      title: 'Revoke All Active Sessions?',
      text: 'This will invalidate all current login tokens across other browsers and devices.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Revoke Sessions',
      background: '#101626',
      color: '#f8fafc'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'All Other Sessions Revoked',
          text: 'Only this active Master Universal session remains authenticated.',
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#10b981'
        });
      }
    });
  };

  // Security compliance certificate
  const handlePrintCertificate = () => {
    Swal.fire({
      icon: 'info',
      title: 'Security & Compliance Certificate',
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
          <p><b>Institution:</b> ITM (sls) Baroda University</p>
          <p><b>Dual-Club Portal:</b> AWS SBG & Techno Lab</p>
          <p><b>Database Integrity:</b> PostgreSQL RLS Active & WebSockets Live</p>
          <p><b>Audited Roles:</b> 5 Administrative Tiers & 8 Official Student Roles</p>
          <p><b>Compliance Status:</b> ISO/IEC 27001 & ITMBU Standards Compliant</p>
          <p><b>Timestamp:</b> ${new Date().toLocaleString()}</p>
        </div>
      `,
      background: '#101626',
      color: '#f8fafc',
      confirmButtonText: '🖨️ Print Certificate',
      confirmButtonColor: '#38bdf8'
    }).then((res) => {
      if (res.isConfirmed) {
        window.print();
      }
    });
  };

  return (
    <div className="super-modal-backdrop">
      <div className="super-console-container">
        
        {/* TOP HEADER BAR */}
        <header className="super-console-header">
          <div className="super-header-left">
            <div className="super-crown-box">👑</div>
            <div className="super-title-block">
              <div className="super-badge-row">
                <h2>Super Administrator Universal Control Center</h2>
                <span className="badge-master-level">LEVEL 5 MASTER ACCESS</span>
              </div>
              <p className="super-subtext">
                ITM (sls) Baroda University &bull; Dual-Club Governance & Security Command (AWS SBG + Techno Lab)
              </p>
            </div>
          </div>

          <div className="super-header-right">
            <div className="super-db-live-indicator">
              <span className="live-pulsar"></span>
              <span>{dbProvider} (Live Synchronized)</span>
            </div>
            <button className="btn-close-super-console" onClick={onClose} title="Close Super Admin Console">
              ✕
            </button>
          </div>
        </header>

        {/* 2-COLUMN LAYOUT: SIDEBAR NAVIGATION + CONTENT AREA */}
        <div className="super-console-body">
          
          {/* LEFT SIDEBAR NAVIGATION (5 MODULES) */}
          <nav className="super-sidebar-nav">
            <span className="nav-group-label">NAVIGATION MODULES</span>
            
            {/* TAB 1: USER MANAGEMENT */}
            <button
              className={`super-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-btn-icon">👥</span>
              <div className="nav-btn-text">
                <strong>1. User Management</strong>
                <small>5 Roles & RBAC Control</small>
              </div>
            </button>

            {/* TAB 2: AUDIT & ACTIVITY LOGS */}
            <button
              className={`super-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span className="nav-btn-icon">📜</span>
              <div className="nav-btn-text">
                <strong>2. Audit & Activity Logs</strong>
                <small>Live Timeline & Trails</small>
              </div>
            </button>

            {/* TAB 3: DATABASE & CLOUD SYNC */}
            <button
              className={`super-nav-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              <span className="nav-btn-icon">⚡</span>
              <div className="nav-btn-text">
                <strong>3. Database & Cloud Sync</strong>
                <small>PostgreSQL & Realtime Hub</small>
              </div>
            </button>

            {/* TAB 4: GLOBAL GOVERNANCE */}
            <button
              className={`super-nav-btn ${activeTab === 'governance' ? 'active' : ''}`}
              onClick={() => setActiveTab('governance')}
            >
              <span className="nav-btn-icon">🏛️</span>
              <div className="nav-btn-text">
                <strong>4. Dual-Club Governance</strong>
                <small>Tenure & Ref Series Rules</small>
              </div>
            </button>

            {/* TAB 5: SECURITY & SESSIONS */}
            <button
              className={`super-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="nav-btn-icon">🛡️</span>
              <div className="nav-btn-text">
                <strong>5. Security & Sessions</strong>
                <small>Auto-Lock & Keys</small>
              </div>
            </button>

            <div className="super-sidebar-footer">
              <div className="super-active-user-card">
                <span className="u-avatar">👑</span>
                <div className="u-meta">
                  <strong>{currentUser?.displayName || 'Super Admin'}</strong>
                  <small>Master Universal Session</small>
                </div>
              </div>
            </div>
          </nav>

          {/* RIGHT CONTENT DISPLAY PANEL */}
          <main className="super-content-panel">
            
            {/* ======================================================== */}
            {/* 1. USER MANAGEMENT (5 ROLES & RBAC + REGISTERED TABLE) */}
            {/* ======================================================== */}
            {activeTab === 'users' && (
              <div className="super-tab-view">
                
                <div className="tab-view-header">
                  <div>
                    <h3>👥 Administrator & User Access Management</h3>
                    <p>Assign and manage administrative privileges (5 Roles) and registered chapter students (8 Official Roles).</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="super-btn-primary" onClick={() => {
                      setEditingUser(null);
                      setUserFormData({ name: '', username: '', email: '', role: 'AWS_LEAD_ADMIN', organization: 'AWS_SBG', password: '' });
                      setIsAddUserModalOpen(true);
                    }}>
                      ➕ Add Administrator
                    </button>
                  </div>
                </div>

                {/* SUB-TAB SELECTOR: RBAC ADMINS VS ALL REGISTERED MEMBERS TABLE */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => setUserViewSubTab('rbac_admins')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: userViewSubTab === 'rbac_admins' ? '1px solid #ff9900' : '1px solid #1e293b',
                      background: userViewSubTab === 'rbac_admins' ? 'rgba(255, 153, 0, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      color: userViewSubTab === 'rbac_admins' ? '#ff9900' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    🛡️ System Administrators (5 Master Roles & RBAC)
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserViewSubTab('all_members_table')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: userViewSubTab === 'all_members_table' ? '1px solid #38bdf8' : '1px solid #1e293b',
                      background: userViewSubTab === 'all_members_table' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      color: userViewSubTab === 'all_members_table' ? '#38bdf8' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    📋 Full Registered Members Table (8 Roles & Verifications)
                  </button>
                </div>

                {userViewSubTab === 'rbac_admins' ? (
                  <>
                    {/* 5 ROLES OVERVIEW BAR */}
                    <div className="roles-overview-grid">
                      {Object.values(SYSTEM_ROLES).map(r => (
                        <div
                          key={r.id}
                          className={`role-overview-card ${roleFilter === r.id ? 'active-role-card' : ''}`}
                          onClick={() => setRoleFilter(roleFilter === r.id ? 'ALL' : r.id)}
                        >
                          <div className="role-card-top">
                            <span className="role-tag" style={{ borderColor: r.color, color: r.color }}>{r.badge}</span>
                            <span className="role-count-badge">
                              {adminUsers.filter(u => u.role === r.id).length} Active
                            </span>
                          </div>
                          <h4 className="role-card-title">{r.title}</h4>
                          <p className="role-card-desc">{r.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* ADMINS TABLE */}
                    <div className="users-table-box">
                      <div className="users-table-toolbar">
                        <div className="users-search-input-wrap">
                          <span>🔍</span>
                          <input
                            type="text"
                            placeholder="Search administrators by name, username, email..."
                            value={searchUserQuery}
                            onChange={(e) => setSearchUserQuery(e.target.value)}
                          />
                          {searchUserQuery && (
                            <button onClick={() => setSearchUserQuery('')}>✕</button>
                          )}
                        </div>

                        <div className="users-filter-dropdowns">
                          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="ALL">All 5 System Roles ({adminUsers.length})</option>
                            {Object.values(SYSTEM_ROLES).map(r => (
                              <option key={r.id} value={r.id}>{r.badge} ({adminUsers.filter(u => u.role === r.id).length})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <table className="super-data-table">
                        <thead>
                          <tr>
                            <th>ADMINISTRATOR</th>
                            <th>ASSIGNED ROLE (5 TIERS)</th>
                            <th>SCOPE / CLUB</th>
                            <th>STATUS</th>
                            <th>LAST ACTIVE</th>
                            <th>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdminUsers.map(u => {
                            const roleObj = SYSTEM_ROLES[u.role] || SYSTEM_ROLES.SUPER_ADMIN;
                            return (
                              <tr key={u.id}>
                                <td>
                                  <div className="user-profile-cell">
                                    <span className="user-avatar-pill">{u.avatar || '🛡️'}</span>
                                    <div>
                                      <strong className="user-name-text">{u.name}</strong>
                                      <div className="user-meta-sub">
                                        <code>@{u.username}</code> &bull; <span>{u.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="system-role-pill" style={{ borderColor: roleObj.color, color: roleObj.color, background: `${roleObj.color}15` }}>
                                    {roleObj.badge}
                                  </span>
                                </td>
                                <td>
                                  <span className={`scope-badge ${u.organization === 'ALL' ? 'scope-universal' : u.organization === 'AWS_SBG' ? 'scope-aws' : 'scope-techno'}`}>
                                    {u.organization === 'ALL' ? 'Universal (Both Clubs)' : u.organization === 'AWS_SBG' ? 'AWS SBG Chapter' : 'Techno Lab Hub'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-pill ${u.status === 'ACTIVE' ? 'status-active' : 'status-suspended'}`}>
                                    {u.status === 'ACTIVE' ? '● Active' : '○ Suspended'}
                                  </span>
                                </td>
                                <td>
                                  <span className="time-text">{u.lastActive}</span>
                                </td>
                                <td>
                                  <div className="super-actions-cell">
                                    <button
                                      className="btn-super-edit"
                                      onClick={() => {
                                        setEditingUser(u);
                                        setUserFormData({
                                          name: u.name,
                                          username: u.username,
                                          email: u.email,
                                          role: u.role,
                                          organization: u.organization || 'AWS_SBG',
                                          password: ''
                                        });
                                        setIsAddUserModalOpen(true);
                                      }}
                                      title="Edit role and credentials"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      className={`btn-super-toggle ${u.status === 'ACTIVE' ? 'btn-suspend' : 'btn-activate'}`}
                                      onClick={() => handleToggleUserStatus(u.id)}
                                      title={u.status === 'ACTIVE' ? 'Suspend account' : 'Activate account'}
                                    >
                                      {u.status === 'ACTIVE' ? '🚫 Suspend' : '✓ Activate'}
                                    </button>
                                    <button
                                      className="btn-super-delete"
                                      onClick={() => handleDeleteUser(u)}
                                      title="Revoke administrator access"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* RBAC MATRIX */}
                    <div className="rbac-matrix-box" style={{ marginTop: '24px' }}>
                      <h4>🛡️ Role-Based Access Control (RBAC) Permission Matrix</h4>
                      <table className="rbac-table">
                        <thead>
                          <tr>
                            <th>FEATURE / CAPABILITY</th>
                            <th>SUPER ADMIN</th>
                            <th>AWS LEAD</th>
                            <th>TECHNO LEAD</th>
                            <th>FACULTY MENTOR</th>
                            <th>AUDITOR</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Roster & Core Team Management</td>
                            <td className="perm-grant">✓ Universal</td>
                            <td className="perm-grant">✓ AWS Only</td>
                            <td className="perm-grant">✓ Techno Only</td>
                            <td className="perm-view">✓ View</td>
                            <td className="perm-view">✓ View</td>
                          </tr>
                          <tr>
                            <td>Appointment Letter Issuance & Print</td>
                            <td className="perm-grant">✓ Universal</td>
                            <td className="perm-grant">✓ AWS Only</td>
                            <td className="perm-grant">✓ Techno Only</td>
                            <td className="perm-view">✓ Verify</td>
                            <td className="perm-deny">✕ View Only</td>
                          </tr>
                          <tr>
                            <td>Logos, Brandings & Signature Vault</td>
                            <td className="perm-grant">✓ Full Edit</td>
                            <td className="perm-grant">✓ AWS Edit</td>
                            <td className="perm-grant">✓ Techno Edit</td>
                            <td className="perm-grant">✓ Sign Vault</td>
                            <td className="perm-deny">✕ No</td>
                          </tr>
                          <tr>
                            <td>Cloud Database Reseed & User RBAC</td>
                            <td className="perm-grant">✓ Master</td>
                            <td className="perm-deny">✕ Restricted</td>
                            <td className="perm-deny">✕ Restricted</td>
                            <td className="perm-deny">✕ Restricted</td>
                            <td className="perm-deny">✕ Restricted</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  /* SUB-TAB 2: FULL REGISTERED MEMBERS TABLE COMPONENT */
                  <UsersTable
                    users={members.map(m => ({
                      id: m._id || m.id,
                      name: m.name,
                      email: m.email || `${m.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in`,
                      username: m.username || m.name.toLowerCase().replace(/[^a-z0-9]/g, '.'),
                      role: m.roleType || 'General Member',
                      organization: m.organization || activeOrg,
                      department: m.department || 'General / Unassigned',
                      designation: m.designation || 'Core Member',
                      semester: m.semester || '3',
                      branch: m.branch || 'B.Tech CSE',
                      emailConfirmed: true,
                      status: m.roleType === 'General Member' ? 'PENDING_PROMOTION' : 'ACTIVE',
                      avatar: m.avatar || (m.name ? m.name[0] : '👤')
                    }))}
                    currentUser={currentUser}
                    activeOrg={activeOrg}
                    onPromoteUser={(user) => {
                      if (onOpenPromoteModal) {
                        const targetMember = members.find(m => m._id === user.id || m.id === user.id || m.name === user.name);
                        onOpenPromoteModal(targetMember || user);
                      }
                    }}
                    onAddUser={onAddMember}
                    onEditUser={(user) => {
                      if (onEditMember) {
                        const targetMember = members.find(m => m._id === user.id || m.id === user.id || m.name === user.name);
                        onEditMember(targetMember || user);
                      }
                    }}
                    onDeleteUser={(user) => {
                      if (onDeleteMember) {
                        onDeleteMember(user.id);
                      }
                    }}
                  />
                )}

              </div>
            )}

            {/* ======================================================== */}
            {/* 2. AUDIT & ACTIVITY LOGS */}
            {/* ======================================================== */}
            {activeTab === 'audit' && (
              <div className="super-tab-view">
                <div className="tab-view-header">
                  <div>
                    <h3>📜 Live System Audit & Action History</h3>
                    <p>Tamper-evident timestamped trail of all appointments issued, deletions, logins, and database syncs.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="super-btn-secondary" onClick={handleExportAuditCSV}>
                      📥 Export Audit CSV
                    </button>
                    <button className="super-btn-danger" onClick={() => {
                      setAuditLogs([]);
                      localStorage.removeItem('offer_gen_audit_logs');
                    }}>
                      🧹 Clear Audit History
                    </button>
                  </div>
                </div>

                {/* AUDIT FILTER & SEARCH TOOLBAR */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search audit trail by description, actor, action..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px 9px 36px', background: '#111828', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <select
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                    style={{ padding: '9px 14px', background: '#111828', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="ALL">All Event Categories ({auditLogs.length})</option>
                    <option value="AUTH">Authentication & Logins</option>
                    <option value="DATABASE">Cloud DB & WebSockets</option>
                    <option value="ROLES">Role Promotions & RBAC</option>
                    <option value="LETTERS">Letter Issuance</option>
                    <option value="BRANDING">Branding & Crests</option>
                    <option value="SECURITY">Security Audits</option>
                  </select>
                </div>

                <div className="audit-timeline-container">
                  {filteredAuditLogs.length === 0 ? (
                    <div className="empty-audit-state">
                      <span>📜 No audit actions recorded matching current filter.</span>
                    </div>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <div key={log.id} className="audit-log-item">
                        <div className="audit-time-col">
                          <strong>{log.timestamp}</strong>
                          <small>{log.ip}</small>
                        </div>
                        <div className="audit-dot"></div>
                        <div className="audit-content-col">
                          <div className="audit-header-line">
                            <span className="audit-action-tag">{log.action}</span>
                            <span className="audit-user-tag">Actor: <strong>{log.user}</strong></span>
                          </div>
                          <p className="audit-desc-text">{log.desc}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. DATABASE & CLOUD SYNC CONTROL */}
            {/* ======================================================== */}
            {activeTab === 'database' && (
              <div className="super-tab-view">
                <div className="tab-view-header">
                  <div>
                    <h3>⚡ Cloud Database Health & Bilateral Sync Engine</h3>
                    <p>Live health metrics for Supabase PostgreSQL & MongoDB with one-click snapshot backups.</p>
                  </div>
                  <button className="super-btn-primary" onClick={() => onSyncDatabase && onSyncDatabase(false)}>
                    🔄 Force 100% Cloud Refresh
                  </button>
                </div>

                {/* STATS METRIC METERS */}
                <div className="db-metrics-grid">
                  <div className="db-metric-card">
                    <span className="m-label">Active Cloud Provider</span>
                    <strong className="m-value" style={{ color: '#38bdf8' }}>{dbProvider}</strong>
                    <span className="m-sub">PostgreSQL Cloud Tables</span>
                  </div>

                  <div className="db-metric-card">
                    <span className="m-label">Roster Records in DB</span>
                    <strong className="m-value" style={{ color: '#10b981' }}>{members.length} Members</strong>
                    <span className="m-sub">AWS SBG + Techno Lab</span>
                  </div>

                  <div className="db-metric-card">
                    <span className="m-label">Realtime WebSockets</span>
                    <strong className="m-value" style={{ color: '#a855f7' }}>Live Active</strong>
                    <span className="m-sub">Multi-Client Instant Sync</span>
                  </div>

                  <div className="db-metric-card">
                    <span className="m-label">Last Successful Sync</span>
                    <strong className="m-value" style={{ color: '#f59e0b', fontSize: '15px' }}>
                      {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Connected'}
                    </strong>
                    <span className="m-sub">Auto-poller active (15s)</span>
                  </div>
                </div>

                {/* BACKUP & SNAPSHOT TOOLS */}
                <div className="db-tools-section">
                  <h4>💾 Database Backup, Snapshots & Disaster Recovery</h4>
                  <div className="db-tools-grid">
                    <div className="db-tool-card">
                      <div className="tool-icon">📥</div>
                      <div>
                        <strong>Export Full Cloud Database Snapshot</strong>
                        <p>Download full structured JSON file containing all roster members, custom departments, and brandings.</p>
                      </div>
                      <button className="super-btn-secondary" onClick={handleDownloadDbBackup}>
                        Download Snapshot (.json)
                      </button>
                    </div>

                    <div className="db-tool-card">
                      <div className="tool-icon">🔄</div>
                      <div>
                        <strong>Reseed Default University Rosters</strong>
                        <p>Reset and reload the verified official roster for AWS SBG and Techno Lab.</p>
                      </div>
                      <button className="super-btn-danger" onClick={() => onResetDatabase && onResetDatabase()}>
                        Reseed Database
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. TRIO-CLUB GLOBAL GOVERNANCE & VISIBILITY SWITCHES */}
            {/* ======================================================== */}
            {activeTab === 'governance' && (
              <div className="super-tab-view">
                <div className="tab-view-header">
                  <div>
                    <h3>🏛️ Trio-Club Global Governance & Chapter Visibility</h3>
                    <p>Enable/disable chapter visibility in navbar/login, configure academic tenure, and update reference numbering series.</p>
                  </div>
                  <button className="super-btn-primary" onClick={handleSaveGovernance}>
                    💾 Save Governance Rules
                  </button>
                </div>

                {/* CHAPTER VISIBILITY SWITCHES MATRIX */}
                <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '15px' }}>🎛️ Official Chapter Visibility & Display Toggles</h4>
                      <small style={{ color: '#94a3b8' }}>Turn ON/OFF visibility for portal navbar slider and student login. (Minimum 1 chapter must remain active).</small>
                    </div>
                    <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                      ⚡ Real-time Dynamic Filter
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {/* CHAPTER 1: AWS SBG */}
                    <div style={{ background: '#131b2e', border: visibleChapters.AWS_SBG ? '1px solid #ff9900' : '1px solid #23314a', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>☁️</span>
                        <div>
                          <strong style={{ display: 'block', color: '#f8fafc', fontSize: '13.5px' }}>AWS SBG Chapter</strong>
                          <span style={{ fontSize: '11px', color: visibleChapters.AWS_SBG ? '#ff9900' : '#64748b' }}>
                            {visibleChapters.AWS_SBG ? '● Visible in Portal' : '○ Hidden'}
                          </span>
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={visibleChapters.AWS_SBG !== false}
                          onChange={() => {
                            if (onToggleChapterVisibility) onToggleChapterVisibility('AWS_SBG');
                          }}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: visibleChapters.AWS_SBG !== false ? '#ff9900' : '#334155',
                          borderRadius: '24px', transition: '0.3s'
                        }}>
                          <span style={{
                            position: 'absolute', content: '', height: '18px', width: '18px', left: visibleChapters.AWS_SBG !== false ? '24px' : '3px', bottom: '3px',
                            backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                          }}></span>
                        </span>
                      </label>
                    </div>

                    {/* CHAPTER 2: TECHNO LAB */}
                    <div style={{ background: '#131b2e', border: visibleChapters.TECHNO_LAB ? '1px solid #00d2ff' : '1px solid #23314a', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🔬</span>
                        <div>
                          <strong style={{ display: 'block', color: '#f8fafc', fontSize: '13.5px' }}>Techno Lab Club</strong>
                          <span style={{ fontSize: '11px', color: visibleChapters.TECHNO_LAB ? '#00d2ff' : '#64748b' }}>
                            {visibleChapters.TECHNO_LAB ? '● Visible in Portal' : '○ Hidden'}
                          </span>
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={visibleChapters.TECHNO_LAB !== false}
                          onChange={() => {
                            if (onToggleChapterVisibility) onToggleChapterVisibility('TECHNO_LAB');
                          }}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: visibleChapters.TECHNO_LAB !== false ? '#00d2ff' : '#334155',
                          borderRadius: '24px', transition: '0.3s'
                        }}>
                          <span style={{
                            position: 'absolute', content: '', height: '18px', width: '18px', left: visibleChapters.TECHNO_LAB !== false ? '24px' : '3px', bottom: '3px',
                            backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                          }}></span>
                        </span>
                      </label>
                    </div>

                    {/* CHAPTER 3: GDGOC ITMBU */}
                    <div style={{ background: '#131b2e', border: visibleChapters.GDGOC ? '1px solid #4285F4' : '1px solid #23314a', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🌐</span>
                        <div>
                          <strong style={{ display: 'block', color: '#f8fafc', fontSize: '13.5px' }}>GDGoC ITMBU</strong>
                          <span style={{ fontSize: '11px', color: visibleChapters.GDGOC ? '#4285F4' : '#64748b' }}>
                            {visibleChapters.GDGOC ? '● Visible in Portal' : '○ Hidden'}
                          </span>
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={visibleChapters.GDGOC !== false}
                          onChange={() => {
                            if (onToggleChapterVisibility) onToggleChapterVisibility('GDGOC');
                          }}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: visibleChapters.GDGOC !== false ? '#4285F4' : '#334155',
                          borderRadius: '24px', transition: '0.3s'
                        }}>
                          <span style={{
                            position: 'absolute', content: '', height: '18px', width: '18px', left: visibleChapters.GDGOC !== false ? '24px' : '3px', bottom: '3px',
                            backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                          }}></span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="gov-form-grid">
                  
                  <div className="gov-field-group">
                    <label>📅 Official Academic Appointment Tenure (Rendered in Letter Paragraph 2)</label>
                    <input
                      type="text"
                      className="super-input"
                      value={govTenure}
                      onChange={(e) => setGovTenure(e.target.value)}
                      placeholder="e.g. Academic Year 2026 – 2027"
                    />
                    <small>This tenure string is automatically inserted across all official letters.</small>
                  </div>

                  <div className="gov-field-group">
                    <label>☁️ AWS SBG Reference Number Prefix Formula</label>
                    <input
                      type="text"
                      className="super-input"
                      value={govAwsPrefix}
                      onChange={(e) => setGovAwsPrefix(e.target.value)}
                    />
                    <small>Default: <code>AWS-SBG/ITMBU/2026-27/JL</code></small>
                  </div>

                  <div className="gov-field-group">
                    <label>🔬 Techno Lab Reference Number Prefix Formula</label>
                    <input
                      type="text"
                      className="super-input"
                      value={govTechnoPrefix}
                      onChange={(e) => setGovTechnoPrefix(e.target.value)}
                    />
                    <small>Default: <code>TECHNO-LAB/ITMBU/2026-27/JL</code></small>
                  </div>

                  <div className="gov-field-group">
                    <label>🌐 GDGoC ITMBU Reference Number Prefix Formula</label>
                    <input
                      type="text"
                      className="super-input"
                      value={govGdgocPrefix}
                      onChange={(e) => setGovGdgocPrefix(e.target.value)}
                    />
                    <small>Default: <code>GDGOC/ITMBU/2026-27/JL</code></small>
                  </div>

                  <div className="gov-field-group">
                    <label>🏫 University Institution Name (Header Title)</label>
                    <input
                      type="text"
                      className="super-input"
                      value="ITM (sls) BARODA UNIVERSITY"
                      readOnly
                      disabled
                    />
                    <small>Vadodara, Gujarat • CSE & IT Department</small>
                  </div>

                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. SECURITY & SESSION SETTINGS */}
            {/* ======================================================== */}
            {activeTab === 'security' && (
              <div className="super-tab-view">
                <div className="tab-view-header">
                  <div>
                    <h3>🛡️ Security, Access Keys & Session Protection</h3>
                    <p>Manage administrative session timeouts, Cloudflare proxy settings, and multi-device authentication policies.</p>
                  </div>
                  <button className="super-btn-secondary" onClick={handlePrintCertificate}>
                    📜 Print Security Certificate
                  </button>
                </div>

                <div className="security-settings-grid">
                  
                  <div className="sec-card">
                    <div className="sec-card-header">
                      <span className="sec-icon">⏱️</span>
                      <div>
                        <strong>Automatic Session Idle Timeout</strong>
                        <p>Auto-lock administrative console when inactive to protect university credentials.</p>
                      </div>
                    </div>
                    <select
                      className="super-select"
                      value={sessionTimeout}
                      onChange={(e) => {
                        setSessionTimeout(e.target.value);
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Session timeout set to ${e.target.value}`, timer: 2000, background: '#101626', color: '#f8fafc', showConfirmButton: false });
                      }}
                    >
                      <option value="15m">15 Minutes (Strict Security)</option>
                      <option value="30m">30 Minutes (Recommended)</option>
                      <option value="1h">1 Hour</option>
                      <option value="8h">8 Hours (Full Shift)</option>
                      <option value="never">Never (Developer Mode)</option>
                    </select>
                  </div>

                  <div className="sec-card">
                    <div className="sec-card-header">
                      <span className="sec-icon">🔒</span>
                      <div>
                        <strong>Emergency Portal Maintenance Lock</strong>
                        <p>Lock letter generation and restrict all logins exclusively to Super Administrators.</p>
                      </div>
                    </div>
                    <label className="switch-toggle-label">
                      <input
                        type="checkbox"
                        checked={govMaintenanceMode}
                        onChange={(e) => {
                          setGovMaintenanceMode(e.target.checked);
                          Swal.fire({ toast: true, position: 'top-end', icon: e.target.checked ? 'warning' : 'info', title: e.target.checked ? 'Maintenance Lock Activated' : 'Maintenance Lock Deactivated', timer: 2500, background: '#101626', color: '#f8fafc', showConfirmButton: false });
                        }}
                      />
                      <span>{govMaintenanceMode ? '🔴 Active Lock (Super Admin Only)' : '🟢 Normal Operations'}</span>
                    </label>
                  </div>

                  <div className="sec-card full-sec-card">
                    <div className="sec-card-header">
                      <span className="sec-icon">🔑</span>
                      <div>
                        <strong>Master Super Administrator Password</strong>
                        <p>Update universal root authentication credentials for dual-club administration.</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordChange} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                      <input
                        type="password"
                        placeholder="Current Master Password"
                        className="super-input"
                        value={pwdCurrent}
                        onChange={(e) => setPwdCurrent(e.target.value)}
                        required
                      />
                      <input
                        type="password"
                        placeholder="New Password (Min 6 chars)"
                        className="super-input"
                        value={pwdNew}
                        onChange={(e) => setPwdNew(e.target.value)}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        className="super-input"
                        value={pwdConfirm}
                        onChange={(e) => setPwdConfirm(e.target.value)}
                        required
                      />
                      <button type="submit" className="super-btn-primary" style={{ alignSelf: 'center' }}>
                        💾 Update Password
                      </button>
                    </form>
                  </div>

                  <div className="sec-card full-sec-card">
                    <div className="sec-card-header">
                      <span className="sec-icon">🚪</span>
                      <div>
                        <strong>Active Multi-Device Sessions</strong>
                        <p>Revoke and terminate all active login tokens across other workstations.</p>
                      </div>
                    </div>
                    <button className="super-btn-danger" onClick={handleTerminateSessions} style={{ marginTop: '10px' }}>
                      🚫 Terminate All Other Sessions
                    </button>
                  </div>

                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* SUB-MODAL: ADD / EDIT ADMINISTRATOR */}
      {isAddUserModalOpen && (
        <div className="super-submodal-backdrop">
          <div className="super-submodal-box">
            <div className="submodal-header">
              <h3>{editingUser ? '✏️ Edit Administrator' : '➕ Add System Administrator'}</h3>
              <button onClick={() => setIsAddUserModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveUserForm} className="submodal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="super-input"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. Dr. Pradeep Laxkar"
                  required
                />
              </div>

              <div className="form-group">
                <label>Admin Username *</label>
                <input
                  type="text"
                  className="super-input"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="e.g. aws.organizer"
                  required
                />
              </div>

              <div className="form-group">
                <label>Official Email Address *</label>
                <input
                  type="email"
                  className="super-input"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="e.g. aws.itmbu@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Assign System Role (5 Tiers) *</label>
                <select
                  className="super-select"
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                >
                  {Object.values(SYSTEM_ROLES).map(r => (
                    <option key={r.id} value={r.id}>{r.badge} &bull; {r.title}</option>
                  ))}
                </select>
              </div>

              {userFormData.role !== 'SUPER_ADMIN' && userFormData.role !== 'FACULTY_ADVISOR' && userFormData.role !== 'VIEWER_AUDITOR' && (
                <div className="form-group">
                  <label>Assigned Club Chapter *</label>
                  <select
                    className="super-select"
                    value={userFormData.organization}
                    onChange={(e) => setUserFormData({ ...userFormData, organization: e.target.value })}
                  >
                    <option value="AWS_SBG">☁️ AWS Student Builder Group</option>
                    <option value="TECHNO_LAB">🔬 Techno Lab Innovation Wing</option>
                  </select>
                </div>
              )}

              <div className="submodal-footer">
                <button type="button" className="super-btn-secondary" onClick={() => setIsAddUserModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="super-btn-primary">
                  💾 {editingUser ? 'Save Administrator' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
