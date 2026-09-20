import React, { useState } from 'react';
import OfficialJoiningLetter from './OfficialJoiningLetter';
import { CLUB_CONFIGS } from '../data/teamData';

export default function PublicOfferLetterVerification({
  letterRefId,
  members = [],
  itmbuLogo,
  awsClubLogo,
  technoClubLogo,
  gdgocClubLogo,
  onNavigateHome
}) {
  const [copied, setCopied] = useState(false);

  // Find the member matching letterRefId or _id or id
  const targetMember = members.find(m => 
    (m.letterRefId && m.letterRefId.toLowerCase() === letterRefId.toLowerCase()) ||
    (m._id && m._id.toLowerCase() === letterRefId.toLowerCase()) ||
    (m.id && m.id.toLowerCase() === letterRefId.toLowerCase()) ||
    (m.name && m.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === letterRefId.toLowerCase())
  );

  const orgKey = targetMember?.organization || 'AWS_SBG';
  const clubConfig = CLUB_CONFIGS[orgKey] || CLUB_CONFIGS.AWS_SBG;
  const activeClubLogo = orgKey === 'AWS_SBG' ? awsClubLogo : (orgKey === 'TECHNO_LAB' ? technoClubLogo : gdgocClubLogo);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!targetMember) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: '520px',
          width: '100%',
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '20px',
          padding: '36px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '28px'
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
            Offer Letter Not Found
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            The requested appointment letter with reference ID <code>{letterRefId}</code> could not be verified in the institutional registry. Please contact the chapter lead or university compliance office.
          </p>
          <button
            onClick={onNavigateHome}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '11px 24px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer'
            }}
          >
            ← Return to Portal Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f9',
      padding: '24px 16px 60px 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Top Banner Navigation */}
      <div className="no-print" style={{
        maxWidth: '900px',
        margin: '0 auto 24px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '16px',
        padding: '14px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#f0fdf4',
            border: '1.5px solid #bbf7d0',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            ✓
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '15px', color: '#0f172a' }}>Verified Official Appointment Letter</strong>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>AUTHENTICATED</span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Ref ID: <b>{targetMember.letterRefId || letterRefId}</b> &bull; {clubConfig.name}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {copied ? '✓ Link Copied!' : '🔗 Copy Verification Link'}
          </button>
          <button
            onClick={handlePrint}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: '1.5px solid #0f172a',
              padding: '9px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🖨️ Print / Download PDF
          </button>
        </div>
      </div>

      {/* Official Joining Letter Canvas */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <OfficialJoiningLetter
          member={targetMember}
          config={{
            issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            tenure: 'Academic Year 2026 – 2027',
            letterRefId: targetMember.letterRefId || letterRefId
          }}
          clubConfig={clubConfig}
          itmbuLogo={itmbuLogo}
          clubLogo={activeClubLogo}
        />
      </div>

      {/* Footer Branding */}
      <div className="no-print" style={{
        textAlign: 'center',
        marginTop: '32px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        ITM (sls) Baroda University &bull; Official Digital Offer Letter Verification Engine
      </div>
    </div>
  );
}
