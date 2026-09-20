import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowUpRight,
  Plus,
  Newspaper,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Search,
  Calendar,
  Layers,
  Award,
  Clock,
  Check,
  Copy,
  ChevronRight,
  Bot,
  Zap,
  BookOpen,
  Users,
  FileText,
  MessageSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  fetchLiveTechNews,
  generateAiEventIdea,
  getStoredKeys,
  saveStoredKeys,
  DEFAULT_FALLBACK_NEWS
} from '../services/newsAndAiService';

export default function ExecutiveDashboard({
  members = [],
  activeOrg = 'AWS_SBG',
  clubConfig = {},
  certificates = [],
  currentUser = null,
  onNavigateView = () => {},
  onSelectMemberForLetter = () => {},
  onOpenAddMember = () => {},
  onOpenBatchModal = () => {},
  onOpenEmailModal = () => {},
  onOpenQueryModal = () => {},
  dbConnected = true,
  lastSyncTime = null
}) {
  // Active Section Tab: 'news' | 'ai_ideator' | 'pipeline'
  const [activeTab, setActiveTab] = useState('news');

  // Filter members for active chapter
  const chapterMembers = members.filter(
    m => (m.organization || 'AWS_SBG') === activeOrg
  );

  const totalMembers = chapterMembers.length || 24;
  const verifiedCount = chapterMembers.filter(m => m.status === 'Active' || m.email).length;
  const pendingCount = Math.max(1, totalMembers - verifiedCount);

  // =========================================================================
  // 1. LIVE TECH & CHAPTER NEWS STATE
  // =========================================================================
  const [newsCategory, setNewsCategory] = useState('ALL');
  const [newsSearch, setNewsSearch] = useState('');
  const [newsList, setNewsList] = useState(DEFAULT_FALLBACK_NEWS);
  const [newsLoading, setNewsLoading] = useState(false);
  const [lastFetchedTime, setLastFetchedTime] = useState(null);

  // Load news on mount or category change
  const loadNews = useCallback(async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      const articles = await fetchLiveTechNews(newsCategory, forceRefresh);
      setNewsList(articles);
      setLastFetchedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching live news:', err);
    } finally {
      setNewsLoading(false);
    }
  }, [newsCategory]);

  useEffect(() => {
    loadNews(false);
  }, [loadNews]);

  // Filter news based on search query
  const filteredNews = useMemo(() => {
    if (!newsSearch.trim()) return newsList;
    const q = newsSearch.toLowerCase();
    return newsList.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
    );
  }, [newsList, newsSearch]);

  // =========================================================================
  // 2. AI UNIQUE EVENT IDEATOR STATE
  // =========================================================================
  const [eventTopic, setEventTopic] = useState('Generative AI & Cloud Agents');
  const [eventFormat, setEventFormat] = useState('Hackathon');
  const [eventAudience, setEventAudience] = useState('Undergraduate CSE / IT Students');
  const [customNotes, setCustomNotes] = useState('');
  const [targetChapter, setTargetChapter] = useState(activeOrg);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState(null);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);

  // Sync chapter when activeOrg changes
  useEffect(() => {
    setTargetChapter(activeOrg);
  }, [activeOrg]);

  // Generate Event Blueprint Handler
  const handleGenerateEvent = async () => {
    setIsGeneratingIdea(true);
    try {
      const res = await generateAiEventIdea({
        targetOrg: targetChapter,
        topic: eventTopic,
        format: eventFormat,
        targetAudience: eventAudience,
        customPrompt: customNotes
      });

      if (res.success && res.data) {
        setGeneratedBlueprint({
          ...res.data,
          sourceEngine: res.source
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Generation Note',
        text: 'Generated fallback event concept. Check internet connection for live AI updates.',
        icon: 'info',
        background: '#101626',
        color: '#f8fafc'
      });
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // Copy Blueprint to Clipboard
  const handleCopyBlueprint = () => {
    if (!generatedBlueprint) return;
    const text = `
EVENT BLUEPRINT: ${generatedBlueprint.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host Chapter: ${generatedBlueprint.targetOrg}
Tagline: ${generatedBlueprint.tagline}
Format & Duration: ${generatedBlueprint.duration} (${generatedBlueprint.difficulty})
Audience & Prerequisites: ${generatedBlueprint.prerequisites}

Overview:
${generatedBlueprint.overview}

Recommended Tech Stack:
${(generatedBlueprint.techStack || []).map(t => `• ${t}`).join('\n')}

Agenda Breakdown:
${(generatedBlueprint.agenda || []).map(a => `• [${a.time}] ${a.event}`).join('\n')}

Outcomes & Certification:
${(generatedBlueprint.prizesAndOutcomes || []).map(p => `• ${p}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated via Campus Core Link Club AI Event Studio
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedBlueprint(true);
    setTimeout(() => setCopiedBlueprint(false), 2500);
  };

  // Pipeline tasks fallback
  const pipelineTasks = [
    {
      id: 1,
      title: 'Generate Core Executive Letters',
      dueDate: 'Due: Nov 28, 2026',
      icon: 'L',
      color: '#3b82f6',
      view: 'letter_studio'
    },
    {
      id: 2,
      title: 'Event Credential Badges & QR Vault',
      dueDate: 'Due: Nov 30, 2026',
      icon: 'C',
      color: '#10b981',
      view: 'certificate_studio'
    },
    {
      id: 3,
      title: 'Synchronize Member Roster DB',
      dueDate: 'Due: Dec 2, 2026',
      icon: 'R',
      color: '#8b5cf6',
      view: 'team_management'
    },
    {
      id: 4,
      title: 'Institutional Branding & Signature Seal',
      dueDate: 'Due: Dec 5, 2026',
      icon: 'B',
      color: '#f59e0b',
      view: 'branding'
    }
  ];

  return (
    <div className="donezo-dashboard-wrapper">
      
      {/* Top Welcome Title & Primary Actions */}
      <div className="donezo-top-bar-row">
        <div className="donezo-header-text">
          <div className="dashboard-title-badge-row">
            <h1 className="donezo-page-title">Executive Intelligence Hub</h1>
            <span className="chapter-indicator-pill" style={{ borderColor: clubConfig.primaryColor || '#0284c7' }}>
              <span className="indicator-dot" style={{ background: clubConfig.primaryColor || '#0284c7' }}></span>
              {clubConfig.shortName || activeOrg} Chapter
            </span>
          </div>
          <p className="donezo-page-subtitle">
            Real-time tech ecosystem news, AI event architect, and chapter administration suite.
          </p>
        </div>

        <div className="donezo-action-buttons">
          <button 
            className="btn-donezo-primary"
            onClick={onOpenAddMember}
            title="Add new member to active chapter roster"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* 4 High-Level Key Metric Cards Row */}
      <div className="donezo-metrics-grid">
        
        {/* Card 1: Total Chapter Roster */}
        <div 
          className="donezo-stat-card card-saas-clean"
          onClick={() => onNavigateView('letter_studio')}
          title="Click to view all members in Letter Studio"
        >
          <div className="stat-card-header">
            <span className="stat-card-label">Chapter Roster</span>
            <div className="stat-card-icon-bubble bubble-blue">
              <Users size={16} />
            </div>
          </div>
          <div className="stat-card-number">{totalMembers}</div>
          <div className="stat-card-footer">
            <span className="stat-trend-pill-mint">
              <span className="trend-arrow">▲</span> +100%
            </span>
            <span className="stat-sub-caption">Active Roster</span>
          </div>
        </div>

        {/* Card 2: Generated & Issued Letters */}
        <div 
          className="donezo-stat-card card-saas-clean"
          onClick={() => onNavigateView('letter_studio')}
          title="Click to view finished letters"
        >
          <div className="stat-card-header">
            <span className="stat-card-label">Issued Letters</span>
            <div className="stat-card-icon-bubble bubble-indigo">
              <FileText size={16} />
            </div>
          </div>
          <div className="stat-card-number">{verifiedCount || 10}</div>
          <div className="stat-card-footer">
            <span className="stat-trend-pill-mint">
              <span className="trend-arrow">▲</span> Verified
            </span>
            <span className="stat-sub-caption">Official Letters</span>
          </div>
        </div>

        {/* Card 3: Live AI Event Studio */}
        <div 
          className="donezo-stat-card card-saas-clean clickable-query-card"
          onClick={() => setActiveTab('ai_ideator')}
          title="Switch to AI Event Blueprint Generator"
        >
          <div className="stat-card-header">
            <span className="stat-card-label">AI Event Studio</span>
            <div className="stat-card-icon-bubble bubble-cyan">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="stat-card-number" style={{ fontSize: '24px', letterSpacing: '-0.5px' }}>
            AI Engine
          </div>
          <div className="stat-card-footer">
            <span className="stat-trend-pill-mint">
              <span className="trend-arrow">●</span> Live
            </span>
            <span className="stat-sub-caption">Blueprint Architect</span>
          </div>
        </div>

        {/* Card 4: Discussion & Queries Hub */}
        <div 
          className="donezo-stat-card card-saas-clean clickable-query-card"
          onClick={() => (onOpenQueryModal ? onOpenQueryModal() : onNavigateView('query_modal'))}
          title="Click to open Live Chapter Queries & Discussion Hub"
        >
          <div className="stat-card-header">
            <span className="stat-card-label">Chapter Queries</span>
            <div className="stat-card-icon-bubble bubble-amber">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="stat-card-number">{pendingCount || 1}</div>
          <div className="stat-card-footer">
            <span className="stat-trend-pill-mint">
              <span className="trend-arrow">●</span> Realtime
            </span>
            <span className="stat-sub-caption">Discussion Hub</span>
          </div>
        </div>

      </div>

      {/* Main Feature Tabs Navigation */}
      <div className="dashboard-feature-tabs-nav">
        <button 
          className={`feature-tab-btn ${activeTab === 'news' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          <Newspaper size={16} />
          <span>Tech &amp; Cloud News Center</span>
          <span className="tab-count-pill">{filteredNews.length}</span>
        </button>

        <button 
          className={`feature-tab-btn ${activeTab === 'ai_ideator' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('ai_ideator')}
        >
          <Sparkles size={16} />
          <span>AI Unique Event Ideator</span>
          <span className="tab-special-badge">AI Powered</span>
        </button>

        <button 
          className={`feature-tab-btn ${activeTab === 'pipeline' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <Layers size={16} />
          <span>Chapter Operations &amp; Roster</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: LIVE TECH & CHAPTER NEWS SECTION */}
      {/* ===================================================================== */}
      {activeTab === 'news' && (
        <div className="news-intelligence-container">
          
          {/* Controls Bar: Category Filter Pills, Search Bar, Refresh */}
          <div className="news-controls-header">
            
            {/* Category Filter Pills */}
            <div className="news-category-pills">
              <button 
                className={`news-cat-pill ${newsCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setNewsCategory('ALL')}
              >
                All Tech Feed
              </button>
              <button 
                className={`news-cat-pill ${newsCategory === 'AWS' ? 'active aws-active' : ''}`}
                onClick={() => setNewsCategory('AWS')}
              >
                AWS Cloud
              </button>
              <button 
                className={`news-cat-pill ${newsCategory === 'GDGOC' ? 'active gdg-active' : ''}`}
                onClick={() => setNewsCategory('GDGOC')}
              >
                GDGoC &amp; Google
              </button>
              <button 
                className={`news-cat-pill ${newsCategory === 'AI' ? 'active ai-active' : ''}`}
                onClick={() => setNewsCategory('AI')}
              >
                Open Source AI
              </button>
            </div>

            {/* Search and Refresh */}
            <div className="news-search-and-refresh">
              <div className="news-search-box">
                <Search size={14} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Filter articles, topics..."
                  value={newsSearch}
                  onChange={(e) => setNewsSearch(e.target.value)}
                  className="news-search-input"
                />
              </div>

              <button 
                className={`btn-news-refresh ${newsLoading ? 'spinning' : ''}`}
                onClick={() => loadNews(true)}
                title="Fetch fresh live articles"
                disabled={newsLoading}
              >
                <RefreshCw size={14} />
                <span>{newsLoading ? 'Fetching...' : 'Refresh Feed'}</span>
              </button>
            </div>

          </div>

          {/* News Source Status Row */}
          <div className="news-feed-status-meta">
            <span className="live-pulse-indicator">
              <span className="pulse-circle"></span>
              Live Tech Feed Active
            </span>
            {lastFetchedTime && (
              <span className="last-sync-tag">Last updated: {lastFetchedTime}</span>
            )}
            <span className="feed-source-tag">Sources: AWS Blog • Google Developers • Dev.to • TechNet</span>
          </div>

          {/* News Articles Grid */}
          <div className="news-articles-grid">
            {filteredNews.map((article) => (
              <article key={article.id} className="news-card-glass">
                {article.imageUrl && (
                  <div className="news-card-image-wrap">
                    <img src={article.imageUrl} alt={article.title} className="news-card-img" />
                    <span className="news-tag-badge" style={{ backgroundColor: article.tagColor || '#0284c7' }}>
                      {article.tag}
                    </span>
                  </div>
                )}

                <div className="news-card-body">
                  <div className="news-card-meta-top">
                    <span className="news-source-name">{article.source}</span>
                    <span className="news-read-time">{article.readTime || '3 min read'}</span>
                  </div>

                  <h4 className="news-card-title">{article.title}</h4>
                  <p className="news-card-desc">{article.description}</p>

                  <div className="news-card-footer">
                    <span className="news-published-date">
                      {new Date(article.publishedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>

                    <a 
                      href={article.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="news-read-more-btn"
                      title="Open full article in new tab"
                    >
                      <span>Read Story</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="news-empty-state">
              <Newspaper size={36} color="#64748b" />
              <h4>No matching articles found</h4>
              <p>Try refining your search keyword or clearing the filter.</p>
              <button className="btn-donezo-outline" onClick={() => { setNewsSearch(''); setNewsCategory('ALL'); }}>
                Reset Filters
              </button>
            </div>
          )}

        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: AI UNIQUE EVENT IDEATOR & BLUEPRINT STUDIO */}
      {/* ===================================================================== */}
      {activeTab === 'ai_ideator' && (
        <div className="ai-ideator-container">
          
          <div className="ai-ideator-layout">
            
            {/* Left Column: Event Generator Configuration Card */}
            <div className="ai-config-card">
              <div className="ai-config-header">
                <div className="ai-badge-pill">
                  <Bot size={15} />
                  <span>OpenAI / Open-Source Engine</span>
                </div>
                <h3>Event Blueprint Studio</h3>
                <p>Architect unique, high-engagement campus hackathons, workshops, and cloud bootcamps.</p>
              </div>

              <div className="ai-form-fields">
                
                {/* Target Club Chapter */}
                <div className="ai-field-group">
                  <label className="ai-field-label">Target Chapter</label>
                  <select 
                    value={targetChapter} 
                    onChange={(e) => setTargetChapter(e.target.value)}
                    className="ai-select-input"
                  >
                    <option value="AWS_SBG">AWS Student Builder Group (AWS SBG)</option>
                    <option value="GDGOC">Google Developer Groups on Campus (GDGoC)</option>
                    <option value="TECHNO_LAB">Techno Lab (Techno+Techies Community)</option>
                  </select>
                </div>

                {/* Event Core Topic */}
                <div className="ai-field-group">
                  <label className="ai-field-label">Core Tech Focus / Topic</label>
                  <select 
                    value={eventTopic} 
                    onChange={(e) => setEventTopic(e.target.value)}
                    className="ai-select-input"
                  >
                    <option value="Generative AI & Cloud Agents">Generative AI &amp; Cloud Multi-Agent Workflows</option>
                    <option value="AWS Serverless Architecture & DevOps">AWS Serverless, Lambda &amp; DevOps Pipelines</option>
                    <option value="Google Gemini 2.0 & Flutter Multiplatform">Google Gemini Live API &amp; Flutter Appathon</option>
                    <option value="Edge-AI Robotics & IoT Sensor Mesh">Embedded IoT, MicroPython &amp; Edge Robotics</option>
                    <option value="Cloud Security & IAM Capture The Flag">Cloud Security, Zero-Trust &amp; IAM CTF</option>
                    <option value="Freshman Induction & Cloud Fundamentals">University Freshman Tech Induction &amp; Cloud 101</option>
                  </select>
                </div>

                {/* Event Format */}
                <div className="ai-field-group">
                  <label className="ai-field-label">Event Format</label>
                  <div className="ai-format-pills-row">
                    {['Hackathon', 'Bootcamp', 'Workshop', 'CTF / Contest'].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        className={`format-pill-btn ${eventFormat === fmt ? 'active' : ''}`}
                        onClick={() => setEventFormat(fmt)}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="ai-field-group">
                  <label className="ai-field-label">Target Audience</label>
                  <input 
                    type="text" 
                    value={eventAudience}
                    onChange={(e) => setEventAudience(e.target.value)}
                    placeholder="e.g. 2nd & 3rd Year CSE/IT Students"
                    className="ai-text-input"
                  />
                </div>

                {/* Custom Notes / Prompt */}
                <div className="ai-field-group">
                  <label className="ai-field-label">Special Customization Notes (Optional)</label>
                  <textarea 
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Focus on hands-on deployment with AWS free tier or Google AI Studio credits..."
                    className="ai-textarea-input"
                    rows={2}
                  />
                </div>

                {/* Action Trigger Button */}
                <button 
                  className={`btn-generate-ai-blueprint ${isGeneratingIdea ? 'generating' : ''}`}
                  onClick={handleGenerateEvent}
                  disabled={isGeneratingIdea}
                >
                  <Sparkles size={18} />
                  <span>{isGeneratingIdea ? 'Synthesizing Event Concept...' : 'Generate Unique Event Idea'}</span>
                </button>

              </div>
            </div>

            {/* Right Column: Generated Blueprint Showcase */}
            <div className="ai-blueprint-showcase">
              {generatedBlueprint ? (
                <div className="blueprint-card-display">
                  
                  {/* Blueprint Header */}
                  <div className="blueprint-top-bar">
                    <div className="blueprint-header-left">
                      <span className="blueprint-source-chip">
                        <Zap size={13} />
                        {generatedBlueprint.sourceEngine || 'AI Generator'}
                      </span>
                      <span className="blueprint-duration-chip">
                        <Clock size={13} />
                        {generatedBlueprint.duration}
                      </span>
                      <span className="blueprint-difficulty-chip">
                        <Award size={13} />
                        {generatedBlueprint.difficulty || 'All Levels'}
                      </span>
                    </div>

                    <div className="blueprint-actions">
                      <button 
                        className="btn-blueprint-action"
                        onClick={handleCopyBlueprint}
                        title="Copy complete markdown plan"
                      >
                        {copiedBlueprint ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedBlueprint ? 'Copied!' : 'Copy Plan'}</span>
                      </button>
                      
                      <button 
                        className="btn-blueprint-action btn-dispatch-action"
                        onClick={() => {
                          onNavigateView('letter_studio');
                        }}
                        title="Launch Letter Studio to draft speaker/organizer letters"
                      >
                        <ArrowUpRight size={14} />
                        <span>Draft Letters</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="blueprint-title-block">
                    <h2 className="blueprint-event-title">{generatedBlueprint.title}</h2>
                    <p className="blueprint-event-tagline">“{generatedBlueprint.tagline}”</p>
                  </div>

                  {/* Overview */}
                  <div className="blueprint-section">
                    <h4 className="blueprint-sec-heading">
                      <BookOpen size={16} />
                      <span>Executive Overview &amp; Objectives</span>
                    </h4>
                    <p className="blueprint-sec-text">{generatedBlueprint.overview}</p>
                  </div>

                  {/* Tech Stack Pills */}
                  {generatedBlueprint.techStack && generatedBlueprint.techStack.length > 0 && (
                    <div className="blueprint-section">
                      <h4 className="blueprint-sec-heading">
                        <Layers size={16} />
                        <span>Target Technologies &amp; Cloud Services</span>
                      </h4>
                      <div className="tech-stack-pills-row">
                        {generatedBlueprint.techStack.map((tech, idx) => (
                          <span key={idx} className="blueprint-tech-pill">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Agenda */}
                  {generatedBlueprint.agenda && generatedBlueprint.agenda.length > 0 && (
                    <div className="blueprint-section">
                      <h4 className="blueprint-sec-heading">
                        <Calendar size={16} />
                        <span>Recommended Event Timeline &amp; Agenda</span>
                      </h4>
                      <div className="blueprint-agenda-timeline">
                        {generatedBlueprint.agenda.map((ag, idx) => (
                          <div key={idx} className="agenda-timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-time-badge">{ag.time}</div>
                            <div className="timeline-event-text">{ag.event}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recognition & Outcomes */}
                  {generatedBlueprint.prizesAndOutcomes && generatedBlueprint.prizesAndOutcomes.length > 0 && (
                    <div className="blueprint-section">
                      <h4 className="blueprint-sec-heading">
                        <Award size={16} />
                        <span>Certification &amp; Chapter Deliverables</span>
                      </h4>
                      <ul className="blueprint-outcomes-list">
                        {generatedBlueprint.prizesAndOutcomes.map((item, idx) => (
                          <li key={idx}>
                            <span className="check-bullet">✔</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ) : (
                <div className="blueprint-empty-placeholder">
                  <div className="ai-spark-icon-box">
                    <Sparkles size={42} />
                  </div>
                  <h3>Ready to Architect Your Next Big Club Event</h3>
                  <p>
                    Select your target chapter and tech topic on the left, then click 
                    <strong> “Generate Unique Event Idea”</strong> to create a comprehensive blueprint with agenda, tech stack, and certification strategy.
                  </p>
                  <button 
                    className="btn-donezo-primary"
                    onClick={handleGenerateEvent}
                  >
                    Generate Sample Concept
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: CHAPTER OPERATIONS & ROSTER MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'pipeline' && (
        <div className="pipeline-operations-grid">
          
          {/* Active Tasks & Due Dates */}
          <div className="donezo-widget-card project-list-widget">
            <div className="widget-header-row">
              <h3 className="widget-title">Active Chapter Projects</h3>
              <button 
                className="btn-widget-new-pill"
                onClick={() => onNavigateView('letter_studio')}
              >
                + New Letter
              </button>
            </div>

            <div className="project-items-list">
              {pipelineTasks.map(task => (
                <div 
                  key={task.id} 
                  className="project-row-item"
                  onClick={() => onNavigateView(task.view)}
                >
                  <div className="project-icon-box" style={{ background: `${task.color}18`, color: task.color }}>
                    <span className="icon-symbol">{task.icon}</span>
                  </div>
                  <div className="project-info-col">
                    <h5 className="project-item-title">{task.title}</h5>
                    <span className="project-item-date">{task.dueDate}</span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              ))}
            </div>
          </div>

          {/* Core Member Roster Preview */}
          <div className="donezo-widget-card team-collab-widget">
            <div className="widget-header-row">
              <h3 className="widget-title">Executive Team Roster</h3>
              <button 
                className="btn-widget-outline-pill"
                onClick={onOpenAddMember}
              >
                + Add Member
              </button>
            </div>

            <div className="team-collab-list">
              {chapterMembers.slice(0, 5).map((m, idx) => (
                <div 
                  key={m.id || idx} 
                  className="team-member-row"
                  onClick={() => onSelectMemberForLetter(m)}
                  title="Click to generate official joining letter"
                >
                  <img 
                    src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.name || 'Member' + idx)}`} 
                    alt={m.name} 
                    className="team-member-avatar" 
                  />
                  <div className="team-member-info">
                    <h5 className="team-member-name">{m.name}</h5>
                    <p className="team-member-task">
                      {m.position || 'Executive Member'} &bull; <span className="task-highlight">{m.department || 'Core Team'}</span>
                    </p>
                  </div>
                  <span className={`collab-status-tag tag-${(m.status || 'Active').toLowerCase()}`}>
                    {m.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
