import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Trash2,
  Shield,
  Award,
  Building,
  CheckCircle2,
  Sun,
  Moon,
  LogOut,
  X,
  Zap
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserProfileModal({
  isOpen = false,
  onClose = () => {},
  currentUser = null,
  onUpdateAvatar = () => {},
  userRole = 'ORGANIZER',
  activeOrg = 'AWS_SBG',
  clubConfig = {},
  appTheme = 'light',
  onToggleTheme = () => {},
  onLogout = () => {},
  onNavigateView = () => {}
}) {
  const fileInputRef = useRef(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  if (!isOpen) return null;

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isCertifier = userRole === 'CERTIFIER';
  const isStudent = userRole === 'MEMBER' || userRole === 'STUDENT';

  // Role Badge Color & Title
  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return {
        title: 'Super Administrator',
        tag: 'UNIVERSAL ROOT',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        shadow: 'rgba(245, 158, 11, 0.35)',
        icon: <Shield size={14} />
      };
    }
    if (isCertifier) {
      return {
        title: 'Certificate Authority',
        tag: 'CERTIFIER DESK',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        shadow: 'rgba(16, 185, 129, 0.35)',
        icon: <Award size={14} />
      };
    }
    if (isStudent) {
      return {
        title: 'Student Member',
        tag: 'STUDENT PORTAL',
        gradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
        shadow: 'rgba(2, 132, 199, 0.35)',
        icon: <User size={14} />
      };
    }
    return {
      title: 'Chapter Lead Organizer',
      tag: 'CHAPTER LEAD',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      shadow: 'rgba(99, 102, 241, 0.35)',
      icon: <Zap size={14} />
    };
  };

  const roleMeta = getRoleBadge();

  // Handle Photo Upload (Convert to Base64)
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select an image file (JPG, PNG, WebP).',
        background: '#0f172a',
        color: '#f8fafc'
      });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'File Too Large',
        text: 'Please choose a picture smaller than 3MB.',
        background: '#0f172a',
        color: '#f8fafc'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawBase64 = uploadEvent.target?.result;
      if (!rawBase64) return;

      // Load into Image and resize down to 200x200 thumbnail to keep storage under 10KB
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 200;
        let width = img.width;
        let height = img.height;

        // Crop square or scale proportionally
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = MAX_DIM;
        canvas.height = MAX_DIM;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, MAX_DIM, MAX_DIM);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        onUpdateAvatar(compressedBase64);

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Profile Photo Updated!',
          timer: 2000,
          showConfirmButton: false,
          background: '#0f172a',
          color: '#f8fafc'
        });
      };
      img.onerror = () => {
        onUpdateAvatar(rawBase64);
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  };

  // Remove Photo Handler
  const handleRemovePhoto = () => {
    onUpdateAvatar('');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Profile photo reset to default avatar.',
      timer: 2000,
      showConfirmButton: false,
      background: '#0f172a',
      color: '#f8fafc'
    });
  };

  const displayName = currentUser?.displayName || currentUser?.name || currentUser?.username || 'Bhavikkumar Patel';
  const displayEmail = currentUser?.email || 'bhavik.patel@itmbu.ac.in';
  const avatarSrc = currentUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div 
        className="profile-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoSelect} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        {/* Top Header Row */}
        <div className="profile-card-header">
          <div className="profile-header-title-block">
            <span className="profile-header-sub">ACCOUNT &amp; IDENTITY</span>
            <h3>Executive Profile</h3>
          </div>
          <button 
            type="button" 
            className="btn-profile-close" 
            onClick={onClose} 
            title="Close profile modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Avatar & User Info Banner */}
        <div className="profile-hero-section">
          
          {/* Avatar with Upload Hover Overlay */}
          <div 
            className="profile-avatar-wrapper"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload/change profile photo"
            style={{ boxShadow: `0 0 0 3px #ffffff, 0 0 0 6px ${roleMeta.shadow}` }}
          >
            <img src={avatarSrc} alt={displayName} className="profile-hero-img" />
            
            <div className={`avatar-upload-overlay ${isHoveringAvatar ? 'visible' : ''}`}>
              <Camera size={20} color="#ffffff" />
              <span>Change</span>
            </div>
          </div>

          <div className="profile-hero-details">
            <div className="profile-name-row">
              <h4>{displayName}</h4>
              <span className="verified-status-chip">
                <CheckCircle2 size={12} />
                Verified
              </span>
            </div>

            <div className="profile-role-badge" style={{ background: roleMeta.gradient }}>
              {roleMeta.icon}
              <span>{roleMeta.tag}</span>
            </div>

            <p className="profile-email-text">{displayEmail}</p>
          </div>

        </div>

        {/* Photo Upload Actions Toolbar */}
        <div className="profile-photo-toolbar">
          <button 
            type="button" 
            className="btn-photo-action btn-upload-photo"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={14} />
            <span>Upload New Photo</span>
          </button>

          {currentUser?.avatar && (
            <button 
              type="button" 
              className="btn-photo-action btn-remove-photo"
              onClick={handleRemovePhoto}
              title="Remove custom photo and use default"
            >
              <Trash2 size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Account Details & Institutional Metadata */}
        <div className="profile-meta-grid">
          <div className="profile-meta-item">
            <div className="meta-icon-box">
              <Building size={16} />
            </div>
            <div className="meta-text-col">
              <span className="meta-label">Institution</span>
              <span className="meta-value">ITM (sls) Baroda University</span>
            </div>
          </div>

          <div className="profile-meta-item">
            <div className="meta-icon-box">
              <Shield size={16} />
            </div>
            <div className="meta-text-col">
              <span className="meta-label">Active Chapter</span>
              <span className="meta-value">{clubConfig.shortName || activeOrg}</span>
            </div>
          </div>
        </div>

        {/* Theme and Quick Preference Controls */}
        <div className="profile-quick-controls">
          <div className="quick-control-row">
            <div className="control-label-group">
              {appTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span>Interface Theme</span>
            </div>
            <button 
              type="button" 
              className="btn-theme-toggle-pill"
              onClick={onToggleTheme}
            >
              {appTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>

        {/* Footer Actions: Navigation & Logout */}
        <div className="profile-modal-footer">
          <button 
            type="button" 
            className="btn-profile-logout"
            onClick={() => {
              onClose();
              onLogout();
            }}
          >
            <LogOut size={15} />
            <span>Sign Out Account</span>
          </button>

          <button 
            type="button" 
            className="btn-profile-done"
            onClick={onClose}
          >
            <span>Done</span>
          </button>
        </div>

      </div>
    </div>
  );
}
