const db = require('../config/db');
const ollama = require('../config/ai');

const analyzeText = async (req, res) => {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Teks tidak boleh kosong" });

    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [
                { role: 'system', content: 'Anda adalah asisten AI. Analisis teks dan berikan output VALID JSON dengan field: category, sentiment, priority (Low/Medium/High), summary (singkat).' },
                { role: 'user', content: text }
            ],
            format: 'json',
            options: { temperature: 0.1 }
        });

        const aiResult = JSON.parse(response.message.content);

        const query = 'INSERT INTO logs (raw_text, result) VALUES ($1, $2) RETURNING *';
        const saved = await db.query(query, [text, aiResult]);

        res.json(saved.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    analyzeText,
};