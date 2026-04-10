const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // এটি যোগ করুন
const path = require('path');

const app = express();

// এই লাইনগুলো খুব জরুরি ডাটা পড়ার জন্য
app.use(cors()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname)); // আপনার সব ফাইল চিনিয়ে দেওয়ার জন্য

// --- MongoDB কানেকশন ---
const MONGO_URI = 'mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ BDBook ডাটাবেস সফলভাবে কানেক্ট হয়েছে।"))
  .catch(err => console.log("❌ কানেকশনে সমস্যা: ", err));

// --- ইউজার স্কিমা ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- রাউটগুলো (Routes) ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html')); 
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// সাইন-আপ রাউট
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    console.log("📩 সার্ভারে আসা ডাটা:", email); 

    try {
        const newUser = new User({ email, password });
        await newUser.save();
        console.log("✅ ডাটাবেসে সেভ সফল হয়েছে: " + email);
        res.redirect('/login'); 
    } catch (err) {
        console.log("❌ সেভ এরর:", err.message);
        res.status(500).send("ডাটা সেভ করতে সমস্যা হয়েছে।");
    }
});

// লগইন লজিক
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && user.password === password) {
            console.log("🔑 লগইন সফল: " + email);
            res.sendFile(path.join(__dirname, 'userfrom.html'));
        } else {
            res.send("<script>alert('ভুল ইমেইল বা পাসওয়ার্ড!'); window.location.href='/login';</script>");
        }
    } catch (err) {
        res.status(500).send("লগইন এরর।");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 সার্ভার চলছে http://localhost:${PORT} এ`);
});