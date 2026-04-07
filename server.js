const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path'); // এটি যোগ করা হয়েছে
require('dotenv').config();

const app = express();

// Middleware (ডেটা রিসিভ করার জন্য)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB কানেকশন সেটআপ
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => console.log("🔥 MongoDB connected successfully!"))
  .catch(err => console.log("❌ Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- এই অংশটুকু আপনার কোডে ছিল না ---
// ইউজার যখন আপনার লিংকে ঢুকবে, তখন তাকে singup.html ফাইলটি দেখাবে
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'singup.html'));
});
// ----------------------------------

// সাইন-আপ রাউট (ফর্ম সাবমিট করলে এখানে আসবে)
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // পাসওয়ার্ড হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email: email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).send(`
        <div style="text-align:center; margin-top:50px; font-family: Arial;">
            <h1 style="color:green;">অভিনন্দন!</h1>
            <p>আপনার Gmail (${email}) সফলভাবে MongoDB-তে সেভ হয়েছে।</p>
            <a href="/">আবার ফিরে যান</a>
        </div>
    `);
    
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send("এই ইমেইলটি অলরেডি আমাদের ডাটাবেসে আছে!");
    } else {
      res.status(500).send("সার্ভারে সমস্যা হয়েছে।");
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});app.get('/', (req, res) => { res.send('BDBook Server is Running Successfully'); });
