import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CERTIFICATE_THEMES, BADGE_TYPES, EVENT_CATEGORIES } from '../../data/certificateData';
import { CLUB_CONFIGS } from '../../data/teamData';

export default function CertificateDocument({
  certificate,
  itmbuLogo,
  clubLogo,
  customTheme = null,
  scale = 1,
  id = 'printable-certificate',
  isEditingPositions = false,
  selectedFieldKey = 'name',
  onCanvasClick = null,
  onSelectField = null,
  onUpdateFieldPos = null
}) {
  const containerRef = React.useRef(null);
  const [draggingField, setDraggingField] = React.useState(null);

  if (!certificate) return null;

  const theme = customTheme || CERTIFICATE_THEMES[certificate.theme] || CERTIFICATE_THEMES.GOLD_NAVY;
  const club = CLUB_CONFIGS[certificate.organization] || CLUB_CONFIGS.AWS_SBG;
  const badge = BADGE_TYPES.find(b => b.id === certificate.badgeType) || BADGE_TYPES[0];
  const categoryObj = EVENT_CATEGORIES.find(c => c.id === certificate.category) || EVENT_CATEGORIES[0];

  // Live Verification URL for QR Code
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://itmbu-credentials.org';
  const verificationUrl = `${baseUrl}?verify=${encodeURIComponent(certificate.credentialId || certificate.id)}`;

  const isCustomTemplate = Boolean(certificate.customBgImage);

  // Custom Field Coordinates & Typography (Certifier.io Layout Engine)
  const defaultPos = isCustomTemplate
    ? {
        name: { x: 50, y: 53.5, fontSize: 32, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, show: true },
        eventTitle: { x: 50, y: 62, fontSize: 18, color: '#1e293b', fontWeight: 700, show: false },
        description: { x: 50, y: 70, fontSize: 12, color: '#475569', show: false },
        date: { x: 25, y: 84, fontSize: 11, color: '#64748b', show: false },
        certId: { x: 50, y: 84, fontSize: 11, color: '#64748b', show: false },
        qrCode: { x: 88, y: 82, size: 54, show: false }
      }
    : {
        name: { x: 50, y: 46, fontSize: 34, color: '#0f172a', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, show: true },
        eventTitle: { x: 50, y: 58, fontSize: 19, color: '#1e293b', fontWeight: 700, show: true },
        description: { x: 50, y: 66, fontSize: 13, color: '#475569', show: true },
        date: { x: 25, y: 84, fontSize: 11, color: '#64748b', show: true },
        certId: { x: 50, y: 84, fontSize: 11, color: '#64748b', show: true },
        qrCode: { x: 88, y: 82, size: 54, show: true }
      };

  const pos = {
    ...defaultPos,
    ...(certificate.fieldPositions || {})
  };

  // Dragging Handlers
  const handleMouseDown = (e, fieldKey) => {
    if (!isEditingPositions) return;
    e.stopPropagation();
    if (onSelectField) onSelectField(fieldKey);
    setDraggingField(fieldKey);
  };

  const handleMouseMove = (e) => {
    if (!draggingField || !isEditingPositions || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const pctX = Math.round(Math.max(0, Math.min(100, (clickX / rect.width) * 100)) * 10) / 10;
    const pctY = Math.round(Math.max(0, Math.min(100, (clickY / rect.height) * 100)) * 10) / 10;
    if (onUpdateFieldPos) {
      onUpdateFieldPos(draggingField, 'x', pctX);
      onUpdateFieldPos(draggingField, 'y', pctY);
    }
  };

  const handleMouseUp = () => {
    if (draggingField) {
      setDraggingField(null);
    }
  };

  // Handle canvas click to position the active field
  const handleContainerClick = (e) => {
    if (!isEditingPositions || !onCanvasClick || !selectedFieldKey || draggingField) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const pctX = Math.round((clickX / rect.width) * 1000) / 10;
    const pctY = Math.round((clickY / rect.height) * 1000) / 10;
    onCanvasClick(selectedFieldKey, pctX, pctY);
  };

  // Floating Quick-Edit Toolbar Component
  const renderFloatingToolbar = (fieldKey) => {
    if (!isEditingPositions || selectedFieldKey !== fieldKey || !onUpdateFieldPos) return null;
    const fieldConf = pos[fieldKey] || {};
    const curSize = fieldConf.fontSize || (fieldKey === 'name' ? 32 : 18);

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-10px)',
          background: 'rgba(15, 23, 42, 0.96)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #0284c7',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6), 0 0 15px rgba(2, 132, 199, 0.4)',
          borderRadius: '10px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 100,
          whiteSpace: 'nowrap',
          color: '#f8fafc',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>🔤 Size:</span>
          <button
            type="button"
            onClick={() => onUpdateFieldPos(fieldKey, 'fontSize', Math.max(8, curSize - 2))}
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Decrease font size (-2px)"
          >
            -
          </button>
          <input
            type="number"
            min="8"
            max="120"
            value={curSize}
            onChange={(e) => onUpdateFieldPos(fieldKey, 'fontSize', Number(e.target.value))}
            style={{ width: '42px', height: '22px', background: '#090e1a', border: '1px solid #0284c7', borderRadius: '4px', color: '#38bdf8', fontSize: '12px', fontWeight: 800, textAlign: 'center', padding: 0 }}
          />
          <button
            type="button"
            onClick={() => onUpdateFieldPos(fieldKey, 'fontSize', Math.min(120, curSize + 2))}
            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Increase font size (+2px)"
          >
            +
          </button>
        </div>

        {/* Quick Size Presets */}
        <div style={{ display: 'flex', gap: '3px', borderLeft: '1px solid #334155', paddingLeft: '6px' }}>
          {[20, 26, 32, 40, 52].map(sz => (
            <button
              key={sz}
              type="button"
              onClick={() => onUpdateFieldPos(fieldKey, 'fontSize', sz)}
              style={{
                background: curSize === sz ? '#0284c7' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: curSize === sz ? '#fff' : '#94a3b8',
                borderRadius: '4px',
                padding: '2px 5px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #334155', paddingLeft: '6px' }}>
          <input
            type="color"
            value={fieldConf.color || '#0f172a'}
            onChange={(e) => onUpdateFieldPos(fieldKey, 'color', e.target.value)}
            style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '4px' }}
            title="Change text color"
          />
        </div>

        {/* Center X */}
        <button
          type="button"
          onClick={() => onUpdateFieldPos(fieldKey, 'x', 50)}
          style={{ background: '#1e293b', border: '1px solid #334155', color: '#38bdf8', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
          title="Center Horizontally"
        >
          ↔ Center
        </button>

        {/* Pointer Triangle */}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #0284c7'
        }} />
      </div>
    );
  };

  // IF USER UPLOADED A CUSTOM CERTIFICATE TEMPLATE IMAGE (Clean Overlay Mode)
  if (isCustomTemplate) {
    const isNameVisible = pos.name?.show !== false;
    const isEventVisible = pos.eventTitle?.show === true;
    const isDescVisible = pos.description?.show === true;
    const isDateVisible = pos.date?.show === true;
    const isCertIdVisible = pos.certId?.show === true;
    const isQrVisible = pos.qrCode?.show === true;

    return (
      <div
        ref={containerRef}
        id={id}
        className="certificate-custom-canvas"
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '1050px',
          height: '740px',
          position: 'relative',
          boxSizing: 'border-box',
          margin: '0 auto',
          fontFamily: "'Outfit', 'Montserrat', 'Inter', sans-serif",
          overflow: 'visible',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          transform: scale !== 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'top center',
          userSelect: 'none',
          cursor: isEditingPositions ? (draggingField ? 'grabbing' : 'crosshair') : 'default',
          backgroundImage: `url(${certificate.customBgImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dynamic Field 1: Recipient Name (Active by default) */}
        {isNameVisible && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'name')}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectField) onSelectField('name');
            }}
            style={{
              position: 'absolute',
              top: `${pos.name?.y || 53.5}%`,
              left: `${pos.name?.x || 50}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${pos.name?.fontSize || 32}px`,
              color: pos.name?.color || '#0f172a',
              fontFamily: pos.name?.fontFamily || "'Playfair Display', Georgia, serif",
              fontWeight: pos.name?.fontWeight || 800,
              letterSpacing: `${pos.name?.letterSpacing !== undefined ? pos.name?.letterSpacing : 1}px`,
              textTransform: pos.name?.textTransform || 'none',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              padding: '2px 8px',
              border: isEditingPositions && selectedFieldKey === 'name' ? '2px dashed #0284c7' : (isEditingPositions ? '1px dashed rgba(2, 132, 199, 0.4)' : 'none'),
              background: isEditingPositions && selectedFieldKey === 'name' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              borderRadius: '4px',
              cursor: isEditingPositions ? 'grab' : 'default',
              zIndex: selectedFieldKey === 'name' ? 50 : 10
            }}
          >
            {renderFloatingToolbar('name')}
            {certificate.recipientName || 'Candidate Full Name'}
          </div>
        )}

        {/* Dynamic Field 2: Event Title (Optional) */}
        {isEventVisible && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'eventTitle')}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectField) onSelectField('eventTitle');
            }}
            style={{
              position: 'absolute',
              top: `${pos.eventTitle?.y || 62}%`,
              left: `${pos.eventTitle?.x || 50}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${pos.eventTitle?.fontSize || 18}px`,
              color: pos.eventTitle?.color || '#1e293b',
              fontFamily: pos.eventTitle?.fontFamily || 'inherit',
              fontWeight: pos.eventTitle?.fontWeight || 700,
              textAlign: 'center',
              maxWidth: '850px',
              padding: '2px 8px',
              border: isEditingPositions && selectedFieldKey === 'eventTitle' ? '2px dashed #0284c7' : (isEditingPositions ? '1px dashed rgba(2, 132, 199, 0.4)' : 'none'),
              background: isEditingPositions && selectedFieldKey === 'eventTitle' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              borderRadius: '4px',
              cursor: isEditingPositions ? 'grab' : 'default',
              zIndex: selectedFieldKey === 'eventTitle' ? 50 : 10
            }}
          >
            {renderFloatingToolbar('eventTitle')}
            {certificate.eventTitle || 'Campus Technical Championship 2026'}
          </div>
        )}

        {/* Dynamic Field 3: Achievement & Description (Optional) */}
        {isDescVisible && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'description')}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectField) onSelectField('description');
            }}
            style={{
              position: 'absolute',
              top: `${pos.description?.y || 70}%`,
              left: `${pos.description?.x || 50}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${pos.description?.fontSize || 12}px`,
              color: pos.description?.color || '#475569',
              textAlign: 'center',
              maxWidth: '800px',
              padding: '2px 8px',
              border: isEditingPositions && selectedFieldKey === 'description' ? '2px dashed #0284c7' : (isEditingPositions ? '1px dashed rgba(2, 132, 199, 0.4)' : 'none'),
              background: isEditingPositions && selectedFieldKey === 'description' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              borderRadius: '4px',
              cursor: isEditingPositions ? 'grab' : 'default',
              zIndex: selectedFieldKey === 'description' ? 50 : 10
            }}
          >
            {renderFloatingToolbar('description')}
            <span>for active accomplishment as <strong>{certificate.roleOrAchievement || 'Verified Participant'}</strong></span>
            {certificate.customDescription && <div style={{ marginTop: '2px', fontSize: '11px', opacity: 0.9 }}>{certificate.customDescription}</div>}
          </div>
        )}

        {/* Dynamic Field 4: Issue Date (Optional) */}
        {isDateVisible && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'date')}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectField) onSelectField('date');
            }}
            style={{
              position: 'absolute',
              top: `${pos.date?.y || 84}%`,
              left: `${pos.date?.x || 25}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${pos.date?.fontSize || 11}px`,
              color: pos.date?.color || '#64748b',
              fontWeight: 600,
              padding: '2px 8px',
              border: isEditingPositions && selectedFieldKey === 'date' ? '2px dashed #0284c7' : (isEditingPositions ? '1px dashed rgba(2, 132, 199, 0.4)' : 'none'),
              background: isEditingPositions && selectedFieldKey === 'date' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              borderRadius: '4px',
              cursor: isEditingPositions ? 'grab' : 'default',
              zIndex: selectedFieldKey === 'date' ? 50 : 10
            }}
          >
            {renderFloatingToolbar('date')}
            Date: {certificate.issuedDate || new Date().toISOString().split('T')[0]}
          </div>
        )}

        {/* Dynamic Field 5: Credential ID (Optional) */}
        {isCertIdVisible && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'certId')}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectField) onSelectField('certId');
            }}
            style={{
              position: 'absolute',
              top: `${pos.certId?.y || 84}%`,
              left: `${pos.certId?.x || 50}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${pos.certId?.fontSize || 11}px`,
              color: pos.certId?.color || '#64748b',
              fontFamily: 'monospace',
              fontWeight: 700,
              padding: '2px 8px',
              border: isEditingPositions && selectedFieldKey === 'certId' ? '2px dashed #0284c7' : (isEditingPositions ? '1px dashed rgba(2, 132, 199, 0.4)' : 'none'),
              background: isEditingPositions && selectedFieldKey === 'certId' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              borderRadius: '4px',
              cursor: isEditingPositions ? 'grab' : 'default',
              zIndex: selectedFieldKey === 'certId' ? 50 : 10
            }}
          >
            {renderFloatingToolbar('certId')}
            ID: {certificate.credentialId || certificate.id}
          </div>
        )}

        {/* Dynamic Field 6: Verification QR Code (Optional) */}
        {isQrVisible && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'qrCode')}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectField) onSelectField('qrCode');
            }}
            style={{
              position: 'absolute',
              top: `${pos.qrCode?.y || 82}%`,
              left: `${pos.qrCode?.x || 88}%`,
              transform: 'translate(-50%, -50%)',
              background: '#ffffff',
              padding: '4px',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              border: isEditingPositions && selectedFieldKey === 'qrCode' ? '2px dashed #0284c7' : '1px solid #e2e8f0',
              cursor: isEditingPositions ? 'grab' : 'default',
              zIndex: selectedFieldKey === 'qrCode' ? 50 : 10
            }}
          >
            <QRCodeSVG
              value={verificationUrl}
              size={pos.qrCode?.size || 52}
              level="M"
              fgColor="#0a0f1d"
              bgColor="#ffffff"
            />
          </div>
        )}

        {/* Editing Overlay Guide */}
        {isEditingPositions && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #0284c7',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#38bdf8',
            fontWeight: 700,
            zIndex: 90,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✨ Drag element or click anywhere to position</span>
            <span style={{ color: '#fbbf24' }}>[{selectedFieldKey?.toUpperCase()}: {pos[selectedFieldKey]?.fontSize || 32}px]</span>
          </div>
        )}
      </div>
    );
  }

  // STANDARD PROCEDURAL LUXURY CERTIFICATE CANVAS
  return (
    <div
      id={id}
      className={`certificate-root-canvas theme-${theme.id?.toLowerCase()}`}
      style={{
        width: '1050px',
        minHeight: '740px',
        background: theme.bgGradient,
        color: theme.textColor,
        position: 'relative',
        boxSizing: 'border-box',
        padding: '24px',
        margin: '0 auto',
        fontFamily: "'Outfit', 'Montserrat', 'Inter', sans-serif",
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        transform: scale !== 1 ? `scale(${scale})` : 'none',
        transformOrigin: 'top center',
        userSelect: 'none'
      }}
    >
      {/* Outer Border Frame */}
      <div
        className="cert-outer-frame"
        style={{
          width: '100%',
          height: '100%',
          border: `2px solid ${theme.borderColor}`,
          borderRadius: '8px',
          padding: '8px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Inner Guilloche Border */}
        <div
          className="cert-inner-frame"
          style={{
            width: '100%',
            height: '100%',
            border: theme.borderStyle || `1px solid ${theme.accentColor}`,
            borderRadius: '4px',
            padding: '28px 36px 20px 36px',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: theme.cardBg ? `radial-gradient(ellipse at center, ${theme.cardBg} 0%, rgba(0,0,0,0.4) 100%)` : 'transparent'
          }}
        >
          {/* Corner Ornaments */}
          <div className="cert-corner tl" style={{ position: 'absolute', top: 6, left: 6, width: 28, height: 28, borderTop: `3px solid ${theme.accentColor}`, borderLeft: `3px solid ${theme.accentColor}` }} />
          <div className="cert-corner tr" style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderTop: `3px solid ${theme.accentColor}`, borderRight: `3px solid ${theme.accentColor}` }} />
          <div className="cert-corner bl" style={{ position: 'absolute', bottom: 6, left: 6, width: 28, height: 28, borderBottom: `3px solid ${theme.accentColor}`, borderLeft: `3px solid ${theme.accentColor}` }} />
          <div className="cert-corner br" style={{ position: 'absolute', bottom: 6, right: 6, width: 28, height: 28, borderBottom: `3px solid ${theme.accentColor}`, borderRight: `3px solid ${theme.accentColor}` }} />

          {/* Background Watermark */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              opacity: 0.04,
              fontSize: '320px',
              color: theme.accentColor,
              fontWeight: 900,
              fontFamily: 'serif',
              zIndex: 0
            }}
          >
            ITMBU
          </div>

          {/* HEADER SECTION */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid rgba(255,255,255,0.12)`, paddingBottom: '14px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {itmbuLogo ? (
                <img src={itmbuLogo} alt="ITMBU Logo" style={{ height: '54px', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: 54, height: 54, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  🏛️
                </div>
              )}
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: theme.textColor }}>
                  ITM (sls) BARODA UNIVERSITY
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: theme.mutedText, letterSpacing: '0.8px' }}>
                  Vadodara, Gujarat, India • Established Under Gujarat Private Universities Act
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: theme.accentColor, letterSpacing: '1px' }}>
                  {club.name}
                </div>
                <div style={{ fontSize: '10.5px', color: theme.mutedText, fontWeight: 500 }}>
                  Official University Technical Community Chapter
                </div>
              </div>
              {clubLogo ? (
                <img src={clubLogo} alt="Club Logo" style={{ height: '50px', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: 50, height: 50, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.accentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  {certificate.organization === 'TECHNO_LAB' ? '🔬' : (certificate.organization === 'GDGOC' ? '🌐' : '☁️')}
                </div>
              )}
            </div>

          </div>

          {/* MAIN CERTIFICATE BODY */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', margin: '14px 0' }}>
            
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: theme.accentColor,
                marginBottom: '4px'
              }}>
                ✦ OFFICIAL RECOGNITION OF EXCELLENCE ✦
              </div>
              
              <h1 style={{
                margin: '0',
                fontSize: '34px',
                fontWeight: 900,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                background: theme.badgeGradient || `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentSecondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {categoryObj.defaultPrefix || 'CERTIFICATE OF ACHIEVEMENT'}
              </h1>
            </div>

            <div style={{
              fontSize: '12px',
              fontStyle: 'italic',
              fontWeight: 500,
              color: theme.mutedText,
              marginTop: '10px',
              letterSpacing: '1px'
            }}>
              This credential is proud, verified, and officially presented to
            </div>

            <div style={{
              margin: '10px auto 4px auto',
              fontSize: `${pos.name?.fontSize || 32}px`,
              fontWeight: pos.name?.fontWeight || 800,
              letterSpacing: '1.5px',
              color: theme.textColor,
              fontFamily: pos.name?.fontFamily || "'Playfair Display', 'Cinzel', serif",
              borderBottom: `2px solid ${theme.accentColor}`,
              display: 'inline-block',
              padding: '0 36px 4px 36px',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)'
            }}>
              {certificate.recipientName || 'Candidate Name'}
            </div>

            <div style={{ fontSize: '11.5px', color: theme.mutedText, fontWeight: 600, letterSpacing: '0.5px' }}>
              {certificate.recipientDepartment ? `${certificate.recipientDepartment} • ` : ''}
              {certificate.recipientCollege || 'ITM (sls) Baroda University'}
            </div>

            <div style={{
              maxWidth: '820px',
              margin: '12px auto 0 auto',
              fontSize: '12.5px',
              lineHeight: '1.55',
              color: theme.textColor,
              fontWeight: 400
            }}>
              <span>for outstanding performance and active participation as </span>
              <span style={{ fontWeight: 800, color: theme.accentColor, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                {certificate.roleOrAchievement || 'Event Participant'}
              </span>
              <span> in </span>
              <strong style={{ fontWeight: 700, color: theme.textColor }}>
                "{certificate.eventTitle || 'Campus Technical Championship 2026'}"
              </strong>
              {certificate.customDescription ? (
                <div style={{ marginTop: '5px', fontSize: '11.5px', color: theme.mutedText, fontStyle: 'italic' }}>
                  {certificate.customDescription}
                </div>
              ) : null}
            </div>

            {Array.isArray(certificate.skills) && certificate.skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                {certificate.skills.slice(0, 6).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: `1px solid ${theme.accentColor}40`,
                      color: theme.accentSecondary || theme.textColor,
                      letterSpacing: '0.3px'
                    }}
                  >
                    ⚡ {skill}
                  </span>
                ))}
              </div>
            )}

          </div>

          {/* LOWER SECTION */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: '8px' }}>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1.5fr',
              alignItems: 'flex-end',
              gap: '16px',
              paddingBottom: '14px',
              borderBottom: `1px solid rgba(255, 255, 255, 0.1)`
            }}>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                  {certificate.signatory1?.sigImage ? (
                    <img src={certificate.signatory1.sigImage} alt="Signature 1" style={{ maxHeight: '42px', filter: theme.isLight ? 'none' : 'invert(1) brightness(2)' }} />
                  ) : (
                    <div style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontSize: '24px', color: theme.accentColor, fontStyle: 'italic' }}>
                      {certificate.signatory1?.name || 'Lead Organizer'}
                    </div>
                  )}
                </div>
                <div style={{ width: '85%', height: '1px', background: 'rgba(255,255,255,0.25)', margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: theme.textColor }}>
                  {certificate.signatory1?.name || 'Chapter Lead / President'}
                </div>
                <div style={{ fontSize: '9.5px', color: theme.mutedText }}>
                  {certificate.signatory1?.title || 'Lead Organizer'}
                </div>
              </div>

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: theme.badgeGradient || `radial-gradient(circle, ${theme.accentSecondary} 0%, ${theme.accentColor} 100%)`,
                    border: '3px solid #ffffff33',
                    boxShadow: `0 0 20px ${theme.accentColor}66, inset 0 0 10px rgba(0,0,0,0.5)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0f1d',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: '1' }}>{badge.icon || '🏆'}</span>
                  <span style={{ fontSize: '7px', fontWeight: 900, letterSpacing: '0.8px', marginTop: '3px', textAlign: 'center', lineHeight: '1.1' }}>
                    {badge.text || 'OFFICIAL'}
                  </span>
                </div>
                <div style={{ fontSize: '8.5px', fontWeight: 700, color: theme.accentColor, letterSpacing: '1px', marginTop: '4px' }}>
                  AUTHENTIC SEAL
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                  {certificate.signatory3?.sigImage ? (
                    <img src={certificate.signatory3.sigImage} alt="Signature 2" style={{ maxHeight: '42px', filter: theme.isLight ? 'none' : 'invert(1) brightness(2)' }} />
                  ) : (
                    <div style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontSize: '24px', color: theme.accentColor, fontStyle: 'italic' }}>
                      {certificate.signatory3?.name || 'Dr. Pradeep Laxkar'}
                    </div>
                  )}
                </div>
                <div style={{ width: '85%', height: '1px', background: 'rgba(255,255,255,0.25)', margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: theme.textColor }}>
                  {certificate.signatory3?.name || 'Dr. Pradeep Laxkar'}
                </div>
                <div style={{ fontSize: '9.5px', color: theme.mutedText }}>
                  {certificate.signatory3?.title || 'Faculty Mentor / Head of Dept'}
                </div>
              </div>

            </div>

            {/* Bottom Security Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '10px',
              fontSize: '9.5px',
              color: theme.mutedText
            }}>
              
              <div>
                <div>📅 <strong>Issue Date:</strong> {certificate.issuedDate || new Date().toISOString().split('T')[0]}</div>
                <div>⏳ <strong>Validity:</strong> {certificate.expiryDate || 'Lifetime Verified Credential'}</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, letterSpacing: '1px', color: theme.accentColor, fontSize: '10.5px' }}>
                  CREDENTIAL ID: {certificate.credentialId || certificate.id}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '8px', opacity: 0.7, marginTop: '2px' }}>
                  HASH: {certificate.hash || '0x9fa41c09823...SECURE'} &bull; TAMPER-PROOF VERIFIED
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'right' }}>
                <div>
                  <div style={{ fontWeight: 700, color: theme.textColor, fontSize: '8.5px' }}>SCAN TO VERIFY</div>
                  <div style={{ fontSize: '7.5px', opacity: 0.8 }}>Live Authenticity</div>
                </div>
                <div
                  style={{
                    background: '#ffffff',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                  title={`Scan to verify certificate ${certificate.id}`}
                >
                  <QRCodeSVG
                    value={verificationUrl}
                    size={46}
                    level="M"
                    fgColor="#0a0f1d"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
