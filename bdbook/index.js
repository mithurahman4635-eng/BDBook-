const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ডাটা পড়ার জন্য মিডলওয়্যার (খুবই জরুরি)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// index.js এর ১৮ নম্বর লাইনের দিকে এটি ঠিক করুন
const mongoURI = "mongodb+srv://mithu:<mithulamiya>@cluster0.yujofyv.mongodb.net/?appName=Cluster0"; 

mongoose.connect(mongoURI)
    .then(() => console.log('✅ BDBook ডাটাবেসে সফলভাবে কানেক্ট হয়েছে।'))
    .catch(err => console.log('❌ ডাটাবেস এরর:', err));

// ইউজার স্কিমা
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// পেজ দেখানোর রাউটস
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// সাইন-আপ ডাটা সেভ করার আসল জায়গা
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    
    // ১. চেক করা টার্মিনালে ডাটা আসছে কি না
    console.log("📩 সার্ভারে আসা ডাটা:", email);

    try {
        const newUser = new User({ email, password });
        
        // ২. আগে সেভ হওয়ার জন্য অপেক্ষা করবে
        await newUser.save();
        console.log("✅ ডাটাবেসে সেভ সফল হয়েছে: " + email);
        
        // ৩. সেভ হওয়ার পরেই কেবল লগইন পেজে পাঠাবে
        res.redirect('/login');
    } catch (err) {
        console.log("❌ সেভ করতে সমস্যা:", err.message);
        res.status(500).send("ডাটাবেসে সেভ হয়নি। ভুল: " + err.message);
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 সার্ভার চলছে http://localhost:${PORT} এ`);
});