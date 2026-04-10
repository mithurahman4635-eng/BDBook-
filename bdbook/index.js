const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ডাটা পড়ার মিডলওয়্যার
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ১. ডাটাবেস লিঙ্ক
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
        const { email, password } = req.body;
        const newUser = new User({ email, password });
        
        // ডাটাবেসে সেভ হওয়া পর্যন্ত অপেক্ষা করবে
        await newUser.save();
        
        console.log("🎉 অভিনন্দন মিঠু ভাই! ডাটা সেভ হয়েছে।");

        // ✅ এই লাইনটিই আপনাকে অটোমেটিক লগইন পেজে নিয়ে যাবে
        res.redirect('/login.html'); 

    } catch (err) {
        console.log("❌ সেভ হয়নি:", err.message);
        res.send("ভুল হয়েছে: " + err.message);
    }
});
    // ২. যদি ইমেইল বা পাসওয়ার্ড কোনোভাবে না আসে
    if (!email || !password) {
        return res.send("<h1>মিঠু ভাই, ফর্ম থেকে ডাটা সার্ভারে আসছে না!</h1><p>আপনার HTML এর input বক্সে name='email' আর name='password' আছে তো?</p>");
    }

    try {
        // ৩. সরাসরি MongoDB-তে পুশ
        await mongoose.connection.collection('users').insertOne({
            email: email,
            password: password,
            timestamp: new Date()
        });

        console.log("✅ জোর করে সেভ করা হয়েছে!");
        res.send("<h1 style='color:green;'>সাবাস মিঠু ভাই! এবার ডাটা সেভ হতে বাধ্য হয়েছে।</h1><a href='/login.html'>লগইন করুন</a>");

    } catch (err) {
        console.log("❌ এরর:", err.message);
        res.send("<h1>সেভ হলো না! কারণ: " + err.message + "</h1>");
    }
});

// লগইন পেজ দেখার জন্য
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BDBook সার্ভার চলছে http://localhost:${PORT}`);
});