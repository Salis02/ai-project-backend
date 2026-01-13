const { Worker } = require('bullmq');
const ollama = require('../config/ai');
const db = require('../config/db');

const worker = new Worker('analyze-tasks', async (job) => {
    const { text, userId } = job.data;
    console.log(`Processing job ${job.id} for text: ${text.substring(0, 20)}...`);

    try {
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: [{ role: 'user', content: `Analyze: ${text}` }],
            format: 'json'
        });

        const result = JSON.parse(response.message.content);
        await db.query('INSERT INTO logs (raw_text, result) VALUES ($1, $2)', [text, result]);
        
        return result;
    } catch (error) {
        console.error("Worker Error:", error);
        throw error;
    }
}, { 
    connection: { host: '127.0.0.1', port: 6379 },
    concurrency: 1 // PENTING: RAM 8GB hanya boleh proses 1 AI di satu waktu!
});

module.exports = worker;