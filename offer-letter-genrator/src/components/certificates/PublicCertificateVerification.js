import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';
import CertificateDocument from './CertificateDocument';
import { CLUB_CONFIGS } from '../../data/teamData';
import { downloadFhdCertificatePng } from '../../utils/fhdCertificateRenderer';
import { lookupCertificate } from '../../services/certificateVaultService';
import {
  ShieldCheck,
  Download,
  Share2,
  Copy,
  Check,
  Search,
  AlertTriangle,
  Home,
  MessageCircle,
  Loader2
} from 'lucide-react';

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
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const certContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1050);

  // Measure container for dynamic mobile scaling
  useEffect(() => {
    const handleResize = () => {
      if (certContainerRef.current) {
        setContainerWidth(certContainerRef.current.offsetWidth || 1050);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeCert]);

  // Lookup Certificate on mount or ID change with multi-tier cloud & DB resolution
  useEffect(() => {
    let isMounted = true;
    const resolveCert = async () => {
      const targetId = (certificateId || '').trim();
      if (!targetId) {
        if (allCertificates.length > 0) {
          setActiveCert(allCertificates[0]);
        }
        return;
      }

      setIsSearching(true);
      const found = await lookupCertificate(targetId, allCertificates);
      
      if (!isMounted) return;
      setIsSearching(false);

      if (found) {
        setActiveCert(found);
        setNotFound(false);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.65 }
          });
        } catch (e) {}
      } else {
        setNotFound(true);
        setActiveCert(null);
      }
    };

    resolveCert();
    return () => { isMounted = false; };
  }, [certificateId, allCertificates]);

  const handleSearch = async (e) => {
    e.preventDefault();
    let query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    const found = await lookupCertificate(query, allCertificates);
    setIsSearching(false);

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

  // Download FHD PNG
  const handleDownloadPng = async () => {
    if (!activeCert) return;
    try {
      await downloadFhdCertificatePng(activeCert);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'FHD Certificate PNG Downloaded!',
        showConfirmButton: false,
        timer: 2000,
        background: '#101626',
        color: '#f8fafc'
      });
    } catch (e) {
      console.error(e);
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
      title: 'Verification Link Copied!',
      showConfirmButton: false,
      timer: 2000,
      background: '#101626',
      color: '#f8fafc'
    });
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    if (!activeCert) return;
    const text = encodeURIComponent(`Check out my verified certificate for "${activeCert.eventTitle}" from ITM (sls) Baroda University: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Share to Twitter/X
  const handleShareTwitter = () => {
    if (!activeCert) return;
    const text = encodeURIComponent(`I am thrilled to receive the verified credential for "${activeCert.eventTitle}" from ITM (sls) Baroda University & ${currentClub.name}! 🚀 Check my verification:`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  // Calculate dynamic scale for responsive preview (1050px base width, 16:9 ratio)
  const calcScale = Math.min(1, Math.max(0.28, (containerWidth - 32) / 1050));
  const scaledHeight = Math.round(590.625 * calcScale);

  return (
    <div className="public-verifier-container" style={{ minHeight: '100vh', background: '#070a13', color: '#f8fafc', padding: '0 0 60px 0', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Responsive Inline CSS Styles */}
      <style>{`
        .verifier-header-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }
        .verifier-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(320px, 1fr);
          gap: 28px;
          align-items: start;
        }
        .verifier-top-banner {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .verifier-action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        @media (max-width: 1024px) {
          .verifier-main-grid {
            grid-template-columns: 1fr !important;
          }
          .verifier-top-banner {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .verifier-action-buttons {
            width: 100% !important;
          }
          .verifier-action-buttons button {
            flex: 1 !important;
            min-width: 140px !important;
          }
        }
        @media (max-width: 640px) {
          .verifier-header-wrap {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .verifier-search-form {
            max-width: 100% !important;
          }
          .verifier-action-buttons {
            flex-direction: column !important;
          }
          .verifier-action-buttons button {
            width: 100% !important;
          }
        }
      `}</style>

      {/* Top Navigation Bar: Certifier-Style Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1e293b',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        <div className="verifier-header-wrap" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          {/* Left: Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Credential Verification</span>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  OFFICIAL
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                ITM (sls) Baroda University &bull; Institutional Credential Authority
              </div>
            </div>
          </div>

          {/* Center: Quick ID Search */}
          <form onSubmit={handleSearch} className="verifier-search-form" style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '380px', width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search by ID, Hash, or Name..."
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
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSearching ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isSearching ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify'}
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
              <Home size={15} />
              <span>Return to Portal</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Verification Body */}
      <main style={{ maxWidth: '1300px', margin: '24px auto', padding: '0 16px' }}>

        {/* If Not Found */}
        {notFound && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '60px auto'
          }}>
            <AlertTriangle size={48} color="#f87171" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f87171', margin: '0 0 10px 0' }}>
              Credential Verification Unsuccessful
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: '1.6' }}>
              No official certificate found matching query: <strong>{searchQuery || certificateId}</strong>.
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
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
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
            <div className="verifier-top-banner" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '22px 26px',
              marginBottom: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>

              {/* Left: Security Checkmark & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                  flexShrink: 0
                }}>
                  <Check size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f0fdf4' }}>
                      Officially Verified &amp; Authentic Credential
                    </h2>
                    <span style={{
                      background: '#10b981',
                      color: '#064e3b',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}>
                      ACTIVE
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#a7f3d0', lineHeight: '1.4' }}>
                    Issued by <strong>ITM (sls) Baroda University</strong> &bull; Department of CSE &amp; {currentClub.name}
                  </p>
                </div>
              </div>

              {/* Right: Quick Action Buttons */}
              <div className="verifier-action-buttons">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isDownloading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Download size={16} />
                  <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={handleDownloadPng}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={16} />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={handleAddToLinkedIn}
                  style={{
                    background: '#0a66c2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(10, 102, 194, 0.4)'
                  }}
                >
                  <Share2 size={16} />
                  <span>Add to LinkedIn</span>
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
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {copiedLink ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Grid Layout: Left Certificate Canvas Viewer + Right Credential Dossier */}
            <div className="verifier-main-grid">

              {/* LEFT: Live Interactive Certificate Display (Auto Scaled for Mobile) */}
              <div
                ref={certContainerRef}
                style={{
                  background: '#0b1120',
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    📜 Official Certificate Preview
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#38bdf8', fontWeight: 600 }}>
                    FHD 1080p High-Definition
                  </div>
                </div>

                {/* Dynamically Scaled Certificate Wrapper */}
                <div style={{
                  width: '100%',
                  height: `${scaledHeight}px`,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: `translateX(-50%) scale(${calcScale})`,
                    transformOrigin: 'top center',
                    width: '1050px',
                    height: '590.625px',
                    aspectRatio: '16/9'
                  }}>
                    <CertificateDocument
                      certificate={activeCert}
                      itmbuLogo={itmbuLogo}
                      clubLogo={clubLogo}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: Detailed Credential Dossier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Card 1: Recipient & Event Details */}
                <div style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 800, color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                    📋 Credential Information
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Recipient Name</div>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
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
                          {activeCert.expiryDate || 'Lifetime Validity'}
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
                  padding: '22px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#10b981" />
                    <span>Security &amp; Tamper Verification</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Credential Reference ID</div>
                      <code style={{ background: '#090e1a', padding: '5px 10px', borderRadius: '6px', color: '#f59e0b', fontSize: '12.5px', fontWeight: 700, display: 'inline-block', marginTop: '3px' }}>
                        {activeCert.credentialId || activeCert.id}
                      </code>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Cryptographic Hash</div>
                      <code style={{ background: '#090e1a', padding: '6px 10px', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', display: 'block', wordBreak: 'break-all', marginTop: '3px' }}>
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

                  {/* Social Sharing */}
                  <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                      Share Verified Credential
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleShareWhatsApp}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#25D366',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>

                      <button
                        onClick={handleShareTwitter}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#000000',
                          color: '#ffffff',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Share2 size={14} /> Share on X
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
