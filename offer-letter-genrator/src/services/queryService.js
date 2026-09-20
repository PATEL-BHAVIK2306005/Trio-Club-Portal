import { supabase } from '../lib/supabaseClient';

const LOCAL_QUERIES_KEY = 'itmbu_system_queries_v1';

export const INITIAL_QUERIES = [
  {
    id: 'QRY-2026-001',
    title: 'AWS Cloud Practitioner Study Jam & Certificate Distribution Plan',
    category: 'AWS_SBG',
    urgency: 'HIGH',
    status: 'ON_DISCUSS', // 'ON_DISCUSS' | 'IN_PROGRESS' | 'RESOLVED'
    author: {
      name: 'Bhavikkumar Patel',
      role: 'AWS SBG Lead Organizer',
      avatar: '👑',
      email: 'bhavik.itmbu@gmail.com'
    },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    description: 'Finalizing the schedule and roster eligibility for the upcoming AWS Cloud Practitioner certification drive.',
    messages: [
      {
        id: 'msg-1',
        senderName: 'Bhavikkumar Patel',
        senderRole: 'AWS SBG Lead',
        avatar: '👑',
        text: 'Team, please review the candidate shortlist for the upcoming AWS Cloud certification bootcamp before we disburse official offer & appointment letters.',
        image: null,
        timestamp: new Date(Date.now() - 2 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'msg-2',
        senderName: 'Tannvi Acharya',
        senderRole: 'Co-Lead Organizer',
        avatar: '👩‍💻',
        text: 'The department lists for 5th and 7th sem CSE have been verified against the official university attendance records.',
        image: null,
        timestamp: new Date(Date.now() - 1 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  },
  {
    id: 'QRY-2026-002',
    title: 'Techno Lab AI & Robotics Wing Appointment Letters Signature Audit',
    category: 'TECHNO_LAB',
    urgency: 'MEDIUM',
    status: 'IN_PROGRESS',
    author: {
      name: 'Vansham Kamboj',
      role: 'Techno Lab Lead',
      avatar: '⚡',
      email: 'technolabclub25@gmail.com'
    },
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    description: 'Faculty mentor signature confirmation for robotics laboratory appointees.',
    messages: [
      {
        id: 'msg-101',
        senderName: 'Vansham Kamboj',
        senderRole: 'Techno Lab President',
        avatar: '⚡',
        text: 'Uploaded the advisor digital signatures to the branding vault. Please verify the high-res crest alignment on Techno Lab appointment letters.',
        image: null,
        timestamp: 'Yesterday at 04:30 PM'
      }
    ]
  }
];

export function getLocalQueries() {
  try {
    const raw = localStorage.getItem(LOCAL_QUERIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_QUERIES;
}

export function setLocalQueries(queries) {
  try {
    localStorage.setItem(LOCAL_QUERIES_KEY, JSON.stringify(queries));
  } catch (e) {}
}

/**
 * Fetch queries from Supabase (using brandings table with organization = 'SYSTEM_QUERIES' for seamless 0-migration cloud sync)
 */
export async function fetchQueriesFromSupabase() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .eq('organization', 'SYSTEM_QUERIES')
        .single();

      if (!error && data?.config?.queries && Array.isArray(data.config.queries)) {
        setLocalQueries(data.config.queries);
        return data.config.queries;
      }
    }
  } catch (err) {
    console.warn('[Supabase Queries Notice]:', err?.message || err);
  }
  return getLocalQueries();
}

/**
 * Save complete query state to Supabase & LocalStorage
 */
export async function saveAllQueriesToSupabase(queriesList) {
  setLocalQueries(queriesList);
  try {
    if (supabase) {
      await supabase
        .from('brandings')
        .upsert({
          organization: 'SYSTEM_QUERIES',
          config: { queries: queriesList, lastUpdated: new Date().toISOString() },
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization' });
    }
  } catch (err) {
    console.warn('[Supabase Query Upsert Notice]:', err?.message || err);
  }
  return queriesList;
}

/**
 * Add a new query ticket
 */
export async function createNewQuery(newQueryData) {
  const current = await fetchQueriesFromSupabase();
  const newQuery = {
    id: `QRY-${new Date().getFullYear()}-${String(current.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    status: 'ON_DISCUSS',
    messages: [],
    ...newQueryData
  };
  const updated = [newQuery, ...current];
  await saveAllQueriesToSupabase(updated);
  return newQuery;
}

/**
 * Append a chat message (with optional base64 image) to a specific query
 */
export async function addMessageToQuery(queryId, messageObj) {
  const current = await fetchQueriesFromSupabase();
  const updated = current.map(q => {
    if (q.id === queryId) {
      const msgs = Array.isArray(q.messages) ? q.messages : [];
      return {
        ...q,
        messages: [
          ...msgs,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...messageObj
          }
        ]
      };
    }
    return q;
  });
  await saveAllQueriesToSupabase(updated);
  return updated.find(q => q.id === queryId);
}

/**
 * Update Query Status ('ON_DISCUSS' | 'IN_PROGRESS' | 'RESOLVED')
 */
export async function updateQueryStatus(queryId, newStatus) {
  const current = await fetchQueriesFromSupabase();
  const updated = current.map(q => {
    if (q.id === queryId) {
      return { ...q, status: newStatus };
    }
    return q;
  });
  await saveAllQueriesToSupabase(updated);
  return updated.find(q => q.id === queryId);
}

/**
 * Realtime WebSocket listener for query changes
 */
export function subscribeToQueriesRealtime(callback) {
  try {
    if (!supabase) return null;
    const channelName = `realtime_queries_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brandings' },
        (payload) => {
          if (payload.new && payload.new.organization === 'SYSTEM_QUERIES' && payload.new.config?.queries) {
            const freshQueries = payload.new.config.queries;
            setLocalQueries(freshQueries);
            if (callback) callback(freshQueries);
          }
        }
      )
      .subscribe();
    return channel;
  } catch (err) {
    console.warn('[Supabase Queries Realtime Notice]:', err?.message || err);
    return null;
  }
}
