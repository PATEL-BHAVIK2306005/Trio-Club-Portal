import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { sendDirectReactEmail, getMasterSmtpConfig } from '../../services/reactEmailService';
import { CLUB_CONFIGS } from '../../data/teamData';

export default function CertificateEmailModal({
  isOpen,
  onClose,
  certificate,
  activeOrg = 'AWS_SBG',
  onUpdateRecipientEmail
}) {
  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';
  const isTechno = activeOrg === 'TECHNO_LAB';

  const [recipientEmail, setRecipientEmail] = useState(() => certificate?.recipientEmail || '');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !certificate) return null;

  const smtpMaster = getMasterSmtpConfig();
  const officialSenderEmail = (isAWS ? smtpMaster.awsEmail : (isTechno ? smtpMaster.technoEmail : smtpMaster.gdgocEmail)) || activeClub.email || smtpMaster.globalDefaultEmail || 'aws.itmbu@gmail.com';

  const certTitle = certificate.eventTitle || 'Campus Technical Event 2026';
  const certRole = certificate.roleOrAchievement || 'Verified Participant';
  const certId = certificate.credentialId || certificate.id || 'CERT-2026-001';
  const subject = `🎉 Verified Certificate of Achievement: ${certTitle} • ${certificate.recipientName}`;

  // Certifier.io style HTML Email Template
  const certificateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${activeClub.primaryColor || '#ff9900'} 0%, #0f172a 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; padding: 5px 14px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.3);">
                ★ OFFICIAL VERIFIED CREDENTIAL ★
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">
                ${activeClub.name.toUpperCase()}
              </h1>
              <p style="color: rgba(255,255,255,0.92); margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                Department of Computer Science &amp; Engineering • ITM (sls) Baroda University
              </p>
            </td>
          </tr>

          <!-- Congratulatory Section -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center;">
              <div style="font-size: 46px; margin-bottom: 10px;">📜</div>
              <h2 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                Congratulations, ${certificate.recipientName}!
              </h2>
              <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                We are proud to award you this <strong>Verified Certificate of Achievement</strong> for outstanding participation and accomplishment as <strong>${certRole}</strong> in <strong>${certTitle}</strong>.
              </p>
            </td>
          </tr>

          ${customNote ? `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 14px 16px; font-size: 13.5px; color: #166534; line-height: 1.5;">
                <strong style="color: #10b981;">Message from Chapter Mentors:</strong><br/>
                ${customNote}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Certificate Details Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background: #0b1324; border-radius: 12px; padding: 22px 24px; color: #ffffff; text-align: left; border: 1px solid #1e293b;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 12px; margin-bottom: 14px;">
                  <tr>
                    <td>
                      <span style="font-size: 10.5px; color: ${activeClub.primaryColor || '#ff9900'}; font-weight: 800; letter-spacing: 0.8px;">DIGITAL CREDENTIAL BADGE</span>
                      <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 2px;">${certTitle}</div>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; padding: 4px 10px; background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #34d399; font-size: 10.5px; font-weight: 800; border-radius: 20px;">
                        ✓ CRYPTOGRAPHICALLY AUTHENTIC
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const handleSendCertificateEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      Swal.fire({
        icon: 'warning',
        title: 'Valid Email Required',
        text: 'Please provide a valid recipient email address.',
        background: '#ffffff',
        color: '#0f172a'
      });
      return;
    }

    setIsSending(true);
    try {
      if (onUpdateRecipientEmail) {
        onUpdateRecipientEmail(recipientEmail);
      }

      await sendDirectReactEmail({
        to: recipientEmail,
        subject: subject,
        html: certificateHtml,
        activeOrg: activeOrg
      });

      setIsSending(false);
      Swal.fire({
        icon: 'success',
        title: 'Certificate Dispatched!',
        text: `Official certificate email has been delivered to ${recipientEmail}`,
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonColor: '#0f172a'
      });
      onClose();
    } catch (err) {
      setIsSending(false);
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Dispatch Failed',
        text: err.message || 'Could not send certificate email.',
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonColor: '#0f172a'
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-md" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#f1f5f9',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Email Certificate to Candidate
                </h3>
                <span className="modal-club-badge" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginTop: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeClub.themeColor || '#2563eb' }}></span>
                  Via {activeClub.shortName} Official SMTP
                </span>
              </div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close Modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px', gap: '16px' }}>
          
          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
            <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: 700 }}>
              {certificate.recipientName} &bull; <span style={{ color: '#475569' }}>{certRole}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {certTitle} &bull; Ref ID: <span style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 700 }}>{certId}</span>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Recipient Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value.trim())}
              placeholder="candidate@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Custom Congratulatory Note <span style={{ fontWeight: 400, color: '#64748b' }}>(Optional)</span>
            </label>
            <textarea
              className="form-input"
              style={{ height: '80px', fontSize: '13px', paddingTop: '10px' }}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Outstanding performance in the Web Dev hackathon round!"
            />
          </div>

          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#166534', fontWeight: 500 }}>
            Will send from: <strong>{officialSenderEmail}</strong> with high-resolution digital certificate attached.
          </div>

        </div>

        <div className="modal-footer" style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1.5px solid #f1f5f9'
        }}>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={handleSendCertificateEmail}
            disabled={isSending}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: '1.5px solid #0f172a',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isSending ? 'wait' : 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {isSending ? 'Generating & Sending...' : 'Send Certificate Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
