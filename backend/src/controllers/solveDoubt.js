const { GoogleGenAI } = require("@google/genai");

// Pehla model band ya busy ho toh list ka agla model try hoga
const MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-flash-lite-latest"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Ye errors aayein toh agla model try karo (busy, limit, ya model band)
const shouldTryNext = (err) => {
    const text = String(err?.message || "");
    return text.includes("503") || text.includes("UNAVAILABLE") ||
           text.includes("429") || text.includes("RESOURCE_EXHAUSTED") ||
           text.includes("overloaded") || text.includes("high demand") ||
           text.includes("404") || text.includes("NOT_FOUND") ||
           text.includes("no longer available");
};

// Model band hai (404) toh usi model pe dobara try karne ka fayda nahi
const isModelGone = (err) => {
    const text = String(err?.message || "");
    return text.includes("404") || text.includes("NOT_FOUND") || text.includes("no longer available");
};

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        if (!Array.isArray(messages) || messages.length === 0)
            return res.status(400).json({ message: "messages must be a non-empty array" });

        if (!process.env.GEMINI_KEY)
            return res.status(500).json({ message: "AI Error: GEMINI_KEY is not set on the server" });

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const systemInstruction = `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${JSON.stringify(testCases)}
[startCode]: ${JSON.stringify(startCode)}

## YOUR CAPABILITIES:
1. **Hint Provider**:
