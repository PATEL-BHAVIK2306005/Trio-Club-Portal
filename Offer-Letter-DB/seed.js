const mongoose = require('mongoose');
require('dotenv').config();
const Member = require('./models/Member');
const seedMembers = require('./data/seedData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aws_sbg_itmbu';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');

    // Clear existing
    const deleteRes = await Member.deleteMany({});
    console.log(`Cleared ${deleteRes.deletedCount} old records.`);

    // Insert all members
    const insertRes = await Member.insertMany(seedMembers);
    console.log(`Successfully seeded ${insertRes.length} core team members into database 'aws_sbg_itmbu'!`);

    console.log('--- Database Seed Summary ---');
    const departments = await Member.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    departments.forEach(dept => {
      console.log(`- ${dept._id}: ${dept.count} members`);
    });

    await mongoose.disconnect();
    console.log('Disconnected cleanly. You can now open MongoDB Compass and inspect the "aws_sbg_itmbu" database!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
