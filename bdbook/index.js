const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();

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

const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const Profile = mongoose.model('Profile', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String, 
    profilePic: String 
}));

// ১. পোস্ট মডেল (ফ্রেম ও টাইপসহ)
const Post = mongoose.model('Post', new mongoose.Schema({
    userEmail: String, 
    userName: String, 
    userPic: String,        
    postText: String, 
    postMedia: String, 
    mediaType: String,      
    frameCode: String, 
    type: { type: String, default: "normal" },
    likes: { type: Array, default: [] }, 
    createdAt: { type: Date, default: Date.now }
}));

// ২. পোস্ট তৈরি করার API (এই ফাংশনটিই আসল)
app.post('/api/create-post', upload.single('mediaFile'), async (req, res) => {
    try {
        const { email, text, frameCode, type } = req.body;
        const user = await Profile.findOne({ email: email });

        const newPost = new Post({
            userEmail: email,
            userName: user ? user.name : "Mithu Rahman",
            userPic: user ? user.profilePic : "/uploads/default-avatar.png",
            postText: text,
            postMedia: req.file ? '/uploads/' + req.file.filename : "",
            mediaType: req.file ? (req.file.mimetype.startsWith('video') ? 'video' : 'image') : 'text',
            frameCode: frameCode || null,
            type: type || 'kill'
        });

        // এখানে await এখন কাজ করবে কারণ উপরে 'async' আছে
        await newPost.save();
        res.status(200).json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// ৩. নিউজফিড API
app.get('/api/newsfeed', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); 
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/get-profile', async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.query.email });
        res.json(profile || { message: "Not Found" });
    } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 BDBook Running: ${PORT}`));