const { Queue } = require('bullmq');

const analyzeQueue = new Queue('analyze-tasks', {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
})

module.exports = {
    analyzeQueue,
};