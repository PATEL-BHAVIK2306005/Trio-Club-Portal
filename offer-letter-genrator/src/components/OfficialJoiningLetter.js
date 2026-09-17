import React from 'react';
import { CLUB_CONFIGS } from '../data/teamData';

export default function OfficialJoiningLetter({
  member,
  config = {},
  clubConfig = CLUB_CONFIGS.AWS_SBG,
  itmbuLogo,
  clubLogo,
  organizerSignatureImage,
  advisorSignatureImage,
  mentorSignatureImage
}) {
  if (!member) {
    return (
      <div className="empty-preview">
        <p>Please select a team member from the roster to view and generate their official Joining Letter.</p>
      </div>
    );
  }

  const isCoLead = member.isCoLead;
  const activeClub = clubConfig || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeClub.id === 'AWS_SBG';

  const refNumber = member.letterRefId || config.letterRefId || `${activeClub.refPrefix}-${member._id?.substring(0, 5) || '001'}`;
  const docDate = config.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const tenureText = config.tenure || 'Academic Year 2026 – 2027';

  // Signatory details (configurable with fallbacks)
  const organizerName = config.organizerName !== undefined ? config.organizerName : (activeClub.organizer?.name || (isAWS ? 'Bhavikkumar Patel' : 'Vansham Kamboj'));
  const organizerTitle = config.organizerTitle !== undefined ? config.organizerTitle : (activeClub.organizer?.title || (isAWS ? 'AWS SBG Leader / Organizer' : 'President & Lead Organizer'));
  const organizerOrg = config.organizerOrg !== undefined ? config.organizerOrg : (activeClub.organizer?.org || 'ITM (sls) Baroda University');

  const advisorName = config.advisorName !== undefined ? config.advisorName : (activeClub.advisor?.name || 'Vansham Kamboj / Mannan C.');
  const advisorTitle = config.advisorTitle !== undefined ? config.advisorTitle : (activeClub.advisor?.title || 'Advisor');
  const advisorOrg = config.advisorOrg !== undefined ? config.advisorOrg : (activeClub.advisor?.org || (isAWS ? 'AWS SBG ITMBU' : 'Techno Lab ITMBU'));

  const mentorName = config.mentorName !== undefined ? config.mentorName : (activeClub.mentor?.name || 'Dr. Pradeep Laxkar');
  const mentorTitle = config.mentorTitle !== undefined ? config.mentorTitle : (activeClub.mentor?.title || 'Faculty Mentor / Head');
  const mentorOrg = config.mentorOrg !== undefined ? config.mentorOrg : (activeClub.mentor?.org || 'ITM (sls) Baroda University');

  const contactEmail = config.contactEmail || activeClub.email || (isAWS ? 'aws.itmbu@gmail.com' : 'technolabclub25@gmail.com');

  return (
    <div className="letter-wrapper">
      <div className="letter-paper" id="printable-letter">
        
        {/* Top Header Banner Accent Border */}
        <div className={`letter-top-accent ${isAWS ? 'accent-aws' : 'accent-techno'}`}></div>

        {/* Colorful Background Club Watermark */}
        <div className={`letter-watermark-overlay ${isAWS ? 'watermark-theme-aws' : 'watermark-theme-techno'}`} aria-hidden="true">
          {clubLogo ? (
            <div className="watermark-image-box">
              <img src={clubLogo} alt="" className="watermark-logo-img colorful-logo" />
            </div>
          ) : isAWS ? (
            <div className="watermark-vector aws-watermark-colorful">
              <div className="watermark-emblem-ring">
                <div className="watermark-glow-bg"></div>
                <div className="watermark-cloud-icon">☁️</div>
                <div className="watermark-badge-aws">AWS</div>
                <div className="watermark-title-aws">STUDENT BUILDER GROUP</div>
                <div className="watermark-divider-gold"></div>
                <div className="watermark-sub-aws">ITM (SLS) BARODA UNIVERSITY</div>
                <div className="watermark-year">EST. 2026 &bull; OFFICIAL CHAPTER</div>
              </div>
            </div>
          ) : (
            <div className="watermark-vector techno-watermark-colorful">
              <div className="watermark-emblem-ring">
                <div className="watermark-glow-bg"></div>
                <div className="watermark-cloud-icon">🔬</div>
                <div className="watermark-badge-techno">TECHNO LAB</div>
                <div className="watermark-title-techno">INNOVATION &amp; ROBOTICS HUB</div>
                <div className="watermark-divider-blue"></div>
                <div className="watermark-sub-techno">ITM (SLS) BARODA UNIVERSITY</div>
                <div className="watermark-year">EST. 2026 &bull; OFFICIAL CHAPTER</div>
              </div>
            </div>
          )}
        </div>

        {/* Official Header */}
        <div className="letter-header">
          {/* Club Brand Logo */}
          <div className={`brand-box ${isAWS ? 'aws-brand' : 'techno-brand'}`}>
            {clubLogo ? (
              <img src={clubLogo} alt={`${activeClub.name} Logo`} className="brand-logo" />
            ) : isAWS ? (
              <div className="aws-badge-logo">
                <div className="aws-pill">AWS</div>
                <div className="aws-sub">Student Builder Group</div>
                <div className="aws-campus">ITM (sls) Baroda University</div>
              </div>
            ) : (
              <div className="techno-badge-logo">
                <div className="techno-pill">TECHNO LAB</div>
                <div className="techno-sub">Techno+Techiz Innovation Hub</div>
                <div className="techno-campus">ITM (sls) Baroda University</div>
              </div>
            )}
          </div>

          {/* Center Divider / Crest */}
          <div className="header-divider">
            <div className="crest-line"></div>
            <div className="crest-star" style={{ color: activeClub.primaryColor }}>✦</div>
            <div className="crest-line"></div>
          </div>

          {/* ITMBU University Logo Box */}
          <div className="brand-box itmbu-brand">
            {itmbuLogo ? (
              <img src={itmbuLogo} alt="ITM (sls) Baroda University" className="brand-logo" />
            ) : (
              <div className="itmbu-placeholder-logo">
                <div className="itmbu-title">ITM (sls)</div>
                <div className="itmbu-sub">BARODA UNIVERSITY</div>
                <div className="itmbu-loc">VADODARA, GUJARAT</div>
                <span className="itmbu-hint">Universal Campus Chapter</span>
              </div>
            )}
          </div>
        </div>

        {/* Letterhead Subtitle / Affiliation */}
        <div className="header-affiliation">
          <p className="affiliation-text">
            {config?.subtitle !== undefined && config?.subtitle !== '' ? config.subtitle : activeClub.subtitle}
          </p>
          <div className="letter-hr-double" style={{ borderBottomColor: activeClub.primaryColor }}></div>
        </div>

        {/* Reference Number & Date Row */}
        <div className="ref-date-row">
          <div className="ref-number">
            <strong>Ref No:</strong> <span>{refNumber}</span>
          </div>
          <div className="doc-date">
            <strong>Date:</strong> <span>{docDate}</span>
          </div>
        </div>

        {/* Recipient Block */}
        <div className="recipient-block">
          <div className="salutation-label">To,</div>
          <div className="recipient-name">
            <strong>{member.name}</strong>
            {isCoLead && <span className="badge-colead-tag"> [ ASSOCIATE COORDINATOR ]</span>}
          </div>
          <div className="recipient-meta">
            {member.semester && member.semester !== 'Faculty' && <span>Semester: {member.semester} &bull; </span>}
            <span>{member.branch || 'B.Tech CSE'}</span>
          </div>
          <div className="recipient-dept">
            ITM (sls) Baroda University, Vadodara, Gujarat
          </div>
        </div>

        {/* Subject Header */}
        <div className="letter-subject" style={{ borderLeftColor: activeClub.primaryColor }}>
          <strong>SUBJECT: </strong>
          <span className="subject-title">
            OFFICIAL JOINING LETTER & APPOINTMENT AS <span className="subject-role">{member.designation.toUpperCase()}</span>
          </span>
        </div>

        {/* Letter Body Text */}
        <div className="letter-body">
          <p className="salutation-line">Dear <strong>{member.name}</strong>,</p>

          <p className="body-p">
            On behalf of the <strong>{activeClub.name}</strong> at <strong>ITM (sls) Baroda University</strong>, in coordination with our faculty patrons, advisory board, and student leadership team, we are proud and delighted to issue this official <strong>Joining Letter</strong> welcoming you as <strong>{member.designation}</strong> in the <strong>{member.department}</strong> for the tenure <strong>{tenureText}</strong>.
          </p>

          <p className="body-p">
            Your appointment recognizes your demonstrated technical enthusiasm, creative drive, and commitment toward building a premier technological ecosystem at ITMBU. {isCoLead && <strong>As the Associate Coordinator of your department, you are also entrusted with co-directing team workflows, coordinating project roadmaps, and mentoring junior team members.</strong>}
          </p>

          {/* Key Roles & Responsibilities Section */}
          <div className="responsibilities-box">
            <div className="resp-heading">
              <strong>Key Roles & Responsibilities:</strong>
            </div>
            <ul className="resp-list">
              {member.responsibilities && member.responsibilities.length > 0 ? (
                member.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))
              ) : (
                <>
                  <li>Execute and support strategic departmental deliverables, technical workshops, and hackathons.</li>
                  <li>Promote peer learning, open-source development, and technical skill advancement across campus.</li>
                  <li>Represent {activeClub.shortName} ITMBU with high professional ethics and dedication.</li>
                </>
              )}
              <li>Collaborate cross-functionally and uphold the core mission of student innovation at ITM (sls) Baroda University.</li>
            </ul>
          </div>

          <p className="body-p">
            During your tenure, you will receive executive mentorship, opportunities to lead flagship technical initiatives, specialized learning tracks, and official institutional credentials for your leadership contributions.
          </p>

          <p className="body-closing">
            We congratulate you on your appointment and eagerly look forward to building groundbreaking technical milestones together.
          </p>
        </div>

        {/* Official Signatures Section (Organizer, Advisor, Faculty Mentor) */}
        {(() => {
          const hasOrganizer = Boolean(organizerName?.trim() || organizerSignatureImage);
          const hasAdvisor = Boolean(advisorName?.trim() || advisorSignatureImage);
          const hasMentor = Boolean(mentorName?.trim() || mentorSignatureImage);
          const activeCount = [hasOrganizer, hasAdvisor, hasMentor].filter(Boolean).length;

          return (
            <div className={`signatures-container sig-count-${activeCount}`}>
              
              {/* Signatory 1: Organizer / President */}
              {hasOrganizer && (
                <div className="signature-column">
                  <div className="sig-handwriting-box">
                    {organizerSignatureImage ? (
                      <img src={organizerSignatureImage} alt="Organizer Signature" className="sig-img" />
                    ) : (
                      <div className="sig-stylized">{organizerName}</div>
                    )}
                  </div>
                  <div className="sig-line"></div>
                  {organizerName && <div className="sig-name"><strong>{organizerName}</strong></div>}
                  {organizerTitle && <div className="sig-title">{organizerTitle}</div>}
                  {organizerOrg && <div className="sig-org">{organizerOrg}</div>}
                </div>
              )}

              {/* Signatory 2: Advisor (Advisor Section - Hidden if empty) */}
              {hasAdvisor && (
                <div className="signature-column">
                  <div className="sig-handwriting-box">
                    {advisorSignatureImage ? (
                      <img src={advisorSignatureImage} alt="Advisor Signature" className="sig-img" />
                    ) : (
                      <div className="sig-stylized adv-sig">{advisorName}</div>
                    )}
                  </div>
                  <div className="sig-line"></div>
                  {advisorName && <div className="sig-name"><strong>{advisorName}</strong></div>}
                  {advisorTitle && <div className="sig-title">{advisorTitle}</div>}
                  {advisorOrg && <div className="sig-org">{advisorOrg}</div>}
                </div>
              )}

              {/* Signatory 3: Faculty Mentor / Head */}
              {hasMentor && (
                <div className="signature-column">
                  <div className="sig-handwriting-box">
                    {mentorSignatureImage ? (
                      <img src={mentorSignatureImage} alt="Faculty Mentor Signature" className="sig-img" />
                    ) : (
                      <div className="sig-stylized fac-sig">{mentorName}</div>
                    )}
                  </div>
                  <div className="sig-line"></div>
                  {mentorName && <div className="sig-name"><strong>{mentorName}</strong></div>}
                  {mentorTitle && <div className="sig-title">{mentorTitle}</div>}
                  {mentorOrg && <div className="sig-org">{mentorOrg}</div>}
                </div>
              )}

            </div>
          );
        })()}


        {/* Official Footer with Updated Email */}
        <div className="letter-footer">
          <div className="footer-line"></div>
          <div className="footer-content">
            <div className="footer-left">
              <strong>{activeClub.name}</strong> &bull; ITM (sls) Baroda University Chapter
            </div>
            <div className="footer-right">
              {activeClub.location} &bull; <strong>{contactEmail}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
