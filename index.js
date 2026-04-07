const express = require('express');
const path = require('path');
const app = express();

// সব ফাইল স্ট্যাটিক হিসেবে সার্ভ করা
app.use(express.static(__dirname));

// মেইন রুটে login.html দেখানো
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// এরর ফিক্স: এক্সপ্রেসের নতুন ভার্সনের জন্য সঠিক ওয়াইল্ডকার্ড
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is Live'));
