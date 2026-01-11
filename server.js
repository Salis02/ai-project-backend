const express = require('express');
const cors = require('cors');
const analyzeText = require('./src/controllers/analyze.controller');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', analyzeText.analyzeText);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server berjalan di http://localhost:${process.env.PORT || 5000}`);
});
