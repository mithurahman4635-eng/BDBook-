const express = require('express');
const path = require('path');
const app = express();

// ফাইলগুলো কোথায় আছে তা নিশ্চিত করা
app.use(express.static(__dirname));

// সরাসরি ফাইল পাঠানোর ব্যবস্থা
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// অন্য সব লিঙ্কেও যাতে 404 না আসে
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server is Live on ' + PORT));
