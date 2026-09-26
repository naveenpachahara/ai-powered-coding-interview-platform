const mongoose = require("mongoose");
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");

// Judge0 status: 3 = Accepted, 4 = Wrong Answer, baaki sab = error
const summarize = (testResult) => {
    let testCasesPassed = 0, runtime = 0, memory = 0;
    let status = 'accepted';
    let errorMessage = '';

    for (const test of testResult) {
        if (test.status_id == 3) {
            testCasesPassed++;
            runtime += parseFloat(test.time) || 0;
            memory = Math.max(memory, test.memory || 0);
        } else {
            status = test.status_id == 4 ? 'wrong' : 'error';
            errorMessage = test.compile_output || test.stderr || test.status?.description || errorMessage;
        }
    }
    return { testCasesPassed, runtime, memory, status, errorMessage };
};

const normalizeLanguage = (language) => (language === 'cpp' ? 'c++' : language);

const loadProblem = async (problemId, res) => {
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        res.status(400).send("Invalid problem id");
        return null;
    }
    const problem = await Problem.findById(problemId);
    if (!problem) {
        res.status(404).send("Problem not found");
        return null;
    }
    return problem;
};

const runJudge = async (code, languageId, testCases) => {
    if (!testCases || testCases.length === 0)
        throw new Error("This problem has no test cases yet. Ask the admin to add them.");

    const submissions = testCases.map((tc) => ({
        source_code: code,
        language_id: languageId,
        stdin: tc.input,
        expected_output: tc.output
    }));
    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map((v) => v.token);
    return await submitToken(tokens);
};

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        language = normalizeLanguage(language);
        const languageId = getLanguageById(language);
        if (!languageId) return res.status(400).send("Unsupported language");

        const problem = await loadProblem(problemId, res);
        if (!problem) return;

        // Hidden test cases na hon toh visible wale use karo
        const testCases = problem.hiddenTestCases.length > 0
            ? problem.hiddenTestCases
            : problem.visibleTestCases;

        const submittedResult = await Submission.create({
            userId, problemId, code, language,
            status: 'pending',
            testCasesTotal: testCases.length
        });

        let testResult;
        try {
            testResult = await runJudge(code, languageId, testCases);
        } catch (judgeErr) {
            submittedResult.status = 'error';
            submittedResult.errorMessage = judgeErr.message;
            await submittedResult.save();
            return res.status(502).send(judgeErr.message);
        }

        const { testCasesPassed, runtime, memory, status, errorMessage } = summarize(testResult);

        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        // Sirf accepted hone pe hi "solved" mark karo
        const accepted = status === 'accepted';
        if (accepted && !req.result.problemSolved.some((id) => id.equals(problem._id))) {
            req.result.problemSolved.push(problem._id);
            await req.result.save();
        }

        res.status(201).json({
            accepted,
            status,
            error: accepted ? null : (errorMessage || (status === 'wrong' ? 'Wrong Answer' : 'Error')),
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory
        });
    } catch (err) {
        console.error("submitCode error:", err);
        res.status(500).send("Internal Server Error: " + err.message);
    }
};

const runCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !problemId || !language)
            return res.status(400).send("Some field missing");

        language = normalizeLanguage(language);
        const languageId = getLanguageById(language);
        if (!languageId) return res.status(400).send("Unsupported language");

        const problem = await loadProblem(problemId, res);
        if (!problem) return;

        let testResult;
        try {
            testResult = await runJudge(code, languageId, problem.visibleTestCases);
        } catch (judgeErr) {
            return res.status(502).json({ success: false, error: judgeErr.message, testCases: [] });
        }

        const { runtime, memory, status, errorMessage } = summarize(testResult);

        res.status(200).json({
            success: status === 'accepted',
            error: status === 'accepted' ? null : errorMessage,
            testCases: testResult,
            runtime,
            memory
        });
    } catch (err) {
        console.error("runCode error:", err);
        res.status(500).json({ success: false, error: "Internal Server Error: " + err.message, testCases: [] });
    }
};

module.exports = { submitCode, runCode };
