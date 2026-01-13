const db = require('../config/db');
const ollama = require('../config/ai');

const analyzeText = async (req, res) => {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Teks tidak boleh kosong" });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [
                { role: 'system', content: 'Anda adalah asisten AI. Analisis teks dan berikan output VALID JSON dengan field: category, sentiment, priority (Low/Medium/High), summary (singkat).' },
                { role: 'user', content: text }
            ],
            stream: true,
        });

        let aiResponse = '';

        for await (const part of stream) {
            const content = part.message.content;
            aiResponse += content;
            res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
        }

        try {
            const aiResult = JSON.parse(aiResponse);
            await db.query('INSERT INTO logs (raw_text, result) VALUES ($1, $2)', [text, aiResult]);

            res.write(`data: ${JSON.stringify({ done: true, final: aiResult })}\n\n`);
        } catch (e) {
            console.error('Error parsing AI response:', aiResponse);
        }

        res.end();
    } catch (error) {
        res.write(`data: ${JSON.stringify({ error: 'Terjadi kesalahan saat memproses permintaan.' })}\n\n`);
        res.end();
    }
}

module.exports = {
    analyzeText,
};