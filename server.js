const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Ollama client with IP Windows
const ollama = new Ollama({ host: process.env.OLLAMA_URL });
app.post('/analyze', async (req, res) => {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Teks tidak boleh kosong" });

    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{
                role: 'system',
                content: `Anda adalah asisten AI profesional. Tugas Anda menganalisis teks input dan memberikan output VALID JSON tanpa penjelasan lain. 
        Format JSON: 
        {
          "category": "Customer Support" | "Sales" | "Technical",
          "sentiment": "Positive" | "Negative" | "Neutral",
          "priority": "Low" | "Medium" | "High",
          "summary": "Maksimal 10 kata"
        }`
            },
            {
                role: 'user',
                content: `Analisis teks ini: "${text}"`
            }],
            format: 'json',
            options: { temperature: 0.1 } // Membuat jawaban lebih konsisten/tidak ngawur
        });

        // Parse hasil dari AI
        const aiResult = JSON.parse(response.message.content);

        // Simpan ke Postgres
        const query = 'INSERT INTO logs (raw_text, result) VALUES ($1, $2) RETURNING *';
        const values = [text, aiResult];
        const savedData = await db.query(query, values);

        res.json(savedData.rows[0]);

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI sedang sibuk atau gagal memproses." });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server berjalan di http://localhost:${process.env.PORT || 5000}`);
});
