const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    trim: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: [
      'Organizer',
      'Co-Lead',
      'Core Team Member',
      'Advisor',
      'Admin',
      'Club Head',
      'University Event + Club Coordinator',
      'General Member',
      'Faculty Mentor'
    ],
    default: 'General Member'
  },
  organization: {
    type: String,
    enum: ['AWS_SBG', 'TECHNO_LAB', 'ALL'],
    default: 'AWS_SBG'
  },
  department: {
    type: String,
    default: 'General / Unassigned'
  },
  designation: {
    type: String,
    default: 'General Member (Registered)'
  },
  semester: {
    type: String,
    default: '3'
  },
  branch: {
    type: String,
    default: 'B.Tech CSE'
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  promotedBy: {
    type: String,
    default: null
  },
  promotedAt: {
    type: Date,
    default: null
  },
  emailConfirmed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PENDING_PROMOTION', 'SUSPENDED'],
    default: 'PENDING_PROMOTION'
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
