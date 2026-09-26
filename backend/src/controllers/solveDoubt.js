const { GoogleGenAI } = require("@google/genai");

const MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-flash-lite-latest"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const has = (err, words) => words.some((w) => String(err?.message || "").includes(w));
const BUSY = ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "overloaded", "high demand"];
const GONE = ["404", "NOT_FOUND", "no longer available"];

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        if (!Array.isArray(messages) || messages.length === 0)
            return res.status(400).json({ message: "messages must be a non-empty array" });

        if (!process.env.GEMINI_KEY)
            return res.status(500).json({ message: "AI Error: GEMINI_KEY is not set on the server" });

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const systemInstruction = `You are an expert DSA tutor. Only help with the current problem.
Problem title: ${title}
Problem description: ${description}
Examples: ${JSON.stringify(testCases)}
Start code: ${JSON.stringify(startCode)}
You can give hints, review code, explain approaches and time/space complexity.
Prefer hints before full solutions. Reply in the user's language.
If asked about unrelated topics, say you can only help with this DSA problem.`;

        const failures = [];

        for (const model of MODELS) {
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const response = await ai.models.generateContent({
                        model,
                        contents: messages,
                        config: { systemInstruction },
                    });
                    console.log("Gemini reply from " + model);
                    return res.status(200).json({ message: response.text });
                } catch (err) {
                    console.error("Gemini API Error (" + model + ", try " + attempt + "):", err.message);
                    if (has(err, GONE)) { failures.push(model + ": not available"); break; }
                    if (!has(err, BUSY)) throw err;
                    if (attempt === 2) failures.push(model + ": busy");
                    await sleep(1000 * attempt);
                }
            }
        }

        return res.status(503).json({
            message: "AI abhi busy hai, 1-2 minute baad try karo. (" + failures.join(", ") + ")"
        });

    } catch (err) {
        console.error("Gemini API Error:", err);
        res.status(500).json({ message: "AI Error: " + err.message });
    }
};

module.exports = solveDoubt;
