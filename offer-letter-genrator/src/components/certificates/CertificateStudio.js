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

  // Certifier.io Interactive Field Positioner State (active by default for direct manipulation)
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
        background: '#101626',
        color: '#f8fafc',
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
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete',
      background: '#101626',
      color: '#f8fafc'
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
        background: '#101626',
        color: '#f8fafc'
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
      title: `⚡ ${newBatchCerts.length} Certificates Generated!`,
      text: 'All credentials have been minted with dynamic QR codes & added to the verified registry.',
      background: '#101626',
      color: '#f8fafc',
      confirmButtonColor: '#10b981'
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
    <div className="certificate-studio-suite" style={{ padding: '24px 30px', maxWidth: '1600px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Top Banner & Mode Switcher */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '20px 28px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📜</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '0.5px', color: '#ffffff' }}>
              Event Certificate Authority &amp; Studio
            </h1>
            <span style={{
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '12px'
            }}>
              CERTIFIER.IO DRAG &amp; POSITION + NODEMAILER EMAIL DISPATCH
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Upload custom certificate sample templates, set dynamic text field coordinates, and send authentic credentials via email.
          </p>
        </div>

        {/* Sub Navigation Pills */}
        <div style={{ display: 'flex', gap: '8px', background: '#090e1a', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          
          <button
            onClick={() => setStudioTab('designer')}
            style={{
              background: studioTab === 'designer' ? '#2563eb' : 'transparent',
              color: studioTab === 'designer' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🎨</span>
            <span>Live Designer</span>
          </button>

          <button
            onClick={() => setStudioTab('batch')}
            style={{
              background: studioTab === 'batch' ? '#2563eb' : 'transparent',
              color: studioTab === 'batch' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚡</span>
            <span>Batch Issuer</span>
          </button>

          <button
            onClick={() => setStudioTab('vault')}
            style={{
              background: studioTab === 'vault' ? '#2563eb' : 'transparent',
              color: studioTab === 'vault' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🗄️</span>
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
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}>
            
            {/* Header & Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>⚙️ Certificate Configurator</span>
              <button
                onClick={handleCreateNewCertificate}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + New Cert
              </button>
            </div>

            {/* Select Existing Certificate dropdown */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Select Active Certificate
              </label>
              <select
                value={selectedCertId}
                onChange={(e) => setSelectedCertId(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: '#090e1a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#f8fafc',
                  fontSize: '13px'
                }}
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
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#38bdf8' }}>
                      🖼️ Custom Template (Certifier.io Mode)
                    </span>
                    {activeCert.customBgImage && (
                      <button
                        type="button"
                        onClick={handleRemoveCustomTemplate}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '11.5px', color: '#94a3b8' }}>
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
                      display: 'block',
                      textAlign: 'center',
                      padding: '8px 14px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px dashed #0284c7',
                      borderRadius: '8px',
                      color: '#38bdf8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {activeCert.customBgImage ? '🔄 Replace Template Image' : '📁 Upload Certificate Template (PNG/JPG)'}
                  </label>

                  {/* FIELD POSITION & TYPOGRAPHY SETTER */}
                  <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                        🎯 Dynamic Field Customizer
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingPositions(!isEditingPositions)}
                        style={{
                          background: isEditingPositions ? '#10b981' : 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isEditingPositions ? '✓ Click-to-Place Active' : '📍 Enable Click-to-Place'}
                      </button>
                    </div>

                    {/* Choose Field to Customize */}
                    <select
                      value={selectedFieldKey}
                      onChange={(e) => setSelectedFieldKey(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#090e1a',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#38bdf8',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      <option value="name">👤 Recipient Name</option>
                      <option value="eventTitle">🏆 Event Title</option>
                      <option value="description">📜 Achievement / Description</option>
                      <option value="date">📅 Issue Date</option>
                      <option value="certId">🔑 Credential Ref ID</option>
                      <option value="qrCode">📱 Verification QR Code</option>
                    </select>

                    {/* Field Visibility Switch */}
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                        Show <strong>{selectedFieldKey}</strong> on Certificate:
                      </span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: currentFieldConfig.show !== false ? '#34d399' : '#f87171' }}>
                        <input
                          type="checkbox"
                          checked={currentFieldConfig.show !== false}
                          onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'show', e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        {currentFieldConfig.show !== false ? 'Visible' : 'Hidden'}
                      </label>
                    </div>

                    {/* Coordinate Sliders, Nudge Buttons & Direct Inputs */}
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', marginTop: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc' }}>📐 Position Coordinates</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'y', Math.max(0, (currentFieldConfig.y || 50) - 1))}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            title="Nudge Up 1%"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'y', Math.min(100, (currentFieldConfig.y || 50) + 1))}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            title="Nudge Down 1%"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'x', Math.max(0, (currentFieldConfig.x || 50) - 1))}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            title="Nudge Left 1%"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateFieldPos(selectedFieldKey, 'x', Math.min(100, (currentFieldConfig.x || 50) + 1))}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            title="Nudge Right 1%"
                          >
                            →
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>X (Horizontal):</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={currentFieldConfig.x !== undefined ? currentFieldConfig.x : 50}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'x', Number(e.target.value))}
                              style={{ width: '50px', background: '#090e1a', border: '1px solid #334155', borderRadius: '4px', padding: '2px 4px', color: '#38bdf8', fontSize: '11px', textAlign: 'right' }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={currentFieldConfig.x !== undefined ? currentFieldConfig.x : 50}
                            onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'x', Number(e.target.value))}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>Y (Vertical):</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={currentFieldConfig.y !== undefined ? currentFieldConfig.y : 50}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'y', Number(e.target.value))}
                              style={{ width: '50px', background: '#090e1a', border: '1px solid #334155', borderRadius: '4px', padding: '2px 4px', color: '#38bdf8', fontSize: '11px', textAlign: 'right' }}
                            />
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.5"
                            value={currentFieldConfig.y !== undefined ? currentFieldConfig.y : 50}
                            onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'y', Number(e.target.value))}
                            style={{ width: '100%', marginTop: '4px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* FONT SIZE, COLOR, WEIGHT & TYPOGRAPHY */}
                    {selectedFieldKey !== 'qrCode' && (
                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '10px', marginTop: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#38bdf8' }}>
                            🔤 Font Size: {currentFieldConfig.fontSize || 32}px
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                            [{selectedFieldKey?.toUpperCase()}]
                          </span>
                        </div>

                        {/* Font Size with Range + Direct Input + Steppers */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '3px' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.max(8, (currentFieldConfig.fontSize || 32) - 5))}
                                style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '4px', padding: '3px 6px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                                title="Decrease 5px"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.max(8, (currentFieldConfig.fontSize || 32) - 1))}
                                style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', padding: '3px 7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
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
                              style={{ width: '60px', background: '#090e1a', border: '1px solid #0284c7', borderRadius: '6px', padding: '4px 6px', color: '#38bdf8', fontSize: '13px', fontWeight: 800, textAlign: 'center' }}
                            />

                            <div style={{ display: 'flex', gap: '3px' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.min(120, (currentFieldConfig.fontSize || 32) + 1))}
                                style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', padding: '3px 7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                title="Increase 1px"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', Math.min(120, (currentFieldConfig.fontSize || 32) + 5))}
                                style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '4px', padding: '3px 6px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
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
                            style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
                          />

                          {/* Quick Size Presets */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', marginTop: '6px' }}>
                            {[16, 22, 28, 34, 44, 56].map(sizePreset => (
                              <button
                                key={sizePreset}
                                type="button"
                                onClick={() => handleUpdateFieldPos(selectedFieldKey, 'fontSize', sizePreset)}
                                style={{
                                  flex: 1,
                                  background: (currentFieldConfig.fontSize || 32) === sizePreset ? '#0284c7' : 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: (currentFieldConfig.fontSize || 32) === sizePreset ? '#ffffff' : '#94a3b8',
                                  borderRadius: '4px',
                                  padding: '3px 2px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {sizePreset}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color & Font Weight */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                          <div>
                            <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>Text Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                              <input
                                type="color"
                                value={currentFieldConfig.color || '#0f172a'}
                                onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'color', e.target.value)}
                                style={{ width: '36px', height: '28px', background: 'none', border: '1px solid #334155', borderRadius: '4px', cursor: 'pointer' }}
                              />
                              <input
                                type="text"
                                value={currentFieldConfig.color || '#0f172a'}
                                onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'color', e.target.value)}
                                style={{ width: '100%', background: '#090e1a', border: '1px solid #334155', borderRadius: '4px', padding: '4px 6px', color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>Font Weight</label>
                            <select
                              value={currentFieldConfig.fontWeight || 800}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'fontWeight', Number(e.target.value))}
                              style={{ width: '100%', marginTop: '3px', background: '#090e1a', border: '1px solid #334155', borderRadius: '4px', padding: '5px 6px', color: '#f8fafc', fontSize: '11.5px' }}
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', marginTop: '10px' }}>
                          <div>
                            <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>Font Style</label>
                            <select
                              value={currentFieldConfig.fontFamily || "'Playfair Display', Georgia, serif"}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'fontFamily', e.target.value)}
                              style={{ width: '100%', marginTop: '3px', background: '#090e1a', border: '1px solid #334155', borderRadius: '4px', padding: '5px 6px', color: '#f8fafc', fontSize: '11px' }}
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
                            <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>Spacing ({currentFieldConfig.letterSpacing !== undefined ? currentFieldConfig.letterSpacing : 1}px)</label>
                            <input
                              type="range"
                              min="0"
                              max="15"
                              step="0.5"
                              value={currentFieldConfig.letterSpacing !== undefined ? currentFieldConfig.letterSpacing : 1}
                              onChange={(e) => handleUpdateFieldPos(selectedFieldKey, 'letterSpacing', Number(e.target.value))}
                              style={{ width: '100%', marginTop: '6px' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Built-in Theme Selector (when not using custom background) */}
                {!activeCert.customBgImage && (
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      🎨 Built-In Luxury Theme
                    </label>
                    <select
                      value={activeCert.theme || 'GOLD_NAVY'}
                      onChange={(e) => handleUpdateActiveCert('theme', e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        background: '#090e1a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        color: '#fbbf24',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}
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
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    value={activeCert.recipientName || ''}
                    onChange={(e) => handleUpdateActiveCert('recipientName', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      background: '#090e1a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Recipient Email Address for Nodemailer dispatch */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={activeCert.recipientEmail || ''}
                    onChange={(e) => handleUpdateActiveCert('recipientEmail', e.target.value)}
                    placeholder="candidate@gmail.com"
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      background: '#090e1a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#38bdf8',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Event Title */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Event / Championship Title
                  </label>
                  <input
                    type="text"
                    value={activeCert.eventTitle || ''}
                    onChange={(e) => handleUpdateActiveCert('eventTitle', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      background: '#090e1a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Role / Achievement */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Achievement / Participation Role
                  </label>
                  <input
                    type="text"
                    value={activeCert.roleOrAchievement || ''}
                    onChange={(e) => handleUpdateActiveCert('roleOrAchievement', e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      background: '#090e1a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      color: '#fbbf24',
                      fontSize: '13px',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Issue Date & ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={activeCert.issuedDate || ''}
                      onChange={(e) => handleUpdateActiveCert('issuedDate', e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        background: '#090e1a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        color: '#f8fafc',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      Credential Ref ID
                    </label>
                    <input
                      type="text"
                      value={activeCert.credentialId || activeCert.id || ''}
                      onChange={(e) => handleUpdateActiveCert('credentialId', e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        background: '#090e1a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        color: '#f59e0b',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Signatory Names */}
                <div style={{ borderTop: '1px solid #334155', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                    ✍️ Signatory Details
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>Signatory 1 (Organizer / Lead)</label>
                      <input
                        type="text"
                        value={activeCert.signatory1?.name || ''}
                        onChange={(e) => handleUpdateSignatory('signatory1', 'name', e.target.value)}
                        placeholder="Name"
                        style={{ width: '100%', background: '#090e1a', border: '1px solid #334155', borderRadius: '6px', padding: '5px 8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', color: '#94a3b8' }}>Signatory 2 (Faculty Mentor / HoD)</label>
                      <input
                        type="text"
                        value={activeCert.signatory3?.name || ''}
                        onChange={(e) => handleUpdateSignatory('signatory3', 'name', e.target.value)}
                        placeholder="Faculty Mentor Name"
                        style={{ width: '100%', background: '#090e1a', border: '1px solid #334155', borderRadius: '6px', padding: '5px 8px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

              </>
            )}

          </div>

          {/* Right Live Preview Canvas & Action Toolbar */}
          <div style={{
            background: '#0b1120',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            overflowX: 'auto'
          }}>
            
            {/* Top Toolbar */}
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                  Live Document Canvas (Landscape A4/Letter)
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
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
                    background: 'linear-gradient(135deg, #ec4899, #be185d)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  <span>📧 Email Certificate</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isDownloadingPdf ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{isDownloadingPdf ? '⏳ Processing...' : '📥 Download FHD PDF'}</span>
                </button>

                <button
                  onClick={() => {
                    if (activeCert && onOpenPublicVerification) {
                      onOpenPublicVerification(activeCert.credentialId || activeCert.id);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🔍 Verify Public Link</span>
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
                      background: '#101626',
                      color: '#f8fafc'
                    });
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔗 Copy QR Link
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
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
              ⚡ Batch Mint &amp; Mass Certificate Engine
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Generate dozens or hundreds of verified participant &amp; winner certificates in a single click.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Event / Hackathon Name
              </label>
              <input
                type="text"
                value={batchEventTitle}
                onChange={(e) => setBatchEventTitle(e.target.value)}
                style={{ width: '100%', marginTop: '4px', background: '#090e1a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Event Category
              </label>
              <select
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                style={{ width: '100%', marginTop: '4px', background: '#090e1a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#f8fafc', fontSize: '13px' }}
              >
                {EVENT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Default Role / Designation
              </label>
              <input
                type="text"
                value={batchDefaultRole}
                onChange={(e) => setBatchDefaultRole(e.target.value)}
                placeholder="e.g. Participant"
                style={{ width: '100%', marginTop: '4px', background: '#090e1a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#fbbf24', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Default Foil Badge
              </label>
              <select
                value={batchDefaultBadge}
                onChange={(e) => setBatchDefaultBadge(e.target.value)}
                style={{ width: '100%', marginTop: '4px', background: '#090e1a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#f8fafc', fontSize: '13px' }}
              >
                {BADGE_TYPES.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Design Theme
              </label>
              <select
                value={batchTheme}
                onChange={(e) => setBatchTheme(e.target.value)}
                style={{ width: '100%', marginTop: '4px', background: '#090e1a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#fbbf24', fontSize: '13px', fontWeight: 700 }}
              >
                {Object.values(CERTIFICATE_THEMES).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Skills Covered (Comma-separated)
              </label>
              <input
                type="text"
                value={batchSkills}
                onChange={(e) => setBatchSkills(e.target.value)}
                style={{ width: '100%', marginTop: '4px', background: '#090e1a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#38bdf8', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
              Participant List (Format: Full Name, Email, Role/Rank, BadgeType)
            </label>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
              Paste one recipient per line. BadgeType can be: WINNER_GOLD, RUNNER_UP, SECOND_RUNNER, FINALIST, MERIT, COMPLETION, EXCELLENCE.
            </div>
            <textarea
              rows={8}
              value={batchInputText}
              onChange={(e) => setBatchInputText(e.target.value)}
              style={{
                width: '100%',
                background: '#090e1a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                color: '#f8fafc',
                fontSize: '13px',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleProcessBatch}
              disabled={isGenerating}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: isGenerating ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>{isGenerating ? '⏳ Minting Certificates...' : '⚡ Generate All Batch Certificates'}</span>
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: CREDENTIAL VAULT & REGISTRY */}
      {studioTab === 'vault' && (
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search by recipient name, ID or event..."
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090e1a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  background: '#090e1a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '13px'
                }}
              >
                <option value="ALL">All Categories</option>
                {EVENT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              <button
                onClick={handleCreateNewCertificate}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Mint Certificate
              </button>
            </div>

          </div>

          {/* Table of Issued Certificates */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#090e1a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 16px' }}>Credential ID</th>
                  <th style={{ padding: '12px 16px' }}>Recipient</th>
                  <th style={{ padding: '12px 16px' }}>Event &amp; Role</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Theme</th>
                  <th style={{ padding: '12px 16px' }}>Issue Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      No certificates match current search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map(cert => (
                    <tr key={cert.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ background: '#090e1a', color: '#f59e0b', padding: '3px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {cert.credentialId || cert.id}
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>
                        {cert.recipientName}
                        {cert.recipientEmail && <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{cert.recipientEmail}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{cert.eventTitle}</div>
                        <div style={{ fontSize: '11.5px', color: '#fbbf24' }}>{cert.roleOrAchievement}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                          {cert.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '11.5px', color: '#cbd5e1' }}>
                        {cert.customBgImage ? '🖼️ Custom Image' : cert.theme}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>
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
                            style={{ background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#f472b6', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            📧 Email
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCertId(cert.id);
                              setStudioTab('designer');
                            }}
                            title="Edit / View in Designer"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => onOpenPublicVerification && onOpenPublicVerification(cert.credentialId || cert.id)}
                            title="Open Public Verification Link"
                            style={{ background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(37, 99, 235, 0.4)', color: '#60a5fa', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            🔍 Verify
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id)}
                            title="Delete"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            🗑️
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
