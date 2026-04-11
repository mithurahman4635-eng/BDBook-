const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer'); // ছবি হ্যান্ডেল করার জন্য

const app = express();

// ==========================================
// ১. সেটিংস ও মিডলওয়্যার
// ==========================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads')); // ছবিগুলো দেখানোর পারমিশন

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
    profilePic: String // ছবির পাথ এখানে থাকবে
}));

// ==========================================
// ৩. মেইন রাউটস (Auth)
// ==========================================
app.post('/signup', async (req, res) => {
    try {
        const newUser = new User({ email: req.body.email, password: req.body.password });
        await newUser.save();
        res.redirect('/login.html');
    } catch (err) { res.send("ইমেইলটি অলরেডি আছে!"); }
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) {
        console.log("✅ লগইন সফল:", user.email);
        res.redirect(`/userfrom.html?email=${user.email}`); 
    } else { res.send("ভুল তথ্য!"); }
});

// ==========================================
// ৪. প্রোফাইল ম্যানেজমেন্ট (ছবিসহ সেভ ও আপডেট)
// ==========================================
app.post('/save-profile', upload.single('profilePic'), async (req, res) => {
    try {
        const { email, fullname, phone, citizenship, location, relationship, dob, bio } = req.body;
        
        if (!email) return res.send("এরর: ইমেইল পাওয়া যায়নি!");

        let updateData = { 
            name: fullname, phone, citizenship, location, relationship, dob, bio 
        };

        // যদি ইউজার ছবি আপলোড করে থাকে
        if (req.file) {
            updateData.profilePic = '/uploads/' + req.file.filename;
        }

        const profile = await Profile.findOneAndUpdate(
            { email: email }, 
            updateData, 
            { upsert: true, new: true } 
        );

        console.log("✅ প্রোফাইল রেডি:", email);
        res.send(`
            <div style="text-align:center; font-family:sans-serif;">
                <h1>সাবাস মিঠু ভাই! প্রোফাইল সেভ হয়েছে।</h1>
                <img src="${profile.profilePic || ''}" style="width:150px; border-radius:50%; border:5px solid #6a5acd;">
                <h2>${profile.name}</h2>
                <p>${profile.bio}</p>
                <a href='/userfrom.html?email=${email}'>এডিট করুন</a>
            </div>
        `);
    } catch (err) { res.send("ভুল হয়েছে: " + err.message); }
});

// ==========================================
// ৫. নতুন ফিচার (এখানে আপনার নতুন কোড যোগ করবেন)
// ==========================================

// --- আপনার ভবিষ্যৎ আইডিয়া এখানে লিখুন ---


// ==========================================
// ৬. সার্ভার স্টার্ট
// ==========================================
app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 BDBook রানিং ৩০০০ পোর্টে');
});