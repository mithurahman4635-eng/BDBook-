const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();

// ১. সেটিংস ও মিডলওয়্যার
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads')); 

const mongoURI = "mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI).then(() => console.log('✅ BDBook Database Connected!'));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'file-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ২. ডাটাবেস মডেল
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

const Post = mongoose.model('Post', new mongoose.Schema({
    userEmail: String, 
    userName: String, 
    userPic: String,        
    postText: String, 
    postMedia: String, 
    mediaType: String,      
    activeFrame: String, 
    likes: { type: Array, default: [] }, 
    createdAt: { type: Date, default: Date.now }
}));

// ৩. অথেনটিকেশন (Signup/Login)
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        await new User({ email, password }).save();
        res.redirect('/login.html');
    } catch (err) { res.send("ইমেইলটি অলরেডি আছে অথবা ডাটাবেস এরর!"); }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        const profileExists = await Profile.findOne({ email: user.email });
        res.redirect(profileExists ? `/profile.html?email=${user.email}` : `/userfrom.html?email=${user.email}`); 
    } else { res.send("ভুল ইমেইল বা পাসওয়ার্ড!"); }
});

// ৪. পোস্ট তৈরি করার API (সংশোধিত অংশ)
app.post('/api/create-post', upload.single('mediaFile'), async (req, res) => {
    console.log("📥 নতুন পোস্টের রিকোয়েস্ট এসেছে..."); 
    try {
        const { email, text, activeFrame } = req.body;
        
        // লগইন করা ইউজারের প্রোফাইল খুঁজে বের করা (Pori আইডি ঠিক করার জন্য)
        const user = await Profile.findOne({ email: email });

        const newPost = new Post({
            userEmail: email,
            userName: user ? user.name : "Mithu Rahman",
            userPic: user ? user.profilePic : "/uploads/default-avatar.png",
            postText: text,
            postMedia: req.file ? '/uploads/' + req.file.filename : "",
            mediaType: req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'image') : 'text',
            activeFrame: activeFrame || "default"
        });

        await newPost.save();
        console.log("✅ পোস্ট ডাটাবেসে সেভ হয়েছে!"); 
        res.status(200).json({ status: "success", message: "Post Published!" });
    } catch (err) {
        console.log("❌ এরর:", err.message);
        res.status(500).json({ status: "error", message: err.message });
    }
});

// ৫. নিউজফিড ও প্রোফাইল API
app.get('/api/newsfeed', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); 
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/user-posts', async (req, res) => {
    try {
        const posts = await Post.find({ userEmail: req.query.email }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/get-profile', async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.query.email });
        res.json(profile || { message: "Not Found" });
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/save-profile', upload.single('profilePic'), async (req, res) => {
    try {
        const { email, fullname, phone, citizenship, location, relationship, dob, bio } = req.body;
        let updateData = { name: fullname, phone, citizenship, location, relationship, dob, bio };
        if (req.file) updateData.profilePic = '/uploads/' + req.file.filename;
        await Profile.findOneAndUpdate({ email: email }, updateData, { upsert: true, new: true });
        res.redirect(`/profile.html?email=${email}`);
    } catch (err) { res.send("ভুল হয়েছে: " + err.message); }
});

// ৬. পেজ নেভিগেশন
app.get('/post', (req, res) => res.sendFile(path.join(__dirname, 'post.html')));
app.get('/newsfeed', (req, res) => res.sendFile(path.join(__dirname, 'newsfeed.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 BDBook Running on Port: ${PORT}`));