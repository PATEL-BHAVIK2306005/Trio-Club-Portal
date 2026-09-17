const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  organization: {
    type: String,
    enum: ['AWS_SBG', 'TECHNO_LAB'],
    default: 'AWS_SBG',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  roleType: {
    type: String,
    enum: ['Organizer', 'Co-Organizer', 'Director', 'Co-Lead', 'Head', 'Core Member', 'Student Advisor', 'Faculty Mentor', 'Lead Coordinator'],
    default: 'Core Member'
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  isCoLead: {
    type: Boolean,
    default: false
  },
  semester: {
    type: String,
    default: '3'
  },
  branch: {
    type: String,
    default: 'B.Tech'
  },
  letterRefId: {
    type: String
  },
  issueDate: {
    type: String,
    default: () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  },
  tenure: {
    type: String,
    default: 'Academic Year 2026 – 2027'
  },
  responsibilities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Issued', 'Pending', 'Accepted'],
    default: 'Issued'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
