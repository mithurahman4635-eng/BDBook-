const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ডাটাবেস লিঙ্ক (BDBook নামসহ)
const mongoURI = "mongodb+srv://mithu:mithulamiya@cluster0.yujofyv.mongodb.net/BDBook?retryWrites=true&w=majority"; 

mongoose.connect(mongoURI)
    .then(() => console.log('✅ BDBook ডাটাবেসে সফলভাবে কানেক্ট হয়েছে।'))
    .catch(err => console.log('❌ ডাটাবেস এরর:', err));

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    console.log("📩 সার্ভারে আসা ডাটা:", email);

    try {
        const newUser = new User({ email, password });
        await newUser.save();
        console.log("✅ ডাটাবেসে সেভ সফল হয়েছে: " + email);
        res.redirect('/login');
    } catch (err) {
        if (err.code === 11000) {
            return res.send("এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে।");
        }
        res.status(500).send("ভুল: " + err.message);
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 সার্ভার চলছে http://localhost:${PORT} এ`);
});