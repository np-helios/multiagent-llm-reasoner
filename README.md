# OpenAudit-Reasoner 🔍🤖  
Multi‑agent LLM reasoning orchestrator for transparent, auditable AI decisions.

> Compare how different AI agents think, not just what they answer.

***

## ✨ Overview

OpenAudit‑Reasoner is a web‑based platform that turns a single LLM into a team of specialized reasoning agents (Fast, Careful, Creative, Critical). For every user query, the system:

- Runs multiple agents in parallel.
- Captures step‑by‑step “chain‑of‑thought” reasoning from each agent.
- Visualizes the reasoning paths side‑by‑side.
- Optionally runs an automated verifier over the outputs.

The goal is to move LLMs from opaque “black boxes” to transparent, controllable collaborators—especially for research, education, and safety‑critical domains.

***

## 🧠 Core Ideas

- Multi‑agent LLM orchestration instead of a single, monolithic assistant.
- Transparent chain‑of‑thought: users see how each agent arrived at its answer.
- Diversity by design: Fast vs Careful vs Creative vs Critical perspectives.
- Auditability: logs, verifier analysis, and reproducible runs for every query.
- Local‑first: uses a model served via Ollama on your own machine (no cloud keys required).

***

## 🏗️ Architecture at a Glance

- Frontend:  
  - Next.js + React SPA for interactive comparison UI.
  - Agents list, prompt input, sliders for randomness, and results grid.

- Backend:  
  - FastAPI orchestrator in Python.  
  - Async HTTP calls to the local LLM server (Ollama).  
  - Encapsulates agent personas, prompts, and parameters.

- Model Serving:  
  - Ollama running locally ( Llama 3 or another compatible model).  
  - Backend talks to `http://localhost:11434` by default.

- Data / Logging:  
  - Structured objects for Query → AgentConfig → AgentResponse → VerifierResult.  
  - Ready to plug into a database if you want persistent audit logs.

***

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.10+  
- Node.js 18+  
- Git  
- Ollama installed locally and a model pulled (for example, `llama3`)

```bash
# Example: install and start Ollama, then pull a model
# (follow official Ollama docs first)
ollama pull llama3
ollama serve
```

### 2. Clone the Repository

```bash
git clone https://github.com/np-helios/multiagent-llm-reasoner.git
cd multiagent-llm-reasoner   # or your repo name
```

### 3. Backend Setup (FastAPI)

Create and activate a virtual environment, then install dependencies:

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt   # or: pip install fastapi uvicorn httpx pydantic python-dotenv
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

***

## 🕹️ Using the App

1. Start Ollama (`ollama serve`) and ensure your model is available.  
2. Start the FastAPI backend (`uvicorn main:app --reload --port 8000`).  
3. Start the Next.js frontend (`npm run dev`).  
4. Open `http://localhost:3000` in your browser.

You’ll see:

- Agent list on the left (Fast, Careful, Creative, Critical).
- Prompt box in the center (e.g., “What is the square root of 6?”).
- Controls for randomness / temperature.
- A “Compare” button to trigger all agents at once.
- Result cards showing step‑by‑step reasoning from each agent.
- Verifier panel and decision log at the bottom.

***

## 🤖 Agent Personas

Each agent is just a different system prompt + parameter configuration:

- ⚡ Fast  
  - Short, efficient answers.  
  - Low temperature, low verbosity.

- ✅ Careful  
  - Slow, stepwise reasoning.  
  - Double‑checks logic and details.

- 🎨 Creative  
  - Exploratory, idea‑driven.  
  - Higher temperature, open‑ended suggestions.

- 🕵️ Critical  
  - Focuses on flaws, edge cases, and risks.  
  - Challenges assumptions and points out uncertainties.

These personas are defined in `agents.py` (or similar) and can be customized or extended with new roles (e.g., “DomainExpert”, “Skeptic”, “Teacher”).

***

## 🧪 Example Scenarios

Try prompts like:

- “Explain the square root of 6 to a 10‑year‑old.”  
- “Should hospitals rely on AI for triage decisions? Why or why not?”  
- “Propose three improvements to this project idea: [paste text].”

You’ll see how different agents:

- Emphasize different aspects of the problem.  
- Offer alternative reasoning paths.  
- Sometimes disagree—highlighting ambiguity or risk.

This diversity is the whole point: **disagreement surfaces uncertainty**.

***

## 🧾 Project Structure (High Level)

```bash
.
├── main.py          # FastAPI entrypoint / routes
├── agents.py        # Agent persona definitions & orchestration logic
├── pyproject.toml   # Backend dependencies
├── venv/            # Python virtual env (ignored in git)
├── frontend/        # Next.js app (UI)
│   ├── pages/
│   ├── components/
│   └── package.json
└── README.md        # You are here 🙂
```

***

## 🛡️ Trust, Safety, and Auditability

OpenAudit‑Reasoner is designed for **transparent AI**:

- Multi‑path reasoning makes it easier to spot hallucinations.  
- Verifier module (where implemented) tags agent outputs as “valid / needs review”.  
- Decision logs record prompt, agents used, parameters, and timestamps for every run.

This makes the system suitable as a **research tool** or a **teaching tool** for:

- Understanding LLM behavior.  
- Exploring interpretability and controllability.  
- Demonstrating AI risk and mitigation strategies.

***

## 🧩 Configuration

Key settings (model name, backend URL, ports, etc.) can be configured via environment variables:

- `OLLAMA_BASE_URL` – default `http://localhost:11434`  
- `MODEL_NAME` – e.g., `llama3`  
- `BACKEND_PORT` – default `8000`

Create a `.env` file in the backend directory:

```env
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=llama3
```

***

