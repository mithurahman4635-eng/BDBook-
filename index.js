const express = require('express'); const app = express(); app.get('/', (req, res) => res.send('BDBook Server is Live')); app.listen(process.env.PORT || 3000);
