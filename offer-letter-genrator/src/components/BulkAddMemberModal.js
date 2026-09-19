import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CLUB_CONFIGS } from '../data/teamData';
import { OFFICIAL_ROLES } from './AddMemberModal';

export default function BulkAddMemberModal({
  isOpen,
  onClose,
  onBulkAddMembers,
  activeOrg = 'AWS_SBG',
  departments = []
}) {
  const activeClub = CLUB_CONFIGS[activeOrg] || CLUB_CONFIGS.AWS_SBG;
  const isAWS = activeOrg === 'AWS_SBG';
  const isTechno = activeOrg === 'TECHNO_LAB';

  const defaultDept = (departments && departments.length > 0 && departments[0] !== 'All') 
    ? departments.find(d => d !== 'All') 
    : ((activeClub.departments || []).find(d => d !== 'All') || 'Technical Team');

  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'spreadsheet' | 'file'
  
  // Quick Add State
  const [quickNamesText, setQuickNamesText] = useState('');
  const [commonDept, setCommonDept] = useState(defaultDept);
  const [commonRole, setCommonRole] = useState('Core Team Member');
  const [commonSemester, setCommonSemester] = useState('3');
  const [commonBranch, setCommonBranch] = useState('B.Tech CSE');

  // Spreadsheet / CSV Paste State
  const [csvText, setCsvText] = useState('');

  // Parsed Preview List
  const [parsedMembers, setParsedMembers] = useState([]);
  const [step, setStep] = useState('input'); // 'input' | 'preview'

  if (!isOpen) return null;

  const departmentsList = departments && departments.length > 0 
    ? departments.filter(d => d !== 'All') 
    : (activeClub.departments || []).filter(d => d !== 'All');

  // Parse Quick Names List
  const handleParseQuickNames = () => {
    const lines = quickNamesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('Please enter at least one member name.');
      return;
    }

    const members = lines.map((name, idx) => {
      const cleanName = name.replace(/^[0-9]+[.\-)]\s*/, '').trim();
      const cleanEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in`;
      const randomRef = `${activeClub.refPrefix}-${Math.floor(100 + Math.random() * 900)}`;
      const isCoLead = commonRole === 'Associate Coordinator';

      return {
        _id: `${activeOrg.toLowerCase()}-bulk-${Date.now()}-${idx}`,
        id: `${activeOrg.toLowerCase()}-bulk-${Date.now()}-${idx}`,
        organization: activeOrg,
        name: cleanName,
        email: cleanEmail,
        department: commonDept,
        roleType: commonRole,
        designation: `${commonRole} - ${commonDept}`,
        isCoLead: isCoLead,
        semester: commonSemester,
        branch: commonBranch,
        letterRefId: randomRef,
        responsibilities: [
          'Execute and support strategic departmental deliverables and technical workshops.',
          'Promote peer learning, open-source projects, and technical skill advancement across campus.'
        ]
      };
    });

    setParsedMembers(members);
    setStep('preview');
  };

  // Parse CSV / Spreadsheet Tab-Delimited Data
  const handleParseCsv = (textToParse = csvText) => {
    const raw = textToParse || csvText;
    const lines = raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('Please paste or upload valid CSV / spreadsheet rows.');
      return;
    }

    const members = [];
    lines.forEach((line, idx) => {
      // Split by tab or comma (while ignoring commas inside quotes)
      const delimiter = line.includes('\t') ? '\t' : (line.includes(',') ? ',' : ';');
      const parts = line.split(delimiter).map(p => p.replace(/^["']|["']$/g, '').trim());

      // If header row, skip
      if (idx === 0 && (parts[0].toLowerCase().includes('name') || parts[0].toLowerCase().includes('ref'))) {
        return;
      }

      if (parts.length > 0 && parts[0]) {
        const name = parts[0];
        const email = parts[1] || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in`;
        const dept = parts[2] || defaultDept;
        const role = parts[3] || 'Core Team Member';
        const designation = parts[4] || `${role} - ${dept}`;
        const sem = parts[5] || '3';
        const branch = parts[6] || 'B.Tech CSE';
        const refId = parts[7] || `${activeClub.refPrefix}-${Math.floor(100 + Math.random() * 900)}`;

        members.push({
          _id: `${activeOrg.toLowerCase()}-bulk-${Date.now()}-${idx}`,
          id: `${activeOrg.toLowerCase()}-bulk-${Date.now()}-${idx}`,
          organization: activeOrg,
          name: name,
          email: email,
          department: dept,
          roleType: role,
          designation: designation,
          isCoLead: role === 'Associate Coordinator',
          semester: sem,
          branch: branch,
          letterRefId: refId,
          responsibilities: [
            'Execute and support strategic departmental deliverables and technical workshops.',
            'Promote peer learning, open-source projects, and technical skill advancement across campus.'
          ]
        });
      }
    });

    if (members.length === 0) {
      alert('Could not detect any valid member rows. Please check the format.');
      return;
    }

    setParsedMembers(members);
    setStep('preview');
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setCsvText(content);
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  // Download Sample Template
  const handleDownloadSample = () => {
    const sample = `Name,Email,Department,Role,Designation,Semester,Branch,LetterRefId
Aarav Sharma,aarav.sharma@itmbu.ac.in,Technical Team,Core Team Member,Core Technical Member,5,B.Tech CSE,${activeClub.refPrefix}-101
Diya Patel,diya.patel@itmbu.ac.in,Creative & Media,Core Team Member,Graphic Design Lead,3,B.Tech CSE,${activeClub.refPrefix}-102
Rohan Verma,rohan.verma@itmbu.ac.in,Public Relations,Associate Coordinator,Associate Coordinator - PR,5,B.Tech IT,${activeClub.refPrefix}-103`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeOrg}_Bulk_Import_Sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remove Single Item from Preview
  const handleRemovePreviewItem = (index) => {
    setParsedMembers(prev => prev.filter((_, i) => i !== index));
  };

  // Execute Bulk Import
  const handleConfirmImport = () => {
    if (parsedMembers.length === 0) {
      alert('No members to import.');
      return;
    }

    onBulkAddMembers(parsedMembers);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container modal-lg" style={{ maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: `2px solid ${activeClub.primaryColor || '#ff9900'}` }}>
          <div className="modal-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>👥</span>
              <div>
                <h3 className="modal-title" style={{ margin: 0, fontSize: '18px' }}>
                  Bulk Add Members • {activeClub.name}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Import multiple students at once via spreadsheet copy-paste, text list, or CSV file.
                </p>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Navigation Tabs */}
        {step === 'input' && (
          <div style={{ display: 'flex', gap: '8px', padding: '14px 20px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              className={`super-tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'quick' ? `2px solid ${activeClub.primaryColor || '#ff9900'}` : 'none',
                background: activeTab === 'quick' ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: activeTab === 'quick' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('quick')}
            >
              ⚡ Quick Multi-Name Add
            </button>

            <button
              type="button"
              className={`super-tab-btn ${activeTab === 'spreadsheet' ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'spreadsheet' ? `2px solid ${activeClub.primaryColor || '#ff9900'}` : 'none',
                background: activeTab === 'spreadsheet' ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: activeTab === 'spreadsheet' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('spreadsheet')}
            >
              📋 Paste Spreadsheet / CSV
            </button>

            <button
              type="button"
              className={`super-tab-btn ${activeTab === 'file' ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'file' ? `2px solid ${activeClub.primaryColor || '#ff9900'}` : 'none',
                background: activeTab === 'file' ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: activeTab === 'file' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('file')}
            >
              📁 Upload CSV File
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          {/* STEP 1: INPUT MODE */}
          {step === 'input' && (
            <>
              {/* TAB 1: QUICK MULTI-NAME ADD */}
              {activeTab === 'quick' && (
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
                      💡 <strong>Quick Batch Entry:</strong> Paste list of student names below (one per line). Email addresses and appointment Ref IDs will be auto-generated automatically!
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Default Department</label>
                      <select 
                        className="modal-select" 
                        value={commonDept} 
                        onChange={(e) => setCommonDept(e.target.value)}
                      >
                        {departmentsList.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Default Role</label>
                      <select 
                        className="modal-select" 
                        value={commonRole} 
                        onChange={(e) => setCommonRole(e.target.value)}
                      >
                        {OFFICIAL_ROLES.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Semester</label>
                      <select 
                        className="modal-select" 
                        value={commonSemester} 
                        onChange={(e) => setCommonSemester(e.target.value)}
                      >
                        {[1,2,3,4,5,6,7,8].map(s => (
                          <option key={s} value={String(s)}>Sem {s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Branch</label>
                      <input 
                        type="text" 
                        className="modal-input" 
                        value={commonBranch} 
                        onChange={(e) => setCommonBranch(e.target.value)} 
                        placeholder="B.Tech CSE"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Student Names (One per line) *</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {quickNamesText.split('\n').filter(l => l.trim().length > 0).length} names detected
                      </span>
                    </label>
                    <textarea
                      className="modal-textarea"
                      style={{ height: '180px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
                      value={quickNamesText}
                      onChange={(e) => setQuickNamesText(e.target.value)}
                      placeholder={`Aarav Sharma\nDiya Patel\nRohan Verma\nKhushi Shah\nSiddharth Mehta`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SPREADSHEET / CSV PASTE */}
              {activeTab === 'spreadsheet' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
                      📊 <strong>Format:</strong> <code>Name, Email, Department, Role, Designation, Semester, Branch</code>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', cursor: 'pointer' }}
                    >
                      📥 Sample Template
                    </button>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      Paste Spreadsheet or CSV Content *
                    </label>
                    <textarea
                      className="modal-textarea"
                      style={{ height: '220px', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre' }}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder={`Aarav Sharma, aarav@itmbu.ac.in, Technical Team, Core Team Member, Full Stack Developer, 5, B.Tech CSE\nDiya Patel, diya@itmbu.ac.in, Creative & Media, Core Team Member, UI Designer, 3, B.Tech CSE`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: FILE UPLOAD */}
              {activeTab === 'file' && (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <div style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '40px 20px', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📁</span>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ffffff' }}>Upload CSV Roster File</h4>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
                      Select a standard .csv or .txt file containing team members.
                    </p>
                    <input
                      type="file"
                      accept=".csv, .txt"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="bulk-csv-upload-input"
                    />
                    <label
                      htmlFor="bulk-csv-upload-input"
                      style={{
                        display: 'inline-block',
                        padding: '10px 22px',
                        background: activeClub.primaryColor || '#ff9900',
                        color: '#ffffff',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Choose CSV File
                    </label>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      style={{ background: 'none', border: 'none', color: activeClub.primaryColor || '#ff9900', fontSize: '12.5px', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      📥 Download Sample CSV Template
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: INTERACTIVE PREVIEW MODE */}
          {step === 'preview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff' }}>
                    Preview Parsed Members ({parsedMembers.length})
                  </h4>
                  <span style={{ fontSize: '12px', color: '#34d399' }}>
                    ✓ Ready to import into {activeClub.name} database
                  </span>
                </div>
                <button
                  type="button"
                  className="modal-btn modal-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setStep('input')}
                >
                  ← Back to Edit Input
                </button>
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#f8fafc' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.12)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>Name</th>
                      <th style={{ padding: '10px 12px' }}>Department</th>
                      <th style={{ padding: '10px 12px' }}>Role</th>
                      <th style={{ padding: '10px 12px' }}>Email</th>
                      <th style={{ padding: '10px 12px' }}>Ref ID</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedMembers.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{m.name}</td>
                        <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>{m.department}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', fontSize: '11px', color: activeClub.primaryColor || '#ff9900' }}>
                            {m.roleType}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>{m.email}</td>
                        <td style={{ padding: '8px 12px', color: '#fbbf24', fontFamily: 'monospace' }}>{m.letterRefId}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemovePreviewItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          {step === 'input' ? (
            <button
              type="button"
              className="modal-btn modal-btn-primary"
              style={{ background: activeClub.primaryColor || '#ff9900' }}
              onClick={activeTab === 'quick' ? handleParseQuickNames : () => handleParseCsv()}
            >
              🔍 Parse &amp; Preview Members →
            </button>
          ) : (
            <button
              type="button"
              className="modal-btn modal-btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontWeight: 800 }}
              onClick={handleConfirmImport}
            >
              🚀 Import {parsedMembers.length} Members Now
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
