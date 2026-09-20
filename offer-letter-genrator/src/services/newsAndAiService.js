/**
 * The Club Query - News & AI Event Intelligence Service
 * Provides live tech news feeds for AWS, Google/GDGoC, and Open-Source AI,
 * plus AI-powered unique event idea generation for campus club chapters.
 */

// Storage keys
const STORAGE_KEYS = {
  NEWS_API_KEY: 'the_club_query_news_api_key',
  OPENAI_API_KEY: 'the_club_query_openai_api_key',
  AI_PROVIDER: 'the_club_query_ai_provider', // 'free_opensource' | 'openai' | 'groq' | 'openrouter'
  CACHED_NEWS: 'the_club_query_cached_news',
  CACHED_NEWS_TIME: 'the_club_query_cached_news_time'
};

// Fallback high-quality news dataset for instant offline / rate-limit resilience
const FALLBACK_NEWS = [
  {
    id: 'aws-1',
    category: 'AWS',
    title: 'AWS Announces Next-Generation Amazon Bedrock Agentic Workflows & Multi-Agent Collaboration',
    description: 'Build enterprise-grade multi-agent autonomous workflows with AWS Lambda, Amazon Bedrock, and custom knowledge bases with sub-second execution.',
    source: 'AWS Official Architecture Blog',
    sourceUrl: 'https://aws.amazon.com/blogs/aws/',
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    tag: 'AWS Cloud',
    tagColor: '#ff9900',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'gdgoc-1',
    category: 'GDGOC',
    title: 'Google Developer Groups on Campus (GDGoC) 2026 Solution Challenge Announced',
    description: 'Empowering student developers worldwide to solve UN Sustainable Development Goals using Google Cloud, Flutter, Gemini 2.0 Flash, and Firebase.',
    source: 'Google Developers Blog',
    sourceUrl: 'https://developers.googleblog.com/',
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    tag: 'GDGoC & Google',
    tagColor: '#4285f4',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'aws-2',
    category: 'AWS',
    title: 'Serverless Real-Time Data Pipelines with AWS Step Functions & EventBridge',
    description: 'Discover how top engineering teams architect fault-tolerant distributed event streams at university scale using AWS CDK and serverless patterns.',
    source: 'AWS Compute Blog',
    sourceUrl: 'https://aws.amazon.com/blogs/compute/',
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    tag: 'AWS Cloud',
    tagColor: '#ff9900',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ai-1',
    category: 'AI',
    title: 'Open-Source AI Revolution: Local LLM Fine-Tuning with LoRA & vLLM Acceleration',
    description: 'How student developers can run 70B parameter open-source models with high token throughput on cost-effective campus GPU clusters.',
    source: 'Hugging Face & Open Source Community',
    sourceUrl: 'https://huggingface.co/blog',
    publishedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    tag: 'Open Source AI',
    tagColor: '#10b981',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'google-1',
    category: 'GDGOC',
    title: 'Gemini 2.0 Flash Multimodal Live API: Real-Time Audio & Video Agent Development',
    description: 'Step-by-step guide for GDGoC students to build voice-enabled campus assistants with two-way low latency streaming.',
    source: 'Google AI Studio',
    sourceUrl: 'https://blog.google/technology/ai/',
    publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    tag: 'GDGoC & Google',
    tagColor: '#4285f4',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'techno-1',
    category: 'TECHNO',
    title: 'Techno Lab Embedded IoT & Robotics: MicroPython on ESP32-S3 with Edge Impulse AI',
    description: 'Hardware prototyping guidelines for building smart university smart-classroom energy monitors with tinyML on microcontroller edge devices.',
    source: 'Techno Lab Innovation Desk',
    sourceUrl: 'https://dev.to/t/iot',
    publishedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    tag: 'Techno Lab IoT',
    tagColor: '#8b5cf6',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
  }
];

// Helper to get stored keys
export const getStoredKeys = () => {
  return {
    newsApiKey: localStorage.getItem(STORAGE_KEYS.NEWS_API_KEY) || '',
    openaiApiKey: localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || '',
    aiProvider: localStorage.getItem(STORAGE_KEYS.AI_PROVIDER) || 'free_opensource'
  };
};

// Helper to save stored keys
export const saveStoredKeys = ({ newsApiKey, openaiApiKey, aiProvider }) => {
  if (newsApiKey !== undefined) localStorage.setItem(STORAGE_KEYS.NEWS_API_KEY, newsApiKey.trim());
  if (openaiApiKey !== undefined) localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, openaiApiKey.trim());
  if (aiProvider !== undefined) localStorage.setItem(STORAGE_KEYS.AI_PROVIDER, aiProvider);
};

/**
 * Fetch Live News across AWS, GDGoC/Google, and Open-Source AI
 */
export const fetchLiveTechNews = async (category = 'ALL', forceRefresh = false) => {
  // Check cache (15 min validity)
  const cachedTime = localStorage.getItem(STORAGE_KEYS.CACHED_NEWS_TIME);
  const cachedData = localStorage.getItem(STORAGE_KEYS.CACHED_NEWS);
  
  if (!forceRefresh && cachedTime && cachedData && Date.now() - parseInt(cachedTime, 10) < 15 * 60 * 1000) {
    try {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return filterNews(parsed, category);
      }
    } catch (e) {
      console.warn('News cache parse error, fetching fresh:', e);
    }
  }

  const { newsApiKey } = getStoredKeys();
  let freshArticles = [];

  // If user provided a NewsAPI / GNews key
  if (newsApiKey && newsApiKey.length > 10) {
    try {
      const query = 'AWS cloud OR Google developer OR open source AI';
      const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${newsApiKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          freshArticles = data.articles.map((a, idx) => {
            let cat = 'AI';
            let tag = '🤖 Open Source AI';
            let tagColor = '#10b981';
            const text = (a.title + ' ' + (a.description || '')).toLowerCase();
            if (text.includes('aws') || text.includes('amazon')) {
              cat = 'AWS';
              tag = '☁️ AWS Cloud';
              tagColor = '#ff9900';
            } else if (text.includes('google') || text.includes('gdg') || text.includes('android')) {
              cat = 'GDGOC';
              tag = '🌐 GDGoC & Google';
              tagColor = '#4285f4';
            }
            return {
              id: `newsapi-${idx}`,
              category: cat,
              title: a.title,
              description: a.description || 'Click to read complete breakdown from source.',
              source: a.source?.name || 'Tech News Network',
              sourceUrl: a.url,
              publishedAt: a.publishedAt || new Date().toISOString(),
              tag,
              tagColor,
              readTime: '3 min read',
              imageUrl: a.urlToImage || FALLBACK_NEWS[idx % FALLBACK_NEWS.length].imageUrl
            };
          });
        }
      }
    } catch (err) {
      console.warn('NewsAPI fetch error, falling back to open RSS feeds:', err);
    }
  }

  // If no custom key or newsapi failed, use open RSS to JSON converters (AWS Blog & Google Dev RSS)
  if (freshArticles.length === 0) {
    try {
      // 1. Fetch AWS News via Open RSS2JSON
      const awsFeedPromise = fetch(
        'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://aws.amazon.com/blogs/aws/feed/')
      ).then(r => r.json()).catch(() => null);

      // 2. Fetch Google Dev News via Dev.to or Google Blog
      const devToPromise = fetch(
        'https://dev.to/api/articles?tag=aws&top=7'
      ).then(r => r.json()).catch(() => null);

      const [awsFeed, devToArticles] = await Promise.all([awsFeedPromise, devToPromise]);

      const gathered = [];

      if (awsFeed && awsFeed.items && awsFeed.items.length > 0) {
        awsFeed.items.slice(0, 5).forEach((item, idx) => {
          gathered.push({
            id: `aws-rss-${idx}`,
            category: 'AWS',
            title: item.title,
            description: cleanHtml(item.description || item.content || '').slice(0, 160) + '...',
            source: 'AWS Official News Blog',
            sourceUrl: item.link,
            publishedAt: item.pubDate || new Date().toISOString(),
            tag: '☁️ AWS Cloud',
            tagColor: '#ff9900',
            readTime: '4 min read',
            imageUrl: item.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
          });
        });
      }

      if (devToArticles && Array.isArray(devToArticles) && devToArticles.length > 0) {
        devToArticles.slice(0, 5).forEach((item, idx) => {
          gathered.push({
            id: `devto-${idx}`,
            category: item.tags.includes('google') ? 'GDGOC' : 'AI',
            title: item.title,
            description: item.description || 'Community guide and real-world hands-on project architecture.',
            source: `Dev.to / ${item.user?.name || 'Open Developer'}`,
            sourceUrl: item.url,
            publishedAt: item.published_at || new Date().toISOString(),
            tag: item.tags.includes('google') ? '🌐 GDGoC & Google' : '🤖 Open Source AI',
            tagColor: item.tags.includes('google') ? '#4285f4' : '#10b981',
            readTime: `${item.reading_time_minutes || 3} min read`,
            imageUrl: item.cover_image || FALLBACK_NEWS[idx % FALLBACK_NEWS.length].imageUrl
          });
        });
      }

      if (gathered.length > 0) {
        // Merge with curated fallbacks for maximum variety and stability
        const mergedMap = new Map();
        [...gathered, ...FALLBACK_NEWS].forEach(item => {
          if (!mergedMap.has(item.title)) mergedMap.set(item.title, item);
        });
        freshArticles = Array.from(mergedMap.values());
      }
    } catch (openErr) {
      console.warn('Open RSS feeds error:', openErr);
    }
  }

  // Final fallback if network completely offline
  if (freshArticles.length === 0) {
    freshArticles = FALLBACK_NEWS;
  }

  // Cache results
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_NEWS, JSON.stringify(freshArticles));
    localStorage.setItem(STORAGE_KEYS.CACHED_NEWS_TIME, Date.now().toString());
  } catch (e) {}

  return filterNews(freshArticles, category);
};

const filterNews = (articles, category) => {
  if (!category || category === 'ALL') return articles;
  return articles.filter(a => a.category === category);
};

const cleanHtml = (htmlStr) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = htmlStr;
  return tmp.textContent || tmp.innerText || '';
};

/**
 * Curated Bank of University Club Event Templates for instant AI fallback ideator
 */
const EVENT_TEMPLATES = [
  {
    theme: 'Cloud & DevOps Serverless Sprint',
    targetOrg: 'AWS_SBG',
    title: 'AWS CloudForge: Serverless Microservices & Bedrock AI Agent Sprint 2026',
    tagline: 'From Zero to Scalable Production Architecture on AWS in 24 Hours',
    duration: '2-Day Weekend Hackathon & Cloud Lab',
    difficulty: 'Intermediate to Advanced',
    prerequisites: 'Basic JavaScript/Python & Git understanding',
    overview: 'A high-octane engineering hackathon where student teams design, deploy, and benchmark resilient serverless backends using AWS Lambda, DynamoDB, API Gateway, and Amazon Bedrock multi-agent workflows. Includes live load-testing faceoffs.',
    techStack: ['AWS Lambda', 'Amazon Bedrock (Claude / Titan)', 'Amazon DynamoDB', 'AWS Cloud Development Kit (CDK)', 'Docker & AWS ECS'],
    agenda: [
      { time: 'Day 1 • 09:30 AM', event: 'Keynote & Live Serverless Architecture Masterclass by AWS Solutions Architects' },
      { time: 'Day 1 • 11:30 AM', event: 'Problem Statement Release & Cloud Sandbox Account Provisioning' },
      { time: 'Day 1 • 02:00 PM', event: 'Hands-on Lab: Deploying Bedrock AI Agents with Step Functions' },
      { time: 'Day 1 • 08:00 PM', event: 'Midnight Mentorship & Code Review Checkpoint' },
      { time: 'Day 2 • 10:00 AM', event: 'Stress & Latency Load Testing Arena' },
      { time: 'Day 2 • 02:30 PM', event: 'Grand Pitch & Official Joining / Letter Recognition Ceremony' }
    ],
    prizesAndOutcomes: [
      'AWS Cloud Credits & Certification Exam Vouchers for Top 3 Teams',
      'Official Chapter Appointment & Merit Letter of Commendation',
      'Direct Fast-Track Interview for AWS Student Builder Group Core Leads'
    ]
  },
  {
    theme: 'Google Ecosystem & Multimodal AI',
    targetOrg: 'GDGOC',
    title: 'GDGoC Gemini Nexus: Multimodal Campus Assistant & Flutter App Sprint',
    tagline: 'Reinventing Campus Productivity with Gemini 2.0 Live API & Cross-Platform Flutter',
    duration: 'Full-Day Intensive Hackathon & Workshop',
    difficulty: 'All Skill Levels (Tracks for Beginners & Pros)',
    prerequisites: 'Foundational programming concepts',
    overview: 'Students will build transformative campus applications leveraging Google Gemini Multimodal Live Audio/Video APIs, Flutter, and Firebase. Teams can build automated timetable resolvers, smart lab reservation bots, or accessible vision assistants for differently-abled peers.',
    techStack: ['Gemini 2.0 Flash / Pro API', 'Google Cloud Platform (GCP)', 'Flutter 3.x', 'Firebase Cloud Firestore', 'Google AI Studio'],
    agenda: [
      { time: '10:00 AM', event: 'Google Developer Community Intro & Gemini Multimodal Live Demo' },
      { time: '11:15 AM', event: 'Hands-on Codelab: Integrating Google AI Studio with Flutter' },
      { time: '01:00 PM', event: 'Idea Brainstorming & Rapid UI Wireframing' },
      { time: '03:30 PM', event: 'Hack Sprint & Technical Lead Debugging Booths' },
      { time: '05:30 PM', event: 'Live App Demos & Swag Distribution' }
    ],
    prizesAndOutcomes: [
      'Official Google Developer Groups on Campus Badges & Certificate of Achievement',
      'Featured showcase in global GDGoC Solution Challenge Submissions',
      'Google Developer Swag Kits (T-Shirts, Stickers & Hardware Badges)'
    ]
  },
  {
    theme: 'Robotics, IoT & Embedded Edge AI',
    targetOrg: 'TECHNO_LAB',
    title: 'Techno Lab RoboSprint: Edge-AI Autonomous Rovers & Sensor Mesh',
    tagline: 'Bridge Microcontrollers with Cloud Intelligence on Hardware Sandboxes',
    duration: '3-Day Hands-on Hardware & Software Bootcamp',
    difficulty: 'Beginner to Intermediate',
    prerequisites: 'Enthusiasm for robotics, IoT sensors, or C++/Python',
    overview: 'An immersive hands-on hardware prototyping event. Students assemble ESP32/Arduino sensor boards, train TinyML anomaly detection models, and broadcast real-time telemetry over MQTT to cloud dashboards.',
    techStack: ['ESP32 Microcontrollers', 'MicroPython / Embedded C', 'MQTT Protocol', 'Edge Impulse TinyML', 'Node.js Realtime Socket Dashboard'],
    agenda: [
      { time: 'Day 1 • 02:00 PM', event: 'Sensor Interfacing, Circuit Soldering & Breadboard Fundamentals' },
      { time: 'Day 2 • 10:00 AM', event: 'Training Edge AI Neural Networks with Edge Impulse' },
      { time: 'Day 2 • 03:00 PM', event: 'MQTT Cloud Sync & Mobile Dashboard Integration' },
      { time: 'Day 3 • 11:00 AM', event: 'Autonomous Obstacle Course & Smart City Demo Arena' }
    ],
    prizesAndOutcomes: [
      'Hardware Prototyping Kits awarded to Top Innovation Winners',
      'Official Techno Lab Research Fellowship & Project Sponsorship',
      'Recognized Letter of Technical Excellence & Faculty Endorsement'
    ]
  },
  {
    theme: 'Cloud Security & DevOps CTF',
    targetOrg: 'AWS_SBG',
    title: 'AWS CloudShield: Defensive Architecture & IAM Hardening CTF',
    tagline: 'Defend University Workloads Against Automated Attack Vectors',
    duration: '6-Hour Interactive Capture The Flag (CTF)',
    difficulty: 'Intermediate',
    prerequisites: 'Understanding of Linux command line & basic networking',
    overview: 'A gamified cybersecurity CTF where student security teams audit misconfigured S3 buckets, remediate overprivileged IAM roles, configure AWS WAF rules, and investigate cloud audit logs via AWS CloudTrail.',
    techStack: ['AWS IAM & KMS', 'AWS CloudTrail & GuardDuty', 'AWS WAF', 'Python Boto3 Security Auditing', 'Linux CLI'],
    agenda: [
      { time: '10:00 AM', event: 'Zero-Trust Architecture & Cloud Vulnerability Case Studies' },
      { time: '11:00 AM', event: 'CTF Challenge Portal Launch (20 Multi-Level Scenarios)' },
      { time: '02:00 PM', event: 'Live Defense Round: Mitigating Active Cloud Attacks' },
      { time: '04:00 PM', event: 'Scoreboard Freeze, Solution Walkthrough & Prize Distribution' }
    ],
    prizesAndOutcomes: [
      'Certified Cloud Security Champion Badges',
      'Exclusive AWS Security Whitepapers & Swag Packages',
      'Leadership Role Nomination in AWS SBG Cloud Operations Chapter'
    ]
  }
];

/**
 * Generate a Unique AI Event Idea tailored to club objectives
 */
export const generateAiEventIdea = async ({
  targetOrg = 'AWS_SBG',
  topic = 'Generative AI & Cloud',
  format = 'Hackathon',
  targetAudience = 'Undergraduate CSE Students',
  customPrompt = ''
}) => {
  const { openaiApiKey, aiProvider } = getStoredKeys();

  // If user configured OpenAI / Groq / OpenRouter API Key, attempt live LLM call
  if (openaiApiKey && openaiApiKey.length > 8) {
    try {
      let endpoint = 'https://api.openai.com/v1/chat/completions';
      let model = 'gpt-4o-mini';

      if (aiProvider === 'groq') {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        model = 'llama-3.3-70b-versatile';
      } else if (aiProvider === 'openrouter') {
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        model = 'google/gemini-2.0-flash-exp:free';
      }

      const promptSystem = `You are the Lead Innovation Architect for university technical clubs (AWS Student Builder Group, Google Developer Groups on Campus, Techno Lab) at ITM (sls) Baroda University.
Generate a comprehensive, actionable, unique, and deeply inspiring event proposal in clean JSON format matching this schema:
{
  "theme": "string",
  "targetOrg": "${targetOrg}",
  "title": "string",
  "tagline": "string",
  "duration": "string",
  "difficulty": "string",
  "prerequisites": "string",
  "overview": "string (150-200 words)",
  "techStack": ["string", "string", "string", "string"],
  "agenda": [
    {"time": "string", "event": "string"}
  ],
  "prizesAndOutcomes": ["string", "string", "string"]
}`;

      const userMsg = `Generate an innovative university tech event for ${targetOrg}. Topic: ${topic}. Format: ${format}. Audience: ${targetAudience}. Additional requirements: ${customPrompt || 'Make it engaging with high student participation and practical hands-on labs.'}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: promptSystem },
            { role: 'user', content: userMsg }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return { success: true, data: parsed, source: 'Custom AI API' };
        }
      }
    } catch (apiErr) {
      console.warn('Custom AI API call error, falling back to open generator:', apiErr);
    }
  }

  // Attempt free open-source generative model (Pollinations text AI)
  try {
    const prompt = encodeURIComponent(
      `Return only valid JSON for a university club tech event blueprint for ${targetOrg} on ${topic} (${format}). Schema: {"theme":"string","targetOrg":"${targetOrg}","title":"string","tagline":"string","duration":"string","difficulty":"string","prerequisites":"string","overview":"string","techStack":["string"],"agenda":[{"time":"string","event":"string"}],"prizesAndOutcomes":["string"]}`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://text.pollinations.ai/${prompt}?json=true&model=openai`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      // Try to parse JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const rawJson = text.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(rawJson);
        if (parsed.title && parsed.overview) {
          return { success: true, data: parsed, source: 'Free Open-Source AI Engine' };
        }
      }
    }
  } catch (freeAiErr) {
    console.warn('Free text AI endpoint timeout, using algorithmic intelligence engine:', freeAiErr);
  }

  // Fallback: Dynamic Smart Blueprint Generator with extensive permutations
  const matchingTemplates = EVENT_TEMPLATES.filter(t => t.targetOrg === targetOrg);
  const base = matchingTemplates.length > 0 
    ? matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)] 
    : EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];

  // Inject customizations
  const dynamicResult = {
    ...base,
    targetOrg,
    theme: `${topic} • ${format}`,
    title: `${targetOrg === 'AWS_SBG' ? 'AWS' : targetOrg === 'GDGOC' ? 'GDGoC' : 'Techno Lab'} ${topic} ${format} 2026`,
    tagline: `Accelerate Your Tech Journey: Hands-on ${topic} Experience at ITMBU`,
    duration: format === 'Hackathon' ? '24-Hour Non-Stop Hackathon' : format === 'Bootcamp' ? '3-Day Masterclass Series' : 'Full-Day Interactive Workshop',
    prerequisites: `Curiosity for ${topic} and basic software logic`,
    overview: `An immersive experiential event hosted for ${targetAudience} focusing on ${topic}. Participants will collaborate in structured squads, deploy practical prototypes, and demonstrate real-world solutions evaluated by faculty mentors and industry experts.`,
    prizesAndOutcomes: [
      `Official ${targetOrg} Letter of Commendation & Digital Credential Badge`,
      `Exclusive cloud infrastructure sandboxes & API credits for top performers`,
      `Direct mentorship and fast-track induction into the 2026 Core Leadership Team`
    ]
  };

  return { success: true, data: dynamicResult, source: 'Smart Club Ideator Engine' };
};

export const DEFAULT_FALLBACK_NEWS = FALLBACK_NEWS;
