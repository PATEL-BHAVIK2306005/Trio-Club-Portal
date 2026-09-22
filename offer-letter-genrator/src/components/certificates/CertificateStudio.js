import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { QRCodeSVG } from 'qrcode.react';
import BulkView from './BULK VIEW';
import {
  EVENT_CATEGORIES,
  generateCertificateId,
  generateVerificationHash
} from '../../data/certificateData';
import {
  downloadFhdCertificatePng
} from '../../utils/fhdCertificateRenderer';
import {
  saveCertificatesToCloud,
  saveActiveTemplateToSupabase,
  saveSingleCertificateToSupabase,
  getLocalTemplate
} from '../../services/certificateVaultService';
import { sendDirectReactEmail } from '../../services/reactEmailService';
import { CLUB_CONFIGS } from '../../data/teamData';
import {
  Image as ImageIcon,
  Type,
  QrCode,
  Hash,
  Link2,
  Download,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Eye,
  Search,
  ExternalLink,
  Maximize2,
  Minimize2,
  Mail,
  Send,
  Loader2,
  X,
  RotateCcw
} from 'lucide-react';

const MULTI_COLORS = [
  { name: 'Jet Black', hex: '#0f172a' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Vibrant Blue', hex: '#0284c7' },
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Royal Gold', hex: '#d97706' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Violet Purple', hex: '#9333ea' },
  { name: 'Dark Slate', hex: '#475569' }
];

export default function CertificateStudio({
  certificates = [],
  setCertificates,
  activeOrg = 'AWS_SBG',
  currentUser = null,
  itmbuLogo = null,
  clubLogo = null,
  onOpenPublicVerification = null
}) {
  // Main Studio Mode: 'generator' | 'bulk_view' | 'vault'
  const [studioMode, setStudioMode] = useState('generator');

  // Enlarged canvas preview state
  const [isEnlarged, setIsEnlarged] = useState(false);

  // Currently active single certificate
  const [selectedCertId] = useState(() => {
    const orgCerts = (certificates || []).filter(c => !c.organization || c.organization === activeOrg);
    return orgCerts.length > 0 ? orgCerts[0].id : (certificates?.[0]?.id || '');
  });

  // Active certificate object
  const activeCert = (certificates || []).find(c => c.id === selectedCertId) ||
                     (certificates || []).find(c => !c.organization || c.organization === activeOrg) ||
                     certificates?.[0] || null;

  // Custom Field Positions & Typography for Active Cert
  const currentPositions = activeCert?.fieldPositions || {
    name: { x: 50, y: 50, fontSize: 36, color: '#0f172a', fontFamily: 'Verdana, sans-serif', fontWeight: 'bold', show: true },
    qrCode: { x: 88, y: 80, size: 70, show: true },
    hash: { x: 50, y: 88, fontSize: 13, color: '#475569', fontFamily: 'monospace', bgPill: 'none', show: true },
    verificationUrl: { x: 50, y: 92, fontSize: 12, color: '#0284c7', fontFamily: 'Verdana, sans-serif', bgPill: 'none', show: true }
  };

  // Currently selected overlay element to adjust controls
  const [activeElementKey, setActiveElementKey] = useState('name'); // 'name' | 'qrCode' | 'hash' | 'verificationUrl'

  // Dragging state on canvas
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const previewCanvasRef = useRef(null);

  // Download loading indicator
  const [isDownloading, setIsDownloading] = useState(false);

  // Bulk Generation Modal & State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkEventBatch, setBulkEventBatch] = useState(null); // When viewing a specific event batch in BULK VIEW
  const [bulkEventForm, setBulkEventForm] = useState({
    eventTitle: 'AWS Cloud Day & National Hackathon 2026',
    category: 'HACKATHON',
    issuedDate: new Date().toISOString().split('T')[0],
    organization: activeOrg || 'AWS_SBG',
    roleOrDescription: 'Participant — Certificate of Participation',
    badgeType: 'COMPLETION'
  });

  const [bulkCsvInput, setBulkCsvInput] = useState(
`Aarav Sharma|aarav.sharma@example.com
Diya Patel|diya.patel@example.com
Rohan Mehta|rohan.mehta@example.com
Aditi Verma|aditi.verma@example.com
Vikram Singh|vikram.singh@example.com`
  );

  // Credential Vault search & event filter
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCategoryFilter, setVaultCategoryFilter] = useState('ALL');

  // Single Certificate Email State
  const [isSingleEmailModalOpen, setIsSingleEmailModalOpen] = useState(false);
  const [isSendingSingleEmail, setIsSendingSingleEmail] = useState(false);
  const [singleEmailForm, setSingleEmailForm] = useState({
    recipientName: '',
    recipientEmail: '',
    eventTitle: '',
    category: 'WORKSHOP'
  });

  // Handler: Send Single Certificate Email
  const handleSendSingleCertificateEmail = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetEmail = (singleEmailForm.recipientEmail || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      Swal.fire('Invalid Email', 'Please provide a valid recipient email address.', 'error');
      return;
    }

    setIsSendingSingleEmail(true);

    try {
      const recipientName = (singleEmailForm.recipientName || activeCert?.recipientName || 'bhavik patel').trim();
      const eventTitle = (singleEmailForm.eventTitle || activeCert?.eventTitle || 'Campus Technical Event 2026').trim();
      const category = singleEmailForm.category || activeCert?.category || 'WORKSHOP';
      const certId = activeCert?.credentialId || activeCert?.id || generateCertificateId(category, new Date().getFullYear());
      const hash = activeCert?.hash || generateVerificationHash(certId, recipientName);
      const issuedDate = activeCert?.issuedDate || new Date().toISOString().split('T')[0];
      const org = activeCert?.organization || activeOrg || 'AWS_SBG';
      const club = CLUB_CONFIGS[org] || CLUB_CONFIGS.AWS_SBG;

      const certUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(certId)}`
        : `https://itmbu-credentials.org/?verify=${encodeURIComponent(certId)}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
          <div style="text-align: center; border-bottom: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Official Verified Credential</span>
            <h2 style="color: #ffffff; margin: 10px 0 0 0;">${eventTitle}</h2>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Issued by ${club.name}</p>
          </div>
          <p style="font-size: 16px;">Dear <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            Congratulations on your achievement! Your official Full HD certificate has been cryptographically minted and registered.
          </p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Certificate ID:</strong> <span style="color: #38bdf8; font-family: monospace;">${certId}</span></p>
            <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Cryptographic Hash:</strong> <span style="color: #a78bfa; font-family: monospace; font-size: 11px;">${hash}</span></p>
            <p style="margin: 0; font-size: 13px;"><strong>Issue Date:</strong> ${issuedDate}</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${certUrl}" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              🔍 View & Verify Your Certificate
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
            ITM (sls) Baroda University • Official Digital Credential Authority
          </p>
        </div>
      `;

      await sendDirectReactEmail({
        toEmail: targetEmail,
        recipientName: recipientName,
        subject: `🎉 Verified Certificate of Achievement: ${eventTitle} • ${recipientName}`,
        htmlContent: emailHtml,
        activeOrg: org
      });

      // Update active certificate object
      const updatedCert = {
        ...activeCert,
        id: certId,
        credentialId: certId,
        recipientName: recipientName,
        recipientEmail: targetEmail,
        eventTitle: eventTitle,
        category: category,
        organization: org,
        issuedDate: issuedDate,
        hash: hash,
        fieldPositions: currentPositions,
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        verifiedStatus: 'AUTHENTIC_VERIFIED'
      };

      // Save to Supabase individual isolated section and master vault
      await saveSingleCertificateToSupabase(updatedCert);

      const nextList = certificates.map(c => c.id === activeCert.id ? updatedCert : c);
      if (!nextList.some(c => c.id === updatedCert.id)) {
        nextList.unshift(updatedCert);
      }
      setCertificates(nextList);
      saveCertificatesToCloud(nextList);

      setIsSingleEmailModalOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Certificate Email Sent! 🚀',
        html: `Official certificate with verification token successfully dispatched to <b>${targetEmail}</b>.`,
        confirmButtonColor: '#0f172a'
      });

    } catch (err) {
      console.error(err);
      Swal.fire('Email Error', err.message || 'Failed to dispatch certificate email.', 'error');
    } finally {
      setIsSendingSingleEmail(false);
    }
  };

  // Update active certificate helper
  const handleUpdateActiveCert = (field, value) => {
    if (!activeCert) return;
    const updatedCert = {
      ...activeCert,
      [field]: value,
      organization: activeCert.organization || activeOrg
    };

    if (field === 'recipientName' || field === 'eventTitle') {
      updatedCert.hash = generateVerificationHash(updatedCert.credentialId || updatedCert.id, updatedCert.recipientName);
    }

    const nextList = certificates.map(c => c.id === activeCert.id ? updatedCert : c);
    setCertificates(nextList);
    saveCertificatesToCloud(nextList);
  };

  // Update specific overlay field attribute (e.g. x, y, fontSize, color, fontFamily, bgPill)
  const handleUpdateElementProperty = (elementKey, propKey, value) => {
    if (!activeCert) return;
    const elConfig = currentPositions[elementKey] || {};
    const updatedPositions = {
      ...currentPositions,
      [elementKey]: {
        ...elConfig,
        [propKey]: value
      }
    };
    handleUpdateActiveCert('fieldPositions', updatedPositions);
  };

  // Template Upload Handler
  const handleTemplateFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid File', 'Please upload a valid image file (PNG, JPG, JPEG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      saveActiveTemplateToSupabase(dataUrl);
      handleUpdateActiveCert('customBgImage', dataUrl);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Template Uploaded Successfully!',
        showConfirmButton: false,
        timer: 2000,
        background: '#0f172a',
        color: '#f8fafc'
      });
    };
    reader.readAsDataURL(file);
  };

  // Immediate Test Verification Sync Handler
  const handleTestVerification = async () => {
    const template = activeCert?.customBgImage || getLocalTemplate();
    const updatedCert = {
      ...(activeCert || {}),
      id: activeCert?.id || 'CERT-2026-HACK-L2PQ7271',
      credentialId: activeCert?.credentialId || activeCert?.id || 'CERT-2026-HACK-L2PQ7271',
      recipientName: activeCert?.recipientName || 'bhavik patel',
      customBgImage: template,
      fieldPositions: currentPositions,
      organization: activeCert?.organization || activeOrg || 'AWS_SBG'
    };
    if (template) {
      saveActiveTemplateToSupabase(template);
    }
    await saveSingleCertificateToSupabase(updatedCert);
    handleUpdateActiveCert('fieldPositions', currentPositions);
    if (onOpenPublicVerification) {
      onOpenPublicVerification(updatedCert.credentialId || updatedCert.id);
    }
  };

  // Drag and Drop Canvas Handlers
  const handleCanvasMouseDown = (e, elementKey) => {
    e.stopPropagation();
    setActiveElementKey(elementKey);
    setDraggedElement(elementKey);
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !draggedElement || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const pctX = Math.round(Math.max(2, Math.min(98, (offsetX / rect.width) * 100)) * 10) / 10;
    const pctY = Math.round(Math.max(2, Math.min(98, (offsetY / rect.height) * 100)) * 10) / 10;

    handleUpdateElementProperty(draggedElement, 'x', pctX);
    handleUpdateElementProperty(draggedElement, 'y', pctY);
  };

  const handleCanvasMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedElement(null);
    }
  };

  // Download High Definition PNG
  const handleDownloadSingleFhd = async () => {
    if (!activeCert) return;
    setIsDownloading(true);
    try {
      await downloadFhdCertificatePng(activeCert);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'FHD Certificate Downloaded! (1920x1080)',
        showConfirmButton: false,
        timer: 2500,
        background: '#0f172a',
        color: '#f8fafc'
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Export Error', 'Failed to render high-definition image', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Parse CSV (supports Name|Email ID or Name,Email ID)
  const parseCsvRecipients = () => {
    const lines = bulkCsvInput.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed = [];

    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('email'))) {
        return;
      }

      let name = '';
      let email = '';

      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        name = parts[0];
        email = parts[1] || '';
      } else if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        name = parts[0];
        email = parts[1] || '';
      } else if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim());
        name = parts[0];
        email = parts[1] || '';
      } else {
        name = line;
      }

      if (name) {
        parsed.push({ name, email });
      }
    });

    return parsed;
  };

  // Handle Bulk Generation & Transition to BULK VIEW
  const handleMintBulkBatch = () => {
    const recipients = parseCsvRecipients();
    if (recipients.length === 0) {
      Swal.fire('No Recipients', 'Please provide at least one recipient in Name|Email ID format.', 'error');
      return;
    }

    const { eventTitle, category, issuedDate, organization, roleOrDescription, badgeType } = bulkEventForm;
    const year = new Date().getFullYear();

    const newBatch = recipients.map((r) => {
      const certId = generateCertificateId(category, year);
      const hash = generateVerificationHash(certId, r.name);

      return {
        id: certId,
        credentialId: certId,
        recipientName: r.name,
        recipientEmail: r.email,
        recipientCollege: 'ITM (sls) Baroda University',
        recipientDepartment: 'Computer Science & Engineering',
        category: category,
        eventTitle: eventTitle,
        roleOrAchievement: roleOrDescription,
        badgeType: badgeType || 'COMPLETION',
        theme: 'GOLD_NAVY',
        organization: organization || activeOrg,
        issuedDate: issuedDate,
        expiryDate: 'Lifetime Validity',
        customBgImage: activeCert?.customBgImage || null,
        fieldPositions: currentPositions,
        verifiedStatus: 'AUTHENTIC_VERIFIED',
        hash: hash,
        emailSent: false,
        createdAt: new Date().toISOString()
      };
    });

    const updatedCertList = [...newBatch, ...certificates];
    setCertificates(updatedCertList);
    saveCertificatesToCloud(updatedCertList);

    setIsBulkModalOpen(false);
    setBulkEventBatch({
      eventTitle,
      category,
      issuedDate,
      organization,
      certificates: newBatch
    });
    setStudioMode('bulk_view');

    Swal.fire({
      icon: 'success',
      title: `${newBatch.length} Certificates Generated! 🎉`,
      text: 'Opening Bulk Preview view for instant FHD verification and dispatch.',
      confirmButtonColor: '#0f172a',
      timer: 2500
    });
  };

  // Event Vault Grouping
  const eventGroups = {};
  (certificates || []).forEach(c => {
    const eventKey = `${c.eventTitle || 'Untitled Event'}__${c.issuedDate || 'No Date'}`;
    if (!eventGroups[eventKey]) {
      eventGroups[eventKey] = {
        key: eventKey,
        eventTitle: c.eventTitle || 'Untitled Event',
        issuedDate: c.issuedDate || '2026-03-25',
        category: c.category || 'WORKSHOP',
        organization: c.organization || 'AWS_SBG',
        items: []
      };
    }
    eventGroups[eventKey].items.push(c);
  });

  const eventGroupList = Object.values(eventGroups).filter(grp => {
    const matchesOrg = !grp.organization || grp.organization === activeOrg || activeOrg === 'ALL';
    const matchesCat = vaultCategoryFilter === 'ALL' || grp.category === vaultCategoryFilter;
    const matchesQuery = !vaultSearch ||
      grp.eventTitle.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      grp.items.some(i => i.recipientName?.toLowerCase().includes(vaultSearch.toLowerCase()) || i.hash?.toLowerCase().includes(vaultSearch.toLowerCase()));
    return matchesOrg && matchesCat && matchesQuery;
  });

  // Current base URL for preview
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://itmbu-credentials.org';

  const previewCertId = activeCert?.credentialId || activeCert?.id || 'CERT-2026-FHD-001';
  const previewVerificationUrl = `${baseUrl}?verify=${encodeURIComponent(previewCertId)}`;

  // IF IN BULK VIEW MODE: Render BULK VIEW.jsx component
  if (studioMode === 'bulk_view') {
    const batchList = bulkEventBatch
      ? (certificates || []).filter(c => c.eventTitle === bulkEventBatch.eventTitle && c.issuedDate === bulkEventBatch.issuedDate)
      : (certificates || []);

    return (
      <BulkView
        eventBatch={bulkEventBatch}
        batchCertificates={batchList.length > 0 ? batchList : certificates}
        onUpdateCertificates={(newList) => {
          setCertificates(newList);
          saveCertificatesToCloud(newList);
        }}
        onBackToStudio={() => setStudioMode('generator')}
        activeOrg={activeOrg}
        onOpenVerification={onOpenPublicVerification}
      />
    );
  }

  return (
    <div
      className="certificate-studio-app"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      style={{ padding: '24px 30px', maxWidth: isEnlarged ? '100%' : '1650px', margin: '0 auto', color: '#0f172a', fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      {/* Top Header & View Tabs */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '20px',
        padding: '18px 26px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Certificate Generator
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Upload a template, position your text, and generate custom certificates.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setStudioMode('generator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              background: studioMode === 'generator' ? '#ffffff' : 'transparent',
              color: studioMode === 'generator' ? '#0f172a' : '#64748b',
              boxShadow: studioMode === 'generator' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Sparkles size={16} color={studioMode === 'generator' ? '#0284c7' : '#64748b'} /> Generator Studio
          </button>

          <button
            onClick={() => setStudioMode('vault')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '9px',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              background: studioMode === 'vault' ? '#ffffff' : 'transparent',
              color: studioMode === 'vault' ? '#0f172a' : '#64748b',
              boxShadow: studioMode === 'vault' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Layers size={16} color={studioMode === 'vault' ? '#10b981' : '#64748b'} /> Credential Vault (By Event)
          </button>
        </div>
      </div>

      {/* VIEW 1: GENERATOR STUDIO (Matches Exact User Mockup UI + Enlarged Mode) */}
      {studioMode === 'generator' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isEnlarged ? '340px 1fr' : '380px 1fr',
          gap: '26px',
          alignItems: 'start'
        }}>

          {/* LEFT COLUMN: 1. Template Upload & Customization Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 1. Template Upload Box */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                1. Template Upload
              </h3>

              <label
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleTemplateFileUpload(file);
                }}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f8fafc',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleTemplateFileUpload(file);
                  }}
                />
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  marginBottom: '10px'
                }}>
                  <ImageIcon size={24} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155', lineHeight: 1.4 }}>
                  Drag & drop a certificate template here,<br />or click to select file
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  Supports PNG, JPG, JPEG
                </span>
              </label>

              {activeCert?.customBgImage && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: '#10b981', fontWeight: '700' }}>
                    ✓ Custom Template Active
                  </span>
                  <button
                    onClick={() => handleUpdateActiveCert('customBgImage', null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Remove Template
                  </button>
                </div>
              )}
            </div>

            {/* Customization Controls Box */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                  Customization Controls
                </h3>
              </div>

              {/* Element Selector Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px', marginBottom: '16px' }}>
                {[
                  { id: 'name', label: 'Candidate', icon: Type },
                  { id: 'qrCode', label: 'QR Code', icon: QrCode },
                  { id: 'hash', label: 'Hash ID', icon: Hash },
                  { id: 'verificationUrl', label: 'Verify URL', icon: Link2 }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSelected = activeElementKey === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveElementKey(tab.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '7px 4px',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: isSelected ? '#ffffff' : 'transparent',
                        color: isSelected ? '#0f172a' : '#64748b',
                        boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <Icon size={12} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Controls based on selected element */}
              {activeElementKey === 'name' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Text Name Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Text Name
                    </label>
                    <input
                      type="text"
                      value={activeCert?.recipientName || ''}
                      onChange={(e) => handleUpdateActiveCert('recipientName', e.target.value)}
                      placeholder="e.g. bhavik patel"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Font Size Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      <span>Font Size</span>
                      <span style={{ color: '#0284c7' }}>{currentPositions.name?.fontSize || 36}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="72"
                      value={currentPositions.name?.fontSize || 36}
                      onChange={(e) => handleUpdateElementProperty('name', 'fontSize', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Font Family Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Font Family
                    </label>
                    <select
                      value={currentPositions.name?.fontFamily || 'Verdana, sans-serif'}
                      onChange={(e) => handleUpdateElementProperty('name', 'fontFamily', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    >
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="'Playfair Display', Georgia, serif">Playfair Display (Luxury Serif)</option>
                      <option value="'Cinzel', serif">Cinzel (Imperial Classic)</option>
                      <option value="'Montserrat', sans-serif">Montserrat (Modern Clean)</option>
                      <option value="'Great Vibes', cursive">Great Vibes (Calligraphy Script)</option>
                      <option value="'Inter', sans-serif">Inter (Executive Sans)</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Georgia', serif">Georgia</option>
                      <option value="monospace">Monospace (Code / Tech)</option>
                    </select>
                  </div>

                  {/* Multi-Color Palette for Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Text Color & Multi-Color Swatches
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {MULTI_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => handleUpdateElementProperty('name', 'color', c.hex)}
                          title={c.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: c.hex,
                            border: currentPositions.name?.color === c.hex ? '2.5px solid #0284c7' : '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={currentPositions.name?.color || '#0f172a'}
                        onChange={(e) => handleUpdateElementProperty('name', 'color', e.target.value)}
                        style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={currentPositions.name?.color || '#0f172a'}
                        onChange={(e) => handleUpdateElementProperty('name', 'color', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>

                  {/* Coordinates: X Position & Y Position */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        X Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.name?.x ?? 50}
                        onChange={(e) => handleUpdateElementProperty('name', 'x', Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Y Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.name?.y ?? 50}
                        onChange={(e) => handleUpdateElementProperty('name', 'y', Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Controls for QR Code */}
              {activeElementKey === 'qrCode' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                      Show QR Code
                    </label>
                    <input
                      type="checkbox"
                      checked={currentPositions.qrCode?.show !== false}
                      onChange={(e) => handleUpdateElementProperty('qrCode', 'show', e.target.checked)}
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      <span>QR Size</span>
                      <span style={{ color: '#0284c7' }}>{currentPositions.qrCode?.size || 70}px</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="140"
                      value={currentPositions.qrCode?.size || 70}
                      onChange={(e) => handleUpdateElementProperty('qrCode', 'size', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        X Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.qrCode?.x ?? 88}
                        onChange={(e) => handleUpdateElementProperty('qrCode', 'x', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Y Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.qrCode?.y ?? 80}
                        onChange={(e) => handleUpdateElementProperty('qrCode', 'y', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Controls for Hash ID with Multi-Color & Pill Badges */}
              {activeElementKey === 'hash' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                      Show Hash ID
                    </label>
                    <input
                      type="checkbox"
                      checked={currentPositions.hash?.show !== false}
                      onChange={(e) => handleUpdateElementProperty('hash', 'show', e.target.checked)}
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Multi-Color Selection for Hash ID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Hash ID Multi-Color Palette
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {MULTI_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => handleUpdateElementProperty('hash', 'color', c.hex)}
                          title={c.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: c.hex,
                            border: currentPositions.hash?.color === c.hex ? '2.5px solid #0284c7' : '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={currentPositions.hash?.color || '#475569'}
                        onChange={(e) => handleUpdateElementProperty('hash', 'color', e.target.value)}
                        style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={currentPositions.hash?.color || '#475569'}
                        onChange={(e) => handleUpdateElementProperty('hash', 'color', e.target.value)}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  {/* Badge Background Pill Style */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Background Contrast Pill
                    </label>
                    <select
                      value={currentPositions.hash?.bgPill || 'none'}
                      onChange={(e) => handleUpdateElementProperty('hash', 'bgPill', e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                    >
                      <option value="none">None (Plain Text Overlay)</option>
                      <option value="dark">Dark Frosted Glass Badge (High Contrast)</option>
                      <option value="light">Crisp White Badge (Clean Card)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      <span>Font Size</span>
                      <span style={{ color: '#0284c7' }}>{currentPositions.hash?.fontSize || 13}px</span>
                    </div>
                    <input
                      type="range"
                      min="9"
                      max="24"
                      value={currentPositions.hash?.fontSize || 13}
                      onChange={(e) => handleUpdateElementProperty('hash', 'fontSize', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        X Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.hash?.x ?? 50}
                        onChange={(e) => handleUpdateElementProperty('hash', 'x', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Y Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.hash?.y ?? 88}
                        onChange={(e) => handleUpdateElementProperty('hash', 'y', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Controls for Verification URL with Multi-Color & Pill Badges */}
              {activeElementKey === 'verificationUrl' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                      Show Verification URL
                    </label>
                    <input
                      type="checkbox"
                      checked={currentPositions.verificationUrl?.show !== false}
                      onChange={(e) => handleUpdateElementProperty('verificationUrl', 'show', e.target.checked)}
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Multi-Color Selection for Verification URL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      URL Multi-Color Palette
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {MULTI_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => handleUpdateElementProperty('verificationUrl', 'color', c.hex)}
                          title={c.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: c.hex,
                            border: currentPositions.verificationUrl?.color === c.hex ? '2.5px solid #0284c7' : '1.5px solid #cbd5e1',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={currentPositions.verificationUrl?.color || '#0284c7'}
                        onChange={(e) => handleUpdateElementProperty('verificationUrl', 'color', e.target.value)}
                        style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={currentPositions.verificationUrl?.color || '#0284c7'}
                        onChange={(e) => handleUpdateElementProperty('verificationUrl', 'color', e.target.value)}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  {/* Badge Background Pill Style */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Background Contrast Pill
                    </label>
                    <select
                      value={currentPositions.verificationUrl?.bgPill || 'none'}
                      onChange={(e) => handleUpdateElementProperty('verificationUrl', 'bgPill', e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                    >
                      <option value="none">None (Plain Text Overlay)</option>
                      <option value="dark">Dark Frosted Glass Badge (High Contrast)</option>
                      <option value="light">Crisp White Badge (Clean Card)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      <span>Font Size</span>
                      <span style={{ color: '#0284c7' }}>{currentPositions.verificationUrl?.fontSize || 12}px</span>
                    </div>
                    <input
                      type="range"
                      min="9"
                      max="24"
                      value={currentPositions.verificationUrl?.fontSize || 12}
                      onChange={(e) => handleUpdateElementProperty('verificationUrl', 'fontSize', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        X Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.verificationUrl?.x ?? 50}
                        onChange={(e) => handleUpdateElementProperty('verificationUrl', 'x', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Y Position (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={currentPositions.verificationUrl?.y ?? 92}
                        onChange={(e) => handleUpdateElementProperty('verificationUrl', 'y', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Drag Tip Note */}
              <div style={{
                marginTop: '16px',
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '11.5px',
                color: '#64748b',
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                Tip: You can also drag the text, QR code, or tokens directly on the preview to reposition it.
              </div>
            </div>

            {/* Action Buttons Box */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}>
              {/* Single Certificate Send / Resend Email Button */}
              <button
                type="button"
                onClick={() => {
                  setSingleEmailForm({
                    recipientName: activeCert?.recipientName || 'bhavik patel',
                    recipientEmail: activeCert?.recipientEmail || '',
                    eventTitle: activeCert?.eventTitle || 'Campus Technical Event 2026',
                    category: activeCert?.category || 'WORKSHOP'
                  });
                  setIsSingleEmailModalOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: activeCert?.emailSent
                    ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
                    : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: activeCert?.emailSent ? '0 4px 14px rgba(13, 148, 136, 0.3)' : '0 4px 14px rgba(2, 132, 199, 0.3)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {activeCert?.emailSent ? <RotateCcw size={17} /> : <Mail size={17} />}
                {activeCert?.emailSent ? 'Resend Certificate via Email' : 'Send Certificate via Email'}
              </button>

              {activeCert?.emailSent && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '11.5px', color: '#166534' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                    ✓ Email Sent
                  </span>
                  <span style={{ color: '#15803d', fontStyle: 'italic' }}>
                    {activeCert.recipientEmail || 'Delivered'}
                  </span>
                </div>
              )}

              {/* Single Download Button */}
              <button
                onClick={handleDownloadSingleFhd}
                disabled={isDownloading}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: '#f8fafc',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: isDownloading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => !isDownloading && (e.currentTarget.style.background = '#e2e8f0')}
                onMouseLeave={(e) => !isDownloading && (e.currentTarget.style.background = '#f8fafc')}
              >
                <Download size={17} />
                {isDownloading ? 'Rendering FHD...' : 'Download Image (PNG)'}
              </button>

              {/* Bulk Generation Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Bulk Generation
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {/* Upload CSV & Preview Bulk Certificates Button */}
              <button
                onClick={() => setIsBulkModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  background: '#4ade80',
                  color: '#064e3b',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(74, 222, 128, 0.25)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#4ade80'; e.currentTarget.style.color = '#064e3b'; }}
              >
                <FileSpreadsheet size={17} />
                Upload CSV & Preview Bulk Certificates
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 2. Preview & Adjust Canvas (Enlargeable) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1.5px solid #e2e8f0',
            padding: isEnlarged ? '28px' : '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: isEnlarged ? '20px' : '17px', fontWeight: '800', color: '#0f172a' }}>
                2. Preview & Adjust
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: '#f0f9ff', color: '#0284c7', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>
                  FHD 1080p Resolution
                </span>

                {/* Enlarge / Normal Canvas Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsEnlarged(!isEnlarged)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: isEnlarged ? '#0f172a' : '#f1f5f9',
                    color: isEnlarged ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  title={isEnlarged ? "Switch to standard layout" : "Enlarge canvas workspace"}
                >
                  {isEnlarged ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  {isEnlarged ? 'Standard View' : 'Enlarge Canvas'}
                </button>

                {onOpenPublicVerification && (
                  <button
                    onClick={handleTestVerification}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    <ExternalLink size={13} /> Test Verification
                  </button>
                )}
              </div>
            </div>

            {/* Canvas / Preview Container (Dynamically scaled & enlarged) */}
            <div
              ref={previewCanvasRef}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                minHeight: isEnlarged ? '700px' : '520px',
                borderRadius: '14px',
                border: '2px solid #0f172a',
                overflow: 'hidden',
                boxShadow: '0 14px 40px rgba(0,0,0,0.12)',
                background: activeCert?.customBgImage
                  ? `url(${activeCert.customBgImage}) center/cover no-repeat`
                  : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
            >
              {/* Empty placeholder when no template is uploaded */}
              {!activeCert?.customBgImage && (
                <div style={{ textAlign: 'center', color: '#94a3b8', pointerEvents: 'none' }}>
                  <ImageIcon size={48} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    Upload a template to see preview
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Or drag and adjust the default overlay elements below
                  </div>
                </div>
              )}

              {/* Draggable Recipient / Text Name */}
              {currentPositions.name?.show !== false && (
                <div
                  onMouseDown={(e) => handleCanvasMouseDown(e, 'name')}
                  style={{
                    position: 'absolute',
                    left: `${currentPositions.name?.x ?? 50}%`,
                    top: `${currentPositions.name?.y ?? 50}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${currentPositions.name?.fontSize || 36}px`,
                    fontFamily: currentPositions.name?.fontFamily || 'Verdana, sans-serif',
                    fontWeight: currentPositions.name?.fontWeight || 'bold',
                    color: currentPositions.name?.color || '#0f172a',
                    cursor: 'move',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: activeElementKey === 'name' ? '2px dashed #0284c7' : '1px solid transparent',
                    background: activeElementKey === 'name' ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                    textShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }}
                >
                  {activeCert?.recipientName || 'bhavik patel'}
                </div>
              )}

              {/* Draggable QR Code */}
              {currentPositions.qrCode?.show !== false && (
                <div
                  onMouseDown={(e) => handleCanvasMouseDown(e, 'qrCode')}
                  style={{
                    position: 'absolute',
                    left: `${currentPositions.qrCode?.x ?? 88}%`,
                    top: `${currentPositions.qrCode?.y ?? 80}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'move',
                    padding: '6px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: activeElementKey === 'qrCode' ? '2px dashed #0284c7' : '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 10
                  }}
                >
                  <QRCodeSVG value={previewVerificationUrl} size={currentPositions.qrCode?.size || 70} level="H" />
                </div>
              )}

              {/* Draggable Hash ID (with dynamic color and contrast pill) */}
              {currentPositions.hash?.show !== false && (
                <div
                  onMouseDown={(e) => handleCanvasMouseDown(e, 'hash')}
                  style={{
                    position: 'absolute',
                    left: `${currentPositions.hash?.x ?? 50}%`,
                    top: `${currentPositions.hash?.y ?? 88}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${currentPositions.hash?.fontSize || 13}px`,
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    color: currentPositions.hash?.color || '#475569',
                    cursor: 'move',
                    padding: currentPositions.hash?.bgPill === 'dark' || currentPositions.hash?.bgPill === 'light' ? '4px 12px' : '2px 6px',
                    borderRadius: '6px',
                    background: currentPositions.hash?.bgPill === 'dark'
                      ? 'rgba(15, 23, 42, 0.85)'
                      : currentPositions.hash?.bgPill === 'light'
                      ? 'rgba(255, 255, 255, 0.92)'
                      : (activeElementKey === 'hash' ? 'rgba(2, 132, 199, 0.08)' : 'transparent'),
                    border: activeElementKey === 'hash' ? '2px dashed #0284c7' : (currentPositions.hash?.bgPill !== 'none' ? '1px solid rgba(255,255,255,0.2)' : 'none'),
                    boxShadow: currentPositions.hash?.bgPill !== 'none' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }}
                >
                  Hash ID: {activeCert?.hash || generateVerificationHash(previewCertId, activeCert?.recipientName || 'Candidate')}
                </div>
              )}

              {/* Draggable Verification URL (with multi-color and contrast pill) */}
              {currentPositions.verificationUrl?.show !== false && (
                <div
                  onMouseDown={(e) => handleCanvasMouseDown(e, 'verificationUrl')}
                  style={{
                    position: 'absolute',
                    left: `${currentPositions.verificationUrl?.x ?? 50}%`,
                    top: `${currentPositions.verificationUrl?.y ?? 92}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${currentPositions.verificationUrl?.fontSize || 12}px`,
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: '600',
                    color: currentPositions.verificationUrl?.color || '#0284c7',
                    cursor: 'move',
                    padding: currentPositions.verificationUrl?.bgPill === 'dark' || currentPositions.verificationUrl?.bgPill === 'light' ? '4px 12px' : '2px 6px',
                    borderRadius: '6px',
                    background: currentPositions.verificationUrl?.bgPill === 'dark'
                      ? 'rgba(15, 23, 42, 0.85)'
                      : currentPositions.verificationUrl?.bgPill === 'light'
                      ? 'rgba(255, 255, 255, 0.92)'
                      : (activeElementKey === 'verificationUrl' ? 'rgba(2, 132, 199, 0.08)' : 'transparent'),
                    border: activeElementKey === 'verificationUrl' ? '2px dashed #0284c7' : (currentPositions.verificationUrl?.bgPill !== 'none' ? '1px solid rgba(255,255,255,0.2)' : 'none'),
                    boxShadow: currentPositions.verificationUrl?.bgPill !== 'none' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }}
                >
                  Verify at: {previewVerificationUrl.replace(/^https?:\/\//, '')}
                </div>
              )}
            </div>

            {/* Canvas Meta Indicators */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: '#64748b' }}>
              <span>
                Active Element: <strong style={{ color: '#0f172a' }}>{activeElementKey}</strong> (X: {currentPositions[activeElementKey]?.x}%, Y: {currentPositions[activeElementKey]?.y}%)
              </span>
              <span>All 3 Verifiers Embedded: QR Code, Hash ID & URL</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CREDENTIAL VAULT ORGANIZED BY EVENT */}
      {studioMode === 'vault' && (
        <div>
          {/* Search and Filters Header */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search across events, recipient name, or hash token..."
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['ALL', 'HACKATHON', 'WORKSHOP', 'BOOTCAMP', 'TECH_SUMMIT'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setVaultCategoryFilter(cat)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: vaultCategoryFilter === cat ? '#0f172a' : '#f1f5f9',
                    color: vaultCategoryFilter === cat ? '#ffffff' : '#64748b'
                  }}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Event Batches Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '20px' }}>
            {eventGroupList.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #cbd5e1', color: '#94a3b8' }}>
                <Layers size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <h4 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>No Event Batches Found</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Create your first batch using "Upload CSV & Preview Bulk Certificates".</p>
              </div>
            ) : (
              eventGroupList.map(grp => {
                const totalInEvent = grp.items.length;
                const sentInEvent = grp.items.filter(i => i.emailSent).length;
                const pendingInEvent = totalInEvent - sentInEvent;

                return (
                  <div
                    key={grp.key}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      padding: '22px',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{
                          background: '#e0f2fe',
                          color: '#0284c7',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          textTransform: 'uppercase'
                        }}>
                          {grp.category}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                          📅 {grp.issuedDate}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                        {grp.eventTitle}
                      </h3>

                      <div style={{ display: 'flex', gap: '8px', margin: '12px 0 16px 0' }}>
                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px' }}>
                          👥 {totalInEvent} Total Minted
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#16a34a', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px' }}>
                          ✓ {sentInEvent} Delivered
                        </span>
                        {pendingInEvent > 0 && (
                          <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px' }}>
                            ⏳ {pendingInEvent} Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button for this Event Batch */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => {
                          setBulkEventBatch({
                            eventTitle: grp.eventTitle,
                            category: grp.category,
                            issuedDate: grp.issuedDate,
                            organization: grp.organization,
                            certificates: grp.items
                          });
                          setStudioMode('bulk_view');
                        }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '11px 16px',
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '13.5px',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={16} /> Preview in BULK VIEW
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5 EVENT DETAILS MODAL BEFORE BULK GENERATION */}
      {isBulkModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px 32px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  STEP 1 OF 2 • EVENT CONFIGURATION
                </span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                  5 Event Details & CSV Setup
                </h2>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* The 5 Event Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>

              {/* 1. Event Title */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  1. Event Name / Title *
                </label>
                <input
                  type="text"
                  value={bulkEventForm.eventTitle}
                  onChange={(e) => setBulkEventForm({ ...bulkEventForm, eventTitle: e.target.value })}
                  placeholder="e.g. AWS Cloud Day 2026: National Hackathon"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              {/* 2. Event Category */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  2. Event Category / Type *
                </label>
                <select
                  value={bulkEventForm.category}
                  onChange={(e) => setBulkEventForm({ ...bulkEventForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* 3. Event Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  3. Event / Issue Date *
                </label>
                <input
                  type="date"
                  value={bulkEventForm.issuedDate}
                  onChange={(e) => setBulkEventForm({ ...bulkEventForm, issuedDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              {/* 4. Issuing Organization */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  4. Issuing Organization / Club *
                </label>
                <select
                  value={bulkEventForm.organization}
                  onChange={(e) => setBulkEventForm({ ...bulkEventForm, organization: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="AWS_SBG">AWS Student Builder Group (AWS SBG)</option>
                  <option value="TECHNO_LAB">Techno Lab Community</option>
                  <option value="GDGOC">Google Developer Groups on Campus</option>
                  <option value="ALL">Trio Club Unified Registry</option>
                </select>
              </div>

              {/* 5. Role / Description / Award */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  5. Role / Award Title *
                </label>
                <input
                  type="text"
                  value={bulkEventForm.roleOrDescription}
                  onChange={(e) => setBulkEventForm({ ...bulkEventForm, roleOrDescription: e.target.value })}
                  placeholder="e.g. Winner — 1st Place Champion / Participant"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* CSV Recipient Input Section */}
            <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  Candidate List (Format: <code>Name|Email ID</code>)
                </label>
                <span style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: '700' }}>
                  {parseCsvRecipients().length} Recipients Detected
                </span>
              </div>

              <textarea
                rows={5}
                value={bulkCsvInput}
                onChange={(e) => setBulkCsvInput(e.target.value)}
                placeholder="Name|Email ID&#10;Aarav Sharma|aarav@example.com&#10;Diya Patel|diya@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                  outline: 'none',
                  lineHeight: 1.5
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px', color: '#64748b' }}>
                <span>Pipe <code>|</code>, comma <code>,</code>, or tab delimiters supported</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = "Name|Email ID\nAarav Sharma|aarav@example.com\nDiya Patel|diya@example.com\nRohan Mehta|rohan@example.com\nAditi Verma|aditi@example.com";
                    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.setAttribute('download', 'sample_recipients.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Download Sample CSV
                </button>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleMintBulkBatch}
                style={{
                  padding: '11px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Eye size={16} /> Mint & Preview in BULK VIEW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND SINGLE CERTIFICATE EMAIL */}
      {isSingleEmailModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1.5px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {activeCert?.emailSent ? 'Resend Certificate via Email' : 'Send Certificate via Email'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    {activeCert?.emailSent ? 'Re-deliver verified credential link to candidate' : 'Dispatch authentic verified credential directly to recipient'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSingleEmailModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendSingleCertificateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Recipient Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={singleEmailForm.recipientName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSingleEmailForm(prev => ({ ...prev, recipientName: val }));
                    handleUpdateActiveCert('recipientName', val);
                  }}
                  placeholder="e.g. Bhavik Patel"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={singleEmailForm.recipientEmail}
                  onChange={(e) => setSingleEmailForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="e.g. candidate@gmail.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #0284c7',
                    background: '#f0f9ff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Event Title / Certificate For
                </label>
                <input
                  type="text"
                  value={singleEmailForm.eventTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSingleEmailForm(prev => ({ ...prev, eventTitle: val }));
                    handleUpdateActiveCert('eventTitle', val);
                  }}
                  placeholder="e.g. AWS Cloud Day & Hackathon 2026"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Security info callout */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                🔒 <strong>Cryptographic Binding:</strong> This single email will automatically generate and attach a unique <strong>QR Code, Hash Token, and Instant Verification URL</strong> bound to Supabase.
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsSingleEmailModalOpen(false)}
                  disabled={isSendingSingleEmail}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    color: '#64748b',
                    cursor: isSendingSingleEmail ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSendingSingleEmail}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '13.5px',
                    cursor: isSendingSingleEmail ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {isSendingSingleEmail ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : (activeCert?.emailSent ? <RotateCcw size={16} /> : <Send size={16} />)}
                  {isSendingSingleEmail ? 'Sending Email...' : (activeCert?.emailSent ? 'Resend Certificate Email' : 'Send Certificate Email')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
