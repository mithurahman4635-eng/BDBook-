const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ১. ডাটাবেস কানেকশন
const mongoURI = "mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI).then(() => console.log('✅ BDBook Database Connected!'));

// ২. ডাটাবেস মডেল (User & Profile)
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

// ৩. সাইন-আপ (নতুন অ্যাকাউন্ট)
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const newUser = new User({ email, password });
        await newUser.save();
        console.log("🎉 সাইন-আপ সফল:", email);
        res.redirect('/login.html');
    } catch (err) {
        res.send("এই ইমেইল দিয়ে আগে অ্যাকাউন্ট খোলা হয়েছে!");
    }
});

// ৪. লগইন (সফল হলে সরাসরি প্রোফাইল ফর্ম-এ নিয়ে যাবে)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        console.log("✅ লগইন সফল:", email);
        res.redirect(`/userform.html?email=${email}`);
    } else {
        res.send("ইমেইল বা পাসওয়ার্ড ভুল!");
    }
});

// ৫. প্রোফাইল সেভ এবং এডিট (একই রাউটে দুই কাজ)
app.post('/save-profile', async (req, res) => {
    try {
        const { email, name, bio, phone, location } = req.body;
        
        // এখানে ম্যাজিক: ইমেইল দিয়ে খুঁজবে, না থাকলে নতুন বানাবে, থাকলে আপডেট করবে
        const profile = await Profile.findOneAndUpdate(
            { email: email }, 
            { name, bio, phone, location }, 
            { upsert: true, new: true } // upsert মানে হলো না থাকলে নতুন তৈরি করো
        );

        console.log("✅ প্রোফাইল আপডেট/সেভ হয়েছে:", email);
        res.send(`<h1>সাবাস মিঠু ভাই! ডাটা সেভ হয়েছে।</h1><p>নাম: ${profile.name}</p><a href='/userform.html?email=${email}'>আবার এডিট করুন</a>`);
    } catch (err) {
        res.send("ভুল হয়েছে: " + err.message);
    }
});

app.listen(3000, () => console.log('🚀 BDBook রানিং ৩০০০ পোর্টে'));