import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Plus,
  Search,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Eye,
  FileText,
  Download,
  Paperclip,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  fetchQueriesFromSupabase,
  createNewQuery,
  addMessageToQuery,
  updateQueryStatus,
  subscribeToQueriesRealtime,
  getLocalQueries
} from '../services/queryService';

export default function QueryManagementModal({
  isOpen,
  onClose,
  currentUser,
  activeOrg = 'AWS_SBG',
  theme = 'light'
}) {
  const [queries, setQueries] = useState(() => getLocalQueries());
  const [activeQueryId, setActiveQueryId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ON_DISCUSS' | 'IN_PROGRESS' | 'RESOLVED'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isNewQueryModalOpen, setIsNewQueryModalOpen] = useState(false);

  // New Message State (Images & PDFs up to 30 MB)
  const [messageText, setMessageText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null); // { url, name, size, type: 'image' | 'pdf' }
  const [isSending, setIsSending] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // New Query Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(activeOrg || 'AWS_SBG');
  const [newUrgency, setNewUrgency] = useState('MEDIUM');
  const [newDescription, setNewDescription] = useState('');
  const [newInitialFile, setNewInitialFile] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const newQueryFileInputRef = useRef(null);

  // Fetch from Supabase and Subscribe to Realtime WebSocket
  useEffect(() => {
    if (isOpen) {
      setIsSyncing(true);
      fetchQueriesFromSupabase()
        .then((data) => {
          if (data && data.length > 0) {
            setQueries(data);
            setActiveQueryId(prev => prev || data[0].id);
          }
        })
        .finally(() => setIsSyncing(false));

      const sub = subscribeToQueriesRealtime((liveList) => {
        if (liveList && liveList.length > 0) {
          setQueries(liveList);
        }
      });

      return () => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      };
    }
  }, [isOpen]);

  // Set default active query if not selected
  useEffect(() => {
    if (queries.length > 0 && !activeQueryId) {
      setActiveQueryId(queries[0].id);
    }
  }, [queries, activeQueryId]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeQueryId, queries]);

  if (!isOpen) return null;

  const activeQuery = queries.find(q => q.id === activeQueryId) || queries[0] || null;

  // Filtered Queries
  const filteredQueries = queries.filter(q => {
    const matchesFilter = filterStatus === 'ALL' || q.status === filterStatus;
    const qTerm = searchQuery.toLowerCase().trim();
    const matchesSearch = !qTerm ||
      q.title.toLowerCase().includes(qTerm) ||
      q.id.toLowerCase().includes(qTerm) ||
      (q.description && q.description.toLowerCase().includes(qTerm)) ||
      (q.author?.name && q.author.name.toLowerCase().includes(qTerm)) ||
      (Array.isArray(q.messages) && q.messages.some(m => (m.text && m.text.toLowerCase().includes(qTerm)) || (m.fileName && m.fileName.toLowerCase().includes(qTerm))));
    return matchesFilter && matchesSearch;
  });

  const onDiscussCount = queries.filter(q => q.status === 'ON_DISCUSS').length;
  const inProgressCount = queries.filter(q => q.status === 'IN_PROGRESS').length;
  const resolvedCount = queries.filter(q => q.status === 'RESOLVED').length;

  // Handle File Selection (Images and PDFs with strict 30MB limit)
  const handleFileChange = (e, target = 'chat') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB Strict Limit

    if (file.size > MAX_FILE_SIZE) {
      Swal.fire({
        icon: 'error',
        title: '⚠️ File Exceeds 30MB Limit',
        html: `The selected file (<b>${file.name}</b>) is <b>${(file.size / (1024 * 1024)).toFixed(1)} MB</b>.<br/><br/>Files strictly <b>above 30 MB are not allowed</b> for cloud discussions & attachments.`,
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonColor: '#0f172a'
      });
      if (e.target) e.target.value = '';
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      Swal.fire({
        icon: 'warning',
        title: 'Unsupported File Format',
        text: 'Please select an Image (PNG, JPG, WEBP) or a PDF document under 30 MB.',
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonColor: '#0f172a'
      });
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = {
        url: reader.result,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: isPdf ? 'pdf' : 'image'
      };

      if (target === 'chat') {
        setAttachedFile(fileData);
      } else {
        setNewInitialFile(fileData);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy message text helper
  const handleCopyMessage = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!messageText.trim() && !attachedFile) || !activeQuery) return;

    setIsSending(true);
    const senderName = currentUser?.name || currentUser?.username || 'Executive Admin';
    const senderRole = currentUser?.role || 'Lead Organizer';
    const senderAvatar = currentUser?.avatar || '👑';

    try {
      const payload = {
        senderName,
        senderRole,
        avatar: senderAvatar,
        text: messageText.trim(),
        image: attachedFile?.type === 'image' ? attachedFile.url : null,
        pdfUrl: attachedFile?.type === 'pdf' ? attachedFile.url : null,
        fileName: attachedFile?.name || null,
        fileSize: attachedFile?.size || null,
        fileType: attachedFile?.type || null
      };

      await addMessageToQuery(activeQuery.id, payload);

      // Update local state immediately
      setQueries(prev => {
        return prev.map(q => {
          if (q.id === activeQuery.id) {
            const msgs = Array.isArray(q.messages) ? q.messages : [];
            return {
              ...q,
              messages: [
                ...msgs,
                {
                  id: `msg-${Date.now()}`,
                  ...payload,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            };
          }
          return q;
        });
      });

      setMessageText('');
      setAttachedFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Create New Query
  const handleCreateQuery = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      Swal.fire({ icon: 'warning', title: 'Title Required', text: 'Please enter a title for the club query / discussion.' });
      return;
    }

    const created = await createNewQuery({
      title: newTitle.trim(),
      category: newCategory,
      urgency: newUrgency,
      description: newDescription.trim(),
      author: {
        name: currentUser?.name || currentUser?.username || 'Executive Admin',
        role: currentUser?.role || 'Lead Organizer',
        avatar: currentUser?.avatar || '👑',
        email: currentUser?.email || 'admin@itmbu.ac.in'
      },
      messages: newDescription.trim() || newInitialFile ? [
        {
          id: `msg-init-${Date.now()}`,
          senderName: currentUser?.name || currentUser?.username || 'Executive Admin',
          senderRole: currentUser?.role || 'Lead Organizer',
          avatar: currentUser?.avatar || '👑',
          text: newDescription.trim() || `Initiated topic with attached ${newInitialFile?.type?.toUpperCase() || 'file'}.`,
          image: newInitialFile?.type === 'image' ? newInitialFile.url : null,
          pdfUrl: newInitialFile?.type === 'pdf' ? newInitialFile.url : null,
          fileName: newInitialFile?.name || null,
          fileSize: newInitialFile?.size || null,
          fileType: newInitialFile?.type || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ] : []
    });

    setQueries(prev => [created, ...prev]);
    setActiveQueryId(created.id);
    setIsNewQueryModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewInitialFile(null);

    Swal.fire({
      icon: 'success',
      title: 'Query Created & Synced!',
      text: `Discussion ticket #${created.id} is now live across Supabase Cloud.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Quick Reply helper
  const handleQuickReply = (text) => {
    setMessageText(prev => prev ? `${prev} ${text}` : text);
  };

  // Status Badge Class & Label
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ON_DISCUSS':
        return { label: 'On Discuss', bg: '#fef3c7', color: '#d97706', border: '#fde68a', icon: <Clock size={13} /> };
      case 'IN_PROGRESS':
        return { label: 'In Progress', bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd', icon: <ArrowUpRight size={13} /> };
      case 'RESOLVED':
        return { label: 'Resolved', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', icon: <CheckCircle2 size={13} /> };
      default:
        return { label: 'Active', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0', icon: <MessageSquare size={13} /> };
    }
  };

  return (
    <div className="query-modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className={`query-modal-container ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* MODAL TOP BAR */}
        <div className="query-modal-header">
          <div className="query-header-left">
            <div className="query-header-icon">
              <MessageSquare size={22} />
            </div>
            <div>
              <div className="query-header-title-row">
                <h2>Club Queries & Discussions</h2>
                <span className="query-live-chip">
                  <span className="pulse-dot"></span>
                  Supabase Cloud Realtime
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  Max PDF 30MB
                </span>
              </div>
              <p className="query-header-subtitle">
                Collaborative chapter issue tracking, letter verification & live multi-chapter discussion hub
              </p>
            </div>
          </div>

          <div className="query-header-actions">
            <button
              type="button"
              className="query-btn-refresh"
              onClick={async () => {
                setIsSyncing(true);
                const fresh = await fetchQueriesFromSupabase();
                if (fresh) setQueries(fresh);
                setIsSyncing(false);
              }}
              title="Sync with Supabase"
            >
              <RefreshCw size={15} className={isSyncing ? 'spinning' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <button
              type="button"
              className="query-btn-primary"
              onClick={() => setIsNewQueryModalOpen(true)}
            >
              <Plus size={16} />
              <span>Raise New Query</span>
            </button>

            <button type="button" className="query-btn-close" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL MAIN CONTENT: TWO PANE LAYOUT */}
        <div className="query-modal-body">
          
          {/* LEFT PANE: QUERY TICKETS LIST */}
          <div className="query-list-pane">
            
            {/* Search & Filter Bar */}
            <div className="query-list-controls">
              <div className="query-search-box">
                <Search size={15} className="query-search-icon" />
                <input
                  type="text"
                  placeholder="Search club queries, IDs, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="query-search-clear" onClick={() => setSearchQuery('')}>×</button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="query-filter-pills">
                <button
                  className={`filter-pill ${filterStatus === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('ALL')}
                >
                  All ({queries.length})
                </button>
                <button
                  className={`filter-pill status-discuss ${filterStatus === 'ON_DISCUSS' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('ON_DISCUSS')}
                >
                  On Discuss ({onDiscussCount})
                </button>
                <button
                  className={`filter-pill status-progress ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('IN_PROGRESS')}
                >
                  In Progress ({inProgressCount})
                </button>
                <button
                  className={`filter-pill status-resolved ${filterStatus === 'RESOLVED' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('RESOLVED')}
                >
                  Resolved ({resolvedCount})
                </button>
              </div>
            </div>

            {/* Ticket Cards Stream */}
            <div className="query-cards-scroll">
              {filteredQueries.length === 0 ? (
                <div className="query-empty-state">
                  <MessageSquare size={36} opacity={0.3} />
                  <p>No queries found matching this filter.</p>
                  <button className="query-btn-secondary" onClick={() => setIsNewQueryModalOpen(true)}>
                    + Start New Club Discussion
                  </button>
                </div>
              ) : (
                filteredQueries.map((item) => {
                  const isActive = activeQuery?.id === item.id;
                  const badge = getStatusBadge(item.status);
                  const msgCount = Array.isArray(item.messages) ? item.messages.length : 0;
                  const hasImage = item.messages?.some(m => m.image || m.fileType === 'image');
                  const hasPdf = item.messages?.some(m => m.pdfUrl || m.fileType === 'pdf');

                  return (
                    <div
                      key={item.id}
                      className={`query-ticket-card ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveQueryId(item.id)}
                    >
                      <div className="ticket-card-header">
                        <span className="ticket-id">{item.id}</span>
                        <span
                          className="ticket-status-chip"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            borderColor: badge.border
                          }}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>

                      <h4 className="ticket-title">{item.title}</h4>
                      
                      {item.description && (
                        <p className="ticket-desc-snippet">{item.description}</p>
                      )}

                      <div className="ticket-card-footer">
                        <div className="ticket-author-info">
                          <span className="author-avatar">{item.author?.avatar || '👤'}</span>
                          <span className="author-name">{item.author?.name || 'Admin'}</span>
                        </div>
                        
                        <div className="ticket-meta-badges">
                          {hasPdf && (
                            <span className="meta-badge-pdf" title="Has attached PDF document" style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: 700 }}>
                              <FileText size={12} /> PDF
                            </span>
                          )}
                          {hasImage && (
                            <span className="meta-badge-image" title="Has attached screenshots/images">
                              <ImageIcon size={12} />
                            </span>
                          )}
                          <span className="meta-badge-count">
                            <MessageSquare size={12} />
                            {msgCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANE: ACTIVE DISCUSSION STREAM & CHAT BOX */}
          <div className="query-discussion-pane">
            {activeQuery ? (
              <>
                {/* Active Ticket Details Top Bar */}
                <div className="discussion-top-bar">
                  <div className="discussion-top-meta">
                    <div className="discussion-ref-row">
                      <span className="discussion-id-badge">{activeQuery.id}</span>
                      <span className="discussion-chapter-pill">
                        {activeQuery.category === 'AWS_SBG' ? '☁️ AWS SBG' : (activeQuery.category === 'TECHNO_LAB' ? '⚡ Techno Lab' : '🌐 GDGoC')}
                      </span>
                      <span className={`discussion-urgency-pill urgency-${(activeQuery.urgency || 'MEDIUM').toLowerCase()}`}>
                        {activeQuery.urgency || 'MEDIUM'} PRIORITY
                      </span>
                    </div>
                    <h3 className="discussion-subject-title">{activeQuery.title}</h3>
                    <p className="discussion-author-subline">
                      Raised by <b>{activeQuery.author?.name}</b> ({activeQuery.author?.role || 'Team'}) &bull; {new Date(activeQuery.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Status Toggle Dropdown */}
                  <div className="discussion-status-dropdown-wrap">
                    <label>Discussion Status</label>
                    <select
                      value={activeQuery.status || 'ON_DISCUSS'}
                      onChange={async (e) => {
                        const newSt = e.target.value;
                        await updateQueryStatus(activeQuery.id, newSt);
                        setQueries(prev => prev.map(q => q.id === activeQuery.id ? { ...q, status: newSt } : q));
                        Swal.fire({
                          toast: true,
                          position: 'top-end',
                          icon: 'success',
                          title: `Status updated to ${newSt.replace('_', ' ')}`,
                          timer: 1800,
                          showConfirmButton: false
                        });
                      }}
                      className="discussion-status-select"
                    >
                      <option value="ON_DISCUSS">🟡 On Discuss</option>
                      <option value="IN_PROGRESS">🔵 In Progress</option>
                      <option value="RESOLVED">🟢 Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Messages Chat Stream */}
                <div className="discussion-messages-stream">
                  {(!activeQuery.messages || activeQuery.messages.length === 0) ? (
                    <div className="chat-empty-thread">
                      <Sparkles size={32} opacity={0.4} />
                      <h4>No messages yet in this discussion</h4>
                      <p>Share updates, queries, appointment letter feedback, or upload design proof images & PDF files (up to 30 MB) below.</p>
                    </div>
                  ) : (
                    activeQuery.messages.map((msg, idx) => {
                      const isMe = msg.senderName === (currentUser?.name || currentUser?.username || 'Executive Admin');
                      const hasPdf = msg.pdfUrl || msg.fileType === 'pdf' || (msg.image && msg.image.startsWith('data:application/pdf'));
                      const hasImg = msg.image && !msg.image.startsWith('data:application/pdf');

                      return (
                        <div key={msg.id || idx} className={`chat-message-row ${isMe ? 'message-outgoing' : 'message-incoming'}`}>
                          <div className="message-avatar-bubble">
                            {msg.avatar || '👤'}
                          </div>

                          <div className="message-content-wrapper">
                            <div className="message-header-info">
                              <span className="message-sender-name">{msg.senderName}</span>
                              {msg.senderRole && <span className="message-sender-role">{msg.senderRole}</span>}
                              <span className="message-timestamp">{msg.timestamp || 'Just now'}</span>
                              
                              {msg.text && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessage(msg.text, msg.id || idx)}
                                  title="Copy text"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    padding: '2px 4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    marginLeft: '4px'
                                  }}
                                >
                                  {copiedMsgId === (msg.id || idx) ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                </button>
                              )}
                            </div>

                            <div className="message-bubble-body">
                              {msg.text && <p className="message-text-content">{msg.text}</p>}

                              {/* Attached Image inside Chat */}
                              {hasImg && (
                                <div className="message-image-attachment-wrap" onClick={() => setPreviewImageModal(msg.image)}>
                                  <img src={msg.image} alt="Attachment" className="message-attached-img" />
                                  <div className="img-hover-overlay">
                                    <Eye size={18} />
                                    <span>Click to enlarge preview</span>
                                  </div>
                                </div>
                              )}

                              {/* Attached PDF inside Chat */}
                              {hasPdf && (
                                <div style={{
                                  marginTop: '8px',
                                  padding: '12px 14px',
                                  background: isMe ? 'rgba(0, 0, 0, 0.15)' : '#f8fafc',
                                  border: `1.5px solid ${isMe ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0'}`,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  maxWidth: '340px'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                    <div style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '8px',
                                      background: '#fee2e2',
                                      color: '#dc2626',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      <FileText size={20} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                      <strong style={{
                                        display: 'block',
                                        fontSize: '12.5px',
                                        color: isMe ? '#ffffff' : '#0f172a',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {msg.fileName || 'Attached_Document.pdf'}
                                      </strong>
                                      <small style={{ color: isMe ? '#fed7aa' : '#64748b', fontSize: '11px' }}>
                                        PDF Document {msg.fileSize ? `• ${msg.fileSize}` : '• < 30 MB'}
                                      </small>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                    <a
                                      href={msg.pdfUrl || msg.image}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Open PDF in new tab"
                                      style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        background: isMe ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                        color: isMe ? '#ffffff' : '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <ExternalLink size={14} />
                                    </a>
                                    <a
                                      href={msg.pdfUrl || msg.image}
                                      download={msg.fileName || 'Document.pdf'}
                                      title="Download PDF"
                                      style={{
                                        padding: '6px',
                                        borderRadius: '6px',
                                        background: isMe ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                        color: isMe ? '#ffffff' : '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textDecoration: 'none'
                                      }}
                                    >
                                      <Download size={14} />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Reply Pills */}
                <div className="discussion-quick-replies">
                  <span className="quick-reply-label">Quick:</span>
                  <button type="button" onClick={() => handleQuickReply('Reviewed & approved for letter generation. ✅')}>
                    Reviewed & Approved ✅
                  </button>
                  <button type="button" onClick={() => handleQuickReply('Please verify the student department credentials and ref ID. 🔍')}>
                    Verify Credentials 🔍
                  </button>
                  <button type="button" onClick={() => handleQuickReply('Will resolve this before next chapter deployment. ⚡')}>
                    In Next Sprint ⚡
                  </button>
                  <button type="button" onClick={() => handleQuickReply('Attached the updated appointment letter / PDF. 📄')}>
                    PDF Attached 📄
                  </button>
                </div>

                {/* File Attachment Preview Strip before sending */}
                {attachedFile && (
                  <div className="image-attachment-preview-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {attachedFile.type === 'image' ? (
                        <div className="preview-thumb-box">
                          <img src={attachedFile.url} alt="Attachment Preview" />
                        </div>
                      ) : (
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={22} />
                        </div>
                      )}
                      <div>
                        <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a' }}>
                          {attachedFile.name}
                        </strong>
                        <span className="preview-label" style={{ fontSize: '11px' }}>
                          {attachedFile.type.toUpperCase()} • {attachedFile.size} • Under 30MB Limit ✓
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={() => setAttachedFile(null)}
                      title="Remove attachment"
                      style={{ position: 'static', width: '26px', height: '26px', borderRadius: '6px', background: '#e2e8f0', color: '#0f172a' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Chat Composer Form */}
                <form className="discussion-composer-form" onSubmit={handleSendMessage}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, 'chat')}
                  />

                  <button
                    type="button"
                    className="composer-btn-attach"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Image or PDF Document (Max 30 MB)"
                  >
                    <Paperclip size={19} />
                  </button>

                  <input
                    type="text"
                    className="composer-text-input"
                    placeholder="Type your discussion message, notes, or reply..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="composer-btn-send"
                    disabled={isSending || (!messageText.trim() && !attachedFile)}
                  >
                    <Send size={16} />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="discussion-pane-empty">
                <MessageSquare size={48} opacity={0.25} />
                <h3>No Query Selected</h3>
                <p>Select a query ticket from the left pane or raise a new one.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL 2: RAISE NEW QUERY DIALOG */}
      {isNewQueryModalOpen && (
        <div className="new-query-submodal-overlay" onClick={() => setIsNewQueryModalOpen(false)} style={{ zIndex: 99999 }}>
          <div className="new-query-submodal-card" onClick={(e) => e.stopPropagation()}>
            <div className="submodal-header">
              <div className="submodal-title-row">
                <Sparkles size={20} className="sparkle-icon" />
                <h3>Raise New Project Query / Topic</h3>
              </div>
              <button type="button" className="query-btn-close" onClick={() => setIsNewQueryModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuery} className="new-query-form">
              <div className="form-group">
                <label>Discussion / Query Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Bootcamp Offer Letter Distribution Plan"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Chapter Wing</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="AWS_SBG">☁️ AWS Student Builder Group</option>
                    <option value="TECHNO_LAB">⚡ Techno Lab Innovation Wing</option>
                    <option value="GDGOC">🌐 GDGoC ITMBU Chapter</option>
                    <option value="GENERAL">🏛️ General / Portal Governance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority / Urgency</label>
                  <select value={newUrgency} onChange={(e) => setNewUrgency(e.target.value)}>
                    <option value="HIGH">🔴 High Priority</option>
                    <option value="MEDIUM">🟡 Medium Priority</option>
                    <option value="LOW">🟢 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Initial Description & Context</label>
                <textarea
                  rows={3}
                  placeholder="Provide context, candidate references, or questions for team review..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              {/* File Attachment for New Query (Image or PDF <= 30MB) */}
              <div className="form-group">
                <label>Attach Screenshot or PDF Document (Optional &bull; Max 30 MB)</label>
                <input
                  type="file"
                  ref={newQueryFileInputRef}
                  accept="image/*,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, 'newQuery')}
                />
                
                {newInitialFile ? (
                  <div className="image-attachment-preview-bar" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {newInitialFile.type === 'image' ? (
                        <div className="preview-thumb-box">
                          <img src={newInitialFile.url} alt="Attachment Preview" />
                        </div>
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                      )}
                      <div>
                        <strong style={{ fontSize: '12.5px', color: '#0f172a', display: 'block' }}>{newInitialFile.name}</strong>
                        <span className="preview-label" style={{ fontSize: '11px' }}>{newInitialFile.type.toUpperCase()} • {newInitialFile.size}</span>
                      </div>
                    </div>
                    <button type="button" className="btn-remove-preview" onClick={() => setNewInitialFile(null)} style={{ position: 'static', width: '24px', height: '24px', borderRadius: '4px' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-upload-box"
                    onClick={() => newQueryFileInputRef.current?.click()}
                  >
                    <Paperclip size={18} />
                    <span>Click to attach Image / PDF document (Strict Max 30 MB)</span>
                  </button>
                )}
              </div>

              <div className="submodal-actions">
                <button type="button" className="query-btn-secondary" onClick={() => setIsNewQueryModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="query-btn-primary">
                  <Send size={15} />
                  <span>Publish to Supabase Realtime</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL IMAGE LIGHTBOX MODAL WITH ULTRA-HIGH Z-INDEX */}
      {previewImageModal && (
        <div
          className="image-lightbox-overlay"
          onClick={() => setPreviewImageModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '30px'
          }}
        >
          <div
            className="image-lightbox-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'absolute', top: '-45px', right: '0', display: 'flex', gap: '10px' }}>
              <a
                href={previewImageModal}
                download="Discussion_Screenshot.png"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                title="Download Image"
              >
                <Download size={18} />
              </a>
              <button
                className="lightbox-close-btn"
                onClick={() => setPreviewImageModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Close Lightbox"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={previewImageModal}
              alt="Enlarged Attachment"
              className="lightbox-img"
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                borderRadius: '12px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
