# BA Copilot — Full Stack AI App

AI-powered Business Analysis tool. Extracts requirements, generates user stories & acceptance criteria using free OpenRouter models.

---

## Project Structure

```
ba-copilot/
├── backend/
│   ├── api/
│   │   ├── main.py              ← FastAPI app
│   │   └── routes/              ← projects, input, requirements, stories, criteria
│   ├── core/
│   │   ├── config.py            ← API keys & model config
│   │   └── database.py          ← SQLite database
│   ├── services/                ← AI extraction & generation logic
│   └── utils/
│       └── prompts.py           ← AI prompt templates
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              ← Root component
│   │   ├── App.css              ← All styles
│   │   ├── components/          ← Sidebar, InputSection, RequirementsSection, etc.
│   │   └── services/
│   │       └── api.js           ← Axios API client
│   ├── package.json
│   └── vercel.json
├── index.py                     ← Render/Vercel entry point
├── requirements.txt             ← Python dependencies
└── runtime.txt                  ← Python 3.11.9
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (never commit this):

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

Get your free API key at: https://openrouter.ai/keys

---

## 🚀 Deploy Backend on Render

### Step 1 — Push to GitHub
1. Create a new GitHub repository (e.g. `ba-copilot`)
2. Push all these files to it

### Step 2 — Create Render Web Service
1. Go to https://render.com → **New → Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `ba-copilot-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn index:app --host 0.0.0.0 --port $PORT`

### Step 3 — Add Environment Variable
In Render dashboard → **Environment** tab:
- Key: `OPENROUTER_API_KEY`
- Value: `sk-or-v1-your-actual-key-here`

### Step 4 — Deploy
Click **Create Web Service**. Wait ~3 minutes for the build.

Your backend URL will be: `https://ba-copilot-api.onrender.com`

Test it: visit `https://ba-copilot-api.onrender.com/api/health` — you should see `{"status":"healthy"}`

---

## 🌐 Deploy Frontend on Vercel

### Step 1 — Set backend URL
Before deploying, create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://ba-copilot-api.onrender.com
```

### Step 2 — Deploy via Vercel Dashboard
1. Go to https://vercel.com → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Under **Environment Variables**, add:
   - Key: `REACT_APP_API_URL`
   - Value: `https://ba-copilot-api.onrender.com`
5. Click **Deploy**

Your app will be live at: `https://ba-copilot.vercel.app`

### Alternative — Deploy via Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts, set root to frontend/
```

---

## 💻 Run Locally

### Backend
```bash
# From project root
pip install -r requirements.txt
uvicorn index:app --reload --port 8000
# API at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
# Create frontend/.env.local
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
npm start
# App at http://localhost:3000
```

---

## 🤖 Switching AI Models

Edit `backend/core/config.py` — change `CHAT_MODEL`:

```python
# Best free options:
CHAT_MODEL = "meta-llama/llama-3.3-70b-instruct:free"   # default
CHAT_MODEL = "google/gemma-3-12b-it:free"               # fast
CHAT_MODEL = "deepseek/deepseek-chat-v3-0324:free"      # great for tech
CHAT_MODEL = "mistralai/mistral-7b-instruct:free"       # lightweight
```

---

## 🔧 Troubleshooting

**CORS errors** — Make sure `REACT_APP_API_URL` matches your Render URL exactly (no trailing slash).

**"System Offline" in app** — Backend hasn't started yet. Render free tier sleeps after 15 min. First request takes ~30 s to wake up.

**AI returns no results** — Free models have rate limits. Wait 1–2 minutes and try again.

**Build fails on Render** — Check `requirements.txt` has all dependencies. Python version in `runtime.txt` must be `3.11.9`.
