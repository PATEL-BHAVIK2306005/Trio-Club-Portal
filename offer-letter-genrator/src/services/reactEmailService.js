import emailjs from '@emailjs/browser';
import { supabase } from '../lib/supabaseClient';
import { generateWelcomeAdminEmailHtml } from './welcomeEmailTemplate';

// Email configuration defaults (stored per chapter & master superadmin vault)
export const EMAILJS_CONFIG_KEY = 'offer_gen_emailjs_config';
export const SMTP_MASTER_CONFIG_KEY = 'offer_gen_smtp_master_config';

export function getMasterSmtpConfig() {
  try {
    const saved = localStorage.getItem(SMTP_MASTER_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        awsEmail: parsed.awsEmail || 'aws.itmbu@gmail.com',
        awsAppPassword: parsed.awsAppPassword || parsed.masterAppPassword || process.env.REACT_APP_AWS_EMAIL_PASS || '',
        technoEmail: parsed.technoEmail || 'technolabclub25@gmail.com',
        technoAppPassword: parsed.technoAppPassword || process.env.REACT_APP_TECHNO_EMAIL_PASS || '',
        gdgocEmail: parsed.gdgocEmail || 'gdgoc.itmbu@gmail.com',
        gdgocAppPassword: parsed.gdgocAppPassword || process.env.REACT_APP_GDGOC_EMAIL_PASS || '',
        globalDefaultEmail: parsed.globalDefaultEmail || 'aws.itmbu@gmail.com',
        masterAppPassword: parsed.masterAppPassword || process.env.REACT_APP_MASTER_SMTP_PASS || '',
        serviceId: parsed.serviceId || process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
        templateId: parsed.templateId || process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
        publicKey: parsed.publicKey || process.env.REACT_APP_EMAILJS_PUBLIC_KEY || ''
      };
    }
  } catch (e) {}
  return {
    awsEmail: 'aws.itmbu@gmail.com',
    awsAppPassword: process.env.REACT_APP_AWS_EMAIL_PASS || '',
    technoEmail: 'technolabclub25@gmail.com',
    technoAppPassword: process.env.REACT_APP_TECHNO_EMAIL_PASS || '',
    gdgocEmail: 'gdgoc.itmbu@gmail.com',
    gdgocAppPassword: process.env.REACT_APP_GDGOC_EMAIL_PASS || '',
    globalDefaultEmail: 'aws.itmbu@gmail.com',
    masterAppPassword: process.env.REACT_APP_MASTER_SMTP_PASS || '',
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
    templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || ''
  };
}

export async function saveMasterSmtpConfig(cfg) {
  try {
    localStorage.setItem(SMTP_MASTER_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {}

  // Real-time Cloud Synchronization to Supabase
  try {
    if (supabase) {
      await supabase
        .from('brandings')
        .upsert({
          organization: 'GLOBAL_SMTP',
          config: cfg,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization' });
    }
  } catch (err) {
    console.warn('[Supabase SMTP Sync Notice]:', err?.message || err);
  }
}

export async function fetchMasterSmtpConfigFromSupabase() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('brandings')
        .select('*')
        .eq('organization', 'GLOBAL_SMTP')
        .single();

      if (!error && data?.config) {
        const cloudCfg = data.config;
        const current = getMasterSmtpConfig();
        const merged = { ...current, ...cloudCfg };
        localStorage.setItem(SMTP_MASTER_CONFIG_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('[Supabase SMTP Fetch Notice]:', err?.message || err);
  }
  return getMasterSmtpConfig();
}

export function subscribeToSmtpConfigRealtime(callback) {
  try {
    if (!supabase) return null;
    const channelName = `realtime_smtp_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brandings' },
        (payload) => {
          if (payload.new && payload.new.organization === 'GLOBAL_SMTP' && payload.new.config) {
            const newCfg = payload.new.config;
            const current = getMasterSmtpConfig();
            const merged = { ...current, ...newCfg };
            localStorage.setItem(SMTP_MASTER_CONFIG_KEY, JSON.stringify(merged));
            if (callback) callback(merged);
          }
        }
      )
      .subscribe();
    return channel;
  } catch (err) {
    console.warn('[Supabase SMTP Realtime Notice]:', err?.message || err);
    return null;
  }
}

export function getEmailConfig() {
  const master = getMasterSmtpConfig();
  try {
    const saved = localStorage.getItem(EMAILJS_CONFIG_KEY);
    if (saved) return { ...master, ...JSON.parse(saved) };
  } catch (e) {}
  return master;
}

export async function saveEmailConfig(cfg) {
  localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(cfg));
  await saveMasterSmtpConfig({ ...getMasterSmtpConfig(), ...cfg });
}

/**
 * Direct React Email Service
 * Routes through active delivery engine:
 * 1. Backend Nodemailer API (/api/send-offer-letter) with Chapter-Specific 16-Char App Password & PDF attachment
 * 2. EmailJS Browser SDK (Direct from React)
 * 3. Supabase Dispatch Audit Logging
 */
export async function sendDirectReactEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
  plainText,
  pdfBase64 = null,
  clubConfig,
  letterConfig = {},
  member,
  customNote = ''
}) {
  if (!toEmail || !toEmail.includes('@')) {
    throw new Error('Valid recipient email address is required (e.g. candidate@gmail.com).');
  }

  const smtpMaster = getMasterSmtpConfig();
  let senderEmail = clubConfig?.email;
  let activeAppPass = smtpMaster.masterAppPassword;

  if (clubConfig?.id === 'AWS_SBG') {
    senderEmail = smtpMaster.awsEmail || clubConfig?.email || 'aws.itmbu@gmail.com';
    activeAppPass = smtpMaster.awsAppPassword || smtpMaster.masterAppPassword;
  } else if (clubConfig?.id === 'TECHNO_LAB') {
    senderEmail = smtpMaster.technoEmail || clubConfig?.email || 'technolabclub25@gmail.com';
    activeAppPass = smtpMaster.technoAppPassword || smtpMaster.masterAppPassword;
  } else if (clubConfig?.id === 'GDGOC') {
    senderEmail = smtpMaster.gdgocEmail || clubConfig?.email || 'gdgoc.itmbu@gmail.com';
    activeAppPass = smtpMaster.gdgocAppPassword || smtpMaster.masterAppPassword;
  } else {
    senderEmail = smtpMaster.globalDefaultEmail || clubConfig?.email || 'aws.itmbu@gmail.com';
    activeAppPass = smtpMaster.masterAppPassword;
  }

  const clubName = clubConfig?.name || 'ITMBU Student Community Chapter';
  const refId = member?.letterRefId || letterConfig?.letterRefId || `${clubConfig?.refPrefix || 'OFFER'}-001`;

  const emailjsCfg = getEmailConfig();
  let deliveryMethod = 'Direct Dispatch';
  let isDelivered = false;
  let responseData = null;
  let lastError = null;

  // 1. Try Backend / Vercel Serverless Nodemailer SMTP with Dedicated Chapter App Password & PDF Attachment
  try {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let apiEndpoint = '/api/send-offer-letter';
    if (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('localhost')) {
      apiEndpoint = `${process.env.REACT_APP_API_URL}/send-offer-letter`;
    } else if (isLocalhost) {
      apiEndpoint = 'http://localhost:5000/api/send-offer-letter';
    }

    const backendRes = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: toEmail,
        recipientName: toName || member?.name,
        clubId: clubConfig?.id,
        clubName: clubName,
        senderEmail: senderEmail,
        appPassword: activeAppPass,
        letterRefId: refId,
        roleType: member?.roleType,
        designation: member?.designation || member?.roleType,
        department: member?.department,
        tenure: letterConfig?.tenure || 'Academic Year 2026 – 2027',
        subject: subject,
        htmlBody: htmlContent,
        plainText: plainText,
        pdfBase64: pdfBase64,
        customNote: customNote
      })
    });

    if (backendRes.ok) {
      const json = await backendRes.json();
      responseData = json;
      if (json.success && json.dispatched) {
        deliveryMethod = 'Vercel Serverless Nodemailer';
        isDelivered = true;
      } else if (json.error || json.message) {
        lastError = json.error || json.message;
      }
    } else {
      const errJson = await backendRes.json().catch(() => ({}));
      responseData = errJson;
      lastError = errJson.error || `Server returned HTTP ${backendRes.status}`;
    }
  } catch (backendErr) {
    lastError = backendErr.message || 'Network error communicating with email server';
  }

  // 2. Try EmailJS Browser SDK if configured
  if (!isDelivered && emailjsCfg.serviceId && emailjsCfg.templateId && emailjsCfg.publicKey) {
    try {
      const emailjsRes = await emailjs.send(
        emailjsCfg.serviceId,
        emailjsCfg.templateId,
        {
          to_email: toEmail,
          to_name: toName || member?.name,
          from_email: senderEmail,
          from_name: clubName,
          subject: subject,
          candidate_role: member?.designation || member?.roleType,
          candidate_dept: member?.department || 'Core Team',
          ref_id: refId,
          tenure: letterConfig?.tenure || 'Academic Year 2026 – 2027',
          issue_date: letterConfig?.issueDate || new Date().toLocaleDateString('en-GB'),
          message_html: htmlContent,
          message_plain: plainText,
          custom_note: customNote
        },
        emailjsCfg.publicKey
      );

      if (emailjsRes.status === 200 || emailjsRes.text === 'OK') {
        deliveryMethod = 'EmailJS React Engine';
        isDelivered = true;
        responseData = emailjsRes;
      }
    } catch (ejsErr) {
      console.warn('EmailJS delivery fallback:', ejsErr);
    }
  }

  // 3. Log to Supabase Audit DB & LocalStorage
  const logEntry = {
    id: `disp_${Date.now()}`,
    timestamp: new Date().toISOString(),
    recipient_email: toEmail,
    recipient_name: toName || member?.name,
    organization: clubConfig?.id || 'AWS_SBG',
    sender_email: senderEmail,
    ref_id: refId,
    subject: subject,
    delivery_status: isDelivered ? 'DELIVERED' : 'LOGGED_AND_READY',
    delivery_method: deliveryMethod,
    created_at: new Date().toISOString()
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem('offer_gen_email_logs') || '[]');
    existingLogs.unshift(logEntry);
    localStorage.setItem('offer_gen_email_logs', JSON.stringify(existingLogs.slice(0, 100)));

    if (supabase) {
      await supabase.from('email_dispatches').insert([logEntry]).select();
    }
  } catch (logErr) {
    console.error('Audit log error:', logErr);
  }

  return {
    success: true,
    isDelivered,
    deliveryMethod,
    recipientEmail: toEmail,
    senderEmail: senderEmail,
    refId: refId,
    timestamp: logEntry.timestamp,
    error: lastError,
    data: responseData
  };
}

/**
 * Dispatch 3000-Word Rich HTML Welcome Onboarding & Passkey Email to System Administrators / Users
 */
export async function sendWelcomeOnboardingEmail({
  recipientName,
  recipientEmail,
  username,
  password,
  roleTitle,
  roleBadge,
  clubName = 'AWS Student Builder Group & Techno Lab',
  clubId = 'AWS_SBG',
  scope = 'Dual-Club Universal Governance',
  issuedBy = 'Bhavikkumar Patel (Master Super Administrator)'
}) {
  const htmlContent = generateWelcomeAdminEmailHtml({
    recipientName,
    recipientEmail,
    username,
    password,
    roleTitle,
    roleBadge,
    clubName,
    clubId,
    scope,
    loginUrl: window.location.origin,
    issuedBy
  });

  const plainText = `Official Administrative Onboarding - ITM (sls) Baroda University\n\nDear ${recipientName},\n\nWelcome to the ITMBU Dual-Club Governance Portal. Your administrator account has been provisioned.\n\nUsername: @${username}\nEmail: ${recipientEmail}\nPasskey: ${password}\nRole: ${roleTitle} (${roleBadge})\nScope: ${scope}\n\nLogin at: ${window.location.origin}\n\nITM (sls) Baroda University, Vadodara`;

  return await sendDirectReactEmail({
    toEmail: recipientEmail,
    toName: recipientName,
    subject: `🔐 Official Administrator Access & Onboarding Clearance | ${roleTitle} [${username}]`,
    htmlContent,
    plainText,
    clubConfig: { id: clubId, name: clubName },
    letterConfig: { letterRefId: `ADMIN-ONBOARD-${Date.now().toString().slice(-4)}` },
    member: { name: recipientName, roleType: roleTitle, designation: roleTitle, department: 'Executive Directorate' },
    customNote: 'Official Onboarding Clearance and Security Credentials'
  });
}
