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

// সাইন-আপ পোস্ট মেথড (অটো রিডাইরেক্ট সহ)
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.send("<h1>ইমেইল বা পাসওয়ার্ড পাওয়া যায়নি!</h1>");
        }

        console.log("📩 নতুন ইউজার আসছে:", email);

        const newUser = new User({ email, password });
        
        // ১. ডাটাবেসে সেভ হওয়া পর্যন্ত অপেক্ষা করবে
        await newUser.save(); 
        
        console.log("🎉 অভিনন্দন মিঠু ভাই! ডাটা সেভ হয়েছে।");

        // ২. সেভ হওয়ার পর অটোমেটিক লগইন পেজে পাঠিয়ে দেবে
        res.redirect('/login.html'); 

    } catch (err) {
        console.log("❌ এরর:", err.message);
        if (err.code === 11000) {
            return res.send("<h1>এই জিমেইল আগে থেকেই আছে!</h1>");
        }
        res.status(500).send("ভুল হয়েছে: " + err.message);
    }
});

// লগইন পেজ দেখার জন্য
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// লগইন পোস্ট মেথড (ডাটাবেস চেক করবে)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🔑 লগইন করার চেষ্টা করছেন:", email);

        // ১. ডাটাবেসে এই ইমেইলটা আছে কি না দেখা
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.send("<h1>মিঠু ভাই, এই ইমেইল তো পাওয়া যায়নি! আগে সাইন-আপ করুন।</h1>");
        }

        // ২. পাসওয়ার্ড মিলছে কি না দেখা
        if (user.password === password) {
            console.log("✅ লগইন সফল হয়েছে!");
            
            // ৩. পাসওয়ার্ড মিললে নেক্সট পেজে পাঠিয়ে দাও
            // এখানে আপনার ড্যাশবোর্ড বা হোম পেজের নাম দিন (যেমন: dashboard.html)
            res.redirect('/home.html'); 
            
        } else {
            res.send("<h1>পাসওয়ার্ড ভুল হয়েছে! আবার চেষ্টা করুন।</h1>");
        }

    } catch (err) {
        console.log("❌ লগইন এরর:", err.message);
        res.status(500).send("সার্ভারে সমস্যা: " + err.message);
    }
});
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BDBook সার্ভার চলছে http://localhost:${PORT}`);
});