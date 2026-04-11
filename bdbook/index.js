const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();

// ==========================================
// ১. সেটিংস ও মিডলওয়্যার
// ==========================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads')); 

// আপনার দেওয়া MongoDB কানেকশন স্ট্রিং
const mongoURI = "mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI).then(() => console.log('✅ BDBook Database Connected!'));

// ছবি সেভ করার লোকেশন কনফিগারেশন
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==========================================
// ২. ডাটাবেস মডেল (User & Profile)
// ==========================================
const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const Profile = mongoose.model('Profile', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    phone: String,
    citizenship: String,
    location: String,
    relationship: String,
    dob: String,
    bio: String,
    profilePic: String 
}));

// ==========================================
// ৩. মেইন রাউটস (Auth)
// ==========================================
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (user) {
        console.log("✅ লগইন সফল:", user.email);
        
        // চেক করা হচ্ছে এই ইমেইল দিয়ে প্রোফাইল অলরেডি তৈরি করা আছে কি না
        const profileExists = await Profile.findOne({ email: user.email });

        if (profileExists) {
            // প্রোফাইল থাকলে সরাসরি প্রোফাইল পেজে যাবে
            res.redirect(`/profile.html?email=${user.email}`);
        } else {
            // প্রোফাইল না থাকলে তাকে ফর্ম পূরণ করতে পাঠানো হবে
            res.redirect(`/userfrom.html?email=${user.email}`); 
        }
    } else { 
        res.send("ভুল তথ্য! আবার চেষ্টা করুন।"); 
    }
});
// ==========================================
// ৪. প্রোফাইল ম্যানেজমেন্ট (ছবিসহ সেভ ও আপডেট)
// ==========================================
app.post('/save-profile', upload.single('profilePic'), async (req, res) => {
    try {
        const { email, fullname, phone, citizenship, location, relationship, dob, bio } = req.body;
        
        if (!email) return res.send("এরর: ইমেইল পাওয়া যায়নি!");

        // চেক করা হচ্ছে প্রোফাইল অলরেডি আছে কি না
        const existingProfile = await Profile.findOne({ email: email });
        
        // যদি প্রোফাইল আগে থেকে থাকে, তবে তাকে আর নতুন করে তৈরি করতে দেবে না
        // এখানে শুধু আপডেট হবে (আপনার আগের লজিক অনুযায়ী)
        let updateData = { 
            name: fullname, phone, citizenship, location, relationship, dob, bio 
        };

        if (req.file) {
            updateData.profilePic = '/uploads/' + req.file.filename;
        }

        await Profile.findOneAndUpdate(
            { email: email }, 
            updateData, 
            { upsert: true, new: true } 
        );

        console.log("✅ প্রোফাইল রেডি:", email);
        // ডাটা সেভ হওয়ার পর সরাসরি প্রোফাইল পেজে চলে যাবে
        res.redirect(`/profile.html?email=${email}`);
        
    } catch (err) { res.send("ভুল হয়েছে: " + err.message); }
});

// ==========================================
// ৫. প্রোফাইল ডাটা রিট্রিভ (নতুন ফিচার)
// ==========================================

// profile.js থেকে এই API কল করে ডাটা নেওয়া হবে
app.get('/api/get-profile', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).send("Email required");
        
        const profile = await Profile.findOne({ email: email });
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ message: "প্রোফাইল পাওয়া যায়নি" });
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ==========================================
// ৬. সার্ভার স্টার্ট
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BDBook রানিং পোর্টে: ${PORT}`);
});