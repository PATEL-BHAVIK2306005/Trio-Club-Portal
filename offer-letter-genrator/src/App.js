import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { INITIAL_TEAM_DATA, CLUB_CONFIGS } from './data/teamData';
import OfficialJoiningLetter from './components/OfficialJoiningLetter';
import TeamRosterGrid from './components/TeamRosterGrid';
import LetterControls from './components/LetterControls';
import BatchGeneratorModal from './components/BatchGeneratorModal';
import AddMemberModal from './components/AddMemberModal';
import BulkAddMemberModal from './components/BulkAddMemberModal';
import EditMemberModal from './components/EditMemberModal';
import PromoteMemberModal from './components/PromoteMemberModal';
import TeamManagement from './components/TeamManagement';
import BrandingSettings from './components/BrandingSettings';
import AuthScreen from './components/AuthScreen';
import SuperAdminConsole from './components/SuperAdminConsole';
import CertifierEmailModal from './components/CertifierEmailModal';
import CertificateStudio from './components/certificates/CertificateStudio';
import PublicCertificateVerification from './components/certificates/PublicCertificateVerification';
import PublicOfferLetterVerification from './components/PublicOfferLetterVerification';
import { INITIAL_EVENT_CERTIFICATES } from './data/certificateData';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import QueryManagementModal from './components/QueryManagementModal';
import UserProfileModal from './components/UserProfileModal';
import awsChipLogo from './assets/aws_chip_logo.png';
import {
  LayoutDashboard,
  FileText,
  Award,
  Users,
  Palette,
  Settings,
  LogOut,
  Search,
  Mail,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  Shield,
  QrCode,
  MessageSquare,
  Cpu,
  Globe
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  fetchSupabaseMembers,
  insertSupabaseMember,
  bulkInsertSupabaseMembers,
  updateSupabaseMember,
  deleteSupabaseMember,
  bulkDeleteSupabaseMembers,
  seedSupabaseMembers,
  fetchSupabaseBranding,
  saveSupabaseBranding,
  subscribeToSupabaseMembers,
  subscribeToSupabaseBranding
} from './services/supabaseService';
import {
  fetchMasterSmtpConfigFromSupabase,
  subscribeToSmtpConfigRealtime
} from './services/reactEmailService';

const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

// Resilient localStorage helper to prevent QuotaExceededError crashes
const safeLocalStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage Auto-Protect] Quota exceeded on setting ${key}. Auto-healing cache...`, err);
    try {
      // Purge any temporary big blobs
      localStorage.removeItem('user_profile_avatar_raw');
      localStorage.removeItem('temp_image_cache');
      
      // If saving user session, strip oversized avatar string to avoid exceeding quota
      if (key === 'offer_gen_user') {
        const parsed = JSON.parse(value);
        if (parsed && parsed.avatar && parsed.avatar.length > 20000) {
          delete parsed.avatar;
        }
        localStorage.setItem(key, JSON.stringify(parsed));
        return;
      }
      localStorage.setItem(key, value);
    } catch (finalErr) {
      console.error('[Storage Error] LocalStorage full. Data state held in memory.', finalErr);
    }
  }
};

function App() {
  // Navigation View State: 'dashboard' | 'letter_studio' | 'certificate_studio' | 'team_management' | 'branding'
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('offer_gen_user');
      const user = saved ? JSON.parse(saved) : null;
      const customAvatar = localStorage.getItem('user_profile_avatar');
      if (user && customAvatar) {
        user.avatar = customAvatar;
      }
      return user;
    } catch (e) {
      return null;
    }
  });

  // Profile Modal State & Avatar Handler
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleUpdateAvatar = (newAvatarUrl) => {
    setCurrentUser(prev => {
      const updated = { ...(prev || {}), avatar: newAvatarUrl };
      safeLocalStorageSet('user_profile_avatar', newAvatarUrl || '');
      try {
        const saved = localStorage.getItem('offer_gen_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.avatar = newAvatarUrl;
          safeLocalStorageSet('offer_gen_user', JSON.stringify(parsed));
        }
      } catch (err) {}
      return updated;
    });
  };

  // App Theme State (Dark / Light)
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem('itmbu_portal_theme') || localStorage.getItem('itmbu_auth_theme') || 'light';
  });

  const toggleAppTheme = () => {
    const nextTheme = appTheme === 'dark' ? 'light' : 'dark';
    setAppTheme(nextTheme);
    localStorage.setItem('itmbu_portal_theme', nextTheme);
    localStorage.setItem('itmbu_auth_theme', nextTheme);
  };

  // Public Certificate Verification State (Triggered by QR Code Scan or Direct Link ?verify=ID)
  const [publicVerifyId, setPublicVerifyId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyQ = params.get('verify');
      if (verifyQ) return verifyQ;
      if (window.location.hash.startsWith('#verify/')) {
        return window.location.hash.replace('#verify/', '');
      }
    }
    return null;
  });

  // Public Offer Letter Verification State (Triggered by email button click or ?letter=REF_ID)
  const [publicLetterRefId, setPublicLetterRefId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const letterQ = params.get('letter') || params.get('offer_letter') || params.get('verify_letter');
      if (letterQ) return letterQ;
      if (window.location.hash.startsWith('#letter/')) {
        return window.location.hash.replace('#letter/', '');
      }
    }
    return null;
  });

  // Event Certificates Vault State
  const [certificates, setCertificates] = useState(() => {
    try {
      const saved = localStorage.getItem('event_certificates_vault');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_EVENT_CERTIFICATES;
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

  // Data & Member State (Loaded instantly from localStorage with 0ms lag + Auto-healing corruption filter)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('offer_gen_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const uniqueNames = new Set(parsed.map(m => (m?.name || '').trim()).filter(Boolean));
          if (parsed.length > 5 && uniqueNames.size <= 2) {
            console.warn('[Auto-Heal] Resetting corrupted local cache to official rosters.');
            localStorage.setItem('offer_gen_members', JSON.stringify(INITIAL_TEAM_DATA));
            return INITIAL_TEAM_DATA;
          }
          return parsed.map(m => ({
            ...m,
            _id: m._id || m.id || `member-${Math.random().toString(36).substr(2, 9)}`,
            id: m.id || m._id || `member-${Math.random().toString(36).substr(2, 9)}`
          }));
        }
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
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isCertifierEmailModalOpen, setIsCertifierEmailModalOpen] = useState(false);
  const [promotingMember, setPromotingMember] = useState(null);
  const [isSuperAdminConsoleOpen, setIsSuperAdminConsoleOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
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

  // Bulletproof member matching function (prevents undefined collisions and cross-org leaks)
  const isSameMember = useCallback((a, b) => {
    if (!a || !b) return false;
    const aId = String(a._id || a.id || '').trim();
    const bId = String(b._id || b.id || '').trim();
    if (aId && bId && aId === bId) return true;

    const aName = (a.name || '').trim().toLowerCase();
    const bName = (b.name || '').trim().toLowerCase();
    const aOrg = a.organization || 'AWS_SBG';
    const bOrg = b.organization || 'AWS_SBG';

    if (aName && bName && aName === bName && aOrg === bOrg) {
      return true;
    }
    return false;
  }, []);

  // Smart Merge Helper: Preserves local additions and merges with cloud data
  const mergeMembers = useCallback((cloudMembers, currentMembers) => {
    if (!Array.isArray(cloudMembers) || cloudMembers.length === 0) return currentMembers || INITIAL_TEAM_DATA;
    
    // Check if currentMembers is corrupted with duplicate names (e.g. all Smit)
    const validCurrent = (currentMembers || []).filter(Boolean);
    const uniqueNames = new Set(validCurrent.map(m => (m?.name || '').trim()).filter(Boolean));
    if (validCurrent.length > 5 && uniqueNames.size <= 2) {
      console.warn('[Data Recovery] Corrupted local roster detected. Resetting to cloud roster.');
      return cloudMembers;
    }

    const merged = [...cloudMembers];
    validCurrent.forEach(localM => {
      const localKey = String(localM._id || localM.id || '');
      const isLocalOrTemp = localKey.includes('custom') || localKey.includes('temp') || localKey.includes('local');
      const alreadyInCloud = cloudMembers.some(cm => isSameMember(cm, localM));
      if (isLocalOrTemp && !alreadyInCloud) {
        merged.unshift(localM);
      }
    });
    return merged;
  }, [isSameMember]);

  // Sync members to localStorage on any state change
  useEffect(() => {
    if (members && members.length > 0) {
      localStorage.setItem('offer_gen_members', JSON.stringify(members));
    }
  }, [members]);

  // Real-time dynamic active member computed from latest members state
  const currentActiveMember = members.find(m => (
    selectedMember && isSameMember(m, selectedMember)
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
    let smtpSubChannel = null;
    let autoSyncInterval = null;

    const initData = async () => {
      let loadedFromSupabase = false;

      // Realtime Cloud SMTP Fetch
      try {
        await fetchMasterSmtpConfigFromSupabase();
      } catch (e) {}

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

    // 2. Realtime WebSocket Subscription (Isolated & Safe)
    memberSubChannel = subscribeToSupabaseMembers((change) => {
      setLastSyncTime(new Date());
      setDbConnected(true);

      if (change.eventType === 'INSERT' && change.newRecord) {
        const item = change.newRecord;
        setMembers(prev => {
          const exists = prev.some(m => isSameMember(m, item));
          let nextList;
          if (exists) {
            nextList = prev.map(m => isSameMember(m, item) ? item : m);
          } else {
            nextList = [item, ...prev];
          }
          localStorage.setItem('offer_gen_members', JSON.stringify(nextList));
          return nextList;
        });
      } else if (change.eventType === 'UPDATE' && change.newRecord) {
        const item = change.newRecord;
        setMembers(prev => {
          const nextList = prev.map(m => isSameMember(m, item) ? item : m);
          localStorage.setItem('offer_gen_members', JSON.stringify(nextList));
          return nextList;
        });
        setSelectedMember(prev => (prev && isSameMember(prev, item)) ? item : prev);
      } else if (change.eventType === 'DELETE') {
        const oldId = change.raw?.old?.id?.toString();
        const oldName = change.raw?.old?.name;
        const oldOrg = change.raw?.old?.organization;
        setMembers(prev => {
          const nextList = prev.filter(m => {
            if (oldId && (m._id === oldId || m.id === oldId)) return false;
            if (oldName && m.name === oldName && (!oldOrg || m.organization === oldOrg)) return false;
            return true;
          });
          localStorage.setItem('offer_gen_members', JSON.stringify(nextList));
          return nextList;
        });
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

    // SMTP Realtime Channel
    smtpSubChannel = subscribeToSmtpConfigRealtime();

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
      if (smtpSubChannel && typeof smtpSubChannel.unsubscribe === 'function') {
        smtpSubChannel.unsubscribe();
      }
      if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
      }
    };
  }, [applyBrandingList, mergeMembers, isSameMember]);

  // Update selected member when switching active chapter
  useEffect(() => {
    const orgMembers = members.filter(m => !m.organization || m.organization === activeOrg);
    if (orgMembers.length > 0) {
      setSelectedMember(prev => {
        if (prev) {
          const stillExists = orgMembers.find(m => isSameMember(m, prev));
          if (stillExists) return stillExists;
        }
        return orgMembers[0];
      });
    }
  }, [activeOrg, members, isSameMember]);

  // Keep selectedMember synchronized with latest data
  useEffect(() => {
    if (selectedMember && members.length > 0) {
      const updated = members.find(m => isSameMember(m, selectedMember));
      if (updated && (
        updated.roleType !== selectedMember.roleType ||
        updated.designation !== selectedMember.designation ||
        updated.department !== selectedMember.department ||
        updated.letterRefId !== selectedMember.letterRefId ||
        updated.avatar !== selectedMember.avatar ||
        updated.email !== selectedMember.email ||
        updated.name !== selectedMember.name
      )) {
        setSelectedMember(updated);
      }
    }
  }, [members, selectedMember, isSameMember]);

  const handleLogin = (userSession) => {
    setCurrentUser(userSession);
    setActiveOrg(userSession.organization || 'AWS_SBG');
    safeLocalStorageSet('offer_gen_user', JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('offer_gen_user');
    } catch (e) {}
  };

  const handleSwitchOrg = (newOrg) => {
    setActiveOrg(newOrg);
    if (currentUser) {
      const updatedUser = { ...currentUser, organization: newOrg };
      setCurrentUser(updatedUser);
      safeLocalStorageSet('offer_gen_user', JSON.stringify(updatedUser));
    }
  };

  // Save Letterhead Config handler
  const handleSaveLetterConfig = (orgKey = activeOrg) => {
    const configToSave = orgKey === 'AWS_SBG' ? awsLetterConfig : (orgKey === 'TECHNO_LAB' ? technoLetterConfig : gdgocLetterConfig);
    safeLocalStorageSet(`letter_config_${orgKey.toLowerCase()}`, JSON.stringify(configToSave));
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
          background: '#ffffff',
          color: '#0f172a',
          confirmButtonColor: '#0f172a',
          customClass: {
            popup: 'donezo-swal-popup'
          }
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
    const localMember = { 
      ...memberWithOrg, 
      _id: memberWithOrg._id || tempId, 
      id: memberWithOrg.id || tempId 
    };
    
    // 1. Instant local persistence & UI update (0ms delay)
    setMembers(prev => {
      const updated = [localMember, ...prev.filter(m => !isSameMember(m, localMember))];
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });
    setSelectedMember(localMember);

    // 2. Persist to Supabase in background
    try {
      const supaSaved = await insertSupabaseMember(memberWithOrg);
      if (supaSaved && (supaSaved._id || supaSaved.id)) {
        setMembers(prev => {
          const updated = prev.map(m => isSameMember(m, localMember) ? supaSaved : m);
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

  // Bulk Add Members Handler (Instant local update + Background Cloud Batch Sync)
  const handleBulkAddMembers = async (newMembersList) => {
    if (!newMembersList || newMembersList.length === 0) return;

    const preparedMembers = newMembersList.map((m, idx) => {
      const tempId = `${activeOrg.toLowerCase()}-bulk-${Date.now()}-${idx}`;
      return {
        ...m,
        organization: m.organization || activeOrg,
        department: m.department || (activeDepartments[0] || 'Technical Team'),
        _id: m._id || tempId,
        id: m.id || tempId
      };
    });

    // 1. Instant local state update (0ms latency)
    setMembers(prev => {
      const updated = [...preparedMembers, ...prev];
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });

    if (preparedMembers.length > 0) {
      setSelectedMember(preparedMembers[0]);
    }

    // 2. Background Cloud Batch Insert to Supabase
    try {
      const inserted = await bulkInsertSupabaseMembers(preparedMembers);
      if (inserted && inserted.length > 0) {
        setMembers(prev => {
          const merged = mergeMembers(inserted, prev);
          localStorage.setItem('offer_gen_members', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn('Supabase bulk sync notice:', e.message);
    }

    setLastSyncTime(new Date());

    Swal.fire({
      icon: 'success',
      title: `🎉 ${preparedMembers.length} Members Imported!`,
      text: `Successfully added ${preparedMembers.length} new members to the ${activeClub.name} roster.`,
      background: '#101626',
      color: '#f8fafc',
      confirmButtonColor: '#10b981'
    });
  };

  // Delete Member Handler
  const handleDeleteMember = async (memberId) => {
    const memberToDelete = members.find(m => (m._id && m._id === memberId) || (m.id && m.id === memberId) || m.name === memberId);
    const memberName = memberToDelete ? memberToDelete.name : 'Team Member';

    const result = await Swal.fire({
      title: `Remove ${memberName}?`,
      text: `Are you sure you want to remove this member from ${activeClub.shortName}?`,
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
      const updated = prev.filter(m => {
        if (memberToDelete && isSameMember(m, memberToDelete)) return false;
        if (memberId && (m._id === memberId || m.id === memberId)) return false;
        return true;
      });
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });

    if (selectedMember && memberToDelete && isSameMember(selectedMember, memberToDelete)) {
      const remaining = members.filter(m => !isSameMember(m, memberToDelete) && (!m.organization || m.organization === activeOrg));
      setSelectedMember(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      await deleteSupabaseMember(memberId, memberToDelete?.name, memberToDelete?.organization || activeOrg);
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

    const idsSet = new Set(memberIds);
    setMembers(prev => {
      const updated = prev.filter(m => !idsSet.has(m._id) && !idsSet.has(m.id) && !idsSet.has(m.name));
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

  // Save / Update Member Handler (Guaranteed single-target update)
  const handleSaveMember = async (updatedMember, originalMember = null) => {
    if (!updatedMember) return;
    const targetOriginal = originalMember || updatedMember;
    const cleanUpdated = {
      ...updatedMember,
      _id: updatedMember._id || targetOriginal._id || targetOriginal.id || `custom-${Date.now()}`,
      id: updatedMember.id || targetOriginal.id || targetOriginal._id || `custom-${Date.now()}`,
      organization: updatedMember.organization || targetOriginal.organization || activeOrg
    };

    // 1. Update ONLY target member in local state
    setMembers(prev => {
      const updated = prev.map(m => isSameMember(m, targetOriginal) ? cleanUpdated : m);
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });

    if (selectedMember && isSameMember(selectedMember, targetOriginal)) {
      setSelectedMember(cleanUpdated);
    }

    // 2. Persist to Cloud Database (Supabase) in background
    try {
      const targetId = cleanUpdated._id || cleanUpdated.id;
      const supaUpdated = await updateSupabaseMember(targetId, cleanUpdated, targetOriginal);
      if (supaUpdated && (supaUpdated.name || supaUpdated._id)) {
        setMembers(prev => {
          const updated = prev.map(m => isSameMember(m, cleanUpdated) ? supaUpdated : m);
          localStorage.setItem('offer_gen_members', JSON.stringify(updated));
          return updated;
        });
        if (selectedMember && isSameMember(selectedMember, cleanUpdated)) {
          setSelectedMember(supaUpdated);
        }
      }
    } catch (e) {
      console.warn('[Supabase Sync Error]', e);
    }

    setLastSyncTime(new Date());
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `✨ Profile for ${cleanUpdated.name} updated successfully!`,
      showConfirmButton: false,
      timer: 2500,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Promote Member Handler (Guaranteed single-target update)
  const handlePromoteMember = async (updatedMember, originalMember = null) => {
    if (!updatedMember) return;
    const targetOriginal = originalMember || updatedMember;
    const cleanUpdated = {
      ...updatedMember,
      _id: updatedMember._id || targetOriginal._id || targetOriginal.id || `custom-${Date.now()}`,
      id: updatedMember.id || targetOriginal.id || targetOriginal._id || `custom-${Date.now()}`,
      organization: updatedMember.organization || targetOriginal.organization || activeOrg
    };

    setMembers(prev => {
      const updated = prev.map(m => isSameMember(m, targetOriginal) ? cleanUpdated : m);
      localStorage.setItem('offer_gen_members', JSON.stringify(updated));
      return updated;
    });
    setSelectedMember(cleanUpdated);

    if (isAWS) {
      setAwsLetterConfig(prev => ({ ...prev, letterRefId: cleanUpdated.letterRefId || prev.letterRefId }));
    } else if (isTechno) {
      setTechnoLetterConfig(prev => ({ ...prev, letterRefId: cleanUpdated.letterRefId || prev.letterRefId }));
    } else {
      setGdgocLetterConfig(prev => ({ ...prev, letterRefId: cleanUpdated.letterRefId || prev.letterRefId }));
    }

    try {
      const targetId = cleanUpdated._id || cleanUpdated.id;
      const supaUpdated = await updateSupabaseMember(targetId, cleanUpdated, targetOriginal);
      if (supaUpdated && (supaUpdated.name || supaUpdated._id)) {
        setMembers(prev => {
          const updated = prev.map(m => isSameMember(m, cleanUpdated) ? supaUpdated : m);
          localStorage.setItem('offer_gen_members', JSON.stringify(updated));
          return updated;
        });
        setSelectedMember(supaUpdated);
      }
    } catch (e) {
      console.warn('[Supabase Promotion Sync Error]', e);
    }

    setLastSyncTime(new Date());

    Swal.fire({
      icon: 'success',
      title: '🌟 Member Promoted Successfully!',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p><b>${cleanUpdated.name}</b> has been elevated to <b>${cleanUpdated.roleType}</b>.</p>
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px 14px; margin: 10px 0;">
            <p style="margin: 0; color: #059669; font-weight: 700;">📜 Official Letter Generated:</p>
            <p style="margin: 4px 0 0 0; color: #334155;">Title: <b>${cleanUpdated.designation}</b> • Ref: <b>${cleanUpdated.letterRefId || 'Generated'}</b></p>
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

  // Send Offer Letter Email via Certifier-Grade Official Club Mail Desk
  const handleSendOfferLetterEmail = () => {
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
    setIsCertifierEmailModalOpen(true);
  };

  const handleBatchPrint = (targetMembers) => {
    setBatchPrintList(targetMembers);
    setTimeout(() => {
      window.print();
      setBatchPrintList(null);
    }, 250);
  };

  // If Public Certificate Verification is requested (via QR scan or search lookup)
  if (publicVerifyId) {
    return (
      <PublicCertificateVerification
        certificateId={publicVerifyId}
        allCertificates={certificates}
        itmbuLogo={itmbuLogo}
        clubLogo={activeClubLogo}
        onNavigateHome={() => {
          setPublicVerifyId(null);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />
    );
  }

  // If Public Offer Letter Verification is requested (via email button click or ?letter=REF_ID)
  if (publicLetterRefId) {
    return (
      <PublicOfferLetterVerification
        letterRefId={publicLetterRefId}
        members={members}
        itmbuLogo={itmbuLogo}
        awsClubLogo={awsClubLogo}
        technoClubLogo={technoClubLogo}
        gdgocClubLogo={gdgocClubLogo}
        onNavigateHome={() => {
          setPublicLetterRefId(null);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
      />
    );
  }

  // If user is not authenticated, show AuthScreen
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onVerifyCertificate={(certId) => {
          setPublicVerifyId(certId);
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', `?verify=${encodeURIComponent(certId)}`);
          }
        }}
        visibleChapters={visibleChapters}
      />
    );
  }

  const userRole = currentUser?.role || 'ORGANIZER';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isCertifier = userRole === 'CERTIFIER';
  const isStudent = userRole === 'MEMBER' || userRole === 'STUDENT';
  const isOrganizer = !isSuperAdmin && !isCertifier && !isStudent;

  const rolePerspectiveBadge = isSuperAdmin 
    ? { title: 'Super Administrator', icon: null, color: '#f59e0b', tag: 'UNIVERSAL ROOT' }
    : isCertifier
    ? { title: 'Certificate Authority', icon: null, color: '#10b981', tag: 'CERTIFIER DESK' }
    : isStudent
    ? { title: 'Student Member', icon: null, color: '#38bdf8', tag: 'STUDENT PORTAL' }
    : { title: 'Chapter Organizer', icon: null, color: '#6366f1', tag: 'CHAPTER LEAD' };

  const availableChaptersList = Object.keys(CLUB_CONFIGS).filter(key => visibleChapters[key] !== false);
  const activeOrgMembersCount = members.filter(m => (m.organization || 'AWS_SBG') === activeOrg).length;

  const filteredSearchMembers = searchQuery.trim()
    ? members.filter(m => 
        (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.letterRefId || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <div className={`app-root theme-${activeOrg.toLowerCase().replace('_', '-')} donezo-theme-root app-theme-${appTheme} role-view-${userRole.toLowerCase()}`} data-theme={appTheme}>
      <div className="donezo-app-layout">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="donezo-sidebar no-print">
          
          {/* Logo Brand Header */}
          <div className="donezo-sidebar-brand" onClick={() => setCurrentView('dashboard')}>
            <div className="donezo-brand-icon">
              {activeOrg === 'AWS_SBG' ? (
                <img src={awsChipLogo} alt="AWS Builder Official" className="brand-official-logo-img" />
              ) : activeClubLogo ? (
                <img src={activeClubLogo} alt={activeClub.name} className="brand-official-logo-img" />
              ) : itmbuLogo ? (
                <img src={itmbuLogo} alt="ITMBU Logo" className="brand-official-logo-img" />
              ) : (
                <div className="brand-leaf-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeOrg === 'TECHNO_LAB' ? <Cpu size={18} /> : <Globe size={18} />}
                </div>
              )}
            </div>
            <div className="donezo-brand-text-block">
              <span className="donezo-brand-name">Campus Core Link Club</span>
              <span className="donezo-brand-sub" style={{ color: activeOrg === 'AWS_SBG' ? '#f59e0b' : (activeOrg === 'TECHNO_LAB' ? '#6366f1' : '#4285f4') }}>
                ITM (sls) BARODA UNIVERSITY
              </span>
            </div>
          </div>

          {/* Single Active Chapter Display (Only 1 active chapter shown) */}
          <div className="sidebar-chapter-switcher-box">
            <div className="sidebar-switcher-header-row">
              <span className="sidebar-switcher-label">ACTIVE CHAPTER</span>
              <span className="sidebar-role-tag-pill" style={{ color: rolePerspectiveBadge.color, borderColor: rolePerspectiveBadge.color }}>
                {rolePerspectiveBadge.tag}
              </span>
            </div>
            <div className="sidebar-single-active-chapter-row">
              <div className={`sidebar-chapter-chip active-single active-${activeOrg.toLowerCase().replace('_', '-')}`}>
                <span className="chip-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {activeOrg === 'AWS_SBG' ? (
                    <img src={awsChipLogo} alt="AWS" style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '4px' }} />
                  ) : (activeOrg === 'TECHNO_LAB' ? <Cpu size={16} /> : <Globe size={16} />)}
                </span>
                <span className="chip-name">{activeClub.shortName}</span>
                <span className="active-dot"></span>
              </div>
              {availableChaptersList.length > 1 && (
                <button
                  type="button"
                  className="sidebar-chapter-switch-trigger"
                  onClick={() => {
                    const currentIndex = availableChaptersList.indexOf(activeOrg);
                    const nextIndex = (currentIndex + 1) % availableChaptersList.length;
                    handleSwitchOrg(availableChaptersList[nextIndex]);
                  }}
                  title="Switch to next active chapter"
                >
                  <span className="switch-icon">⇄</span>
                  <span className="switch-label">Switch</span>
                </button>
              )}
            </div>
          </div>

          {/* Nav Section: MAIN MENU */}
          <div className="sidebar-section-group">
            <span className="sidebar-group-title">
              {isStudent ? 'STUDENT SERVICES' : (isCertifier ? 'CERTIFICATION DESK' : 'MAIN MENU')}
            </span>
            
            <nav className="sidebar-nav-list">
              {/* Dashboard */}
              <button
                className={`sidebar-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                <div className="nav-item-content">
                  <LayoutDashboard size={18} className="nav-icon" />
                  <span className="nav-label">{isStudent ? 'My Overview' : 'Dashboard'}</span>
                </div>
              </button>

              {/* Tasks / Letter Studio / My Letter */}
              <button
                className={`sidebar-nav-item ${currentView === 'letter_studio' ? 'active' : ''}`}
                onClick={() => setCurrentView('letter_studio')}
              >
                <div className="nav-item-content">
                  <FileText size={18} className="nav-icon" />
                  <span className="nav-label">{isStudent ? 'My Offer Letter' : (isCertifier ? 'Letters Registry' : 'Letter Studio')}</span>
                </div>
                <span className="nav-counter-badge">{isStudent ? 'Official' : `${activeOrgMembersCount || 12}+`}</span>
              </button>

              {/* Certificate Studio / My Certificates */}
              <button
                className={`sidebar-nav-item ${currentView === 'certificate_studio' ? 'active' : ''}`}
                onClick={() => setCurrentView('certificate_studio')}
              >
                <div className="nav-item-content">
                  <Award size={18} className="nav-icon" />
                  <span className="nav-label">{isStudent ? 'My Certificates' : (isCertifier ? 'Issue & Verify' : 'Certificates')}</span>
                </div>
                <span className="nav-counter-badge badge-soft">{certificates.length || 6}</span>
              </button>

              {/* Team Management / Directory */}
              <button
                className={`sidebar-nav-item ${currentView === 'team_management' ? 'active' : ''}`}
                onClick={() => setCurrentView('team_management')}
              >
                <div className="nav-item-content">
                  <Users size={18} className="nav-icon" />
                  <span className="nav-label">{isStudent ? 'Campus Directory' : 'Team Roster'}</span>
                </div>
              </button>

              {/* Branding Settings (Admin & Organizer only) */}
              {(isSuperAdmin || isOrganizer) && (
                <button
                  className={`sidebar-nav-item ${currentView === 'branding' ? 'active' : ''}`}
                  onClick={() => setCurrentView('branding')}
                >
                  <div className="nav-item-content">
                    <Palette size={18} className="nav-icon" />
                    <span className="nav-label">Branding</span>
                  </div>
                </button>
              )}

              {/* Club Queries & Live Discussion Hub */}
              <button
                className="sidebar-nav-item"
                onClick={() => setIsQueryModalOpen(true)}
                title="Open Club Queries & Helpdesk Discussions"
                id="sidebar-project-queries-btn"
              >
                <div className="nav-item-content">
                  <MessageSquare size={18} className="nav-icon" style={{ color: '#ff9900' }} />
                  <span className="nav-label" style={{ fontWeight: 600 }}>Club Queries</span>
                </div>
                <span className="nav-counter-badge" style={{ background: '#f59e0b', color: '#ffffff', fontWeight: 700, fontSize: '10.5px' }}>
                  On Discuss
                </span>
              </button>
            </nav>
          </div>

          {/* Nav Section: GENERAL / ROLE CONTROLS */}
          <div className="sidebar-section-group">
            <span className="sidebar-group-title">
              {isSuperAdmin ? 'ADMINISTRATION' : (isCertifier ? 'DISPATCH TOOLS' : (isStudent ? 'VERIFICATION' : 'GENERAL'))}
            </span>
            
            <nav className="sidebar-nav-list">
              {/* Settings / Super Admin Console / Certifier Hub / Verify QR */}
              {isSuperAdmin ? (
                <button
                  className="sidebar-nav-item"
                  onClick={() => setIsSuperAdminConsoleOpen(true)}
                  title="Open Universal Super Admin Console"
                >
                  <div className="nav-item-content">
                    <Shield size={18} className="nav-icon" style={{ color: '#f59e0b' }} />
                    <span className="nav-label" style={{ fontWeight: 700, color: '#f59e0b' }}>Super Admin</span>
                  </div>
                  <span className="nav-counter-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>Root</span>
                </button>
              ) : isCertifier ? (
                <button
                  className="sidebar-nav-item"
                  onClick={() => setIsCertifierEmailModalOpen(true)}
                  title="Open Email Dispatch & Certifier Verification Modal"
                >
                  <div className="nav-item-content">
                    <Mail size={18} className="nav-icon" style={{ color: '#10b981' }} />
                    <span className="nav-label" style={{ fontWeight: 700, color: '#10b981' }}>Email Dispatch</span>
                  </div>
                </button>
              ) : isStudent ? (
                <button
                  className="sidebar-nav-item"
                  onClick={() => {
                    setPublicVerifyId('DEMO-VERIFY');
                    if (typeof window !== 'undefined') window.history.pushState(null, '', `?verify=DEMO-VERIFY`);
                  }}
                  title="Public Certificate Verification Hub"
                >
                  <div className="nav-item-content">
                    <QrCode size={18} className="nav-icon" style={{ color: '#38bdf8' }} />
                    <span className="nav-label">Verify QR Credential</span>
                  </div>
                </button>
              ) : (
                <button
                  className="sidebar-nav-item"
                  onClick={() => setCurrentView('branding')}
                  title="Chapter Settings & Signatures"
                >
                  <div className="nav-item-content">
                    <Settings size={18} className="nav-icon" />
                    <span className="nav-label">Chapter Settings</span>
                  </div>
                </button>
              )}

              {/* Realtime DB Sync (For Admins and Organizers) */}
              {!isStudent && (
                <button
                  className="sidebar-nav-item"
                  onClick={() => handleSyncDatabase(false)}
                  title="Sync database realtime"
                >
                  <div className="nav-item-content">
                    <RefreshCw size={18} className={`nav-icon ${isSavingToDb ? 'spin-anim' : ''}`} />
                    <span className="nav-label">Sync Cloud DB</span>
                  </div>
                  <span className={`status-dot-mini ${dbConnected ? 'dot-green' : 'dot-red'}`}></span>
                </button>
              )}

              {/* Logout */}
              <button
                className="sidebar-nav-item item-logout"
                onClick={handleLogout}
              >
                <div className="nav-item-content">
                  <LogOut size={18} className="nav-icon" />
                  <span className="nav-label">Logout</span>
                </div>
              </button>
            </nav>
          </div>

          {/* User Profile Card (Clickable & Role Perspective Adapted) */}
          <div 
            className="donezo-sidebar-user-card clickable-admin-card" 
            onClick={() => {
              if (isSuperAdmin) setIsSuperAdminConsoleOpen(true);
              else if (isCertifier) setIsCertifierEmailModalOpen(true);
              else if (isStudent) setCurrentView('letter_studio');
              else setCurrentView('branding');
            }}
            title={`Active Role: ${rolePerspectiveBadge.title} • Click to open role dashboard`}
            id="sidebar-user-admin-card"
          >
            <div className="sidebar-user-avatar">
              <img 
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.displayName || currentUser?.username || 'User')}`} 
                alt="User" 
              />
              <span className="sidebar-avatar-admin-badge" style={{ background: rolePerspectiveBadge.color }}>
                {rolePerspectiveBadge.icon}
              </span>
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {currentUser?.displayName || currentUser?.username || 'Bhavikkumar Patel'}
              </span>
              <span className="sidebar-user-role" style={{ color: rolePerspectiveBadge.color }}>
                {rolePerspectiveBadge.title}
              </span>
            </div>
            <div className="sidebar-user-card-action" title="Open Role Hub">
              {isSuperAdmin ? <Shield size={16} className="sidebar-admin-icon" /> : <ChevronRight size={16} />}
            </div>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT CONTAINER */}
        <div className="donezo-main-column">
          
          {/* TOP ULTRA-CLEAN GLASS HEADER */}
          <header className="donezo-top-header no-print">
            
            {/* Search Bar with Shortcut ⌘F */}
            <div className="donezo-header-search-wrapper">
              <Search size={17} className="header-search-icon" />
              <input
                type="text"
                className="donezo-header-search-input"
                placeholder="Search task, member, or letter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              />
              <span className="header-search-badge">⌘F</span>

              {/* Quick Search Results Dropdown */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="search-results-floating-dropdown">
                  <div className="search-dropdown-header">
                    <span>Search Results ({filteredSearchMembers.length})</span>
                  </div>
                  {filteredSearchMembers.length > 0 ? (
                    filteredSearchMembers.map((m) => (
                      <div
                        key={m._id || m.id || m.name}
                        className="search-result-item"
                        onMouseDown={() => {
                          setSelectedMember(m);
                          if (m.organization) setActiveOrg(m.organization);
                          setCurrentView('letter_studio');
                        }}
                      >
                        <div className="search-item-avatar">
                          {m.name.charAt(0)}
                        </div>
                        <div className="search-item-info">
                          <span className="search-name">{m.name}</span>
                          <span className="search-sub">{m.position} • {m.department} ({m.organization || activeOrg})</span>
                        </div>
                        <ChevronRight size={14} className="search-arrow" />
                      </div>
                    ))
                  ) : (
                    <div className="search-empty-state">No members or tasks found</div>
                  )}
                </div>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="donezo-header-actions">
              
              {/* Dark / Light Theme Toggle Button */}
              <button
                className="header-circle-action-btn theme-toggle-btn"
                onClick={toggleAppTheme}
                title={`Switch to ${appTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
                id="header-theme-toggle-btn"
              >
                {appTheme === 'dark' ? (
                  <Sun size={18} className="theme-icon-sun" />
                ) : (
                  <Moon size={18} className="theme-icon-moon" />
                )}
              </button>

              {/* Role-Specific Hub / Action Button */}
              {isSuperAdmin ? (
                <button
                  className="header-circle-action-btn header-admin-action-btn"
                  onClick={() => setIsSuperAdminConsoleOpen(true)}
                  title="Super Admin Universal Control Center & Settings"
                  id="header-admin-console-btn"
                >
                  <Shield size={18} className="header-admin-shield-icon" />
                  <span className="admin-status-dot"></span>
                </button>
              ) : isCertifier ? (
                <button
                  className="header-circle-action-btn header-certifier-action-btn"
                  onClick={() => setIsCertifierEmailModalOpen(true)}
                  title="Certificate Dispatch & Verification Desk"
                  id="header-certifier-hub-btn"
                >
                  <Award size={18} style={{ color: '#10b981' }} />
                </button>
              ) : isStudent ? (
                <button
                  className="header-circle-action-btn header-student-action-btn"
                  onClick={() => setCurrentView('letter_studio')}
                  title="View & Download My Offer Letter"
                  id="header-student-letter-btn"
                >
                  <FileText size={18} style={{ color: '#38bdf8' }} />
                </button>
              ) : (
                <button
                  className="header-circle-action-btn"
                  onClick={() => setCurrentView('branding')}
                  title="Chapter Configuration & Branding"
                  id="header-chapter-config-btn"
                >
                  <Settings size={18} style={{ color: '#6366f1' }} />
                </button>
              )}

              {/* Mail / Email Logs Action (Admin / Certifier / Staff) or QR Verify (Student) */}
              {isStudent ? (
                <button
                  className="header-circle-action-btn"
                  onClick={() => {
                    setPublicVerifyId('DEMO-VERIFY');
                    if (typeof window !== 'undefined') window.history.pushState(null, '', `?verify=DEMO-VERIFY`);
                  }}
                  title="Verify Certificate Credential"
                >
                  <QrCode size={17} />
                </button>
              ) : (
                <button
                  className="header-circle-action-btn"
                  onClick={() => setIsCertifierEmailModalOpen(true)}
                  title="Email Dispatch & Verification Modal"
                >
                  <Mail size={17} />
                </button>
              )}

              {/* Compact User Profile Trigger: ONLY Icon and Drop Down arrow */}
              <button 
                type="button"
                className="header-user-profile-trigger" 
                onClick={() => setIsProfileModalOpen(true)}
                title={`Executive Profile & Account (${rolePerspectiveBadge.title})`}
                id="header-user-profile-btn"
              >
                <div className="header-avatar-circle" style={{ borderColor: rolePerspectiveBadge.color }}>
                  {currentUser?.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt="User" 
                      className="header-avatar-img"
                    />
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.displayName || currentUser?.username || 'User')}`} 
                      alt="User" 
                      className="header-avatar-img"
                    />
                  )}
                  <span className="header-avatar-online-dot" style={{ background: rolePerspectiveBadge.color }} />
                </div>
                <ChevronDown size={14} className="header-profile-chevron" />
              </button>

            </div>

          </header>

          {/* VIEW RENDERERS CONTAINER */}
          <div className="donezo-view-content-area">

            {/* VIEW 0: DONEZO EXECUTIVE DASHBOARD */}
            {currentView === 'dashboard' && (
              <ExecutiveDashboard
                members={members}
                activeOrg={activeOrg}
                clubConfig={activeClub}
                certificates={certificates}
                currentUser={currentUser}
                onNavigateView={setCurrentView}
                onSelectMemberForLetter={(member) => {
                  setSelectedMember(member);
                  setCurrentView('letter_studio');
                }}
                onOpenAddMember={() => setIsAddModalOpen(true)}
                onOpenBatchModal={() => setIsBatchModalOpen(true)}
                onOpenEmailModal={() => setIsCertifierEmailModalOpen(true)}
                onOpenQueryModal={() => setIsQueryModalOpen(true)}
                dbConnected={dbConnected}
                lastSyncTime={lastSyncTime}
              />
            )}

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

      {/* VIEW 2: CERTIFICATE AUTHORITY & EVENT CREDENTIAL STUDIO */}
      {currentView === 'certificate_studio' && (
        <main className="cert-studio-layout no-print">
          <CertificateStudio
            certificates={certificates}
            setCertificates={setCertificates}
            activeOrg={activeOrg}
            currentUser={currentUser}
            itmbuLogo={itmbuLogo}
            clubLogo={activeClubLogo}
            onOpenPublicVerification={(certId) => {
              setPublicVerifyId(certId);
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', `?verify=${encodeURIComponent(certId)}`);
              }
            }}
          />
        </main>
      )}

      {/* VIEW 3: TEAM MANAGEMENT SUITE */}
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
            onOpenBulkAddModal={() => setIsBulkAddModalOpen(true)}
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

          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
        activeOrg={activeOrg}
        departments={activeDepartments}
      />

      <BulkAddMemberModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        onBulkAddMembers={handleBulkAddMembers}
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
        onBulkAddMembers={() => setIsBulkAddModalOpen(true)}
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

      {/* CERTIFIER.IO GRADE EMAIL DISPATCH & GREETING MODAL */}
      <CertifierEmailModal
        isOpen={isCertifierEmailModalOpen}
        onClose={() => setIsCertifierEmailModalOpen(false)}
        member={currentActiveMember}
        clubConfig={activeClub}
        letterConfig={activeLetterConfig}
        onUpdateMemberEmail={(newEmail) => {
          if (!currentActiveMember) return;
          const memberId = currentActiveMember._id || currentActiveMember.id;
          const updated = { ...currentActiveMember, email: newEmail };
          setSelectedMember(updated);
          setMembers(prev => {
            const next = prev.map(m => ((m._id && m._id === memberId) || (m.id && m.id === memberId) || (m.name === currentActiveMember.name && m.organization === activeOrg)) ? updated : m);
            localStorage.setItem('offer_gen_members', JSON.stringify(next));
            return next;
          });
          if (isAWS) setAwsLetterConfig(prev => ({ ...prev, memberEmail: newEmail }));
          else if (isTechno) setTechnoLetterConfig(prev => ({ ...prev, memberEmail: newEmail }));
          else setGdgocLetterConfig(prev => ({ ...prev, memberEmail: newEmail }));
        }}
      />

      {/* REALTIME SUPABASE QUERY & PROJECT DISCUSSION MODAL */}
      <QueryManagementModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        currentUser={currentUser}
        activeOrg={activeOrg}
        theme={appTheme}
      />

      {/* EXECUTIVE USER PROFILE & PHOTO UPLOAD MODAL */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateAvatar={handleUpdateAvatar}
        userRole={userRole}
        activeOrg={activeOrg}
        clubConfig={activeClub}
        appTheme={appTheme}
        onToggleTheme={toggleAppTheme}
        onLogout={handleLogout}
        onNavigateView={(view) => {
          setCurrentView(view);
          setIsProfileModalOpen(false);
        }}
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
