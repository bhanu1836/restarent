const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'chef'],
    default: 'chef'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect("mongodb+srv://bhanu:1234@nodeexpress.vkh6d.mongodb.net/dheeraj?retryWrites=true&w=majority&appName=nodeExpress");
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ username: 'dheeraj' });

    if (existingAdmin) {
      console.log('Admin user "dheeraj" already exists, deleting and recreating...');
      await User.deleteOne({ username: 'dheeraj' });
    }

    const admin = new User({
      username: 'dheeraj',
      email: 'r210432@rguktrkv.ac.in',
      password: 'dheeraj123',
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Username: dheeraj');
    console.log('Password: dheeraj123');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
