import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';
import CertificateDocument from './CertificateDocument';
import CertificateEmailModal from './CertificateEmailModal';
import {
  CERTIFICATE_THEMES,
  EVENT_CATEGORIES,
  BADGE_TYPES,
  generateCertificateId,
  generateVerificationHash
} from '../../data/certificateData';
import { CLUB_CONFIGS } from '../../data/teamData';

export default function CertificateStudio({
  certificates,
  setCertificates,
  activeOrg,
  currentUser,
  itmbuLogo,
  clubLogo,
  onOpenPublicVerification
}) {
  // Sub-view: 'designer' | 'batch' | 'vault'
  const [studioTab, setStudioTab] = useState('designer');

  // Currently selected / editing certificate
  const [selectedCertId, setSelectedCertId] = useState(() => {
    const orgCerts = (certificates || []).filter(c => !c.organization || c.organization === activeOrg);
    return orgCerts.length > 0 ? orgCerts[0].id : (certificates?.[0]?.id || '');
  });

  // Automatically synchronize selected certificate when activeOrg changes
  useEffect(() => {
    if (!Array.isArray(certificates) || certificates.length === 0) return;
    const orgCerts = certificates.filter(c => !c.organization || c.organization === activeOrg);
    if (orgCerts.length > 0) {
      const exists = orgCerts.some(c => c.id === selectedCertId);
      if (!exists) {
        setSelectedCertId(orgCerts[0].id);
      }
    } else {
      const exists = certificates.some(c => c.id === selectedCertId);
      if (!exists) {
        setSelectedCertId(certificates[0].id);
      }
    }
  }, [activeOrg, certificates, selectedCertId]);

  const activeCert = (certificates || []).find(c => c.id === selectedCertId) || 
                     (certificates || []).find(c => !c.organization || c.organization === activeOrg) || 
                     certificates?.[0] || null;

  // Search & Filter state for Vault
  const [vaultSearch, setVaultSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailingCert, setEmailingCert] = useState(null);

  // Certifier.io Interactive Field Positioner State
  const [isEditingPositions, setIsEditingPositions] = useState(true);
  const [selectedFieldKey, setSelectedFieldKey] = useState('name'); // 'name' | 'eventTitle' | 'description' | 'date' | 'certId' | 'qrCode'

  // Batch generator form state
  const [batchEventTitle, setBatchEventTitle] = useState('HackCloud 2026: National Hackathon');
  const [batchCategory, setBatchCategory] = useState('HACKATHON');
  const [batchTheme, setBatchTheme] = useState('GOLD_NAVY');
  const [batchDefaultRole, setBatchDefaultRole] = useState('Participant — Active Builder');
  const [batchDefaultBadge, setBatchDefaultBadge] = useState('COMPLETION');
  const [batchSkills, setBatchSkills] = useState('AWS Lambda, Python, Serverless, Cloud Architecture');
  const [batchInputText, setBatchInputText] = useState(`Aarav Sharma, aarav@example.com, Winner — 1st Place Champion, WINNER_GOLD
Diya Patel, diya@example.com, 1st Runner Up, RUNNER_UP
Rohan Mehta, rohan@example.com, 2nd Runner Up, SECOND_RUNNER
Aditi Verma, aditi@example.com, Participant, COMPLETION
Vikram Singh, vikram@example.com, Participant, COMPLETION`);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Active Club Configuration
  const club = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;

  // Update field on the active certificate with automatic hash update
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
    localStorage.setItem('event_certificates_vault', JSON.stringify(nextList));
  };

  // Update Signatory
  const handleUpdateSignatory = (sigKey, field, value) => {
    if (!activeCert) return;
    const updatedSig = { ...(activeCert[sigKey] || {}), [field]: value };
    const updatedCert = { ...activeCert, [sigKey]: updatedSig };
    const nextList = certificates.map(c => c.id === activeCert.id ? updatedCert : c);
    setCertificates(nextList);
    localStorage.setItem('event_certificates_vault', JSON.stringify(nextList));
  };

  // Handle Custom Template Upload
  const handleUploadCustomTemplate = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      if (!activeCert) return;
      const cleanCustomPositions = {
        name: { x: 50, y: 53.5, fontSize: 32, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, show: true },
        eventTitle: { x: 50, y: 62, fontSize: 18, color: '#1e293b', fontWeight: 700, show: false },
        description: { x: 50, y: 70, fontSize: 12, color: '#475569', show: false },
        date: { x: 25, y: 84, fontSize: 11, color: '#64748b', show: false },
        certId: { x: 50, y: 84, fontSize: 11, color: '#64748b', show: false },
        qrCode: { x: 88, y: 82, size: 52, show: false }
      };
      
      const updatedCert = {
        ...activeCert,
        customBgImage: dataUrl,
        fieldPositions: cleanCustomPositions,
        organization: activeCert.organization || activeOrg
      };
      const nextList = certificates.map(c => c.id === activeCert.id ? updatedCert : c);
      setCertificates(nextList);
      localStorage.setItem('event_certificates_vault', JSON.stringify(nextList));

      setIsEditingPositions(true);
      setSelectedFieldKey('name');

      Swal.fire({
        icon: 'success',
        title: 'Custom Template Applied!',
        text: 'Only the Candidate Name is overlaid. You can drag or click on the canvas to place it exactly on the line.',
        timer: 3500,
        background: '#ffffff',
        color: '#0f172a',
        showConfirmButton: false
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Custom Template
  const handleRemoveCustomTemplate = () => {
    handleUpdateActiveCert('customBgImage', null);
  };

  // Update Specific Coordinate or Typography of a Field (Certifier.io Engine)
  const handleUpdateFieldPos = (fieldKey, property, value) => {
    if (!activeCert) return;
    const currentPositions = activeCert.fieldPositions || {
      name: { x: 50, y: 46, fontSize: 34, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 },
      eventTitle: { x: 50, y: 58, fontSize: 19, color: '#1e293b', fontWeight: 700 },
      description: { x: 50, y: 66, fontSize: 13, color: '#475569' },
      date: { x: 25, y: 84, fontSize: 11, color: '#64748b' },
      certId: { x: 50, y: 84, fontSize: 11, color: '#64748b' },
      qrCode: { x: 88, y: 82, size: 54, show: true }
    };

    const targetField = currentPositions[fieldKey] || {};
    const updatedPositions = {
      ...currentPositions,
      [fieldKey]: {
        ...targetField,
        [property]: value
      }
    };

    handleUpdateActiveCert('fieldPositions', updatedPositions);
  };

  // Canvas Click Coordinate Setter
  const handleCanvasClick = (fieldKey, x, y) => {
    if (!activeCert) return;
    const currentPositions = activeCert.fieldPositions || {
      name: { x: 50, y: 46, fontSize: 34, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 },
      eventTitle: { x: 50, y: 58, fontSize: 19, color: '#1e293b', fontWeight: 700 },
      description: { x: 50, y: 66, fontSize: 13, color: '#475569' },
      date: { x: 25, y: 84, fontSize: 11, color: '#64748b' },
      certId: { x: 50, y: 84, fontSize: 11, color: '#64748b' },
      qrCode: { x: 88, y: 82, size: 54, show: true }
    };

    const targetField = currentPositions[fieldKey] || {};
    const updatedPositions = {
      ...currentPositions,
      [fieldKey]: {
        ...targetField,
        x: x,
        y: y
      }
    };

    handleUpdateActiveCert('fieldPositions', updatedPositions);
  };

  // Create New Blank Certificate
  const handleCreateNewCertificate = () => {
    const newId = generateCertificateId('EVENT', new Date().getFullYear());
    const newCert = {
      id: newId,
      credentialId: newId,
      recipientName: 'New Recipient Name',
      recipientEmail: '',
      recipientCollege: 'ITM (sls) Baroda University',
      recipientDepartment: 'Computer Science & Engineering',
      category: 'WORKSHOP',
      eventTitle: 'Applied Cloud & AI Masterclass 2026',
      roleOrAchievement: 'Certified Workshop Participant',
      badgeType: 'COMPLETION',
      theme: 'GOLD_NAVY',
      organization: activeOrg || 'AWS_SBG',
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: 'Lifetime Validity',
      skills: ['Cloud Computing', 'Fullstack Development', 'DevOps'],
      customDescription: 'For exceptional dedication, hands-on lab execution, and mastery of core technical principles.',
      fieldPositions: {
        name: { x: 50, y: 46, fontSize: 34, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 },
        eventTitle: { x: 50, y: 58, fontSize: 19, color: '#1e293b', fontWeight: 700 },
        description: { x: 50, y: 66, fontSize: 13, color: '#475569' },
        date: { x: 25, y: 84, fontSize: 11, color: '#64748b' },
        certId: { x: 50, y: 84, fontSize: 11, color: '#64748b' },
        qrCode: { x: 88, y: 82, size: 54, show: true }
      },
      signatory1: {
        name: club.organizer?.name || 'Lead Organizer',
        title: club.organizer?.title || 'Chapter Leader',
        org: club.name
      },
      signatory2: {
        name: club.advisor?.name || 'Advisor Name',
        title: club.advisor?.title || 'Faculty Advisor',
        org: 'ITMBU'
      },
      signatory3: {
        name: club.mentor?.name || 'Dr. Pradeep Laxkar',
        title: club.mentor?.title || 'Head of Department',
        org: 'ITM (sls) Baroda University'
      },
      verifiedStatus: 'AUTHENTIC_VERIFIED',
      hash: generateVerificationHash(newId, 'New Recipient Name')
    };

    const nextList = [newCert, ...certificates];
    setCertificates(nextList);
    localStorage.setItem('event_certificates_vault', JSON.stringify(nextList));
    setSelectedCertId(newId);
  };

  // Delete Certificate
  const handleDeleteCertificate = (certId) => {
    Swal.fire({
      title: 'Delete Certificate?',
      text: 'Are you sure you want to revoke and remove this verified credential?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#0f172a',
      confirmButtonText: 'Yes, Delete',
      background: '#ffffff',
      color: '#0f172a'
    }).then((res) => {
      if (res.isConfirmed) {
        const nextList = certificates.filter(c => c.id !== certId);
        setCertificates(nextList);
        localStorage.setItem('event_certificates_vault', JSON.stringify(nextList));
        if (selectedCertId === certId && nextList.length > 0) {
          setSelectedCertId(nextList[0].id);
        }
      }
    });
  };

  // Download FHD PDF
  const handleDownloadPdf = async () => {
    if (!activeCert) return;
    setIsDownloadingPdf(true);
    const element = document.getElementById('printable-certificate');
    if (!element) {
      setIsDownloadingPdf(false);
      return;
    }

    const opt = {
      margin: 0,
      filename: `Certificate_${(activeCert.recipientName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_')}_${activeCert.credentialId || activeCert.id}.pdf`,
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: {
        unit: 'px',
        format: [1050, 740],
        orientation: 'landscape'
      }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'High Definition Certificate PDF Downloaded!',
        showConfirmButton: false,
        timer: 2500,
        background: '#ffffff',
        color: '#0f172a'
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Batch Process Import
  const handleProcessBatch = () => {
    const lines = batchInputText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      Swal.fire('Error', 'Please enter at least one recipient line for batch generation', 'error');
      return;
    }

    setIsGenerating(true);
    const skillsList = batchSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newBatchCerts = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      const name = parts[0] || `Participant ${index + 1}`;
      const email = parts[1] || '';
      const role = parts[2] || batchDefaultRole;
      const badge = parts[3] || batchDefaultBadge;
      const certId = generateCertificateId(batchCategory, new Date().getFullYear());

      newBatchCerts.push({
        id: certId,
        credentialId: certId,
        recipientName: name,
        recipientEmail: email,
        recipientCollege: 'ITM (sls) Baroda University',
        recipientDepartment: 'Computer Science & Engineering',
        category: batchCategory,
        eventTitle: batchEventTitle,
        roleOrAchievement: role,
        badgeType: badge,
        theme: batchTheme,
        organization: activeOrg || 'AWS_SBG',
        issuedDate: new Date().toISOString().split('T')[0],
        expiryDate: 'Lifetime Validity',
        skills: skillsList,
        customDescription: `Issued for exceptional participation and performance in ${batchEventTitle}.`,
        signatory1: {
          name: club.organizer?.name || 'Lead Organizer',
          title: club.organizer?.title || 'Chapter Lead',
          org: club.name
        },
        signatory2: {
          name: club.advisor?.name || 'Faculty Advisor',
          title: club.advisor?.title || 'Advisor',
          org: 'ITMBU'
        },
        signatory3: {
          name: club.mentor?.name || 'Dr. Pradeep Laxkar',
          title: club.mentor?.title || 'Head of Department',
          org: 'ITM (sls) Baroda University'
        },
        verifiedStatus: 'AUTHENTIC_VERIFIED',
        hash: generateVerificationHash(certId, name)
      });
    });

    const nextList = [...newBatchCerts, ...certificates];
    setCertificates(nextList);
    localStorage.setItem('event_certificates_vault', JSON.stringify(nextList));
    setSelectedCertId(newBatchCerts[0].id);
    setIsGenerating(false);

    Swal.fire({
      icon: 'success',
      title: `${newBatchCerts.length} Certificates Generated!`,
      text: 'All credentials have been minted with dynamic QR codes & added to the verified registry.',
      background: '#ffffff',
      color: '#0f172a',
      confirmButtonColor: '#0f172a'
    }).then(() => {
      setStudioTab('vault');
    });
  };

  // Filtered list for Vault
  const filteredCerts = certificates.filter(c => {
    const matchOrg = !c.organization || c.organization === activeOrg || activeOrg === 'ALL';
    const matchCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchQuery = !vaultSearch ||
      (c.recipientName && c.recipientName.toLowerCase().includes(vaultSearch.toLowerCase())) ||
      (c.id && c.id.toLowerCase().includes(vaultSearch.toLowerCase())) ||
      (c.eventTitle && c.eventTitle.toLowerCase().includes(vaultSearch.toLowerCase()));
    return matchOrg && matchCategory && matchQuery;
  });

  const activePos = activeCert?.fieldPositions || {
    name: { x: 50, y: 46, fontSize: 34, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800 },
    eventTitle: { x: 50, y: 58, fontSize: 19, color: '#1e293b', fontWeight: 700 },
    description: { x: 50, y: 66, fontSize: 13, color: '#475569' },
    date: { x: 25, y: 84, fontSize: 11, color: '#64748b' },
    certId: { x: 50, y: 84, fontSize: 11, color: '#64748b' },
    qrCode: { x: 88, y: 82, size: 54, show: true }
  };

  const currentFieldConfig = activePos[selectedFieldKey] || {};

  return (
    <div className="certificate-studio-suite" style={{ padding: '24px 30px', maxWidth: '1600px', margin: '0 auto', color: '#0f172a' }}>
      
      {/* Top Banner & Mode Switcher */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(226, 232, 240, 0.95)',
        borderRadius: '20px',
        padding: '20px 28px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
      }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#f1f5f9',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Event Certificate Authority &amp; Studio
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.4px'
                }}>
                  CERTIFIER.IO DRAG &amp; POSITION + NODEMAILER EMAIL DISPATCH
                </span>
              </div>
            </div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Upload custom certificate sample templates, set dynamic text field coordinates, and send authentic credentials via email.
          </p>
        </div>

        {/* Sub Navigation Pills */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
          
          <button
            onClick={() => setStudioTab('designer')}
            style={{
              background: studioTab === 'designer' ? '#0f172a' : 'transparent',
              color: studioTab === 'designer' ? '#ffffff' : '#64748b',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: studioTab === 'designer' ? '0 4px 12px rgba(15, 23, 42, 0.18)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            <span>Live Designer</span>
          </button>

          <button
            onClick={() => setStudioTab('batch')}
            style={{
              background: studioTab === 'batch' ? '#0f172a' : 'transparent',
              color: studioTab === 'batch' ? '#ffffff' : '#64748b',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: studioTab === 'batch' ? '0 4px 12px rgba(15, 23, 42, 0.18)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span>Batch Issuer</span>
          </button>

          <button
            onClick={() => setStudioTab('vault')}
            style={{
              background: studioTab === 'vault' ? '#0f172a' : 'transparent',
              color: studioTab === 'vault' ? '#ffffff' : '#64748b',
              border: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: studioTab === 'vault' ? '0 4px 12px rgba(15, 23, 42, 0.18)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <span>Credential Vault ({certificates.length})</span>
          </button>

        </div>

      </div>

      {/* TAB 1: LIVE DESIGNER & CUSTOMIZER */}
      {studioTab === 'designer' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '400px minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* Left Controls Column */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            borderRadius: '20px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
          }}>
            
            {/* Header & Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Certificate Configurator
                </span>
              </div>
              <button
                onClick={handleCreateNewCertificate}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Cert
              </button>
            </div>

            {/* Select Existing Certificate dropdown */}
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Active Certificate
              </label>
              <select
                value={selectedCertId}
                onChange={(e) => setSelectedCertId(e.target.value)}
                className="form-select"
              >
                {certificates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.recipientName} — {c.id} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            {activeCert && (
              <>
                {/* SECTION 1: CUSTOM TEMPLATE UPLOAD & CERTIFIER.IO MODE */}
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        Custom Template (Certifier.io Mode)
                      </span>
                    </div>
                    {activeCert.customBgImage && (
                      <button
                        type="button"
                        onClick={handleRemoveCustomTemplate}
                        style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    Upload your own Canva or custom certificate image background and position fields on top.
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCustomTemplate}
                    id="custom-cert-bg-upload"
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="custom-cert-bg-upload"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '10px',
                      color: '#0f172a',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {activeCert.customBgImage ? 'Replace Template Image' : 'Upload Template (PNG/JPG)'}
                  </label>

                  {/* FIELD POSITION & TYPOGRAPHY SETTER */}
                  <div style={{ marginTop: '14px', borderTop: '1.5px solid #e2e8f0', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                        Dynamic Field Customizer
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingPositions(!isEditingPositions)}
                        style={{
                          background: isEditingPositions ? '#10b981' : '#f1f5f9',
                          color: isEditingPositions ? '#ffffff' : '#475569',
                          border: `1px solid ${isEditingPositions ? '#10b981' : '#cbd5e1'}`,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isEditingPositions ? '✓ Click-to-Place Active' : '📍 Enable Click-to-Place'}
                      </button>
                    </div>

                    {/* Choose Field to Customize */}
                    <select
                      value={selectedFieldKey}
                      onChange={(e) => setSelectedFieldKey(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '13px', fontWeight: 700, height: '40px' }}
                    >
                      <option value="name">👤 Recipient Name</option>
                      <option value="eventTitle">🏆 Event Title</option>
                      <option value="description">📜 Achievement / Description</option>
                      <option value="date">📅 Issue Date</option>
                      <option value="certId">🔑 Credential Ref ID</option>
                      <option value="qrCode">📱 Verification QR Code</option>
                    </select>

                    {/* Field Visibility Switch */}
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '8px 12px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                        Show <strong>{selectedFieldKey}</strong> on Certificate:
                      </span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: currentFieldConfig.show !== false ? '#059669' : '#dc2626' }}>
                        <input
                          type="checkbox"
                          checked={currentFieldConfig.show !== false}
                          onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'show', e.target.checked)}
                          style={{ accentColor: '#0f172a', cursor: 'pointer' }}
                        />
                        {currentFieldConfig.show !== false ? 'Visible' : 'Hidden'}
                      </label>
                    </div>

                    {/* Coordinate Sliders, Nudge Buttons & Direct Inputs */}
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', marginTop: '10px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Position Coordinates</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'y', Math.max(0, (currentFieldConfig.y || 50) - 1))}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            title="Nudge Up 1%"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'y', Math.min(100, (currentFieldConfig.y || 50) + 1))}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            title="Nudge Down 1%"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'x', Math.max(0, (currentFieldConfig.x || 50) - 1))}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            title="Nudge Left 1%"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'x', Math.min(100, (currentFieldConfig.x || 50) + 1))}
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            title="Nudge Right 1%"
                          >
                            →
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>X (Horizontal):</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={currentFieldConfig.x !== undefined ? currentFieldConfig.x : 50}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'x', Number(e.target.value))}
                              style={{ width: '52px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '2px 4px', color: '#0f172a', fontSize: '11.5px', fontWeight: 700, textAlign: 'right' }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={currentFieldConfig.x !== undefined ? currentFieldConfig.x : 50}
                            onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'x', Number(e.target.value))}
                            style={{ width: '100%', marginTop: '6px', accentColor: '#0f172a', cursor: 'pointer' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Y (Vertical):</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={currentFieldConfig.y !== undefined ? currentFieldConfig.y : 50}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'y', Number(e.target.value))}
                              style={{ width: '52px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '2px 4px', color: '#0f172a', fontSize: '11.5px', fontWeight: 700, textAlign: 'right' }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={currentFieldConfig.y !== undefined ? currentFieldConfig.y : 50}
                            onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'y', Number(e.target.value))}
                            style={{ width: '100%', marginTop: '6px', accentColor: '#0f172a', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* FONT SIZE, COLOR, WEIGHT & TYPOGRAPHY */}
                    {selectedFieldKey !== 'qrCode' && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', marginTop: '10px', border: '1.5px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                            Font Size: {currentFieldConfig.fontSize || 32}px
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>
                            [{selectedFieldKey?.toUpperCase()}]
                          </span>
                        </div>

                        {/* Font Size with Range + Direct Input + Steppers */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.max(8, (currentFieldConfig.fontSize || 32) - 5))}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                title="Decrease 5px"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.max(8, (currentFieldConfig.fontSize || 32) - 1))}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                title="Decrease 1px"
                              >
                                -1
                              </button>
                            </div>

                            <input
                              type="number"
                              min="8"
                              max="120"
                              value={currentFieldConfig.fontSize || 32}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Number(e.target.value))}
                              style={{ width: '64px', background: '#ffffff', border: '1.5px solid #0f172a', borderRadius: '8px', padding: '4px 6px', color: '#0f172a', fontSize: '13px', fontWeight: 800, textAlign: 'center' }}
                            />

                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.min(120, (currentFieldConfig.fontSize || 32) + 1))}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                title="Increase 1px"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.min(120, (currentFieldConfig.fontSize || 32) + 5))}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                title="Increase 5px"
                              >
                                +5
                              </button>
                            </div>
                          </div>

                          <input
                            type="range"
                            min="8"
                            max="100"
                            step="1"
                            value={currentFieldConfig.fontSize || 32}
                            onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#0f172a', cursor: 'pointer' }}
                          />

                          {/* Quick Size Presets */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '8px' }}>
                            {[16, 22, 28, 34, 44, 56].map(sizePreset => (
                              <button
                                key={sizePreset}
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', sizePreset)}
                                style={{
                                  flex: 1,
                                  background: (currentFieldConfig.fontSize || 32) === sizePreset ? '#0f172a' : '#f8fafc',
                                  border: `1px solid ${(currentFieldConfig.fontSize || 32) === sizePreset ? '#0f172a' : '#cbd5e1'}`,
                                  color: (currentFieldConfig.fontSize || 32) === sizePreset ? '#ffffff' : '#475569',
                                  borderRadius: '6px',
                                  padding: '4px 2px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s'
                                }}
                              >
                                {sizePreset}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color & Font Weight */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Text Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                              <input
                                type="color"
                                value={currentFieldConfig.color || '#0f172a'}
                                onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'color', e.target.value)}
                                style={{ width: '36px', height: '32px', background: 'none', border: '1.5px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                              />
                              <input
                                type="text"
                                value={currentFieldConfig.color || '#0f172a'}
                                onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'color', e.target.value)}
                                style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '5px 8px', color: '#0f172a', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Font Weight</label>
                            <select
                              value={currentFieldConfig.fontWeight || 800}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'fontWeight', Number(e.target.value))}
                              className="form-select"
                              style={{ height: '34px', fontSize: '12px', marginTop: '4px' }}
                            >
                              <option value={400}>Normal (400)</option>
                              <option value={600}>Semi-Bold (600)</option>
                              <option value={700}>Bold (700)</option>
                              <option value={800}>Extra Bold (800)</option>
                              <option value={900}>Black (900)</option>
                            </select>
                          </div>
                        </div>

                        {/* Font Style & Letter Spacing */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginTop: '12px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Font Style</label>
                            <select
                              value={currentFieldConfig.fontFamily || "'Playfair Display', Georgia, serif"}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'fontFamily', e.target.value)}
                              className="form-select"
                              style={{ height: '34px', fontSize: '12px', marginTop: '4px' }}
                            >
                              <option value="'Playfair Display', Georgia, serif">Classic Serif (Playfair)</option>
                              <option value="'Cinzel', Georgia, serif">Regal Roman (Cinzel)</option>
                              <option value="'Outfit', sans-serif">Modern Clean (Outfit)</option>
                              <option value="'Montserrat', sans-serif">Bold Geometric (Montserrat)</option>
                              <option value="'Brush Script MT', 'Dancing Script', cursive">Calligraphy Script</option>
                              <option value="'Courier New', monospace">Monospace</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Spacing ({currentFieldConfig.letterSpacing !== undefined ? currentFieldConfig.letterSpacing : 1}px)</label>
                            <input
                              type="range"
                              min="0"
                              max="15"
                              step="0.5"
                              value={currentFieldConfig.letterSpacing !== undefined ? currentFieldConfig.letterSpacing : 1}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'letterSpacing', Number(e.target.value))}
                              style={{ width: '100%', marginTop: '8px', accentColor: '#0f172a', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Built-in Theme Selector (when not using custom background) */}
                {!activeCert.customBgImage && (
                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Built-In Luxury Theme
                    </label>
                    <select
                      value={activeCert.theme || 'GOLD_NAVY'}
                      onChange={(e) => handleUpdateActiveCert('theme', e.target.value)}
                      className="form-select"
                    >
                      {Object.values(CERTIFICATE_THEMES).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Recipient Full Name */}
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={activeCert.recipientName || ''}
                    onChange={(e) => handleUpdateActiveCert('recipientName', e.target.value)}
                  />
                </div>

                {/* Recipient Email Address for Nodemailer dispatch */}
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={activeCert.recipientEmail || ''}
                    onChange={(e) => handleUpdateActiveCert('recipientEmail', e.target.value)}
                    placeholder="candidate@gmail.com"
                  />
                </div>

                {/* Event Title */}
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Event / Championship Title
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={activeCert.eventTitle || ''}
                    onChange={(e) => handleUpdateActiveCert('eventTitle', e.target.value)}
                  />
                </div>

                {/* Role / Achievement */}
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Achievement / Participation Role
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={activeCert.roleOrAchievement || ''}
                    onChange={(e) => handleUpdateActiveCert('roleOrAchievement', e.target.value)}
                  />
                </div>

                {/* Issue Date & ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                      Issue Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={activeCert.issuedDate || ''}
                      onChange={(e) => handleUpdateActiveCert('issuedDate', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                      Credential Ref ID
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={activeCert.credentialId || activeCert.id || ''}
                      onChange={(e) => handleUpdateActiveCert('credentialId', e.target.value)}
                    />
                  </div>
                </div>

                {/* Signatory Names */}
                <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    Signatory Details
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', color: '#64748b' }}>Signatory 1 (Organizer / Lead)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={activeCert.signatory1?.name || ''}
                        onChange={(e) => handleUpdateSignatory('signatory1', 'name', e.target.value)}
                        placeholder="Name"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '11px', color: '#64748b' }}>Signatory 2 (Faculty Mentor / HoD)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={activeCert.signatory3?.name || ''}
                        onChange={(e) => handleUpdateSignatory('signatory3', 'name', e.target.value)}
                        placeholder="Faculty Mentor Name"
                      />
                    </div>
                  </div>
                </div>

              </>
            )}

          </div>

          {/* Right Live Preview Canvas & Action Toolbar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            overflowX: 'auto'
          }}>
            
            {/* Top Toolbar */}
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Live Document Canvas (Landscape A4/Letter)
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {activeCert?.customBgImage ? 'Custom uploaded template active with Certifier.io field overlays' : 'Procedural luxury theme with dynamic verification QR code'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                
                <button
                  onClick={() => {
                    setEmailingCert(activeCert);
                    setIsEmailModalOpen(true);
                  }}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: '1.5px solid #0f172a',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>Email Certificate</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isDownloadingPdf ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>{isDownloadingPdf ? 'Processing...' : 'Download FHD PDF'}</span>
                </button>

                <button
                  onClick={() => {
                    if (activeCert && onOpenPublicVerification) {
                      onOpenPublicVerification(activeCert.credentialId || activeCert.id);
                    }
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  <span>Verify Public Link</span>
                </button>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(activeCert?.credentialId || activeCert?.id)}`;
                    navigator.clipboard.writeText(url);
                    Swal.fire({
                      toast: true,
                      position: 'top-end',
                      icon: 'success',
                      title: 'Public QR Verification Link copied!',
                      showConfirmButton: false,
                      timer: 2000,
                      background: '#ffffff',
                      color: '#0f172a'
                    });
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: '10px',
                    padding: '9px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span>Copy QR Link</span>
                </button>

              </div>

            </div>

            {/* Certificate Canvas Render */}
            <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ transform: 'scale(0.92)', transformOrigin: 'top center', marginBottom: '-50px' }}>
                <CertificateDocument
                  certificate={activeCert}
                  itmbuLogo={itmbuLogo}
                  clubLogo={clubLogo}
                  isEditingPositions={isEditingPositions}
                  selectedFieldKey={selectedFieldKey}
                  onCanvasClick={handleCanvasClick}
                  onSelectField={setSelectedFieldKey}
                  onUpdateFieldPos={handleUpdateFieldPos}
                />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: BATCH ISSUER */}
      {studioTab === 'batch' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Batch Mint &amp; Mass Certificate Engine
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Generate dozens or hundreds of verified participant &amp; winner certificates in a single click.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Event / Hackathon Name
              </label>
              <input
                type="text"
                className="form-input"
                value={batchEventTitle}
                onChange={(e) => setBatchEventTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Event Category
              </label>
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                className="form-select"
              >
                {EVENT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Default Role / Designation
              </label>
              <input
                type="text"
                className="form-input"
                value={batchDefaultRole}
                onChange={(e) => setBatchDefaultRole(e.target.value)}
                placeholder="e.g. Participant"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Default Foil Badge
              </label>
              <select
                value={batchDefaultBadge}
                onChange={(e) => setBatchDefaultBadge(e.target.value)}
                className="form-select"
              >
                {BADGE_TYPES.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Design Theme
              </label>
              <select
                value={batchTheme}
                onChange={(e) => setBatchTheme(e.target.value)}
                className="form-select"
              >
                {Object.values(CERTIFICATE_THEMES).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Skills Covered (Comma-separated)
              </label>
              <input
                type="text"
                className="form-input"
                value={batchSkills}
                onChange={(e) => setBatchSkills(e.target.value)}
              />
            </div>

          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
              Participant List (Format: Full Name, Email, Role/Rank, BadgeType)
            </label>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
              Paste one recipient per line. BadgeType can be: WINNER_GOLD, RUNNER_UP, SECOND_RUNNER, FINALIST, MERIT, COMPLETION, EXCELLENCE.
            </div>
            <textarea
              rows={8}
              className="form-input"
              value={batchInputText}
              onChange={(e) => setBatchInputText(e.target.value)}
              style={{
                height: 'auto',
                fontFamily: 'monospace',
                fontSize: '13px',
                paddingTop: '10px'
              }}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleProcessBatch}
              disabled={isGenerating}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1.5px solid #0f172a',
                borderRadius: '10px',
                padding: '11px 28px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: isGenerating ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                transition: 'all 0.2s'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>{isGenerating ? 'Minting Certificates...' : 'Generate All Batch Certificates'}</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: CREDENTIAL VAULT & REGISTRY */}
      {studioTab === 'vault' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search by recipient name, ID or event..."
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select"
                style={{ width: '180px' }}
              >
                <option value="ALL">All Categories</option>
                {EVENT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              <button
                onClick={handleCreateNewCertificate}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Mint Certificate
              </button>
            </div>

          </div>

          {/* Table of Issued Certificates */}
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', background: '#ffffff' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Credential ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Recipient</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Event &amp; Role</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Theme</th>
                  <th style={{ padding: '12px 16px', fontWeight: 800 }}>Issue Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                      No certificates match current search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map(cert => (
                    <tr key={cert.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '12px' }}>
                          {cert.credentialId || cert.id}
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {cert.recipientName}
                        {cert.recipientEmail && <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>{cert.recipientEmail}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{cert.eventTitle}</div>
                        <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>{cert.roleOrAchievement}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                          {cert.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                        {cert.customBgImage ? 'Custom Image' : cert.theme}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        {cert.issuedDate}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setEmailingCert(cert);
                              setIsEmailModalOpen(true);
                            }}
                            title="Email Certificate via Nodemailer"
                            style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            Email
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCertId(cert.id);
                              setStudioTab('designer');
                            }}
                            title="Edit / View in Designer"
                            style={{ background: '#f1f5f9', border: '1.5px solid #cbd5e1', color: '#0f172a', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => onOpenPublicVerification && onOpenPublicVerification(cert.credentialId || cert.id)}
                            title="Open Public Verification Link"
                            style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', color: '#0f172a', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Verify
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id)}
                            title="Delete"
                            style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '8px', padding: '5px 8px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* CERTIFICATE EMAIL MODAL */}
      <CertificateEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        certificate={emailingCert || activeCert}
        activeOrg={activeOrg}
        onUpdateRecipientEmail={(newEmail) => {
          if (emailingCert) {
            handleUpdateActiveCert('recipientEmail', newEmail);
          }
        }}
      />

    </div>
  );
}
