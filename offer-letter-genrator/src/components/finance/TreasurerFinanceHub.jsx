import React, { useState, useEffect, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';
import './TreasurerFinanceHub.css';
import {
  DollarSign,
  Package,
  Receipt,
  Layers,
  Cpu,
  TrendingUp,
  Plus,
  Minus,
  Search,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  Printer,
  X,
  Crown,
  CheckCircle2,
  Clock,
  RotateCcw,
  Check,
  Boxes,
  ArrowUpRight,
  AlertTriangle,
  FileCheck,
  UserCheck,
  GraduationCap,
  ClipboardList,
  SlidersHorizontal,
  CheckSquare,
  Sun,
  Moon
} from 'lucide-react';
import {
  fetchCloudFinanceData,
  saveCloudFinanceData,
  subscribeToCloudFinanceData
} from '../../services/supabaseService';

// Storage keys
const FINANCE_STORAGE_KEY = 'itmbu_finance_master_data';

// Initial Mock / Pre-seeded Finance Data tailored for AWS_SBG, TECHNO_LAB, GDGOC
const INITIAL_FINANCE_DATA = {
  // 1. Multi-Stage Approval Pipeline for Swag Manifest
  swagApprovalState: {
    AWS_SBG: {
      status: 'FINAL_APPROVED', // 'DRAFT' | 'CO_ORGANIZER_APPROVED' | 'ADVISOR_APPROVED' | 'FINAL_APPROVED'
      createdBy: 'Bhavikkumar Patel (Treasurer Lead)',
      createdAt: '2026-09-20',
      coOrganizerApproval: {
        approvedBy: 'Bhavikkumar Patel (Super Admin) (Co-Organizer)',
        approvedAt: '2026-09-22 11:30',
        note: 'Verified roster against semester 5 active student builder registrations.'
      },
      advisorApproval: {
        approvedBy: 'Faculty Advisor (Institutional Review)',
        approvedAt: '2026-09-23 09:45',
        note: 'Institutional compliance and swag logistics sanctioned.'
      },
      superAdminApproval: {
        approvedBy: 'Bhavikkumar Patel (Super Admin) Universal Root',
        approvedAt: '2026-09-23 15:45',
        note: 'Sanctioned for official on-spot distribution & printable manifest authorized.'
      }
    },
    TECHNO_LAB: {
      status: 'CO_ORGANIZER_APPROVED',
      createdBy: 'Vansham Kamboj (R&D Lead)',
      createdAt: '2026-09-21',
      coOrganizerApproval: {
        approvedBy: 'Dev Patel (Co-Organizer)',
        approvedAt: '2026-09-23 10:15',
        note: 'Hardware & robotics swag pack verified.'
      },
      advisorApproval: {
        approvedBy: 'Faculty Advisor (Prof. Sharma)',
        approvedAt: '2026-09-23 14:20',
        note: 'RoboWars participant kit allocation approved.'
      },
      superAdminApproval: null
    },
    GDGOC: {
      status: 'FINAL_APPROVED',
      createdBy: 'Ananya Joshi (GDG Organizer)',
      createdAt: '2026-09-20',
      coOrganizerApproval: {
        approvedBy: 'Campus Faculty Mentor',
        approvedAt: '2026-09-21 14:00',
        note: 'Cloud Study Jam Tier completion confirmed.'
      },
      advisorApproval: {
        approvedBy: 'Prof. Mehta (HOD / Faculty Mentor)',
        approvedAt: '2026-09-22 11:15',
        note: 'Google Cloud milestone rewards roster cleared.'
      },
      superAdminApproval: {
        approvedBy: 'Super Administrator Root',
        approvedAt: '2026-09-22 16:30',
        note: 'Authorized for printing and distribution.'
      }
    }
  },

  // 2. Swags Inventory Stock (Live stock with separate Add [+] and Decrease [-] management)
  swagInventory: [
    {
      id: 'INV-001',
      chapter: 'AWS_SBG',
      itemName: 'AWS Builder T-Shirt (Black Edition)',
      category: 'Apparel',
      sizeBreakdown: { S: 10, M: 25, L: 20, XL: 10 },
      totalStock: 65,
      allottedStock: 4,
      damagedStock: 1,
      minThreshold: 10,
      batchRef: 'AWS-DROP-SEP-26',
      lastUpdated: '2026-09-24'
    },
    {
      id: 'INV-002',
      chapter: 'AWS_SBG',
      itemName: 'AWS CORE TEAM KIT + DESK MATE',
      category: 'Core Lead Kit',
      sizeBreakdown: { Standard: 15 },
      totalStock: 15,
      allottedStock: 2,
      damagedStock: 0,
      minThreshold: 3,
      batchRef: 'AWS-CORE-KIT-01',
      lastUpdated: '2026-09-22'
    },
    {
      id: 'INV-003',
      chapter: 'AWS_SBG',
      itemName: 'AWS DeepRacer Hoodie + Builder Badge',
      category: 'Special Track',
      sizeBreakdown: { M: 8, L: 7 },
      totalStock: 15,
      allottedStock: 1,
      damagedStock: 0,
      minThreshold: 3,
      batchRef: 'AWS-DR-HOODIE-26',
      lastUpdated: '2026-09-20'
    },
    {
      id: 'INV-004',
      chapter: 'GDGOC',
      itemName: 'Google Cloud Skills T-Shirt + Pin Set',
      category: 'Study Jam',
      sizeBreakdown: { S: 15, M: 25, L: 20 },
      totalStock: 60,
      allottedStock: 1,
      damagedStock: 0,
      minThreshold: 10,
      batchRef: 'GCP-ARCADE-DROP-09',
      lastUpdated: '2026-09-21'
    },
    {
      id: 'INV-005',
      chapter: 'GDGOC',
      itemName: 'Google Cloud Backpack + Tech Hoodie + Bottle',
      category: 'Tier 3 Champion',
      sizeBreakdown: { Standard: 20 },
      totalStock: 20,
      allottedStock: 1,
      damagedStock: 0,
      minThreshold: 4,
      batchRef: 'GDG-CHAMPION-BAG-01',
      lastUpdated: '2026-09-22'
    },
    {
      id: 'INV-006',
      chapter: 'TECHNO_LAB',
      itemName: 'Techno Lab Robotics Kit + Tech Cap',
      category: 'R&D Cell Kits',
      sizeBreakdown: { Standard: 25 },
      totalStock: 25,
      allottedStock: 1,
      damagedStock: 0,
      minThreshold: 5,
      batchRef: 'TECH-ROBOTICS-KIT-01',
      lastUpdated: '2026-09-23'
    }
  ],

  // 3. Swags & Logistics Roster
  swagAllocations: [
    {
      id: 'SWAG-001',
      chapter: 'AWS_SBG',
      studentName: 'Pratham Mahajan',
      enrollmentNo: '24CS1026',
      department: 'Technical Team',
      directorName: 'Pratham Mahajan (Director of Technical Team)',
      swagItem: 'Core Team Kit + Clear Belt Bag + Magnetic Phone Mount + Holographics Sticker',
      remark: "T shirt Size 'L' & Pencil Pouch goes to Vansham Khambhoj",
      status: 'ALLOTTED',
      approvalStatus: 'SUPER_ADMIN_APPROVED',
      approvedBy: 'Bhavikkumar Patel (Super Admin) (Super Admin)',
      allocatedDate: '2026-09-20',
      claimedTimestamp: null,
      claimedBy: null
    },
    {
      id: 'SWAG-002',
      chapter: 'AWS_SBG',
      studentName: 'Tanvi Acharya',
      enrollmentNo: '24CS1002',
      department: 'Finance & Sponsorship',
      directorName: 'Tanvi Acharya (Head of Treasury)',
      swagItem: 'CORE - TEAM KIT+TABLE DESK + 2 MORE SWAGS',
      remark: 'T SHIRT SIZE "M"',
      status: 'CLAIMED',
      approvalStatus: 'SUPER_ADMIN_APPROVED',
      approvedBy: 'Bhavikkumar Patel (Super Admin) (Super Admin)',
      allocatedDate: '2026-09-20',
      claimedTimestamp: '2026-09-22 14:10',
      claimedBy: 'Treasurer Desk'
    },
    {
      id: 'SWAG-003',
      chapter: 'AWS_SBG',
      studentName: 'Bhavik Patel',
      enrollmentNo: '24CS1053',
      department: 'Technical Team',
      directorName: 'Bhavikkumar Patel (Technical Director / Super Admin)',
      swagItem: 'MAIN DISTRIBUTOR',
      remark: 'NO',
      status: 'ALLOTTED',
      approvalStatus: 'SUPER_ADMIN_APPROVED',
      approvedBy: 'Super Administrator',
      allocatedDate: '2026-09-21',
      claimedTimestamp: null,
      claimedBy: null
    },
    {
      id: 'SWAG-004',
      chapter: 'GDGOC',
      studentName: 'Ananya Joshi',
      enrollmentNo: '2306088',
      department: 'Technical Team',
      directorName: 'Ananya Joshi (GDG Organizer)',
      swagItem: 'Google Cloud Skills T-Shirt + Pin Set',
      remark: 'Tier 1 Arcade Completion Kit',
      status: 'ALLOTTED',
      approvalStatus: 'PENDING_APPROVAL',
      approvedBy: null,
      allocatedDate: '2026-09-18',
      claimedTimestamp: null,
      claimedBy: null
    },
    {
      id: 'SWAG-005',
      chapter: 'TECHNO_LAB',
      studentName: 'Vansham Kamboj',
      enrollmentNo: '2306020',
      department: 'R&D Cell',
      directorName: 'Vansham Kamboj (R&D Lead)',
      swagItem: 'Techno Lab Robotics Kit + Tech Cap',
      remark: 'R&D Cell Lead Allocation',
      status: 'CLAIMED',
      approvalStatus: 'CO_ORGANIZER_APPROVED',
      approvedBy: 'Faculty Advisor (Prof. Sharma)',
      allocatedDate: '2026-09-14',
      claimedTimestamp: '2026-09-14 16:00',
      claimedBy: 'Treasurer Desk'
    }
  ],

  // 3. Event Budgets
  eventBudgets: [
    {
      id: 'BUD-001',
      chapter: 'AWS_SBG',
      eventName: 'AWS Cloud Day & Builder Jam 2026',
      sanctionedAmount: 45000,
      allocatedDate: '2026-09-01',
      status: 'ACTIVE',
      breakdown: {
        venueAndDecor: 8000,
        audioVisualAndStage: 7000,
        refreshmentsAndFood: 18000,
        printingAndBadges: 5000,
        otherExpenses: 7000
      }
    },
    {
      id: 'BUD-002',
      chapter: 'TECHNO_LAB',
      eventName: 'RoboWars & AI Hardware Hackathon',
      sanctionedAmount: 60000,
      allocatedDate: '2026-09-05',
      status: 'ACTIVE',
      breakdown: {
        venueAndDecor: 10000,
        audioVisualAndStage: 15000,
        refreshmentsAndFood: 20000,
        printingAndBadges: 5000,
        otherExpenses: 10000
      }
    },
    {
      id: 'BUD-003',
      chapter: 'GDGOC',
      eventName: 'Google Cloud Study Jams & Solution Challenge Launch',
      sanctionedAmount: 35000,
      allocatedDate: '2026-09-08',
      status: 'ACTIVE',
      breakdown: {
        venueAndDecor: 6000,
        audioVisualAndStage: 5000,
        refreshmentsAndFood: 14000,
        printingAndBadges: 4000,
        otherExpenses: 6000
      }
    }
  ],

  // 4. Expense Vouchers
  expenseVouchers: [
    {
      id: 'EXP-101',
      title: 'High-Tea & Catering for AWS Builder Attendees (200 Students)',
      eventName: 'AWS Cloud Day & Builder Jam 2026',
      chapter: 'AWS_SBG',
      submittedBy: 'Bhavikkumar Patel',
      amount: 14500,
      category: 'Refreshments & Food',
      billDate: '2026-09-12',
      status: 'SETTLED',
      treasurerSignOff: 'Bhavik Patel (Treasurer)',
      facultySignOff: 'Faculty Coordinator (Approved)',
      paymentMode: 'UPI / Online',
      receiptUrl: 'https://images.unsplash.com/photo-1554415707-9e4c19a973a9?w=600&auto=format&fit=crop&q=60',
      receiptName: 'canteen_caterers_tax_invoice_101.pdf',
      settledRef: 'ITMBU-FIN-TXN-9981'
    },
    {
      id: 'EXP-102',
      title: 'Auditorium Banner & Stage Standee Printing',
      eventName: 'AWS Cloud Day & Builder Jam 2026',
      chapter: 'AWS_SBG',
      submittedBy: 'Tannvi Acharya',
      amount: 950,
      category: 'Printing & Badges',
      billDate: '2026-09-13',
      status: 'SETTLED',
      treasurerSignOff: 'Bhavik Patel (Treasurer)',
      facultySignOff: 'Faculty Coordinator (Approved)',
      paymentMode: 'Cash Advance Reimbursement',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=60',
      receiptName: 'graphics_print_receipt_950.png',
      settledRef: 'ITMBU-FIN-TXN-9982'
    },
    {
      id: 'EXP-103',
      title: 'Robotics Sensors, Arduino Uno & ESP32 Prototyping Modules',
      eventName: 'RoboWars & AI Hardware Hackathon',
      chapter: 'TECHNO_LAB',
      submittedBy: 'Vansham Kamboj',
      amount: 18200,
      category: 'Hardware & Kits',
      billDate: '2026-09-16',
      status: 'TREASURER_VERIFIED',
      treasurerSignOff: 'Bhavik Patel (Treasurer)',
      facultySignOff: null,
      paymentMode: 'College Purchase Order',
      receiptUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
      receiptName: 'electronics_supply_invoice_772.pdf',
      settledRef: null
    },
    {
      id: 'EXP-104',
      title: 'Google Cloud Study Jam Badges, Lanyards & Stickers',
      eventName: 'Google Cloud Study Jams & Solution Challenge Launch',
      chapter: 'GDGOC',
      submittedBy: 'Ananya Joshi',
      amount: 3200,
      category: 'Printing & Badges',
      billDate: '2026-09-19',
      status: 'SUBMITTED',
      treasurerSignOff: null,
      facultySignOff: null,
      paymentMode: 'UPI / Online',
      receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=60',
      receiptName: 'sticker_hub_receipt_3200.jpg',
      settledRef: null
    }
  ],

  // 5. Sponsorships & Inflows
  sponsorshipInflows: [
    {
      id: 'INFLOW-01',
      sponsorName: 'AWS User Group Gujarat & Student Builder Fund',
      chapter: 'AWS_SBG',
      category: 'Community Grant',
      amount: 50000,
      paymentDate: '2026-09-02',
      utrReferenceNo: 'UTR-HDFC-9920188219',
      notes: 'Sanctioned for Cloud Day 2026 builder tracks.'
    },
    {
      id: 'INFLOW-02',
      sponsorName: 'TechCorp Solutions & Corporate Grants',
      chapter: 'AWS_SBG',
      category: 'Corporate Sponsorship',
      amount: 25000,
      paymentDate: '2026-09-04',
      utrReferenceNo: 'UTR-ICICI-8827391102',
      notes: 'Title sponsorship for AI & Cloud HackFest.'
    },
    {
      id: 'INFLOW-03',
      sponsorName: 'TechCorp Solutions Pvt Ltd (Gold Sponsor)',
      chapter: 'TECHNO_LAB',
      category: 'Corporate Sponsorship',
      amount: 40000,
      paymentDate: '2026-09-06',
      utrReferenceNo: 'UTR-ICICI-8827391102',
      notes: 'Title sponsorship for AI & Robotics HackFest.'
    },
    {
      id: 'INFLOW-04',
      sponsorName: 'ITM (sls) Baroda University Annual Activity Fund',
      chapter: 'GDGOC',
      category: 'University Allocation',
      amount: 35000,
      paymentDate: '2026-09-09',
      utrReferenceNo: 'ITMBU-TREASURY-ALLOC-2026-04',
      notes: 'Official semester grant for GDG on Campus.'
    }
  ],

  // 6. Hardware & Equipment Lending
  hardwareLendings: [
    {
      id: 'HW-01',
      chapter: 'AWS_SBG',
      assetName: 'AWS DeepRacer Autonomous 1/18th Car Kit',
      assetTag: 'AWS-DR-01',
      borrowerName: 'Dhruv Sharma',
      enrollmentNo: '2306034',
      contactNo: '+91 98250 12345',
      issuedDate: '2026-09-10',
      expectedReturnDate: '2026-09-25',
      depositAmount: 2000,
      status: 'ISSUED',
      returnedDate: null
    },
    {
      id: 'HW-02',
      chapter: 'TECHNO_LAB',
      assetName: 'Raspberry Pi 4 Model B (8GB) + Camera Sensor Kit',
      assetTag: 'TECH-RPI-04',
      borrowerName: 'Priya Patel',
      enrollmentNo: '2306056',
      contactNo: '+91 97240 54321',
      issuedDate: '2026-09-12',
      expectedReturnDate: '2026-09-22',
      depositAmount: 1500,
      status: 'OVERDUE',
      returnedDate: null
    },
    {
      id: 'HW-03',
      chapter: 'TECHNO_LAB',
      assetName: 'Wireless Collar Mic Dual Set + Receiver (Rode)',
      assetTag: 'TECH-AV-02',
      borrowerName: 'Aman Verma',
      enrollmentNo: '2306071',
      contactNo: '+91 94080 88990',
      issuedDate: '2026-09-15',
      expectedReturnDate: '2026-09-16',
      depositAmount: 0,
      status: 'RETURNED',
      returnedDate: '2026-09-16 18:00'
    },
    {
      id: 'HW-04',
      chapter: 'GDGOC',
      assetName: '4K HDMI USB-C Video Capture Card + 20m Extension Board',
      assetTag: 'GDG-AV-08',
      borrowerName: 'Yash Patel',
      enrollmentNo: '2306091',
      contactNo: '+91 98790 11223',
      issuedDate: '2026-09-20',
      expectedReturnDate: '2026-09-27',
      depositAmount: 0,
      status: 'ISSUED',
      returnedDate: null
    }
  ]
};

// Helper to guarantee valid arrays and object structures even if older cache exists
const sanitizeFinanceData = (raw) => {
  if (!raw || typeof raw !== 'object') return INITIAL_FINANCE_DATA;
  return {
    ...INITIAL_FINANCE_DATA,
    ...raw,
    swagApprovalState: {
      ...INITIAL_FINANCE_DATA.swagApprovalState,
      ...(raw.swagApprovalState || {})
    },
    swagInventory: Array.isArray(raw.swagInventory) && raw.swagInventory.length > 0
      ? raw.swagInventory
      : INITIAL_FINANCE_DATA.swagInventory,
    swagAllocations: Array.isArray(raw.swagAllocations)
      ? raw.swagAllocations
      : INITIAL_FINANCE_DATA.swagAllocations,
    eventBudgets: Array.isArray(raw.eventBudgets)
      ? raw.eventBudgets
      : INITIAL_FINANCE_DATA.eventBudgets,
    expenseVouchers: Array.isArray(raw.expenseVouchers)
      ? raw.expenseVouchers
      : INITIAL_FINANCE_DATA.expenseVouchers,
    sponsorshipInflows: Array.isArray(raw.sponsorshipInflows)
      ? raw.sponsorshipInflows
      : INITIAL_FINANCE_DATA.sponsorshipInflows,
    hardwareLendings: Array.isArray(raw.hardwareLendings)
      ? raw.hardwareLendings
      : INITIAL_FINANCE_DATA.hardwareLendings
  };
};

// Helper to map department & chapter to official director name
export const getDepartmentDirector = (dept = '', chapter = 'AWS_SBG') => {
  const normDept = (dept || '').toLowerCase().trim();
  const org = chapter || 'AWS_SBG';

  if (org === 'TECHNO_LAB') {
    if (normDept.includes('robot') || normDept.includes('iot') || normDept.includes('r&d') || normDept.includes('hardware')) {
      return 'Dev Patel (Director - Robotics & Embedded Systems)';
    }
    if (normDept.includes('ai') || normDept.includes('machine learning') || normDept.includes('data science')) {
      return 'Aman Sharma (Director - AI & Data Science)';
    }
    if (normDept.includes('web') || normDept.includes('app') || normDept.includes('tech') || normDept.includes('cloud')) {
      return 'Bhavikkumar Patel (Director - Full Stack & Cloud Architectures)';
    }
    if (normDept.includes('design') || normDept.includes('media') || normDept.includes('creative')) {
      return 'Pooja Verma (Director of Creative Design)';
    }
    if (normDept.includes('event') || normDept.includes('operat')) {
      return 'Yatri Patel (Operations Director)';
    }
    if (normDept.includes('lead') || normDept.includes('exec')) {
      return 'Vansham Kamboj (President & Lead Organizer)';
    }
    return 'Vansham Kamboj (Techno Lab Lead)';
  }

  if (org === 'GDGOC') {
    if (normDept.includes('tech') || normDept.includes('cloud') || normDept.includes('dev')) {
      return 'Aarav Patel (Technical Lead)';
    }
    if (normDept.includes('design') || normDept.includes('media')) {
      return 'Priya Shah (Design Lead)';
    }
    if (normDept.includes('pr') || normDept.includes('market') || normDept.includes('outreach') || normDept.includes('social')) {
      return 'Rohan Shah (Outreach Lead)';
    }
    if (normDept.includes('event') || normDept.includes('lead') || normDept.includes('operat')) {
      return 'Ananya Joshi (GDG Organizer & Lead)';
    }
    return 'Ananya Joshi (GDG Lead)';
  }

  // Default: AWS_SBG
  if (normDept.includes('event') || normDept.includes('treasur')) {
    return 'Tanvi Acharya (Director of Event Management / Treasurer)';
  }
  if (normDept.includes('tech') || normDept.includes('cloud') || normDept.includes('dev')) {
    return 'Pratham Mahajan (Director of Technical Team)';
  }
  if (normDept.includes('design') || normDept.includes('media') || normDept.includes('creative')) {
    return 'Yashvi Patel (Director of Design)';
  }
  if (normDept.includes('social') || normDept.includes('host')) {
    return 'Shrey Patel (Director of Social Media)';
  }
  if (normDept.includes('pr') || normDept.includes('outreach') || normDept.includes('market')) {
    return 'Smit Mekwan (Director of Outreach and PR)';
  }
  if (normDept.includes('doc') || normDept.includes('legal')) {
    return 'Bhavikkumar Patel (Document Provider & Legal Advocate)';
  }
  if (normDept.includes('finance') || normDept.includes('sponsor')) {
    return 'Tanvi Acharya (Head of Treasury)';
  }
  if (normDept.includes('r&d') || normDept.includes('innovat')) {
    return 'Dev Patel (Director of R&D)';
  }
  if (normDept.includes('core') || normDept.includes('operat') || normDept.includes('lead')) {
    return 'Bhavikkumar Patel (AWS SBG Leader & Super Admin)';
  }

  return 'Bhavikkumar Patel (Technical Director / Super Admin)';
};

export default function TreasurerFinanceHub({
  activeOrg = 'AWS_SBG',
  currentUser = null,
  itmbuLogo = null,
  clubLogo = null,
  appTheme = null,
  onToggleTheme = null,
  onClose = () => { }
}) {
  const [activeTab, setActiveTab] = useState('swags');
  const [chapterFilter, setChapterFilter] = useState(activeOrg || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Local / Synced Theme State ('light' | 'dark')
  const [localTheme, setLocalTheme] = useState(() => {
    if (appTheme) return appTheme;
    try {
      return localStorage.getItem('itmbu_portal_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    if (appTheme) {
      setLocalTheme(appTheme);
    }
  }, [appTheme]);

  const activeTheme = appTheme || localTheme;

  const handleToggleLocalTheme = () => {
    const next = activeTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(next);
    try {
      localStorage.setItem('itmbu_portal_theme', next);
      localStorage.setItem('itmbu_auth_theme', next);
    } catch (e) {}
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  // Column Visibility Checkboxes (for Screen Table & PDF Print Manifest)
  const [swagColumns, setSwagColumns] = useState({
    srNo: true,
    studentName: true,
    enrollmentNo: true,
    department: true,
    swagItem: true,
    remark: true,
    approvalStatus: true,
    status: true,
    signature: true
  });
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);

  const SWAG_COLUMN_OPTIONS = [
    { key: 'srNo', label: 'Sr.No' },
    { key: 'studentName', label: 'Name' },
    { key: 'enrollmentNo', label: 'Enrollment No' },
    { key: 'department', label: 'Department / Director' },
    { key: 'swagItem', label: 'Allotted Swags' },
    { key: 'remark', label: 'Remark / Size' },
    { key: 'approvalStatus', label: 'Approval Status' },
    { key: 'status', label: 'Claim Status' },
    { key: 'signature', label: 'Signature (Print)' }
  ];

  const [financeData, setFinanceData] = useState(() => {
    try {
      const saved = localStorage.getItem(FINANCE_STORAGE_KEY);
      return saved ? sanitizeFinanceData(JSON.parse(saved)) : INITIAL_FINANCE_DATA;
    } catch (e) {
      return INITIAL_FINANCE_DATA;
    }
  });

  const updateFinanceData = async (newData) => {
    const cleanData = sanitizeFinanceData(newData);
    setFinanceData(cleanData);
    setIsSyncing(true);
    const success = await saveCloudFinanceData(cleanData);
    setIsCloudSynced(success);
    setIsSyncing(false);
  };

  useEffect(() => {
    let channel = null;
    setIsSyncing(true);

    fetchCloudFinanceData(INITIAL_FINANCE_DATA)
      .then(res => {
        if (res && res.data) {
          setFinanceData(sanitizeFinanceData(res.data));
          setIsCloudSynced(true);
        }
      })
      .catch(err => {
        console.warn('[Finance sync error]:', err);
      })
      .finally(() => {
        setIsSyncing(false);
      });

    channel = subscribeToCloudFinanceData((cloudData) => {
      if (cloudData) {
        setFinanceData(sanitizeFinanceData(cloudData));
        setIsCloudSynced(true);
      }
    });

    return () => {
      if (channel && channel.unsubscribe) channel.unsubscribe();
    };
  }, []);

  const handleManualCloudSync = async () => {
    setIsSyncing(true);
    const res = await fetchCloudFinanceData(financeData);
    if (res && res.data) {
      setFinanceData(sanitizeFinanceData(res.data));
      setIsCloudSynced(true);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🟢 Supabase Cloud Live Connected & Synced!',
        timer: 2500,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
    setIsSyncing(false);
  };

  // Roles & Permissions
  const userRole = (currentUser?.role || '').toUpperCase();
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || currentUser?.username === 'admin';
  const isAdvisor = userRole === 'ADVISOR' || userRole === 'FACULTY_MENTOR';
  const isOrganizerOrCoLead = userRole === 'ORGANIZER' || userRole === 'LEAD' || userRole === 'CO_LEAD' || userRole === 'ASSOCIATE_COORDINATOR';

  // Section-wise Role Desk State
  const [activeRoleDesk, setActiveRoleDesk] = useState('ALL'); // 'ALL' | 'LEADS' | 'CO_ORGANIZER' | 'ADVISOR' | 'SUPER_ADMIN' | 'INVENTORY' | 'CO-LEDS' | 'DOCUMENT-PROVIDER(LEGAL ADVOCATE)' | 'ADMIN' | 'DEVLOPER(FOR ADDING NEW FEATURE) ' | 'CORE TEAM MEMBER'

  // Active Chapter Approval State
  const activeChapterApproval = useMemo(() => {
    const defaultChapter = chapterFilter === 'ALL' ? (activeOrg || 'AWS_SBG') : chapterFilter;
    const states = financeData.swagApprovalState || INITIAL_FINANCE_DATA.swagApprovalState;
    return states[defaultChapter] || {
      status: 'DRAFT',
      createdBy: 'Treasurer Lead',
      createdAt: new Date().toISOString().split('T')[0],
      coOrganizerApproval: null,
      advisorApproval: null,
      superAdminApproval: null
    };
  }, [financeData.swagApprovalState, chapterFilter, activeOrg]);

  // Approval Handlers
  const handleCoOrganizerApprove = () => {
    const defaultChapter = chapterFilter === 'ALL' ? (activeOrg || 'AWS_SBG') : chapterFilter;
    const currentApproval = financeData.swagApprovalState || INITIAL_FINANCE_DATA.swagApprovalState;
    const approverName = `${currentUser?.displayName || currentUser?.username || 'Co-Organizer'} (Chapter Co-Organizer)`;

    const updatedApproval = {
      ...currentApproval,
      [defaultChapter]: {
        ...(currentApproval[defaultChapter] || {}),
        status: 'CO_ORGANIZER_APPROVED',
        coOrganizerApproval: {
          approvedBy: approverName,
          approvedAt: new Date().toLocaleString(),
          note: 'Allocated swags verified against chapter active student builder directory.'
        }
      }
    };

    // Also update all items in this chapter to CO_ORGANIZER_APPROVED if they were pending
    const updatedSwags = (financeData.swagAllocations || []).map(s => {
      if ((defaultChapter === 'ALL' || s.chapter === defaultChapter) && s.approvalStatus !== 'SUPER_ADMIN_APPROVED') {
        return {
          ...s,
          approvalStatus: 'CO_ORGANIZER_APPROVED',
          approvedBy: approverName,
          approvalTimestamp: new Date().toISOString()
        };
      }
      return s;
    });

    updateFinanceData({
      ...financeData,
      swagApprovalState: updatedApproval,
      swagAllocations: updatedSwags
    });

    Swal.fire({
      icon: 'success',
      title: '✓ Approved by Organizer / Co-Organizer!',
      text: 'Swags manifest & allocated kits have passed Level 2 verification. Now forwarded to Faculty Advisor & Super Admin.',
      confirmButtonColor: '#0f172a'
    });
  };

  const handleAdvisorApprove = () => {
    const defaultChapter = chapterFilter === 'ALL' ? (activeOrg || 'AWS_SBG') : chapterFilter;
    const currentApproval = financeData.swagApprovalState || INITIAL_FINANCE_DATA.swagApprovalState;
    const approverName = `${currentUser?.displayName || currentUser?.username || 'Prof. Faculty Advisor'} (Faculty Advisor)`;

    const updatedApproval = {
      ...currentApproval,
      [defaultChapter]: {
        ...(currentApproval[defaultChapter] || {}),
        status: 'ADVISOR_APPROVED',
        advisorApproval: {
          approvedBy: approverName,
          approvedAt: new Date().toLocaleString(),
          note: 'Institutional compliance verified & academic sanction granted.'
        }
      }
    };

    updateFinanceData({
      ...financeData,
      swagApprovalState: updatedApproval
    });

    Swal.fire({
      icon: 'success',
      title: '🎓 Faculty Advisor Endorsement Granted!',
      text: 'Level 3 Institutional review complete. Awaiting Super Admin final sign-off.',
      confirmButtonColor: '#0f172a'
    });
  };

  const handleSuperAdminApprove = () => {
    const defaultChapter = chapterFilter === 'ALL' ? (activeOrg || 'AWS_SBG') : chapterFilter;
    const currentApproval = financeData.swagApprovalState || INITIAL_FINANCE_DATA.swagApprovalState;
    const approverName = `${currentUser?.displayName || currentUser?.username || 'Super Administrator'} (Universal Root)`;

    const updatedApproval = {
      ...currentApproval,
      [defaultChapter]: {
        ...(currentApproval[defaultChapter] || {}),
        status: 'FINAL_APPROVED',
        superAdminApproval: {
          approvedBy: approverName,
          approvedAt: new Date().toLocaleString(),
          note: 'Official authorization granted for on-spot swag distribution and manifest PDF printing.'
        }
      }
    };

    // Also seal all items in this chapter as SUPER_ADMIN_APPROVED
    const updatedSwags = (financeData.swagAllocations || []).map(s => {
      if (defaultChapter === 'ALL' || s.chapter === defaultChapter) {
        return {
          ...s,
          approvalStatus: 'SUPER_ADMIN_APPROVED',
          approvedBy: approverName,
          approvalTimestamp: new Date().toISOString()
        };
      }
      return s;
    });

    updateFinanceData({
      ...financeData,
      swagApprovalState: updatedApproval,
      swagAllocations: updatedSwags
    });

    Swal.fire({
      icon: 'success',
      title: '👑 Final Super Admin Approval Granted!',
      text: 'Swags manifest is officially certified with universal seal. You can now generate & print the official file.',
      confirmButtonColor: '#0f172a'
    });
  };

  const handleRevertApproval = () => {
    const defaultChapter = chapterFilter === 'ALL' ? (activeOrg || 'AWS_SBG') : chapterFilter;
    const currentApproval = financeData.swagApprovalState || INITIAL_FINANCE_DATA.swagApprovalState;

    const updatedApproval = {
      ...currentApproval,
      [defaultChapter]: {
        ...(currentApproval[defaultChapter] || {}),
        status: 'DRAFT',
        coOrganizerApproval: null,
        advisorApproval: null,
        superAdminApproval: null
      }
    };

    const updatedSwags = (financeData.swagAllocations || []).map(s => {
      if (defaultChapter === 'ALL' || s.chapter === defaultChapter) {
        return {
          ...s,
          approvalStatus: 'PENDING_APPROVAL',
          approvedBy: null,
          approvalTimestamp: null
        };
      }
      return s;
    });

    updateFinanceData({
      ...financeData,
      swagApprovalState: updatedApproval,
      swagAllocations: updatedSwags
    });

    Swal.fire({
      icon: 'info',
      title: 'Approval Reset to Draft',
      text: 'Treasurer Lead / Co-Lead can now modify allocations and re-submit for approval.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Individual Swag Row Level Approval Action
  const handleApproveIndividualSwag = (swag, targetStatus = null) => {
    let newStatus = targetStatus;

    if (!newStatus) {
      if (swag.approvalStatus === 'SUPER_ADMIN_APPROVED') {
        newStatus = 'PENDING_APPROVAL';
      } else if (swag.approvalStatus === 'CO_ORGANIZER_APPROVED') {
        newStatus = isSuperAdmin ? 'SUPER_ADMIN_APPROVED' : 'PENDING_APPROVAL';
      } else {
        newStatus = isSuperAdmin ? 'SUPER_ADMIN_APPROVED' : 'CO_ORGANIZER_APPROVED';
      }
    }

    const approverName = currentUser?.displayName || currentUser?.username || (isSuperAdmin ? 'Super Admin' : (isAdvisor ? 'Faculty Advisor' : 'Co-Organizer'));

    const updated = (financeData.swagAllocations || []).map(s => {
      if (s.id === swag.id) {
        return {
          ...s,
          approvalStatus: newStatus,
          approvedBy: newStatus === 'PENDING_APPROVAL' ? null : `${approverName} (${new Date().toLocaleDateString()})`,
          approvalTimestamp: newStatus === 'PENDING_APPROVAL' ? null : new Date().toISOString()
        };
      }
      return s;
    });

    updateFinanceData({ ...financeData, swagAllocations: updated });

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: newStatus === 'SUPER_ADMIN_APPROVED' ? 'success' : (newStatus === 'CO_ORGANIZER_APPROVED' ? 'info' : 'warning'),
      title: newStatus === 'SUPER_ADMIN_APPROVED'
        ? `👑 Super Admin Approved: ${swag.studentName}`
        : (newStatus === 'CO_ORGANIZER_APPROVED' ? `✓ Co-Organizer / Advisor Approved: ${swag.studentName}` : `Approval reset for ${swag.studentName}`),
      timer: 2200,
      showConfirmButton: false,
      background: 'rgba(15, 23, 42, 0.95)',
      color: '#f8fafc'
    });
  };

  // =========================================================================
  // INVENTORY STOCK MANAGEMENT (SEPARATE STOCK IN [+] & DECREASE [-])
  // =========================================================================
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [newStockForm, setNewStockForm] = useState({
    chapter: activeOrg || 'AWS_SBG',
    itemName: '',
    category: 'Apparel',
    quantity: '',
    batchRef: '',
    minThreshold: '5',
    notes: '',
    sizeS: '0',
    sizeM: '0',
    sizeL: '0',
    sizeXL: '0'
  });

  const [isDecreaseStockModalOpen, setIsDecreaseStockModalOpen] = useState(false);
  const [decreaseStockForm, setDecreaseStockForm] = useState({
    itemId: '',
    quantity: '',
    reason: 'DAMAGED', // 'DAMAGED' | 'RETURNED_TO_SPONSOR' | 'LOST_DISCREPANCY' | 'DIRECT_EVENT_USAGE'
    notes: '',
    chapter: activeOrg || 'AWS_SBG'
  });

  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    if (!newStockForm.itemName || !newStockForm.quantity || Number(newStockForm.quantity) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Invalid Details', text: 'Item Name and Quantity added must be valid numbers.' });
      return;
    }

    const currentInventory = Array.isArray(financeData?.swagInventory) ? financeData.swagInventory : (INITIAL_FINANCE_DATA.swagInventory || []);
    const existingIndex = currentInventory.findIndex(
      inv => inv.itemName.toLowerCase() === newStockForm.itemName.toLowerCase() && inv.chapter === newStockForm.chapter
    );

    let updatedInventory = [];
    const addedQty = Number(newStockForm.quantity);

    if (existingIndex >= 0) {
      updatedInventory = currentInventory.map((inv, idx) => {
        if (idx === existingIndex) {
          const updatedSize = { ...(inv.sizeBreakdown || {}) };
          if (Number(newStockForm.sizeS) > 0) updatedSize.S = (updatedSize.S || 0) + Number(newStockForm.sizeS);
          if (Number(newStockForm.sizeM) > 0) updatedSize.M = (updatedSize.M || 0) + Number(newStockForm.sizeM);
          if (Number(newStockForm.sizeL) > 0) updatedSize.L = (updatedSize.L || 0) + Number(newStockForm.sizeL);
          if (Number(newStockForm.sizeXL) > 0) updatedSize.XL = (updatedSize.XL || 0) + Number(newStockForm.sizeXL);

          return {
            ...inv,
            totalStock: Number(inv.totalStock || 0) + addedQty,
            batchRef: newStockForm.batchRef || inv.batchRef,
            sizeBreakdown: Object.keys(updatedSize).length > 0 ? updatedSize : inv.sizeBreakdown,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return inv;
      });
    } else {
      const sizeObj = {};
      if (Number(newStockForm.sizeS) > 0) sizeObj.S = Number(newStockForm.sizeS);
      if (Number(newStockForm.sizeM) > 0) sizeObj.M = Number(newStockForm.sizeM);
      if (Number(newStockForm.sizeL) > 0) sizeObj.L = Number(newStockForm.sizeL);
      if (Number(newStockForm.sizeXL) > 0) sizeObj.XL = Number(newStockForm.sizeXL);

      const newItem = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        chapter: newStockForm.chapter,
        itemName: newStockForm.itemName,
        category: newStockForm.category || 'General Kit',
        sizeBreakdown: Object.keys(sizeObj).length > 0 ? sizeObj : { Standard: addedQty },
        totalStock: addedQty,
        allottedStock: 0,
        damagedStock: 0,
        minThreshold: Number(newStockForm.minThreshold || 5),
        batchRef: newStockForm.batchRef || `DROP-${new Date().toISOString().split('T')[0]}`,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      updatedInventory = [newItem, ...currentInventory];
    }

    updateFinanceData({ ...financeData, swagInventory: updatedInventory });
    setIsAddStockModalOpen(false);
    setNewStockForm({
      chapter: activeOrg || 'AWS_SBG',
      itemName: '',
      category: 'Apparel',
      quantity: '',
      batchRef: '',
      minThreshold: '5',
      notes: '',
      sizeS: '0',
      sizeM: '0',
      sizeL: '0',
      sizeXL: '0'
    });

    Swal.fire({
      icon: 'success',
      title: '📦 Stock Added to Inventory!',
      text: `Added ${addedQty} units of ${newStockForm.itemName} to ${newStockForm.chapter} stock ledger.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDecreaseStockSubmit = (e) => {
    e.preventDefault();
    if (!decreaseStockForm.itemId || !decreaseStockForm.quantity || Number(decreaseStockForm.quantity) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Invalid Input', text: 'Select an inventory item and enter quantity to deduct.' });
      return;
    }

    const currentInventory = Array.isArray(financeData?.swagInventory) ? financeData.swagInventory : (INITIAL_FINANCE_DATA.swagInventory || []);
    const targetItem = currentInventory.find(i => i.id === decreaseStockForm.itemId);

    if (!targetItem) {
      Swal.fire({ icon: 'error', title: 'Item Not Found', text: 'Selected swag item does not exist.' });
      return;
    }

    const decQty = Number(decreaseStockForm.quantity);
    const available = Number(targetItem.totalStock || 0) - Number(targetItem.allottedStock || 0) - Number(targetItem.damagedStock || 0);

    if (decQty > available) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Available Stock',
        text: `Cannot decrease ${decQty} units. Only ${available} available in hand.`
      });
      return;
    }

    const updatedInventory = currentInventory.map(inv => {
      if (inv.id === decreaseStockForm.itemId) {
        return {
          ...inv,
          totalStock: Math.max(0, Number(inv.totalStock || 0) - decQty),
          damagedStock: decreaseStockForm.reason === 'DAMAGED' ? Number(inv.damagedStock || 0) + decQty : Number(inv.damagedStock || 0),
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    });

    updateFinanceData({ ...financeData, swagInventory: updatedInventory });
    setIsDecreaseStockModalOpen(false);
    setDecreaseStockForm({
      itemId: '',
      quantity: '',
      reason: 'DAMAGED',
      notes: '',
      chapter: activeOrg || 'AWS_SBG'
    });

    Swal.fire({
      icon: 'success',
      title: '📉 Stock Decreased / Written-off',
      text: `Deducted ${decQty} units of ${targetItem.itemName} (${decreaseStockForm.reason}).`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleDeleteInventoryItem = (id) => {
    Swal.fire({
      title: 'Remove Inventory Item?',
      text: 'Are you sure you want to delete this inventory record from stock monitoring?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete Item'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentInventory = Array.isArray(financeData?.swagInventory) ? financeData.swagInventory : (INITIAL_FINANCE_DATA.swagInventory || []);
        const updated = currentInventory.filter(i => i.id !== id);
        updateFinanceData({ ...financeData, swagInventory: updated });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
      }
    });
  };

  // Modals state
  const [isAddSwagModalOpen, setIsAddSwagModalOpen] = useState(false);
  const [newSwagForm, setNewSwagForm] = useState({
    studentName: '',
    enrollmentNo: '',
    department: 'Technical Team',
    directorName: 'Bhavikkumar Patel (Technical Director)',
    swagItem: '',
    remark: '',
    chapter: activeOrg || 'AWS_SBG',
    status: 'ALLOTTED',
    approvalStatus: 'PENDING_APPROVAL'
  });

  // Edit Swag state
  const [isEditSwagModalOpen, setIsEditSwagModalOpen] = useState(false);
  const [editingSwag, setEditingSwag] = useState(null);

  const [isAddVoucherModalOpen, setIsAddVoucherModalOpen] = useState(false);
  const [newVoucherForm, setNewVoucherForm] = useState({
    title: '',
    eventName: 'AWS Cloud Day & Builder Jam 2026',
    chapter: activeOrg || 'AWS_SBG',
    submittedBy: currentUser?.displayName || currentUser?.username || 'Treasurer Desk',
    amount: '',
    category: 'Refreshments & Food',
    billDate: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI / Online',
    receiptUrl: '',
    receiptName: ''
  });

  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [newBudgetForm, setNewBudgetForm] = useState({
    eventName: '',
    chapter: activeOrg || 'AWS_SBG',
    sanctionedAmount: '',
    venueAndDecor: '',
    refreshmentsAndFood: '',
    printingAndBadges: '',
    audioVisual: '',
    otherExpenses: ''
  });

  const [isAddHardwareModalOpen, setIsAddHardwareModalOpen] = useState(false);
  const [newHardwareForm, setNewHardwareForm] = useState({
    assetName: '',
    assetTag: '',
    chapter: activeOrg || 'TECHNO_LAB',
    borrowerName: '',
    enrollmentNo: '',
    contactNo: '',
    depositAmount: '0',
    expectedReturnDate: ''
  });

  const [isAddInflowModalOpen, setIsAddInflowModalOpen] = useState(false);
  const [newInflowForm, setNewInflowForm] = useState({
    sponsorName: '',
    chapter: activeOrg || 'AWS_SBG',
    amount: '',
    category: 'Corporate Sponsorship',
    utrReferenceNo: '',
    notes: ''
  });

  const [previewReceipt, setPreviewReceipt] = useState(null);

  // Filtered Lists & Metrics
  const filteredInventory = useMemo(() => {
    const list = Array.isArray(financeData?.swagInventory)
      ? financeData.swagInventory
      : (INITIAL_FINANCE_DATA.swagInventory || []);
    return list.filter(item => {
      const matchesChapter = chapterFilter === 'ALL' || item.chapter === chapterFilter;
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = !q ||
        (item.itemName && item.itemName.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.batchRef && item.batchRef.toLowerCase().includes(q));
      return matchesChapter && matchesSearch;
    });
  }, [financeData?.swagInventory, chapterFilter, searchQuery]);

  const inventoryStats = useMemo(() => {
    const rawList = Array.isArray(financeData?.swagInventory)
      ? financeData.swagInventory
      : (INITIAL_FINANCE_DATA.swagInventory || []);
    const list = chapterFilter === 'ALL'
      ? rawList
      : rawList.filter(i => i.chapter === chapterFilter);

    const totalItems = list.length;
    const totalPhysicalUnits = list.reduce((sum, i) => sum + Number(i.totalStock || 0), 0);
    const totalAllottedUnits = list.reduce((sum, i) => sum + Number(i.allottedStock || 0), 0);
    const totalDamagedUnits = list.reduce((sum, i) => sum + Number(i.damagedStock || 0), 0);
    const totalAvailableUnits = totalPhysicalUnits - totalAllottedUnits - totalDamagedUnits;
    const lowStockCount = list.filter(i => (Number(i.totalStock || 0) - Number(i.allottedStock || 0) - Number(i.damagedStock || 0)) <= Number(i.minThreshold || 5)).length;

    return {
      totalItems,
      totalPhysicalUnits,
      totalAllottedUnits,
      totalDamagedUnits,
      totalAvailableUnits,
      lowStockCount
    };
  }, [financeData?.swagInventory, chapterFilter]);

  // Filtered Lists
  const filteredSwags = useMemo(() => {
    const list = Array.isArray(financeData?.swagAllocations)
      ? financeData.swagAllocations
      : (INITIAL_FINANCE_DATA.swagAllocations || []);
    return list.filter(item => {
      const matchesChapter = chapterFilter === 'ALL' || item.chapter === chapterFilter;
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = !q ||
        (item.studentName && item.studentName.toLowerCase().includes(q)) ||
        (item.enrollmentNo && item.enrollmentNo.toLowerCase().includes(q)) ||
        (item.swagItem && item.swagItem.toLowerCase().includes(q)) ||
        (item.remark && item.remark.toLowerCase().includes(q));
      return matchesChapter && matchesSearch;
    });
  }, [financeData?.swagAllocations, chapterFilter, searchQuery]);

  const swagStats = useMemo(() => {
    const rawList = Array.isArray(financeData?.swagAllocations)
      ? financeData.swagAllocations
      : (INITIAL_FINANCE_DATA.swagAllocations || []);
    const list = chapterFilter === 'ALL'
      ? rawList
      : rawList.filter(s => s.chapter === chapterFilter);

    const totalAllotted = list.length;
    const totalClaimed = list.filter(s => s.status === 'CLAIMED').length;
    const totalPending = totalAllotted - totalClaimed;
    const totalSuperApproved = list.filter(s => s.approvalStatus === 'SUPER_ADMIN_APPROVED').length;
    const totalCoOrgApproved = list.filter(s => s.approvalStatus === 'CO_ORGANIZER_APPROVED').length;
    const totalPendingApproval = list.filter(s => !s.approvalStatus || s.approvalStatus === 'PENDING_APPROVAL').length;

    return {
      totalAllotted,
      totalClaimed,
      totalPending,
      totalSuperApproved,
      totalCoOrgApproved,
      totalPendingApproval
    };
  }, [financeData?.swagAllocations, chapterFilter]);

  const budgetMetrics = useMemo(() => {
    const rawBudgets = Array.isArray(financeData?.eventBudgets)
      ? financeData.eventBudgets
      : (INITIAL_FINANCE_DATA.eventBudgets || []);
    const activeBudgets = chapterFilter === 'ALL'
      ? rawBudgets
      : rawBudgets.filter(b => b.chapter === chapterFilter);

    const totalSanctioned = activeBudgets.reduce((sum, b) => sum + Number(b.sanctionedAmount || 0), 0);

    const rawVouchers = Array.isArray(financeData?.expenseVouchers)
      ? financeData.expenseVouchers
      : (INITIAL_FINANCE_DATA.expenseVouchers || []);
    const activeVouchers = chapterFilter === 'ALL'
      ? rawVouchers
      : rawVouchers.filter(v => v.chapter === chapterFilter);

    const totalSpent = activeVouchers
      .filter(v => v.status === 'SETTLED' || v.status === 'FACULTY_APPROVED')
      .reduce((sum, v) => sum + Number(v.amount || 0), 0);

    const rawInflows = Array.isArray(financeData?.sponsorshipInflows)
      ? financeData.sponsorshipInflows
      : (INITIAL_FINANCE_DATA.sponsorshipInflows || []);
    const totalInflows = (chapterFilter === 'ALL'
      ? rawInflows
      : rawInflows.filter(i => i.chapter === chapterFilter))
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const utilizationPct = totalSanctioned > 0 ? Math.min(100, Math.round((totalSpent / totalSanctioned) * 100)) : 0;

    return { totalSanctioned, totalSpent, utilizationPct, totalInflows };
  }, [financeData, chapterFilter]);

  // Actions: Swags
  const handleToggleClaimSwag = (swag) => {
    const newStatus = swag.status === 'CLAIMED' ? 'ALLOTTED' : 'CLAIMED';
    const timestamp = newStatus === 'CLAIMED'
      ? new Date().toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : null;

    const updated = financeData.swagAllocations.map(s => {
      if (s.id === swag.id) {
        return {
          ...s,
          status: newStatus,
          claimedTimestamp: timestamp,
          claimedBy: newStatus === 'CLAIMED' ? (currentUser?.displayName || 'Treasurer Desk') : null
        };
      }
      return s;
    });

    updateFinanceData({ ...financeData, swagAllocations: updated });

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: newStatus === 'CLAIMED' ? 'success' : 'info',
      title: newStatus === 'CLAIMED'
        ? `🎁 Swag marked as CLAIMED by ${swag.studentName}`
        : `Swag reverted to ALLOTTED for ${swag.studentName}`,
      timer: 2000,
      showConfirmButton: false,
      background: 'rgba(15, 23, 42, 0.95)',
      color: '#f8fafc'
    });
  };

  const handleAddSwagSubmit = (e) => {
    e.preventDefault();
    if (!newSwagForm.studentName || !newSwagForm.enrollmentNo || !newSwagForm.swagItem) {
      Swal.fire({ icon: 'warning', title: 'Missing Details', text: 'Name, Enrollment No, and Alloted Swag details are mandatory.' });
      return;
    }

    const assignedDirector = newSwagForm.directorName || getDepartmentDirector(newSwagForm.department, newSwagForm.chapter);
    const approverName = newSwagForm.approvalStatus === 'SUPER_ADMIN_APPROVED'
      ? (currentUser?.displayName ? `${currentUser.displayName} (Super Admin)` : 'Bhavikkumar Patel (Super Admin)')
      : (newSwagForm.approvalStatus === 'CO_ORGANIZER_APPROVED' ? (currentUser?.displayName ? `${currentUser.displayName} (Co-Organizer)` : 'Tannvi Acharya (Co-Organizer)') : null);

    const newItem = {
      id: `SWAG-${Date.now().toString().slice(-4)}`,
      studentName: newSwagForm.studentName,
      enrollmentNo: newSwagForm.enrollmentNo,
      department: newSwagForm.department || 'Technical Team',
      directorName: assignedDirector,
      swagItem: newSwagForm.swagItem,
      remark: newSwagForm.remark || '—',
      chapter: newSwagForm.chapter || activeOrg || 'AWS_SBG',
      status: newSwagForm.status || 'ALLOTTED',
      approvalStatus: newSwagForm.approvalStatus || 'PENDING_APPROVAL',
      approvedBy: approverName,
      allocatedDate: new Date().toISOString().split('T')[0],
      claimedTimestamp: newSwagForm.status === 'CLAIMED' ? new Date().toLocaleString() : null,
      claimedBy: newSwagForm.status === 'CLAIMED' ? (currentUser?.displayName || 'Treasurer Desk') : null
    };

    const updated = [newItem, ...(financeData.swagAllocations || [])];
    updateFinanceData({ ...financeData, swagAllocations: updated });
    setIsAddSwagModalOpen(false);
    setNewSwagForm({
      studentName: '',
      enrollmentNo: '',
      department: 'Technical Team',
      directorName: getDepartmentDirector('Technical Team', activeOrg || 'AWS_SBG'),
      swagItem: '',
      remark: '',
      chapter: activeOrg || 'AWS_SBG',
      status: 'ALLOTTED',
      approvalStatus: 'PENDING_APPROVAL'
    });

    Swal.fire({
      icon: 'success',
      title: 'Swag Allotted!',
      text: `Kit allotted to ${newItem.studentName} (${newItem.enrollmentNo}) - ${newItem.department}`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleStartEditSwag = (swag) => {
    setEditingSwag({
      ...swag,
      department: swag.department || 'Technical Team',
      directorName: swag.directorName || getDepartmentDirector(swag.department || 'Technical Team', swag.chapter),
      approvalStatus: swag.approvalStatus || 'PENDING_APPROVAL'
    });
    setIsEditSwagModalOpen(true);
  };

  const handleSaveEditedSwag = (e) => {
    e.preventDefault();
    if (!editingSwag.studentName || !editingSwag.enrollmentNo || !editingSwag.swagItem) {
      Swal.fire({ icon: 'warning', title: 'Missing Details', text: 'Name, Enrollment No, and Alloted Swags are mandatory.' });
      return;
    }

    const updated = financeData.swagAllocations.map(s => {
      if (s.id === editingSwag.id) {
        const approvalChanged = s.approvalStatus !== editingSwag.approvalStatus;
        const newApprover = editingSwag.approvalStatus === 'SUPER_ADMIN_APPROVED' 
          ? (currentUser?.displayName ? `${currentUser.displayName} (Super Admin)` : 'Bhavikkumar Patel (Super Admin)')
          : (editingSwag.approvalStatus === 'CO_ORGANIZER_APPROVED' ? (currentUser?.displayName ? `${currentUser.displayName} (Co-Organizer)` : 'Tannvi Acharya (Co-Organizer)') : null);

        return {
          ...s,
          studentName: editingSwag.studentName,
          enrollmentNo: editingSwag.enrollmentNo,
          department: editingSwag.department || s.department || 'Technical Team',
          directorName: editingSwag.directorName || s.directorName || getDepartmentDirector(editingSwag.department, editingSwag.chapter),
          swagItem: editingSwag.swagItem,
          remark: editingSwag.remark || '—',
          chapter: editingSwag.chapter,
          status: editingSwag.status,
          approvalStatus: editingSwag.approvalStatus || 'PENDING_APPROVAL',
          approvedBy: approvalChanged ? newApprover : s.approvedBy,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.displayName || 'Lead / Co-Lead'
        };
      }
      return s;
    });

    updateFinanceData({ ...financeData, swagAllocations: updated });
    setIsEditSwagModalOpen(false);
    setEditingSwag(null);

    Swal.fire({
      icon: 'success',
      title: 'Allocation & Approval Updated!',
      text: `Record updated for ${editingSwag.studentName} (${editingSwag.enrollmentNo})`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleDeleteSwag = (id) => {
    Swal.fire({
      title: 'Remove Swag Allocation?',
      text: 'Are you sure you want to delete this swag record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = financeData.swagAllocations.filter(s => s.id !== id);
        updateFinanceData({ ...financeData, swagAllocations: updated });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const handleExportSwagManifestPdf = async () => {
    if (activeChapterApproval.status !== 'FINAL_APPROVED' && !isSuperAdmin) {
      Swal.fire({
        icon: 'warning',
        title: 'Approval Pending for Print',
        html: `Official Print Manifest requires <strong>Super Administrator Final Sign-Off</strong>.<br/><br/>
               Current Pipeline State: <strong>${activeChapterApproval.status}</strong><br/>
               ${activeChapterApproval.coOrganizerApproval ? '✓ Co-Organizer Approved' : '⏳ Awaiting Co-Organizer'}<br/>
               ⏳ Awaiting Super Admin Final Sign-Off.`,
        showCancelButton: true,
        confirmButtonText: isSuperAdmin ? '👑 Approve & Print Now' : 'Understood',
        confirmButtonColor: '#f59e0b'
      }).then(res => {
        if (res.isConfirmed && isSuperAdmin) {
          handleSuperAdminApprove();
        }
      });
      if (!isSuperAdmin) return;
    }

    const element = document.getElementById('swag-manifest-printable-sheet');
    if (!element) return;

    Swal.fire({
      title: 'Generating Official Manifest PDF...',
      text: 'Compiling high-resolution distribution manifest with official university & club logos...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const opt = {
      margin: [6, 6, 6, 6],
      filename: `ITMBU_${chapterFilter}_Swag_Distribution_Manifest_4K_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Manifest PDF Downloaded!',
        text: 'Official Swag Distribution Sheet with Verified Approval Seals saved.',
        confirmButtonColor: '#0f172a'
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'PDF Generation Failed', text: err.message });
    }
  };

  const handleExportBudgetReportPdf = async () => {
    const element = document.getElementById('budget-report-printable-sheet');
    if (!element) return;
    Swal.fire({
      title: 'Generating Event Budget PDF...',
      text: 'Compiling financial statement and utilization audit...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `ITMBU_${chapterFilter}_Event_Budget_Statement_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
      Swal.close();
      Swal.fire({ icon: 'success', title: 'Budget Report Downloaded!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'PDF Generation Failed', text: err.message });
    }
  };

  const handleExportVouchersAuditPdf = async () => {
    const element = document.getElementById('vouchers-audit-printable-sheet');
    if (!element) return;
    Swal.fire({
      title: 'Generating Expense Vouchers PDF...',
      text: 'Compiling verified reimbursement audit sheet...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `ITMBU_${chapterFilter}_Expense_Vouchers_Audit_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
      Swal.close();
      Swal.fire({ icon: 'success', title: 'Vouchers Audit PDF Downloaded!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'PDF Generation Failed', text: err.message });
    }
  };

  const handleExportSponsorshipAuditPdf = async () => {
    const element = document.getElementById('sponsorship-audit-printable-sheet');
    if (!element) return;
    Swal.fire({
      title: 'Generating Sponsorship Ledger PDF...',
      text: 'Compiling grant receipts and inflow ledger...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `ITMBU_${chapterFilter}_Sponsorship_Inflows_Ledger_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
      Swal.close();
      Swal.fire({ icon: 'success', title: 'Sponsorship Ledger Downloaded!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'PDF Generation Failed', text: err.message });
    }
  };

  const handleExportHardwareLendingGatePassPdf = async () => {
    const element = document.getElementById('hardware-lending-printable-sheet');
    if (!element) return;
    Swal.fire({
      title: 'Generating Hardware Gate Pass PDF...',
      text: 'Compiling custody ledger and security deposit manifest...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `ITMBU_${chapterFilter}_Hardware_Lending_Gate_Pass_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await html2pdf().set(opt).from(element).save();
      Swal.close();
      Swal.fire({ icon: 'success', title: 'Hardware Gate Pass Downloaded!', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'PDF Generation Failed', text: err.message });
    }
  };

  // Actions: Budgets
  const handleAddBudgetSubmit = (e) => {
    e.preventDefault();
    if (!newBudgetForm.eventName || !newBudgetForm.sanctionedAmount) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Budget', text: 'Event Name and Sanctioned Amount are mandatory.' });
      return;
    }

    const newBudgetItem = {
      id: `BUD-${Date.now().toString().slice(-4)}`,
      chapter: newBudgetForm.chapter,
      eventName: newBudgetForm.eventName,
      sanctionedAmount: Number(newBudgetForm.sanctionedAmount),
      allocatedDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      breakdown: {
        venueAndDecor: Number(newBudgetForm.venueAndDecor || 0),
        refreshmentsAndFood: Number(newBudgetForm.refreshmentsAndFood || 0),
        printingAndBadges: Number(newBudgetForm.printingAndBadges || 0),
        audioVisualAndStage: Number(newBudgetForm.audioVisual || 0),
        otherExpenses: Number(newBudgetForm.otherExpenses || 0)
      }
    };

    const updated = [newBudgetItem, ...(financeData.eventBudgets || [])];
    updateFinanceData({ ...financeData, eventBudgets: updated });
    setIsAddBudgetModalOpen(false);
    setNewBudgetForm({
      eventName: '',
      chapter: activeOrg || 'AWS_SBG',
      sanctionedAmount: '',
      venueAndDecor: '',
      refreshmentsAndFood: '',
      printingAndBadges: '',
      audioVisual: '',
      otherExpenses: ''
    });

    Swal.fire({ icon: 'success', title: 'Budget Sanctioned & Saved!', timer: 2000, showConfirmButton: false });
  };

  const handleDeleteBudget = (id) => {
    Swal.fire({
      title: 'Delete Event Budget?',
      text: 'Are you sure you want to remove this event budget?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = financeData.eventBudgets.filter(b => b.id !== id);
        updateFinanceData({ ...financeData, eventBudgets: updated });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
      }
    });
  };

  // Actions: Vouchers
  const handleAdvanceVoucherStatus = (voucher, targetStatus) => {
    const updated = financeData.expenseVouchers.map(v => {
      if (v.id === voucher.id) {
        let treasurerSign = v.treasurerSignOff;
        let facultySign = v.facultySignOff;
        let settledRef = v.settledRef;

        if (targetStatus === 'TREASURER_VERIFIED') {
          treasurerSign = `Verified & Audited by ${currentUser?.displayName || 'Treasurer Desk'} on ${new Date().toLocaleDateString()}`;
        } else if (targetStatus === 'FACULTY_APPROVED') {
          facultySign = `Approved by Faculty Mentor / Organizer (${currentUser?.displayName || 'Lead'})`;
        } else if (targetStatus === 'SETTLED') {
          settledRef = `ITMBU-FIN-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        }

        return {
          ...v,
          status: targetStatus,
          treasurerSignOff: treasurerSign,
          facultySignOff: facultySign,
          settledRef: settledRef
        };
      }
      return v;
    });

    updateFinanceData({ ...financeData, expenseVouchers: updated });

    Swal.fire({
      icon: 'success',
      title: `Voucher Status: ${targetStatus}!`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  const handleSubmitVoucher = (e) => {
    e.preventDefault();
    if (!newVoucherForm.title || !newVoucherForm.amount) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Voucher', text: 'Title and amount are mandatory.' });
      return;
    }

    const newVoucher = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      ...newVoucherForm,
      amount: Number(newVoucherForm.amount),
      status: 'SUBMITTED',
      treasurerSignOff: null,
      facultySignOff: null,
      settledRef: null
    };

    const updated = [newVoucher, ...(financeData.expenseVouchers || [])];
    updateFinanceData({ ...financeData, expenseVouchers: updated });
    setIsAddVoucherModalOpen(false);
    setNewVoucherForm({
      title: '',
      eventName: 'AWS Cloud Day & Builder Jam 2026',
      chapter: activeOrg || 'AWS_SBG',
      submittedBy: currentUser?.displayName || currentUser?.username || 'Treasurer Desk',
      amount: '',
      category: 'Refreshments & Food',
      billDate: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI / Online',
      receiptUrl: '',
      receiptName: ''
    });

    Swal.fire({
      icon: 'success',
      title: 'Expense Voucher Submitted!',
      text: 'Voucher is now queued for Treasurer verification and Faculty sign-off.'
    });
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'File Too Large', text: 'Receipt image must be under 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setNewVoucherForm(prev => ({
          ...prev,
          receiptUrl: uploadEvent.target.result,
          receiptName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteVoucher = (id) => {
    Swal.fire({
      title: 'Delete Expense Voucher?',
      text: 'Are you sure you want to delete this voucher record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = financeData.expenseVouchers.filter(v => v.id !== id);
        updateFinanceData({ ...financeData, expenseVouchers: updated });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
      }
    });
  };

  // Actions: Inflows
  const handleAddInflowSubmit = (e) => {
    e.preventDefault();
    if (!newInflowForm.sponsorName || !newInflowForm.amount) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Inflow', text: 'Sponsor Name and Amount are mandatory.' });
      return;
    }

    const newInflow = {
      id: `INFLOW-${Date.now().toString().slice(-4)}`,
      sponsorName: newInflowForm.sponsorName,
      chapter: newInflowForm.chapter,
      category: newInflowForm.category,
      amount: Number(newInflowForm.amount),
      paymentDate: new Date().toISOString().split('T')[0],
      utrReferenceNo: newInflowForm.utrReferenceNo || `UTR-${Date.now().toString().slice(-8)}`,
      notes: newInflowForm.notes || '—'
    };

    const updated = [newInflow, ...(financeData.sponsorshipInflows || [])];
    updateFinanceData({ ...financeData, sponsorshipInflows: updated });
    setIsAddInflowModalOpen(false);
    setNewInflowForm({
      sponsorName: '',
      chapter: activeOrg || 'AWS_SBG',
      amount: '',
      category: 'Corporate Sponsorship',
      utrReferenceNo: '',
      notes: ''
    });

    Swal.fire({ icon: 'success', title: 'Inflow Recorded & Synced!', timer: 1800, showConfirmButton: false });
  };

  const handleDeleteInflow = (id) => {
    Swal.fire({
      title: 'Delete Inflow Record?',
      text: 'Are you sure you want to remove this sponsorship inflow?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = financeData.sponsorshipInflows.filter(i => i.id !== id);
        updateFinanceData({ ...financeData, sponsorshipInflows: updated });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
      }
    });
  };

  // Actions: Hardware
  const handleAddHardwareSubmit = (e) => {
    e.preventDefault();
    if (!newHardwareForm.assetName || !newHardwareForm.borrowerName) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Asset Lending', text: 'Asset Name and Borrower Name are mandatory.' });
      return;
    }

    const newHardware = {
      id: `HW-${Date.now().toString().slice(-4)}`,
      assetName: newHardwareForm.assetName,
      assetTag: newHardwareForm.assetTag || `TAG-${Date.now().toString().slice(-4)}`,
      chapter: newHardwareForm.chapter,
      borrowerName: newHardwareForm.borrowerName,
      enrollmentNo: newHardwareForm.enrollmentNo || '—',
      contactNo: newHardwareForm.contactNo || '—',
      issuedDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: newHardwareForm.expectedReturnDate || new Date().toISOString().split('T')[0],
      depositAmount: Number(newHardwareForm.depositAmount || 0),
      status: 'ISSUED',
      returnedDate: null
    };

    const updated = [newHardware, ...(financeData.hardwareLendings || [])];
    updateFinanceData({ ...financeData, hardwareLendings: updated });
    setIsAddHardwareModalOpen(false);
    setNewHardwareForm({
      assetName: '',
      assetTag: '',
      chapter: activeOrg || 'TECHNO_LAB',
      borrowerName: '',
      enrollmentNo: '',
      contactNo: '',
      depositAmount: '0',
      expectedReturnDate: ''
    });

    Swal.fire({ icon: 'success', title: 'Asset Issued Successfully!', timer: 1800, showConfirmButton: false });
  };

  const handleReturnHardware = (item) => {
    const updated = financeData.hardwareLendings.map(h => {
      if (h.id === item.id) {
        return {
          ...h,
          status: 'RETURNED',
          returnedDate: new Date().toLocaleString()
        };
      }
      return h;
    });

    updateFinanceData({ ...financeData, hardwareLendings: updated });
    Swal.fire({ icon: 'success', title: `Asset '${item.assetName}' marked as RETURNED!`, timer: 2000, showConfirmButton: false });
  };

  const handleDeleteHardware = (id) => {
    Swal.fire({
      title: 'Delete Hardware Record?',
      text: 'Are you sure you want to remove this hardware entry?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = financeData.hardwareLendings.filter(h => h.id !== id);
        updateFinanceData({ ...financeData, hardwareLendings: updated });
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
      }
    });
  };

  return (
    <div
      className={`treasurer-finance-hub-container tf-theme-${activeTheme}`}
      data-theme={activeTheme}
    >

      {/* TOP HEADER */}
      <header className="tf-header">
        <div className="tf-header-left">
          <div className="tf-badge-icon">
            <DollarSign size={24} className="tf-gold-icon" />
          </div>
          <div>
            <div className="tf-header-title-row">
              <h2>Treasurer &amp; Finance Command Center</h2>
              <span className="tf-role-badge">OFFICIAL AUDIT DESK</span>
            </div>
            <p className="tf-header-sub">
              ITM (sls) Baroda University &bull; Swags Logistics &bull; Event Budgets &bull; Expense Vouchers &bull; Sponsorships &bull; Hardware Lending
            </p>
          </div>
        </div>

        <div className="tf-header-right">
          {/* Supabase Live Status & 1-Click Sync */}
          <div
            className="tf-cloud-status"
            onClick={handleManualCloudSync}
            style={{ cursor: 'pointer' }}
            title="Supabase Cloud Live Connection • Click to re-sync"
          >
            <span className={`tf-status-dot ${isCloudSynced ? 'dot-live' : 'dot-syncing'}`}></span>
            <span>{isSyncing ? 'Syncing...' : (isCloudSynced ? 'Supabase Live Cloud' : 'Connecting Supabase...')}</span>
            <RefreshCw size={13} className={isSyncing ? 'spin-icon' : ''} style={{ marginLeft: 4 }} />
          </div>

          {/* Chapter Selector Switch */}
          <div className="tf-chapter-switch">
            {['ALL', 'AWS_SBG', 'TECHNO_LAB', 'GDGOC'].map(org => (
              <button
                key={org}
                type="button"
                className={`tf-chap-btn ${chapterFilter === org ? 'active' : ''}`}
                onClick={() => setChapterFilter(org)}
              >
                {org === 'ALL' ? 'All Chapters' : (org === 'AWS_SBG' ? 'AWS SBG' : (org === 'TECHNO_LAB' ? 'Techno Lab' : 'GDGOC'))}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI METRIC CARDS BANNER */}
      <section className="tf-kpi-banner">
        <div className="tf-kpi-card gold-border">
          <div className="kpi-icon-box gold"><DollarSign size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Sanctioned Budget</span>
            <span className="kpi-value">₹{budgetMetrics.totalSanctioned.toLocaleString('en-IN')}</span>
            <small className="kpi-sub">Across active chapter events</small>
          </div>
        </div>

        <div className="tf-kpi-card red-border">
          <div className="kpi-icon-box red"><Receipt size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Approved &amp; Settled Spent</span>
            <span className="kpi-value">₹{budgetMetrics.totalSpent.toLocaleString('en-IN')}</span>
            <div className="budget-progress-bar-wrap">
              <div
                className={`budget-progress-bar ${budgetMetrics.utilizationPct > 80 ? 'bar-danger' : 'bar-normal'}`}
                style={{ width: `${budgetMetrics.utilizationPct}%` }}
              ></div>
            </div>
            <small className="kpi-sub">{budgetMetrics.utilizationPct}% Budget Utilized</small>
          </div>
        </div>

        <div className="tf-kpi-card green-border">
          <div className="kpi-icon-box green"><TrendingUp size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Total Inflows &amp; Sponsors</span>
            <span className="kpi-value">₹{budgetMetrics.totalInflows.toLocaleString('en-IN')}</span>
            <small className="kpi-sub">Grants, Sponsors &amp; Registrations</small>
          </div>
        </div>

        <div className="tf-kpi-card blue-border">
          <div className="kpi-icon-box blue"><Package size={20} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Swag Kits (Claimed / Allotted)</span>
            <span className="kpi-value">{swagStats.totalClaimed} / {swagStats.totalAllotted}</span>
            <small className="kpi-sub">{swagStats.totalPending} Pending Collection</small>
          </div>
        </div>
      </section>

      {/* MODULE NAVIGATION TABS */}
      <nav className="tf-nav-tabs">
        <button
          className={`tf-tab-btn ${activeTab === 'swags' ? 'active' : ''}`}
          onClick={() => setActiveTab('swags')}
        >
          <Package size={17} />
          <span>1. Swags &amp; Logistics Engine</span>
        </button>

        <button
          className={`tf-tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
        >
          <Layers size={17} />
          <span>2. Event Budget Tracker</span>
        </button>

        <button
          className={`tf-tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`}
          onClick={() => setActiveTab('vouchers')}
        >
          <Receipt size={17} />
          <span>3. Expense Vouchers &amp; Reimbursement Desk</span>
        </button>

        <button
          className={`tf-tab-btn ${activeTab === 'sponsorships' ? 'active' : ''}`}
          onClick={() => setActiveTab('sponsorships')}
        >
          <TrendingUp size={17} />
          <span>4. Sponsorship &amp; Inflows Ledger</span>
        </button>

        <button
          className={`tf-tab-btn ${activeTab === 'hardware' ? 'active' : ''}`}
          onClick={() => setActiveTab('hardware')}
        >
          <Cpu size={17} />
          <span>5. Hardware &amp; Asset Lending Monitor</span>
        </button>
      </nav>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="tf-workspace">

        {/* ================================================================= */}
        {/* TAB 1: SWAGS & LOGISTICS ENGINE */}
        {/* ================================================================= */}
        {activeTab === 'swags' && (
          <div className="tf-section-view">

            {/* ROLE GOVERNANCE CLEARANCE DESKS & INVENTORY SWITCHER BAR */}
            <div className="tf-role-desk-bar">
              <button
                type="button"
                className={`role-desk-btn ${activeRoleDesk === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveRoleDesk('ALL')}
              >
                <ClipboardList size={15} />
                <span>All Operations &amp; Roster</span>
              </button>

              <button
                type="button"
                className={`role-desk-btn ${activeRoleDesk === 'LEADS' ? 'active' : ''}`}
                onClick={() => setActiveRoleDesk('LEADS')}
              >
                <UserCheck size={15} />
                <span>1. Leads &amp; Co-Leads Desk</span>
              </button>

              <button
                type="button"
                className={`role-desk-btn ${activeRoleDesk === 'CO_ORGANIZER' ? 'active' : ''}`}
                onClick={() => setActiveRoleDesk('CO_ORGANIZER')}
              >
                <FileCheck size={15} />
                <span>2. Organizer &amp; Co-Organizer</span>
              </button>

              <button
                type="button"
                className={`role-desk-btn ${activeRoleDesk === 'ADVISOR' ? 'active' : ''}`}
                onClick={() => setActiveRoleDesk('ADVISOR')}
              >
                <GraduationCap size={15} />
                <span>3. Faculty Advisor &amp; Coordinator</span>
              </button>

              <button
                type="button"
                className={`role-desk-btn ${activeRoleDesk === 'SUPER_ADMIN' ? 'active' : ''}`}
                onClick={() => setActiveRoleDesk('SUPER_ADMIN')}
              >
                <Crown size={15} />
                <span>4. Super Admin Desk</span>
              </button>

              <button
                type="button"
                className={`role-desk-btn inventory-btn ${activeRoleDesk === 'INVENTORY' ? 'active' : ''}`}
                onClick={() => setActiveRoleDesk('INVENTORY')}
              >
                <Boxes size={15} />
                <span>📦 Swag Inventory Manager (+ / -)</span>
              </button>
            </div>

            {/* VIEW A: DEDICATED SWAG INVENTORY MANAGER WITH SEPARATE ADD (+) & DECREASE (-) */}
            {activeRoleDesk === 'INVENTORY' ? (
              <div className="tf-inventory-management-desk">

                {/* INVENTORY KPI SUMMARY */}
                <div className="inventory-summary-grid">
                  <div className="inv-metric-card blue-glass">
                    <div className="inv-metric-icon"><Boxes size={22} /></div>
                    <div className="inv-metric-body">
                      <span className="inv-metric-label">Total Swag Items</span>
                      <strong className="inv-metric-val">{inventoryStats.totalItems} Items</strong>
                      <small className="inv-metric-sub">{inventoryStats.totalPhysicalUnits} Total Physical Units</small>
                    </div>
                  </div>

                  <div className="inv-metric-card green-glass">
                    <div className="inv-metric-icon"><ArrowUpRight size={22} /></div>
                    <div className="inv-metric-body">
                      <span className="inv-metric-label">Available for Pickup</span>
                      <strong className="inv-metric-val">{inventoryStats.totalAvailableUnits} Units</strong>
                      <small className="inv-metric-sub">In-stock &amp; ready to allot</small>
                    </div>
                  </div>

                  <div className="inv-metric-card amber-glass">
                    <div className="inv-metric-icon"><Clock size={22} /></div>
                    <div className="inv-metric-body">
                      <span className="inv-metric-label">Allotted / Reserved</span>
                      <strong className="inv-metric-val">{inventoryStats.totalAllottedUnits} Units</strong>
                      <small className="inv-metric-sub">Assigned to student builders</small>
                    </div>
                  </div>

                  <div className="inv-metric-card red-glass">
                    <div className="inv-metric-icon"><AlertTriangle size={22} /></div>
                    <div className="inv-metric-body">
                      <span className="inv-metric-label">Damaged / Low Stock</span>
                      <strong className="inv-metric-val">{inventoryStats.lowStockCount} Alerts</strong>
                      <small className="inv-metric-sub">{inventoryStats.totalDamagedUnits} Damaged / Written-off</small>
                    </div>
                  </div>
                </div>

                {/* INVENTORY TOOLBAR WITH SEPARATE ADD STOCK (+) & DECREASE STOCK (-) BUTTONS */}
                <div className="tf-section-toolbar" style={{ marginTop: '20px' }}>
                  <div className="tf-search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search inventory items, categories, or batch codes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="tf-toolbar-actions">
                    {/* SEPARATE ADD STOCK (+) BUTTON */}
                    <button
                      className="btn-stock-in-action"
                      onClick={() => setIsAddStockModalOpen(true)}
                      title="Add incoming shipment batch to stock (+)"
                    >
                      <Plus size={16} />
                      <span>Add Swag Stock (+)</span>
                    </button>

                    {/* SEPARATE DECREASE STOCK (-) BUTTON */}
                    <button
                      className="btn-stock-out-action"
                      onClick={() => setIsDecreaseStockModalOpen(true)}
                      title="Deduct damaged, lost, or written-off stock (-)"
                    >
                      <Minus size={16} />
                      <span>Decrease / Write-off Stock (-)</span>
                    </button>
                  </div>
                </div>

                {/* INVENTORY STOCK TABLE */}
                <div className="tf-table-container">
                  <table className="tf-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Sr.No</th>
                        <th>Item Name &amp; Category</th>
                        <th>Chapter</th>
                        <th>Batch / Drop Ref</th>
                        <th>Size Breakdown</th>
                        <th style={{ textAlign: 'center' }}>Total Stock</th>
                        <th style={{ textAlign: 'center' }}>Allotted</th>
                        <th style={{ textAlign: 'center' }}>Available</th>
                        <th style={{ textAlign: 'center' }}>Stock Status</th>
                        <th style={{ textAlign: 'right' }}>Stock Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item, idx) => {
                          const available = Number(item.totalStock || 0) - Number(item.allottedStock || 0) - Number(item.damagedStock || 0);
                          const isLowStock = available <= Number(item.minThreshold || 5);

                          return (
                            <tr key={item.id}>
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#94a3b8' }}>
                                {idx + 1}
                              </td>
                              <td>
                                <strong style={{ color: '#ffffff', fontSize: '13.5px' }}>{item.itemName}</strong>
                                <span className="inv-category-badge">{item.category}</span>
                              </td>
                              <td>
                                <span className={`chapter-badge-mini ${item.chapter.toLowerCase()}`}>{item.chapter}</span>
                              </td>
                              <td>
                                <span className="enrollment-tag">{item.batchRef}</span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {Object.entries(item.sizeBreakdown || {}).map(([size, count]) => (
                                    <span key={size} className="size-pill">
                                      {size}: {count}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 800, color: '#ffffff' }}>
                                {item.totalStock}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>
                                {item.allottedStock || 0}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 800, color: isLowStock ? '#f87171' : '#34d399' }}>
                                {available}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {isLowStock ? (
                                  <span className="status-pill status-allotted" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.15)' }}>
                                    <AlertTriangle size={12} /> Low (&le;{item.minThreshold})
                                  </span>
                                ) : (
                                  <span className="status-pill status-claimed">
                                    <Check size={12} /> Healthy
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  {/* Quick Plus (+) */}
                                  <button
                                    type="button"
                                    className="tf-btn-icon-approve"
                                    onClick={() => {
                                      setNewStockForm({
                                        ...newStockForm,
                                        chapter: item.chapter,
                                        itemName: item.itemName,
                                        category: item.category
                                      });
                                      setIsAddStockModalOpen(true);
                                    }}
                                    title="Add more stock units (+)"
                                  >
                                    <Plus size={14} />
                                  </button>

                                  {/* Quick Minus (-) */}
                                  <button
                                    type="button"
                                    className="tf-btn-icon-revert-appr"
                                    onClick={() => {
                                      setDecreaseStockForm({
                                        ...decreaseStockForm,
                                        itemId: item.id,
                                        chapter: item.chapter
                                      });
                                      setIsDecreaseStockModalOpen(true);
                                    }}
                                    title="Deduct damaged / written-off units (-)"
                                  >
                                    <Minus size={14} />
                                  </button>

                                  {/* Delete Item */}
                                  <button
                                    type="button"
                                    className="tf-btn-icon-danger"
                                    onClick={() => handleDeleteInventoryItem(item.id)}
                                    title="Delete Inventory Item"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="10" className="empty-table-msg">
                            No inventory items found matching your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* VIEW B: GOVERNANCE CLEARANCE DESKS & SWAG ALLOTMENT TABLE */
              <div>
                {/* ROLE DESK GUIDANCE & BANNER */}
                {activeRoleDesk === 'LEADS' && (
                  <div className="role-desk-info-banner leads-banner">
                    <div className="info-icon"><UserCheck size={20} /></div>
                    <div className="info-text">
                      <strong>Leads &amp; Co-Leads Operations Desk (Level 1 Clearance)</strong>
                      <p>Treasurer Leads and Chapter Co-Leads are responsible for preparing swag drops, tailoring custom kit allocations, mapping enrollment numbers, and submitting preliminary rosters for Level 2 verification.</p>
                    </div>
                  </div>
                )}

                {activeRoleDesk === 'CO_ORGANIZER' && (
                  <div className="role-desk-info-banner coorg-banner">
                    <div className="info-icon"><FileCheck size={20} /></div>
                    <div className="info-text">
                      <strong>Organizer &amp; Co-Organizer Verification Desk (Level 2 Clearance)</strong>
                      <p>Chapter Organizers &amp; Co-Organizers review all allocated kits against registered student builder records and verify participant active milestone attendance before signing off.</p>
                    </div>
                    {activeChapterApproval.status === 'DRAFT' && (
                      <button className="btn-desk-action-approve" onClick={handleCoOrganizerApprove}>
                        ✓ Sign-off as Co-Organizer
                      </button>
                    )}
                  </div>
                )}

                {activeRoleDesk === 'ADVISOR' && (
                  <div className="role-desk-info-banner advisor-banner">
                    <div className="info-icon"><GraduationCap size={20} /></div>
                    <div className="info-text">
                      <strong>Faculty Advisor &amp; Coordinator Desk (Level 3 Institutional Governance)</strong>
                      <p>Faculty Advisors review club budget alignment, event logistic permissions, and grant official university endorsement prior to universal release.</p>
                    </div>
                    {activeChapterApproval.status === 'CO_ORGANIZER_APPROVED' && (
                      <button className="btn-desk-action-approve" onClick={handleAdvisorApprove}>
                        🎓 Endorse as Faculty Advisor
                      </button>
                    )}
                  </div>
                )}

                {activeRoleDesk === 'SUPER_ADMIN' && (
                  <div className="role-desk-info-banner superadmin-banner">
                    <div className="info-icon"><Crown size={20} /></div>
                    <div className="info-text">
                      <strong>Super Administrator Command Desk (Level 4 Universal Seal)</strong>
                      <p>Universal Administrator root clearance certifies the distribution roster, embeds official institutional seals, and unlocks the high-resolution dual-logo printable distribution manifest.</p>
                    </div>
                    {isSuperAdmin && activeChapterApproval.status !== 'FINAL_APPROVED' && (
                      <button className="btn-desk-action-super" onClick={handleSuperAdminApprove}>
                        👑 Grant Final Super Admin Seal
                      </button>
                    )}
                  </div>
                )}

                {/* MULTI-STAGE APPROVAL WORKFLOW BANNER */}
                <div className="tf-approval-pipeline-banner">
                  <div className="pipeline-header-row">
                    <div className="pipeline-title-group">
                      <span className="pipeline-kicker">FOUR-TIER GOVERNANCE PIPELINE ({chapterFilter})</span>
                      <h4>Swags Allocation &amp; Official Manifest Multi-Role Approval Workflow</h4>
                    </div>
                    <div className="pipeline-status-badge-wrap">
                      {activeChapterApproval.status === 'DRAFT' && (
                        <span className="pipeline-badge badge-draft">🟡 Level 1: Created / Draft (Treasurer Lead)</span>
                      )}
                      {activeChapterApproval.status === 'CO_ORGANIZER_APPROVED' && (
                        <span className="pipeline-badge badge-co-org">🔵 Level 2: Co-Organizer Verified</span>
                      )}
                      {activeChapterApproval.status === 'ADVISOR_APPROVED' && (
                        <span className="pipeline-badge badge-co-org" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', borderColor: '#a855f7' }}>🟣 Level 3: Faculty Advisor Endorsed</span>
                      )}
                      {activeChapterApproval.status === 'FINAL_APPROVED' && (
                        <span className="pipeline-badge badge-super-admin">🟢 Level 4: Final Super Admin Approved (Print Ready)</span>
                      )}
                    </div>
                  </div>

                  {/* Workflow Stepper Line with 4 Stages */}
                  <div className="pipeline-steps-row">
                    {/* Stage 1 */}
                    <div className={`pipeline-step step-done`}>
                      <div className="step-circle">1</div>
                      <div className="step-info">
                        <span className="step-name">Leads &amp; Co-Leads</span>
                        <small>{activeChapterApproval.createdBy || 'Treasurer Lead / Co-Lead'}</small>
                      </div>
                    </div>
                    <div className="step-connector"></div>

                    {/* Stage 2 */}
                    <div className={`pipeline-step ${activeChapterApproval.coOrganizerApproval ? 'step-done' : 'step-pending'}`}>
                      <div className="step-circle">{activeChapterApproval.coOrganizerApproval ? '✓' : '2'}</div>
                      <div className="step-info">
                        <span className="step-name">Co-Organizer Review</span>
                        <small>{activeChapterApproval.coOrganizerApproval ? activeChapterApproval.coOrganizerApproval.approvedBy : 'Pending Sign-Off'}</small>
                      </div>
                    </div>
                    <div className="step-connector"></div>

                    {/* Stage 3 */}
                    <div className={`pipeline-step ${activeChapterApproval.advisorApproval ? 'step-done' : 'step-pending'}`}>
                      <div className="step-circle">{activeChapterApproval.advisorApproval ? '🎓' : '3'}</div>
                      <div className="step-info">
                        <span className="step-name">Faculty Advisor</span>
                        <small>{activeChapterApproval.advisorApproval ? activeChapterApproval.advisorApproval.approvedBy : 'Institutional Review'}</small>
                      </div>
                    </div>
                    <div className="step-connector"></div>

                    {/* Stage 4 */}
                    <div className={`pipeline-step ${activeChapterApproval.superAdminApproval ? 'step-done' : 'step-pending'}`}>
                      <div className="step-circle">{activeChapterApproval.superAdminApproval ? '👑' : '4'}</div>
                      <div className="step-info">
                        <span className="step-name">Super Admin Seal</span>
                        <small>{activeChapterApproval.superAdminApproval ? activeChapterApproval.superAdminApproval.approvedBy : 'Pending Final Seal'}</small>
                      </div>
                    </div>
                    <div className="step-connector"></div>

                    {/* Print Stage */}
                    <div className={`pipeline-step ${activeChapterApproval.status === 'FINAL_APPROVED' ? 'step-done' : 'step-locked'}`}>
                      <div className="step-circle">🖨️</div>
                      <div className="step-info">
                        <span className="step-name">Print Verified File</span>
                        <small>{activeChapterApproval.status === 'FINAL_APPROVED' ? 'Certified For Print' : 'Locked until Level 4'}</small>
                      </div>
                    </div>
                  </div>

                  {/* Role Action Bar for Approvals */}
                  <div className="pipeline-actions-bar">
                    {(isOrganizerOrCoLead || isSuperAdmin) && activeChapterApproval.status === 'DRAFT' && (
                      <button
                        type="button"
                        className="btn-pipeline-approve co-org"
                        onClick={handleCoOrganizerApprove}
                      >
                        ✓ Sign-off as Co-Organizer
                      </button>
                    )}

                    {(isAdvisor || isSuperAdmin) && (activeChapterApproval.status === 'CO_ORGANIZER_APPROVED' || activeChapterApproval.status === 'DRAFT') && (
                      <button
                        type="button"
                        className="btn-pipeline-approve co-org"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
                        onClick={handleAdvisorApprove}
                      >
                        🎓 Endorse as Faculty Advisor
                      </button>
                    )}

                    {isSuperAdmin && (
                      <button
                        type="button"
                        className="btn-pipeline-approve super-admin"
                        onClick={handleSuperAdminApprove}
                      >
                        👑 Super Admin Final Sign-Off &amp; Authorize Print
                      </button>
                    )}

                    {(isSuperAdmin || isOrganizerOrCoLead) && activeChapterApproval.status !== 'DRAFT' && (
                      <button
                        type="button"
                        className="btn-pipeline-revert"
                        onClick={handleRevertApproval}
                      >
                        ↩ Request Revision / Revert Approval
                      </button>
                    )}
                  </div>
                </div>

                {/* SECTION TOOLBAR */}
                <div className="tf-section-toolbar">
                  <div className="tf-search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search name, enrollment no, or allotted swag..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="tf-toolbar-actions">
                    <button
                      type="button"
                      className={`tf-btn-secondary ${isColumnPickerOpen ? 'active' : ''}`}
                      onClick={() => setIsColumnPickerOpen(!isColumnPickerOpen)}
                      title="Select limited columns to display or print"
                      style={{
                        borderColor: isColumnPickerOpen ? '#f59e0b' : undefined,
                        background: isColumnPickerOpen ? 'rgba(245, 158, 11, 0.2)' : undefined
                      }}
                    >
                      <SlidersHorizontal size={15} />
                      <span>Columns Filter ({Object.values(swagColumns).filter(Boolean).length}/9)</span>
                    </button>
                    <button
                      className={`tf-btn-secondary ${activeChapterApproval.status === 'FINAL_APPROVED' ? 'btn-print-certified' : ''}`}
                      onClick={handleExportSwagManifestPdf}
                      title="Export official printable distribution manifest with university & chapter logos"
                    >
                      <Printer size={15} />
                      <span>Export &amp; Print Manifest PDF</span>
                    </button>
                    <button className="tf-btn-primary" onClick={() => setIsAddSwagModalOpen(true)}>
                      <Plus size={15} />
                      <span>Allot Swag Kit</span>
                    </button>
                  </div>
                </div>

                {/* Column Selection Checkbox Bar for Limited Column Display & Print */}
                {isColumnPickerOpen && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.96)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    marginBottom: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(16px)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckSquare size={16} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>
                          Select Columns to Print &amp; Display:
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          (Check/uncheck boxes to print limited or specific columns only)
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const allOn = {};
                            SWAG_COLUMN_OPTIONS.forEach(c => { allOn[c.key] = true; });
                            setSwagColumns(allOn);
                          }}
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            color: '#60a5fa',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSwagColumns({
                              srNo: true,
                              studentName: true,
                              enrollmentNo: true,
                              department: true,
                              swagItem: true,
                              remark: true,
                              approvalStatus: true,
                              status: true,
                              signature: true
                            });
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#cbd5e1',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
                      {SWAG_COLUMN_OPTIONS.map(col => (
                        <label
                          key={col.key}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '5px 11px',
                            borderRadius: '8px',
                            background: swagColumns[col.key] ? 'rgba(245, 158, 11, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${swagColumns[col.key] ? 'rgba(245, 158, 11, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: swagColumns[col.key] ? '#fbbf24' : '#94a3b8',
                            userSelect: 'none'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!swagColumns[col.key]}
                            onChange={(e) => {
                              setSwagColumns(prev => ({ ...prev, [col.key]: e.target.checked }));
                            }}
                            style={{ accentColor: '#f59e0b', cursor: 'pointer', width: '14px', height: '14px' }}
                          />
                          <span style={{ fontWeight: swagColumns[col.key] ? 600 : 400 }}>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Swag Distribution Table */}
                <div className="tf-table-container">
                  <table className="tf-data-table">
                    <thead>
                      <tr>
                        {swagColumns.srNo && <th style={{ width: '60px', textAlign: 'center' }}>SR.NO</th>}
                        {swagColumns.studentName && <th>NAME</th>}
                        {swagColumns.enrollmentNo && <th>ENROLLMENT NO</th>}
                        {swagColumns.department && <th>DEPARTMENT &amp; DIRECTOR / LEAD</th>}
                        {swagColumns.swagItem && <th>ALLOTTED SWAGS</th>}
                        {swagColumns.remark && <th>REMARK</th>}
                        {swagColumns.approvalStatus && <th style={{ textAlign: 'center', minWidth: '220px' }}>APPROVAL SEAL &amp; VERIFIED BY</th>}
                        {swagColumns.status && <th style={{ textAlign: 'center', width: '130px' }}>CLAIM STATUS</th>}
                        <th style={{ textAlign: 'right', width: '220px' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSwags.length > 0 ? (
                        filteredSwags.map((swag, idx) => (
                          <tr key={swag.id} className={swag.status === 'CLAIMED' ? 'row-claimed' : ''}>
                            {swagColumns.srNo && (
                              <td style={{ textAlign: 'center', fontWeight: 600, color: '#94a3b8' }}>
                                {idx + 1}
                              </td>
                            )}
                            {swagColumns.studentName && (
                              <td>
                                <strong style={{ color: '#f8fafc', fontSize: '14px' }}>{swag.studentName}</strong>
                              </td>
                            )}
                            {swagColumns.enrollmentNo && (
                              <td>
                                <span className="enrollment-tag" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                  {swag.enrollmentNo}
                                </span>
                              </td>
                            )}
                            {swagColumns.department && (
                              <td>
                                <strong style={{ color: '#ffffff', fontSize: '13px', display: 'block' }}>
                                  {swag.department || 'Technical Team'}
                                </strong>
                                <span style={{ color: '#38bdf8', fontSize: '11.5px', fontWeight: 500 }}>
                                  Dir: {swag.directorName || getDepartmentDirector(swag.department, swag.chapter)}
                                </span>
                              </td>
                            )}
                            {swagColumns.swagItem && (
                              <td>
                                <span style={{ color: '#38bdf8', fontWeight: 700, letterSpacing: '0.2px', fontSize: '12.5px', textTransform: 'uppercase' }}>
                                  {swag.swagItem || '—'}
                                </span>
                              </td>
                            )}
                            {swagColumns.remark && (
                              <td>
                                <span style={{ color: '#cbd5e1', fontSize: '12.5px' }}>
                                  {swag.remark || '—'}
                                </span>
                              </td>
                            )}
                            {swagColumns.approvalStatus && (
                              <td style={{ textAlign: 'center' }}>
                                {swag.approvalStatus === 'SUPER_ADMIN_APPROVED' && (
                                  <div className="status-pill status-approved-super" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, fontSize: '11.5px', color: '#34d399' }}>
                                      <Crown size={13} />
                                      <span>{swag.approvedBy || 'Bhavikkumar Patel (Super Admin)'}</span>
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 700 }}>⭐ Final Super Admin Seal</span>
                                  </div>
                                )}
                                {swag.approvalStatus === 'CO_ORGANIZER_APPROVED' && (
                                  <div className="status-pill status-approved-coorg" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, fontSize: '11.5px', color: '#60a5fa' }}>
                                      <CheckCircle2 size={13} />
                                      <span>{swag.approvedBy || 'Tannvi Acharya (Co-Organizer)'}</span>
                                    </div>
                                    <span style={{ fontSize: '10px', opacity: 0.9, fontWeight: 600 }}>✓ Chapter Verified</span>
                                  </div>
                                )}
                                {(!swag.approvalStatus || swag.approvalStatus === 'PENDING_APPROVAL') && (
                                  <span className="status-pill status-pending-approval" title="Awaiting Verification & Sign-off">
                                    <Clock size={12} />
                                    <span>Pending Review</span>
                                  </span>
                                )}
                              </td>
                            )}
                            {swagColumns.status && (
                              <td style={{ textAlign: 'center' }}>
                                <span className={`status-pill ${swag.status === 'CLAIMED' ? 'status-claimed' : 'status-allotted'}`}>
                                  {swag.status === 'CLAIMED' ? '✓ CLAIMED' : '⏳ ALLOTTED'}
                                </span>
                              </td>
                            )}
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                {/* Row-Level Approval Quick Actions */}
                                {(!swag.approvalStatus || swag.approvalStatus === 'PENDING_APPROVAL') && (isOrganizerOrCoLead || isAdvisor || isSuperAdmin) && (
                                  <button
                                    type="button"
                                    className="tf-btn-icon-approve"
                                    onClick={() => handleApproveIndividualSwag(swag, isSuperAdmin ? 'SUPER_ADMIN_APPROVED' : 'CO_ORGANIZER_APPROVED')}
                                    title={isSuperAdmin ? "👑 Super Admin Direct Final Seal" : "✓ Co-Organizer / Advisor Sign-Off"}
                                  >
                                    {isSuperAdmin ? <Crown size={13} /> : <Check size={13} />}
                                  </button>
                                )}

                                {swag.approvalStatus === 'CO_ORGANIZER_APPROVED' && isSuperAdmin && (
                                  <button
                                    type="button"
                                    className="tf-btn-icon-super"
                                    onClick={() => handleApproveIndividualSwag(swag, 'SUPER_ADMIN_APPROVED')}
                                    title="👑 Super Admin Final Seal"
                                  >
                                    <Crown size={13} />
                                  </button>
                                )}

                                {swag.approvalStatus && swag.approvalStatus !== 'PENDING_APPROVAL' && (isSuperAdmin || isOrganizerOrCoLead) && (
                                  <button
                                    type="button"
                                    className="tf-btn-icon-revert-appr"
                                    onClick={() => handleApproveIndividualSwag(swag, 'PENDING_APPROVAL')}
                                    title="↩ Revert Approval to Pending"
                                  >
                                    <RotateCcw size={12} />
                                  </button>
                                )}

                                {/* Claim / Revert Handover Toggle */}
                                <button
                                  type="button"
                                  className={`btn-claim-toggle ${swag.status === 'CLAIMED' ? 'btn-revert' : 'btn-claim'}`}
                                  onClick={() => handleToggleClaimSwag(swag)}
                                  title={swag.status === 'CLAIMED' ? 'Click to revert to Allotted' : 'Click on-spot to mark Claimed'}
                                >
                                  {swag.status === 'CLAIMED' ? '↩ Revert' : '🎁 Mark Claimed'}
                                </button>

                                {/* EDIT ALLOCATED SWAG BUTTON */}
                                <button
                                  type="button"
                                  className="tf-btn-icon-edit"
                                  onClick={() => handleStartEditSwag(swag)}
                                  title="Edit Allocated Swags & Student Details"
                                >
                                  <Edit size={14} />
                                </button>

                                {/* DELETE BUTTON */}
                                <button
                                  type="button"
                                  className="tf-btn-icon-danger"
                                  onClick={() => handleDeleteSwag(swag.id)}
                                  title="Delete Swag Entry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="empty-table-msg">
                            No swag allocations found matching your filter or search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* HIDDEN OFFICIAL PRINTABLE MANIFEST WITH UNIVERSITY & CHAPTER LOGOS + PHYSICAL SIGNATURES */}
            <div style={{ display: 'none' }}>
              <div id="swag-manifest-printable-sheet" style={{ padding: '24px', fontFamily: "'Arial', sans-serif", color: '#0f172a', background: '#ffffff', minHeight: '1000px' }}>

                {/* OFFICIAL HEADER WITH LOGOS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #0f172a', paddingBottom: '14px', marginBottom: '16px' }}>
                  {/* Left University Logo */}
                  <div style={{ width: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {itmbuLogo ? (
                      <img src={itmbuLogo} alt="ITMBU Logo" style={{ maxHeight: '75px', maxWidth: '85px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', border: '1px solid #94a3b8', padding: '6px', borderRadius: '4px' }}>
                        ITM (sls)<br />Baroda Univ
                      </div>
                    )}
                  </div>

                  {/* Center Title Banner */}
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      ITM (sls) BARODA UNIVERSITY
                    </h1>
                    <h2 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>
                      {chapterFilter === 'AWS_SBG' ? 'AWS Student Builder Group (AWS SBG Chapter)' : (chapterFilter === 'TECHNO_LAB' ? 'Techno Lab Innovation & Robotics Cell' : (chapterFilter === 'GDGOC' ? 'Google Developer Groups on Campus (GDGOC)' : 'Student Chapters Joint Council'))}
                    </h2>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }}>
                      Official Swag &amp; Logistics Distribution Manifest (Certified File)
                    </h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                      Audit Ref: ITMBU-SWAG-MANIFEST-{new Date().toISOString().split('T')[0]} &bull; Generated: {new Date().toLocaleString()}
                    </p>
                  </div>

                  {/* Right Chapter Logo */}
                  <div style={{ width: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {clubLogo ? (
                      <img src={clubLogo} alt="Club Logo" style={{ maxHeight: '75px', maxWidth: '85px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#d97706', textAlign: 'center', border: '1px solid #d97706', padding: '6px', borderRadius: '4px' }}>
                        {chapterFilter}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit & Manifest Summary Strip with Approvals Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', marginBottom: '16px' }}>
                  <div><strong>Total Allotted:</strong> {swagStats.totalAllotted} Kits</div>
                  <div><strong>Total Claimed:</strong> {swagStats.totalClaimed} Kits</div>
                  <div><strong>Pending Pickup:</strong> {swagStats.totalPending} Kits</div>
                  <div>
                    <strong>Manifest Approval Seal:</strong>{' '}
                    <span style={{
                      color: activeChapterApproval.status === 'FINAL_APPROVED' ? '#059669' : '#2563eb',
                      fontWeight: 'bold',
                      background: activeChapterApproval.status === 'FINAL_APPROVED' ? '#dcfce7' : '#dbeafe',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${activeChapterApproval.status === 'FINAL_APPROVED' ? '#86efac' : '#93c5fd'}`
                    }}>
                      {activeChapterApproval.status === 'FINAL_APPROVED' ? '👑 CERTIFIED FOR PRINT & DISTRIBUTION' : activeChapterApproval.status}
                    </span>
                  </div>
                </div>

                {/* Master Distribution Table with Explicit Approvals Column & Department/Director */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', marginBottom: '24px' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                      {swagColumns.srNo && <th style={{ border: '1px solid #0f172a', padding: '7px 4px', textAlign: 'center', width: '35px' }}>Sr.No</th>}
                      {swagColumns.studentName && <th style={{ border: '1px solid #0f172a', padding: '7px 8px', textAlign: 'left' }}>Student Full Name</th>}
                      {swagColumns.enrollmentNo && <th style={{ border: '1px solid #0f172a', padding: '7px 6px', textAlign: 'center', width: '80px' }}>Enrollment No</th>}
                      {swagColumns.department && <th style={{ border: '1px solid #0f172a', padding: '7px 8px', textAlign: 'left' }}>Department &amp; Director / Lead</th>}
                      {swagColumns.swagItem && <th style={{ border: '1px solid #0f172a', padding: '7px 8px', textAlign: 'left' }}>Alloted Swags</th>}
                      {swagColumns.remark && <th style={{ border: '1px solid #0f172a', padding: '7px 6px', textAlign: 'left' }}>Remark / Size</th>}
                      {swagColumns.approvalStatus && <th style={{ border: '1px solid #0f172a', padding: '7px 6px', textAlign: 'center', width: '140px' }}>Approval Seal &amp; Sign-off</th>}
                      {swagColumns.status && <th style={{ border: '1px solid #0f172a', padding: '7px 6px', textAlign: 'center', width: '65px' }}>Status</th>}
                      {swagColumns.signature && <th style={{ border: '1px solid #0f172a', padding: '7px 8px', textAlign: 'center', width: '90px' }}>Student Signature</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSwags.map((item, idx) => (
                      <tr key={item.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        {swagColumns.srNo && <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>}
                        {swagColumns.studentName && <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 'bold', color: '#0f172a' }}>{item.studentName}</td>}
                        {swagColumns.enrollmentNo && <td style={{ border: '1px solid #cbd5e1', padding: '6px 6px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>{item.enrollmentNo}</td>}
                        {swagColumns.department && (
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', color: '#1e293b' }}>
                            <strong style={{ color: '#0f172a' }}>{item.department || 'Technical Team'}</strong>
                            <div style={{ fontSize: '9px', color: '#475569' }}>Dir: {item.directorName || getDepartmentDirector(item.department, item.chapter)}</div>
                          </td>
                        )}
                        {swagColumns.swagItem && <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', color: '#1e293b' }}>{item.swagItem}</td>}
                        {swagColumns.remark && <td style={{ border: '1px solid #cbd5e1', padding: '6px 6px', color: '#475569' }}>{item.remark || '—'}</td>}
                        {swagColumns.approvalStatus && (
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '9.5px', color: item.approvalStatus === 'SUPER_ADMIN_APPROVED' ? '#059669' : (item.approvalStatus === 'CO_ORGANIZER_APPROVED' ? '#2563eb' : '#d97706') }}>
                            {item.approvalStatus === 'SUPER_ADMIN_APPROVED' 
                              ? `👑 ${item.approvedBy || 'Bhavikkumar Patel (Super Admin)'}` 
                              : (item.approvalStatus === 'CO_ORGANIZER_APPROVED' 
                                  ? `✓ ${item.approvedBy || 'Tannvi Acharya (Co-Organizer)'}` 
                                  : '⏳ Pending Review')}
                          </td>
                        )}
                        {swagColumns.status && (
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', color: item.status === 'CLAIMED' ? '#059669' : '#d97706' }}>
                            {item.status}
                          </td>
                        )}
                        {swagColumns.signature && <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', height: '28px' }}></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* OFFICIAL FOUR-TIER INSTITUTIONAL PHYSICAL SIGNATURE MATRIX */}
                <div style={{ marginTop: '24px', borderTop: '2px solid #0f172a', paddingTop: '14px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.5px' }}>
                    Institutional Governance &amp; Four-Tier Physical Signature &amp; Seal Matrix
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>

                    {/* 1. Leads & Co-Leads Sign-off */}
                    <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '10px 8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '145px' }}>
                      <div style={{ fontSize: '9.5px', color: '#475569', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        LEVEL 1: LEADS &amp; CO-LEADS
                      </div>

                      {/* Designated Physical Blank Space for Pen Signature */}
                      <div style={{ height: '48px', borderBottom: '1.5px dashed #94a3b8', margin: '8px 4px 6px 4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ fontSize: '8px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '2px' }}>[ Sign / Stamp Here ]</span>
                      </div>

                      <div style={{ textAlign: 'left', padding: '0 4px' }}>
                        <div style={{ fontSize: '9.5px', color: '#0f172a', marginBottom: '3px' }}>
                          <strong>Name:</strong> __________________
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b' }}>
                          Chapter Operations &amp; Treasurer Lead
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '3px' }}>
                          Date: ____________
                        </div>
                      </div>
                    </div>

                    {/* 2. Co-Organizer Review */}
                    <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '10px 8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '145px' }}>
                      <div style={{ fontSize: '9.5px', color: '#475569', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        LEVEL 2: CO-ORGANIZER
                      </div>

                      {/* Designated Physical Blank Space for Pen Signature */}
                      <div style={{ height: '48px', borderBottom: '1.5px dashed #94a3b8', margin: '8px 4px 6px 4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ fontSize: '8px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '2px' }}>[ Sign / Stamp Here ]</span>
                      </div>

                      <div style={{ textAlign: 'left', padding: '0 4px' }}>
                        <div style={{ fontSize: '9.5px', color: '#0f172a', marginBottom: '3px' }}>
                          <strong>Name:</strong> __________________
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b' }}>
                          Chapter Co-Organizer / Vice-Chair
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '3px' }}>
                          Date: ____________
                        </div>
                      </div>
                    </div>

                    {/* 3. Faculty Advisor */}
                    <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '10px 8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '145px' }}>
                      <div style={{ fontSize: '9.5px', color: '#475569', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        LEVEL 3: FACULTY ADVISOR
                      </div>

                      {/* Designated Physical Blank Space for Pen Signature */}
                      <div style={{ height: '48px', borderBottom: '1.5px dashed #94a3b8', margin: '8px 4px 6px 4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ fontSize: '8px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '2px' }}>[ Sign / Stamp Here ]</span>
                      </div>

                      <div style={{ textAlign: 'left', padding: '0 4px' }}>
                        <div style={{ fontSize: '9.5px', color: '#0f172a', marginBottom: '3px' }}>
                          <strong>Name:</strong> __________________
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b' }}>
                          Faculty Coordinator &amp; Mentor
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '3px' }}>
                          Date: ____________
                        </div>
                      </div>
                    </div>

                    {/* 4. Super Admin Final Seal */}
                    <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '10px 8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '145px' }}>
                      <div style={{ fontSize: '9.5px', color: '#475569', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        LEVEL 4: SUPER ADMIN
                      </div>

                      {/* Designated Physical Blank Space for Pen Signature */}
                      <div style={{ height: '48px', borderBottom: '1.5px dashed #94a3b8', margin: '8px 4px 6px 4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ fontSize: '8px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '2px' }}>[ Sign / Stamp Here ]</span>
                      </div>

                      <div style={{ textAlign: 'left', padding: '0 4px' }}>
                        <div style={{ fontSize: '9.5px', color: '#0f172a', marginBottom: '3px' }}>
                          <strong>Name:</strong> __________________
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b' }}>
                          Universal Root Administrator
                        </div>
                        <div style={{ fontSize: '8.5px', color: '#64748b', marginTop: '3px' }}>
                          Date: ____________
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: EVENT BUDGET TRACKER */}
        {/* ================================================================= */}
        {activeTab === 'budgets' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Sanctioned Event Budgets &amp; Expenditure Burn Meter</h3>
                <p>Track sanctioned amounts vs live approved vouchers per chapter event.</p>
              </div>
              <button className="tf-btn-primary" onClick={() => setIsAddBudgetModalOpen(true)}>
                <Plus size={15} />
                <span>Sanction Event Budget</span>
              </button>
            </div>

            <div className="tf-budget-cards-grid">
              {(financeData.eventBudgets || [])
                .filter(b => chapterFilter === 'ALL' || b.chapter === chapterFilter)
                .map((budget) => {
                  const eventVouchers = (financeData.expenseVouchers || []).filter(v => v.eventName === budget.eventName);
                  const eventSpent = eventVouchers
                    .filter(v => v.status === 'SETTLED' || v.status === 'FACULTY_APPROVED')
                    .reduce((sum, v) => sum + Number(v.amount || 0), 0);
                  const pct = Math.min(100, Math.round((eventSpent / (budget.sanctionedAmount || 1)) * 100));

                  return (
                    <div key={budget.id} className="tf-budget-card">
                      <div className="budget-card-header">
                        <div>
                          <span className={`chapter-badge-mini ${budget.chapter.toLowerCase()}`}>{budget.chapter}</span>
                          <h4>{budget.eventName}</h4>
                        </div>
                        <button
                          className="tf-btn-icon-danger"
                          onClick={() => handleDeleteBudget(budget.id)}
                          title="Delete Budget"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="budget-financial-stats">
                        <div className="b-stat">
                          <span>Sanctioned</span>
                          <strong>₹{budget.sanctionedAmount.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="b-stat">
                          <span>Spent</span>
                          <strong style={{ color: pct > 80 ? '#ef4444' : '#10b981' }}>₹{eventSpent.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="b-stat">
                          <span>Remaining</span>
                          <strong>₹{(budget.sanctionedAmount - eventSpent).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      <div className="budget-burn-bar">
                        <div className={`bar-fill ${pct > 80 ? 'danger' : ''}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <small className="pct-label">{pct}% Utilized &bull; {eventVouchers.length} Vouchers linked</small>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: EXPENSE VOUCHERS & REIMBURSEMENTS */}
        {/* ================================================================= */}
        {activeTab === 'vouchers' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Multi-Stage Expense Voucher &amp; Bill Verification Desk</h3>
                <p>Core member bill uploads &rarr; Treasurer verification &rarr; Faculty Mentor approval &rarr; Settle.</p>
              </div>
              <button className="tf-btn-primary" onClick={() => setIsAddVoucherModalOpen(true)}>
                <Plus size={15} />
                <span>Submit Expense Voucher</span>
              </button>
            </div>

            <div className="tf-table-container">
              <table className="tf-data-table">
                <thead>
                  <tr>
                    <th>VOUCHER TITLE &amp; EVENT</th>
                    <th>CHAPTER</th>
                    <th>SUBMITTED BY</th>
                    <th>AMOUNT</th>
                    <th>RECEIPT / BILL</th>
                    <th>APPROVAL WORKFLOW</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {(financeData.expenseVouchers || [])
                    .filter(v => chapterFilter === 'ALL' || v.chapter === chapterFilter)
                    .map((v) => (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.title}</strong>
                          <span className="sub-label">{v.eventName} ({v.category})</span>
                        </td>
                        <td>
                          <span className={`chapter-badge-mini ${v.chapter.toLowerCase()}`}>{v.chapter}</span>
                        </td>
                        <td>
                          <strong>{v.submittedBy}</strong>
                          <span className="sub-label">{v.billDate} &bull; {v.paymentMode}</span>
                        </td>
                        <td>
                          <span className="voucher-amount-tag">₹{v.amount.toLocaleString('en-IN')}</span>
                        </td>
                        <td>
                          {v.receiptUrl ? (
                            <button
                              type="button"
                              className="btn-view-receipt"
                              onClick={() => setPreviewReceipt(v)}
                            >
                              <Eye size={13} />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <span className="text-muted">No Receipt</span>
                          )}
                        </td>
                        <td>
                          <span className={`voucher-flow-badge flow-${v.status.toLowerCase()}`}>
                            {v.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {v.status === 'SUBMITTED' && (
                              <button
                                className="btn-action-small btn-verify"
                                onClick={() => handleAdvanceVoucherStatus(v, 'TREASURER_VERIFIED')}
                                title="Verify as Treasurer"
                              >
                                ✓ Verify
                              </button>
                            )}
                            {v.status === 'TREASURER_VERIFIED' && (
                              <button
                                className="btn-action-small btn-approve"
                                onClick={() => handleAdvanceVoucherStatus(v, 'FACULTY_APPROVED')}
                                title="Faculty / Organizer Sign-off"
                              >
                                ✓ Sign-off
                              </button>
                            )}
                            {v.status === 'FACULTY_APPROVED' && (
                              <button
                                className="btn-action-small btn-settle"
                                onClick={() => handleAdvanceVoucherStatus(v, 'SETTLED')}
                                title="Mark Reimbursement Settled"
                              >
                                💰 Settle
                              </button>
                            )}
                            <button
                              className="tf-btn-icon-danger"
                              onClick={() => handleDeleteVoucher(v.id)}
                              title="Delete Voucher"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SPONSORSHIP & INFLOWS LEDGER */}
        {/* ================================================================= */}
        {activeTab === 'sponsorships' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Sponsorships, College Grants &amp; Inflows Ledger</h3>
                <p>External sponsor grants, hackathon registration pools, and university fund allocations.</p>
              </div>
              <button className="tf-btn-primary" onClick={() => setIsAddInflowModalOpen(true)}>
                <Plus size={15} />
                <span>Record Inflow / Sponsor</span>
              </button>
            </div>

            <div className="tf-table-container">
              <table className="tf-data-table">
                <thead>
                  <tr>
                    <th>SPONSOR / SOURCE NAME</th>
                    <th>CHAPTER</th>
                    <th>CATEGORY</th>
                    <th>AMOUNT (₹)</th>
                    <th>TRANSACTION / UTR REF</th>
                    <th>DATE &amp; NOTES</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {(financeData.sponsorshipInflows || [])
                    .filter(i => chapterFilter === 'ALL' || i.chapter === chapterFilter)
                    .map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.sponsorName}</strong>
                        </td>
                        <td>
                          <span className={`chapter-badge-mini ${item.chapter.toLowerCase()}`}>{item.chapter}</span>
                        </td>
                        <td>
                          <span className="inflow-cat-badge">{item.category}</span>
                        </td>
                        <td>
                          <span className="inflow-amount-tag">+₹{item.amount.toLocaleString('en-IN')}</span>
                        </td>
                        <td>
                          <span className="utr-ref-code">{item.utrReferenceNo}</span>
                        </td>
                        <td>
                          <span>{item.paymentDate}</span>
                          <small className="sub-label">{item.notes}</small>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="tf-btn-icon-danger"
                            onClick={() => handleDeleteInflow(item.id)}
                            title="Delete Inflow"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: HARDWARE & ASSET LENDING MONITOR */}
        {/* ================================================================= */}
        {activeTab === 'hardware' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Club Hardware &amp; Event Equipment Lending Hub</h3>
                <p>Track IoT kits, sensors, wireless mics, and AV equipment with deposits &amp; return due dates.</p>
              </div>
              <button className="tf-btn-primary" onClick={() => setIsAddHardwareModalOpen(true)}>
                <Plus size={15} />
                <span>Issue Hardware / Asset</span>
              </button>
            </div>

            <div className="tf-table-container">
              <table className="tf-data-table">
                <thead>
                  <tr>
                    <th>ASSET NAME &amp; TAG</th>
                    <th>CHAPTER</th>
                    <th>BORROWER (NAME &amp; ENROLLMENT)</th>
                    <th>CONTACT</th>
                    <th>ISSUE &amp; EXPECTED DUE DATE</th>
                    <th>SECURITY DEPOSIT</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {(financeData.hardwareLendings || [])
                    .filter(h => chapterFilter === 'ALL' || h.chapter === chapterFilter)
                    .map((item) => (
                      <tr key={item.id} className={item.status === 'OVERDUE' ? 'row-overdue' : ''}>
                        <td>
                          <strong>{item.assetName}</strong>
                          <span className="asset-tag-badge">🏷️ {item.assetTag}</span>
                        </td>
                        <td>
                          <span className={`chapter-badge-mini ${item.chapter.toLowerCase()}`}>{item.chapter}</span>
                        </td>
                        <td>
                          <strong>{item.borrowerName}</strong>
                          <span className="enrollment-tag">Enr: {item.enrollmentNo}</span>
                        </td>
                        <td>{item.contactNo}</td>
                        <td>
                          <div>Issued: {item.issuedDate}</div>
                          <div className={item.status === 'OVERDUE' ? 'text-danger font-bold' : ''}>
                            Due: {item.expectedReturnDate}
                          </div>
                        </td>
                        <td>
                          {item.depositAmount > 0 ? (
                            <span className="deposit-tag">₹{item.depositAmount} Deposit</span>
                          ) : (
                            <span className="text-muted">₹0 (Internal)</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill status-${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {item.status !== 'RETURNED' ? (
                              <button
                                className="btn-return-hardware"
                                onClick={() => handleReturnHardware(item)}
                              >
                                ✓ Return
                              </button>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '12px' }}>Returned</span>
                            )}
                            <button
                              className="tf-btn-icon-danger"
                              onClick={() => handleDeleteHardware(item.id)}
                              title="Delete Hardware"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}

      {/* 1. ALLOT SWAG MODAL */}
      {isAddSwagModalOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Allot Swag Kit to Student</h3>
              <button onClick={() => setIsAddSwagModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSwagSubmit}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhavik Patel"
                    value={newSwagForm.studentName}
                    onChange={e => setNewSwagForm({ ...newSwagForm, studentName: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Enrollment no *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2306005"
                    value={newSwagForm.enrollmentNo}
                    onChange={e => setNewSwagForm({ ...newSwagForm, enrollmentNo: e.target.value })}
                  />
                </div>
              </div>

              {/* Department Auto-Map & Director Manual / Auto Edit */}
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Department (Auto-Maps Director) *</label>
                  <select
                    value={newSwagForm.department || 'Technical Team'}
                    onChange={e => {
                      const selectedDept = e.target.value;
                      const mappedDir = getDepartmentDirector(selectedDept, newSwagForm.chapter);
                      setNewSwagForm({
                        ...newSwagForm,
                        department: selectedDept,
                        directorName: mappedDir
                      });
                    }}
                  >
                    <option value="Technical Team">Technical Team</option>
                    <option value="Event Management">Event Management</option>
                    <option value="Designing Team">Designing &amp; Media Team</option>
                    <option value="PR & Marketing">PR &amp; Marketing</option>
                    <option value="Documentation & Legal">Documentation &amp; Legal Advocate</option>
                    <option value="Finance & Sponsorship">Finance &amp; Sponsorship</option>
                    <option value="R&D / Innovation">R&amp;D / Innovation Cell</option>
                    <option value="Core Operations">Core Operations</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Department Director / Lead Name (Auto-Mapped / Editable) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhavikkumar Patel (Technical Director)"
                    value={newSwagForm.directorName || ''}
                    onChange={e => setNewSwagForm({ ...newSwagForm, directorName: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Alloted Swags (Type By User) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Type custom swag items (e.g. AWS T-Shirt, Bag, Bottle, Stickers)"
                    value={newSwagForm.swagItem}
                    onChange={e => setNewSwagForm({ ...newSwagForm, swagItem: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Remark (Any custom note)</label>
                  <input
                    type="text"
                    placeholder="e.g. Size: L, Verified at Desk, Active Builder"
                    value={newSwagForm.remark}
                    onChange={e => setNewSwagForm({ ...newSwagForm, remark: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Chapter *</label>
                  <select
                    value={newSwagForm.chapter}
                    onChange={e => setNewSwagForm({ ...newSwagForm, chapter: e.target.value })}
                  >
                    <option value="AWS_SBG">AWS Student Builder Group</option>
                    <option value="TECHNO_LAB">Techno Lab Innovation Chapter</option>
                    <option value="GDGOC">Google Developer Groups on Campus</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Initial Claim Status</label>
                  <select
                    value={newSwagForm.status}
                    onChange={e => setNewSwagForm({ ...newSwagForm, status: e.target.value })}
                  >
                    <option value="ALLOTTED">⏳ ALLOTTED</option>
                    <option value="CLAIMED">✓ CLAIMED</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Approval Level</label>
                  <select
                    value={newSwagForm.approvalStatus}
                    onChange={e => setNewSwagForm({ ...newSwagForm, approvalStatus: e.target.value })}
                  >
                    <option value="PENDING_APPROVAL">⏳ Pending Review</option>
                    <option value="CO_ORGANIZER_APPROVED">✓ Co-Organizer / Advisor Approved</option>
                    <option value="SUPER_ADMIN_APPROVED">👑 Super Admin Certified</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddSwagModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Allot Swag</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT ALLOCATED SWAG MODAL */}
      {isEditSwagModalOpen && editingSwag && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Edit Allocated Swag &amp; Approval Record</h3>
              <button onClick={() => { setIsEditSwagModalOpen(false); setEditingSwag(null); }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditedSwag}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Name *</label>
                  <input
                    type="text"
                    required
                    value={editingSwag.studentName}
                    onChange={e => setEditingSwag({ ...editingSwag, studentName: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Enrollment no *</label>
                  <input
                    type="text"
                    required
                    value={editingSwag.enrollmentNo}
                    onChange={e => setEditingSwag({ ...editingSwag, enrollmentNo: e.target.value })}
                  />
                </div>
              </div>

              {/* Department Auto-Map & Director Manual / Auto Edit */}
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Department (Auto-Maps Director) *</label>
                  <select
                    value={editingSwag.department || 'Technical Team'}
                    onChange={e => {
                      const selectedDept = e.target.value;
                      const mappedDir = getDepartmentDirector(selectedDept, editingSwag.chapter);
                      setEditingSwag({
                        ...editingSwag,
                        department: selectedDept,
                        directorName: mappedDir
                      });
                    }}
                  >
                    <option value="Technical Team">Technical Team</option>
                    <option value="Event Management">Event Management</option>
                    <option value="Designing Team">Designing &amp; Media Team</option>
                    <option value="PR & Marketing">PR &amp; Marketing</option>
                    <option value="Documentation & Legal">Documentation &amp; Legal Advocate</option>
                    <option value="Finance & Sponsorship">Finance &amp; Sponsorship</option>
                    <option value="R&D / Innovation">R&amp;D / Innovation Cell</option>
                    <option value="Core Operations">Core Operations</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Department Director / Lead Name (Auto-Mapped / Editable) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhavikkumar Patel (Technical Director)"
                    value={editingSwag.directorName || ''}
                    onChange={e => setEditingSwag({ ...editingSwag, directorName: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Alloted Swags (Type By User) *</label>
                  <input
                    type="text"
                    required
                    value={editingSwag.swagItem}
                    onChange={e => setEditingSwag({ ...editingSwag, swagItem: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Remark (Any custom note)</label>
                  <input
                    type="text"
                    value={editingSwag.remark || ''}
                    onChange={e => setEditingSwag({ ...editingSwag, remark: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Chapter *</label>
                  <select
                    value={editingSwag.chapter}
                    onChange={e => setEditingSwag({ ...editingSwag, chapter: e.target.value })}
                  >
                    <option value="AWS_SBG">AWS Student Builder Group</option>
                    <option value="TECHNO_LAB">Techno Lab Innovation Chapter</option>
                    <option value="GDGOC">Google Developer Groups on Campus</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Claim Status</label>
                  <select
                    value={editingSwag.status}
                    onChange={e => setEditingSwag({ ...editingSwag, status: e.target.value })}
                  >
                    <option value="ALLOTTED">⏳ ALLOTTED</option>
                    <option value="CLAIMED">✓ CLAIMED</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Approval Level</label>
                  <select
                    value={editingSwag.approvalStatus || 'PENDING_APPROVAL'}
                    onChange={e => setEditingSwag({ ...editingSwag, approvalStatus: e.target.value })}
                  >
                    <option value="PENDING_APPROVAL">⏳ Pending Review</option>
                    <option value="CO_ORGANIZER_APPROVED">✓ Co-Organizer / Advisor Approved</option>
                    <option value="SUPER_ADMIN_APPROVED">👑 Super Admin Certified</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => { setIsEditSwagModalOpen(false); setEditingSwag(null); }}>Cancel</button>
                <button type="submit" className="btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SUBMIT EXPENSE VOUCHER MODAL */}
      {isAddVoucherModalOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Submit Expense Voucher &amp; Bill Receipt</h3>
              <button onClick={() => setIsAddVoucherModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitVoucher}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Expense Title / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium Sound System &amp; Mics"
                    value={newVoucherForm.title}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, title: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={newVoucherForm.amount}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Event Name *</label>
                  <select
                    value={newVoucherForm.eventName}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, eventName: e.target.value })}
                  >
                    {(financeData.eventBudgets || []).map(b => (
                      <option key={b.id} value={b.eventName}>{b.eventName} ({b.chapter})</option>
                    ))}
                  </select>
                </div>
                <div className="form-col">
                  <label>Expense Category *</label>
                  <select
                    value={newVoucherForm.category}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, category: e.target.value })}
                  >
                    <option value="Refreshments & Food">Refreshments &amp; Food</option>
                    <option value="Printing & Badges">Printing &amp; Badges</option>
                    <option value="Venue & Decor">Venue &amp; Decor</option>
                    <option value="Audio Visual & Stage">Audio Visual &amp; Stage</option>
                    <option value="Hardware & Kits">Hardware &amp; Kits</option>
                    <option value="Other Expenses">Other Expenses</option>
                  </select>
                </div>
              </div>

              {/* Bill Receipt Upload Field */}
              <div className="bill-upload-box">
                <label>Upload Bill Receipt (PNG / JPG / PDF)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptUpload}
                />
                {newVoucherForm.receiptName && (
                  <span className="file-ready-tag">✓ Attached: {newVoucherForm.receiptName}</span>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddVoucherModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Submit Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BILL RECEIPT PREVIEW MODAL */}
      {previewReceipt && (
        <div className="tf-modal-overlay" onClick={() => setPreviewReceipt(null)}>
          <div className="tf-modal-card receipt-preview-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Bill Receipt: {previewReceipt.title}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  Amount: ₹{previewReceipt.amount.toLocaleString()} &bull; {previewReceipt.eventName}
                </p>
              </div>
              <button onClick={() => setPreviewReceipt(null)}><X size={18} /></button>
            </div>
            <div className="receipt-preview-body">
              {previewReceipt.receiptUrl ? (
                <img src={previewReceipt.receiptUrl} alt="Receipt Preview" />
              ) : (
                <p>No receipt image attached.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setPreviewReceipt(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SANCTION BUDGET MODAL */}
      {isAddBudgetModalOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Sanction New Event Budget</h3>
              <button onClick={() => setIsAddBudgetModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddBudgetSubmit}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Bootcamp 2026"
                    value={newBudgetForm.eventName}
                    onChange={e => setNewBudgetForm({ ...newBudgetForm, eventName: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Chapter *</label>
                  <select
                    value={newBudgetForm.chapter}
                    onChange={e => setNewBudgetForm({ ...newBudgetForm, chapter: e.target.value })}
                  >
                    <option value="AWS_SBG">AWS Student Builder Group</option>
                    <option value="TECHNO_LAB">Techno Lab Innovation Chapter</option>
                    <option value="GDGOC">Google Developer Groups on Campus</option>
                  </select>
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Total Sanctioned Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={newBudgetForm.sanctionedAmount}
                    onChange={e => setNewBudgetForm({ ...newBudgetForm, sanctionedAmount: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Refreshments &amp; Food (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18000"
                    value={newBudgetForm.refreshmentsAndFood}
                    onChange={e => setNewBudgetForm({ ...newBudgetForm, refreshmentsAndFood: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddBudgetModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Sanction Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ISSUE HARDWARE MODAL */}
      {isAddHardwareModalOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Issue Hardware / Asset Kit</h3>
              <button onClick={() => setIsAddHardwareModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddHardwareSubmit}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Asset Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raspberry Pi 4 Kit + Sensors"
                    value={newHardwareForm.assetName}
                    onChange={e => setNewHardwareForm({ ...newHardwareForm, assetName: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Asset Tag / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. TECH-RPI-05"
                    value={newHardwareForm.assetTag}
                    onChange={e => setNewHardwareForm({ ...newHardwareForm, assetTag: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Borrower Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhavik Patel"
                    value={newHardwareForm.borrowerName}
                    onChange={e => setNewHardwareForm({ ...newHardwareForm, borrowerName: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Borrower Enrollment No</label>
                  <input
                    type="text"
                    placeholder="e.g. 2306005"
                    value={newHardwareForm.enrollmentNo}
                    onChange={e => setNewHardwareForm({ ...newHardwareForm, enrollmentNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newHardwareForm.contactNo}
                    onChange={e => setNewHardwareForm({ ...newHardwareForm, contactNo: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Expected Return Date</label>
                  <input
                    type="date"
                    value={newHardwareForm.expectedReturnDate}
                    onChange={e => setNewHardwareForm({ ...newHardwareForm, expectedReturnDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddHardwareModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Issue Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RECORD INFLOW MODAL */}
      {isAddInflowModalOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Record Sponsorship &amp; Inflow</h3>
              <button onClick={() => setIsAddInflowModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddInflowSubmit}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Sponsor / Grant Source Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS UG Gujarat Community Grant"
                    value={newInflowForm.sponsorName}
                    onChange={e => setNewInflowForm({ ...newInflowForm, sponsorName: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={newInflowForm.amount}
                    onChange={e => setNewInflowForm({ ...newInflowForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Category</label>
                  <select
                    value={newInflowForm.category}
                    onChange={e => setNewInflowForm({ ...newInflowForm, category: e.target.value })}
                  >
                    <option value="Corporate Sponsorship">Corporate Sponsorship</option>
                    <option value="Community Grant">Community Grant</option>
                    <option value="University Allocation">University Allocation</option>
                    <option value="Participant Registration Pool">Participant Registration Pool</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Transaction / UTR Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-HDFC-99201"
                    value={newInflowForm.utrReferenceNo}
                    onChange={e => setNewInflowForm({ ...newInflowForm, utrReferenceNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddInflowModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Inflow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. SEPARATE ADD SWAG STOCK MODAL (+) */}
      {isAddStockModalOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={18} />
                </div>
                <h3>Add Swag Stock Batch (+)</h3>
              </div>
              <button onClick={() => setIsAddStockModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddStockSubmit}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Chapter *</label>
                  <select
                    value={newStockForm.chapter}
                    onChange={e => setNewStockForm({ ...newStockForm, chapter: e.target.value })}
                  >
                    <option value="AWS_SBG">AWS Student Builder Group</option>
                    <option value="TECHNO_LAB">Techno Lab Innovation Chapter</option>
                    <option value="GDGOC">Google Developer Groups on Campus</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Swag Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud Builder T-Shirt (Navy Blue)"
                    value={newStockForm.itemName}
                    onChange={e => setNewStockForm({ ...newStockForm, itemName: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Category *</label>
                  <select
                    value={newStockForm.category}
                    onChange={e => setNewStockForm({ ...newStockForm, category: e.target.value })}
                  >
                    <option value="Apparel">Apparel (T-Shirts / Hoodies / Caps)</option>
                    <option value="Tech Gadgets">Tech Gadgets (Bottles / USB / Hubs)</option>
                    <option value="Stickers & Pins">Stickers &amp; Enamel Pins</option>
                    <option value="Bags & Accessories">Bags &amp; Accessories</option>
                    <option value="Core Kits">Core Leadership Kits</option>
                    <option value="General Kit">General Swag Kit</option>
                  </select>
                </div>
                <div className="form-col">
                  <label>Total Quantity Inward (+) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={newStockForm.quantity}
                    onChange={e => setNewStockForm({ ...newStockForm, quantity: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Min Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5"
                    value={newStockForm.minThreshold}
                    onChange={e => setNewStockForm({ ...newStockForm, minThreshold: e.target.value })}
                  />
                </div>
              </div>

              {/* Size Breakdown (Optional) */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                  Size Breakdown (Optional - for Apparel)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Size S</span>
                    <input
                      type="number"
                      min="0"
                      value={newStockForm.sizeS}
                      onChange={e => setNewStockForm({ ...newStockForm, sizeS: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Size M</span>
                    <input
                      type="number"
                      min="0"
                      value={newStockForm.sizeM}
                      onChange={e => setNewStockForm({ ...newStockForm, sizeM: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Size L</span>
                    <input
                      type="number"
                      min="0"
                      value={newStockForm.sizeL}
                      onChange={e => setNewStockForm({ ...newStockForm, sizeL: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Size XL</span>
                    <input
                      type="number"
                      min="0"
                      value={newStockForm.sizeXL}
                      onChange={e => setNewStockForm({ ...newStockForm, sizeXL: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Batch / Drop Ref Code</label>
                  <input
                    type="text"
                    placeholder="e.g. AWS-SUMMIT-BATCH-03"
                    value={newStockForm.batchRef}
                    onChange={e => setNewStockForm({ ...newStockForm, batchRef: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                  <Plus size={15} /> Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. SEPARATE DECREASE / WRITE-OFF STOCK MODAL (-) */}
      {isDecreaseStockModalOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={18} />
                </div>
                <h3>Decrease / Write-off Stock (-)</h3>
              </div>
              <button onClick={() => setIsDecreaseStockModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleDecreaseStockSubmit}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Select Inventory Swag Item *</label>
                  <select
                    required
                    value={decreaseStockForm.itemId}
                    onChange={e => {
                      const invList = Array.isArray(financeData?.swagInventory) ? financeData.swagInventory : (INITIAL_FINANCE_DATA.swagInventory || []);
                      const sel = invList.find(i => i.id === e.target.value);
                      setDecreaseStockForm({
                        ...decreaseStockForm,
                        itemId: e.target.value,
                        chapter: sel ? sel.chapter : decreaseStockForm.chapter
                      });
                    }}
                  >
                    <option value="">-- Choose Inventory Item --</option>
                    {(Array.isArray(financeData?.swagInventory) ? financeData.swagInventory : (INITIAL_FINANCE_DATA.swagInventory || []))
                      .filter(i => chapterFilter === 'ALL' || i.chapter === chapterFilter)
                      .map(inv => {
                        const avail = Number(inv.totalStock || 0) - Number(inv.allottedStock || 0) - Number(inv.damagedStock || 0);
                        return (
                          <option key={inv.id} value={inv.id}>
                            {inv.itemName} ({inv.chapter}) &bull; {avail} Available
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Quantity to Deduct (-) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 3"
                    value={decreaseStockForm.quantity}
                    onChange={e => setDecreaseStockForm({ ...decreaseStockForm, quantity: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Reason for Decrease *</label>
                  <select
                    value={decreaseStockForm.reason}
                    onChange={e => setDecreaseStockForm({ ...decreaseStockForm, reason: e.target.value })}
                  >
                    <option value="DAMAGED">⚠️ Damaged / Defective Goods</option>
                    <option value="RETURNED_TO_SPONSOR">↩ Returned to Sponsor / AWS</option>
                    <option value="LOST_DISCREPANCY">❓ Lost / Physical Count Discrepancy</option>
                    <option value="DIRECT_EVENT_USAGE">🎪 Direct On-Stage / Speaker Gift Usage</option>
                  </select>
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Audit Notes / Log Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 shirts had misprint on AWS logo, written off"
                    value={decreaseStockForm.notes}
                    onChange={e => setDecreaseStockForm({ ...decreaseStockForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsDecreaseStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}>
                  <Minus size={15} /> Deduct Stock Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
