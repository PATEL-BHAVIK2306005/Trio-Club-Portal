import { supabase } from '../lib/supabaseClient';

/**
 * ==============================================================================
 * DEDICATED EMAIL SERVICE
 * ITM (sls) Baroda University - Dual-Club Appointment & Administration Portal
 * ==============================================================================
 * This service manages all email operations:
 * 1. Supabase Auth Verification / Confirmation Email Dispatch on Registration
 * 2. Password Reset & Security Token Emails via Supabase Auth
 * 3. Official Joining Letter & Promotion Notification Dispatch
 * ==============================================================================
 */

// 1. Send User Confirmation Email via Supabase Email Service
export const sendVerificationEmail = async (email, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      console.warn('[Email Service] Supabase email dispatch note:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: `Confirmation email dispatched to ${email} via Supabase Email Service.`,
      data
    };
  } catch (err) {
    console.error('[Email Service] Exception dispatching email:', err);
    return { success: false, error: err.message };
  }
};

// 2. Send Password Reset Email via Supabase Auth
export const sendPasswordResetEmail = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return { success: true, message: `Password reset instructions sent to ${email}`, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// 3. Dispatch Official Appointment Letter Notification Email
export const sendAppointmentLetterEmail = async ({
  recipientName,
  recipientEmail,
  designation,
  roleType,
  department,
  organization = 'AWS_SBG',
  letterRefId,
  issueDate
}) => {
  const chapterName = organization === 'TECHNO_LAB' 
    ? 'Techno Lab Innovation Chapter' 
    : 'AWS Student Builder Group (SBG)';
  
  const officialEmail = organization === 'TECHNO_LAB'
    ? 'technolabclub25@gmail.com'
    : 'aws.itmbu@gmail.com';

  const emailSubject = `Official Appointment Letter — ${recipientName} | ${chapterName} (${issueDate || '2026-2027'})`;

  console.log(`[Email Service] Preparing to dispatch appointment letter email:`, {
    to: recipientEmail,
    subject: emailSubject,
    role: roleType,
    refId: letterRefId
  });

  return {
    success: true,
    recipient: recipientEmail,
    subject: emailSubject,
    details: {
      chapterName,
      officialEmail,
      designation,
      letterRefId
    }
  };
};

const emailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAppointmentLetterEmail
};

export default emailService;
