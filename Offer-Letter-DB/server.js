const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Member = require('./models/Member');
const Branding = require('./models/Branding');
const seedMembers = require('./data/seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aws_sbg_itmbu';

// Middleware with high payload limit for base64 image/signature uploads (100MB)
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 100000 }));

// 1. Get all members (optionally filtered by organization, department, search)
app.get('/api/members', async (req, res) => {
  try {
    const { organization, department, search } = req.query;
    let query = {};
    if (organization) {
      query.organization = organization;
    }
    if (department && department !== 'All') {
      query.department = department;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const members = await Member.find(query).sort({ createdAt: 1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get member by ID
app.get('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Update member joining letter details
app.put('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Create new member
app.post('/api/members', async (req, res) => {
  try {
    const newMember = new Member(req.body);
    await newMember.save();
    res.status(201).json({ success: true, data: newMember });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Delete member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Reseed Database endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await Member.deleteMany({});
    const inserted = await Member.insertMany(seedMembers);
    res.json({
      success: true,
      message: `Database reseeded with ${inserted.length} members!`,
      data: inserted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Stats & Departments summary
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const departmentBreakdown = await Member.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, total, departmentBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. BRANDING, LOGOS & SIGNATURE VAULT ROUTES
// ==========================================

// Get all branding configurations or by organization
app.get('/api/branding', async (req, res) => {
  try {
    const { organization } = req.query;
    let query = {};
    if (organization) {
      query.organization = organization;
    }
    const brandings = await Branding.find(query);
    res.json({ success: true, count: brandings.length, data: brandings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get branding for a specific organization (e.g., 'AWS_SBG', 'TECHNO_LAB', 'GLOBAL')
app.get('/api/branding/:organization', async (req, res) => {
  try {
    const org = req.params.organization;
    const branding = await Branding.findOne({ organization: org });
    if (!branding) {
      return res.status(404).json({ success: false, message: `No custom branding found for ${org}` });
    }
    res.json({ success: true, data: branding });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save / Upsert branding for a specific organization
app.post('/api/branding/:organization', async (req, res) => {
  try {
    const org = req.params.organization;
    const {
      itmbuLogo,
      clubLogo,
      organizerSignatureImage,
      advisorSignatureImage,
      mentorSignatureImage,
      config
    } = req.body;

    const updated = await Branding.findOneAndUpdate(
      { organization: org },
      {
        $set: {
          organization: org,
          itmbuLogo,
          clubLogo,
          organizerSignatureImage,
          advisorSignatureImage,
          mentorSignatureImage,
          config,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Branding assets successfully stored in MongoDB Compass for ${org}!`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Image file size is too large. Please upload an image under 50MB.'
    });
  }
  console.error('API Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Connect to MongoDB & Start Server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`AWS SBG ITMBU API Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.warn(`MongoDB connection notice: ${err.message}`);
    console.warn('API Server will still start and serve fallback data when needed.');
    app.listen(PORT, () => {
      console.log(`API Server running on port ${PORT} (MongoDB offline mode)`);
    });
  });
