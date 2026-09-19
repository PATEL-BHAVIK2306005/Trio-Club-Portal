const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS Headers for cross-origin or same-origin calls
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const {
      recipientEmail,
      recipientName,
      clubId,
      clubName,
      senderEmail,
      letterRefId,
      roleType,
      designation,
      department,
      tenure,
      subject,
      htmlBody,
      plainText,
      pdfBase64,
      customNote
    } = req.body || {};

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid recipient email is required' });
    }

    // Determine official club sender & credentials
    // Universal Fallback Master Credentials (from local verified config)
    const MASTER_DEFAULT_USER = 'aws.itmbu@gmail.com';
    const MASTER_DEFAULT_PASS = 'uopdivcccgwkhwgl';

    const clientPass = (req.body?.appPassword || '').replace(/\s+/g, '');
    const masterPass = clientPass || process.env.AWS_EMAIL_PASS || process.env.EMAIL_PASS || process.env.SMTP_PASS || MASTER_DEFAULT_PASS;
    const masterUser = process.env.AWS_EMAIL_USER || process.env.EMAIL_USER || MASTER_DEFAULT_USER;

    let officialSender = '';
    let authUser = '';
    let authPass = '';

    if (clubId === 'AWS_SBG') {
      officialSender = senderEmail || 'aws.itmbu@gmail.com';
      authUser = process.env.AWS_EMAIL_USER || officialSender || masterUser;
      authPass = clientPass || process.env.AWS_EMAIL_PASS || masterPass;
    } else if (clubId === 'TECHNO_LAB') {
      officialSender = senderEmail || 'technolabclub25@gmail.com';
      authUser = process.env.TECHNO_EMAIL_USER || officialSender || masterUser;
      authPass = clientPass || process.env.TECHNO_EMAIL_PASS || masterPass;
    } else if (clubId === 'GDGOC') {
      officialSender = senderEmail || 'gdgoc.itmbu@gmail.com';
      authUser = process.env.GDGOC_EMAIL_USER || officialSender || masterUser;
      authPass = clientPass || process.env.GDGOC_EMAIL_PASS || masterPass;
    } else {
      officialSender = senderEmail || masterUser;
      authUser = officialSender || masterUser;
      authPass = clientPass || masterPass;
    }

    const emailSubject = subject || `Official Appointment & Joining Letter | ${clubName || 'ITMBU Student Chapter'} [${letterRefId || '2026'}]`;

    // Prepare PDF attachment if base64 provided
    const attachments = [];
    if (pdfBase64) {
      try {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;.*?base64,/, '').replace(/^data:.*?;base64,/, '');
        const pdfBuffer = Buffer.from(cleanBase64, 'base64');
        const safeName = (recipientName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
        attachments.push({
          filename: `Official_Joining_Letter_${safeName}_${letterRefId || '2026'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
      } catch (pdfErr) {
        console.warn('[Vercel Serverless PDF Attachment Buffer Warning]:', pdfErr.message);
      }
    }

    if (!authPass) {
      return res.status(200).json({
        success: true,
        dispatched: false,
        message: 'No Gmail App Password configured in Vercel Environment Variables or SuperAdmin Vault.',
        sender: authUser || officialSender,
        recipient: recipientEmail,
        timestamp: new Date().toISOString()
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: authUser,
        pass: authPass.replace(/\s+/g, '') // sanitize 16-char app password spaces
      }
    });

    const mailOptions = {
      from: `"${clubName || 'ITMBU Student Chapter'}" <${authUser}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: plainText,
      html: htmlBody,
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      dispatched: true,
      message: `Offer Letter email successfully delivered to ${recipientEmail} from ${authUser}`,
      messageId: info.messageId,
      sender: authUser,
      recipient: recipientEmail,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Vercel Nodemailer Error:', err);
    return res.status(500).json({
      success: false,
      dispatched: false,
      error: err.message || 'Internal Server Error'
    });
  }
};
