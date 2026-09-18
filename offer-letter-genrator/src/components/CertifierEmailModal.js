import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { sendDirectReactEmail, getEmailConfig, saveEmailConfig } from '../services/reactEmailService';

export default function CertifierEmailModal({
  isOpen,
  onClose,
  member,
  clubConfig,
  letterConfig = {},
  onUpdateMemberEmail
}) {
  const activeClub = clubConfig || {
    id: 'AWS_SBG',
    name: 'AWS Student Builder Group',
    shortName: 'AWS SBG',
    email: 'aws.itmbu@gmail.com',
    primaryColor: '#ff9900'
  };

  const isAWS = activeClub.id === 'AWS_SBG';
  const isTechno = activeClub.id === 'TECHNO_LAB';

  const defaultEmail = member?.email || (member?.name ? `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : '');
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [customGreetingNote, setCustomGreetingNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'settings' | 'logs'
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [copiedTextStatus, setCopiedTextStatus] = useState(false);

  // EmailJS / Service Settings State (React equivalent to ASP.NET web.config / appsettings.json)
  const [emailConfig, setEmailConfigState] = useState(() => getEmailConfig());
  const [recentLogs, setRecentLogs] = useState([]);

  const memberKey = member ? (member._id || member.id || member.name) : null;

  useEffect(() => {
    if (isOpen && member) {
      setRecipientEmail(member.email || (member.name ? `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : ''));
    }
    try {
      const logs = JSON.parse(localStorage.getItem('offer_gen_email_logs') || '[]');
      setRecentLogs(logs.slice(0, 10));
    } catch (e) {}
  }, [memberKey, isOpen]);

  if (!isOpen || !member) return null;

  const refId = member.letterRefId || letterConfig.letterRefId || `${activeClub.refPrefix || 'OFFER'}-${member._id?.substring(0, 5) || '001'}`;
  const tenure = letterConfig.tenure || 'Academic Year 2026 – 2027';
  const issueDate = letterConfig.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const officialSenderEmail = activeClub.email || (isAWS ? 'aws.itmbu@gmail.com' : (isTechno ? 'technolabclub25@gmail.com' : 'gdgoc.itmbu@gmail.com'));

  const subject = `🎉 Congratulations ${member.name}! Official Appointment & Joining Letter from ${activeClub.name}`;

  // Certifier.io Style HTML Template
  const certifierHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid #e2e8f0;">
          
          <!-- Top Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${activeClub.primaryColor || '#ff9900'} 0%, #0f172a 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; padding: 5px 14px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.3);">
                ★ OFFICIAL VERIFIED APPOINTMENT ★
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                ${activeClub.name.toUpperCase()}
              </h1>
              <p style="color: rgba(255,255,255,0.92); margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                Department of Computer Science &amp; Engineering • ITM (sls) Baroda University
              </p>
            </td>
          </tr>

          <!-- Hero Greeting Section (Certifier.io Style) -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center;">
              <div style="font-size: 46px; margin-bottom: 10px;">🎉</div>
              <h2 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                Congratulations, ${member.name}!
              </h2>
              <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.6;">
                We are pleased to officially announce your appointment as <strong style="color: #0f172a;">${member.designation || member.roleType}</strong> in the <strong>${member.department || 'Core Team'}</strong> for <strong>${tenure}</strong>.
              </p>
            </td>
          </tr>

          ${customGreetingNote ? `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 0 8px 8px 0; padding: 14px 16px; font-size: 13.5px; color: #0369a1; line-height: 1.5;">
                <strong style="color: #0284c7;">Message from Chapter Leadership:</strong><br/>
                ${customGreetingNote}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Certificate / Offer Letter Visual Preview Frame -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background: #0b1324; border-radius: 12px; padding: 22px 24px; color: #ffffff; text-align: left; border: 1px solid #1e293b; box-shadow: 0 8px 20px rgba(0,0,0,0.25);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 12px; margin-bottom: 14px;">
                  <tr>
                    <td>
                      <span style="font-size: 10.5px; color: ${activeClub.primaryColor || '#38bdf8'}; font-weight: 800; letter-spacing: 0.8px;">DIGITAL CREDENTIAL PASS</span>
                      <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 2px;">OFFICIAL JOINING LETTER</div>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; padding: 4px 10px; background: rgba(16,185,129,0.2); border: 1px solid #10b981; color: #34d399; font-size: 10.5px; font-weight: 800; border-radius: 20px;">
                        ✓ VERIFIED AUTHENTIC
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- Credential Matrix Grid -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8; width: 42%;">Candidate Name:</td>
                    <td style="padding: 4px 0; color: #ffffff; font-weight: 700;">${member.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Designation / Role:</td>
                    <td style="padding: 4px 0; color: ${activeClub.primaryColor || '#38bdf8'}; font-weight: 700;">${member.designation || member.roleType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Department Wing:</td>
                    <td style="padding: 4px 0; color: #ffffff; font-weight: 600;">${member.department || 'General Track'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Credential Ref ID:</td>
                    <td style="padding: 4px 0; color: #fbbf24; font-family: monospace; font-weight: 700;">${refId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Date of Issuance:</td>
                    <td style="padding: 4px 0; color: #ffffff;">${issueDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #94a3b8;">Academic Tenure:</td>
                    <td style="padding: 4px 0; color: #ffffff;">${tenure}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Primary Call to Action Button (Certifier.io Standard) -->
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, ${activeClub.primaryColor || '#0284c7'} 0%, #0f172a 100%);">
                    <a href="mailto:${officialSenderEmail}?subject=Offer%20Letter%20Verification%20Ref%20${encodeURIComponent(refId)}" 
                       target="_blank" 
                       style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
                      📄 View &amp; Confirm Appointment
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">
                Officially authorized by <strong>Dr. Pradeep Laxkar (Faculty Patron / Head CSE)</strong>
              </p>
            </td>
          </tr>

          ${member.responsibilities && member.responsibilities.length > 0 ? `
          <!-- Scope of Responsibilities -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                  📋 Scope of Responsibilities
                </h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #475569; line-height: 1.6;">
                  ${member.responsibilities.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Institutional Contact & Verification Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12.5px; color: #475569; font-weight: 600;">
                Official Chapter Desk: <a href="mailto:${officialSenderEmail}" style="color: #0284c7; text-decoration: none;">${officialSenderEmail}</a>
              </p>
              <p style="margin: 0; font-size: 11.5px; color: #94a3b8; line-height: 1.5;">
                Department of Computer Science &amp; Engineering<br/>
                <strong>ITM (sls) Baroda University</strong> • Vadodara, Gujarat 391510<br/>
                <em>“Think Big... Think Beyond”</em>
              </p>
              <div style="margin-top: 12px; font-size: 10.5px; color: #cbd5e1;">
                Trio Club Portal • Credential Verification &amp; Appointment Dispatch System
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain Text Version
  const plainText = `🎉 CONGRATULATIONS, ${member.name.toUpperCase()}!

On behalf of ${activeClub.name} and ITM (sls) Baroda University, Department of Computer Science & Engineering, we are delighted to present your Official Appointment & Joining Letter.

==================================================
OFFICIAL APPOINTMENT CREDENTIALS
==================================================
• Candidate Name: ${member.name}
• Designation / Role: ${member.designation || member.roleType}
• Department / Wing: ${member.department || 'General Track'}
• Credential Ref ID: ${refId}
• Academic Tenure: ${tenure}
• Date of Issuance: ${issueDate}
• Institution: ITM (sls) Baroda University, Vadodara, Gujarat

${customGreetingNote ? `Message from Chapter Leadership:\n${customGreetingNote}\n\n` : ''}${member.responsibilities && member.responsibilities.length > 0 ? `Key Scope of Responsibilities:\n${member.responsibilities.map(r => `• ${r}`).join('\n')}\n\n` : ''}This document confirms your verified appointment. For inquiries, contact the official chapter desk at ${officialSenderEmail}.

Warm regards,
${activeClub.name} Leadership Team
Department of Computer Science & Engineering
ITM (sls) Baroda University, Vadodara
"Think Big... Think Beyond"`;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;

  // 1-Click Direct Email Service Dispatch (React / ASP.NET equivalent)
  const handleDirectEmailDispatch = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Email Address',
        text: 'Please enter a valid candidate email (e.g. name@gmail.com).',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#ff9900'
      });
      return;
    }

    setIsSending(true);

    if (onUpdateMemberEmail) {
      onUpdateMemberEmail(recipientEmail);
    }

    try {
      const result = await sendDirectReactEmail({
        toEmail: recipientEmail,
        toName: member.name,
        subject: subject,
        htmlContent: certifierHtml,
        plainText: plainText,
        clubConfig: activeClub,
        letterConfig: letterConfig,
        member: member,
        customNote: customGreetingNote
      });

      setIsSending(false);

      Swal.fire({
        icon: 'success',
        title: 'Email Service Dispatched!',
        html: `
          <div style="text-align: left; font-size: 13.5px; color: #cbd5e1; line-height: 1.6;">
            <p>Your Certifier.io-style offer letter has been processed through the React Email Service engine:</p>
            <div style="background: rgba(15, 23, 42, 0.85); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
              <p style="margin: 0;"><strong>👤 Recipient:</strong> ${recipientEmail}</p>
              <p style="margin: 4px 0 0 0;"><strong>🏛️ From Desk:</strong> ${officialSenderEmail}</p>
              <p style="margin: 4px 0 0 0; color: #38bdf8;"><strong>⚡ Engine:</strong> ${result.deliveryMethod}</p>
              <p style="margin: 4px 0 0 0; color: #34d399;"><strong>✓ Status:</strong> Dispatched &amp; Logged in Audit DB</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin: 8px 0;">You can also launch 1-Click Gmail composer if you wish to verify sent messages:</p>
            <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
              <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" 
                 style="display: inline-flex; align-items: center; gap: 4px; padding: 8px 14px; background: #ea4335; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 12.5px;">
                ✉️ Open Gmail Web
              </a>
              <a href="${mailtoUrl}" 
                 style="display: inline-flex; align-items: center; gap: 4px; padding: 8px 14px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 12.5px;">
                📧 Default Mail App
              </a>
            </div>
          </div>
        `,
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Done'
      });
    } catch (err) {
      setIsSending(false);
      Swal.fire({
        icon: 'error',
        title: 'Dispatch Failed',
        text: err.message || 'Could not send email.',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(certifierHtml);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(plainText);
    setCopiedTextStatus(true);
    setTimeout(() => setCopiedTextStatus(false), 2500);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveEmailConfig(emailConfig);
    Swal.fire({
      icon: 'success',
      title: 'Email Configuration Saved',
      text: 'React EmailJS / SMTP service keys updated successfully!',
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#10b981'
    });
    setActiveTab('compose');
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(10, 15, 29, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }}>
      <div className="modal-card certifier-email-modal" style={{ maxWidth: '940px', width: '96%', maxHeight: '94vh', display: 'flex', flexDirection: 'column', background: '#0b1324', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', overflow: 'hidden', padding: 0, boxShadow: '0 25px 60px rgba(0,0,0,0.65)' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '16px 24px', background: 'linear-gradient(90deg, #111e38 0%, #0d172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '26px' }}>✨</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17.5px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                React Email Service &amp; Certifier Greeting Desk
                <span style={{ fontSize: '10.5px', background: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', border: '1px solid #38bdf8' }}>
                  ASP.NET Mail Equivalent
                </span>
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Official appointment sender: <strong>{officialSenderEmail}</strong>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                style={{ background: activeTab === 'compose' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                ✉️ Compose
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                style={{ background: activeTab === 'settings' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                ⚙️ Service Keys
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                style={{ background: activeTab === 'logs' ? '#0284c7' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                📜 Dispatch Logs
              </button>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer', padding: '4px 8px' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        {activeTab === 'compose' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', flex: 1, overflow: 'hidden' }}>
            
            {/* Left Column: Dispatch Controls */}
            <div style={{ padding: '20px', borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(15, 23, 42, 0.6)' }}>
              
              {/* Official Sender Box */}
              <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>🏛️ Official Sender Desk</span>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: activeClub.primaryColor || '#38bdf8', marginTop: '2px' }}>
                  {activeClub.name}
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  &lt;{officialSenderEmail}&gt;
                </div>
              </div>

              {/* Recipient Email Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                  🎓 Candidate Recipient Email:
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecipientEmail(val);
                    if (onUpdateMemberEmail) onUpdateMemberEmail(val);
                  }}
                  placeholder="e.g. candidate@gmail.com"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '10px 12px', color: '#ffffff', fontSize: '13.5px', outline: 'none' }}
                />
                <span style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', display: 'block' }}>
                  ✓ Direct delivery to any @gmail.com, Yahoo, Outlook, or institutional email
                </span>
              </div>

              {/* Personal Chapter Note */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                  ✍️ Optional Leadership Congratulatory Note:
                </label>
                <textarea
                  value={customGreetingNote}
                  onChange={(e) => setCustomGreetingNote(e.target.value)}
                  placeholder="e.g. We are thrilled to welcome you to the core team! Looking forward to building revolutionary tech together."
                  rows={3}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '10px 12px', color: '#ffffff', fontSize: '12.5px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Letter Metadata Details */}
              <div style={{ background: 'rgba(2, 132, 199, 0.08)', borderLeft: '3px solid #38bdf8', padding: '10px 12px', borderRadius: '0 8px 8px 0', fontSize: '11.5px', color: '#94a3b8' }}>
                <div><strong>Candidate:</strong> <span style={{ color: '#fff' }}>{member.name}</span></div>
                <div><strong>Role:</strong> <span style={{ color: '#38bdf8' }}>{member.designation || member.roleType}</span></div>
                <div><strong>Ref ID:</strong> <span style={{ color: '#fbbf24' }}>{refId}</span></div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Primary Direct React Email Dispatch */}
                <button
                  type="button"
                  onClick={handleDirectEmailDispatch}
                  disabled={isSending}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                  }}
                >
                  <span>{isSending ? '⏳ Sending via React Service...' : '⚡ Send Direct to Candidate Inbox'}</span>
                </button>

                {/* 1-Click Gmail Composer Fallback */}
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #ea4335 0%, #c5221f 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(234, 67, 53, 0.3)'
                  }}
                >
                  <span>🚀 Launch 1-Click Official Gmail</span>
                </a>

                {/* Copy Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    style={{
                      background: '#1e293b',
                      color: copiedStatus ? '#34d399' : '#38bdf8',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{copiedStatus ? '✅ Copied HTML!' : '📋 Copy Rich HTML'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    style={{
                      background: '#1e293b',
                      color: copiedTextStatus ? '#34d399' : '#cbd5e1',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{copiedTextStatus ? '✅ Copied Text!' : '📄 Copy Plain Text'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Live Certifier.io Email Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0f172a' }}>
              <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👁️ Live Certifier.io Template Preview
                </span>
                <span style={{ fontSize: '11px', color: '#38bdf8' }}>
                  Verified Official Letter
                </span>
              </div>

              {/* Embedded Live HTML Preview */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <div 
                  dangerouslySetInnerHTML={{ __html: certifierHtml }} 
                  style={{ transform: 'scale(0.88)', transformOrigin: 'top center', width: '100%', maxWidth: '620px' }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Service Settings (ASP.NET appsettings.json equivalent) */}
        {activeTab === 'settings' && (
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#0b1324' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#f8fafc', fontWeight: 700 }}>
                ⚙️ React Email Engine Configuration (EmailJS / Custom Keys)
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#94a3b8' }}>
                Just like configuring SMTP credentials in ASP.NET <code>web.config</code>, you can add your EmailJS keys here or leave empty to use backend Node SMTP and direct dispatch.
              </p>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    EmailJS Service ID:
                  </label>
                  <input
                    type="text"
                    value={emailConfig.serviceId}
                    onChange={(e) => setEmailConfigState({ ...emailConfig, serviceId: e.target.value })}
                    placeholder="e.g. service_aws_itmbu"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    EmailJS Template ID:
                  </label>
                  <input
                    type="text"
                    value={emailConfig.templateId}
                    onChange={(e) => setEmailConfigState({ ...emailConfig, templateId: e.target.value })}
                    placeholder="e.g. template_offer_letter"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    EmailJS Public Key:
                  </label>
                  <input
                    type="password"
                    value={emailConfig.publicKey}
                    onChange={(e) => setEmailConfigState({ ...emailConfig, publicKey: e.target.value })}
                    placeholder="e.g. user_xxxxxxxxxxxxxxx"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="submit"
                    style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    💾 Save Email Keys
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('compose')}
                    style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                  >
                    Back to Compose
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Dispatch Logs */}
        {activeTab === 'logs' && (
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, background: '#0b1324' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#f8fafc', fontWeight: 700 }}>
              📜 Recent Offer Letter Dispatch Audit Logs
            </h4>
            {recentLogs.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>No dispatches recorded yet in this browser session.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentLogs.map((log) => (
                  <div key={log.id} style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '13px' }}>{log.recipient_name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '6px' }}>&lt;{log.recipient_email}&gt;</span>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Ref: {log.ref_id} • Engine: {log.delivery_method} • {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: log.delivery_status === 'DELIVERED' ? '#34d399' : '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {log.delivery_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
