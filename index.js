const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// মেইন রুটে সরাসরি login.html দেখাবে
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// ডেটাবেজ কানেকশন (কানেক্ট না হলেও সার্ভার যেন না থামে)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bdbook', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ DB Connected')).catch(err => console.log('❌ DB Error:', err));

app.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
});
