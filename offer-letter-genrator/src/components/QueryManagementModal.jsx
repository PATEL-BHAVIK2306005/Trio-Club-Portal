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
  Eye
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

  // New Message State
  const [messageText, setMessageText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // New Query Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(activeOrg || 'AWS_SBG');
  const [newUrgency, setNewUrgency] = useState('MEDIUM');
  const [newDescription, setNewDescription] = useState('');
  const [newInitialImage, setNewInitialImage] = useState(null);

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
      (q.author?.name && q.author.name.toLowerCase().includes(qTerm));
    return matchesFilter && matchesSearch;
  });

  const onDiscussCount = queries.filter(q => q.status === 'ON_DISCUSS').length;
  const inProgressCount = queries.filter(q => q.status === 'IN_PROGRESS').length;
  const resolvedCount = queries.filter(q => q.status === 'RESOLVED').length;

  // Handle Image File Selection
  const handleImageFileChange = (e, target = 'chat') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Image Too Large',
        text: 'Please select an image smaller than 5 MB for real-time cloud sync.',
        confirmButtonColor: '#ff9900'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (target === 'chat') {
        setAttachedImage(reader.result);
      } else {
        setNewInitialImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!messageText.trim() && !attachedImage) || !activeQuery) return;

    setIsSending(true);
    const senderName = currentUser?.name || currentUser?.username || 'Executive Admin';
    const senderRole = currentUser?.role || 'Lead Organizer';
    const senderAvatar = currentUser?.avatar || '👑';

    try {
      await addMessageToQuery(activeQuery.id, {
        senderName,
        senderRole,
        avatar: senderAvatar,
        text: messageText.trim(),
        image: attachedImage
      });

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
                  senderName,
                  senderRole,
                  avatar: senderAvatar,
                  text: messageText.trim(),
                  image: attachedImage,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            };
          }
          return q;
        });
      });

      setMessageText('');
      setAttachedImage(null);
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
      messages: newDescription.trim() ? [
        {
          id: `msg-init-${Date.now()}`,
          senderName: currentUser?.name || currentUser?.username || 'Executive Admin',
          senderRole: currentUser?.role || 'Lead Organizer',
          avatar: currentUser?.avatar || '👑',
          text: newDescription.trim(),
          image: newInitialImage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ] : []
    });

    setQueries(prev => [created, ...prev]);
    setActiveQueryId(created.id);
    setIsNewQueryModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewInitialImage(null);

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
    <div className="query-modal-overlay" onClick={onClose}>
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
              </div>
              <p className="query-header-subtitle">
                Collaborative chapter issue tracking, club questions & live multi-chapter discussion hub
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
                  const hasImage = item.messages?.some(m => m.image);

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
                      <p>Share updates, queries, appointment letter feedback, or upload design proof images below.</p>
                    </div>
                  ) : (
                    activeQuery.messages.map((msg, idx) => {
                      const isMe = msg.senderName === (currentUser?.name || currentUser?.username || 'Executive Admin');

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
                            </div>

                            <div className="message-bubble-body">
                              {msg.text && <p className="message-text-content">{msg.text}</p>}

                              {/* Attached Image inside Chat */}
                              {msg.image && (
                                <div className="message-image-attachment-wrap" onClick={() => setPreviewImageModal(msg.image)}>
                                  <img src={msg.image} alt="Attachment" className="message-attached-img" />
                                  <div className="img-hover-overlay">
                                    <Eye size={18} />
                                    <span>Click to enlarge</span>
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
                  <button type="button" onClick={() => handleQuickReply('Attached the updated certificate proof. 🖼️')}>
                    Proof Attached 🖼️
                  </button>
                </div>

                {/* Image Attachment Preview Strip */}
                {attachedImage && (
                  <div className="image-attachment-preview-bar">
                    <div className="preview-thumb-box">
                      <img src={attachedImage} alt="Attachment Preview" />
                      <button
                        type="button"
                        className="btn-remove-preview"
                        onClick={() => setAttachedImage(null)}
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <span className="preview-label">Image attached • Ready to send to Supabase Cloud</span>
                  </div>
                )}

                {/* Chat Composer Form */}
                <form className="discussion-composer-form" onSubmit={handleSendMessage}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageFileChange(e, 'chat')}
                  />

                  <button
                    type="button"
                    className="composer-btn-attach"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Image / Screenshot"
                  >
                    <ImageIcon size={19} />
                  </button>

                  <input
                    type="text"
                    className="composer-text-input"
                    placeholder="Type your discussion message or reply..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="composer-btn-send"
                    disabled={isSending || (!messageText.trim() && !attachedImage)}
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
        <div className="new-query-submodal-overlay" onClick={() => setIsNewQueryModalOpen(false)}>
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

              {/* Image Attachment for New Query */}
              <div className="form-group">
                <label>Attach Screenshot / Design Proof (Optional)</label>
                <input
                  type="file"
                  ref={newQueryFileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageFileChange(e, 'newQuery')}
                />
                
                {newInitialImage ? (
                  <div className="image-attachment-preview-bar" style={{ marginTop: '4px' }}>
                    <div className="preview-thumb-box">
                      <img src={newInitialImage} alt="Attachment Preview" />
                      <button type="button" className="btn-remove-preview" onClick={() => setNewInitialImage(null)}>
                        <X size={14} />
                      </button>
                    </div>
                    <span className="preview-label">Screenshot attached</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-upload-box"
                    onClick={() => newQueryFileInputRef.current?.click()}
                  >
                    <ImageIcon size={18} />
                    <span>Click to upload image/screenshot (Max 5 MB)</span>
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

      {/* FULL IMAGE LIGHTBOX MODAL */}
      {previewImageModal && (
        <div className="image-lightbox-overlay" onClick={() => setPreviewImageModal(null)}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setPreviewImageModal(null)}>
              <X size={24} />
            </button>
            <img src={previewImageModal} alt="Enlarged Attachment" className="lightbox-img" />
          </div>
        </div>
      )}

    </div>
  );
}
