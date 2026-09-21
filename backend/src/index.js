const express = require("express");
const app = express();

require("dotenv").config();

const main = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");
const cors = require("cors");

// =======================
// CORS
// =======================

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an origin
            // (Postman, server-to-server, etc.)
            if (!origin) {
                return callback(null, true);
            }

            // Local development
            if (
                origin === "http://localhost:5173" ||
                origin === "http://localhost:3000"
            ) {
                return callback(null, true);
            }

            // Production Vercel URL
            if (
                origin ===
                "https://ai-coding-platform-ochre-iota.vercel.app"
            ) {
                return callback(null, true);
            }

            // Vercel preview/deployment URLs
            if (
                origin.startsWith("https://ai-coding-platform-") &&
                origin.endsWith(
                    "-naveenpachaharas-projects.vercel.app"
                )
            ) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },

        credentials: true,
    })
);

// =======================
// MIDDLEWARE
// =======================

app.use(express.json());
app.use(cookieParser());

// =======================
// ROUTES
// =======================

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

// =======================
// DATABASE + SERVER
// =======================

const InitalizeConnection = async () => {
    try {
        await Promise.all([
            main(),
            redisClient.connect()
        ]);

        console.log("DB Connected");

        app.listen(process.env.PORT, () => {
            console.log(
                "Server listening at port number: " +
                process.env.PORT
            );
        });
    } catch (err) {
        console.log("Error: " + err);
    }
};

InitalizeConnection();

