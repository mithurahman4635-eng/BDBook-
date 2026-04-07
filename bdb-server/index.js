const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();

// --- ১. মিডলওয়্যার সেটআপ (Middleware) ---
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- ২. MongoDB কানেকশন ---
const MONGO_URI = 'mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ BDBook ডাটাবেস সফলভাবে কানেক্ট হয়েছে।"))
  .catch(err => console.log("❌ কানেকশনে সমস্যা: ", err));

// --- ৩. ইউজার স্কিমা ও মডেল (Schema & Model) ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- ৪. পেজ দেখানোর রাউট (GET Routes) ---

// হোম পেজে গেলে সরাসরি সাইন-আপ পেজ দেখাবে
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html')); 
});

// সাইন-আপ পেজ দেখার জন্য (localhost:3000/signup)
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// লগইন পেজ দেখার জন্য (localhost:3000/login)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// --- ৫. সাইন-আপ ডাটা সেভ করার লজিক (POST Route) ---
app.post('/signup', async (req, res) => {
    try {
        const newUser = new User({
            email: req.body.email,
            password: req.body.password
        });
        
        // ডাটাবেসে তথ্য সেভ করা
        await newUser.save();
        
        console.log("👤 নতুন ইউজার সেভ হয়েছে: " + req.body.email);
        
        // সেভ হওয়ার পর অটোমেটিক লগইন পেজে পাঠিয়ে দেবে
        res.redirect('/login'); 

    } catch (err) {
        console.log("⚠️ সেভ করতে ভুল হয়েছে:", err.message);
        res.status(500).send("সার্ভারে সমস্যা হয়েছে: " + err.message);
    }
});

// --- ৬. লগইন চেক করার লজিক (Login Logic) ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (user && user.password === password) {
            console.log("🔑 লগইন সফল: " + email);
            // লগইন সাকসেস হলে সরাসরি আপনার ফাইলে পাঠিয়ে দেবে
res.sendFile(__dirname + '/userfrom.html');
        } else {
            res.send("<script>alert('ভুল ইমেইল বা পাসওয়ার্ড!'); window.location.href='/login';</script>");
        }
    } catch (err) {
        res.status(500).send("লগইন এরর: " + err.message);
    }
});

// --- ৭. সার্ভার চালু করা ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 সার্ভার চলছে http://localhost:${PORT} এ`);
});