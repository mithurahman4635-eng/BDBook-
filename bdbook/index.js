const express = require('express');
const path = require('path');
const app = express();

// সব ফাইল স্ট্যাটিক হিসেবে সার্ভ করা (CSS, Images, JS)
app.use(express.static(__dirname));

// মেইন রুটে login.html দেখানো
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// অন্য সব পাথেও যাতে login.html দেখায় (ওয়াইল্ডকার্ড ফিক্স)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// পোর্ট সেটআপ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is Live at http://localhost:${PORT}`);
});
