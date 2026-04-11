const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ==========================================
// ১. সেটিংস ও মিডলওয়্যার (এখানে হাত দেওয়ার দরকার নেই)
// ==========================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

const mongoURI = "mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI).then(() => console.log('✅ BDBook Database Connected!'));

// ==========================================
// ২. ডাটাবেস মডেল (নতুন টেবিল লাগলে এখানে বাড়াবেন)
// ==========================================
const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const Profile = mongoose.model('Profile', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    bio: String,
    phone: String,
    location: String
}));

// ==========================================
// ৩. মেইন রাউটস (সাইন-আপ ও লগইন)
// ==========================================
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const newUser = new User({ email, password });
        await newUser.save();
        res.redirect('/login.html');
    } catch (err) { res.send("ইমেইলটি আগে ব্যবহার করা হয়েছে!"); }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        res.redirect(`/userfrom.html?email=${email}`); // আপনার ফাইলের বানান অনুযায়ী
    } else {
        res.send("ভুল তথ্য!");
    }
});

// ==========================================
// ৪. প্রোফাইল ম্যানেজমেন্ট (সেভ ও আপডেট)
// ==========================================
app.post('/save-profile', async (req, res) => {
    try {
        const { email, fullname, bio, phone, location } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { email: email }, 
            { name: fullname, bio, phone, location }, 
            { upsert: true, new: true } 
        );
        // প্রোফাইল সেভ হলে তাকে ভিউ পেজে পাঠিয়ে দিচ্ছি
        res.redirect(`/view-profile?email=${email}`);
    } catch (err) { res.send("ভুল: " + err.message); }
});

// ==========================================
// ৫. নতুন ফিচার যোগ করার জায়গা (এখান থেকে নিচে লিখবেন)
// ==========================================

// উদাহরণ: প্রোফাইল দেখার পেজ
app.get('/view-profile', async (req, res) => {
    const profile = await Profile.findOne({ email: req.query.email });
    if (profile) {
        res.send(`<h1>প্রোফাইল: ${profile.name}</h1><p>বায়ো: ${profile.bio}</p><a href="/userfrom.html?email=${profile.email}">এডিট করুন</a>`);
    } else {
        res.send("প্রোফাইল নেই!");
    }
});

// ভবিষ্যতে অন্য কিছু যোগ করতে চাইলে ঠিক এই লাইনের নিচে লিখবেন

// ==========================================
// ৬. সার্ভার স্টার্ট (এটি সবসময় সবার নিচে থাকবে)
// ==========================================
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 সার্ভার চলছে: http://localhost:${PORT}`);
});