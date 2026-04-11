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

const mongoURI = "mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI).then(() => console.log('✅ BDBook Database Connected!'));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==========================================
// ২. ডাটাবেস মডেল
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
// ৩. মেইন রাউটস (Auth) - এখানে ঠিক করা হয়েছে
// ==========================================

// --- সাইনআপ রাউট (এটি আপনার কোড থেকে গায়েব ছিল) ---
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const newUser = new User({ email, password });
        await newUser.save();
        console.log("✅ নতুন ইউজার তৈরি:", email);
        res.redirect('/login.html'); // সাইনআপ হলে লগইন পেজে যাবে
    } catch (err) { 
        res.send("ইমেইলটি অলরেডি আছে অথবা ডাটাবেস এরর!"); 
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (user) {
        console.log("✅ লগইন সফল:", user.email);
        const profileExists = await Profile.findOne({ email: user.email });

        if (profileExists) {
            res.redirect(`/profile.html?email=${user.email}`);
        } else {
            res.redirect(`/userfrom.html?email=${user.email}`); 
        }
    } else { 
        res.send("ভুল ইমেইল বা পাসওয়ার্ড! আবার চেষ্টা করুন।"); 
    }
});

// ==========================================
// ৪. প্রোফাইল ম্যানেজমেন্ট
// ==========================================
app.post('/save-profile', upload.single('profilePic'), async (req, res) => {
    try {
        const { email, fullname, phone, citizenship, location, relationship, dob, bio } = req.body;
        
        if (!email) return res.send("এরর: ইমেইল পাওয়া যায়নি!");

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

        console.log("✅ প্রোফাইল সেভ হয়েছে:", email);
        res.redirect(`/profile.html?email=${email}`);
        
    } catch (err) { res.send("ভুল হয়েছে: " + err.message); }
});

// ==========================================
// ৫. প্রোফাইল ডাটা রিট্রিভ (নতুন ফিচার)
// ==========================================
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