# 📚 Course Content Curator AI

> An AI-powered full-stack web application that automatically curates personalized learning roadmaps, subtopics, and resources for any topic you want to learn.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5.2-412991?style=flat-square&logo=openai)
![SQLite](<https://img.shields.io/badge/SQLite-Local%20DB-003B57?style=flat-square&logo=sqlite>)

---

## ✨ Features

- 🤖 **AI-Generated Subtopics** — Breaks any topic into 5–7 progressive beginner-friendly subtopics using OpenAI
- 🔍 **Multi-Source Resource Aggregation** — Automatically searches and pulls resources from Google, YouTube, Medium, and Dev.to
- 🗓️ **Dynamic Learning Roadmap** — Generates a structured week-by-week learning plan tailored to your topic
- 💾 **Persistent Course Storage** — Saves all curated courses to a local SQLite database for later access
- 🔄 **Graceful Fallback Mode** — Works even without a valid OpenAI key by generating courses from search results alone
- 🎨 **Clean Dark UI** — Sidebar layout with course history, resource cards, and roadmap viewer

---

## 🏗️ Project Architecture

```
Course Content Curator/
├── main.py                        # FastAPI backend — REST API server
├── agent.py                       # CourseAgent — OpenAI-powered course generation logic
├── search.py                      # Resource aggregator (Google, YouTube, Medium, Dev.to)
├── database.py                    # SQLite database handler
├── available_models.py            # Utility to list available OpenAI models
├── requirements.txt               # Python dependencies
├── .env                           # API keys (not committed to Git)
├── curator.db                     # SQLite database (auto-created on first run)
└── course-curator-frontend/       # React + Vite frontend
    ├── src/
    │   ├── App.jsx                # Main UI component
    │   ├── App.css                # Component styles
    │   └── main.jsx               # React entry point
    ├── package.json
    └── vite.config.js
```

---

## 🔌 API Endpoints

| Method   | Endpoint          | Description                                      |
| -------- | ----------------- | ------------------------------------------------ |
| `POST` | `/curate`       | Generate and save a new course for a given topic |
| `GET`  | `/courses`      | Retrieve all saved courses                       |
| `GET`  | `/courses/{id}` | Retrieve a specific course by ID                 |
| `GET`  | `/health`       | Health check — returns`{ "status": "ok" }`    |
| `GET`  | `/docs`         | Interactive Swagger API documentation            |

### Example Request

```bash
curl -X POST http://127.0.0.1:8000/curate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Machine Learning"}'
```

### Example Response

```json
{
  "topic": "Machine Learning",
  "subtopics": ["Introduction to ML", "Supervised Learning", "..."],
  "resources": {
    "top_resources": [
      { "url": "https://...", "source": "YouTube", "reason": "Beginner-friendly tutorial" }
    ]
  },
  "roadmap": {
    "weeks": [
      { "week": 1, "goals": ["Understand what ML is", "Complete intro tutorial"] }
    ]
  }
}
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- An [OpenAI API key](https://platform.openai.com/account/api-keys) *(optional — app has fallback mode)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/MuhammadAsad29/course-content-curator.git
cd course-content-curator
```

---

### 2. Backend Setup (Python + FastAPI)

#### Create and activate a virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Configure environment variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
SEARCH_ENGINE_ID=your_custom_search_engine_id
YOUTUBE_API_KEY=your_youtube_api_key_here
```

> **Note:** The app works in **fallback mode** if the OpenAI key is missing or has exceeded its quota — it will still generate courses from search results.

#### Start the backend server

```bash
python main.py
```

The backend will start at: **http://127.0.0.1:8000**
API docs available at: **http://127.0.0.1:8000/docs**

---

### 3. Frontend Setup (React + Vite)

```bash
cd course-curator-frontend
npm install
npm run dev
```

The frontend will start at: **http://localhost:5173**

---

## 🖥️ Usage

1. Open **http://localhost:5173** in your browser
2. Type any topic in the search bar (e.g. *"Deep Learning"*, *"React"*, *"UI Design"*)
3. Click **Curate** — the AI will generate:
   - Progressive subtopics
   - Curated web, YouTube, Medium, and Dev.to resources
   - A week-by-week learning roadmap
4. All generated courses are saved in the sidebar for later access

---

## ⚙️ How It Works

```
User enters topic
       │
       ▼
search.py — Google Search (12 results, split into Web / Medium / Dev.to)
           — YouTube Search (5 videos)
       │
       ▼
agent.py (CourseAgent)
  ├── extract_subtopics()  → OpenAI: breaks topic into 5-7 beginner subtopics
  ├── rank_resources()     → OpenAI: picks top 10 most relevant resources
  └── create_roadmap()     → OpenAI: builds 4-week plan with weekly goals
       │
       ▼
database.py — Saves course to SQLite (curator.db)
       │
       ▼
FastAPI → JSON response → React frontend renders the course
```

---

## 🛠️ Tech Stack

| Layer             | Technology                     |
| ----------------- | ------------------------------ |
| Backend Framework | FastAPI                        |
| ASGI Server       | Uvicorn                        |
| AI / LLM          | OpenAI API (GPT-5.2)           |
| Web Search        | `googlesearch-python`        |
| Video Search      | `youtube-search`             |
| Database          | SQLite (via Python`sqlite3`) |
| Frontend          | React 19 + Vite 8              |
| UI Icons          | Lucide React                   |
| Environment       | `python-dotenv`              |

---

## 🧪 Running the Test

```bash
python test_search.py
```

---

## ⚠️ Known Limitations

- **Google Search Rate Limiting** — The free `googlesearch-python` library may return `429 Too Many Requests` if called too frequently. Wait a few minutes and try again.
- **OpenAI Quota** — If your OpenAI key has exceeded its quota, the app automatically falls back to generating course content from search results without LLM assistance.
- **Model Name** — This project uses `gpt-5.2` in `agent.py`. Ensure your OpenAI account has access to this model. If not, fall back to `gpt-4o` or `gpt-4-turbo`.

---

## 📄 License

This project is for educational purposes. Feel free to fork and extend it.

---

## 🙌 Acknowledgements

- [OpenAI](https://openai.com) for the language model API
- [FastAPI](https://fastapi.tiangolo.com) for the blazing-fast Python web framework
- [Vite](https://vitejs.dev) + [React](https://react.dev) for the frontend toolchain
- [Lucide](https://lucide.dev) for the beautiful icon set
