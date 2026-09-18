import emailjs from '@emailjs/browser';
import { supabase } from '../lib/supabaseClient';

// Email configuration defaults (can be overridden via localStorage or Settings)
const EMAILJS_CONFIG_KEY = 'offer_gen_emailjs_config';

export function getEmailConfig() {
  try {
    const saved = localStorage.getItem(EMAILJS_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
    templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || ''
  };
}

export function saveEmailConfig(cfg) {
  localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(cfg));
}

/**
 * Direct React Email Service
 * Equivalent to ASP.NET System.Net.Mail.SmtpClient.SendAsync()
 * Automatically routes through active delivery engine:
 * 1. EmailJS Browser SDK (Direct from React)
 * 2. Backend Nodemailer API (/api/send-offer-letter)
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

  const senderEmail = clubConfig?.email || 'aws.itmbu@gmail.com';
  const clubName = clubConfig?.name || 'ITMBU Student Community Chapter';
  const refId = member?.letterRefId || letterConfig?.letterRefId || `${clubConfig?.refPrefix || 'OFFER'}-001`;

  const emailjsCfg = getEmailConfig();
  let deliveryMethod = 'Direct Dispatch';
  let isDelivered = false;
  let responseData = null;

  let lastError = null;

  // 1. Try Backend / Vercel Serverless Nodemailer SMTP with PDF Attachment
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
      if (json.success && json.dispatched) {
        deliveryMethod = 'Vercel Serverless Nodemailer';
        isDelivered = true;
        responseData = json;
      } else if (json.error || json.message) {
        lastError = json.error || json.message;
      }
    } else {
      const errJson = await backendRes.json().catch(() => ({}));
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
    data: responseData
  };
}
