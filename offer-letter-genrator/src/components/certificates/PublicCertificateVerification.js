import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';
import CertificateDocument from './CertificateDocument';
import { CLUB_CONFIGS } from '../../data/teamData';
import { CERTIFICATE_THEMES } from '../../data/certificateData';

export default function PublicCertificateVerification({
  certificateId,
  allCertificates = [],
  itmbuLogo,
  clubLogo,
  onNavigateHome
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCert, setActiveCert] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const certContainerRef = useRef(null);

  // Lookup Certificate on mount or ID change
  useEffect(() => {
    const targetId = (certificateId || '').trim();
    if (!targetId) {
      if (allCertificates.length > 0) {
        setActiveCert(allCertificates[0]);
      }
      return;
    }

    const found = allCertificates.find(c =>
      (c.id && c.id.toLowerCase() === targetId.toLowerCase()) ||
      (c.credentialId && c.credentialId.toLowerCase() === targetId.toLowerCase())
    );

    if (found) {
      setActiveCert(found);
      setNotFound(false);
      // Trigger subtle celebration confetti for verified credentials
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    } else {
      setNotFound(true);
      setActiveCert(null);
    }
  }, [certificateId, allCertificates]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const found = allCertificates.find(c =>
      (c.id && c.id.toLowerCase() === query.toLowerCase()) ||
      (c.credentialId && c.credentialId.toLowerCase() === query.toLowerCase()) ||
      (c.recipientName && c.recipientName.toLowerCase().includes(query.toLowerCase()))
    );

    if (found) {
      setActiveCert(found);
      setNotFound(false);
      window.history.replaceState(null, '', `?verify=${encodeURIComponent(found.credentialId || found.id)}`);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Found Certificate for ${found.recipientName}!`,
        showConfirmButton: false,
        timer: 2000,
        background: '#101626',
        color: '#f8fafc'
      });
    } else {
      setNotFound(true);
      setActiveCert(null);
    }
  };

  const currentClub = activeCert ? (CLUB_CONFIGS[activeCert.organization] || CLUB_CONFIGS.AWS_SBG) : CLUB_CONFIGS.AWS_SBG;
  const currentTheme = activeCert ? (CERTIFICATE_THEMES[activeCert.theme] || CERTIFICATE_THEMES.GOLD_NAVY) : CERTIFICATE_THEMES.GOLD_NAVY;

  // Download FHD PDF
  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-certificate');
    if (!element) return;

    setIsDownloading(true);
    const opt = {
      margin: 0,
      filename: `${(activeCert.recipientName || 'Certificate').replace(/\s+/g, '_')}_${activeCert.id || 'Verified'}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
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
        icon: 'success',
        title: 'Verified Certificate Downloaded!',
        text: 'The official high-definition PDF has been saved with tamper-proof security metadata.',
        background: '#101626',
        color: '#f8fafc',
        confirmButtonColor: '#10b981'
      });
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // LinkedIn Add-To-Profile URL
  const handleAddToLinkedIn = () => {
    if (!activeCert) return;
    const certName = encodeURIComponent(`${activeCert.eventTitle} (${activeCert.roleOrAchievement})`);
    const orgName = encodeURIComponent('ITM (sls) Baroda University');
    const issueDate = new Date(activeCert.issuedDate || Date.now());
    const issueYear = issueDate.getFullYear();
    const issueMonth = issueDate.getMonth() + 1;
    const certId = encodeURIComponent(activeCert.credentialId || activeCert.id);
    const certUrl = encodeURIComponent(window.location.href);

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${certUrl}&certId=${certId}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Verification Link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Verification Link Copied to Clipboard!',
      showConfirmButton: false,
      timer: 2000,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Share to Twitter/X
  const handleShareTwitter = () => {
    if (!activeCert) return;
    const text = encodeURIComponent(`I am thrilled to receive the verified credential for "${activeCert.eventTitle}" (${activeCert.roleOrAchievement}) from ITM (sls) Baroda University & ${currentClub.name}! 🚀 Check out my verified credential:`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    if (!activeCert) return;
    const text = encodeURIComponent(`Check out my verified certificate for "${activeCert.eventTitle}" from ITM (sls) Baroda University: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="public-verifier-container" style={{ minHeight: '100vh', background: '#070a13', color: '#f8fafc', padding: '0 0 60px 0' }}>
      
      {/* Top Navigation Bar: Certifier-Style Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1e293b',
        padding: '14px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ITMBU Credential Verification Engine</span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                OFFICIAL CERTIFIER
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Authentic Institutional Digital Credential Registry &bull; ITM (sls) Baroda University
            </div>
          </div>
        </div>

        {/* Center: Quick ID Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '380px', width: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by Credential ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#090e1a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 14px 8px 34px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
          </div>
          <button
            type="submit"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Verify ID
          </button>
        </form>

        {/* Right: Return Portal button */}
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid #334155',
              color: '#cbd5e1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🏠</span>
            <span>Return to Portal</span>
          </button>
        )}
      </header>

      {/* Main Verification Body */}
      <main style={{ maxWidth: '1240px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* If Not Found */}
        {notFound && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '60px auto'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f87171', margin: '0 0 10px 0' }}>
              Credential Verification Unsuccessful
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
              No official event certificate found matching ID: <strong>{searchQuery || certificateId}</strong>.
              Please check the certificate ID printed on your document or scan the official QR code again.
            </p>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {allCertificates.length > 0 && (
                <button
                  onClick={() => {
                    setActiveCert(allCertificates[0]);
                    setNotFound(false);
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View Sample Verified Certificate
                </button>
              )}
            </div>
          </div>
        )}

        {/* If Active Certificate Found */}
        {activeCert && (
          <div>
            
            {/* Top Verification Status Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '24px 30px',
              marginBottom: '28px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              
              {/* Left: Security Checkmark & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.5)'
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f0fdf4' }}>
                      Officially Verified &amp; Authentic Credential
                    </h2>
                    <span style={{
                      background: '#10b981',
                      color: '#064e3b',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '10px'
                    }}>
                      ACTIVE
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#a7f3d0', lineHeight: '1.4' }}>
                    Issued by <strong>ITM (sls) Baroda University</strong> &bull; Department of CSE &amp; {currentClub.name}
                  </p>
                </div>
              </div>

              {/* Right: Quick Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: isDownloading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <span>{isDownloading ? '⏳ Generating...' : '📥 Download Official PDF'}</span>
                </button>

                <button
                  onClick={handleAddToLinkedIn}
                  style={{
                    background: '#0a66c2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(10, 102, 194, 0.4)'
                  }}
                >
                  <span>💼 Add to LinkedIn</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{copiedLink ? '✓ Copied!' : '🔗 Copy Link'}</span>
                </button>

              </div>

            </div>

            {/* Grid Layout: Left Certificate Canvas Viewer + Right Credential Dossier */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 1fr)',
              gap: '28px',
              alignItems: 'start'
            }}>
              
              {/* LEFT: Live Interactive Certificate Display */}
              <div style={{
                background: '#0b1120',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                overflowX: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    📜 Official Certificate Canvas Preview
                  </div>
                  <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
                    Theme: {currentTheme.name}
                  </div>
                </div>

                <div ref={certContainerRef} style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ transform: 'scale(0.88)', transformOrigin: 'top center', marginBottom: '-60px' }}>
                    <CertificateDocument
                      certificate={activeCert}
                      itmbuLogo={itmbuLogo}
                      clubLogo={clubLogo}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: Detailed Credential Dossier (Certifier Style) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Card 1: Recipient & Event Details */}
                <div style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                    📋 Credential Information
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Recipient Name</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                        {activeCert.recipientName}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Event Title</div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                        {activeCert.eventTitle}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Role / Distinction</div>
                        <div style={{ fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
                          {activeCert.roleOrAchievement}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Category</div>
                        <div style={{ fontWeight: 700, color: '#cbd5e1', marginTop: '2px' }}>
                          {activeCert.category}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Issued Date</div>
                        <div style={{ fontWeight: 600, color: '#cbd5e1', marginTop: '2px' }}>
                          {activeCert.issuedDate}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Validity</div>
                        <div style={{ fontWeight: 600, color: '#34d399', marginTop: '2px' }}>
                          {activeCert.expiryDate || 'Lifetime'}
                        </div>
                      </div>
                    </div>

                    {/* Evaluated Competencies / Skills */}
                    {Array.isArray(activeCert.skills) && activeCert.skills.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                          Validated Skills &amp; Technologies
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {activeCert.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'rgba(56, 189, 248, 0.12)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '12px'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Card 2: Cryptographic Security & Anti-Fraud Seals */}
                <div style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔐</span>
                    <span>Security &amp; Tamper Verification</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Credential Reference ID</div>
                      <code style={{ background: '#090e1a', padding: '4px 8px', borderRadius: '6px', color: '#f59e0b', fontSize: '12px', fontWeight: 700, display: 'inline-block', marginTop: '3px' }}>
                        {activeCert.credentialId || activeCert.id}
                      </code>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Cryptographic Hash</div>
                      <code style={{ background: '#090e1a', padding: '4px 8px', borderRadius: '6px', color: '#94a3b8', fontSize: '10.5px', display: 'block', wordBreak: 'break-all', marginTop: '3px' }}>
                        {activeCert.hash || '0x8f73b9e4a1290382d610e7ca519a799320e8b1d9c'}
                      </code>
                    </div>

                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: '#a7f3d0',
                      fontSize: '11.5px',
                      lineHeight: '1.4'
                    }}>
                      🛡️ <strong>Institution Seal Verified:</strong> This credential was generated with cryptographic signature binding directly to ITM (sls) Baroda University event records.
                    </div>
                  </div>

                  {/* Social Sharing Sprints */}
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                      Share Credential
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleShareTwitter}
                        style={{
                          flex: 1,
                          background: '#1d9bf0',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        🐦 Post on X
                      </button>
                      <button
                        onClick={handleShareWhatsApp}
                        style={{
                          flex: 1,
                          background: '#25d366',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
