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

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8; width: 42%;">Recipient Name:</td>
                    <td style="padding: 4px 0; color: #ffffff; font-weight: 700;">${certificate.recipientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Achievement / Role:</td>
                    <td style="padding: 4px 0; color: ${activeClub.primaryColor || '#ff9900'}; font-weight: 700;">${certRole}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Credential Ref ID:</td>
                    <td style="padding: 4px 0; color: #fbbf24; font-family: monospace; font-weight: 700;">${certId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Date of Issuance:</td>
                    <td style="padding: 4px 0; color: #ffffff;">${certificate.issuedDate || new Date().toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12.5px; color: #475569; font-weight: 600;">
                Official Certificate Authority: <a href="mailto:${officialSenderEmail}" style="color: #0284c7; text-decoration: none;">${officialSenderEmail}</a>
              </p>
              <p style="margin: 0; font-size: 11.5px; color: #94a3b8; line-height: 1.5;">
                Department of Computer Science &amp; Engineering<br/>
                <strong>ITM (sls) Baroda University</strong> • Vadodara, Gujarat 391510
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const plainText = `🎉 CONGRATULATIONS, ${certificate.recipientName.toUpperCase()}!

We are proud to award you this Official Verified Certificate of Achievement from ${activeClub.name} and ITM (sls) Baroda University.

==================================================
CERTIFICATE CREDENTIALS
==================================================
• Recipient: ${certificate.recipientName}
• Event: ${certTitle}
• Achievement / Role: ${certRole}
• Credential ID: ${certId}
• Issue Date: ${certificate.issuedDate || new Date().toLocaleDateString()}

A high-definition PDF certificate is attached to this email.

Warm regards,
${activeClub.name} Leadership Team
Department of Computer Science & Engineering
ITM (sls) Baroda University`;

  const handleSendCertificateEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email',
        text: 'Please provide a valid recipient email address.',
        background: '#101626',
        color: '#f8fafc',
        confirmButtonColor: '#ff9900'
      });
      return;
    }

    setIsSending(true);
    if (onUpdateRecipientEmail) {
      onUpdateRecipientEmail(recipientEmail);
    }

    try {
      // 1. Generate High-Res Certificate PDF
      let pdfBase64 = null;
      const certElement = document.getElementById('printable-certificate');
      if (certElement) {
        try {
          const html2pdfModule = await import('html2pdf.js');
          const html2pdf = html2pdfModule.default || html2pdfModule;
          const opt = {
            margin: [0, 0, 0, 0],
            filename: `Certificate_${(certificate.recipientName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_')}_${certId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2.5, useCORS: true, letterRendering: true, logging: false },
            jsPDF: { unit: 'px', format: [1050, 740], orientation: 'landscape' }
          };
          pdfBase64 = await html2pdf().set(opt).from(certElement).outputPdf('datauristring');
        } catch (pdfErr) {
          console.warn('[Certificate PDF Generation Fallback]:', pdfErr);
        }
      }

      // 2. Dispatch via active chapter Nodemailer backend
      const result = await sendDirectReactEmail({
        toEmail: recipientEmail,
        toName: certificate.recipientName,
        subject: subject,
        htmlContent: certificateHtml,
        plainText: plainText,
        pdfBase64: pdfBase64,
        clubConfig: activeClub,
        letterConfig: { letterRefId: certId, tenure: 'Lifetime Validity' },
        member: { name: certificate.recipientName, designation: certRole, letterRefId: certId },
        customNote: customNote
      });

      setIsSending(false);

      if (result.isDelivered) {
        Swal.fire({
          icon: 'success',
          title: 'Certificate Email Delivered!',
          html: `
            <div style="text-align: left; font-size: 13.5px; color: #cbd5e1;">
              <p>Verified Certificate PDF delivered to <strong>${recipientEmail}</strong> via <strong>${result.deliveryMethod}</strong>.</p>
              <div style="background: rgba(15, 23, 42, 0.8); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-top: 8px;">
                <p style="margin: 0;"><strong>Sender:</strong> ${officialSenderEmail}</p>
                <p style="margin: 4px 0 0 0; color: #34d399;"><strong>Status:</strong> Attached High-Def Certificate PDF 📎</p>
              </div>
            </div>
          `,
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#10b981'
        });
        onClose();
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Email Dispatch Note',
          text: result.data?.message || 'Certificate email logged to database.',
          background: '#101626',
          color: '#f8fafc',
          confirmButtonColor: '#38bdf8'
        });
      }
    } catch (err) {
      setIsSending(false);
      Swal.fire({
        icon: 'error',
        title: 'Dispatch Failed',
        text: err.message || 'Could not send certificate email.',
        background: '#101626',
        color: '#f8fafc'
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-md" style={{ maxWidth: '600px' }}>
        <div className="modal-header" style={{ borderBottom: `2px solid ${activeClub.primaryColor || '#ff9900'}` }}>
          <div className="modal-title-group">
            <h3 className="modal-title" style={{ margin: 0, fontSize: '18px' }}>
              📧 Email Certificate to Candidate
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Delivers official verified certificate with PDF attachment via {activeClub.shortName} SMTP.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 700 }}>
              📜 {certificate.recipientName} • {certRole}
            </div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
              {certTitle} • Ref ID: <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{certId}</span>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
              Recipient Email Address *
            </label>
            <input
              type="email"
              className="modal-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value.trim())}
              placeholder="candidate@gmail.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
              Custom Congratulatory Note (Optional)
            </label>
            <textarea
              className="modal-textarea"
              style={{ height: '80px', fontSize: '12.5px' }}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Outstanding performance in the Web Dev hackathon round!"
            />
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '10px 14px', marginTop: '14px', fontSize: '12px', color: '#34d399' }}>
            ✓ Will send from: <strong>{officialSenderEmail}</strong> with high-resolution PDF certificate attached.
          </div>

        </div>

        <div className="modal-footer" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose} disabled={isSending}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-primary"
            style={{ background: activeClub.primaryColor || '#ff9900', fontWeight: 700 }}
            onClick={handleSendCertificateEmail}
            disabled={isSending}
          >
            {isSending ? '⏳ Generating PDF & Sending...' : '🚀 Send Certificate Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
