<div align="center">

# 🚀 AI-Powered Coding Interview Platform

**A LeetCode-style coding platform with a built-in AI DSA tutor, real code execution, and video editorials.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://ai-coding-platform-ochre-iota.vercel.app)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cloud-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

[Live Demo](https://ai-coding-platform-ochre-iota.vercel.app) · [Report Bug](https://github.com/naveenpachahara/ai-powered-coding-interview-platform/issues) · [Request Feature](https://github.com/naveenpachahara/ai-powered-coding-interview-platform/issues)

</div>

---

## 📖 About

This is a full-stack coding practice and interview platform. Users can browse DSA problems, write solutions in an in-browser **Monaco editor** (the same editor as VS Code), run them against test cases, submit for judging, and get help from an **AI tutor powered by Google Gemini**. Admins can create problems, upload video editorials, and manage content from a dedicated admin panel.

## ✨ Features

### 👨‍💻 For Users
- 🔐 **Secure authentication**: signup / login with JWT stored in an `httpOnly` cookie, passwords hashed with bcrypt
- 📚 **Problem library** with filters by **difficulty** (easy / medium / hard), **topic** (array, linked list, graph, DP) and **status** (solved)
- ✅ **Solved tracking**: problems are marked solved only when a submission is fully accepted
- 💻 **Monaco code editor** with language switching (**C++, Java, JavaScript**) and starter code for each
- ▶️ **Run code** against the visible test cases, and 🚀 **Submit** against hidden test cases
- 📊 **Detailed results**: status, passed / total test cases, runtime and memory
- 🕘 **Submission history** for every problem
- 🤖 **AI Tutor (Gemini)**: gives hints, reviews your code, and explains approach and time/space complexity. Prefers hints before full solutions, stays on the current problem, and replies in your language
- 🎥 **Video editorials**: watch solution videos with a custom player

### 🛡️ For Admins
- ➕ Create problems with visible and hidden test cases, starter code and reference solutions
- ✔️ **Reference solutions are verified against the test cases** via Judge0 *before* the problem is saved
- ✏️ Update and 🗑️ delete problems
- 🎬 Upload and delete video editorials, with direct-to-Cloudinary signed uploads
- 👑 Role-based protected routes (`/admin/*`)

### ⚙️ Under the Hood
- 🔁 **Retry + model fallback** for the AI: tries `gemini-3.8-flash`, then `gemini-flash-latest`, then `gemini-flash-lite-latest`, with retries on 503 / 429 errors
- 🚫 **Redis token blocklist**: logged-out JWTs are invalidated immediately
- 🌐 **Strict CORS** allow-list with credentials support
- ⏱️ Judge0 polling with a ~30 second timeout

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19, Vite 6, Redux Toolkit, React Router 7, Tailwind CSS 4, DaisyUI 5, React Hook Form + Zod, Monaco Editor, Lucide Icons |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcrypt, cookie-parser, cors |
| **Database** | MongoDB (Mongoose) |
| **Cache / Session store** | Redis Cloud (JWT blocklist) |
| **AI** | Google Gemini (`@google/genai`) |
| **Code Execution** | Judge0 CE via RapidAPI |
| **Media** | Cloudinary (video uploads) |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
ai-powered-coding-interview-platform/
├── backend/
│   └── src/
│       ├── index.js              # App entry: CORS, routes, DB + Redis init
│       ├── config/               # MongoDB & Redis connection
│       ├── controllers/          # userAuthent, userProblem, userSubmission,
│       │                         # solveDoubt (AI), videoSection
│       ├── middleware/           # userMiddleware, adminMiddleware (JWT + Redis check)
│       ├── models/               # user, problem, submission, solutionVideo
│       ├── routes/               # userAuth, problemCreator, submit,
│       │                         # aiChatting, videoCreator
│       └── utils/                # Judge0 helpers, input validator
└── frontend/
    └── src/
        ├── pages/                # Homepage, Login, Signup, ProblemPage, Admin
        ├── components/           # ChatAi, Editorial, SubmissionHistory,
        │                         # AdminPanel, AdminDelete, AdminVideo, AdminUpload
        ├── store/ + authSlice.js # Redux auth state
        └── utils/axiosClient.js  # Axios instance (dev: localhost:3000, prod: /api)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A **MongoDB** database (local or [Atlas](https://www.mongodb.com/atlas))
- A **Redis** instance (e.g. [Redis Cloud](https://redis.io/cloud/) free tier)
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)
- A **Judge0 CE** key from [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
- A **Cloudinary** account (for video editorials)

### 1. Clone the repo

```bash
git clone https://github.com/naveenpachahara/ai-powered-coding-interview-platform.git
cd ai-powered-coding-interview-platform
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
DB_CONNECT_STRING=your_mongodb_connection_string
JWT_KEY=your_long_random_secret
REDIS_PASS=your_redis_password
GEMINI_KEY=your_gemini_api_key
JUDGE0_KEY=your_rapidapi_judge0_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> ⚠️ **Redis host/port** are currently set inside `backend/src/config/redis.js`. Update them to point to **your own** Redis instance.

Start the server:

```bash
npm start
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. In development the frontend talks to the backend at `http://localhost:3000`, so keep `PORT=3000`.

### 4. Create an admin

Sign up normally, then change that user's `role` to `"admin"` directly in MongoDB. After that you can use the admin panel at `/admin`.

---

## 🔑 Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the Express server runs on |
| `DB_CONNECT_STRING` | MongoDB connection string |
| `JWT_KEY` | Secret used to sign JWTs |
| `REDIS_PASS` | Redis password |
| `GEMINI_KEY` | Google Gemini API key (AI tutor) |
| `JUDGE0_KEY` | RapidAPI key for Judge0 (code execution) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

> 🔒 Never commit your `.env` file.

---

## 📡 API Reference

### Auth: `/user`
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login |
| POST | `/logout` | User | Logout and blocklist the token |
| GET | `/check` | User | Validate session / get current user |
| POST | `/admin/register` | Admin | Create another admin |
| DELETE | `/deleteProfile` | User | Delete account and its submissions |

### Problems: `/problem`
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/create` | Admin | Create a problem (reference solutions verified) |
| PUT | `/update/:id` | Admin | Update a problem |
| DELETE | `/delete/:id` | Admin | Delete a problem |
| GET | `/getAllProblem` | User | List all problems |
| GET | `/problemById/:id` | User | Get a single problem |
| GET | `/problemSolvedByUser` | User | Problems solved by the current user |
| GET | `/submittedProblem/:pid` | User | Submission history for a problem |

### Submissions: `/submission`
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/run/:id` | User | Run code on visible test cases |
| POST | `/submit/:id` | User | Submit code against hidden test cases |

### AI: `/ai`
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/chat` | User | Chat with the AI DSA tutor |

### Video: `/video`
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/create/:problemId` | Admin | Get a signed Cloudinary upload signature |
| POST | `/save` | Admin | Save uploaded video metadata |
| DELETE | `/delete/:problemId` | Admin | Delete a video editorial |

---

## 🔄 How It Works

```
User writes code ──► Express API ──► Judge0 (runs against test cases)
                         │                     │
                         │◄──── results ───────┘
                         ▼
                 MongoDB (submission saved, problem marked solved if accepted)

User asks AI    ──► Express API ──► Gemini (with problem context) ──► hint / review
```

1. The user opens a problem and writes a solution in Monaco.
2. **Run** sends the code to Judge0 with the visible test cases; **Submit** uses the hidden test cases.
3. The backend polls Judge0, summarizes the result (accepted / wrong / error) and stores the submission.
4. On the AI tab, the problem title, description, test cases and starter code are sent to Gemini as context so the tutor stays on topic.

---

## 🌍 Deployment

- **Frontend** → Vercel. `frontend/vercel.json` rewrites `/api/*` to the backend and handles SPA routing.
- **Backend** → Render (any Node host works).

---

## 🗺️ Roadmap

- [ ] Add more languages (Python, C, Go)
- [ ] More topic tags beyond array / linked list / graph / DP
- [ ] Leaderboard and user profile with stats
- [ ] Timed mock interview mode
- [ ] Discussion / comments on problems
- [ ] Automated tests and CI

---

## 🤝 Contributing

1. Fork the project
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 👤 Author

**Naveen Pachahara**
GitHub: [@naveenpachahara](https://github.com/naveenpachahara)

⭐ If you found this project useful, give it a star!
