import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { QRCodeSVG } from 'qrcode.react';
import { downloadFhdCertificatePng } from '../../utils/fhdCertificateRenderer';
import { sendDirectReactEmail } from '../../services/reactEmailService';
import { CLUB_CONFIGS } from '../../data/teamData';
import {
  Download,
  Clock,
  Search,
  ArrowLeft,
  Check,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Mail
} from 'lucide-react';

/**
 * BULK VIEW Component
 * Full HD Interactive Batch Previewer, Candidate Grid, Real-time Email Dispatcher with +1 Animated Loading Bar
 */
export default function BulkView({
  eventBatch = null,
  batchCertificates = [],
  onUpdateCertificates = null,
  onBackToStudio = null,
  activeOrg = 'AWS_SBG',
  onOpenVerification = null
}) {
  const [candidates, setCandidates] = useState(batchCertificates || []);
  const [selectedCandidate, setSelectedCandidate] = useState(batchCertificates[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'SENT' | 'PENDING'

  // Dispatch progress state
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [totalToSend, setTotalToSend] = useState(0);
  const [currentSendingName, setCurrentSendingName] = useState('');
  const [recentIncrement, setRecentIncrement] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState([]);

  // Active Club Configuration
  const club = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;

  useEffect(() => {
    setCandidates(batchCertificates);
    if (batchCertificates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(batchCertificates[0]);
    }
  }, [batchCertificates, selectedCandidate]);

  // Filtered candidate list
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchQuery ||
      (c.recipientName && c.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.recipientEmail && c.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.credentialId && c.credentialId.toLowerCase().includes(searchQuery.toLowerCase()));

    const isSent = Boolean(c.emailSent);
    const matchesFilter = filterStatus === 'ALL' ||
      (filterStatus === 'SENT' && isSent) ||
      (filterStatus === 'PENDING' && !isSent);

    return matchesSearch && matchesFilter;
  });

  const totalDelivered = candidates.filter(c => c.emailSent).length;
  const totalPending = candidates.length - totalDelivered;

  // Event Metadata
  const eventTitle = eventBatch?.eventTitle || candidates[0]?.eventTitle || 'Campus Technical Event 2026';
  const eventCategory = eventBatch?.category || candidates[0]?.category || 'WORKSHOP';
  const eventDate = eventBatch?.issuedDate || candidates[0]?.issuedDate || new Date().toISOString().split('T')[0];
  const orgName = club.name;

  // Single Candidate Download
  const handleDownloadSingle = async (candidate) => {
    try {
      await downloadFhdCertificatePng(candidate);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Downloaded FHD Certificate for ${candidate.recipientName}`,
        showConfirmButton: false,
        timer: 2000,
        background: '#0f172a',
        color: '#f8fafc'
      });
    } catch (e) {
      console.error(e);
      Swal.fire('Download Error', 'Could not render FHD Certificate', 'error');
    }
  };

  // Single Candidate Resend Email Handler
  const handleResendSingleCandidate = async (candidate) => {
    if (!candidate?.recipientEmail) {
      Swal.fire('No Email', 'No recipient email address specified for this candidate.', 'error');
      return;
    }

    const confirm = await Swal.fire({
      title: `Resend Certificate to ${candidate.recipientName}?`,
      text: `Dispatch verified credential email to ${candidate.recipientEmail}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Resend Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0284c7'
    });

    if (!confirm.isConfirmed) return;

    try {
      const certUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(candidate.credentialId || candidate.id)}`
        : `https://itmbu-credentials.org/?verify=${candidate.id}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
          <div style="text-align: center; border-bottom: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Verified Credential (Re-delivered)</span>
            <h2 style="color: #ffffff; margin: 10px 0 0 0;">${eventTitle}</h2>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Issued by ${orgName}</p>
          </div>
          <p style="font-size: 16px;">Dear <strong>${candidate.recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            Your official Full HD certificate token is active and cryptographically verified.
          </p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Certificate ID:</strong> <span style="color: #38bdf8; font-family: monospace;">${candidate.credentialId || candidate.id}</span></p>
            <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Cryptographic Hash:</strong> <span style="color: #a78bfa; font-family: monospace; font-size: 11px;">${candidate.hash}</span></p>
            <p style="margin: 0; font-size: 13px;"><strong>Issue Date:</strong> ${candidate.issuedDate || eventDate}</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${certUrl}" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
              🔍 View & Verify Your Certificate
            </a>
          </div>
        </div>
      `;

      await sendDirectReactEmail({
        toEmail: candidate.recipientEmail,
        recipientName: candidate.recipientName,
        subject: `🎉 Verified Certificate of Achievement: ${eventTitle} • ${candidate.recipientName}`,
        htmlContent: emailHtml,
        activeOrg: activeOrg
      });

      // Update state
      const updated = candidates.map(c => c.id === candidate.id ? { ...c, emailSent: true, emailSentAt: new Date().toISOString() } : c);
      setCandidates(updated);
      if (onUpdateCertificates) onUpdateCertificates(updated);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Resent Certificate to ${candidate.recipientName}!`,
        showConfirmButton: false,
        timer: 2000,
        background: '#0f172a',
        color: '#f8fafc'
      });
    } catch (e) {
      console.error(e);
      Swal.fire('Resend Error', e.message || 'Failed to resend email', 'error');
    }
  };

  // Trigger Bulk Email Dispatch with Animated +1 Counter
  const handleStartBulkDispatch = async () => {
    const unsentList = candidates.filter(c => !c.emailSent && c.recipientEmail);
    if (unsentList.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'All Delivered!',
        text: 'All candidates in this batch already have their credentials sent.',
        confirmButtonColor: '#0f172a'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: `Dispatch to ${unsentList.length} Candidates?`,
      html: `
        <div style="text-align: left; font-size: 14px; color: #334155; line-height: 1.6;">
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Recipients:</strong> ${unsentList.length} pending candidate emails</p>
          <p style="margin-top: 10px; color: #0284c7; font-weight: 600;">
            🚀 Each email includes their Full HD Verified Credential, QR Code, and Hash Token.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '🚀 Launch Real-time Dispatch',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b'
    });

    if (!confirm.isConfirmed) return;

    setIsSendingBulk(true);
    setSentCount(0);
    setTotalToSend(unsentList.length);
    setDispatchLogs([]);

    let successfulCount = 0;
    const updatedCandidates = [...candidates];

    for (let i = 0; i < unsentList.length; i++) {
      const candidate = unsentList[i];
      setCurrentSendingName(candidate.recipientName);

      const logEntry = {
        id: candidate.id,
        name: candidate.recipientName,
        email: candidate.recipientEmail,
        timestamp: new Date().toLocaleTimeString(),
        status: 'sending'
      };

      setDispatchLogs(prev => [logEntry, ...prev]);

      try {
        // Build email html
        const certUrl = typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(candidate.credentialId || candidate.id)}`
          : `https://itmbu-credentials.org/?verify=${candidate.id}`;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
            <div style="text-align: center; border-bottom: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Verified Credential</span>
              <h2 style="color: #ffffff; margin: 10px 0 0 0;">${eventTitle}</h2>
              <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Issued by ${orgName}</p>
            </div>
            <p style="font-size: 16px;">Dear <strong>${candidate.recipientName}</strong>,</p>
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
              Congratulations on your achievement! Your official Full HD certificate has been cryptographically minted and registered.
            </p>
            <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Certificate ID:</strong> <span style="color: #38bdf8; font-family: monospace;">${candidate.credentialId || candidate.id}</span></p>
              <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Cryptographic Hash:</strong> <span style="color: #a78bfa; font-family: monospace; font-size: 11px;">${candidate.hash}</span></p>
              <p style="margin: 0; font-size: 13px;"><strong>Issue Date:</strong> ${candidate.issuedDate || eventDate}</p>
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
          toEmail: candidate.recipientEmail,
          recipientName: candidate.recipientName,
          subject: `🎉 Verified Certificate of Achievement: ${eventTitle} • ${candidate.recipientName}`,
          htmlContent: emailHtml,
          activeOrg: activeOrg
        });

        successfulCount++;
        setSentCount(successfulCount);

        // Trigger "+1" micro-animation
        setRecentIncrement(true);
        setTimeout(() => setRecentIncrement(false), 800);

        // Update candidate state in memory
        const idx = updatedCandidates.findIndex(c => c.id === candidate.id);
        if (idx !== -1) {
          updatedCandidates[idx] = { ...updatedCandidates[idx], emailSent: true, emailSentAt: new Date().toISOString() };
        }

        // Update log
        setDispatchLogs(prev => prev.map(l => l.id === candidate.id ? { ...l, status: 'delivered' } : l));

        // Short throttle for reliability
        await new Promise(r => setTimeout(r, 600));

      } catch (e) {
        console.error(`Failed to send to ${candidate.recipientEmail}:`, e);
        setDispatchLogs(prev => prev.map(l => l.id === candidate.id ? { ...l, status: 'error', error: e.message } : l));
      }
    }

    setCandidates(updatedCandidates);
    if (onUpdateCertificates) {
      onUpdateCertificates(updatedCandidates);
    }

    setIsSendingBulk(false);
    setCurrentSendingName('');

    Swal.fire({
      icon: 'success',
      title: 'Bulk Dispatch Completed! 🎉',
      text: `Successfully dispatched ${successfulCount} of ${unsentList.length} candidate credentials.`,
      confirmButtonColor: '#0f172a'
    });
  };

  // Helper for dynamic preview URL
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://itmbu-credentials.org';

  const previewCert = selectedCandidate || candidates[0] || null;
  const previewCertId = previewCert?.credentialId || previewCert?.id || 'CERT-2026-FHD-001';
  const previewVerificationUrl = `${baseUrl}?verify=${encodeURIComponent(previewCertId)}`;

  const activePos = previewCert?.fieldPositions || {
    name: { x: 50, y: 50, fontSize: 36, color: '#0f172a', fontFamily: 'Verdana, sans-serif', fontWeight: 'bold', show: true },
    qrCode: { x: 88, y: 80, size: 70, show: true },
    hash: { x: 50, y: 88, fontSize: 13, color: '#64748b', fontFamily: 'monospace', show: true },
    verificationUrl: { x: 50, y: 92, fontSize: 12, color: '#0284c7', fontFamily: 'Verdana, sans-serif', show: true }
  };

  return (
    <div className="bulk-view-suite" style={{ padding: '24px 30px', maxWidth: '1650px', margin: '0 auto', color: '#0f172a', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Top Banner & Navigation Header */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '20px',
        padding: '20px 28px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBackToStudio && (
            <button
              onClick={onBackToStudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                color: '#334155',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              <ArrowLeft size={16} /> Back to Studio
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                background: '#e0f2fe',
                color: '#0284c7',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '20px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}>
                BATCH PREVIEW & DISPATCH
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Event: <strong style={{ color: '#0f172a' }}>{eventTitle}</strong>
                <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  {eventCategory}
                </span>
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Preview Bulk Certificates ({candidates.length} Total)
            </h2>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleStartBulkDispatch}
            disabled={isSendingBulk || totalPending === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: totalPending === 0 ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: (isSendingBulk || totalPending === 0) ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !isSendingBulk && totalPending > 0 && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !isSendingBulk && totalPending > 0 && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {isSendingBulk ? <Loader2 size={18} className="spin-animate" /> : <Send size={18} />}
            {isSendingBulk ? 'Sending In Progress...' : `Send All Credentials (${totalPending} Pending)`}
          </button>
        </div>
      </div>

      {/* Real-time Animated Loading / Dispatch Bar (Active during bulk email send) */}
      {isSendingBulk && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '18px',
          padding: '24px 28px',
          marginBottom: '24px',
          color: '#ffffff',
          boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
          border: '1.5px solid #334155',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <Send size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                  Live Credential Dispatch in Progress
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Currently emailing: <strong style={{ color: '#38bdf8' }}>{currentSendingName}</strong>
                </p>
              </div>
            </div>

            {/* Dynamic +1 Counter badge with pulse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {recentIncrement && (
                <span style={{
                  background: 'linear-gradient(135deg, #10b981, #34d399)',
                  color: '#0f172a',
                  fontWeight: '900',
                  fontSize: '14px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  animation: 'pulse 0.6s infinite alternate',
                  boxShadow: '0 0 14px rgba(52, 211, 153, 0.6)'
                }}>
                  +1 SENT!
                </span>
              )}
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#34d399' }}>
                {sentCount} <span style={{ fontSize: '15px', color: '#94a3b8', fontWeight: '500' }}>/ {totalToSend}</span>
              </span>
            </div>
          </div>

          {/* Animated Progress Track */}
          <div style={{
            width: '100%',
            height: '14px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${totalToSend > 0 ? (sentCount / totalToSend) * 100 : 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 50%, #818cf8 100%)',
              borderRadius: '10px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
            <span>Real-time delivery progress: {totalToSend > 0 ? Math.round((sentCount / totalToSend) * 100) : 0}%</span>
            <span>Cryptographic Verification tokens attached automatically</span>
          </div>

          {dispatchLogs.length > 0 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {dispatchLogs.slice(0, 4).map((log, lIdx) => (
                <span key={log.id || lIdx} style={{
                  fontSize: '11px',
                  background: log.status === 'delivered' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: log.status === 'delivered' ? '#34d399' : '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap'
                }}>
                  {log.status === 'delivered' ? '✓' : '•'} {log.name}: {log.status}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Split Grid: Left Candidate Directory / Right FHD Interactive Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* LEFT COLUMN: Candidate Directory & Status Filters */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #e2e8f0',
          padding: '22px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          {/* Header & Stats Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              Candidate List
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ background: '#ecfdf5', color: '#16a34a', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px' }}>
                {totalDelivered} Sent
              </span>
              <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px' }}>
                {totalPending} Pending
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {[
              { id: 'ALL', label: `All (${candidates.length})` },
              { id: 'PENDING', label: `Pending (${totalPending})` },
              { id: 'SENT', label: `Delivered (${totalDelivered})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: filterStatus === tab.id ? '#0f172a' : '#f1f5f9',
                  color: filterStatus === tab.id ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Candidate Cards */}
          <div style={{ maxHeight: '680px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {filteredCandidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '13px' }}>
                No matching candidates found.
              </div>
            ) : (
              filteredCandidates.map((cand, idx) => {
                const isSelected = selectedCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id || idx}
                    onClick={() => setSelectedCandidate(cand)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', width: '22px' }}>
                          #{idx + 1}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cand.recipientName}
                        </strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: '28px' }}>
                        {cand.recipientEmail || 'No email specified'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {cand.emailSent ? (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#10b981', fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '12px' }}>
                            <Check size={12} /> Sent
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResendSingleCandidate(cand);
                            }}
                            title="Resend certificate email to this candidate"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#f0f9ff',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            <RotateCcw size={10} /> Resend
                          </button>
                        </>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', color: '#94a3b8', fontSize: '10.5px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <Clock size={12} /> Ready
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Full HD Interactive Previewer for Selected Candidate */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          {previewCert ? (
            <div>
              {/* Preview Action Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    HIGH DEFINITION LIVE PREVIEW
                  </span>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                    {previewCert.recipientName}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    ID: <code style={{ color: '#0f172a', fontWeight: '700' }}>{previewCert.credentialId || previewCert.id}</code> • Hash: <code style={{ color: '#0284c7' }}>{(previewCert.hash || '').substring(0, 14)}...</code>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {previewCert.recipientEmail && (
                    <button
                      type="button"
                      onClick={() => handleResendSingleCandidate(previewCert)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        background: previewCert.emailSent ? '#0d9488' : '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: previewCert.emailSent ? '0 4px 12px rgba(13, 148, 136, 0.25)' : '0 4px 12px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      {previewCert.emailSent ? <RotateCcw size={15} /> : <Mail size={15} />}
                      {previewCert.emailSent ? 'Resend Email' : 'Send Email'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDownloadSingle(previewCert)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={15} /> Download PNG (FHD)
                  </button>

                  {onOpenVerification && (
                    <button
                      onClick={() => onOpenVerification(previewCert.credentialId || previewCert.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        background: '#f8fafc',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        color: '#334155',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={15} /> Verify URL
                    </button>
                  )}
                </div>
              </div>

              {/* Full HD Certificate Display Canvas Box */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                maxHeight: '620px',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 14px 40px rgba(0,0,0,0.12)',
                border: '2px solid #0f172a',
                background: previewCert.customBgImage ? `url(${previewCert.customBgImage}) center/cover no-repeat` : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090e1a 100%)'
              }}>
                {/* Fallback Border if no custom template image */}
                {!previewCert.customBgImage && (
                  <div style={{
                    position: 'absolute',
                    inset: '16px',
                    border: '3px solid #f59e0b',
                    borderRadius: '8px',
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Candidate Name Overlay */}
                {activePos.name?.show !== false && (
                  <div style={{
                    position: 'absolute',
                    left: `${activePos.name?.x || 50}%`,
                    top: `${activePos.name?.y || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${activePos.name?.fontSize || 34}px`,
                    fontFamily: activePos.name?.fontFamily || 'Verdana, sans-serif',
                    fontWeight: activePos.name?.fontWeight || 'bold',
                    color: activePos.name?.color || '#0f172a',
                    textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    {previewCert.recipientName}
                  </div>
                )}

                {/* QR Code Overlay */}
                {activePos.qrCode?.show !== false && (
                  <div style={{
                    position: 'absolute',
                    left: `${activePos.qrCode?.x || 88}%`,
                    top: `${activePos.qrCode?.y || 80}%`,
                    transform: 'translate(-50%, -50%)',
                    background: '#ffffff',
                    padding: '6px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    pointerEvents: 'none'
                  }}>
                    <QRCodeSVG value={previewVerificationUrl} size={activePos.qrCode?.size || 60} level="H" />
                  </div>
                )}

                {/* Hash ID Overlay */}
                {activePos.hash?.show !== false && (
                  <div style={{
                    position: 'absolute',
                    left: `${activePos.hash?.x || 50}%`,
                    top: `${activePos.hash?.y || 88}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${activePos.hash?.fontSize || 13}px`,
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    color: activePos.hash?.color || '#475569',
                    textAlign: 'center',
                    padding: activePos.hash?.bgPill === 'dark' || activePos.hash?.bgPill === 'light' ? '4px 12px' : '2px 6px',
                    borderRadius: '6px',
                    background: activePos.hash?.bgPill === 'dark'
                      ? 'rgba(15, 23, 42, 0.85)'
                      : activePos.hash?.bgPill === 'light'
                      ? 'rgba(255, 255, 255, 0.92)'
                      : 'transparent',
                    boxShadow: activePos.hash?.bgPill && activePos.hash?.bgPill !== 'none' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none'
                  }}>
                    Hash ID: {previewCert.hash}
                  </div>
                )}

                {/* Verification URL Overlay */}
                {activePos.verificationUrl?.show !== false && (
                  <div style={{
                    position: 'absolute',
                    left: `${activePos.verificationUrl?.x || 50}%`,
                    top: `${activePos.verificationUrl?.y || 92}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${activePos.verificationUrl?.fontSize || 12}px`,
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: '600',
                    color: activePos.verificationUrl?.color || '#0284c7',
                    textAlign: 'center',
                    padding: activePos.verificationUrl?.bgPill === 'dark' || activePos.verificationUrl?.bgPill === 'light' ? '4px 12px' : '2px 6px',
                    borderRadius: '6px',
                    background: activePos.verificationUrl?.bgPill === 'dark'
                      ? 'rgba(15, 23, 42, 0.85)'
                      : activePos.verificationUrl?.bgPill === 'light'
                      ? 'rgba(255, 255, 255, 0.92)'
                      : 'transparent',
                    boxShadow: activePos.verificationUrl?.bgPill && activePos.verificationUrl?.bgPill !== 'none' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none'
                  }}>
                    Verify at: {previewVerificationUrl.replace(/^https?:\/\//, '')}
                  </div>
                )}
              </div>

              {/* Triple Verification Indicator Bar */}
              <div style={{
                marginTop: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <div>
                    <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>1. QR Code</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Instant mobile camera scan</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#0284c7" />
                  <div>
                    <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>2. Cryptographic Hash</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>0x SHA Token verified</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#8b5cf6" />
                  <div>
                    <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>3. Public URL</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Live on public registry</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              Select a candidate from the directory to preview their Full HD certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
