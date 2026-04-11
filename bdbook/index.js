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
    name: String, phone: String, citizenship: String, location: String,
    relationship: String, dob: String, bio: String, profilePic: String 
}));

const Post = mongoose.model('Post', new mongoose.Schema({
    userEmail: String, userName: String, userPic: String,        
    postText: String, postMedia: String, mediaType: String,      
    activeFrame: String, // ⚠️ মিঠু ভাই, এই লাইনটি ফ্রেম সেভ করার জন্য যোগ করা হয়েছে
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

// ৪. পোস্ট ও প্রোফাইল API

// নতুন পোস্ট তৈরি (এখানে activeFrame যোগ করা হয়েছে)
app.post('/api/create-post', upload.single('mediaFile'), async (req, res) => {
    try {
        const { email, text, activeFrame } = req.body; // ফ্রন্টএন্ড থেকে ফ্রেম ডাটা আসবে
        const user = await Profile.findOne({ email: email });
        const newPost = new Post({
            userEmail: email,
            userName: user ? user.name : "Mithu Rahman",
            userPic: user ? user.profilePic : "default-avatar.png",
            postText: text,
            postMedia: req.file ? '/uploads/' + req.file.filename : "",
            mediaType: req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'image') : 'text',
            activeFrame: activeFrame || "default" // ⚠️ এখানে ফ্রেম সেভ হবে
        });
        await newPost.save();
        res.json({ status: "success" });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
});

// নিউজফিড (সব পোস্ট)
app.get('/api/newsfeed', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); 
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

// ইউজারের প্রোফাইল পোস্ট
app.get('/api/user-posts', async (req, res) => {
    try {
        const posts = await Post.find({ userEmail: req.query.email }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

// প্রোফাইল ডাটা পাওয়া
app.get('/api/get-profile', async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.query.email });
        res.json(profile || { message: "Not Found" });
    } catch (err) { res.status(500).send(err.message); }
});

// প্রোফাইল সেভ করা
app.post('/save-profile', upload.single('profilePic'), async (req, res) => {
    try {
        const { email, fullname, phone, citizenship, location, relationship, dob, bio } = req.body;
        let updateData = { name: fullname, phone, citizenship, location, relationship, dob, bio };
        if (req.file) updateData.profilePic = '/uploads/' + req.file.filename;
        await Profile.findOneAndUpdate({ email: email }, updateData, { upsert: true, new: true });
        res.redirect(`/profile.html?email=${email}`);
    } catch (err) { res.send("ভুল হয়েছে: " + err.message); }
});

// ৫. পেজ নেভিগেশন
app.get('/post', (req, res) => res.sendFile(path.join(__dirname, 'post.html')));
app.get('/newsfeed', (req, res) => res.sendFile(path.join(__dirname, 'newsfeed.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 BDBook Running on Port: ${PORT}`));