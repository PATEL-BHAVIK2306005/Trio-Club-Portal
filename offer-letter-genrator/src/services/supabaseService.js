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
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapFromDbMember);
};

// 2. Insert new member
export const insertSupabaseMember = async (member) => {
  const payload = mapToDbMember(member);
  const { data, error } = await supabase
    .from('members')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return mapFromDbMember(data);
};

// 3. Update existing member
export const updateSupabaseMember = async (id, member) => {
  const payload = mapToDbMember(member);
  
  // If id is valid UUID or standard ID
  if (id && id.length > 8 && !id.includes('custom-')) {
    const { data, error } = await supabase
      .from('members')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) return mapFromDbMember(data);
  }

  // Fallback: match by name and organization
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('members')
    .update(payload)
    .eq('name', member.name)
    .eq('organization', member.organization || 'AWS_SBG')
    .select()
    .single();

  if (fallbackError) {
    // If update failed because record doesn't exist yet, insert it
    const { data: insertedData, error: insertError } = await supabase
      .from('members')
      .insert([payload])
      .select()
      .single();
    if (insertError) throw insertError;
    return mapFromDbMember(insertedData);
  }
  return mapFromDbMember(fallbackData);
};

// 4. Delete member
export const deleteSupabaseMember = async (id, name = '', organization = '') => {
  if (id && id.length > 8 && !id.includes('custom-')) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) return true;
  }
  
  // Fallback match by name
  let query = supabase.from('members').delete().eq('name', name);
  if (organization) {
    query = query.eq('organization', organization);
  }
  const { error } = await query;
  if (error) throw error;
  return true;
};

// 4b. Bulk Delete members
export const bulkDeleteSupabaseMembers = async (idsOrNames = []) => {
  if (!idsOrNames || idsOrNames.length === 0) return true;

  const uuids = idsOrNames.filter(id => id && id.length > 8 && !id.includes('custom-'));
  const names = idsOrNames.filter(id => !id || id.length <= 8 || id.includes('custom-'));

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
  // Clear existing
  await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const rows = seedData.map(m => mapToDbMember(m));
  const { data, error } = await supabase
    .from('members')
    .insert(rows)
    .select();

  if (error) throw error;
  return (data || []).map(mapFromDbMember);
};

// 6. Fetch Branding from Supabase
export const fetchSupabaseBranding = async () => {
  const { data, error } = await supabase
    .from('brandings')
    .select('*');

  if (error) throw error;
  return data || [];
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

  const { data, error } = await supabase
    .from('brandings')
    .upsert(payload, { onConflict: 'organization' })
    .select()
    .single();

  if (error) throw error;
  return data;
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
    console.warn('[Supabase Realtime] Subscription initialization warning:', err.message);
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

// 10. Register New User & Send Confirmation Email via Supabase Email Service
export const registerSupabaseUser = async ({
  name,
  email,
  password,
  organization = 'AWS_SBG',
  semester = '3',
  branch = 'B.Tech CSE'
}) => {
  let authResult = null;
  let memberResult = null;

  // 1. Supabase Auth Sign-Up (Triggers Supabase email confirmation)
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: name.trim(),
          organization: organization,
          role_type: 'General Member',
          semester: semester,
          branch: branch
        }
      }
    });
    if (authError) {
      console.warn('Supabase Auth signUp note:', authError.message);
    }
    authResult = authData;
  } catch (authErr) {
    console.warn('Supabase Auth exception:', authErr.message);
  }

  // 2. Insert into 'members' table as General Member
  const newMemberPayload = {
    name: name.trim(),
    department: 'General / Unassigned',
    role_type: 'General Member',
    designation: 'General Member (Registered)',
    is_co_lead: false,
    semester: semester || '3',
    branch: branch || 'B.Tech CSE',
    letter_ref_id: '',
    status: 'Pending Promotion',
    responsibilities: [
      'Participate in official club technical workshops, hackathons, and campus meetups.',
      'Collaborate with core team members on open-source initiatives and developer projects.'
    ],
    organization: organization || 'AWS_SBG',
    updated_at: new Date().toISOString()
  };

  try {
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .insert([newMemberPayload])
      .select()
      .single();

    if (memberError) {
      console.warn('Supabase member insert note:', memberError.message);
      memberResult = mapFromDbMember(newMemberPayload);
    } else {
      memberResult = mapFromDbMember(memberData);
    }
  } catch (err) {
    memberResult = mapFromDbMember(newMemberPayload);
  }

  return {
    success: true,
    auth: authResult,
    member: memberResult
  };
};

