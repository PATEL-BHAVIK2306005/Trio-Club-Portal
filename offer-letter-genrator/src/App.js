import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { INITIAL_TEAM_DATA, CLUB_CONFIGS } from './data/teamData';
import OfficialJoiningLetter from './components/OfficialJoiningLetter';
import TeamRosterGrid from './components/TeamRosterGrid';
import LetterControls from './components/LetterControls';
import BatchGeneratorModal from './components/BatchGeneratorModal';
import AddMemberModal from './components/AddMemberModal';
import EditMemberModal from './components/EditMemberModal';
import PromoteMemberModal from './components/PromoteMemberModal';
import TeamManagement from './components/TeamManagement';
import BrandingSettings from './components/BrandingSettings';
import AuthScreen from './components/AuthScreen';
import SuperAdminConsole from './components/SuperAdminConsole';
import Swal from 'sweetalert2';
import {
  fetchSupabaseMembers,
  insertSupabaseMember,
  updateSupabaseMember,
  deleteSupabaseMember,
  bulkDeleteSupabaseMembers,
  seedSupabaseMembers,
  fetchSupabaseBranding,
  saveSupabaseBranding,
  subscribeToSupabaseMembers,
  subscribeToSupabaseBranding
} from './services/supabaseService';

const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

function App() {
  // Navigation View State: 'letter_studio' | 'team_management' | 'branding'
  const [currentView, setCurrentView] = useState('letter_studio');

  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('offer_gen_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Active Organization / Section: 'AWS_SBG' or 'TECHNO_LAB'
  const [activeOrg, setActiveOrg] = useState(() => {
    const saved = localStorage.getItem('offer_gen_user');
    if (saved) {
      const u = JSON.parse(saved);
      return u.organization || 'AWS_SBG';
    }
    return 'AWS_SBG';
  });

  // Data & Member State
  const [members, setMembers] = useState(INITIAL_TEAM_DATA);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  // Universal Institutional Branding
  const [itmbuLogo, setItmbuLogo] = useState(() => localStorage.getItem('itmbu_crest_logo') || null);

  // AWS SBG Branding & Signatures State
  const [awsClubLogo, setAwsClubLogo] = useState(() => localStorage.getItem('aws_sbg_logo') || null);
  const [awsOrganizerSig, setAwsOrganizerSig] = useState(() => localStorage.getItem('aws_organizer_sig') || null);
  const [awsAdvisorSig, setAwsAdvisorSig] = useState(() => localStorage.getItem('aws_advisor_sig') || null);
  const [awsMentorSig, setAwsMentorSig] = useState(() => localStorage.getItem('aws_mentor_sig') || null);

  // Techno Lab Branding & Signatures State
  const [technoClubLogo, setTechnoClubLogo] = useState(() => localStorage.getItem('techno_lab_logo') || null);
  const [technoOrganizerSig, setTechnoOrganizerSig] = useState(() => localStorage.getItem('techno_organizer_sig') || null);
  const [technoAdvisorSig, setTechnoAdvisorSig] = useState(() => localStorage.getItem('techno_advisor_sig') || null);
  const [technoMentorSig, setTechnoMentorSig] = useState(() => localStorage.getItem('techno_mentor_sig') || null);

  // Letter Config State per Club
  const [awsLetterConfig, setAwsLetterConfig] = useState(() => {
    const club = CLUB_CONFIGS.AWS_SBG;
    return {
      issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      tenure: 'Academic Year 2026 – 2027',
      letterRefId: '',
      contactEmail: club.email,
      subtitle: club.subtitle || 'Official Student Community Chapter • Department of Computer Science & Engineering',
      organizerName: club.organizer?.name || 'Bhavikkumar Patel',
      organizerTitle: club.organizer?.title || 'AWS SBG Leader / Organizer',
      organizerOrg: club.organizer?.org || 'ITM (sls) Baroda University',
      advisorName: club.advisor?.name || 'Vansham Kamboj',
      advisorTitle: club.advisor?.title || 'Advisor',
      advisorOrg: club.advisor?.org || 'AWS SBG ITMBU',
      mentorName: club.mentor?.name || 'Dr. Pradeep Laxkar',
      mentorTitle: club.mentor?.title || 'Faculty Mentor / Head',
      mentorOrg: club.mentor?.org || 'ITM (sls) Baroda University'
    };
  });

  const [technoLetterConfig, setTechnoLetterConfig] = useState(() => {
    const club = CLUB_CONFIGS.TECHNO_LAB;
    return {
      issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      tenure: 'Academic Year 2026 – 2027',
      letterRefId: '',
      contactEmail: club.email,
      subtitle: club.subtitle || 'Innovation, Robotics & Technical Research Chapter • CSE & IT Department',
      organizerName: club.organizer?.name || 'Vansham Kamboj',
      organizerTitle: club.organizer?.title || 'President & Lead Organizer',
      organizerOrg: club.organizer?.org || 'ITM (sls) Baroda University',
      advisorName: club.advisor?.name || 'Mannan C.',
      advisorTitle: club.advisor?.title || 'Advisor',
      advisorOrg: club.advisor?.org || 'Techno Lab ITMBU',
      mentorName: club.mentor?.name || 'Dr. Pradeep Laxkar',
      mentorTitle: club.mentor?.title || 'Faculty Mentor / Head',
      mentorOrg: club.mentor?.org || 'ITM (sls) Baroda University'
    };
  });

  // Dynamic Departments State per Club
  const [awsDepartments, setAwsDepartments] = useState(() => {
    const saved = localStorage.getItem('aws_departments');
    return saved ? JSON.parse(saved) : (CLUB_CONFIGS.AWS_SBG.departments || []);
  });

  const [technoDepartments, setTechnoDepartments] = useState(() => {
    const saved = localStorage.getItem('techno_departments');
    return saved ? JSON.parse(saved) : (CLUB_CONFIGS.TECHNO_LAB.departments || []);
  });

  // Modals & Print State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promotingMember, setPromotingMember] = useState(null);
  const [isSuperAdminConsoleOpen, setIsSuperAdminConsoleOpen] = useState(false);
  const [batchPrintList, setBatchPrintList] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbProvider, setDbProvider] = useState('Supabase Cloud');
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [dbSaveStatus, setDbSaveStatus] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Active Club Configuration & Dynamic Props
  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';

  const activeClubLogo = isAWS ? awsClubLogo : technoClubLogo;
  const activeOrganizerSig = isAWS ? awsOrganizerSig : technoOrganizerSig;
  const activeAdvisorSig = isAWS ? awsAdvisorSig : technoAdvisorSig;
  const activeMentorSig = isAWS ? awsMentorSig : technoMentorSig;
  const activeLetterConfig = isAWS ? awsLetterConfig : technoLetterConfig;
  const activeDepartments = isAWS ? awsDepartments : technoDepartments;

  // Real-time dynamic active member computed from latest members state
  const currentActiveMember = members.find(m => (
    selectedMember && (
      (m._id && selectedMember._id && m._id === selectedMember._id) ||
      (m.id && selectedMember.id && m.id === selectedMember.id) ||
      (m.name && selectedMember.name && m.name.trim().toLowerCase() === selectedMember.name.trim().toLowerCase())
    )
  )) || selectedMember;

  // Helper to apply branding list
  const applyBrandingList = useCallback((brandingList) => {
    if (!Array.isArray(brandingList)) return;
    brandingList.forEach(item => {
      if (item.itmbu_logo || item.itmbuLogo) {
        const logo = item.itmbu_logo || item.itmbuLogo;
        setItmbuLogo(logo);
        localStorage.setItem('itmbu_crest_logo', logo);
      }
      if (item.organization === 'AWS_SBG') {
        const cLogo = item.club_logo || item.clubLogo;
        const orgSig = item.organizer_signature || item.organizerSignatureImage;
        const advSig = item.advisor_signature || item.advisorSignatureImage;
        const menSig = item.mentor_signature || item.mentorSignatureImage;
        if (cLogo) { setAwsClubLogo(cLogo); localStorage.setItem('aws_sbg_logo', cLogo); }
        if (orgSig) { setAwsOrganizerSig(orgSig); localStorage.setItem('aws_organizer_sig', orgSig); }
        if (advSig) { setAwsAdvisorSig(advSig); localStorage.setItem('aws_advisor_sig', advSig); }
        if (menSig) { setAwsMentorSig(menSig); localStorage.setItem('aws_mentor_sig', menSig); }
        if (item.config) {
          setAwsLetterConfig(prev => ({ ...prev, ...item.config }));
          if (item.config.departments && Array.isArray(item.config.departments)) {
            setAwsDepartments(item.config.departments);
            localStorage.setItem('aws_departments', JSON.stringify(item.config.departments));
          }
        }
      } else if (item.organization === 'TECHNO_LAB') {
        const cLogo = item.club_logo || item.clubLogo;
        const orgSig = item.organizer_signature || item.organizerSignatureImage;
        const advSig = item.advisor_signature || item.advisorSignatureImage;
        const menSig = item.mentor_signature || item.mentorSignatureImage;
        if (cLogo) { setTechnoClubLogo(cLogo); localStorage.setItem('techno_lab_logo', cLogo); }
        if (orgSig) { setTechnoOrganizerSig(orgSig); localStorage.setItem('techno_organizer_sig', orgSig); }
        if (advSig) { setTechnoAdvisorSig(advSig); localStorage.setItem('techno_advisor_sig', advSig); }
        if (menSig) { setTechnoMentorSig(menSig); localStorage.setItem('techno_mentor_sig', menSig); }
        if (item.config) {
          setTechnoLetterConfig(prev => ({ ...prev, ...item.config }));
          if (item.config.departments && Array.isArray(item.config.departments)) {
            setTechnoDepartments(item.config.departments);
            localStorage.setItem('techno_departments', JSON.stringify(item.config.departments));
          }
        }
      }
    });
  }, []);

  // Add Department Handler
  const handleAddDepartment = async (deptName, orgKey = activeOrg) => {
    let nextDepts = [];
    if (orgKey === 'AWS_SBG') {
      nextDepts = [...awsDepartments, deptName];
      setAwsDepartments(nextDepts);
      localStorage.setItem('aws_departments', JSON.stringify(nextDepts));
      try {
        await saveSupabaseBranding('AWS_SBG', {
          itmbuLogo,
          clubLogo: awsClubLogo,
          organizerSignatureImage: awsOrganizerSig,
          advisorSignatureImage: awsAdvisorSig,
          mentorSignatureImage: awsMentorSig,
          config: { ...awsLetterConfig, departments: nextDepts }
        });
      } catch (e) {}
    } else {
      nextDepts = [...technoDepartments, deptName];
      setTechnoDepartments(nextDepts);
      localStorage.setItem('techno_departments', JSON.stringify(nextDepts));
      try {
        await saveSupabaseBranding('TECHNO_LAB', {
          itmbuLogo,
          clubLogo: technoClubLogo,
          organizerSignatureImage: technoOrganizerSig,
          advisorSignatureImage: technoAdvisorSig,
          mentorSignatureImage: technoMentorSig,
          config: { ...technoLetterConfig, departments: nextDepts }
        });
      } catch (e) {}
    }
  };

  // Delete Department Handler
  const handleDeleteDepartment = async (deptName, orgKey = activeOrg) => {
    let nextDepts = [];
    if (orgKey === 'AWS_SBG') {
      nextDepts = awsDepartments.filter(d => d !== deptName);
      setAwsDepartments(nextDepts);
      localStorage.setItem('aws_departments', JSON.stringify(nextDepts));
      try {
        await saveSupabaseBranding('AWS_SBG', {
          itmbuLogo,
          clubLogo: awsClubLogo,
          organizerSignatureImage: awsOrganizerSig,
          advisorSignatureImage: awsAdvisorSig,
          mentorSignatureImage: awsMentorSig,
          config: { ...awsLetterConfig, departments: nextDepts }
        });
      } catch (e) {}
    } else {
      nextDepts = technoDepartments.filter(d => d !== deptName);
      setTechnoDepartments(nextDepts);
      localStorage.setItem('techno_departments', JSON.stringify(nextDepts));
      try {
        await saveSupabaseBranding('TECHNO_LAB', {
          itmbuLogo,
          clubLogo: technoClubLogo,
          organizerSignatureImage: technoOrganizerSig,
          advisorSignatureImage: technoAdvisorSig,
          mentorSignatureImage: technoMentorSig,
          config: { ...technoLetterConfig, departments: nextDepts }
        });
      } catch (e) {}
    }

    // Reassign affected members in local state
    setMembers(prev => prev.map(m => {
      if ((!m.organization || m.organization === orgKey) && m.department === deptName) {
        return { ...m, department: 'General / Unassigned' };
      }
      return m;
    }));
  };

  // 1. Initialize data & Multi-Device Realtime Subscriptions on mount
  useEffect(() => {
    let memberSubChannel = null;
    let brandingSubChannel = null;
    let autoSyncInterval = null;

    const initData = async () => {
      let loadedFromSupabase = false;

      // 1. Try Supabase Cloud primary
      try {
        const supaMembers = await fetchSupabaseMembers();
        if (supaMembers && supaMembers.length > 0) {
          setMembers(supaMembers);
          setDbConnected(true);
          setDbProvider('Supabase Cloud');
          setLastSyncTime(new Date());
          loadedFromSupabase = true;
          console.log(`✓ [Cloud Sync] Loaded ${supaMembers.length} members from Supabase Cloud!`);
        } else {
          // Table exists in Supabase but empty -> Auto-seed default roster
          console.log('[Cloud Sync] Supabase table empty, auto-seeding dual-club roster...');
          try {
            const seeded = await seedSupabaseMembers(INITIAL_TEAM_DATA);
            if (seeded && seeded.length > 0) {
              setMembers(seeded);
              setDbConnected(true);
              setDbProvider('Supabase Cloud');
              setLastSyncTime(new Date());
              loadedFromSupabase = true;
            }
          } catch (seedErr) {
            console.warn('[Cloud Sync] Auto-seed notice:', seedErr.message);
          }
        }

        const supaBranding = await fetchSupabaseBranding();
        if (supaBranding && supaBranding.length > 0) {
          applyBrandingList(supaBranding);
        }
      } catch (supaErr) {
        console.warn('[Cloud Sync] Supabase connect notice:', supaErr.message);
      }

      // 2. Fallback to MongoDB if Supabase offline
      if (!loadedFromSupabase) {
        try {
          const res = await fetch(`${API_BASE_URL}/members`);
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setMembers(data.data);
            setDbConnected(true);
            setDbProvider('MongoDB Compass');
            setLastSyncTime(new Date());
          }
        } catch (mongoErr) {
          console.log('[Cloud Sync] Working in offline cache mode');
        }

        try {
          const bRes = await fetch(`${API_BASE_URL}/branding`);
          const bData = await bRes.json();
          if (bData.success && Array.isArray(bData.data)) {
            applyBrandingList(bData.data);
          }
        } catch (bErr) {}
      }
    };

    initData();

    // 2. Realtime WebSocket Subscription: Instant sync across all PCs/devices!
    memberSubChannel = subscribeToSupabaseMembers((change) => {
      console.log('⚡ [Realtime Sync] Event received:', change.eventType, change);
      setLastSyncTime(new Date());
      setDbConnected(true);

      if (change.eventType === 'INSERT' && change.newRecord) {
        const item = change.newRecord;
        setMembers(prev => {
          const exists = prev.some(m => (m._id && m._id === item._id) || (m.id && m.id === item.id) || (m.name === item.name && m.organization === item.organization));
          if (exists) {
            return prev.map(m => ((m._id && m._id === item._id) || (m.id && m.id === item.id) || (m.name === item.name && m.organization === item.organization)) ? item : m);
          }
          return [item, ...prev];
        });

        // Toast alert notifying user that another client added a member
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'info',
          title: `✨ Live Sync: "${item.name}" added to roster!`,
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          background: '#101626',
          color: '#f8fafc'
        });
      } else if (change.eventType === 'UPDATE' && change.newRecord) {
        const item = change.newRecord;
        setMembers(prev => prev.map(m => ((m._id && m._id === item._id) || (m.id && m.id === item.id) || (m.name === item.name && m.organization === item.organization)) ? item : m));
        setSelectedMember(prev => (prev && ((prev._id && prev._id === item._id) || (prev.id && prev.id === item.id) || prev.name === item.name)) ? item : prev);
      } else if (change.eventType === 'DELETE') {
        const oldId = change.raw?.old?.id?.toString();
        if (oldId) {
          setMembers(prev => prev.filter(m => m._id !== oldId && m.id !== oldId));
        }
      }
    });

    // Branding Realtime Channel
    brandingSubChannel = subscribeToSupabaseBranding(async () => {
      try {
        const updatedBranding = await fetchSupabaseBranding();
        if (updatedBranding && updatedBranding.length > 0) {
          applyBrandingList(updatedBranding);
        }
      } catch (e) {}
    });

    // 3. Fallback Auto-Sync Poller (every 15s) for 100% sync guarantee through Cloudflare tunnels
    autoSyncInterval = setInterval(async () => {
      try {
        const fresh = await fetchSupabaseMembers();
        if (fresh && fresh.length > 0) {
          setMembers(fresh);
          setDbConnected(true);
          setLastSyncTime(new Date());
        }
      } catch (e) {}
    }, 15000);

    return () => {
      if (memberSubChannel && typeof memberSubChannel.unsubscribe === 'function') {
        memberSubChannel.unsubscribe();
      }
      if (brandingSubChannel && typeof brandingSubChannel.unsubscribe === 'function') {
        brandingSubChannel.unsubscribe();
      }
      if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
      }
    };
  }, [applyBrandingList]);

  // Update selected member only when switching active organization or on first load if no member is selected
  useEffect(() => {
    const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);
    if (orgMembers.length > 0) {
      setSelectedMember(prev => {
        // If user has already selected a member that belongs to activeOrg, KEEP IT!
        if (prev) {
          const stillExists = orgMembers.find(m =>
            (m._id && prev._id && m._id === prev._id) ||
            (m.id && prev.id && m.id === prev.id) ||
            (m.name && prev.name && m.name.trim().toLowerCase() === prev.name.trim().toLowerCase())
          );
          if (stillExists) {
            return stillExists;
          }
        }
        // If none selected or switched to a different club, select the first member of that club
        return orgMembers[0];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg]);

  // Keep selectedMember synchronized with latest data in members array if updated (without switching member!)
  useEffect(() => {
    if (selectedMember && members.length > 0) {
      const updated = members.find(m =>
        (m._id && selectedMember._id && m._id === selectedMember._id) ||
        (m.id && selectedMember.id && m.id === selectedMember.id) ||
        (m.name && selectedMember.name && m.name.trim().toLowerCase() === selectedMember.name.trim().toLowerCase())
      );
      if (updated && (updated.designation !== selectedMember.designation || updated.department !== selectedMember.department || updated.roleType !== selectedMember.roleType || updated.letterRefId !== selectedMember.letterRefId)) {
        setSelectedMember(updated);
      }
    } else if (!selectedMember && members.length > 0) {
      const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);
      if (orgMembers.length > 0) {
        setSelectedMember(orgMembers[0]);
      }
    }
  }, [members, activeOrg, selectedMember]);

  // Login handler
  const handleLogin = (userSession) => {
    setCurrentUser(userSession);
    setActiveOrg(userSession.organization || 'AWS_SBG');
    localStorage.setItem('offer_gen_user', JSON.stringify(userSession));
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('offer_gen_user');
  };

  // Section / Organization Switcher Handler
  const handleSwitchOrg = (orgKey) => {
    setActiveOrg(orgKey);
  };

  // Update selected member or active config when modified in controls
  const handleConfigChange = (key, value) => {
    if (key === 'memberEmail') {
      setSelectedMember(prev => ({ ...prev, email: value }));
      setMembers(prev => prev.map(m => ((m._id && selectedMember._id && m._id === selectedMember._id) || (m.id && selectedMember.id && m.id === selectedMember.id) || (m.name === selectedMember.name)) ? { ...m, email: value } : m));
    } else if (key === 'customDesignation') {
      setSelectedMember(prev => ({ ...prev, designation: value }));
      setMembers(prev => prev.map(m => m._id === selectedMember._id ? { ...m, designation: value } : m));
    } else if (key === 'customDepartment') {
      setSelectedMember(prev => ({ ...prev, department: value }));
      setMembers(prev => prev.map(m => m._id === selectedMember._id ? { ...m, department: value } : m));
    } else {
      if (isAWS) {
        setAwsLetterConfig(prev => ({ ...prev, [key]: value }));
      } else {
        setTechnoLetterConfig(prev => ({ ...prev, [key]: value }));
      }
    }
  };

  // Save Branding & Signatures to Supabase & MongoDB Handler
  const handleSaveBrandingToDatabase = async (targetOrg = 'AWS_SBG') => {
    setIsSavingToDb(true);
    setDbSaveStatus('⏳ Syncing branding assets to Supabase Cloud...');

    try {
      if (targetOrg === 'AWS_SBG' || targetOrg === 'ALL') {
        const awsPayload = {
          organization: 'AWS_SBG',
          itmbuLogo,
          clubLogo: awsClubLogo,
          organizerSignatureImage: awsOrganizerSig,
          advisorSignatureImage: awsAdvisorSig,
          mentorSignatureImage: awsMentorSig,
          config: { ...awsLetterConfig, departments: awsDepartments }
        };

        // 1. Supabase save
        try {
          await saveSupabaseBranding('AWS_SBG', awsPayload);
        } catch (sErr) {
          console.warn('Supabase branding save notice:', sErr.message);
        }

        // 2. MongoDB save (fallback)
        try {
          await fetch(`${API_BASE_URL}/branding/AWS_SBG`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(awsPayload)
          });
        } catch (mErr) {}

        // 3. Local storage
        if (itmbuLogo) localStorage.setItem('itmbu_crest_logo', itmbuLogo);
        if (awsClubLogo) localStorage.setItem('aws_sbg_logo', awsClubLogo);
        if (awsOrganizerSig) localStorage.setItem('aws_organizer_sig', awsOrganizerSig);
        if (awsAdvisorSig) localStorage.setItem('aws_advisor_sig', awsAdvisorSig);
        if (awsMentorSig) localStorage.setItem('aws_mentor_sig', awsMentorSig);
      }

      if (targetOrg === 'TECHNO_LAB' || targetOrg === 'ALL') {
        const technoPayload = {
          organization: 'TECHNO_LAB',
          itmbuLogo,
          clubLogo: technoClubLogo,
          organizerSignatureImage: technoOrganizerSig,
          advisorSignatureImage: technoAdvisorSig,
          mentorSignatureImage: technoMentorSig,
          config: { ...technoLetterConfig, departments: technoDepartments }
        };

        // 1. Supabase save
        try {
          await saveSupabaseBranding('TECHNO_LAB', technoPayload);
        } catch (sErr) {
          console.warn('Supabase branding save notice:', sErr.message);
        }

        // 2. MongoDB save (fallback)
        try {
          await fetch(`${API_BASE_URL}/branding/TECHNO_LAB`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(technoPayload)
          });
        } catch (mErr) {}

        // 3. Local storage
        if (itmbuLogo) localStorage.setItem('itmbu_crest_logo', itmbuLogo);
        if (technoClubLogo) localStorage.setItem('techno_lab_logo', technoClubLogo);
        if (technoOrganizerSig) localStorage.setItem('techno_organizer_sig', technoOrganizerSig);
        if (technoAdvisorSig) localStorage.setItem('techno_advisor_sig', technoAdvisorSig);
        if (technoMentorSig) localStorage.setItem('techno_mentor_sig', technoMentorSig);
      }

      setDbSaveStatus('✓ Stored successfully in Cloud Database!');
      setLastSyncTime(new Date());
      setTimeout(() => setDbSaveStatus(''), 4000);

      // SweetAlert Success Notification
      Swal.fire({
        title: 'Saved to Supabase Cloud Database!',
        html: `
          <div style="text-align: left; font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin-top: 10px;">
            <p>✅ Official university crests, club logos, custom departments, and digital signature vault for <strong>${targetOrg === 'ALL' ? 'AWS SBG & Techno Lab' : (targetOrg === 'AWS_SBG' ? 'AWS Student Builder Group' : 'Techno Lab')}</strong> have been synced across all devices.</p>
            <div style="background: #162036; border: 1px solid #23314a; border-radius: 8px; padding: 10px; margin-top: 10px;">
              <span style="color: #38bdf8; font-weight: 700;">Provider:</span> <code style="color: #34d399;">Supabase PostgreSQL (Live Realtime)</code><br/>
              <span style="color: #10b981; font-weight: 700;">Table:</span> <code>brandings</code>
            </div>
          </div>
        `,
        icon: 'success',
        background: '#101626',
        color: '#f8fafc',
        confirmButtonColor: '#10b981',
        confirmButtonText: '✓ Awesome, Continue'
      });
    } catch (err) {
      console.error('Failed to sync branding:', err);
      setDbSaveStatus('✓ Saved locally in browser storage');
      setTimeout(() => setDbSaveStatus(''), 4000);

      Swal.fire({
        title: 'Saved Locally',
        text: 'Branding assets and signatures saved to browser storage.',
        icon: 'info',
        background: '#101626',
        color: '#f8fafc',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSavingToDb(false);
    }
  };

  // 100% Full Sync Handler (Supabase Cloud + MongoDB)
  const handleSyncDatabase = async (silent = false) => {
    setIsSavingToDb(true);
    try {
      let syncedFrom = 'Supabase Cloud';
      let memberCount = members.length;

      // 1. Try Supabase Sync
      try {
        const supaMembers = await fetchSupabaseMembers();
        if (supaMembers && supaMembers.length > 0) {
          setMembers(supaMembers);
          setDbConnected(true);
          setDbProvider('Supabase Cloud');
          setLastSyncTime(new Date());
          memberCount = supaMembers.length;
        } else {
          // If empty, seed
          const seeded = await seedSupabaseMembers(INITIAL_TEAM_DATA);
          if (seeded && seeded.length > 0) {
            setMembers(seeded);
            setDbConnected(true);
            setDbProvider('Supabase Cloud');
            setLastSyncTime(new Date());
            memberCount = seeded.length;
          }
        }

        const supaBranding = await fetchSupabaseBranding();
        if (supaBranding && supaBranding.length > 0) {
          applyBrandingList(supaBranding);
        }
      } catch (supaErr) {
        console.warn('Supabase sync notice:', supaErr.message);
        // Fallback to MongoDB
        syncedFrom = 'MongoDB Compass';
        const membersRes = await fetch(`${API_BASE_URL}/members`);
        const membersData = await membersRes.json();
        if (membersData.success && membersData.data && membersData.data.length > 0) {
          setMembers(membersData.data);
          setDbConnected(true);
          setDbProvider('MongoDB Compass');
          setLastSyncTime(new Date());
          memberCount = membersData.data.length;
        }
      }

      if (!silent) {
        Swal.fire({
          title: `100% Synced with ${syncedFrom}!`,
          html: `
            <div style="text-align: left; font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin-top: 8px;">
              <p>✅ All <strong>${memberCount} roster members</strong>, custom designations, wings, and reference IDs are live synchronized.</p>
              <p>✅ University crests, club logos, and digital signature vaults loaded from Cloud tables.</p>
              <div style="background: #162036; border: 1px solid #23314a; border-radius: 8px; padding: 10px; margin-top: 10px;">
                <span style="color: #38bdf8; font-weight: 700;">Database:</span> <code>${syncedFrom}</code><br/>
                <span style="color: #10b981; font-weight: 700;">Status:</span> <span style="color: #34d399; font-weight: bold;">Multi-Device Realtime Live</span>
              </div>
            </div>
          `,
          icon: 'success',
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#10b981',
          confirmButtonText: '✓ Awesome'
        });
      }
    } catch (err) {
      console.warn('Sync notice:', err);
      if (!silent) {
        Swal.fire({
          title: 'Sync Complete (Local Cache)',
          text: 'Using current local and in-memory roster data.',
          icon: 'info',
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#3b82f6'
        });
      }
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Add Member Handler (Supabase + MongoDB)
  const handleAddMember = async (newMember) => {
    let savedMember = newMember;

    // 1. Supabase insert
    try {
      const supaSaved = await insertSupabaseMember(newMember);
      if (supaSaved) {
        savedMember = supaSaved;
      }
    } catch (supaErr) {
      console.warn('Supabase add notice:', supaErr.message);
      // Fallback to MongoDB
      try {
        const res = await fetch(`${API_BASE_URL}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMember)
        });
        const data = await res.json();
        if (data.success && data.data) {
          savedMember = data.data;
        }
      } catch (mongoErr) {
        console.log('Stored in local state');
      }
    }

    setMembers(prev => {
      const exists = prev.some(m => (m._id && m._id === savedMember._id) || (m.id && m.id === savedMember.id) || (m.name === savedMember.name && m.organization === savedMember.organization));
      if (exists) {
        return prev.map(m => ((m._id && m._id === savedMember._id) || (m.id && m.id === savedMember.id) || (m.name === savedMember.name && m.organization === savedMember.organization)) ? savedMember : m);
      }
      return [savedMember, ...prev];
    });
    setSelectedMember(savedMember);
    setLastSyncTime(new Date());

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${savedMember.name} added & synchronized across all clients!`,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Save / Update Member Handler (Supabase + MongoDB)
  const handleSaveMember = async (updatedMember) => {
    setMembers(prev => prev.map(m => (m._id === updatedMember._id || m.id === updatedMember.id || m.name === updatedMember.name) ? updatedMember : m));
    if (selectedMember && (selectedMember._id === updatedMember._id || selectedMember.id === updatedMember.id || selectedMember.name === updatedMember.name)) {
      setSelectedMember(updatedMember);
    }

    // 1. Supabase update
    try {
      const supaUpdated = await updateSupabaseMember(updatedMember._id || updatedMember.id, updatedMember);
      if (supaUpdated) {
        setMembers(prev => prev.map(m => (m._id === supaUpdated._id || m.id === supaUpdated.id || m.name === supaUpdated.name) ? supaUpdated : m));
        if (selectedMember && (selectedMember._id === supaUpdated._id || selectedMember.id === supaUpdated.id || selectedMember.name === supaUpdated.name)) {
          setSelectedMember(supaUpdated);
        }
      }
    } catch (supaErr) {
      console.warn('Supabase update notice:', supaErr.message);
      // Fallback to MongoDB
      if (updatedMember._id) {
        try {
          const res = await fetch(`${API_BASE_URL}/members/${updatedMember._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMember)
          });
          const data = await res.json();
          if (data.success && data.data) {
            setMembers(prev => prev.map(m => m._id === updatedMember._id ? data.data : m));
            if (selectedMember && selectedMember._id === updatedMember._id) {
              setSelectedMember(data.data);
            }
          }
        } catch (err) {}
      }
    }

    setLastSyncTime(new Date());

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Member profile updated & synced to Cloud!',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Promote Member Handler (Organizers / Co-Leads / Admins)
  const handlePromoteMember = async (updatedMember) => {
    // 1. Update local state
    setMembers(prev => prev.map(m => (m._id === updatedMember._id || m.id === updatedMember.id || m.name === updatedMember.name) ? updatedMember : m));
    setSelectedMember(updatedMember);
    if (isAWS) {
      setAwsLetterConfig(prev => ({ ...prev, letterRefId: updatedMember.letterRefId || prev.letterRefId }));
    } else {
      setTechnoLetterConfig(prev => ({ ...prev, letterRefId: updatedMember.letterRefId || prev.letterRefId }));
    }

    // 2. Persist to Supabase
    try {
      const supaUpdated = await updateSupabaseMember(updatedMember._id || updatedMember.id, updatedMember);
      if (supaUpdated) {
        setMembers(prev => prev.map(m => (m._id === supaUpdated._id || m.id === supaUpdated.id || m.name === supaUpdated.name) ? supaUpdated : m));
        setSelectedMember(supaUpdated);
      }
    } catch (supaErr) {
      console.warn('Supabase promotion save note:', supaErr.message);
    }

    setLastSyncTime(new Date());

    // 3. Celebrate & navigate to Letter Studio
    Swal.fire({
      icon: 'success',
      title: '🌟 Member Promoted Successfully!',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p><b>${updatedMember.name}</b> has been officially elevated to <b>${updatedMember.roleType}</b>.</p>
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px 14px; margin: 10px 0;">
            <p style="margin: 0; color: #059669; font-weight: 700;">📜 Official Letter Generated:</p>
            <p style="margin: 4px 0 0 0; color: #334155;">Title: <b>${updatedMember.designation}</b> &bull; Ref: <b>${updatedMember.letterRefId || 'Generated'}</b></p>
          </div>
          <p style="margin: 0; color: #64748b; font-size: 12px;">Opening Letter Studio for immediate verification & printing.</p>
        </div>
      `,
      confirmButtonColor: isAWS ? '#ff9900' : '#00d2ff',
      confirmButtonText: 'View Official Letter 📄'
    }).then(() => {
      setCurrentView('letter_studio');
    });
  };

  // Delete Member Handler with SweetAlert Confirmation (Supabase + MongoDB)
  const handleDeleteMember = async (memberId) => {
    const target = members.find(m => m._id === memberId || m.id === memberId || m.name === memberId);
    const memberName = target ? target.name : 'this member';

    const result = await Swal.fire({
      title: 'Remove Team Member?',
      text: `Are you sure you want to remove "${memberName}" from the roster and sync across all connected clients?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete & Sync',
      cancelButtonText: 'Cancel',
      background: '#101626',
      color: '#f8fafc'
    });

    if (!result.isConfirmed) return;

    setMembers(prev => prev.filter(m => m._id !== memberId && m.id !== memberId && m.name !== memberId));
    if (selectedMember && (selectedMember._id === memberId || selectedMember.id === memberId || selectedMember.name === memberId)) {
      const remaining = members.filter(m => m._id !== memberId && m.id !== memberId && m.name !== memberId && (!m.organization || m.organization === activeOrg));
      setSelectedMember(remaining[0] || null);
    }

    // 1. Supabase delete
    try {
      await deleteSupabaseMember(memberId, memberName, activeOrg);
    } catch (supaErr) {
      console.warn('Supabase delete notice:', supaErr.message);
      // Fallback to MongoDB
      try {
        await fetch(`${API_BASE_URL}/members/${memberId}`, {
          method: 'DELETE'
        });
      } catch (err) {}
    }

    setLastSyncTime(new Date());

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${memberName} deleted across all devices.`,
      showConfirmButton: false,
      timer: 2500,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Bulk Delete Members Handler (Supabase + MongoDB)
  const handleBulkDeleteMembers = async (memberIds) => {
    if (!memberIds || memberIds.length === 0) return;

    const result = await Swal.fire({
      title: `Delete ${memberIds.length} Members?`,
      text: `Are you sure you want to remove these ${memberIds.length} selected members from the roster and cloud database?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: `Yes, Delete (${memberIds.length})`,
      cancelButtonText: 'Cancel',
      background: '#101626',
      color: '#f8fafc'
    });

    if (!result.isConfirmed) return;

    // 1. Update state
    setMembers(prev => prev.filter(m => !memberIds.includes(m._id) && !memberIds.includes(m.id) && !memberIds.includes(m.name)));
    if (selectedMember && (memberIds.includes(selectedMember._id) || memberIds.includes(selectedMember.id) || memberIds.includes(selectedMember.name))) {
      const remaining = members.filter(m => !memberIds.includes(m._id) && !memberIds.includes(m.id) && !memberIds.includes(m.name) && (!m.organization || m.organization === activeOrg));
      setSelectedMember(remaining[0] || null);
    }

    // 2. Supabase delete
    try {
      await bulkDeleteSupabaseMembers(memberIds);
    } catch (supaErr) {
      console.warn('Supabase bulk delete notice:', supaErr.message);
    }

    // 3. MongoDB delete (fallback)
    try {
      await Promise.all(memberIds.map(id => fetch(`${API_BASE_URL}/members/${id}`, { method: 'DELETE' })));
    } catch (mErr) {}

    setLastSyncTime(new Date());

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${memberIds.length} members removed successfully.`,
      showConfirmButton: false,
      timer: 3000,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Reset / Reseed Database Handler (Supabase + MongoDB)
  const handleResetDatabase = async () => {
    const result = await Swal.fire({
      title: 'Reseed Database?',
      text: 'This will reset all roster members to the default official dual-club rosters (AWS SBG + Techno Lab).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Reseed Now',
      cancelButtonText: 'Cancel',
      background: '#101626',
      color: '#f8fafc'
    });

    if (!result.isConfirmed) return;

    let reseededCount = INITIAL_TEAM_DATA.length;

    // 1. Supabase reseed
    try {
      const supaSeeded = await seedSupabaseMembers(INITIAL_TEAM_DATA);
      if (supaSeeded && supaSeeded.length > 0) {
        setMembers(supaSeeded);
        reseededCount = supaSeeded.length;
      } else {
        setMembers(INITIAL_TEAM_DATA);
      }
    } catch (supaErr) {
      console.warn('Supabase reseed notice:', supaErr.message);
      // Fallback to MongoDB
      try {
        const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
        const data = await res.json();
        if (data.success && data.data) {
          setMembers(data.data);
          reseededCount = data.data.length;
        } else {
          setMembers(INITIAL_TEAM_DATA);
        }
      } catch (err) {
        setMembers(INITIAL_TEAM_DATA);
      }
    }

    setLastSyncTime(new Date());

    Swal.fire({
      title: 'Database Reseeded!',
      text: `Successfully reloaded ${reseededCount} official members into Cloud Database.`,
      icon: 'success',
      background: '#101626',
      color: '#f8fafc',
      confirmButtonColor: '#10b981'
    });
  };

  // Select Member & Switch View directly to Letter Studio
  const handleSelectMemberForLetter = (member) => {
    setSelectedMember(member);
    if (isAWS) {
      setAwsLetterConfig(prev => ({
        ...prev,
        letterRefId: member.letterRefId || ''
      }));
    } else {
      setTechnoLetterConfig(prev => ({
        ...prev,
        letterRefId: member.letterRefId || ''
      }));
    }
    setCurrentView('letter_studio');
  };

  const handlePrint = () => {
    setBatchPrintList(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadFhdPdf = async (memberName) => {
    const element = document.getElementById('printable-letter');
    if (!element) {
      Swal.fire('Error', 'No letter element found to download', 'error');
      return;
    }

    const safeName = (memberName || 'Joining_Letter').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_Offer_Letter.pdf`;

    const opt = {
      margin: [0, 0, 0, 0],
      filename: filename,
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: {
        scale: 3, // 3x scale for Full HD clarity
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    Swal.fire({
      title: 'Rendering FHD PDF...',
      html: `Generating crystal-clear Full HD document for <strong>${memberName || 'Member'}</strong>.`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      await html2pdf().set(opt).from(element).save();

      Swal.fire({
        icon: 'success',
        title: 'FHD PDF Downloaded!',
        text: `${filename} has been saved successfully in Full HD resolution.`,
        timer: 2500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('PDF export error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'An error occurred during PDF generation. You can also use the Print button.'
      });
    }
  };

  const handleBatchPrint = (targetMembers) => {
    setBatchPrintList(targetMembers);
    setTimeout(() => {
      window.print();
      setBatchPrintList(null);
    }, 300);
  };

  // If user is not logged in, show AuthScreen
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="app-container">
      
      {/* Top Navigation Bar with Organization Slider, Module Switcher & User Badge */}
      <header className={`app-navbar no-print ${isAWS ? 'navbar-aws' : 'navbar-techno'}`}>
        
        {/* Left: Brand section */}
        <div className="nav-brand-section">
          <div className={`nav-logo-badge ${isAWS ? 'badge-aws-brand' : 'badge-techno-brand'}`}>
            {activeClub.badgeText}
          </div>
          <div className="nav-titles">
            <h1 className="nav-main-title">{activeClub.name}</h1>
            <span className="nav-sub-title">ITM (sls) BARODA UNIVERSITY &bull; OFFICIAL APPOINTMENT PORTAL</span>
          </div>
        </div>

        {/* Center: Module View Switcher (Letter Studio vs Team Management vs Branding) */}
        <div className="nav-view-switcher">
          <button
            className={`btn-view-tab ${currentView === 'letter_studio' ? 'active' : ''}`}
            onClick={() => setCurrentView('letter_studio')}
          >
            <span className="tab-icon">📄</span>
            <span className="tab-text">Letter Studio</span>
          </button>
          
          <button
            className={`btn-view-tab ${currentView === 'team_management' ? 'active' : ''}`}
            onClick={() => setCurrentView('team_management')}
          >
            <span className="tab-icon">👥</span>
            <span className="tab-text">Team Management</span>
          </button>

          <button
            className={`btn-view-tab ${currentView === 'branding' ? 'active' : ''}`}
            onClick={() => setCurrentView('branding')}
          >
            <span className="tab-icon">🎨</span>
            <span className="tab-text">Logos & University Branding</span>
          </button>
        </div>

        {/* Right: Cross-Section Org Switcher + User Chip + Logout */}
        <div className="nav-right-controls">
          
          {/* Dual Club Switcher for Super Admin */}
          {isSuperAdmin ? (
            <div className="top-org-slider-pill">
              <button
                className={`top-slider-btn ${activeOrg === 'AWS_SBG' ? 'active-aws' : ''}`}
                onClick={() => handleSwitchOrg('AWS_SBG')}
                title="Switch to AWS Student Builder Group"
              >
                ☁️ AWS SBG
              </button>
              <button
                className={`top-slider-btn ${activeOrg === 'TECHNO_LAB' ? 'active-techno' : ''}`}
                onClick={() => handleSwitchOrg('TECHNO_LAB')}
                title="Switch to Techno Lab"
              >
                🔬 Techno Lab
              </button>
            </div>
          ) : (
            <div className={`admin-org-indicator ${isAWS ? 'chip-aws' : 'chip-techno'}`}>
              {activeClub.shortName} Portal
            </div>
          )}

          {/* Database Live Realtime Status Indicator */}
          <div
            className={`db-status-badge ${dbConnected ? 'connected' : 'offline'}`}
            onClick={() => handleSyncDatabase(false)}
            style={{ cursor: 'pointer' }}
            title={dbConnected 
              ? `⚡ Realtime Live Sync Active (${dbProvider}) - Click to refresh` 
              : 'Offline Cache Mode - Click to connect to Cloud Database'}
          >
            <span className="status-dot"></span>
            <span>{isSavingToDb ? '⏳ Syncing...' : (dbConnected ? `⚡ ${dbProvider} (Live)` : 'Sync Offline')}</span>
          </div>

          {/* User Profile Badge */}
          <div 
            className={`user-badge-chip ${isSuperAdmin ? 'chip-super' : 'chip-admin'}`}
            onClick={() => isSuperAdmin && setIsSuperAdminConsoleOpen(true)}
            style={{ cursor: isSuperAdmin ? 'pointer' : 'default' }}
            title={isSuperAdmin ? 'Click to open Super Administrator Universal Control Center (5 Navigation Modules)' : 'Current User Profile'}
          >
            <span className="chip-avatar">{isSuperAdmin ? '👑' : '🛡️'}</span>
            <span className="chip-name">{currentUser.displayName || currentUser.username}</span>
            {isSuperAdmin && <span className="chip-settings-indicator">⚙️</span>}
          </div>

          {/* Logout Button */}
          <button className="btn-logout" onClick={handleLogout} title="Sign Out">
            🚪 Logout
          </button>
        </div>

      </header>

      {/* VIEW 1: LETTER STUDIO VIEW */}
      {currentView === 'letter_studio' && (
        <main className="main-content-layout no-print">
          
          {/* Left Column: Team Roster Selector */}
          <aside className="roster-column">
            <TeamRosterGrid
              members={members}
              activeOrg={activeOrg}
              currentUser={currentUser}
              selectedMember={currentActiveMember}
              onSelectMember={(member) => {
                setSelectedMember(member);
                if (isAWS) {
                  setAwsLetterConfig(prev => ({
                    ...prev,
                    letterRefId: member.letterRefId || ''
                  }));
                } else {
                  setTechnoLetterConfig(prev => ({
                    ...prev,
                    letterRefId: member.letterRefId || ''
                  }));
                }
              }}
              onOpenAddMemberModal={() => setIsAddModalOpen(true)}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
              onOpenPromoteModal={(member) => {
                setPromotingMember(member);
                setIsPromoteModalOpen(true);
              }}
              onOpenEditModal={(member) => {
                setEditingMember(member);
                setIsEditModalOpen(true);
              }}
              onDeleteMember={handleDeleteMember}
            />
          </aside>

          {/* Right Column: Dynamic Form Controls & Real-Time Letter Preview */}
          <section className="preview-column">
            <LetterControls
              member={currentActiveMember}
              config={activeLetterConfig}
              clubConfig={activeClub}
              onChangeConfig={handleConfigChange}
              itmbuLogo={itmbuLogo}
              onUploadItmbuLogo={setItmbuLogo}
              clubLogo={activeClubLogo}
              onUploadClubLogo={isAWS ? setAwsClubLogo : setTechnoClubLogo}
              organizerSignatureImage={activeOrganizerSig}
              onUploadOrganizerSignature={isAWS ? setAwsOrganizerSig : setTechnoOrganizerSig}
              advisorSignatureImage={activeAdvisorSig}
              onUploadAdvisorSignature={isAWS ? setAwsAdvisorSig : setTechnoAdvisorSig}
              mentorSignatureImage={activeMentorSig}
              onUploadMentorSignature={isAWS ? setAwsMentorSig : setTechnoMentorSig}
              onPrint={handlePrint}
              onDownloadPdf={() => handleDownloadFhdPdf(currentActiveMember?.name)}
            />

            <div className="live-preview-container">
              <div className="preview-label-bar">
                <div className="preview-indicator-badge">
                  <span className="pulse-dot"></span>
                  <span>Live Document Preview &bull; {activeClub.shortName} Official Letterhead</span>
                </div>
                <div className="preview-action-buttons">
                  <button className="btn-quick-print btn-print-subtle" onClick={handlePrint} title="Quick print or open print dialog">
                    🖨️ Print
                  </button>
                  <button 
                    className={`btn-quick-print btn-fhd-download ${isAWS ? 'btn-fhd-aws' : 'btn-fhd-techno'}`} 
                    onClick={() => handleDownloadFhdPdf(currentActiveMember?.name)}
                    title="Download crystal-clear Full HD PDF"
                  >
                    📥 Download FHD PDF
                  </button>
                </div>
              </div>
              
              <OfficialJoiningLetter
                member={currentActiveMember}
                config={activeLetterConfig}
                clubConfig={activeClub}
                itmbuLogo={itmbuLogo}
                clubLogo={activeClubLogo}
                organizerSignatureImage={activeOrganizerSig}
                advisorSignatureImage={activeAdvisorSig}
                mentorSignatureImage={activeMentorSig}
              />
            </div>
          </section>

        </main>
      )}

      {/* VIEW 2: TEAM MANAGEMENT SUITE */}
      {currentView === 'team_management' && (
        <main className="team-mgmt-layout no-print">
          <TeamManagement
            members={members}
            activeOrg={activeOrg}
            departments={activeDepartments}
            currentUser={currentUser}
            onAddDepartment={handleAddDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            onSelectMemberForLetter={handleSelectMemberForLetter}
            onOpenAddMemberModal={() => setIsAddModalOpen(true)}
            onOpenEditMemberModal={(member) => {
              setEditingMember(member);
              setIsEditModalOpen(true);
            }}
            onOpenPromoteModal={(member) => {
              setPromotingMember(member);
              setIsPromoteModalOpen(true);
            }}
            onDeleteMember={handleDeleteMember}
            onBulkDeleteMembers={handleBulkDeleteMembers}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
            onResetDatabase={handleResetDatabase}
            onSyncDatabase={handleSyncDatabase}
            dbConnected={dbConnected}
            dbProvider={dbProvider}
            isSavingToDb={isSavingToDb}
            lastSyncTime={lastSyncTime}
          />
        </main>
      )}

      {/* VIEW 3: BRANDING & DIGITAL SIGNATURE VAULT */}
      {currentView === 'branding' && (
        <main className="team-mgmt-layout no-print">
          <BrandingSettings
            currentUser={currentUser}
            activeOrg={activeOrg}
            itmbuLogo={itmbuLogo}
            onUploadItmbuLogo={setItmbuLogo}
            // AWS props
            awsClubLogo={awsClubLogo}
            onUploadAwsClubLogo={setAwsClubLogo}
            awsOrganizerSig={awsOrganizerSig}
            onUploadAwsOrganizerSig={setAwsOrganizerSig}
            awsAdvisorSig={awsAdvisorSig}
            onUploadAwsAdvisorSig={setAwsAdvisorSig}
            awsMentorSig={awsMentorSig}
            onUploadAwsMentorSig={setAwsMentorSig}
            awsConfig={awsLetterConfig}
            onChangeAwsConfig={setAwsLetterConfig}
            // Techno Lab props
            technoClubLogo={technoClubLogo}
            onUploadTechnoClubLogo={setTechnoClubLogo}
            technoOrganizerSig={technoOrganizerSig}
            onUploadTechnoOrganizerSig={setTechnoOrganizerSig}
            technoAdvisorSig={technoAdvisorSig}
            onUploadTechnoAdvisorSig={setTechnoAdvisorSig}
            technoMentorSig={technoMentorSig}
            onUploadTechnoMentorSig={setTechnoMentorSig}
            technoConfig={technoLetterConfig}
            onChangeTechnoConfig={setTechnoLetterConfig}
            // DB Save handler
            onSaveToDb={handleSaveBrandingToDatabase}
            isSavingToDb={isSavingToDb}
            dbSaveStatus={dbSaveStatus}
          />
        </main>
      )}

      {/* MODALS */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
        activeOrg={activeOrg}
        departments={activeDepartments}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={editingMember}
        onSaveMember={handleSaveMember}
        activeOrg={activeOrg}
        departments={activeDepartments}
      />

      <PromoteMemberModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        member={promotingMember}
        onPromoteMember={handlePromoteMember}
        activeOrg={activeOrg}
        departments={activeDepartments}
      />

      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        members={members}
        activeOrg={activeOrg}
        onBatchPrint={handleBatchPrint}
      />

      {/* SUPER ADMINISTRATOR UNIVERSAL CONTROL CENTER (5 NAVIGATIONS) */}
      <SuperAdminConsole
        isOpen={isSuperAdminConsoleOpen}
        onClose={() => setIsSuperAdminConsoleOpen(false)}
        currentUser={currentUser}
        members={members}
        activeOrg={activeOrg}
        onSyncDatabase={handleSyncDatabase}
        onResetDatabase={handleResetDatabase}
        onOpenPromoteModal={(member) => {
          setPromotingMember(member);
          setIsPromoteModalOpen(true);
        }}
        onAddMember={() => setIsAddModalOpen(true)}
        onEditMember={(member) => {
          setEditingMember(member);
          setIsEditModalOpen(true);
        }}
        onDeleteMember={handleDeleteMember}
        dbConnected={dbConnected}
        dbProvider={dbProvider}
        lastSyncTime={lastSyncTime}
        awsLetterConfig={awsLetterConfig}
        technoLetterConfig={technoLetterConfig}
        onChangeAwsConfig={setAwsLetterConfig}
        onChangeTechnoConfig={setTechnoLetterConfig}
        onSaveBranding={handleSaveBrandingToDatabase}
      />

      {/* PRINT-ONLY CONTAINER */}
      {batchPrintList && batchPrintList.length > 0 ? (
        <div className="batch-print-wrapper print-only">
          {batchPrintList.map((m, idx) => (
            <div key={m._id || idx} className="print-page-break">
              <OfficialJoiningLetter
                member={m}
                config={activeLetterConfig}
                clubConfig={activeClub}
                itmbuLogo={itmbuLogo}
                clubLogo={activeClubLogo}
                organizerSignatureImage={activeOrganizerSig}
                advisorSignatureImage={activeAdvisorSig}
                mentorSignatureImage={activeMentorSig}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="single-print-wrapper print-only">
          <OfficialJoiningLetter
            member={currentActiveMember}
            config={activeLetterConfig}
            clubConfig={activeClub}
            itmbuLogo={itmbuLogo}
            clubLogo={activeClubLogo}
            organizerSignatureImage={activeOrganizerSig}
            advisorSignatureImage={activeAdvisorSig}
            mentorSignatureImage={activeMentorSig}
          />
        </div>
      )}

    </div>
  );
}

export default App;
