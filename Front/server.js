const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build'), { maxAge: 31536000 }));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.get('static/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`*** Server started on ${PORT}`);
});
