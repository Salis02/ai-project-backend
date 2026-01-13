const analyzeQueue = require('../queues/analyze.queue');

exports.enqueueAnalyzeTask = async (req, res) => {
    const { text } = req.body;
    const job = await analyzeQueue.add('analyze', {
        text,
    });
    res.json({ 
        message: 'Analyze task enqueued',
        jobId: job.id 
    });
};