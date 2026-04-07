const path = require('path');
const path = require('path'); //
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection (আপনার Connection String এখানে দিন)
mongoose.connect('mongodb://localhost:27017/userDB');

// User Schema তৈরি
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html')); 
});
// সাইন-আপ রাউট
app.post('/signup', async (req, res) => {
  try {
    const newUser = new User({
      email: req.body.email,
      password: req.body.password // দ্রষ্টব্য: পাসওয়ার্ড সবসময় হ্যাশ করে সেভ করা উচিত
    });

    await newUser.save();
    res.send("অভিনন্দন! আপনার ডেটা MongoDB-তে সেভ হয়েছে।");
  } catch (err) {
    res.status(500).send("কিছু একটা ভুল হয়েছে।");
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));