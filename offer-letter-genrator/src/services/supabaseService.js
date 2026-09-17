import { supabase } from '../lib/supabaseClient';

// Helper to convert from Supabase DB row to JS member model
export const mapFromDbMember = (row) => ({
  _id: row.id?.toString() || row._id || '',
  id: row.id?.toString() || row._id || '',
  name: row.name || '',
  email: row.email || (row.name ? `${row.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in` : ''),
  department: row.department || 'General',
  roleType: row.role_type || row.roleType || 'Core Member',
  designation: row.designation || '',
  isCoLead: Boolean(row.is_co_lead ?? row.isCoLead),
  semester: row.semester || '3',
  branch: row.branch || 'B.Tech CSE',
  letterRefId: row.letter_ref_id || row.letterRefId || '',
  status: row.status || 'Issued',
  responsibilities: Array.isArray(row.responsibilities) 
    ? row.responsibilities 
    : (typeof row.responsibilities === 'string' 
        ? (() => { try { return JSON.parse(row.responsibilities); } catch (e) { return [row.responsibilities]; } })() 
        : []),
  organization: row.organization || 'AWS_SBG',
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// Helper to convert from JS member model to Supabase DB payload
export const mapToDbMember = (member) => {
  const payload = {
    name: member.name,
    email: member.email || (member.name ? `${member.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@itmbu.ac.in` : null),
    department: member.department || 'General',
    role_type: member.roleType || 'Core Member',
    designation: member.designation || '',
    is_co_lead: Boolean(member.isCoLead),
    semester: member.semester || '3',
    branch: member.branch || 'B.Tech CSE',
    letter_ref_id: member.letterRefId || '',
    status: member.status || 'Issued',
    responsibilities: Array.isArray(member.responsibilities) ? member.responsibilities : [],
    organization: member.organization || 'AWS_SBG',
    updated_at: new Date().toISOString()
  };
  return payload;
};

// 1. Fetch all members from Supabase
export const fetchSupabaseMembers = async () => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase] Fetch notice:', error.message);
      return [];
    }
    return (data || []).map(mapFromDbMember);
  } catch (err) {
    console.warn('[Supabase] Fetch catch:', err.message);
    return [];
  }
};

// 2. Insert new member (Bulletproof Upsert with Auto-Fallback)
export const insertSupabaseMember = async (member) => {
  const payload = mapToDbMember(member);
  try {
    const { data, error } = await supabase
      .from('members')
      .insert([payload])
      .select();

    if (error) {
      console.warn('[Supabase] Insert notice:', error.message);
      return { ...member, _id: member._id || `local-${Date.now()}` };
    }
    if (data && data.length > 0) {
      return mapFromDbMember(data[0]);
    }
    return { ...member, _id: member._id || `local-${Date.now()}` };
  } catch (err) {
    console.warn('[Supabase] Insert catch:', err.message);
    return { ...member, _id: member._id || `local-${Date.now()}` };
  }
};

// 3. Update existing member
export const updateSupabaseMember = async (id, member) => {
  const payload = mapToDbMember(member);
  try {
    if (id && id.length > 8 && !String(id).includes('custom') && !String(id).includes('temp') && !String(id).includes('local')) {
      const { data, error } = await supabase
        .from('members')
        .update(payload)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) return mapFromDbMember(data[0]);
    }

    // Fallback: match by name and organization
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('members')
      .update(payload)
      .eq('name', member.name)
      .eq('organization', member.organization || 'AWS_SBG')
      .select();

    if (!fallbackError && fallbackData && fallbackData.length > 0) {
      return mapFromDbMember(fallbackData[0]);
    }

    // If update didn't find the record, insert it
    const { data: insertedData } = await supabase
      .from('members')
      .insert([payload])
      .select();
    if (insertedData && insertedData.length > 0) {
      return mapFromDbMember(insertedData[0]);
    }
    return member;
  } catch (err) {
    console.warn('[Supabase] Update notice:', err.message);
    return member;
  }
};

// 4. Delete member
export const deleteSupabaseMember = async (id, name = '', organization = '') => {
  try {
    if (id && id.length > 8 && !String(id).includes('custom') && !String(id).includes('temp') && !String(id).includes('local')) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (!error) return true;
    }
    
    // Fallback match by name
    let query = supabase.from('members').delete().eq('name', name);
    if (organization) {
      query = query.eq('organization', organization);
    }
    const { error } = await query;
    if (error) console.warn('[Supabase] Delete notice:', error.message);
    return true;
  } catch (err) {
    return true;
  }
};

// 4b. Bulk Delete members
export const bulkDeleteSupabaseMembers = async (idsOrNames = []) => {
  if (!idsOrNames || idsOrNames.length === 0) return true;

  const uuids = idsOrNames.filter(id => id && id.length > 8 && !String(id).includes('custom') && !String(id).includes('temp') && !String(id).includes('local'));
  const names = idsOrNames.filter(id => !id || id.length <= 8 || String(id).includes('custom') || String(id).includes('temp') || String(id).includes('local'));

  if (uuids.length > 0) {
    try {
      await supabase.from('members').delete().in('id', uuids);
    } catch (e) {}
  }

  if (names.length > 0) {
    try {
      await supabase.from('members').delete().in('name', names);
    } catch (e) {}
  }

  return true;
};

// 5. Seed default members into Supabase
export const seedSupabaseMembers = async (seedData) => {
  try {
    // Clear existing
    await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const rows = seedData.map(m => mapToDbMember(m));
    const { data, error } = await supabase
      .from('members')
      .insert(rows)
      .select();

    if (error) {
      console.warn('[Supabase] Seed notice:', error.message);
      return seedData;
    }
    return (data || []).map(mapFromDbMember);
  } catch (err) {
    console.warn('[Supabase] Seed catch:', err.message);
    return seedData;
  }
};

// 6. Fetch Branding from Supabase
export const fetchSupabaseBranding = async () => {
  try {
    const { data, error } = await supabase
      .from('brandings')
      .select('*');

    if (error) return [];
    return data || [];
  } catch (e) {
    return [];
  }
};

// 7. Save / Upsert Branding in Supabase
export const saveSupabaseBranding = async (org, brandingData) => {
  const payload = {
    organization: org,
    itmbu_logo: brandingData.itmbuLogo || null,
    club_logo: brandingData.clubLogo || null,
    organizer_signature: brandingData.organizerSignatureImage || null,
    advisor_signature: brandingData.advisorSignatureImage || null,
    mentor_signature: brandingData.mentorSignatureImage || null,
    config: brandingData.config || {},
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('brandings')
      .upsert(payload, { onConflict: 'organization' })
      .select();

    if (error) {
      console.warn('[Supabase] Branding upsert notice:', error.message);
      return payload;
    }
    return data?.[0] || payload;
  } catch (e) {
    return payload;
  }
};

// 8. Real-time Subscription for Live Multi-Device Sync
export const subscribeToSupabaseMembers = (onChangeCallback) => {
  try {
    const channelName = `realtime_members_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          if (onChangeCallback) {
            onChangeCallback({
              eventType: payload.eventType,
              newRecord: payload.new ? mapFromDbMember(payload.new) : null,
              oldRecord: payload.old ? mapFromDbMember(payload.old) : null,
              raw: payload
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Supabase Realtime] Members channel status: ${status}`);
      });

    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Subscription warning:', err.message);
    return null;
  }
};

// 9. Real-time Subscription for Branding changes
export const subscribeToSupabaseBranding = (onChangeCallback) => {
  try {
    const channelName = `realtime_branding_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brandings' },
        (payload) => {
          if (onChangeCallback) {
            onChangeCallback(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Supabase Realtime] Branding channel status: ${status}`);
      });

    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Branding subscription warning:', err.message);
    return null;
  }
};

// 10. Register user into Supabase users table
export const registerSupabaseUser = async (userData) => {
  try {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      organization: userData.organization || 'AWS_SBG',
      semester: userData.semester || '3',
      branch: userData.branch || 'B.Tech CSE',
      role: 'MEMBER',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([payload])
      .select();

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, data: data?.[0] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
