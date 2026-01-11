const { Ollama } = require('ollama');
require('dotenv').config();

const ollama = new Ollama({ host: process.env.OLLAMA_URL });

module.exports = ollama;