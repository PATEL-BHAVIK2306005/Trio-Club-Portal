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

// 2b. Bulk Insert Multiple Members
export const bulkInsertSupabaseMembers = async (membersList = []) => {
  if (!membersList || membersList.length === 0) return [];
  try {
    const payloads = membersList.map(m => mapToDbMember(m));
    const { data, error } = await supabase
      .from('members')
      .insert(payloads)
      .select();

    if (!error && data && data.length > 0) {
      return data.map(mapFromDbMember);
    }
  } catch (err) {
    console.warn('[Supabase] Bulk Insert notice:', err.message);
  }
  return membersList;
};

// 3. Update existing member with chapter isolation
export const updateSupabaseMember = async (id, member, originalMember = null) => {
  const payload = mapToDbMember(member);
  try {
    // 1. Try updating by Supabase numeric / UUID ID if it's a real DB ID
    const isDbId = id && !String(id).includes('custom') && !String(id).includes('temp') && !String(id).includes('local') && !String(id).includes('aws-') && !String(id).includes('techno-') && !String(id).includes('gdgoc-');
    if (isDbId) {
      const { data, error } = await supabase
        .from('members')
        .update(payload)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) return mapFromDbMember(data[0]);
    }

    // 2. Match by original/current name and organization (isolated per chapter)
    const searchName = (originalMember?.name || member.name || '').trim();
    const org = member.organization || originalMember?.organization || 'AWS_SBG';
    
    if (searchName) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('members')
        .update(payload)
        .eq('name', searchName)
        .eq('organization', org)
        .select();

      if (!fallbackError && fallbackData && fallbackData.length > 0) {
        return mapFromDbMember(fallbackData[0]);
      }
    }

    // 3. If update didn't find the record, insert it
    const { data: insertedData, error: insertErr } = await supabase
      .from('members')
      .insert([payload])
      .select();
    if (!insertErr && insertedData && insertedData.length > 0) {
      return mapFromDbMember(insertedData[0]);
    }
    return { ...member, _id: member._id || id, id: member.id || id };
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

// 11. Official Club Email Service for Sending Offer Letters
export const sendOfferLetterEmailService = async ({
  member,
  clubConfig,
  letterConfig = {},
  recipientEmail,
  senderEmail,
  customNote = ''
}) => {
  const activeClub = clubConfig || {
    name: 'AWS Student Builder Group',
    shortName: 'AWS SBG',
    email: 'aws.itmbu@gmail.com',
    primaryColor: '#ff9900'
  };

  const targetEmail = recipientEmail || member.email || '';
  const fromEmail = senderEmail || activeClub.email || 'aws.itmbu@gmail.com';
  const refId = member.letterRefId || letterConfig.letterRefId || `OFFER-${member._id?.substring(0, 5) || '001'}`;
  const tenure = letterConfig.tenure || 'Academic Year 2026 – 2027';
  const issueDate = letterConfig.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const subject = `Official Appointment & Joining Letter | ${activeClub.name} • ITMBU [Ref: ${refId}]`;

  // HTML Email Body Template
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0c1322; color: #e2e8f0; margin: 0; padding: 20px; }
    .email-container { max-width: 620px; margin: 0 auto; background: #131d33; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
    .header-bar { background: linear-gradient(135deg, ${activeClub.primaryColor || '#ff9900'} 0%, #1e293b 100%); padding: 24px; text-align: center; }
    .header-title { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .header-sub { color: rgba(255,255,255,0.85); font-size: 12px; margin-top: 6px; }
    .body-content { padding: 28px 24px; line-height: 1.6; }
    .greeting { font-size: 16px; font-weight: 700; color: #ffffff; }
    .details-box { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
    .detail-label { color: #94a3b8; font-weight: 600; }
    .detail-val { color: #ffffff; font-weight: 700; }
    .custom-note { background: rgba(56, 189, 248, 0.1); border-left: 3px solid #38bdf8; padding: 10px 14px; margin: 16px 0; font-size: 13px; color: #bae6fd; }
    .responsibilities-box { margin: 16px 0; }
    .responsibilities-box ul { padding-left: 20px; margin: 8px 0; font-size: 12.5px; color: #cbd5e1; }
    .footer-bar { background: #0b1120; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }
    .official-badge { display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-size: 11px; font-weight: 800; border-radius: 20px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-bar">
      <div class="header-title">${activeClub.name.toUpperCase()}</div>
      <div class="header-sub">ITM (sls) Baroda University • Department of Computer Science & Engineering</div>
    </div>
    <div class="body-content">
      <div class="official-badge">✓ OFFICIALLY VERIFIED APPOINTMENT</div>
      <p class="greeting">Dear ${member.name},</p>
      <p>Congratulations! On behalf of <strong>${activeClub.name}</strong> and <strong>ITM (sls) Baroda University</strong>, we are pleased to present your official appointment and joining credentials.</p>
      
      ${customNote ? `<div class="custom-note"><strong>Chapter Note:</strong> ${customNote}</div>` : ''}

      <div class="details-box">
        <div class="detail-row"><span class="detail-label">Candidate Name:</span><span class="detail-val">${member.name}</span></div>
        <div class="detail-row"><span class="detail-label">Designation:</span><span class="detail-val" style="color: ${activeClub.primaryColor || '#38bdf8'}">${member.designation || member.roleType}</span></div>
        <div class="detail-row"><span class="detail-label">Department / Wing:</span><span class="detail-val">${member.department || 'Core Team'}</span></div>
        <div class="detail-row"><span class="detail-label">Reference Number:</span><span class="detail-val">${refId}</span></div>
        <div class="detail-row"><span class="detail-label">Academic Tenure:</span><span class="detail-val">${tenure}</span></div>
        <div class="detail-row"><span class="detail-label">Date of Issuance:</span><span class="detail-val">${issueDate}</span></div>
      </div>

      ${member.responsibilities && member.responsibilities.length > 0 ? `
        <div class="responsibilities-box">
          <strong style="color: #ffffff; font-size: 13px;">Key Scope of Responsibilities:</strong>
          <ul>
            ${member.responsibilities.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
        This document serves as your verified appointment confirmation. For any inquiries or administrative updates, please reach out to the official chapter desk at <a href="mailto:${fromEmail}" style="color: #38bdf8;">${fromEmail}</a>.
      </p>
      
      <p style="margin-top: 24px; font-size: 13px; color: #ffffff;">
        Warm regards,<br/>
        <strong>${activeClub.name} Leadership Team</strong><br/>
        <span style="color: #94a3b8; font-size: 12px;">Department of Computer Science & Engineering<br/>ITM (sls) Baroda University, Vadodara</span>
      </p>
    </div>
    <div class="footer-bar">
      &copy; 2026 ${activeClub.name} • ITM (sls) Baroda University • All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  // 1. Try sending via Backend API Endpoint (Nodemailer / SMTP)
  let apiSuccess = false;
  try {
    const apiUrl = process.env.REACT_APP_API_URL 
      || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');
    const response = await fetch(`${apiUrl}/send-offer-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: targetEmail,
        recipientName: member.name,
        clubId: activeClub.id || 'AWS_SBG',
        clubName: activeClub.name,
        senderEmail: fromEmail,
        letterRefId: refId,
        roleType: member.roleType,
        designation: member.designation,
        department: member.department,
        tenure: tenure,
        subject: subject,
        htmlBody: htmlBody
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        apiSuccess = true;
      }
    }
  } catch (apiErr) {
    console.warn('[Email Service] API server endpoint notice:', apiErr.message);
  }

  // 2. Log dispatch record in Supabase / Local Storage
  const dispatchRecord = {
    member_id: member.id || member._id,
    member_name: member.name,
    recipient_email: targetEmail,
    sender_email: fromEmail,
    club_id: activeClub.id || 'AWS_SBG',
    ref_id: refId,
    status: apiSuccess ? 'DELIVERED_VIA_SMTP' : 'PREPARED_FOR_DISPATCH',
    timestamp: new Date().toISOString()
  };

  try {
    await supabase.from('email_dispatches').insert([dispatchRecord]);
  } catch (dbErr) {
    console.warn('[Email Service] Supabase log notice:', dbErr.message);
  }

  // Also cache in localStorage for instant offline access
  const existingLogs = JSON.parse(localStorage.getItem('offer_email_logs') || '[]');
  existingLogs.unshift(dispatchRecord);
  localStorage.setItem('offer_email_logs', JSON.stringify(existingLogs.slice(0, 50)));

  return {
    success: true,
    apiSuccess: apiSuccess,
    subject: subject,
    htmlBody: htmlBody,
    senderEmail: fromEmail,
    recipientEmail: targetEmail,
    refId: refId
  };
};

// 12. Realtime Cloud Admin Users Synchronization (Multi-Device Support)
export const fetchCloudAdminUsers = async (defaultUsers = []) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .eq('organization', 'GLOBAL_ADMIN_USERS')
        .single();

      if (!error && data?.config && Array.isArray(data.config) && data.config.length > 0) {
        localStorage.setItem('offer_gen_admin_users', JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (err) {
    console.warn('[Supabase Cloud Admin Fetch Notice]:', err?.message || err);
  }
  const localSaved = localStorage.getItem('offer_gen_admin_users');
  return localSaved ? JSON.parse(localSaved) : defaultUsers;
};

export const saveCloudAdminUsers = async (adminUsersList) => {
  try {
    localStorage.setItem('offer_gen_admin_users', JSON.stringify(adminUsersList));
    if (supabase) {
      await supabase
        .from('brandings')
        .upsert({
          organization: 'GLOBAL_ADMIN_USERS',
          config: adminUsersList,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization' });
    }
  } catch (err) {
    console.warn('[Supabase Cloud Admin Save Notice]:', err?.message || err);
  }
};

export const subscribeToCloudAdminUsers = (onChangeCallback) => {
  try {
    if (!supabase) return null;
    const channelName = `realtime_admin_users_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brandings' },
        (payload) => {
          if (payload.new && payload.new.organization === 'GLOBAL_ADMIN_USERS' && Array.isArray(payload.new.config)) {
            const cloudUsers = payload.new.config;
            localStorage.setItem('offer_gen_admin_users', JSON.stringify(cloudUsers));
            if (onChangeCallback) {
              onChangeCallback(cloudUsers);
            }
          }
        }
      )
      .subscribe();
    return channel;
  } catch (err) {
    console.warn('[Supabase Admin Users Realtime Notice]:', err?.message || err);
    return null;
  }
};

// 12. Supabase Treasurer & Finance Master Ledger Synchronizer
export const fetchCloudFinanceData = async (defaultData) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .eq('organization', 'GLOBAL_FINANCE_LEDGER')
        .single();

      if (!error && data?.config && typeof data.config === 'object') {
        localStorage.setItem('itmbu_finance_master_data', JSON.stringify(data.config));
        return { data: data.config, connected: true };
      } else if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
        // Seed initial row to Supabase
        await supabase
          .from('brandings')
          .upsert({
            organization: 'GLOBAL_FINANCE_LEDGER',
            config: defaultData,
            updated_at: new Date().toISOString()
          }, { onConflict: 'organization' });
        return { data: defaultData, connected: true };
      }
    }
  } catch (err) {
    console.warn('[Supabase Cloud Finance Fetch Notice]:', err?.message || err);
  }
  const localSaved = localStorage.getItem('itmbu_finance_master_data');
  return { 
    data: localSaved ? JSON.parse(localSaved) : defaultData, 
    connected: Boolean(supabase) 
  };
};

export const saveCloudFinanceData = async (financeData) => {
  try {
    localStorage.setItem('itmbu_finance_master_data', JSON.stringify(financeData));
    if (supabase) {
      const { error } = await supabase
        .from('brandings')
        .upsert({
          organization: 'GLOBAL_FINANCE_LEDGER',
          config: financeData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization' });
      if (error) throw error;
      return true;
    }
  } catch (err) {
    console.warn('[Supabase Cloud Finance Save Notice]:', err?.message || err);
    return false;
  }
  return true;
};

export const subscribeToCloudFinanceData = (onChangeCallback) => {
  try {
    if (!supabase) return null;
    const channelName = `realtime_finance_ledger_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brandings' },
        (payload) => {
          if (payload.new && payload.new.organization === 'GLOBAL_FINANCE_LEDGER' && payload.new.config) {
            const cloudFinance = payload.new.config;
            localStorage.setItem('itmbu_finance_master_data', JSON.stringify(cloudFinance));
            if (onChangeCallback) {
              onChangeCallback(cloudFinance);
            }
          }
        }
      )
      .subscribe();
    return channel;
  } catch (err) {
    console.warn('[Supabase Finance Realtime Notice]:', err?.message || err);
    return null;
  }
};

