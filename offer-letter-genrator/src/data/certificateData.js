// Ultra-Modern Certificate Registry, Templates & Event Configurations
export const CERTIFICATE_THEMES = {
  GOLD_NAVY: {
    id: 'GOLD_NAVY',
    name: 'Imperial Royal Gold & Navy',
    description: 'Timeless luxury with 24K gold accents and academic prestige',
    bgGradient: 'linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #080d19 100%)',
    cardBg: '#0f172a',
    accentColor: '#f59e0b',
    accentSecondary: '#fbbf24',
    textColor: '#f8fafc',
    mutedText: '#94a3b8',
    borderColor: '#d97706',
    borderStyle: 'double 4px #f59e0b',
    badgeGradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    sealColor: '#f59e0b',
    watermark: 'rgba(245, 158, 11, 0.04)',
    cornerDeco: 'gold'
  },
  OBSIDIAN_NEON: {
    id: 'OBSIDIAN_NEON',
    name: 'Obsidian Cyber Neon',
    description: 'Ultra-modern dark aesthetic with electric cyan & violet glows',
    bgGradient: 'linear-gradient(135deg, #050508 0%, #0c0f1d 50%, #070913 100%)',
    cardBg: '#0b0f19',
    accentColor: '#00f2fe',
    accentSecondary: '#4facfe',
    textColor: '#ffffff',
    mutedText: '#8ca3c7',
    borderColor: '#00f2fe',
    borderStyle: 'solid 2px #00f2fe',
    badgeGradient: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    sealColor: '#00f2fe',
    watermark: 'rgba(0, 242, 254, 0.05)',
    cornerDeco: 'cyan'
  },
  EMERALD_PRESTIGE: {
    id: 'EMERALD_PRESTIGE',
    name: 'Emerald Prestige Modern',
    description: 'Sophisticated botanical emerald with radiant platinum highlights',
    bgGradient: 'linear-gradient(135deg, #031811 0%, #062b1e 50%, #02140d 100%)',
    cardBg: '#062b1e',
    accentColor: '#10b981',
    accentSecondary: '#34d399',
    textColor: '#f0fdf4',
    mutedText: '#a7f3d0',
    borderColor: '#059669',
    borderStyle: 'solid 3px #10b981',
    badgeGradient: 'linear-gradient(135deg, #34d399, #059669)',
    sealColor: '#10b981',
    watermark: 'rgba(16, 185, 129, 0.05)',
    cornerDeco: 'emerald'
  },
  COSMIC_VIOLET: {
    id: 'COSMIC_VIOLET',
    name: 'Cosmic Violet Glass',
    description: 'Futuristic purple-indigo gradient crafted for hackathon champions',
    bgGradient: 'linear-gradient(135deg, #0d061f 0%, #1a0f35 50%, #090317 100%)',
    cardBg: '#160d2e',
    accentColor: '#a855f7',
    accentSecondary: '#c084fc',
    textColor: '#faf5ff',
    mutedText: '#d8b4fe',
    borderColor: '#9333ea',
    borderStyle: 'solid 3px #a855f7',
    badgeGradient: 'linear-gradient(135deg, #c084fc, #9333ea)',
    sealColor: '#c084fc',
    watermark: 'rgba(168, 85, 247, 0.06)',
    cornerDeco: 'purple'
  },
  SWISS_MINIMAL: {
    id: 'SWISS_MINIMAL',
    name: 'Swiss Executive Light',
    description: 'Crisp, high-contrast monochrome design with refined editorial hierarchy',
    bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
    cardBg: '#ffffff',
    accentColor: '#0284c7',
    accentSecondary: '#0f172a',
    textColor: '#0f172a',
    mutedText: '#475569',
    borderColor: '#0284c7',
    borderStyle: 'solid 2px #0f172a',
    badgeGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    sealColor: '#0284c7',
    watermark: 'rgba(2, 132, 199, 0.04)',
    cornerDeco: 'blue',
    isLight: true
  }
};

export const EVENT_CATEGORIES = [
  { id: 'HACKATHON', label: '🚀 Hackathon / Code Sprint', defaultPrefix: 'Certificate of Excellence' },
  { id: 'WORKSHOP', label: '🛠️ Hands-on Workshop / Masterclass', defaultPrefix: 'Certificate of Participation & Skill Mastery' },
  { id: 'BOOTCAMP', label: '💻 Intensive Bootcamp / Training', defaultPrefix: 'Certificate of Completion & Competency' },
  { id: 'TECH_SUMMIT', label: '🌐 Tech Summit / DevFest', defaultPrefix: 'Certificate of Outstanding Achievement' },
  { id: 'INNOVATION', label: '💡 Innovation & Project Expo', defaultPrefix: 'Certificate of Recognition & Merit' },
  { id: 'APPRECIATION', label: '🌟 Leadership & Community Service', defaultPrefix: 'Certificate of Appreciation' },
  { id: 'INTERNSHIP', label: '🎓 Technical Track / Fellowship', defaultPrefix: 'Certificate of Specialization' }
];

export const BADGE_TYPES = [
  { id: 'WINNER_GOLD', label: '🥇 1st Place Winner (Gold)', icon: '🏆', text: 'FIRST PLACE WINNER' },
  { id: 'RUNNER_UP', label: '🥈 1st Runner Up (Silver)', icon: '🥈', text: 'FIRST RUNNER UP' },
  { id: 'SECOND_RUNNER', label: '🥉 2nd Runner Up (Bronze)', icon: '🥉', text: 'SECOND RUNNER UP' },
  { id: 'FINALIST', label: '🎖️ Grand Finalist', icon: '⭐', text: 'TOP FINALIST' },
  { id: 'MERIT', label: '💎 Certificate of Merit', icon: '💎', text: 'DISTINCTION MERIT' },
  { id: 'COMPLETION', label: '✅ Certified Completion', icon: '📜', text: 'OFFICIALLY CERTIFIED' },
  { id: 'EXCELLENCE', label: '🌟 Special Excellence Award', icon: '🌟', text: 'EXCELLENCE AWARD' }
];

// Pre-seeded authentic event certificates for ITMBU
export const INITIAL_EVENT_CERTIFICATES = [
  {
    id: 'CERT-2026-HACK-001',
    credentialId: 'CERT-2026-HACK-001',
    recipientName: 'Aarav Sharma',
    recipientEmail: 'aarav.sharma@example.com',
    recipientCollege: 'ITM (sls) Baroda University',
    recipientDepartment: 'Computer Science & Engineering',
    category: 'HACKATHON',
    eventTitle: 'HackCloud 2026: 36-Hour National Cloud Hackathon',
    roleOrAchievement: 'Winner — 1st Place Champion',
    badgeType: 'WINNER_GOLD',
    theme: 'GOLD_NAVY',
    organization: 'AWS_SBG',
    issuedDate: '2026-03-15',
    expiryDate: 'Lifetime Validity',
    skills: ['AWS Lambda', 'Cloud Architecture', 'Serverless APIs', 'DynamoDB', 'Microservices', 'React'],
    customDescription: 'For demonstrating extraordinary innovation, architectural precision, and building a scalable AI-driven serverless solution in the 36-hour national hackathon.',
    signatory1: {
      name: 'Bhavikkumar Patel',
      title: 'AWS SBG Leader & Lead Organizer',
      org: 'AWS Student Builder Group, ITMBU',
      sigImage: null
    },
    signatory2: {
      name: 'Vansham Kamboj',
      title: 'President & Faculty Advisor',
      org: 'Techno Lab & AWS Chapter',
      sigImage: null
    },
    signatory3: {
      name: 'Dr. Pradeep Laxkar',
      title: 'Head of Department / Faculty Mentor',
      org: 'Dept of CSE & IT, ITMBU',
      sigImage: null
    },
    verifiedStatus: 'AUTHENTIC_VERIFIED',
    hash: '0x8f73b9e4a1290382d610e7ca519a799320e8b1d9c'
  },
  {
    id: 'CERT-2026-WS-104',
    credentialId: 'CERT-2026-WS-104',
    recipientName: 'Diya Patel',
    recipientEmail: 'diya.patel@example.com',
    recipientCollege: 'ITM (sls) Baroda University',
    recipientDepartment: 'Information Technology',
    category: 'WORKSHOP',
    eventTitle: 'Masterclass: Applied AI, Computer Vision & Edge Robotics',
    roleOrAchievement: 'Certified Workshop Specialist',
    badgeType: 'COMPLETION',
    theme: 'OBSIDIAN_NEON',
    organization: 'TECHNO_LAB',
    issuedDate: '2026-02-20',
    expiryDate: 'Lifetime Validity',
    skills: ['PyTorch', 'OpenCV', 'Embedded Systems', 'IoT Edge', 'ROS2', 'Robotics Hardware'],
    customDescription: 'For successfully completing 16 intensive hands-on lab hours on edge artificial intelligence and autonomous robotics systems architecture.',
    signatory1: {
      name: 'Vansham Kamboj',
      title: 'President & Lead Organizer',
      org: 'Techno Lab (Techno+Techies Community)',
      sigImage: null
    },
    signatory2: {
      name: 'Mannan C.',
      title: 'Technical Director & Advisor',
      org: 'Techno Lab ITMBU',
      sigImage: null
    },
    signatory3: {
      name: 'Dr. Pradeep Laxkar',
      title: 'Faculty Mentor & Head',
      org: 'ITM (sls) Baroda University',
      sigImage: null
    },
    verifiedStatus: 'AUTHENTIC_VERIFIED',
    hash: '0x3a992bc4919028e1467f9011de35bc874a1290e21'
  },
  {
    id: 'CERT-2026-GDG-208',
    recipientName: 'Rohan Mehta',
    credentialId: 'CERT-2026-GDG-208',
    recipientEmail: 'rohan.mehta@example.com',
    recipientCollege: 'ITM (sls) Baroda University',
    recipientDepartment: 'Computer Science & Engineering',
    category: 'TECH_SUMMIT',
    eventTitle: 'Google Solution Challenge & DevFest Sprint 2026',
    roleOrAchievement: '1st Runner Up — High Commendation',
    badgeType: 'RUNNER_UP',
    theme: 'COSMIC_VIOLET',
    organization: 'GDGOC',
    issuedDate: '2026-03-01',
    expiryDate: 'Lifetime Validity',
    skills: ['Flutter', 'Google Cloud Platform', 'Firebase', 'TensorFlow Lite', 'Material You UI'],
    customDescription: 'Recognized for creating an impactful high-performance community solution addressing UN Sustainable Development Goals during the campus sprint.',
    signatory1: {
      name: 'Harshil Vaghela',
      title: 'GDGoC Campus Lead',
      org: 'Google Developer Groups on Campus',
      sigImage: null
    },
    signatory2: {
      name: 'Prof. Bhumika Patel',
      title: 'Faculty Advisor & Mentor',
      org: 'CSE & IT Department, ITMBU',
      sigImage: null
    },
    signatory3: {
      name: 'Dr. Pradeep Laxkar',
      title: 'Faculty Mentor / Head',
      org: 'ITM (sls) Baroda University',
      sigImage: null
    },
    verifiedStatus: 'AUTHENTIC_VERIFIED',
    hash: '0x7e882109ab44c9103de4580bbf81239aa2837190f'
  }
];

// Helper to generate cryptographically styled ref ID
export const generateCertificateId = (category = 'HACK', year = new Date().getFullYear()) => {
  const catCode = (category || 'EVENT').substring(0, 4).toUpperCase();
  const randomAlpha = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CERT-${year}-${catCode}-${randomAlpha}${randomNum}`;
};

// Helper to generate hash
export const generateVerificationHash = (certId, recipientName) => {
  let hash = 0;
  const str = `${certId}_${recipientName}_ITMBU_SECURE_TOKEN_2026`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}e984f1a2076cb58210`;
};
