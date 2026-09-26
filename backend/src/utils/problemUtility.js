const axios = require('axios');

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };
    if (!lang) return undefined;
    const key = lang.toLowerCase() === 'cpp' ? 'c++' : lang.toLowerCase();
    return language[key];
};

const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));

const submitBatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: { base64_encoded: 'false' },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: { submissions }
    };

    try {
        const response = await axios.request(options);
        if (!Array.isArray(response.data))
            throw new Error("Unexpected Judge0 response");
        return response.data;
    } catch (error) {
        const detail = error.response?.data?.message || error.response?.data || error.message;
        console.error("Judge0 submitBatch failed:", detail);
        throw new Error("Code execution service unavailable: " + JSON.stringify(detail));
    }
};

const submitToken = async (resultToken) => {
    const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
            tokens: resultToken.join(","),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    // Zyada se zyada ~30 second wait karo, hamesha ke liye nahi
    for (let attempt = 0; attempt < 30; attempt++) {
        let result;
        try {
            const response = await axios.request(options);
            result = response.data;
        } catch (error) {
            const detail = error.response?.data?.message || error.response?.data || error.message;
            console.error("Judge0 submitToken failed:", detail);
            throw new Error("Code execution service unavailable: " + JSON.stringify(detail));
        }

        const submissions = result?.submissions || [];
        const done = submissions.length > 0 && submissions.every((r) => r && r.status_id > 2);
        if (done) return submissions;

        await waiting(1000);
    }

    throw new Error("Code execution timed out");
};

module.exports = { getLanguageById, submitBatch, submitToken };


