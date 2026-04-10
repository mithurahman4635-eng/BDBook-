const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ডাটা পড়ার মিডলওয়্যার
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ১. ডাটাবেস লিঙ্ক
const mongoURI = "mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority"; 

mongoose.connect(mongoURI)
    .then(() => console.log('✅ BDBook ডাটাবেসে সফলভাবে কানেক্ট হয়েছে।'))
    .catch(err => console.log('❌ ডাটাবেস কানেকশনে ভুল:', err.message));

// ইউজার স্কিমা
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// হোম পেজ (সাইন-আপ)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// সাইন-আপ পোস্ট মেথড
app.post('/signup', async (req, res) => {
    console.log("------------------------------------");
    console.log("📢 নতুন রিকোয়েস্ট এসেছে!");
    
    try {
        const { email, password } = req.body;
        
        // নতুন ইউজার তৈরি
        const newUser = new User({ email, password });
        
        // ডাটাবেসে সেভ করা
        await newUser.save();
        
        console.log("✅ অভিনন্দন মিঠু ভাই! ডাটাবেসে সেভ হয়েছে:", email);
        // সেভ হওয়ার পর আপনি চাইলে সরাসরি লগইন পেজে পাঠাতে পারেন
        res.status(201).send("<h1>সাবাস মিঠু ভাই! নতুন ডাটা সেভ হয়েছে।</h1><br><a href='/login.html'>লগইন করতে এখানে ক্লিক করুন</a>");
        
    } catch (err) {
        console.log("❌ ডাটা সেভ হয়নি!");
        console.log("🔍 আসল কারণ হলো:", err.message);

        if (err.code === 11000) {
            return res.send("<h1>এই ইমেইলটি আগে থেকেই আছে। অন্য ইমেইল দিন।</h1>");
        }
        res.status(500).send("সার্ভার এরর: " + err.message);
    }
    console.log("------------------------------------");
});

// লগইন পেজ দেখার জন্য
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BDBook সার্ভার চলছে http://localhost:${PORT}`);
});