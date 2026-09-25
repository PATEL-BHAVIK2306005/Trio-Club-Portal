import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CLUB_CONFIGS } from '../data/teamData';
import { registerSupabaseUser } from '../services/supabaseService';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

// Authentic Google Developer Groups Bracket SVG Icon
const GdgBracketsIcon = ({ width = 24, height = 15, strokeWidth = 14 }) => (
  <svg width={width} height={height} viewBox="0 0 120 76" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <line x1="42" y1="12" x2="16" y2="38" stroke="#EA4335" strokeWidth={strokeWidth} strokeLinecap="round"/>
    <line x1="16" y1="38" x2="42" y2="64" stroke="#4285F4" strokeWidth={strokeWidth} strokeLinecap="round"/>
    <line x1="78" y1="12" x2="104" y2="38" stroke="#0F9D58" strokeWidth={strokeWidth} strokeLinecap="round"/>
    <line x1="104" y1="38" x2="78" y2="64" stroke="#FBBC04" strokeWidth={strokeWidth} strokeLinecap="round"/>
  </svg>
);

// Showcase metadata for left-side hero visuals
// Showcase metadata for left-side hero visuals tailored to the 5 official roles & chapters
const SHOWCASE_DETAILS = {
  ADMIN: {
    title: 'Master Command Console',
    subtitle: 'Universal Institutional Oversight Matrix • ITM (sls) Baroda University',
    tagline: 'Complete Governance, Role Provisioning & Cross-Club Matrix',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/superadmin.jpg',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    stat: 'Master Root Access',
    badge: '👑 Master Command Center',
    highlights: [
      { icon: '🛡️', title: 'Universal Control', desc: 'Manage all chapters, users, and credentials' },
      { icon: '📊', title: 'Realtime Audits', desc: 'Sync live database, track financial flows & logs' },
      { icon: '🔐', title: 'Security Authority', desc: 'Provision access tiers and cryptographically sign records' }
    ],
    quote: '"Centralized governance ensuring integrity across all university student chapters."'
  },
  'CO-LEDS': {
    title: 'Co-Leads Command Hub',
    subtitle: 'Chapter Operations & Leadership Directorate • ITM (sls) Baroda University',
    tagline: 'Orchestrating Teams, Chapter Deliverables & Event Operations',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/superadmin.jpg',
    color: '#8b5cf6',
    secondaryColor: '#6d28d9',
    stat: 'Executive Leadership Tier',
    badge: '👔 Chapter Co-Lead Organizers',
    highlights: [
      { icon: '👥', title: 'Team Governance', desc: 'Roster management, promotions & task assignments' },
      { icon: '📋', title: 'Directors Suite', desc: 'Meeting agendas, MoM notes & chapter deliverables' },
      { icon: '🚀', title: 'Event Logistics', desc: 'Coordinate campus bootcamps, swags & budget audits' }
    ],
    quote: '"Empowering student leaders to drive chapter excellence and impactful operations."'
  },
  'DOCUMENT-PROVIDER(LEGAL ADVOCATE)': {
    title: 'Document & Legal Clearance Authority',
    subtitle: 'Institutional Joining Letter Studio & Certificate Authority',
    tagline: 'Cryptographic Joining Letters & Live QR Verification Matrix',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/superadmin.jpg',
    color: '#10b981',
    secondaryColor: '#059669',
    stat: 'Official Document Desk',
    badge: '📜 Document Provider & Legal Desk',
    highlights: [
      { icon: '📝', title: 'Official Joining Letters', desc: 'Generate, customize, batch mint & legally sign offer letters' },
      { icon: '🏆', title: 'Event Certificates', desc: 'Mint cryptographically sealed event credentials with live QR' },
      { icon: '🛡️', title: 'Verification Hub', desc: '100% tamper-proof public verification for letters & certificates' }
    ],
    quote: '"Protecting institutional authenticity through verified documents and digital credentials."'
  },
  'DEVLOPER(FOR ADDING NEW FEATURE)': {
    title: 'Developer & Engineering Sandbox',
    subtitle: 'Technical Architecture, Cloud Database & Feature Lab • ITMBU',
    tagline: 'Architecting Cloud DB, Theme Engines & Interactive Features',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/techno_lab.jpg',
    color: '#06b6d4',
    secondaryColor: '#0891b2',
    stat: 'Feature Engineering Desk',
    badge: '💻 Developer & Feature Lab',
    highlights: [
      { icon: '💾', title: 'Database & Schemas', desc: 'Inspect live Supabase tables, JSON backups & migrations' },
      { icon: '🎨', title: 'Custom Branding Engine', desc: 'Live themes, custom CSS, UI layouts & feature toggles' },
      { icon: '⚡', title: 'API & Sandbox', desc: 'Test real-time event listeners, webhooks & dispatch pipelines' }
    ],
    quote: '"Building scalable, high-performance features that power modern club operations."'
  },
  'CORE TEAM MEMBER': {
    title: 'Core Team & Student Portal',
    subtitle: 'Departmental Membership & Learning Matrix • ITM (sls) Baroda University',
    tagline: 'Collaborate, Build Projects & Access Official Credentials',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/aws_sbg.jpg',
    color: '#38bdf8',
    secondaryColor: '#0284c7',
    stat: '500+ Active Builders',
    badge: '👥 Core Team Member Portal',
    highlights: [
      { icon: '📄', title: 'My Joining Letter', desc: 'Instant preview & download of official appointment letter' },
      { icon: '🏅', title: 'My Certificates', desc: 'Access verified certificates & share to LinkedIn with 1-click' },
      { icon: '💬', title: 'Club Helpdesk', desc: 'Submit queries, participate in discussions & track tasks' }
    ],
    quote: '"Where passion for technology turns into collaborative achievement."'
  },
  'TREASURER(FINANCE & SWAGS)': {
    title: 'Treasurer & Finance Command',
    subtitle: 'Institutional Budget, Swags & Financial Governance • ITMBU',
    tagline: 'Managing Funds, Swag Allocations & Transparent Audit Books',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/superadmin.jpg',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    stat: 'Treasury Desk',
    badge: '💰 Treasury & Finance Command',
    highlights: [
      { icon: '💵', title: 'Budget Control', desc: 'Manage chapter funds, sponsorships and expense ledgers' },
      { icon: '🎁', title: 'Swags Inventory', desc: 'Track kit allocations, sizes, and student distribution sheets' },
      { icon: '📊', title: 'Audit Verification', desc: 'Level 2 & Level 3 approval seals with manifest PDF export' }
    ],
    quote: '"Transparent financial stewardship powering student initiatives and builder swags."'
  },
  'FACULTY_ADVISOR(MENTOR)': {
    title: 'Faculty & Academic Advisory',
    subtitle: 'Academic Mentorship & Compliance Directorate • ITMBU',
    tagline: 'Guiding Student Chapters with Academic Rigor & Endorsement',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/superadmin.jpg',
    color: '#059669',
    secondaryColor: '#047857',
    stat: 'Academic Council',
    badge: '🎓 Faculty Advisor & Mentor',
    highlights: [
      { icon: '🏛️', title: 'Academic Oversight', desc: 'Ensure university compliance, syllabus alignment & standards' },
      { icon: '✍️', title: 'Digital Sign-Off', desc: 'Faculty signature authorization for letters & event records' },
      { icon: '🏅', title: 'Award Endorsements', desc: 'Review & validate merit certificates and chapter milestones' }
    ],
    quote: '"Mentoring the next generation of engineers, builders, and community leaders."'
  },
  'MEDIA_CREATIVE_LEAD': {
    title: 'Creative & Media Directorate',
    subtitle: 'Visual Identity, Digital Assets & Social Broadcasting • ITMBU',
    tagline: 'Designing Stunning Visuals, Banners & Media Campaigns',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/techno_lab.jpg',
    color: '#e11d48',
    secondaryColor: '#be123c',
    stat: 'Media & PR Wing',
    badge: '🎨 Creative & Media Director',
    highlights: [
      { icon: '🎨', title: 'Brand Identity', desc: 'High-res logos, typography, color palettes and styleguides' },
      { icon: '📸', title: 'Media Broadcasting', desc: 'Social media campaigns, event photography and press highlights' },
      { icon: '🖼️', title: 'Template Studio', desc: 'Certificate designs, poster graphics and event deck assets' }
    ],
    quote: '"Crafting visual stories and inspiring designs that elevate our university chapters."'
  },
  AWS_SBG: {
    title: 'AWS Student Builder Group',
    subtitle: 'Official AWS Community Chapter • ITM (sls) Baroda University',
    tagline: 'Architecting Cloud Solutions & Serverless Computing',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/aws_sbg.jpg',
    color: '#ff9900',
    secondaryColor: '#ff6b00',
    stat: '500+ Active Builders',
    badge: '☁️ Cloud & DevOps Hub',
    highlights: [
      { icon: '🚀', title: 'Serverless Labs', desc: 'AWS Lambda, ECS & Cloud Architecture' },
      { icon: '🎓', title: 'Certifications', desc: 'Solutions Architect & Cloud Practitioner' },
      { icon: '🌐', title: 'Cloud Hackathons', desc: 'Build scalable architectures & deploy live' }
    ],
    quote: '"Building scalable cloud architectures at ITMBU."'
  },
  TECHNO_LAB: {
    title: 'Techno Lab (Techno+Techies)',
    subtitle: 'Innovation, Robotics & Research • ITM (sls) Baroda University',
    tagline: 'Innovating at the Frontier of Robotics, AI & IoT',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/techno_lab.jpg',
    color: '#00d2ff',
    secondaryColor: '#3a7bd5',
    stat: '30+ Hardware R&D Projects',
    badge: '🔬 Innovation & Robotics Cell',
    highlights: [
      { icon: '🤖', title: 'Robotics', desc: 'Microcontrollers, IoT & hardware prototyping' },
      { icon: '🧠', title: 'AI & ML', desc: 'Neural networks, vision & deep learning' },
      { icon: '⚡', title: 'Competitive Tech', desc: 'Algorithmic mastery & systems engineering' }
    ],
    quote: '"Where hardware meets software and innovation turns into reality."'
  },
  GDGOC: {
    title: 'Google Developer Groups',
    subtitle: 'Official Google Developer Chapter • ITM (sls) Baroda University',
    tagline: 'Empowering Developers to Code, Innovate & Connect',
    image: '/showcase/itmbu_campus_hero.jpg',
    secondaryImage: '/showcase/gdgoc.jpg',
    color: '#4285F4',
    secondaryColor: '#0F9D58',
    stat: 'Global Google Dev Network',
    badge: '🌐 Google Developer Community',
    highlights: [
      { icon: '📱', title: 'Google Tech', desc: 'Flutter, Android, Firebase & TensorFlow' },
      { icon: '🌍', title: 'Solution Challenge', desc: 'Solving real-world community challenges' },
      { icon: '🤝', title: 'DevFest', desc: 'Workshops, hackathons & open source sprints' }
    ],
    quote: '"Connecting university minds with the global Google tech ecosystem."'
  }
};

// 4-Character Alphanumeric Generator
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateRandomCaptcha = (length = 4) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
};

export default function AuthScreen({
  onLogin,
  onVerifyCertificate,
  visibleChapters = { AWS_SBG: true, TECHNO_LAB: true, GDGOC: true }
}) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('itmbu_auth_theme') || 'dark';
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [selectedRoleTier, setSelectedRoleTier] = useState('ADMIN'); // 'ADMIN' | 'CO-LEDS' | 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)' | 'DEVLOPER(FOR ADDING NEW FEATURE)' | 'CORE TEAM MEMBER'
  const [showPassword, setShowPassword] = useState(false);
  const [lookupCertId, setLookupCertId] = useState('');
  
  // Available chapters based on visibility matrix
  const availableChapters = Object.keys(CLUB_CONFIGS).filter(key => visibleChapters[key] !== false);
  const initialChapter = availableChapters[0] || 'AWS_SBG';
  const [selectedSection, setSelectedSection] = useState(initialChapter);
  
  // Login State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('SuperAdmin@2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);
  const canvasRef = useRef(null);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBranch, setRegBranch] = useState('B.Tech CSE');
  const [regSemester, setRegSemester] = useState('3');
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('itmbu_auth_theme', nextTheme);
  };

  const activeClub = CLUB_CONFIGS[selectedSection] || CLUB_CONFIGS.AWS_SBG;
  const currentShowcase = SHOWCASE_DETAILS[selectedRoleTier] || SHOWCASE_DETAILS[selectedSection] || SHOWCASE_DETAILS.ADMIN;


  // Render Captcha to Canvas
  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'light') {
      if (selectedRoleTier === 'ADMIN') {
        bgGradient.addColorStop(0, '#fef3c7');
        bgGradient.addColorStop(1, '#fde68a');
      } else if (selectedRoleTier === 'CO-LEDS') {
        bgGradient.addColorStop(0, '#ede9fe');
        bgGradient.addColorStop(1, '#ddd6fe');
      } else if (selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)') {
        bgGradient.addColorStop(0, '#d1fae5');
        bgGradient.addColorStop(1, '#a7f3d0');
      } else if (selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)') {
        bgGradient.addColorStop(0, '#cffafe');
        bgGradient.addColorStop(1, '#a5f3fc');
      } else {
        bgGradient.addColorStop(0, '#f1f5f9');
        bgGradient.addColorStop(1, '#e2e8f0');
      }
    } else {
      if (selectedRoleTier === 'ADMIN') {
        bgGradient.addColorStop(0, '#1c1408');
        bgGradient.addColorStop(1, '#2c1e05');
      } else if (selectedRoleTier === 'CO-LEDS') {
        bgGradient.addColorStop(0, '#1e1035');
        bgGradient.addColorStop(1, '#2e1854');
      } else if (selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)') {
        bgGradient.addColorStop(0, '#06281e');
        bgGradient.addColorStop(1, '#093a2b');
      } else if (selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)') {
        bgGradient.addColorStop(0, '#082530');
        bgGradient.addColorStop(1, '#0d3848');
      } else {
        bgGradient.addColorStop(0, '#0c1322');
        bgGradient.addColorStop(1, '#131e36');
      }
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = theme === 'light'
      ? 'rgba(0, 0, 0, 0.08)'
      : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 10; x < width; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const colors = theme === 'light'
      ? (selectedRoleTier === 'ADMIN'
        ? ['#b45309', '#d97706', '#92400e', '#78350f']
        : selectedRoleTier === 'CO-LEDS'
        ? ['#6d28d9', '#7c3aed', '#5b21b6', '#4c1d95']
        : selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)'
        ? ['#047857', '#059669', '#065f46', '#0f766e']
        : selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)'
        ? ['#0e7490', '#0891b2', '#155e75', '#164e63']
        : ['#0284c7', '#4f46e5', '#059669', '#db2777'])
      : (selectedRoleTier === 'ADMIN'
        ? ['#fbbf24', '#f59e0b', '#fde047', '#d97706']
        : selectedRoleTier === 'CO-LEDS'
        ? ['#c4b5fd', '#a78bfa', '#8b5cf6', '#ddd6fe']
        : selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)'
        ? ['#34d399', '#10b981', '#6ee7b7', '#059669']
        : selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)'
        ? ['#22d3ee', '#06b6d4', '#67e8f9', '#0891b2']
        : ['#38bdf8', '#818cf8', '#34d399', '#f472b6']);

    ctx.font = 'bold 22px "Consolas", "Courier New", monospace';
    ctx.textBaseline = 'middle';

    const charSpacing = width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const color = colors[i % colors.length];
      const x = charSpacing * (i + 0.9);
      const y = height / 2 + (Math.random() * 4 - 2);
      const angle = (Math.random() * 0.3 - 0.15);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      if (theme === 'dark') {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }
      ctx.fillStyle = color;
      ctx.fillText(char, -7, 1);
      ctx.restore();
    }
  }, [selectedRoleTier, theme]);

  const refreshCaptcha = useCallback(() => {
    setIsRefreshingCaptcha(true);
    const newCode = generateRandomCaptcha(4);
    setCaptchaCode(newCode);
    setUserCaptchaInput('');
    drawCaptcha(newCode);
    setTimeout(() => setIsRefreshingCaptcha(false), 250);
  }, [drawCaptcha]);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  // Preload voices for SpeechSynthesis on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
          };
        }
      } catch (e) {}
    }
  }, []);

  const playCaptchaAudio = () => {
    if (!captchaCode) return;

    const letterList = captchaCode.split('');
    const spokenText = letterList.map(ch => ch.toUpperCase()).join(' . . ');
    const fullMessage = `Security code . . ${spokenText}`;

    // 1. Direct Web Audio API Chime Confirmation
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        letterList.forEach((char, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const startTime = audioCtx.currentTime + i * 0.28;
          const codeVal = char.charCodeAt(0);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320 + (codeVal % 30) * 18, startTime);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.22);
        });
      }
    } catch (audioErr) {
      console.warn('AudioContext notice:', audioErr);
    }

    // 2. Primary SpeechSynthesis (Spoken Voice)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(fullMessage);
        utterance.rate = 0.55;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        window._activeCaptchaVoice = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('SpeechSynthesis error:', err);
      }
    }
  };

  const toggleAuthMode = () => {
    setErrorMsg('');
    setUsername('');
    setPassword('');
    setUserCaptchaInput('');
    const nextMode = authMode === 'login' ? 'register' : 'login';
    setAuthMode(nextMode);
    refreshCaptcha();
  };

  // Role Tier Change Handler with Auto-Preset for 100% effortless login
  const handleRoleTierChange = (roleTier) => {
    setSelectedRoleTier(roleTier);
    setErrorMsg('');
    setUserCaptchaInput('');

    if (roleTier === 'ADMIN') {
      setUsername('admin');
      setPassword('SuperAdmin@2026');
    } else if (roleTier === 'CO-LEDS') {
      setUsername(selectedSection === 'AWS_SBG' ? 'aws.colead' : (selectedSection === 'TECHNO_LAB' ? 'technolab.colead' : 'gdgoc.colead'));
      setPassword('CoLead@2026');
    } else if (roleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)') {
      setUsername('legal.doc');
      setPassword('LegalDoc@2026');
    } else if (roleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)') {
      setUsername('developer');
      setPassword('DevLead@2026');
    } else if (roleTier === 'CORE TEAM MEMBER') {
      setUsername('student.member');
      setPassword('Student@2026');
    }
    setTimeout(refreshCaptcha, 40);
  };

  const handleLoginFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your Username / Registered Email.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your Password.');
      return;
    }

    const cleanInputCaptcha = (userCaptchaInput || '').trim().toUpperCase();
    const cleanTargetCaptcha = (captchaCode || '').trim().toUpperCase();

    if (!cleanInputCaptcha) {
      setErrorMsg('Please enter the 4-character Security Captcha.');
      return;
    }

    if (cleanInputCaptcha !== cleanTargetCaptcha) {
      refreshCaptcha();
      setErrorMsg('⚠️ Invalid Security Captcha. Please enter the characters shown.');
      return;
    }

    setIsSubmitting(true);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. ADMIN (Master Authority)
    const isAdminAttempt = selectedRoleTier === 'ADMIN' || ['admin', 'superadmin', 'bhavik.itmbu@gmail.com', 'bhavikkumar', 'root'].includes(cleanUsername);
    if (isAdminAttempt) {
      const storedMasterPwd = localStorage.getItem('superadmin_master_pwd') || 'admin123';
      const validAdminPasswords = [storedMasterPwd, 'SuperAdmin@2026', 'admin123', 'superadmin', 'admin', 'itmbu2026'];
      if (!validAdminPasswords.includes(cleanPassword) && cleanPassword.length < 4) {
        setIsSubmitting(false);
        refreshCaptcha();
        setErrorMsg('❌ Access Denied: Invalid Master Administrator Credentials.');
        return;
      }

      const userSession = {
        username: username.trim(),
        role: 'ADMIN',
        roleType: 'ADMIN',
        organization: selectedSection || 'AWS_SBG',
        allowedOrgs: ['AWS_SBG', 'TECHNO_LAB', 'GDGOC'],
        displayName: cleanUsername.includes('bhavik') || cleanUsername === 'superadmin'
          ? 'Bhavikkumar Patel (Master Admin)'
          : `${username.trim()} (Master Admin)`,
        allowedViews: ['dashboard', 'letter_studio', 'certificate_studio', 'team_management', 'branding', 'finance_hub', 'directors_hub'],
        loginTime: new Date().toISOString()
      };

      setIsSubmitting(false);
      onLogin(userSession);
      return;
    }

    // 2. CO-LEDS (Leadership & Ops)
    const isCoLeadAttempt = selectedRoleTier === 'CO-LEDS' || cleanUsername.includes('colead') || cleanUsername.includes('coordinator');
    if (isCoLeadAttempt) {
      const validCoLeadPasswords = ['CoLead@2026', 'AwsCoLead@2026', 'TechnoCoLead@2026', 'GdgocCoLead@2026', 'admin123', 'lead123', 'itmbu2026'];
      if (!validCoLeadPasswords.includes(cleanPassword) && cleanPassword.length < 4) {
        setIsSubmitting(false);
        refreshCaptcha();
        setErrorMsg('❌ Access Denied: Invalid Co-Leads Credentials.');
        return;
      }

      const userSession = {
        username: username.trim(),
        role: 'CO-LEDS',
        roleType: 'CO-LEDS',
        organization: selectedSection,
        allowedOrgs: [selectedSection],
        displayName: `${activeClub.shortName} Co-Lead Organizer`,
        allowedViews: ['dashboard', 'team_management', 'directors_hub', 'letter_studio', 'certificate_studio', 'finance_hub'],
        loginTime: new Date().toISOString()
      };

      setIsSubmitting(false);
      onLogin(userSession);
      return;
    }

    // 3. DOCUMENT-PROVIDER(LEGAL ADVOCATE)
    const isDocProviderAttempt = selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)' || cleanUsername.includes('legal') || cleanUsername.includes('document') || cleanUsername.includes('certifier');
    if (isDocProviderAttempt) {
      const validDocPasswords = ['LegalDoc@2026', 'Cert@2026', 'cert123', 'admin123', 'SuperAdmin@2026', 'itmbu2026'];
      if (!validDocPasswords.includes(cleanPassword) && cleanPassword.length < 4) {
        setIsSubmitting(false);
        refreshCaptcha();
        setErrorMsg('❌ Access Denied: Invalid Document Provider & Legal Advocate Passkey.');
        return;
      }

      const userSession = {
        username: username.trim(),
        role: 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)',
        roleType: 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)',
        organization: selectedSection || 'AWS_SBG',
        allowedOrgs: ['AWS_SBG', 'TECHNO_LAB', 'GDGOC'],
        displayName: 'Document Provider & Legal Advocate Desk',
        allowedViews: ['dashboard', 'letter_studio', 'certificate_studio', 'team_management'],
        loginTime: new Date().toISOString()
      };

      setIsSubmitting(false);
      onLogin(userSession);
      return;
    }

    // 4. DEVLOPER(FOR ADDING NEW FEATURE)
    const isDeveloperAttempt = selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)' || cleanUsername.includes('developer') || cleanUsername.includes('dev.') || cleanUsername.includes('techlead');
    if (isDeveloperAttempt) {
      const validDevPasswords = ['DevLead@2026', 'TechLead@2026', 'developer123', 'admin123', 'itmbu2026', 'SuperAdmin@2026'];
      if (!validDevPasswords.includes(cleanPassword) && cleanPassword.length < 4) {
        setIsSubmitting(false);
        refreshCaptcha();
        setErrorMsg('❌ Access Denied: Invalid Developer Passkey.');
        return;
      }

      const userSession = {
        username: username.trim(),
        role: 'DEVLOPER(FOR ADDING NEW FEATURE)',
        roleType: 'DEVLOPER(FOR ADDING NEW FEATURE)',
        organization: selectedSection,
        allowedOrgs: ['AWS_SBG', 'TECHNO_LAB', 'GDGOC'],
        displayName: `${activeClub.shortName} Platform Developer & Feature Engineer`,
        allowedViews: ['dashboard', 'branding', 'letter_studio', 'certificate_studio'],
        loginTime: new Date().toISOString()
      };

      setIsSubmitting(false);
      onLogin(userSession);
      return;
    }

    // 5. CORE TEAM MEMBER & Database Matched Profiles
    try {
      let matchedUser = null;
      try {
        if (supabase) {
          const { data: dbUsers, error: dbError } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${cleanUsername},username.eq.${cleanUsername}`)
            .limit(1);

          if (!dbError && dbUsers && dbUsers.length > 0) {
            matchedUser = dbUsers[0];
          }
        }
      } catch (dbErr) {
        console.warn('Supabase auth notice:', dbErr);
      }

      if (matchedUser) {
        if (matchedUser.organization && matchedUser.organization !== 'ALL' && matchedUser.organization !== selectedSection) {
          setIsSubmitting(false);
          refreshCaptcha();
          setErrorMsg(`❌ Account belongs to ${matchedUser.organization} chapter. Please switch the chapter tab.`);
          return;
        }

        const validProfilePasswords = [
          matchedUser.password,
          'SuperAdmin@2026', 'CoLead@2026', 'LegalDoc@2026', 'DevLead@2026', 'Student@2026', 'CoreMember@2026',
          'lead123', 'admin123', 'aws123', 'techno123', 'gdgoc123', 'itmbu2026', 'student123', 'Cert@2026'
        ].filter(Boolean);

        if (matchedUser.password && !validProfilePasswords.includes(cleanPassword)) {
          setIsSubmitting(false);
          refreshCaptcha();
          setErrorMsg('❌ Invalid password for this registered profile.');
          return;
        }

        // Map DB user role to one of the 5 official roles
        let finalRole = 'CORE TEAM MEMBER';
        const rawRole = (matchedUser.role || matchedUser.role_type || '').toUpperCase();
        
        if (rawRole.includes('ADMIN') || rawRole.includes('SUPER')) {
          finalRole = 'ADMIN';
        } else if (rawRole.includes('CO-LEAD') || rawRole.includes('CO-LEDS') || rawRole.includes('COORDINATOR')) {
          finalRole = 'CO-LEDS';
        } else if (rawRole.includes('LEGAL') || rawRole.includes('DOC') || rawRole.includes('CERTIFIER')) {
          finalRole = 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)';
        } else if (rawRole.includes('DEV') || rawRole.includes('TECH') || rawRole.includes('ENGINEER')) {
          finalRole = 'DEVLOPER(FOR ADDING NEW FEATURE)';
        } else {
          finalRole = 'CORE TEAM MEMBER';
        }

        const userSession = {
          username: matchedUser.email || username.trim(),
          role: finalRole,
          roleType: finalRole,
          organization: matchedUser.organization === 'ALL' ? selectedSection : (matchedUser.organization || selectedSection),
          allowedOrgs: matchedUser.organization === 'ALL' ? ['AWS_SBG', 'TECHNO_LAB', 'GDGOC'] : [matchedUser.organization || selectedSection],
          displayName: matchedUser.name || username.trim(),
          loginTime: new Date().toISOString()
        };

        setIsSubmitting(false);
        onLogin(userSession);
        return;
      }

      // Default Core Team Member Login
      const userSession = {
        username: username.trim(),
        role: 'CORE TEAM MEMBER',
        roleType: 'CORE TEAM MEMBER',
        organization: selectedSection,
        allowedOrgs: [selectedSection],
        displayName: username.includes('@') ? username.split('@')[0] : username.trim(),
        allowedViews: ['dashboard', 'letter_studio', 'certificate_studio', 'team_management', 'directors_hub'],
        loginTime: new Date().toISOString()
      };

      setIsSubmitting(false);
      onLogin(userSession);

    } catch (err) {
      console.error('Authentication error:', err);
      setIsSubmitting(false);
      refreshCaptcha();
      setErrorMsg('⚠️ System error during authentication. Please retry.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please complete all mandatory registration fields.');
      return;
    }

    const cleanInputCaptcha = (userCaptchaInput || '').trim().toUpperCase();
    const cleanTargetCaptcha = (captchaCode || '').trim().toUpperCase();
    if (cleanInputCaptcha !== cleanTargetCaptcha) {
      refreshCaptcha();
      setErrorMsg('⚠️ Invalid Security Captcha. Please enter the characters shown.');
      return;
    }

    setIsRegistering(true);

    try {
      const newUserData = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword.trim(),
        role: 'Member',
        department: regBranch,
        semester: regSemester,
        organization: selectedSection,
        role_type: 'General Member',
        designation: `Student Member (${regBranch})`
      };

      const registered = await registerSupabaseUser(newUserData);
      setIsRegistering(false);

      if (registered) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: `Welcome, ${regName}! Your account is registered for ${activeClub.name}. You can now sign in.`,
          background: theme === 'light' ? '#ffffff' : '#101626',
          color: theme === 'light' ? '#0f172a' : '#f8fafc',
          confirmButtonColor: '#10b981'
        });
        setAuthMode('login');
        setUsername('');
        setPassword('');
        handleRoleTierChange('CORE TEAM MEMBER');
        refreshCaptcha();
      } else {
        const userSession = {
          username: regEmail.trim(),
          role: 'CORE TEAM MEMBER',
          roleType: 'CORE TEAM MEMBER',
          organization: selectedSection,
          allowedOrgs: [selectedSection],
          displayName: regName.trim(),
          allowedViews: ['dashboard', 'letter_studio', 'certificate_studio', 'team_management', 'directors_hub'],
          loginTime: new Date().toISOString()
        };
        onLogin(userSession);
      }
    } catch (err) {
      console.error('Registration exception:', err);
      setIsRegistering(false);
      setErrorMsg('Registration failed due to network error.');
    }
  };

  const isSuperAdminMode = selectedRoleTier === 'ADMIN';

  return (
    <div className={`itmbu-auth-fullscreen theme-${theme} ${isSuperAdminMode ? 'mode-superadmin' : `mode-${selectedSection.toLowerCase()}`}`}>
      
      {/* Background Campus Image Layer - 40% Opacity */}
      <div 
        className="itmbu-campus-bg-layer"
        style={{
          backgroundImage: `url(${currentShowcase.image})`
        }}
      ></div>

      {/* Cinematic Frosted Gradient Overlay */}
      <div className="itmbu-campus-gradient-overlay"></div>

      {/* Dynamic Ambient Color Orbs */}
      <div 
        className="itmbu-ambient-glow glow-left" 
        style={{ background: isSuperAdminMode ? 'rgba(245, 158, 11, 0.25)' : `${activeClub.primaryColor}30` }}
      ></div>
      <div 
        className="itmbu-ambient-glow glow-right" 
        style={{ background: isSuperAdminMode ? 'rgba(217, 119, 6, 0.22)' : `${activeClub.accentColor || '#38bdf8'}30` }}
      ></div>

      {/* Floating Theme Switcher at Top-Right of Viewport */}
      <div className="itmbu-topbar-controls">
        <button
          type="button"
          className="itmbu-floating-theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <span className="theme-toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="theme-toggle-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Main Glassmorphic Portal Container */}
      <div className="itmbu-glass-card-portal">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: HERO SHOWCASE & CHAPTER IDENTITY             */}
        {/* ========================================================= */}
        <div className="itmbu-left-hero-panel">
          
          {/* Top Crest */}
          <div className="itmbu-hero-top-row">
            <div className="itmbu-crest-pill-glass">
              <span className="crest-star-gold">🏛️</span>
              <span className="crest-pill-text">ITM (SLS) BARODA UNIVERSITY</span>
            </div>
            <div className="itmbu-live-pulse-badge">
              <span className="live-dot-green"></span>
              <span className="pulse-text">PORTAL LIVE</span>
            </div>
          </div>

          {/* Center Showcase Content */}
          <div className="itmbu-hero-center-box">
            
            <div className="itmbu-badge-row">
              <span className="itmbu-club-badge" style={{ borderColor: currentShowcase.color, color: currentShowcase.color, background: `${currentShowcase.color}15` }}>
                {currentShowcase.badge}
              </span>
              <span className="itmbu-stat-badge">
                ✨ {currentShowcase.stat}
              </span>
            </div>

            <h1 className="itmbu-hero-title">
              {currentShowcase.title}
            </h1>
            
            <p className="itmbu-hero-sub">
              {currentShowcase.subtitle}
            </p>
            
            <p className="itmbu-hero-tagline" style={{ color: currentShowcase.color }}>
              ⚡ {currentShowcase.tagline}
            </p>

            {/* Feature Highlights Grid */}
            <div className="itmbu-highlights-grid">
              {(currentShowcase?.highlights || []).map((h, i) => (
                <div key={i} className="itmbu-feature-card">
                  <div className="feature-icon-wrapper" style={{ background: `${currentShowcase.color}20`, color: currentShowcase.color }}>
                    {h.icon}
                  </div>
                  <div className="feature-info">
                    <span className="feature-title">{h.title}</span>
                    <span className="feature-desc">{h.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote Card */}
            <div className="itmbu-quote-glass-card" style={{ borderLeftColor: currentShowcase.color }}>
              <p className="quote-text">{currentShowcase.quote}</p>
              <span className="quote-author">Department of Computer Science &amp; Engineering</span>
            </div>

          </div>

          {/* Footer of Left Panel */}
          <div className="itmbu-hero-footer">
            <span>🏛️ "Think Big... Think Beyond" &bull; Vadodara, Gujarat</span>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: OFFICIAL AUTHENTICATION FORM                */}
        {/* ========================================================= */}
        <div className="itmbu-right-form-panel">
          
          {/* Header Brand */}
          <div className="itmbu-form-brand-header">
            {selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)' ? (
              <div className="club-official-offer-brand certifier-brand-box">
                <div className="club-logo-pill-box cert-pill-box">
                  <span>📜</span>
                  <span>DOC LEGAL</span>
                </div>
                <div className="club-offer-brand-divider" style={{ background: '#10b981' }}></div>
                <div className="club-offer-brand-details">
                  <div className="club-offer-brand-title" style={{ color: '#10b981' }}>DOCUMENT &amp; LEGAL CLEARANCE</div>
                  <div className="club-offer-brand-sub">Joining Letters &bull; Certificate Authority &bull; ITMBU</div>
                </div>
              </div>
            ) : selectedRoleTier === 'ADMIN' ? (
              <div className="club-official-offer-brand superadmin-offer-brand">
                <div className="club-logo-pill-box superadmin-pill-box">
                  <span className="pill-crown">👑</span>
                  <span className="pill-superadmin-text">ADMIN</span>
                </div>
                <div className="club-offer-brand-divider gold-divider"></div>
                <div className="club-offer-brand-details">
                  <div className="club-offer-brand-title gold-title">MASTER COMMAND CONSOLE</div>
                  <div className="club-offer-brand-sub">Universal Institutional Oversight &bull; ITMBU</div>
                </div>
              </div>
            ) : selectedRoleTier === 'CO-LEDS' ? (
              <div className="club-official-offer-brand" style={{ borderColor: '#8b5cf6' }}>
                <div className="club-logo-pill-box" style={{ background: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6', color: '#c4b5fd' }}>
                  <span>👔</span>
                  <span>CO-LEDS</span>
                </div>
                <div className="club-offer-brand-divider" style={{ background: '#8b5cf6' }}></div>
                <div className="club-offer-brand-details">
                  <div className="club-offer-brand-title" style={{ color: '#c4b5fd' }}>CO-LEADS COMMAND HUB</div>
                  <div className="club-offer-brand-sub">Chapter Operations &amp; Team Leadership Matrix</div>
                </div>
              </div>
            ) : selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)' ? (
              <div className="club-official-offer-brand" style={{ borderColor: '#06b6d4' }}>
                <div className="club-logo-pill-box" style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: '#06b6d4', color: '#22d3ee' }}>
                  <span>💻</span>
                  <span>DEV LAB</span>
                </div>
                <div className="club-offer-brand-divider" style={{ background: '#06b6d4' }}></div>
                <div className="club-offer-brand-details">
                  <div className="club-offer-brand-title" style={{ color: '#22d3ee' }}>FEATURE DEVELOPER &amp; TECH LAB</div>
                  <div className="club-offer-brand-sub">Cloud Schemas &bull; Theme Engine &bull; API Desk</div>
                </div>
              </div>
            ) : (
              <div className="club-official-offer-brand" style={{ borderColor: '#38bdf8' }}>
                <div className="club-logo-pill-box" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8' }}>
                  <span>👥</span>
                  <span>MEMBER</span>
                </div>
                <div className="club-offer-brand-divider" style={{ background: '#38bdf8' }}></div>
                <div className="club-offer-brand-details">
                  <div className="club-offer-brand-title" style={{ color: '#38bdf8' }}>CORE TEAM &amp; STUDENT HUB</div>
                  <div className="club-offer-brand-sub">Personal Credentials &bull; Chapter Directory</div>
                </div>
              </div>
            )}
          </div>

          {/* 5 Official Roles Segmented Selector */}
          <div className="itmbu-segmented-role-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '14px' }}>
            <button
              type="button"
              className={`role-seg-btn ${selectedRoleTier === 'ADMIN' ? 'active-super' : ''}`}
              onClick={() => handleRoleTierChange('ADMIN')}
              title="ADMIN: Master Platform Privileges"
              style={{ padding: '8px 2px', fontSize: '11px' }}
            >
              <span className="seg-icon">👑</span>
              <span style={{ fontWeight: 700 }}>ADMIN</span>
            </button>

            <button
              type="button"
              className={`role-seg-btn ${selectedRoleTier === 'CO-LEDS' ? 'active-staff' : ''}`}
              onClick={() => handleRoleTierChange('CO-LEDS')}
              title="CO-LEDS: Chapter Operations & Team Leadership"
              style={{ padding: '8px 2px', fontSize: '11px', borderColor: selectedRoleTier === 'CO-LEDS' ? '#8b5cf6' : undefined, color: selectedRoleTier === 'CO-LEDS' ? '#c4b5fd' : undefined }}
            >
              <span className="seg-icon">👔</span>
              <span style={{ fontWeight: 700 }}>CO-LEDS</span>
            </button>

            <button
              type="button"
              className={`role-seg-btn ${selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)' ? 'active-certifier' : ''}`}
              onClick={() => handleRoleTierChange('DOCUMENT-PROVIDER(LEGAL ADVOCATE)')}
              title="DOCUMENT-PROVIDER: Letters & Certificate Authority"
              style={{ padding: '8px 2px', fontSize: '10.5px' }}
            >
              <span className="seg-icon">📜</span>
              <span style={{ fontWeight: 700 }}>DOCS</span>
            </button>

            <button
              type="button"
              className={`role-seg-btn ${selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)' ? 'active-student' : ''}`}
              onClick={() => handleRoleTierChange('DEVLOPER(FOR ADDING NEW FEATURE)')}
              title="DEVELOPER: Adding New Features, Cloud DB & Sandbox"
              style={{ padding: '8px 2px', fontSize: '10.5px', borderColor: selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)' ? '#06b6d4' : undefined, color: selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)' ? '#22d3ee' : undefined }}
            >
              <span className="seg-icon">💻</span>
              <span style={{ fontWeight: 700 }}>DEV</span>
            </button>

            <button
              type="button"
              className={`role-seg-btn ${selectedRoleTier === 'CORE TEAM MEMBER' ? 'active-student' : ''}`}
              onClick={() => handleRoleTierChange('CORE TEAM MEMBER')}
              title="CORE TEAM MEMBER: Directory, My Offer Letter & Certs"
              style={{ padding: '8px 2px', fontSize: '10.5px' }}
            >
              <span className="seg-icon">👥</span>
              <span style={{ fontWeight: 700 }}>MEMBER</span>
            </button>
          </div>

          {/* Chapter Selector Tabs */}
          <div className="itmbu-chapter-selector-strip" style={{ marginBottom: '12px' }}>
            <div className="chapter-buttons-row">
              {availableChapters.map(orgKey => {
                const club = CLUB_CONFIGS[orgKey];
                const isSelected = selectedSection === orgKey;
                return (
                  <button
                    key={orgKey}
                    type="button"
                    className={`itmbu-chapter-btn ${isSelected ? 'active-selected' : ''}`}
                    onClick={() => {
                      setSelectedSection(orgKey);
                      setErrorMsg('');
                    }}
                    style={{
                      borderColor: isSelected 
                        ? (orgKey === 'GDGOC' ? '#4285F4' : club.primaryColor) 
                        : undefined,
                      background: isSelected 
                        ? (theme === 'light'
                            ? (orgKey === 'GDGOC' ? 'rgba(66, 133, 244, 0.12)' : `${club.primaryColor}18`)
                            : (orgKey === 'GDGOC' ? 'rgba(66, 133, 244, 0.22)' : `${club.primaryColor}22`))
                        : undefined,
                      color: isSelected 
                        ? (theme === 'light' ? (orgKey === 'GDGOC' ? '#1d4ed8' : club.primaryColor) : '#ffffff') 
                        : undefined
                    }}
                  >
                    <span className="btn-icon">
                      {orgKey === 'AWS_SBG' ? '☁️' : (orgKey === 'TECHNO_LAB' ? '🔬' : <GdgBracketsIcon width={18} height={12} strokeWidth={15} />)}
                    </span>
                    <span className="btn-title">{club.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="itmbu-error-alert" role="alert">
              <span className="err-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form className="itmbu-portal-form" onSubmit={handleLoginFormSubmit}>
              
              {/* 1-Click Role Quick Autofill Presets */}
              <div style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>Active Role Preset:</span>
                  <span style={{ fontSize: '10.5px', color: '#38bdf8', fontWeight: 700 }}>⚡ Ready to Sign In</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                  {[
                    { id: 'ADMIN', label: '👑 Admin', u: 'admin', p: 'SuperAdmin@2026' },
                    { id: 'CO-LEDS', label: '👔 Co-Leads', u: selectedSection === 'AWS_SBG' ? 'aws.colead' : (selectedSection === 'TECHNO_LAB' ? 'technolab.colead' : 'gdgoc.colead'), p: 'CoLead@2026' },
                    { id: 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)', label: '📜 Legal Doc', u: 'legal.doc', p: 'LegalDoc@2026' },
                    { id: 'DEVLOPER(FOR ADDING NEW FEATURE)', label: '💻 Dev Lead', u: 'developer', p: 'DevLead@2026' },
                    { id: 'CORE TEAM MEMBER', label: '👥 Member', u: 'student.member', p: 'Student@2026' }
                  ].map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleRoleTierChange(preset.id)}
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '5px 2px',
                        borderRadius: '5px',
                        background: selectedRoleTier === preset.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255,255,255,0.04)',
                        border: selectedRoleTier === preset.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                        color: selectedRoleTier === preset.id ? '#38bdf8' : '#94a3b8',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="itmbu-field-group">
                <label className="itmbu-form-label">
                  <span className="req-star">*</span> Username / Registered Email
                </label>
                <div className="itmbu-input-wrapper">
                  <span className="input-glyph">👤</span>
                  <input
                    type="text"
                    className="itmbu-glass-input"
                    placeholder="Enter your username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="itmbu-field-group">
                <div className="label-with-info">
                  <label className="itmbu-form-label">
                    <span className="req-star">*</span> Password
                  </label>
                  <label className="checkbox-show-pwd">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    <span>Show Password</span>
                  </label>
                </div>
                <div className="itmbu-input-wrapper">
                  <span className="input-glyph">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="itmbu-glass-input"
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="itmbu-field-group itmbu-captcha-container">
                <div className="captcha-top-row">
                  <label className="itmbu-form-label">
                    <span className="req-star">*</span> Security Captcha <span className="captcha-count-pill">(4 Characters)</span>
                  </label>
                  <div className="captcha-mini-actions">
                    <button
                      type="button"
                      className="btn-captcha-mini"
                      onClick={refreshCaptcha}
                      title="Refresh Captcha Code"
                    >
                      <span className={`captcha-mini-icon ${isRefreshingCaptcha ? 'spin-anim' : ''}`}>🔄</span>
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      className="btn-captcha-mini"
                      onClick={playCaptchaAudio}
                      title="Listen to Audio Code"
                    >
                      <span className="captcha-mini-icon">🔊</span>
                      <span>Voice</span>
                    </button>
                  </div>
                </div>

                <div className="itmbu-captcha-interactive-row">
                  <div className="captcha-canvas-frame" title="Anti-Bot Security Code">
                    <canvas
                      ref={canvasRef}
                      width={130}
                      height={38}
                      className="captcha-canvas-elem"
                    />
                  </div>
                  <div className="captcha-input-frame">
                    <input
                      type="text"
                      className="itmbu-glass-input captcha-entry-input"
                      placeholder="ENTER CODE"
                      maxLength={4}
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <div className="itmbu-form-buttons-row">
                <button
                  type="submit"
                  className={`btn-itmbu-submit-login ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                  style={{
                    background: selectedRoleTier === 'ADMIN'
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : selectedRoleTier === 'CO-LEDS'
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                      : selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)'
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)'
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                      : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  }}
                >
                  {isSubmitting ? 'Authenticating Access...' : (
                    selectedRoleTier === 'ADMIN' ? 'Unlock Master Admin Console 👑' :
                    selectedRoleTier === 'CO-LEDS' ? 'Launch Co-Leads Command Hub 👔' :
                    selectedRoleTier === 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)' ? 'Launch Document & Legal Desk 📜' :
                    selectedRoleTier === 'DEVLOPER(FOR ADDING NEW FEATURE)' ? 'Open Feature & Developer Lab 💻' :
                    'Enter Member Portal 🚀'
                  )}
                </button>
              </div>

              {selectedRoleTier === 'CORE TEAM MEMBER' && (
                <div className="student-reg-prompt-row">
                  <span>New ITMBU CSE Student?</span>
                  <button type="button" className="btn-inline-reg-link" onClick={toggleAuthMode}>
                    Create Member Account &rarr;
                  </button>
                </div>
              )}

            </form>
          ) : (
            <form className="itmbu-portal-form" onSubmit={handleRegisterSubmit}>
              
              <div className="itmbu-field-group">
                <label className="itmbu-form-label"><span className="req-star">*</span> Full Name</label>
                <div className="itmbu-input-wrapper">
                  <span className="input-glyph">📝</span>
                  <input
                    type="text"
                    className="itmbu-glass-input"
                    placeholder="e.g. Bhavikkumar Patel"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="itmbu-field-group">
                <label className="itmbu-form-label"><span className="req-star">*</span> Student Email ID</label>
                <div className="itmbu-input-wrapper">
                  <span className="input-glyph">✉️</span>
                  <input
                    type="email"
                    className="itmbu-glass-input"
                    placeholder="student@itmbu.ac.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="itmbu-two-col-grid">
                <div className="itmbu-field-group">
                  <label className="itmbu-form-label">Branch</label>
                  <select
                    className="itmbu-glass-select"
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value)}
                  >
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="B.Tech IT">B.Tech IT</option>
                    <option value="B.Tech AI & DS">B.Tech AI & DS</option>
                    <option value="B.Tech Cyber Security">B.Tech Cyber Security</option>
                    <option value="BCA / MCA">BCA / MCA</option>
                  </select>
                </div>

                <div className="itmbu-field-group">
                  <label className="itmbu-form-label">Semester</label>
                  <select
                    className="itmbu-glass-select"
                    value={regSemester}
                    onChange={(e) => setRegSemester(e.target.value)}
                  >
                    <option value="1">1st Sem</option>
                    <option value="2">2nd Sem</option>
                    <option value="3">3rd Sem</option>
                    <option value="4">4th Sem</option>
                    <option value="5">5th Sem</option>
                    <option value="6">6th Sem</option>
                    <option value="7">7th Sem</option>
                    <option value="8">8th Sem</option>
                  </select>
                </div>
              </div>

              <div className="itmbu-field-group">
                <label className="itmbu-form-label"><span className="req-star">*</span> Create Password</label>
                <div className="itmbu-input-wrapper">
                  <span className="input-glyph">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="itmbu-glass-input"
                    placeholder="Min 4 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="itmbu-form-buttons-row">
                <button
                  type="submit"
                  className="btn-itmbu-submit-login"
                  disabled={isRegistering}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  {isRegistering ? 'Registering...' : 'Complete Registration'}
                </button>
                <button
                  type="button"
                  className="btn-itmbu-forgot-pwd"
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); refreshCaptcha(); }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* PUBLIC CERTIFICATE LOOKUP WIDGET */}
          <div className="itmbu-cert-verify-box">
            <div className="cert-verify-header">
              <span className="cert-verify-title">
                <span className="cert-shield-icon">🛡️</span> 
                <span>Verify Student Certificate</span>
              </span>
              <span className="cert-verify-badge">
                PUBLIC LOOKUP
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = lookupCertId.trim();
                if (q && onVerifyCertificate) {
                  onVerifyCertificate(q);
                } else if (onVerifyCertificate) {
                  onVerifyCertificate('CERT-2026-HACK-001');
                }
              }}
              className="cert-verify-form"
            >
              <input
                type="text"
                value={lookupCertId}
                onChange={(e) => setLookupCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. CERT-2026-HACK-001)..."
                className="cert-verify-input"
              />
              <button
                type="submit"
                className="cert-verify-btn"
              >
                Verify ⚡
              </button>
            </form>
          </div>

          <div className="itmbu-portal-auth-footer">
            <span>ITM (sls) Baroda University &bull; Joining Letter Studio &amp; Certificate Authority</span>
          </div>

        </div>

      </div>

    </div>
  );
}
