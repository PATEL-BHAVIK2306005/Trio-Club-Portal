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
  subscribeToSupabaseBranding,
  sendOfferLetterEmailService
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

  // Chapter Visibility Matrix (Super Admin controlled, synced with localStorage)
  const [visibleChapters, setVisibleChapters] = useState(() => {
    try {
      const saved = localStorage.getItem('visible_chapters');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { AWS_SBG: true, TECHNO_LAB: true, ...parsed };
        if (merged.GDGOC === undefined) {
          merged.GDGOC = true;
        }
        return merged;
      }
    } catch (e) {}
    return { AWS_SBG: true, TECHNO_LAB: true, GDGOC: true };
  });

  // Active Organization / Section: 'AWS_SBG' | 'TECHNO_LAB' | 'GDGOC'
  const [activeOrg, setActiveOrg] = useState(() => {
    const saved = localStorage.getItem('offer_gen_user');
    if (saved) {
      const u = JSON.parse(saved);
      return u.organization || 'AWS_SBG';
    }
    return 'AWS_SBG';
  });

  // Data & Member State (Loaded instantly from localStorage with 0ms lag)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('offer_gen_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_TEAM_DATA;
  });

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

  // GDGoC ITMBU Branding & Signatures State
  const [gdgocClubLogo, setGdgocClubLogo] = useState(() => localStorage.getItem('gdgoc_club_logo') || null);
  const [gdgocOrganizerSig, setGdgocOrganizerSig] = useState(() => localStorage.getItem('gdgoc_organizer_sig') || null);
  const [gdgocAdvisorSig, setGdgocAdvisorSig] = useState(() => localStorage.getItem('gdgoc_advisor_sig') || null);
  const [gdgocMentorSig, setGdgocMentorSig] = useState(() => localStorage.getItem('gdgoc_mentor_sig') || null);

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

  const [gdgocLetterConfig, setGdgocLetterConfig] = useState(() => {
    const club = CLUB_CONFIGS.GDGOC || { email: 'gdgoc.itmbu@gmail.com', subtitle: 'Google Developer Groups on Campus • ITM (sls) Baroda University Chapter' };
    return {
      issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      tenure: 'Academic Year 2026 – 2027',
      letterRefId: '',
      contactEmail: club.email,
      subtitle: club.subtitle || 'Google Developer Groups on Campus • ITM (sls) Baroda University Chapter',
      organizerName: club.organizer?.name || 'Harshil Vaghela',
      organizerTitle: club.organizer?.title || 'GDGoC Campus Lead / Organizer',
      organizerOrg: club.organizer?.org || 'ITM (sls) Baroda University',
      advisorName: club.advisor?.name || 'Prof. Bhumika Patel',
      advisorTitle: club.advisor?.title || 'Faculty Advisor & Mentor',
      advisorOrg: club.advisor?.org || 'CSE & IT Department',
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

  const [gdgocDepartments, setGdgocDepartments] = useState(() => {
    const saved = localStorage.getItem('gdgoc_departments');
    return saved ? JSON.parse(saved) : (CLUB_CONFIGS.GDGOC?.departments || []);
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
  const isTechno = activeOrg === 'TECHNO_LAB';

  const activeClubLogo = isAWS ? awsClubLogo : (isTechno ? technoClubLogo : gdgocClubLogo);
  const activeOrganizerSig = isAWS ? awsOrganizerSig : (isTechno ? technoOrganizerSig : gdgocOrganizerSig);
  const activeAdvisorSig = isAWS ? awsAdvisorSig : (isTechno ? technoAdvisorSig : gdgocAdvisorSig);
  const activeMentorSig = isAWS ? awsMentorSig : (isTechno ? technoMentorSig : gdgocMentorSig);
  const activeLetterConfig = isAWS ? awsLetterConfig : (isTechno ? technoLetterConfig : gdgocLetterConfig);
  const activeDepartments = isAWS ? awsDepartments : (isTechno ? technoDepartments : gdgocDepartments);

  // Toggle Chapter Visibility (Super Admin)
  const handleToggleChapterVisibility = (orgKey) => {
    const nextVal = !visibleChapters[orgKey];
    const newVisible = { ...visibleChapters, [orgKey]: nextVal };
    const activeCount = Object.values(newVisible).filter(Boolean).length;
    if (activeCount < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Minimum 1 Chapter Required',
        text: 'At least 1 official chapter must remain visible in the portal!',
        background: '#101626',
        color: '#f8fafc',
        confirmButtonColor: '#ff9900'
      });
      return;
    }
    setVisibleChapters(newVisible);
    localStorage.setItem('visible_chapters', JSON.stringify(newVisible));
    if (!nextVal && activeOrg === orgKey) {
      const remainingKey = Object.keys(newVisible).find(k => newVisible[k]);
      if (remainingKey) {
        handleSwitchOrg(remainingKey);
      }
    }
  };

  // Smart Merge Helper: Preserves local additions and merges with cloud data
  const mergeMembers = useCallback((cloudMembers, currentMembers) => {
    if (!Array.isArray(cloudMembers) || cloudMembers.length === 0) return currentMembers || INITIAL_TEAM_DATA;
    
    const merged = [...cloudMembers];
    (currentMembers || []).forEach(localM => {
      const localKey = String(localM._id || localM.id || '');
      const isLocalOrTemp = localKey.includes('custom') || localKey.includes('temp') || localKey.includes('local');
      const alreadyInCloud = cloudMembers.some(cm => cm.name?.toLowerCase().trim() === localM.name?.toLowerCase().trim() && cm.organization === localM.organization);
      if (isLocalOrTemp && !alreadyInCloud) {
        merged.unshift(localM);
      }
    });
    return merged;
  }, []);

  // Sync members to localStorage on any state change
  useEffect(() => {
    if (members && members.length > 0) {
      localStorage.setItem('offer_gen_members', JSON.stringify(members));
    }
  }, [members]);

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
      } else if (item.organization === 'GDGOC') {
        const cLogo = item.club_logo || item.clubLogo;
        const orgSig = item.organizer_signature || item.organizerSignatureImage;
        const advSig = item.advisor_signature || item.advisorSignatureImage;
        const menSig = item.mentor_signature || item.mentorSignatureImage;
        if (cLogo) { setGdgocClubLogo(cLogo); localStorage.setItem('gdgoc_club_logo', cLogo); }
        if (orgSig) { setGdgocOrganizerSig(orgSig); localStorage.setItem('gdgoc_organizer_sig', orgSig); }
        if (advSig) { setGdgocAdvisorSig(advSig); localStorage.setItem('gdgoc_advisor_sig', advSig); }
        if (menSig) { setGdgocMentorSig(menSig); localStorage.setItem('gdgoc_mentor_sig', menSig); }
        if (item.config) {
          setGdgocLetterConfig(prev => ({ ...prev, ...item.config }));
          if (item.config.departments && Array.isArray(item.config.departments)) {
            setGdgocDepartments(item.config.departments);
            localStorage.setItem('gdgoc_departments', JSON.stringify(item.config.departments));
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
    } else if (orgKey === 'TECHNO_LAB') {
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
    } else {
      nextDepts = [...gdgocDepartments, deptName];
      setGdgocDepartments(nextDepts);
      localStorage.setItem('gdgoc_departments', JSON.stringify(nextDepts));
      try {
        await saveSupabaseBranding('GDGOC', {
          itmbuLogo,
          clubLogo: gdgocClubLogo,
          organizerSignatureImage: gdgocOrganizerSig,
          advisorSignatureImage: gdgocAdvisorSig,
          mentorSignatureImage: gdgocMentorSig,
          config: { ...gdgocLetterConfig, departments: nextDepts }
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
    } else if (orgKey === 'TECHNO_LAB') {
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
    } else {
      nextDepts = gdgocDepartments.filter(d => d !== deptName);
      setGdgocDepartments(nextDepts);
      localStorage.setItem('gdgoc_departments', JSON.stringify(nextDepts));
      try {
        await saveSupabaseBranding('GDGOC', {
          itmbuLogo,
          clubLogo: gdgocClubLogo,
          organizerSignatureImage: gdgocOrganizerSig,
          advisorSignatureImage: gdgocAdvisorSig,
          mentorSignatureImage: gdgocMentorSig,
          config: { ...gdgocLetterConfig, departments: nextDepts }
        });
      } catch (e) {}
    }

    // Reassign affected members in local state
    setMembers(prev => {
      const updated = prev.map(m => {
        if ((!m.organization || m.organization === orgKey) && m.department === deptName) {
          return { ...m, department: 'General / Unassigned' };
        }
        return m;
      });
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });
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
          setMembers(prev => {
            const merged = mergeMembers(supaMembers, prev);
            localStorage.setItem('offer_gen_members', JSON.stringify(merged));
            return merged;
          });
          setDbConnected(true);
          setDbProvider('Supabase Cloud');
          setLastSyncTime(new Date());
          loadedFromSupabase = true;
        } else {
          // Table exists in Supabase but empty -> Auto-seed default roster
          try {
            const seeded = await seedSupabaseMembers(INITIAL_TEAM_DATA);
            if (seeded && seeded.length > 0) {
              setMembers(prev => {
                const merged = mergeMembers(seeded, prev);
                localStorage.setItem('offer_gen_members', JSON.stringify(merged));
                return merged;
              });
              setDbConnected(true);
              setDbProvider('Supabase Cloud');
              setLastSyncTime(new Date());
              loadedFromSupabase = true;
            }
          } catch (seedErr) {}
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
            setMembers(prev => {
              const merged = mergeMembers(data.data, prev);
              localStorage.setItem('offer_gen_members', JSON.stringify(merged));
              return merged;
            });
            setDbConnected(true);
            setDbProvider('MongoDB Compass');
            setLastSyncTime(new Date());
          }
        } catch (mongoErr) {}

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

    // 2. Realtime WebSocket Subscription
    memberSubChannel = subscribeToSupabaseMembers((change) => {
      setLastSyncTime(new Date());
      setDbConnected(true);

      if (change.eventType === 'INSERT' && change.newRecord) {
        const item = change.newRecord;
        setMembers(prev => {
          const exists = prev.some(m => (m._id && m._id === item._id) || (m.id && m.id === item.id) || (m.name === item.name && m.organization === item.organization));
          let nextList;
          if (exists) {
            nextList = prev.map(m => ((m._id && m._id === item._id) || (m.id && m.id === item.id) || (m.name === item.name && m.organization === item.organization)) ? item : m);
          } else {
            nextList = [item, ...prev];
          }
          localStorage.setItem('offer_gen_members', JSON.stringify(nextList));
          return nextList;
        });
      } else if (change.eventType === 'UPDATE' && change.newRecord) {
        const item = change.newRecord;
        setMembers(prev => {
          const nextList = prev.map(m => ((m._id && m._id === item._id) || (m.id && m.id === item.id) || (m.name === item.name && m.organization === item.organization)) ? item : m);
          localStorage.setItem('offer_gen_members', JSON.stringify(nextList));
          return nextList;
        });
        setSelectedMember(prev => (prev && ((prev._id && prev._id === item._id) || (prev.id && prev.id === item.id) || prev.name === item.name)) ? item : prev);
      } else if (change.eventType === 'DELETE') {
        const oldId = change.raw?.old?.id?.toString();
        if (oldId) {
          setMembers(prev => {
            const nextList = prev.filter(m => m._id !== oldId && m.id !== oldId);
            localStorage.setItem('offer_gen_members', JSON.stringify(nextList));
            return nextList;
          });
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

    // 3. Fallback Auto-Sync Poller (every 15s) with Smart Merge
    autoSyncInterval = setInterval(async () => {
      try {
        const fresh = await fetchSupabaseMembers();
        if (fresh && fresh.length > 0) {
          setMembers(prev => {
            const merged = mergeMembers(fresh, prev);
            localStorage.setItem('offer_gen_members', JSON.stringify(merged));
            return merged;
          });
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
  }, [applyBrandingList, mergeMembers]);

  // Update selected member when switching active chapter
  useEffect(() => {
    const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);
    if (orgMembers.length > 0) {
      setSelectedMember(prev => {
        if (prev) {
          const stillExists = orgMembers.find(m =>
            (m._id && prev._id && m._id === prev._id) ||
            (m.id && prev.id && m.id === prev.id) ||
            (m.name && prev.name && m.name.trim().toLowerCase() === prev.name.trim().toLowerCase())
          );
          if (stillExists) return stillExists;
        }
        return orgMembers[0];
      });
    }
  }, [activeOrg, members]);

  // Keep selectedMember synchronized with latest data
  useEffect(() => {
    if (selectedMember && members.length > 0) {
      const updated = members.find(m =>
        (m._id && selectedMember._id && m._id === selectedMember._id) ||
        (m.id && selectedMember.id && m.id === selectedMember.id) ||
        (m.name && selectedMember.name && m.name.trim().toLowerCase() === selectedMember.name.trim().toLowerCase())
      );
      if (updated && (
        updated.roleType !== selectedMember.roleType ||
        updated.designation !== selectedMember.designation ||
        updated.department !== selectedMember.department ||
        updated.letterRefId !== selectedMember.letterRefId ||
        updated.avatar !== selectedMember.avatar
      )) {
        setSelectedMember(updated);
      }
    }
  }, [members, selectedMember]);

  const handleLogin = (userSession) => {
    setCurrentUser(userSession);
    setActiveOrg(userSession.organization || 'AWS_SBG');
    localStorage.setItem('offer_gen_user', JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('offer_gen_user');
  };

  const handleSwitchOrg = (newOrg) => {
    setActiveOrg(newOrg);
    if (currentUser) {
      const updatedUser = { ...currentUser, organization: newOrg };
      setCurrentUser(updatedUser);
      localStorage.setItem('offer_gen_user', JSON.stringify(updatedUser));
    }
  };

  // Save Letterhead Config handler
  const handleSaveLetterConfig = (orgKey = activeOrg) => {
    const configToSave = orgKey === 'AWS_SBG' ? awsLetterConfig : (orgKey === 'TECHNO_LAB' ? technoLetterConfig : gdgocLetterConfig);
    localStorage.setItem(`letter_config_${orgKey.toLowerCase()}`, JSON.stringify(configToSave));
    handleSaveBrandingToDatabase(orgKey);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${CLUB_CONFIGS[orgKey]?.shortName || orgKey} Letterhead configuration saved!`,
      timer: 2500,
      showConfirmButton: false,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Save Branding Assets and Signatures to Database
  const handleSaveBrandingToDatabase = async (targetOrg = activeOrg) => {
    setIsSavingToDb(true);
    setDbSaveStatus('⏳ Syncing to Cloud Database...');

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

        try { await saveSupabaseBranding('AWS_SBG', awsPayload); } catch (e) {}
        try {
          await fetch(`${API_BASE_URL}/branding/AWS_SBG`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(awsPayload)
          });
        } catch (e) {}

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

        try { await saveSupabaseBranding('TECHNO_LAB', technoPayload); } catch (e) {}
        try {
          await fetch(`${API_BASE_URL}/branding/TECHNO_LAB`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(technoPayload)
          });
        } catch (e) {}

        if (itmbuLogo) localStorage.setItem('itmbu_crest_logo', itmbuLogo);
        if (technoClubLogo) localStorage.setItem('techno_lab_logo', technoClubLogo);
        if (technoOrganizerSig) localStorage.setItem('techno_organizer_sig', technoOrganizerSig);
        if (technoAdvisorSig) localStorage.setItem('techno_advisor_sig', technoAdvisorSig);
        if (technoMentorSig) localStorage.setItem('techno_mentor_sig', technoMentorSig);
      }

      if (targetOrg === 'GDGOC' || targetOrg === 'ALL') {
        const gdgocPayload = {
          organization: 'GDGOC',
          itmbuLogo,
          clubLogo: gdgocClubLogo,
          organizerSignatureImage: gdgocOrganizerSig,
          advisorSignatureImage: gdgocAdvisorSig,
          mentorSignatureImage: gdgocMentorSig,
          config: { ...gdgocLetterConfig, departments: gdgocDepartments }
        };

        try { await saveSupabaseBranding('GDGOC', gdgocPayload); } catch (e) {}
        try {
          await fetch(`${API_BASE_URL}/branding/GDGOC`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gdgocPayload)
          });
        } catch (e) {}

        if (itmbuLogo) localStorage.setItem('itmbu_crest_logo', itmbuLogo);
        if (gdgocClubLogo) localStorage.setItem('gdgoc_club_logo', gdgocClubLogo);
        if (gdgocOrganizerSig) localStorage.setItem('gdgoc_organizer_sig', gdgocOrganizerSig);
        if (gdgocAdvisorSig) localStorage.setItem('gdgoc_advisor_sig', gdgocAdvisorSig);
        if (gdgocMentorSig) localStorage.setItem('gdgoc_mentor_sig', gdgocMentorSig);
      }

      setDbSaveStatus('✓ Stored successfully in Cloud Database!');
      setLastSyncTime(new Date());
      setTimeout(() => setDbSaveStatus(''), 4000);

      Swal.fire({
        title: 'Saved to Cloud Database!',
        text: `Official crests, logos, and letterhead configurations for ${targetOrg} have been synced.`,
        icon: 'success',
        background: '#101626',
        color: '#f8fafc',
        confirmButtonColor: '#10b981'
      });
    } catch (err) {
      console.error('Failed to sync branding:', err);
      setDbSaveStatus('✓ Saved locally in browser storage');
      setTimeout(() => setDbSaveStatus(''), 4000);
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Full Database Sync Handler
  const handleSyncDatabase = async (silent = false) => {
    setIsSavingToDb(true);
    try {
      let memberCount = members.length;
      try {
        const supaMembers = await fetchSupabaseMembers();
        if (supaMembers && supaMembers.length > 0) {
          setMembers(prev => {
            const merged = mergeMembers(supaMembers, prev);
            localStorage.setItem('offer_gen_members', JSON.stringify(merged));
            return merged;
          });
          setDbConnected(true);
          setDbProvider('Supabase Cloud');
          setLastSyncTime(new Date());
          memberCount = supaMembers.length;
        }

        const supaBranding = await fetchSupabaseBranding();
        if (supaBranding && supaBranding.length > 0) {
          applyBrandingList(supaBranding);
        }
      } catch (supaErr) {}

      if (!silent) {
        Swal.fire({
          title: '100% Synced with Cloud Database!',
          text: `All ${memberCount} roster members and letter configurations are up-to-date.`,
          icon: 'success',
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#10b981'
        });
      }
    } catch (err) {
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Add Member Handler (Instant 0ms update + Background Cloud Sync)
  const handleAddMember = async (newMember) => {
    const memberWithOrg = {
      ...newMember,
      organization: newMember.organization || activeOrg,
      department: newMember.department || (activeClub.departments?.[0] || 'Technical Team')
    };
    const tempId = `custom-${Date.now()}`;
    const localMember = { ...memberWithOrg, _id: memberWithOrg._id || tempId, id: memberWithOrg.id || tempId };
    
    // 1. Instant local persistence & UI update (0ms delay)
    setMembers(prev => {
      const updated = [localMember, ...prev];
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });
    setSelectedMember(localMember);

    // 2. Persist to Supabase in background
    try {
      const supaSaved = await insertSupabaseMember(memberWithOrg);
      if (supaSaved && supaSaved._id) {
        setMembers(prev => {
          const updated = prev.map(m => (m._id === localMember._id || m.id === localMember.id) ? supaSaved : m);
          localStorage.setItem('offer_gen_members', JSON.stringify(updated));
          return updated;
        });
        setSelectedMember(supaSaved);
      }
    } catch (e) {
      console.warn('Supabase sync note:', e.message);
    }

    setLastSyncTime(new Date());
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `✨ ${newMember.name} added to ${activeClub.shortName} roster!`,
      showConfirmButton: false,
      timer: 2500,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Delete Member Handler
  const handleDeleteMember = async (memberId) => {
    const memberToDelete = members.find(m => m._id === memberId || m.id === memberId);
    const memberName = memberToDelete ? memberToDelete.name : 'Team Member';

    const result = await Swal.fire({
      title: `Remove ${memberName}?`,
      text: 'Are you sure you want to remove this member from the active roster?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Remove Member',
      background: '#101626',
      color: '#f8fafc'
    });

    if (!result.isConfirmed) return;

    setMembers(prev => {
      const updated = prev.filter(m => m._id !== memberId && m.id !== memberId);
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });
    if (selectedMember && (selectedMember._id === memberId || selectedMember.id === memberId)) {
      const remaining = members.filter(m => m._id !== memberId && m.id !== memberId && (!m.organization || m.organization === activeOrg));
      setSelectedMember(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      await deleteSupabaseMember(memberId, memberToDelete?.name, memberToDelete?.organization);
    } catch (e) {}

    setLastSyncTime(new Date());
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${memberName} removed from roster`,
      showConfirmButton: false,
      timer: 2500,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Bulk Delete Handler
  const handleBulkDeleteMembers = async (memberIds) => {
    if (!memberIds || memberIds.length === 0) return;

    const result = await Swal.fire({
      title: `Delete ${memberIds.length} Members?`,
      text: 'This will permanently remove selected members from the cloud roster.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: `Yes, Delete (${memberIds.length})`,
      background: '#101626',
      color: '#f8fafc'
    });

    if (!result.isConfirmed) return;

    setMembers(prev => {
      const updated = prev.filter(m => !memberIds.includes(m._id) && !memberIds.includes(m.id));
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });

    try {
      await bulkDeleteSupabaseMembers(memberIds);
    } catch (e) {}

    setLastSyncTime(new Date());
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${memberIds.length} members deleted`,
      showConfirmButton: false,
      timer: 2500,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Save / Update Member Handler
  const handleSaveMember = async (updatedMember) => {
    setMembers(prev => {
      const updated = prev.map(m => (m._id === updatedMember._id || m.id === updatedMember.id || m.name === updatedMember.name) ? updatedMember : m);
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });
    if (selectedMember && (selectedMember._id === updatedMember._id || selectedMember.id === updatedMember.id || selectedMember.name === updatedMember.name)) {
      setSelectedMember(updatedMember);
    }

    try {
      const supaUpdated = await updateSupabaseMember(updatedMember._id || updatedMember.id, updatedMember);
      if (supaUpdated) {
        setMembers(prev => {
          const updated = prev.map(m => (m._id === supaUpdated._id || m.id === supaUpdated.id || m.name === supaUpdated.name) ? supaUpdated : m);
          localStorage.setItem('offer_gen_members', JSON.stringify(updated));
          return updated;
        });
        if (selectedMember && (selectedMember._id === supaUpdated._id || selectedMember.id === supaUpdated.id || selectedMember.name === supaUpdated.name)) {
          setSelectedMember(supaUpdated);
        }
      }
    } catch (e) {}

    setLastSyncTime(new Date());
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Member profile updated & synced to Cloud!',
      showConfirmButton: false,
      timer: 2500,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Promote Member Handler
  const handlePromoteMember = async (updatedMember) => {
    setMembers(prev => {
      const updated = prev.map(m => (m._id === updatedMember._id || m.id === updatedMember.id || m.name === updatedMember.name) ? updatedMember : m);
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });
    setSelectedMember(updatedMember);
    if (isAWS) {
      setAwsLetterConfig(prev => ({ ...prev, letterRefId: updatedMember.letterRefId || prev.letterRefId }));
    } else if (isTechno) {
      setTechnoLetterConfig(prev => ({ ...prev, letterRefId: updatedMember.letterRefId || prev.letterRefId }));
    } else {
      setGdgocLetterConfig(prev => ({ ...prev, letterRefId: updatedMember.letterRefId || prev.letterRefId }));
    }

    try {
      const supaUpdated = await updateSupabaseMember(updatedMember._id || updatedMember.id, updatedMember);
      if (supaUpdated) {
        setMembers(prev => {
          const updated = prev.map(m => (m._id === supaUpdated._id || m.id === supaUpdated.id || m.name === supaUpdated.name) ? supaUpdated : m);
          localStorage.setItem('offer_gen_members', JSON.stringify(updated));
          return updated;
        });
        setSelectedMember(supaUpdated);
      }
    } catch (e) {}

    setLastSyncTime(new Date());

    Swal.fire({
      icon: 'success',
      title: '🌟 Member Promoted Successfully!',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p><b>${updatedMember.name}</b> has been elevated to <b>${updatedMember.roleType}</b>.</p>
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px 14px; margin: 10px 0;">
            <p style="margin: 0; color: #059669; font-weight: 700;">📜 Official Letter Generated:</p>
            <p style="margin: 4px 0 0 0; color: #334155;">Title: <b>${updatedMember.designation}</b> • Ref: <b>${updatedMember.letterRefId || 'Generated'}</b></p>
          </div>
        </div>
      `,
      confirmButtonColor: isAWS ? '#ff9900' : (isTechno ? '#00d2ff' : '#4285F4'),
      confirmButtonText: 'View Official Letter 📄'
    }).then(() => {
      setCurrentView('letter_studio');
    });
  };

  // Reseed Database Handler
  const handleResetDatabase = async () => {
    const result = await Swal.fire({
      title: 'Reseed Database?',
      text: 'This will reset all roster members to the default official trio-club rosters (AWS SBG + Techno Lab + GDGoC).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Reseed Now',
      background: '#101626',
      color: '#f8fafc'
    });

    if (!result.isConfirmed) return;

    let reseededCount = INITIAL_TEAM_DATA.length;
    try {
      const supaSeeded = await seedSupabaseMembers(INITIAL_TEAM_DATA);
      if (supaSeeded && supaSeeded.length > 0) {
        setMembers(supaSeeded);
        localStorage.setItem('offer_gen_members', JSON.stringify(supaSeeded));
        reseededCount = supaSeeded.length;
      } else {
        setMembers(INITIAL_TEAM_DATA);
        localStorage.setItem('offer_gen_members', JSON.stringify(INITIAL_TEAM_DATA));
      }
    } catch (e) {
      setMembers(INITIAL_TEAM_DATA);
      localStorage.setItem('offer_gen_members', JSON.stringify(INITIAL_TEAM_DATA));
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
    const memberEmail = member.email || '';
    if (isAWS) {
      setAwsLetterConfig(prev => ({ ...prev, letterRefId: member.letterRefId || '', memberEmail }));
    } else if (isTechno) {
      setTechnoLetterConfig(prev => ({ ...prev, letterRefId: member.letterRefId || '', memberEmail }));
    } else {
      setGdgocLetterConfig(prev => ({ ...prev, letterRefId: member.letterRefId || '', memberEmail }));
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
        scale: 3,
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

  // Send Offer Letter Email via Official Club Mail Handler
  const handleSendOfferLetterEmail = async () => {
    const member = currentActiveMember;
    if (!member) {
      Swal.fire({
        icon: 'warning',
        title: 'No Member Selected',
        text: 'Please select a member from the roster to dispatch their appointment letter.',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#ff9900'
      });
      return;
    }

    const defaultTargetEmail = activeLetterConfig.memberEmail || member.email || `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`;
    const officialClubEmail = activeClub.email || (isAWS ? 'aws.itmbu@gmail.com' : (isTechno ? 'technolabclub25@gmail.com' : 'gdgoc.itmbu@gmail.com'));
    const refId = member.letterRefId || activeLetterConfig.letterRefId || `${activeClub.refPrefix}-${member._id?.substring(0, 5) || '001'}`;
    const tenure = activeLetterConfig.tenure || 'Academic Year 2026 – 2027';
    const issueDate = activeLetterConfig.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const { value: formValues } = await Swal.fire({
      title: `<span style="color:${activeClub.primaryColor}; font-weight:800;">📧 Send Official Offer Letter</span>`,
      html: `
        <div style="text-align: left; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <div style="background: rgba(15, 23, 42, 0.85); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px;">
            <p style="margin: 0 0 4px 0; color: #94a3b8;"><strong>🏛️ Official Sender Desk:</strong></p>
            <p style="margin: 0; color: #38bdf8; font-weight: 700;">${activeClub.name} &lt;${officialClubEmail}&gt;</p>
          </div>
          
          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #f8fafc;">Candidate Recipient Email (Gmail / Personal / Institutional):</label>
            <input id="swal-recipient-email" class="swal2-input" style="width: 100%; margin: 0; background: #1e293b; color: #fff; border: 1px solid #475569; font-size: 13px;" value="${defaultTargetEmail}" placeholder="e.g. name@gmail.com" />
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: block; font-weight: 600; margin-bottom: 4px; color: #f8fafc;">Optional Chapter Message / Note:</label>
            <textarea id="swal-custom-note" class="swal2-textarea" style="width: 100%; margin: 0; background: #1e293b; color: #fff; border: 1px solid #475569; font-size: 12.5px; height: 65px;" placeholder="Welcome to the team! Looking forward to building together."></textarea>
          </div>

          <div style="font-size: 12px; color: #94a3b8; background: rgba(56, 189, 248, 0.08); padding: 8px 12px; border-radius: 6px; border-left: 3px solid #38bdf8;">
            <b>📄 Letter Details:</b> ${member.name} (${member.designation || member.roleType}) • ${refId}
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '🚀 Send via Official Gmail',
      cancelButtonText: 'Cancel',
      confirmButtonColor: activeClub.primaryColor || '#ff9900',
      cancelButtonColor: '#334155',
      background: '#0f172a',
      color: '#f8fafc',
      preConfirm: () => {
        const email = document.getElementById('swal-recipient-email').value;
        const note = document.getElementById('swal-custom-note').value;
        if (!email || !email.includes('@')) {
          Swal.showValidationMessage('Please enter a valid recipient email address');
          return false;
        }
        return { recipientEmail: email.trim(), customNote: note.trim() };
      }
    });

    if (!formValues) return;

    // Update member's email in local state and config immediately
    const memberId = member._id || member.id;
    const updatedMember = { ...member, email: formValues.recipientEmail };
    setSelectedMember(updatedMember);
    setMembers(prev => {
      const next = prev.map(m => ((m._id && m._id === memberId) || (m.id && m.id === memberId) || (m.name === member.name && m.organization === activeOrg)) ? updatedMember : m);
      localStorage.setItem('offer_gen_members', JSON.stringify(next));
      return next;
    });
    if (isAWS) setAwsLetterConfig(prev => ({ ...prev, memberEmail: formValues.recipientEmail }));
    else if (isTechno) setTechnoLetterConfig(prev => ({ ...prev, memberEmail: formValues.recipientEmail }));
    else setGdgocLetterConfig(prev => ({ ...prev, memberEmail: formValues.recipientEmail }));

    Swal.fire({
      title: 'Dispatching Offer Letter...',
      html: `<span style="color: #94a3b8; font-size: 13px;">Preparing official dispatch from <b>${officialClubEmail}</b> to <b>${formValues.recipientEmail}</b>...</span>`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#0f172a',
      color: '#f8fafc'
    });

    const plainTextBody = `Dear ${member.name},

Congratulations! On behalf of ${activeClub.name} and ITM (sls) Baroda University, Department of Computer Science & Engineering, we are pleased to present your Official Appointment & Joining Letter.

==================================================
OFFICIAL APPOINTMENT CREDENTIALS
==================================================
• Candidate Name: ${member.name}
• Designation / Role: ${member.designation || member.roleType}
• Department / Wing: ${member.department || 'General'}
• Reference Number: ${refId}
• Academic Tenure: ${tenure}
• Date of Issuance: ${issueDate}
• Institution: ITM (sls) Baroda University, Vadodara, Gujarat

${formValues.customNote ? `Note from Leadership:\n${formValues.customNote}\n\n` : ''}${member.responsibilities && member.responsibilities.length > 0 ? `Key Scope of Responsibilities:\n${member.responsibilities.map(r => `• ${r}`).join('\n')}\n\n` : ''}This document serves as your official verified appointment confirmation. For any administrative inquiries, contact the official chapter desk at ${officialClubEmail}.

Warm regards,
${activeClub.name} Leadership Team
Department of Computer Science & Engineering
ITM (sls) Baroda University, Vadodara, Gujarat
"Think Big... Think Beyond"`;

    const subject = `Official Appointment & Joining Letter | ${activeClub.name} • ITMBU [Ref: ${refId}]`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(formValues.recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
    const mailtoUrl = `mailto:${formValues.recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;

    try {
      await sendOfferLetterEmailService({
        member: updatedMember,
        clubConfig: activeClub,
        letterConfig: activeLetterConfig,
        recipientEmail: formValues.recipientEmail,
        senderEmail: officialClubEmail,
        customNote: formValues.customNote
      });

      // Automatically launch Gmail web composer in new tab
      window.open(gmailUrl, '_blank');

      Swal.fire({
        icon: 'success',
        title: 'Offer Letter Ready & Dispatched!',
        html: `
          <div style="text-align: left; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
            <p>Official appointment letter for <strong>${member.name}</strong> is generated and logged in database!</p>
            <div style="background: rgba(15, 23, 42, 0.8); padding: 10px; border-radius: 6px; margin: 10px 0; border: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0;"><strong>🏛️ From:</strong> ${officialClubEmail}</p>
              <p style="margin: 4px 0 0 0;"><strong>👤 To:</strong> ${formValues.recipientEmail}</p>
              <p style="margin: 4px 0 0 0; color: #34d399;"><strong>⚡ Status:</strong> Logged &amp; Prepared for Dispatch</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin: 8px 0;">Gmail composer has been opened. If popups were blocked, click the button below:</p>
            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
              <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" 
                 style="display: inline-flex; align-items: center; gap: 4px; padding: 8px 14px; background: #ea4335; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 12.5px;">
                ✉️ Open in Gmail Web
              </a>
              <a href="${mailtoUrl}" 
                 style="display: inline-flex; align-items: center; gap: 4px; padding: 8px 14px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 12.5px;">
                📧 Default Mail App
              </a>
              <button type="button" id="btn-copy-letter-text"
                 style="padding: 8px 12px; background: #334155; color: #fff; border: none; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer;">
                📋 Copy Text
              </button>
            </div>
          </div>
        `,
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Done',
        didOpen: () => {
          const copyBtn = document.getElementById('btn-copy-letter-text');
          if (copyBtn) {
            copyBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(plainTextBody);
              copyBtn.innerText = '✅ Copied!';
              setTimeout(() => { copyBtn.innerText = '📋 Copy Text'; }, 2000);
            });
          }
        }
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Dispatch Notice',
        text: err.message || 'An error occurred while dispatching the email.',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  const handleBatchPrint = (targetMembers) => {
    setBatchPrintList(targetMembers);
    setTimeout(() => {
      window.print();
      setBatchPrintList(null);
    }, 250);
  };

  // If user is not authenticated, show AuthScreen
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} visibleChapters={visibleChapters} />;
  }

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const availableChaptersList = Object.keys(CLUB_CONFIGS).filter(key => visibleChapters[key] !== false);

  return (
    <div className={`app-root theme-${activeOrg.toLowerCase().replace('_', '-')}`}>
      
      {/* Universal Top Header */}
      <header className={`app-navbar ${isAWS ? 'navbar-aws' : (isTechno ? 'navbar-techno' : 'navbar-gdgoc')} no-print`}>
        
        {/* Left: Brand Identity */}
        <div className="nav-brand-section">
          <div className={`nav-logo-badge ${isAWS ? 'badge-aws-brand' : (isTechno ? 'badge-techno-brand' : 'badge-gdgoc-brand')}`}>
            {activeClub.shortName || (isAWS ? 'AWS SBG' : (isTechno ? 'Techno Lab' : 'GDGoC'))}
          </div>
          <div className="brand-text-col">
            <h1 className="nav-main-title">
              {activeClub.name}
            </h1>
            <span className="nav-sub-title">
              ITM (sls) BARODA UNIVERSITY &bull; Joining Letter Studio
            </span>
          </div>
        </div>

        {/* Center: Main View Navigation */}
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
            <span className="tab-text">Logos &amp; University Branding</span>
          </button>
        </div>

        {/* Right: Chapter Switcher + User Chip + Logout */}
        <div className="nav-right-controls">
          
          {/* Trio Club Switcher for Super Admin */}
          {isSuperAdmin ? (
            <div className="top-org-slider-pill" style={{ display: 'flex', gap: '4px', background: '#0a0f1d', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              {availableChaptersList.map(orgKey => {
                const club = CLUB_CONFIGS[orgKey];
                const isActive = activeOrg === orgKey;
                return (
                  <button
                    key={orgKey}
                    className={`top-slider-btn ${isActive ? 'active-' + orgKey.toLowerCase().replace('_', '-') : ''}`}
                    onClick={() => handleSwitchOrg(orgKey)}
                    title={`Switch to ${club.name}`}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isActive ? `1px solid ${club.primaryColor}` : '1px solid transparent',
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8'
                    }}
                  >
                    {orgKey === 'AWS_SBG' ? '☁️ AWS SBG' : (orgKey === 'TECHNO_LAB' ? '🔬 Techno Lab' : '🌐 GDGoC')}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`admin-org-indicator ${isAWS ? 'chip-aws' : (isTechno ? 'chip-techno' : 'chip-gdgoc')}`}>
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
            title={isSuperAdmin ? 'Click to open Super Administrator Universal Control Center' : 'Current User Profile'}
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
                  setAwsLetterConfig(prev => ({ ...prev, letterRefId: member.letterRefId || '' }));
                } else if (isTechno) {
                  setTechnoLetterConfig(prev => ({ ...prev, letterRefId: member.letterRefId || '' }));
                } else {
                  setGdgocLetterConfig(prev => ({ ...prev, letterRefId: member.letterRefId || '' }));
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

          {/* Center Column: Official Document Canvas & Letter Controls */}
          <section className="document-column">
            <LetterControls
              member={currentActiveMember}
              config={activeLetterConfig}
              clubConfig={activeClub}
              onChangeConfig={(key, value) => {
                if (key === 'memberEmail' && currentActiveMember) {
                  const memberId = currentActiveMember._id || currentActiveMember.id;
                  const updatedMember = { ...currentActiveMember, email: value };
                  setSelectedMember(updatedMember);
                  setMembers(prev => {
                    const next = prev.map(m => ((m._id && m._id === memberId) || (m.id && m.id === memberId) || (m.name === currentActiveMember.name && m.organization === activeOrg)) ? updatedMember : m);
                    localStorage.setItem('offer_gen_members', JSON.stringify(next));
                    return next;
                  });
                }
                if (isAWS) {
                  setAwsLetterConfig(prev => ({ ...prev, [key]: value }));
                } else if (isTechno) {
                  setTechnoLetterConfig(prev => ({ ...prev, [key]: value }));
                } else {
                  setGdgocLetterConfig(prev => ({ ...prev, [key]: value }));
                }
              }}
              onSaveConfig={() => handleSaveLetterConfig(activeOrg)}
              itmbuLogo={itmbuLogo}
              onUploadItmbuLogo={setItmbuLogo}
              clubLogo={activeClubLogo}
              onUploadClubLogo={(val) => {
                if (isAWS) setAwsClubLogo(val);
                else if (isTechno) setTechnoClubLogo(val);
                else setGdgocClubLogo(val);
              }}
              organizerSignatureImage={activeOrganizerSig}
              onUploadOrganizerSignature={(val) => {
                if (isAWS) setAwsOrganizerSig(val);
                else if (isTechno) setTechnoOrganizerSig(val);
                else setGdgocOrganizerSig(val);
              }}
              advisorSignatureImage={activeAdvisorSig}
              onUploadAdvisorSignature={(val) => {
                if (isAWS) setAwsAdvisorSig(val);
                else if (isTechno) setTechnoAdvisorSig(val);
                else setGdgocAdvisorSig(val);
              }}
              mentorSignatureImage={activeMentorSig}
              onUploadMentorSignature={(val) => {
                if (isAWS) setAwsMentorSig(val);
                else if (isTechno) setTechnoMentorSig(val);
                else setGdgocMentorSig(val);
              }}
              onPrint={handlePrint}
              onDownloadPdf={() => handleDownloadFhdPdf(currentActiveMember?.name)}
              onSendEmail={handleSendOfferLetterEmail}
            />

            <div className="letter-preview-viewport">
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
            // GDGoC props
            gdgocClubLogo={gdgocClubLogo}
            onUploadGdgocClubLogo={setGdgocClubLogo}
            gdgocOrganizerSig={gdgocOrganizerSig}
            onUploadGdgocOrganizerSig={setGdgocOrganizerSig}
            gdgocAdvisorSig={gdgocAdvisorSig}
            onUploadGdgocAdvisorSig={setGdgocAdvisorSig}
            gdgocMentorSig={gdgocMentorSig}
            onUploadGdgocMentorSig={setGdgocMentorSig}
            gdgocConfig={gdgocLetterConfig}
            onChangeGdgocConfig={setGdgocLetterConfig}
            // DB Save handler
            onSaveToDatabase={handleSaveBrandingToDatabase}
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

      {/* SUPER ADMINISTRATOR UNIVERSAL CONTROL CENTER */}
      <SuperAdminConsole
        isOpen={isSuperAdminConsoleOpen}
        onClose={() => setIsSuperAdminConsoleOpen(false)}
        currentUser={currentUser}
        members={members}
        activeOrg={activeOrg}
        visibleChapters={visibleChapters}
        onToggleChapterVisibility={handleToggleChapterVisibility}
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
        gdgocLetterConfig={gdgocLetterConfig}
        onChangeAwsConfig={setAwsLetterConfig}
        onChangeTechnoConfig={setTechnoLetterConfig}
        onChangeGdgocConfig={setGdgocLetterConfig}
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
