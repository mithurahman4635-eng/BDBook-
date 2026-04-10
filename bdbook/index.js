const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ডাটা পড়ার মিডলওয়্যার
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ১. আপনার সঠিক ডাটাবেস লিঙ্ক (BDBook নামসহ)
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

app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body; // আমরা শুধু এই দুটো নেবো
        const newUser = new User({ email, password });
        await newUser.save();
        res.redirect('/login.html'); // বা আপনার পছন্দের পেজ
    } catch (err) {
        console.error("সেভ হলো না কেন:", err);
        res.send("ভুল হয়েছে: " + err.message);
    }
});
    try {
        const newUser = new User({ email, password });
        await newUser.save();
        
        console.log("✅ অভিনন্দন! ডাটাবেসে সেভ হয়েছে:", email);
       res.status(201).send("<h1>সাবাস মিঠু ভাই! নতুন ডাটা সেভ হয়েছে।</h1>");
    } catch (err) {
        console.log("❌ ডাটা সেভ হয়নি!");
        console.log("🔍 সার্ভার বলছে আসল কারণ হলো:", err.message);

        if (err.code === 11000) {
            return res.send("এই ইমেইলটি আগে থেকেই আছে। অন্য ইমেইল দিন।");
        }
        res.status(500).send("সার্ভার এরর: " + err.message);
    }
    console.log("------------------------------------");
});

// লগইন পেজ দেখার জন্য
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BDBook সার্ভার চলছে http://localhost:${PORT}`);
});