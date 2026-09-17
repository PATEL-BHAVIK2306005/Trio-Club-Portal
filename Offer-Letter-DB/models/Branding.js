const mongoose = require('mongoose');

const BrandingSchema = new mongoose.Schema({
  organization: {
    type: String, // 'GLOBAL', 'AWS_SBG', 'TECHNO_LAB'
    required: true,
    unique: true
  },
  itmbuLogo: {
    type: String, // base64 or URL
    default: null
  },
  clubLogo: {
    type: String, // base64 or URL
    default: null
  },
  organizerSignatureImage: {
    type: String,
    default: null
  },
  advisorSignatureImage: {
    type: String,
    default: null
  },
  mentorSignatureImage: {
    type: String,
    default: null
  },
  config: {
    organizerName: String,
    organizerTitle: String,
    organizerOrg: String,
    advisorName: String,
    advisorTitle: String,
    advisorOrg: String,
    mentorName: String,
    mentorTitle: String,
    mentorOrg: String,
    contactEmail: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Branding', BrandingSchema);
