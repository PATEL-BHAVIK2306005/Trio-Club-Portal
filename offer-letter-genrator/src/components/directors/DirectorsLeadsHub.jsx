import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../finance/TreasurerFinanceHub.css';
import {
  Palette,
  Cpu,
  FileText,
  Share2,
  Download,
  Plus,
  Terminal,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';

export default function DirectorsLeadsHub({
  activeOrg = 'AWS_SBG',
  currentUser = null
}) {
  // Navigation Tabs: 'creative' | 'technical' | 'secretary' | 'outreach'
  const [activeTab, setActiveTab] = useState(() => {
    if (currentUser?.role === 'CREATIVE_DIRECTOR') return 'creative';
    if (currentUser?.role === 'TECHNICAL_ARCHITECT') return 'technical';
    if (currentUser?.role === 'EXECUTIVE_SECRETARY') return 'secretary';
    if (currentUser?.role === 'OUTREACH_AMBASSADOR') return 'outreach';
    return 'creative';
  });

  // 1. Creative Studio State
  const [selectedAssetFormat, setSelectedAssetFormat] = useState('BANNER');
  const [bannerTitle, setBannerTitle] = useState('AWS GenAI Cloud BootCamp 2026');
  const [bannerDate, setBannerDate] = useState('OCTOBER 15, 2026');
  const [bannerTheme, setBannerTheme] = useState('DARK_CYBER');

  // 2. Technical Lab State
  const [cloudServices, setCloudServices] = useState([
    { id: 'aws-s3', name: 'Amazon S3 Roster Vault', status: 'HEALTHY', latency: '42ms', region: 'ap-south-1 (Mumbai)' },
    { id: 'aws-lambda', name: 'AWS Lambda Letter Dispatcher', status: 'HEALTHY', latency: '128ms', region: 'ap-south-1 (Mumbai)' },
    { id: 'aws-iam', name: 'Zero-Trust IAM Policy Enforcer', status: 'ACTIVE', latency: '15ms', region: 'Global' },
    { id: 'gh-repo', name: 'ITMBU-AWS-SBG/Portal-Core', status: 'SYNCED', commits: '142 Commits', branch: 'main' },
    { id: 'gh-techno', name: 'TechnoLab/Robotics-Firmware', status: 'SYNCED', commits: '89 Commits', branch: 'v2.4-stable' }
  ]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', region: 'ap-south-1', type: 'AWS Cloud' });

  // 3. Executive Secretary Minutes of Meeting (MoM)
  const [momList, setMomList] = useState([
    {
      id: 'MOM-2026-09',
      title: 'Core Committee Allocation & Semester 5 Onboarding Resolution',
      date: '2026-09-15',
      attendees: 'Bhavik Patel, Tannvi Acharya, Vansham Kamboj, Dr. Pradeep Laxkar',
      agenda: 'Finalizing 16-role hierarchy, launching automated offer letters, and setting budget ceilings.',
      resolutions: 'Approved unanimously: ₹45,000 budget for AWS Day and mandatory QR verification on all letters.'
    },
    {
      id: 'MOM-2026-08',
      title: 'Techno Lab Robotics Arena & Drone Lab Setup',
      date: '2026-08-28',
      attendees: 'Vansham Kamboj, Mohit S., Dr. Pradeep Laxkar',
      agenda: 'Purchasing 10 ESP32 kits and allocating ₹60,000 for RoboWars arena safety nets.',
      resolutions: 'Treasurer authorized to clear Amazon hardware invoices.'
    }
  ]);
  const [isAddMomOpen, setIsAddMomOpen] = useState(false);
  const [newMom, setNewMom] = useState({ title: '', attendees: '', agenda: '', resolutions: '' });

  // 4. Outreach & PR Collaborations
  const [outreachPartners, setOutreachPartners] = useState([
    { id: 'OUT-01', college: 'Parul University CSE Club', type: 'Inter-College Hackathon', status: 'CONFIRMED', contact: 'lead@parul.edu' },
    { id: 'OUT-02', college: 'MSU Faculty of Tech', type: 'Guest Speaker Exchange', status: 'PROPOSAL_SENT', contact: 'dean.tech@msubaroda.ac.in' },
    { id: 'OUT-03', college: 'Charusat CSPIT Developers', type: 'Joint CTF Challenge', status: 'ACTIVE', contact: 'dev@charusat.edu.in' }
  ]);
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({ college: '', type: 'Inter-College Hackathon', contact: '', status: 'CONFIRMED' });

  const handleCreateMom = (e) => {
    e.preventDefault();
    const item = {
      id: `MOM-${Date.now().toString().slice(-4)}`,
      title: newMom.title,
      date: new Date().toISOString().split('T')[0],
      attendees: newMom.attendees,
      agenda: newMom.agenda,
      resolutions: newMom.resolutions
    };
    setMomList([item, ...momList]);
    setIsAddMomOpen(false);
    setNewMom({ title: '', attendees: '', agenda: '', resolutions: '' });
    Swal.fire({ icon: 'success', title: 'Resolution & MoM Recorded!', timer: 2000, showConfirmButton: false });
  };

  const handleAddService = (e) => {
    e.preventDefault();
    const item = {
      id: `srv-${Date.now().toString().slice(-4)}`,
      name: newService.name,
      status: 'HEALTHY',
      latency: '24ms',
      region: newService.region
    };
    setCloudServices([...cloudServices, item]);
    setIsAddServiceOpen(false);
    setNewService({ name: '', region: 'ap-south-1', type: 'AWS Cloud' });
    Swal.fire({ icon: 'success', title: 'Infrastructure Resource Added!', timer: 1800, showConfirmButton: false });
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    const item = {
      id: `OUT-${Date.now().toString().slice(-4)}`,
      college: newPartner.college,
      type: newPartner.type,
      contact: newPartner.contact,
      status: newPartner.status
    };
    setOutreachPartners([...outreachPartners, item]);
    setIsAddPartnerOpen(false);
    setNewPartner({ college: '', type: 'Inter-College Hackathon', contact: '', status: 'CONFIRMED' });
    Swal.fire({ icon: 'success', title: 'Campus Partner Registered!', timer: 1800, showConfirmButton: false });
  };

  return (
    <div className="treasurer-finance-hub-container directors-leads-hub">
      
      {/* TOP HEADER */}
      <header className="tf-header">
        <div className="tf-header-left">
          <div className="tf-badge-icon directors-badge-icon">
            <Sparkles size={24} className="tf-purple-icon" />
          </div>
          <div>
            <div className="tf-header-title-row">
              <h2>Directors &amp; Departmental Leads Operations Suite</h2>
              <span className="tf-role-badge directors-pill">EXECUTIVE DIRECTORATE</span>
            </div>
            <p className="tf-header-sub">
              Creative &amp; Media Studio &bull; Technical &amp; Cloud Infra Hub &bull; Executive Minutes of Meeting &bull; Outreach Network
            </p>
          </div>
        </div>
      </header>

      {/* MODULE TABS */}
      <nav className="tf-nav-tabs">
        <button
          className={`tf-tab-btn ${activeTab === 'creative' ? 'active' : ''}`}
          onClick={() => setActiveTab('creative')}
        >
          <Palette size={17} />
          <span>Creative &amp; Media Director Studio</span>
        </button>

        <button
          className={`tf-tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          <Cpu size={17} />
          <span>Technical Lead &amp; Cloud Architect Hub</span>
        </button>

        <button
          className={`tf-tab-btn ${activeTab === 'secretary' ? 'active' : ''}`}
          onClick={() => setActiveTab('secretary')}
        >
          <FileText size={17} />
          <span>Executive Secretary &amp; Records Desk</span>
        </button>

        <button
          className={`tf-tab-btn ${activeTab === 'outreach' ? 'active' : ''}`}
          onClick={() => setActiveTab('outreach')}
        >
          <Share2 size={17} />
          <span>Outreach &amp; PR Ambassador Matrix</span>
        </button>
      </nav>

      {/* CONTENT WORKSPACE */}
      <main className="tf-workspace">
        
        {/* ================================================================= */}
        {/* 1. CREATIVE & MEDIA DIRECTOR STUDIO */}
        {/* ================================================================= */}
        {activeTab === 'creative' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Official Chapter Media &amp; Brand Assets Generator</h3>
                <p>Generate high-definition social media promotional banners, event badges, and branding headers.</p>
              </div>
            </div>

            <div className="directors-studio-grid">
              {/* Left Controls */}
              <div className="studio-controls-card">
                <h4>Design Controls &amp; Formats</h4>
                
                <div className="control-group">
                  <label>Format</label>
                  <div className="format-selector-row">
                    {['BANNER', 'POSTER', 'BADGE', 'SOCIAL'].map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        className={`btn-fmt ${selectedAssetFormat === fmt ? 'active' : ''}`}
                        onClick={() => setSelectedAssetFormat(fmt)}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <label>Event Headline</label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={e => setBannerTitle(e.target.value)}
                  />
                </div>

                <div className="control-group">
                  <label>Date &amp; Venue Tag</label>
                  <input
                    type="text"
                    value={bannerDate}
                    onChange={e => setBannerDate(e.target.value)}
                  />
                </div>

                <div className="control-group">
                  <label>Aesthetic Theme</label>
                  <select value={bannerTheme} onChange={e => setBannerTheme(e.target.value)}>
                    <option value="DARK_CYBER">Dark Cyber Glassmorphism</option>
                    <option value="AWS_GOLD">AWS Cloud Gradient (#ff9900)</option>
                    <option value="TECHNO_NEON">Techno Robotics Neon Blue</option>
                    <option value="GOOGLE_CLEAN">Google Developer Quad-Color</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="tf-btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => Swal.fire({ icon: 'success', title: 'Asset Compiled!', text: '4K FHD High-Res Banner saved to downloads.' })}
                >
                  <Download size={15} />
                  <span>Download 4K FHD Asset</span>
                </button>
              </div>

              {/* Right Canvas Live Preview */}
              <div className="studio-canvas-preview-wrap">
                <div className={`media-render-canvas theme-${bannerTheme.toLowerCase()}`}>
                  <div className="canvas-header-strip">
                    <span>ITM (sls) BARODA UNIVERSITY &bull; {activeOrg}</span>
                    <span className="live-pill">OFFICIAL EVENT 2026</span>
                  </div>
                  
                  <div className="canvas-body">
                    <h1 className="canvas-title">{bannerTitle}</h1>
                    <p className="canvas-date">📅 {bannerDate} &bull; Main Auditorium &amp; Cloud Labs</p>
                    
                    <div className="canvas-speaker-tags">
                      <span className="sp-tag">☁️ Hands-on Architecture</span>
                      <span className="sp-tag">🏆 Verified Certification</span>
                      <span className="sp-tag">🎁 Exclusive Swag Drops</span>
                    </div>
                  </div>

                  <div className="canvas-footer-strip">
                    <span>Department of Computer Science &amp; Engineering</span>
                    <span>Registration Link: itmbu.ac.in/{activeOrg.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. TECHNICAL LEAD & CLOUD ARCHITECT HUB */}
        {/* ================================================================= */}
        {activeTab === 'technical' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Technical Infrastructure &amp; Code Repositories Monitor</h3>
                <p>Real-time status of AWS Cloud services, Zero-Trust IAM policies, and student GitHub repositories.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="tf-btn-secondary"
                  onClick={() => setIsAddServiceOpen(true)}
                >
                  <Plus size={15} />
                  <span>Add Resource</span>
                </button>
                <button
                  className="tf-btn-primary"
                  onClick={() => Swal.fire({ icon: 'info', title: 'Sandbox Terminal Initialized', text: 'AWS CloudShell sandbox session running on ap-south-1.' })}
                >
                  <Terminal size={15} />
                  <span>Launch CloudShell Sandbox</span>
                </button>
              </div>
            </div>

            <div className="tf-table-container">
              <table className="tf-data-table">
                <thead>
                  <tr>
                    <th>SERVICE / REPOSITORY NAME</th>
                    <th>INFRASTRUCTURE TYPE</th>
                    <th>REGION / BRANCH</th>
                    <th>HEALTH STATUS</th>
                    <th>RESPONSE LATENCY</th>
                  </tr>
                </thead>
                <tbody>
                  {cloudServices.map(srv => (
                    <tr key={srv.id}>
                      <td>
                        <strong>{srv.name}</strong>
                        {srv.commits && <small style={{ display: 'block', color: '#94a3b8' }}>🏷️ {srv.commits}</small>}
                      </td>
                      <td>
                        <span className="tier-badge">{srv.id.startsWith('aws') ? 'AWS Cloud' : 'GitHub Code Repo'}</span>
                      </td>
                      <td>
                        <code>{srv.region || srv.branch}</code>
                      </td>
                      <td>
                        <span className="status-pill status-claimed">● {srv.status}</span>
                      </td>
                      <td>
                        <span className="amount-highlight" style={{ color: '#10b981' }}>{srv.latency || 'Synced'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. EXECUTIVE SECRETARY & RECORDS DESK */}
        {/* ================================================================= */}
        {activeTab === 'secretary' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Executive Minutes of Meeting (MoM) &amp; Chapter Resolutions</h3>
                <p>Official record keeping, leadership committee proceedings, and constitutional logs.</p>
              </div>
              <button className="tf-btn-primary" onClick={() => setIsAddMomOpen(true)}>
                <Plus size={15} />
                <span>Record New Meeting Minutes (MoM)</span>
              </button>
            </div>

            <div className="mom-cards-list">
              {momList.map(mom => (
                <div key={mom.id} className="tf-budget-card mom-card">
                  <div className="bcard-header">
                    <div>
                      <span className="voucher-ref-tag">{mom.id} &bull; {mom.date}</span>
                      <h4>{mom.title}</h4>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: '1.6' }}>
                    <p><strong>👥 Attendees:</strong> {mom.attendees}</p>
                    <p><strong>🎯 Agenda Discussed:</strong> {mom.agenda}</p>
                    <div className="resolution-highlight">
                      <strong>⚖️ Formal Resolutions Passed:</strong> {mom.resolutions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. OUTREACH & PR AMBASSADOR */}
        {/* ================================================================= */}
        {activeTab === 'outreach' && (
          <div className="tf-section-view">
            <div className="tf-section-toolbar">
              <div>
                <h3>Campus Ambassador Network &amp; Inter-College Collaborations</h3>
                <p>Manage external university delegations, keynote speaker outreach, and media coverage.</p>
              </div>
              <button className="tf-btn-primary" onClick={() => setIsAddPartnerOpen(true)}>
                <Plus size={15} />
                <span>Add Partner / Ambassador</span>
              </button>
            </div>

            <div className="tf-table-container">
              <table className="tf-data-table">
                <thead>
                  <tr>
                    <th>INSTITUTION / PARTNER</th>
                    <th>COLLABORATION TYPE</th>
                    <th>CONTACT DESK</th>
                    <th>PARTNERSHIP STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {outreachPartners.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.college}</strong>
                      </td>
                      <td>
                        <span className="tier-badge">{p.type}</span>
                      </td>
                      <td>
                        <a href={`mailto:${p.contact}`} style={{ color: '#38bdf8' }}>{p.contact}</a>
                      </td>
                      <td>
                        <span className={`status-pill ${p.status === 'CONFIRMED' ? 'status-claimed' : 'status-allotted'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="tf-btn-icon-danger"
                          onClick={() => setOutreachPartners(outreachPartners.filter(x => x.id !== p.id))}
                          title="Remove Partner"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* NEW MOM MODAL */}
      {isAddMomOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Record Executive Minutes of Meeting (MoM)</h3>
              <button onClick={() => setIsAddMomOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateMom}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Meeting Title / Session *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Core Committee Planning Meeting"
                    value={newMom.title}
                    onChange={e => setNewMom({ ...newMom, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Attendees *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhavik Patel, Tannvi Acharya, Dr. Pradeep Laxkar"
                    value={newMom.attendees}
                    onChange={e => setNewMom({ ...newMom, attendees: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Agenda *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Key items reviewed..."
                    value={newMom.agenda}
                    onChange={e => setNewMom({ ...newMom, agenda: e.target.value })}
                  />
                </div>
              </div>

              <div className="tf-form-row">
                <div className="form-col">
                  <label>Resolutions Passed *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Decisions finalized..."
                    value={newMom.resolutions}
                    onChange={e => setNewMom({ ...newMom, resolutions: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddMomOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Record Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {isAddServiceOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Add Infrastructure / Repo Resource</h3>
              <button onClick={() => setIsAddServiceOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddService}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Resource Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS DynamoDB Users Table"
                    value={newService.name}
                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Region / Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. ap-south-1 (Mumbai)"
                    value={newService.region}
                    onChange={e => setNewService({ ...newService, region: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddServiceOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PARTNER MODAL */}
      {isAddPartnerOpen && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-card">
            <div className="modal-header">
              <h3>Register Campus Outreach Partner</h3>
              <button onClick={() => setIsAddPartnerOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddPartner}>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Institution / Partner College *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nirma University Tech Club"
                    value={newPartner.college}
                    onChange={e => setNewPartner({ ...newPartner, college: e.target.value })}
                  />
                </div>
                <div className="form-col">
                  <label>Collaboration Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Hackathon Track Partner"
                    value={newPartner.type}
                    onChange={e => setNewPartner({ ...newPartner, type: e.target.value })}
                  />
                </div>
              </div>
              <div className="tf-form-row">
                <div className="form-col">
                  <label>Contact Email / Desk</label>
                  <input
                    type="email"
                    placeholder="e.g. lead@nirma.edu"
                    value={newPartner.contact}
                    onChange={e => setNewPartner({ ...newPartner, contact: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddPartnerOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Register Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
