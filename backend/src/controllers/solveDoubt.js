const { GoogleGenAI } = require("@google/genai");

// Ek model busy ho toh agla try karo
const MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isBusyError = (err) => {
    const text = String(err?.message || "");
    return text.includes("503") || text.includes("UNAVAILABLE") ||
           text.includes("429") || text.includes("RESOURCE_EXHAUSTED") ||
           text.includes("overloaded") || text.includes("high demand");
};

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        if (!Array.isArray(messages) || messages.length === 0)
            return res.status(400).json({ message: "messages must be a non-empty array" });

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const systemInstruction = `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${JSON.stringify(testCases)}
[startCode]: ${JSON.stringify(startCode)}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting
- Use examples to illustrate concepts
- Always relate back to the current problem context
- Always respond in the language the user is comfortable with

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
`;

        let lastError;

        // Har model ko 2 baar try karo, phir agle model pe jao
        for (const model of MODELS) {
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const response = await ai.models.generateContent({
                        model,
                        contents: messages,
                        config: { systemInstruction },
                    });

                    return res.status(200).json({ message: response.text });
                } catch (err) {
                    lastError = err;
                    console.error(`Gemini API Error (${model}, try ${attempt}):`, err.message);

                    // Busy wala error nahi hai (jaise galat key) toh retry ka fayda nahi
                    if (!isBusyError(err)) throw err;

                    await sleep(1000 * attempt);
                }
            }
        }

        // Saare models busy nikle
        return res.status(503).json({
            message: "AI abhi busy hai, 1-2 minute baad dobara try karo."
        });

    } catch (err) {
        console.error("Gemini API Error:", err);
        res.status(500).json({
            message: "AI Error: " + err.message
        });
    }
};

module.exports = solveDoubt;
