const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ১. বেসিক তথ্য
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // ২. প্রোফাইল ও কভার (ডিজিটাল ফ্রেমসহ)
  profilePic: { type: String, default: 'placeholder.jpg' },
  coverPic: { type: String, default: 'cover-placeholder.jpg' },
  currentFrame: { type: String, default: null }, // শপ থেকে কেনা ফ্রেম
  ownedFrames: [{ type: String }], // যে সব ফ্রেম ইউজার কিনেছে
  
  // ৩. সোশ্যাল লজিক (ফলোয়ার/ফলোয়িং)
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  
  // ৪. পার্সোনাল ডিটেইলস (See More About)
  bio: { type: String, default: 'আপনার বায়ো এখানে দেখা যাবে' },
  location: { type: String, default: '...' },
  relationshipStatus: { type: String, default: '...' },
  gender: { type: String, default: '' },
  dob: { type: String, default: '' },

  // ৫. ওয়ালেট ও পয়েন্ট (PS System)
  psBalance: { type: Number, default: 0 }, // এখান থেকে ফ্রেম কেনা হবে
  
  // ৬. স্টার হিসাব (Star Sender)
  starsReceived: { type: Number, default: 0 },
  starsSent: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);